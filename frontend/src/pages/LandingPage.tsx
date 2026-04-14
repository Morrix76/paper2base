import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function LandingPage() {
  const { t } = useTranslation()

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
          {t('landing.hero.title')}
        </h1>
        <p className="mt-3 text-base text-gray-500 sm:text-lg">
          {t('landing.hero.subtitle')}
        </p>
        <div className="mt-6 flex justify-center">
          <Button
            asChild
            size="lg"
            className="rounded-lg bg-gray-900 px-6 py-3 text-white hover:bg-gray-700"
          >
            <a href="/register">{t('landing.hero.cta')}</a>
          </Button>
        </div>
      </section>

      <section className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {t('landing.howItWorks.kicker')}
          </p>
          <h2 className="mt-1 text-lg font-bold text-gray-900">
            {t('landing.howItWorks.title')}
          </h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-gray-600">
            <li>{t('landing.howItWorks.step1')}</li>
            <li>{t('landing.howItWorks.step2')}</li>
            <li>{t('landing.howItWorks.step3')}</li>
          </ol>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {t('landing.formats.kicker')}
          </p>
          <h2 className="mt-1 text-lg font-bold text-gray-900">
            {t('landing.formats.title')}
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-600">
            <li>{t('landing.formats.pdf')}</li>
            <li>{t('landing.formats.word')}</li>
            <li>{t('landing.formats.excel')}</li>
            <li>{t('landing.formats.images')}</li>
            <li>{t('landing.formats.handwritten')}</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {t('landing.pricing.kicker')}
          </p>
          <h2 className="mt-1 text-lg font-bold text-gray-900">{t('landing.pricing.title')}</h2>
          <p className="mt-4 text-sm text-gray-600">
            {t('landing.pricing.body')}{' '}
            <a
              className="font-medium text-gray-700 underline-offset-2 hover:text-gray-900 hover:underline"
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

