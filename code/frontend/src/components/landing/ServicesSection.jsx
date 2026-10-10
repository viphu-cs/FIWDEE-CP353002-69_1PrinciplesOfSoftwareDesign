import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import FadeIn from '../motion/FadeIn.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import { services as mockServices } from '../../data/mock.js'
import api from '../../lib/api.js'

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
  const [displayServices, setDisplayServices] = useState(mockServices)

  useEffect(() => {
    let isMounted = true
    api.get('/services')
      .then((res) => {
        if (isMounted && res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const merged = mockServices.map((ms) => {
            const live = res.data.find((ls) => ls.serviceCode === ms.serviceCode || ls.id === ms.id)
            if (live && live.durationOptions) {
              return {
                ...ms,
                durationOptions: live.durationOptions.map((d) => ({
                  durationMinutes: d.durationMinutes,
                  price: Number(d.price),
                })),
              }
            }
            return ms
          })
          setDisplayServices(merged)
        }
      })
      .catch(() => {})
    return () => {
      isMounted = false
    }
  }, [])

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
          <FadeIn className="mb-4 md:mb-6">
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
          className="flex gap-8 md:gap-10 w-max px-6 md:px-12 mt-4 md:mt-6 items-stretch"
        >
          {displayServices.map((service, index) => {
            const key = DETAIL_KEYS[index] || `t${index + 1}`
            return (
              <article
                key={service.id}
                className="w-[90vw] max-w-[1140px] md:w-[960px] lg:w-[1080px] xl:w-[1140px] shrink-0 bg-surface-container-low rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-sm flex flex-col md:flex-row gap-6 md:gap-10 lg:gap-12 items-stretch"
              >
                {/* ฝั่งข้อความ */}
                <div className="md:w-1/2 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
                      {t(`servicesPage.${key}Tag`)}
                    </span>
                    <h3 className="font-headline-md text-headline-md md:text-headline-lg text-on-surface font-normal leading-snug mt-1">
                      {t(`servicesPage.${key}Title`)}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed line-clamp-3 md:line-clamp-4">
                      {t(`servicesPage.${key}Desc`)}
                    </p>

                    {/* แผงอัตราบริการ (สไตล์เดียวกับหน้าบริการ) */}
                    <div className="bg-surface rounded-xl p-4 md:p-5 space-y-2 mt-4">
                      <p className="font-label-caps text-label-caps text-secondary uppercase tracking-widest pb-1">
                        {t('servicesPage.durationRateLabel')}
                      </p>
                      <div className="space-y-2">
                        {service.durationOptions.map((option) => (
                          <div key={option.durationMinutes} className="flex items-baseline justify-between py-1">
                            <span className="font-body-md text-body-md text-on-surface">
                              {t('servicesPage.minuteUnit', { n: option.durationMinutes })}
                            </span>
                            <span className="font-headline-sm text-headline-sm text-on-surface font-normal">
                              {t('servicesPage.bahtUnit', { price: option.price.toLocaleString('th-TH') })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate?.('booking')}
                    className="font-label-lg text-label-lg text-primary hover:text-on-primary-fixed-variant underline underline-offset-8 transition-colors cursor-pointer text-left pt-6 self-start"
                  >
                    {t('servicesPage.bookThis')}
                  </button>
                </div>

                {/* ฝั่งรูป (อยู่ข้างข้อความ สูงเต็มการ์ด) */}
                <div className="md:w-1/2 h-64 sm:h-72 md:h-auto rounded-xl overflow-hidden bg-sand-warm group min-h-[260px] md:min-h-[420px] lg:min-h-[480px]">
                  <img
                    src={service.image}
                    alt={t(`servicesPage.${key}Title`)}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = '/images/services/room-architecture.jpg'
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
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
