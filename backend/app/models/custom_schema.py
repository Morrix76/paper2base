import re
from enum import Enum

from pydantic import BaseModel, Field, create_model


class FieldType(str, Enum):
    string = "string"
    number = "number"
    boolean = "boolean"


class CustomField(BaseModel):
    name: str = Field(min_length=1)
    description: str | None = None
    type: FieldType


class CustomSchema(BaseModel):
    fields: list[CustomField] = Field(min_length=1)


def _python_field_name(raw: str, taken: set[str]) -> str:
    s = re.sub(r"[^a-zA-Z0-9_]+", "_", raw.strip())
    s = re.sub(r"_+", "_", s).strip("_").lower()
    if not s:
        s = "field"
    if s[0].isdigit():
        s = "f_" + s
    base = s
    n = 0
    while s in taken:
        n += 1
        s = f"{base}_{n}"
    taken.add(s)
    return s


def pydantic_model_from_custom_schema(schema: CustomSchema) -> type[BaseModel]:
    """Build a Pydantic model for OpenAI structured outputs from a user-defined schema."""
    taken: set[str] = set()
    field_defs: dict = {}
    for cf in schema.fields:
        py_name = _python_field_name(cf.name, taken)
        desc = f"{cf.name}"
        if cf.description:
            desc = f"{cf.name}: {cf.description}"
        if cf.type == FieldType.string:
            ann = str | None
        elif cf.type == FieldType.number:
            ann = float | None
        else:
            ann = bool | None
        field_defs[py_name] = (ann, Field(default=None, description=desc))

    return create_model("CustomExtraction", __base__=BaseModel, **field_defs)
