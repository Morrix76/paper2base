import { useCallback, useState } from 'react'
import * as XLSX from 'xlsx'
import type { ExtractionData, SchemaMode } from '../types/extraction'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import i18n from '@/i18n'

type Translate = ReturnType<typeof useTranslation>['t']

type ActionBarProps = {
  data: ExtractionData | Record<string, unknown>
  schemaMode?: SchemaMode
  jsonText: string
  downloadBasename: string
}

function safeFilename(base: string): string {
  const s = base.replace(/[^\w\-]+/g, '_').replace(/_+/g, '_')
  return s || i18n.t('download.defaultBasename')
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  a.click()
  URL.revokeObjectURL(url)
}

function buildRiepilogoSheet(t: Translate, data: ExtractionData) {
  const rows: (string | number)[][] = [
    [t('export.headers.field'), t('export.headers.value')],
    ['document_type', data.document_type ?? ''],
    ['vendor_name', data.vendor_name ?? ''],
    ['date', data.date ?? ''],
    ['invoice_number', data.invoice_number ?? ''],
    ['total_amount', data.total_amount ?? ''],
    ['tax_amount', data.tax_amount ?? ''],
  ]
  return XLSX.utils.aoa_to_sheet(rows)
}

function buildRigheSheet(t: Translate, data: ExtractionData) {
  const header = [
    t('result.table.description'),
    t('result.table.quantity'),
    t('result.table.unitPrice'),
  ]
  const items = data.line_items ?? []
  const body = items.map((row) => [
    row.description ?? '',
    row.quantity ?? '',
    row.unit_price ?? '',
  ])
  return XLSX.utils.aoa_to_sheet([header, ...body])
}

function buildGenericSheet(t: Translate, data: Record<string, unknown>) {
  const rows: string[][] = [[t('export.headers.field'), t('export.headers.value')]]
  for (const [k, v] of Object.entries(data)) {
    let cell = ''
    if (v === null || v === undefined) {
      cell = ''
    } else if (typeof v === 'boolean') {
      cell = v ? 'true' : 'false'
    } else if (typeof v === 'number') {
      cell = String(v)
    } else if (typeof v === 'object') {
      cell = JSON.stringify(v)
    } else {
      cell = String(v)
    }
    rows.push([k, cell])
  }
  return XLSX.utils.aoa_to_sheet(rows)
}

export function ActionBar({
  data,
  schemaMode = 'default',
  jsonText,
  downloadBasename,
}: ActionBarProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const base = safeFilename(downloadBasename)

  const onDownloadJson = useCallback(() => {
    const blob = new Blob([jsonText], { type: 'application/json;charset=utf-8' })
    triggerDownload(blob, `${base}.json`)
  }, [base, jsonText])

  const onDownloadExcel = useCallback(() => {
    const wb = XLSX.utils.book_new()
    if (schemaMode === 'custom') {
      XLSX.utils.book_append_sheet(
        wb,
        buildGenericSheet(t, data as Record<string, unknown>),
        t('export.sheets.extraction'),
      )
    } else {
      const ed = data as ExtractionData
      XLSX.utils.book_append_sheet(wb, buildRiepilogoSheet(t, ed), t('export.sheets.summary'))
      XLSX.utils.book_append_sheet(wb, buildRigheSheet(t, ed), t('export.sheets.rows'))
    }
    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([out], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    triggerDownload(blob, `${base}.xlsx`)
  }, [base, data, schemaMode, t])

  const onDownloadCsv = useCallback(() => {
    const ws =
      schemaMode === 'custom'
        ? buildGenericSheet(t, data as Record<string, unknown>)
        : buildRigheSheet(t, data as ExtractionData)
    const csv = `\uFEFF${XLSX.utils.sheet_to_csv(ws)}`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    triggerDownload(blob, `${base}.csv`)
  }, [base, data, schemaMode, t])

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [jsonText])

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" onClick={onDownloadJson} variant="outline" size="sm">
        {t('export.downloadJson')}
      </Button>
      <Button type="button" onClick={onDownloadExcel} variant="outline" size="sm">
        {t('export.downloadExcel')}
      </Button>
      <Button type="button" onClick={onDownloadCsv} variant="outline" size="sm">
        {t('export.downloadCsv')}
      </Button>
      <Button type="button" onClick={onCopy} variant="outline" size="sm" aria-live="polite">
        {copied ? t('export.copied') : t('export.copyToClipboard')}
      </Button>
    </div>
  )
}
