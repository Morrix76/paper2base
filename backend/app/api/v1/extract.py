import asyncio
import json
import logging

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.core.config import get_settings
from app.db.database import get_db
from app.db.models import Extraction, User
from app.models.custom_schema import CustomSchema
from app.services.file_to_content import build_llm_input
from app.services.file_validation import is_allowed_upload_content_type, validate_upload
from app.services.llm_extractor import LLMExtractionError, extract_document
from app.services.webhook_sender import enqueue_webhook

logger = logging.getLogger(__name__)

router = APIRouter(tags=["extract"])


@router.post(
    "/extract",
    summary="Upload a document for structured data extraction",
    status_code=status.HTTP_200_OK,
)
async def extract_from_file(
    file: UploadFile = File(..., description="PDF, Word, Excel, or image document"),
    webhook_url: str | None = Form(default=None, description="Optional URL for extraction webhook"),
    custom_schema: str | None = Form(
        default=None,
        description='Optional JSON for CustomSchema: {"fields":[{"name","description?","type":"string|number|boolean"}]}',
    ),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    if user.credits <= 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Crediti esauriti",
        )

    if file.content_type and not is_allowed_upload_content_type(file.content_type):
        ct = file.content_type.split(";")[0].strip()
        logger.error(
            "extract: rejecting upload — Content-Type not allowed: %r (filename=%r)",
            ct,
            file.filename,
        )
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported Content-Type for this upload.",
        )

    raw = await file.read()
    if not raw:
        logger.error("extract: 400 empty body (filename=%r)", file.filename)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file.",
        )

    try:
        category = validate_upload(raw, file.filename)
    except ValueError as e:
        logger.error(
            "extract: 400 validate_upload — %s (filename=%r content_type=%r size=%s)",
            e,
            file.filename,
            file.content_type,
            len(raw),
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e

    try:
        llm_input = await asyncio.to_thread(build_llm_input, raw, category)
    except ValueError as e:
        logger.error(
            "extract: 400 build_llm_input — %s (category=%s filename=%r)",
            e,
            category.value,
            file.filename,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception:
        logger.exception(
            "extract: 400 build_llm_input unexpected error (category=%s filename=%r)",
            category.value,
            file.filename,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to read or convert the uploaded file.",
        ) from None

    parsed_custom: CustomSchema | None = None
    if custom_schema and custom_schema.strip():
        try:
            parsed_custom = CustomSchema.model_validate_json(custom_schema)
        except ValidationError as e:
            logger.error("extract: 400 invalid custom_schema — %s", e)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid custom_schema: {e}",
            ) from e

    settings = get_settings()
    key = (settings.get("openai_api_key") or "").strip()
    if not key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OPENAI_API_KEY non configurata sul server",
        )

    try:
        extraction = await extract_document(llm_input, parsed_custom, openai_api_key=key)
    except LLMExtractionError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=e.message,
        ) from e

    result_data = extraction.model_dump()
    schema_mode = "custom" if parsed_custom else "default"

    # Salva nel DB
    db_extraction = Extraction(
        user_id=str(user.id),
        filename=file.filename or "documento",
        schema_mode=schema_mode,
        result_json=json.dumps(result_data, ensure_ascii=False),
    )
    db.add(db_extraction)

    response_body = {
        "success": True,
        "filename": file.filename,
        "data": result_data,
        "schema_mode": schema_mode,
    }

    hook = (webhook_url or "").strip()
    if hook:
        await enqueue_webhook(
            hook,
            {
                "event": "extraction.completed",
                "filename": file.filename,
                "data": result_data,
            },
        )

    user.credits = max(0, int(user.credits) - 1)
    db.add(user)
    db.commit()

    return response_body


@router.get(
    "/history",
    summary="Get extraction history for current user",
    status_code=status.HTTP_200_OK,
)
async def get_history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20,
) -> dict:
    extractions = (
        db.query(Extraction)
        .filter(Extraction.user_id == str(user.id))
        .order_by(Extraction.created_at.desc())
        .limit(limit)
        .all()
    )
    items = [
        {
            "id": e.id,
            "filename": e.filename,
            "schema_mode": e.schema_mode,
            "created_at": e.created_at.isoformat(),
            "data": json.loads(e.result_json),
        }
        for e in extractions
    ]
    return {"items": items}