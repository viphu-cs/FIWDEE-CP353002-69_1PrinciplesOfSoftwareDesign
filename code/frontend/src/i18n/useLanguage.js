import { useCallback, useContext } from 'react'
import { LanguageContext } from './context.js'
import { en } from './locales/en.js'
import { th } from './locales/th.js'

const dictionaries = { th, en }

// hook หลักสำหรับทุก component: const { t, lang, setLang } = useLanguage()
export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage ต้องใช้ภายใต้ <LanguageProvider>')

  const { lang, setLang } = ctx

  // t('nav.home') / t('therapists.experience', { n: 6 })
  const t = useCallback(
    (path, vars) => {
      let value = path.split('.').reduce((node, key) => node?.[key], dictionaries[lang])
      if (value == null) return path
      if (vars) {
        for (const [key, replacement] of Object.entries(vars)) {
          value = value.replaceAll(`{${key}}`, replacement)
        }
      }
      return value
    },
    [lang],
  )

  return { lang, setLang, t }
}
