import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useLanguage } from '../../i18n/useLanguage.js'

// ป๊อปอัพโปรโมชั่นตอนเปิด/รีเฟรชหน้าเว็บ (ดีเลย์ 2 วินาที)
// ข้อมูลโปรโมชั่นตั้งไว้ที่นี่ — เมื่อ backend พร้อมจะดึงจาก API แทน
const PROMO = {
  code: 'FIWDEE20',
  discount: '20%',
}

const EASE = [0.22, 1, 0.36, 1]

export default function PromoPopup({ ready = true, onNavigate }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // รอ preloader ยกม่านก่อน แล้วค่อยโชว์หน่วง 2 วินาที — แสดงใหม่ทุกครั้งที่เข้า/รีเฟรช
  useEffect(() => {
    if (!ready) return undefined
    const timer = setTimeout(() => setOpen(true), 2000)
    return () => clearTimeout(timer)
  }, [ready])

  // ปิดด้วยปุ่ม Escape + ล็อก scroll ของหน้าขณะเปิด
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  const close = () => setOpen(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROMO.code)
    } catch {
      /* clipboard ใช้ไม่ได้ก็ข้ามไป ยังโชว์สถานะคัดลอกแล้ว */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleBook = () => {
    close()
    onNavigate?.('booking-flow')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="promo-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 bg-stone-950/60 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            key="promo-card"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.5, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-surface rounded-2xl shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t('promo.ariaLabel')}
          >
            {/* ปุ่มปิด */}
            <button
              type="button"
              onClick={close}
              aria-label={t('promo.close')}
              className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:rotate-90 transition-all duration-300 flex items-center justify-center cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* เนื้อหา — เลย์เอาต์คอลัมน์เดียวกระชับ พร้อมกรอบทองบาง ๆ แบบบูทีค */}
            <div className="relative p-6 sm:p-8">
              <div className="pointer-events-none absolute inset-2.5 border border-amber-700/20 rounded-xl" />

              <div className="relative flex flex-col items-center text-center space-y-4">
                {/* ตราส่วนลด */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
                  animate={{ opacity: 1, scale: 1, rotate: -4 }}
                  transition={{ delay: 0.3, duration: 0.55, ease: EASE }}
                  className="w-20 h-20 rounded-full bg-primary text-warm-ivory shadow-lg flex flex-col items-center justify-center ring-4 ring-warm-ivory/40"
                >
                  <span className="font-headline-lg text-2xl leading-none">{PROMO.discount}</span>
                  <span className="font-label-caps text-[9px] uppercase tracking-widest mt-0.5 opacity-90">OFF</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.45, ease: EASE }}
                  className="space-y-1.5"
                >
                  <p className="font-label-caps text-label-caps uppercase tracking-[0.25em] text-primary font-semibold">
                    {t('promo.eyebrow')}
                  </p>
                  <h2 className="font-headline-md text-headline-md text-on-surface leading-tight">
                    {t('promo.title')}
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    {t('promo.desc', { discount: PROMO.discount })}
                  </p>
                </motion.div>

                {/* รหัสโปรโมชั่น */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.45, ease: EASE }}
                  className="w-full flex items-center justify-between gap-3 border border-dashed border-amber-700/45 bg-amber-50/60 rounded-xl px-4 py-2.5"
                >
                  <div className="text-left leading-tight">
                    <span className="block font-label-caps text-[10px] uppercase tracking-widest text-stone-500">
                      {t('promo.codeLabel')}
                    </span>
                    <span className="font-mono text-base font-bold text-primary tracking-[0.15em]">
                      {PROMO.code}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                      copied ? 'bg-emerald-800 text-white' : 'bg-primary text-warm-ivory hover:opacity-90'
                    }`}
                  >
                    {copied ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        {t('promo.copied')}
                      </>
                    ) : (
                      t('promo.copy')
                    )}
                  </button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.45, ease: EASE }}
                  className="w-full space-y-2.5 pt-0.5"
                >
                  <button
                    type="button"
                    onClick={handleBook}
                    className="btn-lift w-full px-6 py-3.5 bg-primary-container text-warm-ivory rounded-full font-label-md text-label-md tracking-widest uppercase hover:bg-teak-deep transition-all duration-200 shadow-sm cursor-pointer"
                  >
                    {t('promo.cta')}
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    className="w-full text-center font-label-md text-label-md text-stone-400 hover:text-stone-600 underline underline-offset-4 decoration-stone-300 transition-colors cursor-pointer"
                  >
                    {t('promo.dismiss')}
                  </button>
                  <p className="font-body-sm text-[11px] text-stone-400">{t('promo.terms')}</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
