import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import FadeIn from '../motion/FadeIn.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import { services } from '../../data/mock.js'

// key ของรายละเอียดทรีตเมนต์ (tag/title/desc) ใน i18n เรียงตามลำดับ services ใน mock.js
const DETAIL_KEYS = ['t1', 't2', 't3', 't4']

// 🎬 Pinned horizontal carousel — เลื่อนลงมาถึงส่วนนี้แล้วหน้าจะ "หยุดรอ" ที่นี่
// ระหว่างที่ค้าง การ scroll ลงต่อจะถูกแปลงเป็นการเลื่อนการ์ดไปทางข้างจนถึงรายการสุดท้าย
// เมื่อครบแล้ว sticky จะปล่อย จึงเลื่อนไป section ถัดไปตามปกติ
// ดีไซน์การ์ดอิงหน้าบริการ (ServicesPage) ส่วน "รายการทรีตเมนต์และหัตถการ"
// คูณระยะ scroll ที่ใช้เลื่อนการ์ด — ยิ่งมากยิ่งเลื่อนช้า/นานขึ้น
const PIN_SCROLL_FACTOR = 1.8

export default function ServicesSection({ onNavigate }) {
  const { t } = useLanguage()
  const wrapperRef = useRef(null)
  const trackRef = useRef(null)
  const [shift, setShift] = useState(0)

  // progress 0 = ขอบบนส่วนนี้แตะขอบบนจอ (เริ่ม pin), 1 = เลื่อนครบระยะแล้ว (ปล่อย pin)
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  })
  const x = useTransform(scrollYProgress, [0, 1], [0, -shift])

  // ระยะเลื่อน = ความกว้างเกินของ track เทียบกับความกว้างจอ (วัดใหม่ทุกครั้งที่ resize)
  useEffect(() => {
    const measure = () => {
      const track = trackRef.current
      if (!track) return
      setShift(Math.max(track.scrollWidth - window.innerWidth + 48, 0))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // ความสูง wrapper = จอเต็ม + ระยะ scroll ที่ใช้เลื่อนการ์ด (คูณ factor ให้เลื่อนนานขึ้น)
  return (
    <section
      ref={wrapperRef}
      id="services"
      className="w-full relative bg-surface"
      style={{ height: `calc(100vh + ${shift * PIN_SCROLL_FACTOR}px)` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        <div className="max-w-6xl mx-auto px-6 w-full">
          <FadeIn className="mb-space-lg">
            <p className="font-label-md text-label-md uppercase text-terracotta-muted tracking-widest mb-space-xs">
              {t('services.label')}
            </p>
            <h2 className="font-headline-lg text-headline-lg text-primary">{t('services.title')}</h2>
            <p className="font-body-sm text-body-sm text-charcoal-muted mt-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">swipe_right</span>
              {t('services.scrollHint')}
            </p>
          </FadeIn>
        </div>

        {/* track เลื่อนข้าง — กว้างตามเนื้อหา (w-max) เลื่อนด้วย scroll ที่ถูก "ล็อก" ไว้ในส่วนนี้ */}
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex gap-6 w-max px-6 mt-space-lg items-stretch"
        >
          {services.map((service, index) => {
            const key = DETAIL_KEYS[index] || `t${index + 1}`
            return (
              <article
                key={service.id}
                className="w-[86vw] max-w-[860px] md:w-[820px] shrink-0 bg-surface-container-low rounded-xl p-6 md:p-10 shadow-sm flex flex-col md:flex-row gap-6 md:gap-10 items-stretch"
              >
                {/* ฝั่งข้อความ */}
                <div className="md:w-1/2 flex flex-col">
                  <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
                    {t(`servicesPage.${key}Tag`)}
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-normal mt-1.5">
                    {t(`servicesPage.${key}Title`)}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mt-2 line-clamp-4">
                    {t(`servicesPage.${key}Desc`)}
                  </p>

                  {/* แผงอัตราบริการ (สไตล์เดียวกับหน้าบริการ) */}
                  <div className="bg-surface rounded-lg p-4 space-y-2 mt-4">
                    <p className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">
                      {t('servicesPage.durationRateLabel')}
                    </p>
                    {service.durationOptions.map((option) => (
                      <div key={option.durationMinutes} className="flex items-baseline justify-between">
                        <span className="font-body-md text-body-md text-on-surface">
                          {t('services.durationPrice', {
                            min: option.durationMinutes,
                            price: option.price.toLocaleString('th-TH'),
                          })}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate?.('booking')}
                    className="font-label-md text-label-md text-primary hover:text-on-primary-fixed-variant underline underline-offset-8 transition-colors cursor-pointer text-left mt-auto pt-4 self-start"
                  >
                    {t('servicesPage.bookThis')}
                  </button>
                </div>

                {/* ฝั่งรูป (อยู่ข้างข้อความ สูงเต็มการ์ด) */}
                <div className="md:w-1/2 h-56 md:h-auto rounded-lg overflow-hidden bg-sand-warm group min-h-[220px]">
                  <img
                    src={service.image}
                    alt={t(`servicesPage.${key}Title`)}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
              </article>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
