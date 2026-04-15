import { useState, type ReactNode } from 'react'
import type { ExtractionData, LineItem, SchemaMode } from '../types/extraction'
import { jsonToHighlightedHtml } from '../utils/jsonHighlight'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'

type TabId = 'table' | 'json'

type ResultViewerProps = {
  data: ExtractionData | Record<string, unknown>
  schemaMode?: SchemaMode
}

function formatMoney(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) {
    return '—'
  }
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(n)
}

function formatQty(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) {
    return '—'
  }
  return new Intl.NumberFormat('it-IT', {
    maximumFractionDigits: 4,
  }).format(n)
}

function formatUnknownValue(
  t: (key: string) => string,
  v: unknown,
): ReactNode {
  if (v === null || v === undefined) return t('result.values.dash')
  if (typeof v === 'boolean') return v ? t('result.values.yes') : t('result.values.no')
  if (typeof v === 'number') return String(v)
  if (typeof v === 'string') return v || t('result.values.dash')
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v)
    } catch {
      return String(v)
    }
  }
  return String(v)
}

function FieldRow({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-gray-100 py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:items-start sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </dt>
      <dd className="break-words text-sm font-medium text-gray-900">{value}</dd>
    </div>
  )
}

function LineItemsTable({ items }: { items: LineItem[] }) {
  const { t } = useTranslation()
  if (items.length === 0) {
    return (
      <p className="rounded-xl bg-gray-50 px-3 py-4 text-sm text-gray-600">
        {t('result.emptyLineItems')}
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-[600px] divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="min-w-[200px] px-3 py-2.5 font-semibold text-gray-700">
              {t('result.table.description')}
            </th>
            <th className="w-[100px] whitespace-nowrap px-3 py-2.5 text-right font-semibold text-gray-700">
              {t('result.table.quantity')}
            </th>
            <th className="w-[150px] whitespace-nowrap px-3 py-2.5 text-right font-semibold text-gray-700">
              {t('result.table.unitPrice')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="min-w-[200px] px-3 py-2.5 text-gray-900">
                {row.description ?? t('result.values.dash')}
              </td>
              <td className="w-[100px] whitespace-nowrap px-3 py-2.5 text-right text-gray-800">
                {formatQty(row.quantity ?? undefined)}
              </td>
              <td className="w-[150px] whitespace-nowrap px-3 py-2.5 text-right text-gray-800">
                {formatMoney(row.unit_price ?? undefined)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function GenericKeyValueTable({ data }: { data: Record<string, unknown> }) {
  const { t } = useTranslation()
  const entries = Object.entries(data)
  if (entries.length === 0) {
    return (
      <p className="rounded-xl bg-gray-50 px-3 py-4 text-sm text-gray-600">
        {t('result.emptyFields')}
      </p>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4">
      {entries.map(([key, val]) => (
        <FieldRow
          key={key}
          label={key.replace(/_/g, ' ')}
          value={formatUnknownValue(t, val)}
        />
      ))}
    </div>
  )
}

export function ResultViewer({ data, schemaMode = 'default' }: ResultViewerProps) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<TabId>('table')
  const jsonPretty = JSON.stringify(data, null, 2)
  const html = jsonToHighlightedHtml(jsonPretty)

  const isCustom = schemaMode === 'custom'
  const fixed = data as ExtractionData
  const lineItems = fixed.line_items ?? []

  return (
    <div className="w-full">
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
        <TabsList className="h-auto w-full flex-row justify-start gap-6 rounded-none border-b border-gray-100 bg-transparent p-0">
          <TabsTrigger
            value="table"
            className="rounded-none border-b-2 border-transparent px-0 pb-2 pt-0 text-gray-400 data-[state=active]:border-violet-600 data-[state=active]:text-gray-900 data-[state=active]:shadow-none"
          >
            {t('result.tabs.table')}
          </TabsTrigger>
          <TabsTrigger
            value="json"
            className="rounded-none border-b-2 border-transparent px-0 pb-2 pt-0 text-gray-400 data-[state=active]:border-violet-600 data-[state=active]:text-gray-900 data-[state=active]:shadow-none"
          >
            {t('result.tabs.json')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-4">
          {isCustom ? (
            <GenericKeyValueTable data={data as Record<string, unknown>} />
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-100 bg-white px-4">
                <FieldRow
                  label={t('result.fields.documentType')}
                  value={fixed.document_type ?? t('result.values.dash')}
                />
                <FieldRow
                  label={t('result.fields.vendor')}
                  value={fixed.vendor_name ?? t('result.values.dash')}
                />
                <FieldRow
                  label={t('result.fields.date')}
                  value={fixed.date ?? t('result.values.dash')}
                />
                <FieldRow
                  label={t('result.fields.number')}
                  value={fixed.invoice_number ?? t('result.values.dash')}
                />
                <FieldRow label={t('result.fields.total')} value={formatMoney(fixed.total_amount)} />
                <FieldRow label={t('result.fields.taxes')} value={formatMoney(fixed.tax_amount)} />
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900">
                  {t('result.lineItemsTitle')}
                </h3>
                <LineItemsTable items={lineItems} />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="json" className="mt-4">
          <pre
            className="max-h-[min(70vh,520px)] overflow-auto rounded-xl bg-gray-950 p-4 text-xs leading-relaxed text-gray-100 shadow-inner ring-1 ring-gray-900"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
