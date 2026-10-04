import { useCallback, useEffect, useMemo, useState } from 'react'
import { LanguageContext } from './context.js'

// ===== Provider ของระบบ i18n =====
// หน้าใหม่ในอนาคต: เพิ่ม namespace ใน locales/th.js + en.js แล้วเรียก t('namespace.key')
const STORAGE_KEY = 'fiwdee-lang'

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() =>
    localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'th',
  )

  const setLang = useCallback((next) => {
    setLangState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  // อัปเดต attribute lang ของ <html> ให้ตรงกับภาษาที่เลือก
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
