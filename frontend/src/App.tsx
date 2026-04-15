import axios from 'axios'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActionBar } from './components/ActionBar'
import { Dropzone } from './components/Dropzone'
import { ResultViewer } from './components/ResultViewer'
import { SchemaBuilder } from './components/SchemaBuilder'
import { WebhookConfig } from './components/WebhookConfig'
import { Spinner } from './components/Spinner'
import type { CustomFieldRow } from './components/SchemaBuilder'
import type { ExtractApiResponse } from './types/extraction'
import { parseApiError } from './utils/apiError'
import i18n from '@/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/context/AuthContext'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { apiUrl } from '@/utils/apiUrl'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { LandingPage } from '@/pages/LandingPage'

type ViewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; result: ExtractApiResponse }
  | { status: 'error'; message: string }

function NavLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-7.5a2.25 2.25 0 00-2.25-2.25H8.25A2.25 2.25 0 006 6.75v10.5A2.25 2.25 0 008.25 19.5h4.5"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 8.25h4.5m-4.5 3h3" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 17.25H21m0 0l-2.25-2.25M21 17.25L18.75 19.5"
      />
    </svg>
  )
}

function downloadBasename(filename: string | null): string {
  if (!filename?.trim()) return i18n.t('download.defaultBasename')
  const base = filename.replace(/\.pdf$/i, '').trim()
  return base || i18n.t('download.defaultBasename')
}

function App() {
  const { t, i18n } = useTranslation()
  const { token, user, isAuthenticated, isLoadingUser, logout, refreshMe } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [useDefaultSchema, setUseDefaultSchema] = useState(true)
  const [customFields, setCustomFields] = useState<CustomFieldRow[]>([])
  const [view, setView] = useState<ViewState>({ status: 'idle' })

  const handleFileChange = useCallback((next: File | null) => {
    setFile(next)
    setView({ status: 'idle' })
  }, [])

  const extract = useCallback(async () => {
    if (!file) return
    if (!token) return
    if (!useDefaultSchema) {
      const valid = customFields.filter((f) => f.name.trim())
      if (valid.length === 0) {
        setView({
          status: 'error',
          message: t('errors.customSchemaNeedsField'),
        })
        return
      }
    }
    setView({ status: 'loading' })
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('webhook_url', webhookUrl)
      if (!useDefaultSchema) {
        const valid = customFields.filter((f) => f.name.trim())
        formData.append(
          'custom_schema',
          JSON.stringify({
            fields: valid.map((f) => ({
              name: f.name.trim(),
              ...(f.description.trim()
                ? { description: f.description.trim() }
                : {}),
              type: f.type,
            })),
          }),
        )
      }
      const { data } = await axios.post<ExtractApiResponse>(
        apiUrl('/api/v1/extract'),
        formData,
        {
          timeout: 180_000,
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setView({ status: 'success', result: data })
      await refreshMe()
    } catch (err) {
      setView({ status: 'error', message: parseApiError(err) })
    }
  }, [file, token, webhookUrl, useDefaultSchema, customFields, refreshMe])

  const resetNewDocument = useCallback(() => {
    setFile(null)
    setView({ status: 'idle' })
  }, [])

  const loading = view.status === 'loading'
  const success = view.status === 'success'
  const error = view.status === 'error'

  const jsonForActions =
    view.status === 'success'
      ? JSON.stringify(view.result.data, null, 2)
      : ''

  const isPrivacyRoute =
    typeof window !== 'undefined' &&
    (window.location.pathname === '/privacy' ||
      window.location.pathname.startsWith('/privacy/'))

  const path = typeof window !== 'undefined' ? window.location.pathname : '/'
  if (typeof window !== 'undefined') {
    console.log('CURRENT PATH:', window.location.pathname)
  }
  const isLoginRoute = path === '/login' || path.startsWith('/login/')
  const isRegisterRoute = path === '/register' || path.startsWith('/register/')

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-x-0 top-0 z-40 h-14 border-b border-gray-100 bg-white">
        <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-center px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <NavLogoIcon className="h-6 w-6 text-violet-600" />
            <span className="text-2xl font-black text-gray-900">PAPER2BASE</span>
          </div>
          {isAuthenticated && user && (
            <div className="absolute left-4 top-1/2 hidden -translate-y-1/2 items-center gap-3 text-sm text-gray-500 sm:flex">
              <span className="font-medium text-gray-900">{user.email}</span>
              <span className="text-gray-400">·</span>
              {user.credits > 0 ? (
                <span className="text-gray-500">
                  📄{' '}
                  <span className="font-semibold text-gray-900">{user.credits}</span>{' '}
                  {t('nav.documentsRemaining')}
                </span>
              ) : (
                <a
                  className="font-medium text-red-600 underline-offset-2 hover:text-red-700 hover:underline"
                  href="mailto:iltuobrand@outlook.it"
                >
                  {t('nav.creditsDepletedContact')}
                </a>
              )}
              <button
                type="button"
                onClick={logout}
                className="ml-2 text-sm font-medium text-gray-500 underline-offset-2 hover:text-gray-900 hover:underline"
              >
                Logout
              </button>
            </div>
          )}
          <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-3">
            <button
              type="button"
              onClick={() => void i18n.changeLanguage('it')}
              className={
                i18n.language === 'it'
                  ? 'text-sm font-bold text-gray-900'
                  : 'text-sm text-gray-400 hover:text-gray-900'
              }
            >
              {t('nav.language.it')}
            </button>
            <button
              type="button"
              onClick={() => void i18n.changeLanguage('en')}
              className={
                i18n.language === 'en'
                  ? 'text-sm font-bold text-gray-900'
                  : 'text-sm text-gray-400 hover:text-gray-900'
              }
            >
              {t('nav.language.en')}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-[1px]"
          role="presentation"
        >
          <div className="rounded-xl border border-gray-200 bg-white px-10 py-8 shadow-sm">
            <Spinner />
          </div>
        </div>
      )}

      <main
        className="mx-auto flex min-h-screen w-full flex-col px-6 py-8 pt-16"
      >
        {!(typeof window !== 'undefined' && !isAuthenticated && window.location.pathname === '/') && (
          <header className="py-4 text-center">
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              {t('hero.title')}
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              {t('hero.subtitle')}
            </p>
          </header>
        )}

        {isPrivacyRoute ? (
          <PrivacyPage />
        ) : !isAuthenticated ? (
          path === '/' ? (
            <LandingPage />
          ) : isLoginRoute ? (
            isLoadingUser ? (
              <Card className="mx-auto w-full rounded-2xl border border-gray-100 shadow-xs">
                <CardContent className="py-10">
                  <div className="flex items-center justify-center">
                    <Spinner />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <LoginPage onGoRegister={() => (window.location.href = '/register')} />
            )
          ) : isRegisterRoute ? (
            isLoadingUser ? (
              <Card className="mx-auto w-full rounded-2xl border border-gray-100 shadow-xs">
                <CardContent className="py-10">
                  <div className="flex items-center justify-center">
                    <Spinner />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <RegisterPage onGoLogin={() => (window.location.href = '/login')} />
            )
          ) : (
            <LandingPage />
          )
        ) : success ? (
          <Card className="w-full rounded-2xl border border-gray-100 shadow-xs">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {t('result.file')}
                </p>
                <CardTitle className="text-base">
                  {view.result.filename ?? t('result.defaultFilename')}
                </CardTitle>
              </div>
              <Button type="button" variant="outline" onClick={resetNewDocument}>
                {t('actions.uploadAnother')}
              </Button>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <ResultViewer
                data={view.result.data}
                schemaMode={view.result.schema_mode ?? 'default'}
              />
            </CardContent>
            <Separator />
            <CardContent className="pt-4">
              <ActionBar
                data={view.result.data}
                schemaMode={view.result.schema_mode ?? 'default'}
                jsonText={jsonForActions}
                downloadBasename={downloadBasename(view.result.filename)}
              />
            </CardContent>
          </Card>
        ) : (
          <section>
            <Card className="mx-auto w-full rounded-2xl border border-gray-100 shadow-xs">
              <CardContent className="pt-6 text-center">
                <div className="mb-4">
                  <Dropzone file={file} onFileChange={handleFileChange} disabled={loading} />
                </div>

                <div className="mb-4 text-left">
                  <WebhookConfig
                    value={webhookUrl}
                    onChange={setWebhookUrl}
                    disabled={loading}
                  />
                </div>

                <div className="mb-4 text-left">
                  <SchemaBuilder
                    useDefaultSchema={useDefaultSchema}
                    onUseDefaultSchemaChange={setUseDefaultSchema}
                    fields={customFields}
                    onFieldsChange={setCustomFields}
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="mb-4 text-left" role="alert">
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      <p className="font-medium leading-relaxed">{view.message}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          onClick={extract}
                          disabled={
                            !file ||
                            loading ||
                            (!useDefaultSchema &&
                              !customFields.some((f) => f.name.trim()))
                          }
                          variant="destructive"
                        >
                          {t('actions.retry')}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <Button
                    type="button"
                    disabled={
                      !file ||
                      loading ||
                      (!useDefaultSchema && !customFields.some((f) => f.name.trim()))
                    }
                    onClick={extract}
                    size="lg"
                    className="w-full rounded-lg bg-gray-900 py-3 text-white hover:bg-gray-700"
                  >
                    {t('actions.extract')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        <footer className="mt-8 text-center text-sm text-gray-400">
          <div>{t('footer.copyright')}</div>
          <div className="mt-1">
            <a
              href="/privacy"
              className="font-medium text-gray-500 underline-offset-2 hover:text-gray-900 hover:underline"
            >
              Privacy Policy
            </a>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App
