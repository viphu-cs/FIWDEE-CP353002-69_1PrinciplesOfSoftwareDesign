import { useState } from 'react'
import { motion } from 'motion/react'
import { useLanguage } from '../../i18n/useLanguage.js'
import { PROMO } from '../../data/promo.js'

const EASE_ENTER = [0.22, 1, 0.36, 1]

// กล่องข้อความโปรโมชั่นแบบกล่องแชท (มีหางชี้ขึ้น) — วางเป็นลูกของ #promo-anchor ในคอนเทนเนอร์เนื้อหาหลัก
// ดีไซน์เป๊ะ ๆ เหมือนป๊อปอัพตอนเปิดเว็บ (PromoPopup) และเป็นโปรโมชั่นเดียวกัน (data/promo.js)
// class restore-root-primary คืนสี primary ชุด root เพราะหน้าจอง (.auth-theme) เขียนทับเป็นโทนน้ำตาล
export default function PromoBanner() {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const [hidden, setHidden] = useState(false)

  if (hidden) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROMO.code)
    } catch {
      /* clipboard ใช้ไม่ได้ก็ข้ามไป ยังโชว์สถานะคัดลอกแล้ว */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 48, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: 0.2, ease: EASE_ENTER }}
      className="relative z-40 w-full"
    >
      <div className="relative">
        {/* หางกล่องแชท (ชี้ขึ้นไปทาง navbar) */}
        <div className="absolute -top-1.5 right-16 w-4 h-4 bg-surface rotate-45" />

        <div className="restore-root-primary relative bg-surface rounded-2xl shadow-2xl shadow-stone-900/25">
          {/* ปุ่มปิด */}
          <button
            type="button"
            onClick={() => setHidden(true)}
            aria-label={t('promo.close')}
            className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:rotate-90 transition-all duration-300 flex items-center justify-center cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="relative p-5">
            {/* กรอบทองบาง ๆ แบบบูทีค (เหมือน PromoPopup) */}
            <div className="pointer-events-none absolute inset-2.5 border border-amber-700/20 rounded-xl" />

            <div className="relative space-y-3.5">
              {/* ตราส่วนลด + ข้อความ (เหมือนป๊อปอัพหน้าแรก) */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary text-warm-ivory shadow-md flex flex-col items-center justify-center shrink-0 ring-4 ring-warm-ivory/50">
                  <span className="font-headline-sm text-lg leading-none">{PROMO.discount}</span>
                  <span className="font-label-caps text-[8px] uppercase tracking-widest mt-0.5 opacity-90">OFF</span>
                </div>
                <div className="min-w-0 leading-snug">
                  <p className="font-label-caps text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
                    {t('promo.eyebrow')}
                  </p>
                <p className="font-body-sm text-body-sm text-stone-700 mt-0.5">
                  {t('promo.bannerDesc', { discount: PROMO.discount })}
                </p>
                </div>
              </div>

              {/* รหัสโปรโมชั่น + ปุ่มคัดลอก (เหมือนป๊อปอัพหน้าแรก) */}
              <span className="flex items-center justify-between gap-2 border border-dashed border-amber-700/50 bg-amber-50/60 rounded-xl pl-3 pr-1.5 py-1.5">
                <span className="leading-tight">
                  <span className="block font-label-caps text-[9px] uppercase tracking-widest text-stone-400">
                    {t('promo.codeLabel')}
                  </span>
                  <span className="font-mono text-sm font-bold text-primary tracking-[0.12em]">
                    {PROMO.code}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1 shrink-0 ${
                    copied ? 'bg-emerald-800 text-white' : 'bg-primary text-warm-ivory hover:opacity-90'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {t('promo.copied')}
                    </>
                  ) : (
                    t('promo.copy')
                  )}
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
