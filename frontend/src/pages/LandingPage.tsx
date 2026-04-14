import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 9L12 4.5 16.5 9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5V16.5" />
    </svg>
  )
}

function RobotIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 2v2m4-2v2" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 7.5A3.5 3.5 0 0110.5 4h3A3.5 3.5 0 0117 7.5v7A4.5 4.5 0 0112.5 19h-1A4.5 4.5 0 017 14.5v-7z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 11h.01M15 11h.01" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.5h6" />
    </svg>
  )
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16v-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 16v-7" />
    </svg>
  )
}

export function LandingPage() {
  const { t } = useTranslation()

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-center">
      <section>
        <div className="mx-auto w-fit inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100">
          {t('landing.hero.badge')}
        </div>
        <h1 className="mt-5 min-h-[100px] text-4xl font-black leading-tight tracking-tight text-gray-900">
          {t('landing.hero.title')}
        </h1>
        <p className="mt-3 text-lg text-gray-500">{t('landing.hero.subtitle')}</p>
        <p className="mt-3 text-base text-gray-500">{t('landing.hero.description')}</p>
        <div className="mt-6 flex justify-center">
          <Button
            asChild
            size="lg"
            className="rounded-lg bg-gray-900 px-7 py-3 text-white hover:bg-gray-700"
          >
            <a href="/register">{t('landing.hero.cta')}</a>
          </Button>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-base font-semibold text-gray-900">{t('landing.howItWorks.title')}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
              <UploadIcon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-semibold text-gray-900">{t('landing.howItWorks.step1')}</p>
            <p className="mt-2 min-h-[60px] text-sm text-gray-600">
              {t('landing.howItWorks.step1Body')}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
              <RobotIcon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-semibold text-gray-900">{t('landing.howItWorks.step2')}</p>
            <p className="mt-2 min-h-[60px] text-sm text-gray-600">
              {t('landing.howItWorks.step2Body')}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
              <ChartIcon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-semibold text-gray-900">{t('landing.howItWorks.step3')}</p>
            <p className="mt-2 min-h-[60px] text-sm text-gray-600">
              {t('landing.howItWorks.step3Body')}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-base font-semibold text-gray-900">{t('landing.formats.title')}</h2>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {[
            t('landing.formats.pdf'),
            t('landing.formats.word'),
            t('landing.formats.excel'),
            t('landing.formats.images'),
            t('landing.formats.handwritten'),
          ].map((label) => (
            <span
              key={label}
              className="rounded-full bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 ring-1 ring-gray-200"
            >
              {label}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="mx-auto rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-xs">
          <p className="text-sm text-gray-700">
            {t('landing.pricing.body')}{' '}
            <a
              className="font-semibold text-gray-900 underline-offset-2 hover:underline"
              href="mailto:iltuobrand@outlook.it"
            >
              iltuobrand@outlook.it
            </a>
          </p>
        </div>
      </section>

      <footer className="mt-12 text-center text-sm text-gray-400">
        <a
          href="/privacy"
          className="font-medium text-gray-500 underline-offset-2 hover:text-gray-900 hover:underline"
        >
          Privacy Policy
        </a>
      </footer>
    </main>
  )
}

