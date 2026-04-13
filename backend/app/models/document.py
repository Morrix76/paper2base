from pydantic import BaseModel, Field


class LineItem(BaseModel):
    description: str | None = Field(default=None)
    quantity: float | None = Field(default=None)
    unit_price: float | None = Field(default=None)


class DocumentExtraction(BaseModel):
    document_type: str | None = Field(
        default=None,
        description='Kind of document, e.g. "Fattura", "Ricevuta", "DDT", "Contratto".',
    )
    vendor_name: str | None = Field(default=None)
    date: str | None = Field(
        default=None,
        description="Document date in YYYY-MM-DD when visible; otherwise null.",
    )
    invoice_number: str | None = Field(default=None)
    total_amount: float | None = Field(default=None)
    tax_amount: float | None = Field(default=None)
    line_items: list[LineItem] | None = Field(default=None)
