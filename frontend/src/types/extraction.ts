export type LineItem = {
  description?: string | null
  quantity?: number | null
  unit_price?: number | null
}

export type ExtractionData = {
  document_type?: string | null
  vendor_name?: string | null
  date?: string | null
  invoice_number?: string | null
  total_amount?: number | null
  tax_amount?: number | null
  line_items?: LineItem[] | null
}

export type SchemaMode = 'default' | 'custom'

export type ExtractApiResponse = {
  success: boolean
  filename: string | null
  data: ExtractionData | Record<string, unknown>
  schema_mode?: SchemaMode
}
