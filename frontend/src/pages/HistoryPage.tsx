import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { apiUrl } from '@/utils/apiUrl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ResultViewer } from '@/components/ResultViewer'

type HistoryItem = {
  id?: string | number
  filename?: string
  created_at?: string
  extracted_at?: string
  data?: Record<string, unknown>
}

type ViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; items: HistoryItem[] }

function formatDateTime(iso: string | undefined): string {
  if (!iso?.trim()) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('it-IT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getString(v: unknown): string | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'string') return v.trim() || null
  return String(v).trim() || null
}

function formatMoney(v: unknown): string {
  const n =
    typeof v === 'number'
      ? v
      : typeof v === 'string'
        ? Number(v.replace(',', '.'))
        : NaN
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(n)
}

export function HistoryPage() {
  const { token } = useAuth()
  const [view, setView] = useState<ViewState>({ status: 'loading' })
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!token) {
        setView({ status: 'error', message: 'Sessione non valida. Effettua di nuovo il login.' })
        return
      }
      setView({ status: 'loading' })
      try {
        const { data } = await axios.get(apiUrl('/api/v1/history'), {
          headers: { Authorization: `Bearer ${token}` },
        })
        const items = Array.isArray(data)
          ? (data as HistoryItem[])
          : Array.isArray(data?.items)
            ? (data.items as HistoryItem[])
            : []
        if (!cancelled) setView({ status: 'success', items })
      } catch (e) {
        const msg =
          e && typeof e === 'object' && 'message' in e ? String((e as any).message) : 'Errore'
        if (!cancelled) setView({ status: 'error', message: msg })
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [token])

  const items = view.status === 'success' ? view.items : []
  const empty = useMemo(() => view.status === 'success' && items.length === 0, [view, items.length])

  return (
    <div className="w-full">
      {/* Tasto torna indietro */}
      <div className="mb-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => (window.location.href = '/')}
        >
          ← Torna alla home
        </Button>
      </div>

      <Card className="w-full rounded-2xl border border-gray-100 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base">Cronologia</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {view.status === 'loading' ? (
            <div className="rounded-xl bg-gray-50 px-4 py-6 text-sm text-gray-600">
              Caricamento…
            </div>
          ) : view.status === 'error' ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-4 text-sm text-destructive">
              {view.message}
            </div>
          ) : empty ? (
            <div className="rounded-xl bg-gray-50 px-4 py-6 text-sm text-gray-600">
              Nessun documento elaborato ancora
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((it, idx) => {
                const key = String(it.id ?? `${it.filename ?? 'item'}-${idx}`)
                const data = (it.data ?? {}) as Record<string, unknown>
                const docType = getString(data.document_type)
                const total = formatMoney(data.total_amount)
                const extractedAt = formatDateTime(it.extracted_at ?? it.created_at)
                const open = expandedKey === key

                return (
                  <div key={key} className="rounded-2xl border border-gray-100 bg-white">
                    <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-gray-900">
                          {it.filename ?? 'documento'}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                          <span>{docType ?? '—'}</span>
                          <span className="text-gray-300">·</span>
                          <span>{extractedAt}</span>
                          <span className="text-gray-300">·</span>
                          <span className="font-medium text-gray-900">{total}</span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setExpandedKey(open ? null : key)}
                        >
                          {open ? 'Nascondi dettaglio' : 'Vedi dettaglio'}
                        </Button>
                      </div>
                    </div>
                    {open && (
                      <>
                        <Separator />
                        <div className="px-4 py-4">
                          <ResultViewer data={data} schemaMode="default" />
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}