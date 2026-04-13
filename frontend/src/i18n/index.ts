import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { it } from './locales/it'
import { en } from './locales/en'

const STORAGE_KEY = 'paper2base.lang'

function readInitialLanguage(): 'it' | 'en' {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw === 'en' || raw === 'it') return raw
  return 'it'
}

void i18n.use(initReactI18next).init({
  resources: {
    it: { translation: it },
    en: { translation: en },
  },
  lng: readInitialLanguage(),
  fallbackLng: 'it',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  if (lng === 'it' || lng === 'en') {
    window.localStorage.setItem(STORAGE_KEY, lng)
  }
})

export { STORAGE_KEY }
export default i18n

