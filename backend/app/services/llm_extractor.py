from openai import APITimeoutError, AsyncOpenAI, OpenAIError, RateLimitError
from pydantic import BaseModel

from app.core.config import get_settings
from app.models.custom_schema import CustomSchema, pydantic_model_from_custom_schema
from app.models.document import DocumentExtraction
from app.services.file_to_content import LLMInput

SYSTEM_PROMPT = """You are an expert at reading business documents (invoices, delivery notes, receipts, contracts) in Italian or other languages.

You may receive either:
1) Images of document pages — read text and layout from the images.
2) Plain text extracted from Word or Excel — infer the same structured fields from that text.

Your task: extract structured data and map it to the response schema.

Rules:
- Use null for any field that is missing, illegible, or not present in the source.
- For document_type, use a short label in the document language when possible (e.g. "Fattura", "Ricevuta", "DDT").
- For date, use strict YYYY-MM-DD only when you can infer a full date; otherwise null.
- For line_items, include one object per distinct line row when line-level detail exists; otherwise null or an empty list is acceptable.
- Numbers must be JSON numbers (not strings). Use dot as decimal separator when converting from text.
- Do not invent values; prefer null over guessing."""

SYSTEM_PROMPT_CUSTOM = """You extract structured data from business documents (images or plain text). The user defined a fixed list of fields. Your output must match the JSON schema exactly.

Critical rules — follow strictly:
1) One field, one value: assign exactly one distinct piece of information to each field. Never copy the same text into multiple fields, never swap values between fields, and never merge or blend content from different parts of the document into a single field.
2) Each field below is independent: fill it only from the part of the document that clearly corresponds to that field’s meaning (name + description + type).
3) If you cannot locate a clear value for a field in the document, set that field to null. Do not guess, invent, infer from unrelated sentences, or combine fragments from different places to “fill” a field.
4) For numbers and booleans, use JSON types; for strings, plain text only (no concatenation of unrelated labels).

Esempio: il campo nome_azienda deve contenere solo il nome dell'azienda, non altri valori (indirizzi, P. IVA, date, ecc. vanno in altri campi se previsti, altrimenti null).

Fields (extract one value per field, in order):
{field_blocks}
"""

USER_INTRO_VISION = (
    "Analyze these document page images and return the structured extraction. "
    "Pages or images are in order; later pages may continue tables from earlier ones."
)

USER_INTRO_TEXT = (
    "The following is text extracted from a Word document or Excel spreadsheet. "
    "Extract structured business data (invoice/receipt/delivery note fields and line items) "
    "according to the schema.\n\n--- Document text ---\n"
)

USER_INTRO_TEXT_CUSTOM = (
    "The following is text extracted from a Word document or Excel spreadsheet. "
    "Extract only the user-defined fields from this content.\n\n--- Document text ---\n"
)


class LLMExtractionError(Exception):
    """Raised when OpenAI extraction fails; intended to surface as HTTP 500 with a safe message."""

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


def _build_custom_system_prompt(schema: CustomSchema) -> str:
    blocks: list[str] = []
    for i, f in enumerate(schema.fields, start=1):
        raw_desc = (f.description or "").strip()
        desc = raw_desc if raw_desc else "(none — use the field name and type only)"
        blocks.append(
            f"Field {i}:\n"
            f"  • Name: {f.name}\n"
            f"  • Type: {f.type.value}\n"
            f"  • Description: {desc}"
        )
    return SYSTEM_PROMPT_CUSTOM.format(field_blocks="\n\n".join(blocks))


def _openai_user_message_content_vision(image_parts: list[tuple[str, str]]) -> list[dict]:
    parts: list[dict] = [{"type": "text", "text": USER_INTRO_VISION}]
    for b64, mime in image_parts:
        url = f"data:{mime};base64,{b64}"
        parts.append({"type": "image_url", "image_url": {"url": url}})
    return parts


async def _extract_with_messages(
    api_key: str,
    messages: list[dict],
    response_model: type[BaseModel],
) -> BaseModel:
    api_key = api_key.strip()
    if not api_key:
        raise LLMExtractionError("OpenAI API key is missing.")

    settings = get_settings()
    model = settings.get("openai_model") or "gpt-4o"
    client = AsyncOpenAI(api_key=api_key, timeout=120.0)

    try:
        completion = await client.beta.chat.completions.parse(
            model=model,
            messages=messages,
            response_format=response_model,
            temperature=0.1,
        )
    except RateLimitError:
        raise LLMExtractionError(
            "The AI service is temporarily rate-limited. Please try again in a few moments."
        ) from None
    except APITimeoutError:
        raise LLMExtractionError(
            "The AI request timed out. Try again with a smaller file or later."
        ) from None
    except OpenAIError as e:
        raise LLMExtractionError(
            "The AI service returned an error while processing your document."
        ) from e
    except Exception as e:
        raise LLMExtractionError(
            "Unexpected error while calling the AI extraction service."
        ) from e

    if not completion.choices:
        raise LLMExtractionError("The AI service returned an empty response.")

    choice = completion.choices[0]
    msg = choice.message
    if getattr(msg, "refusal", None):
        raise LLMExtractionError("The model refused to process this document.")
    parsed = getattr(msg, "parsed", None)
    if parsed is None:
        raise LLMExtractionError("The model did not return structured extraction data.")

    return parsed


async def extract_document(
    llm_input: LLMInput,
    custom_schema: CustomSchema | None = None,
    openai_api_key: str | None = None,
) -> BaseModel:
    api_key = (openai_api_key or "").strip()
    if not api_key:
        raise LLMExtractionError("OpenAI API key is missing.")

    if custom_schema is not None:
        dyn_model = pydantic_model_from_custom_schema(custom_schema)
        system = _build_custom_system_prompt(custom_schema)
        if llm_input.mode == "text":
            if not llm_input.text:
                raise LLMExtractionError("No text content to extract from.")
            return await _extract_with_messages(
                api_key,
                [
                    {"role": "system", "content": system},
                    {"role": "user", "content": USER_INTRO_TEXT_CUSTOM + llm_input.text},
                ],
                dyn_model,
            )
        parts = llm_input.image_parts or []
        if not parts:
            raise LLMExtractionError("No images to process.")
        return await _extract_with_messages(
            api_key,
            [
                {"role": "system", "content": system},
                {
                    "role": "user",
                    "content": _openai_user_message_content_vision(parts),
                },
            ],
            dyn_model,
        )

    if llm_input.mode == "text":
        if not llm_input.text:
            raise LLMExtractionError("No text content to extract from.")
        return await _extract_with_messages(
            api_key,
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": USER_INTRO_TEXT + llm_input.text},
            ],
            DocumentExtraction,
        )

    parts = llm_input.image_parts or []
    if not parts:
        raise LLMExtractionError("No images to process.")
    return await _extract_with_messages(
        api_key,
        [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": _openai_user_message_content_vision(parts),
            },
        ],
        DocumentExtraction,
    )
