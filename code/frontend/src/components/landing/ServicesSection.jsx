import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import FadeIn from '../motion/FadeIn.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
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
  const [displayServices, setDisplayServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    api.get('/services')
      .then((res) => {
        if (isMounted) {
          if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
            const mapped = res.data.map((s) => {
              const durationOptions = (s.durationOptions || []).map((d) => ({
                durationMinutes: d.durationMinutes,
                price: Number(d.price),
              }))
              let img = '/images/services/service-thai.jpg'
              if (s.serviceCode?.includes('AROMA')) img = '/images/services/service-aroma.jpg'
              else if (s.serviceCode?.includes('OIL') || s.serviceCode?.includes('WARM')) img = '/images/services/service-warm-oil.jpg'
              else if (s.serviceCode?.includes('FOOT')) img = '/images/services/service-foot.jpg'

              return {
                id: s.id,
                serviceCode: s.serviceCode,
                name: s.serviceName,
                description: s.description,
                image: img,
                durationOptions,
              }
            })
            setDisplayServices(mapped)
          } else {
            setDisplayServices([])
          }
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setDisplayServices([])
          setLoading(false)
        }
      })
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

  // ระยะเลื่อน = ความกว้างเกินของ track เทียบกับความกว้างจอ (วัดใหม่ทุกครั้งที่ resize หรือ displayServices เปลี่ยน)
  useEffect(() => {
    const measure = () => {
      const track = trackRef.current
      if (!track) return
      const maxScroll = Math.max(track.scrollWidth - window.innerWidth + 80, 0)
      setShift(maxScroll)
    }

    // วัดทันทีและหลังจาก DOM render
    measure()
    const timer = setTimeout(measure, 150)
    window.addEventListener('resize', measure)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', measure)
    }
  }, [displayServices])

  // ฟังก์ชันเลื่อนการ์ดแบบ manual ด้วยปุ่มลูกศร
  const handleScrollByButton = (direction) => {
    if (!wrapperRef.current) return
    const scrollAmount = window.innerWidth * 0.75 * direction
    window.scrollBy({ top: scrollAmount, behavior: 'smooth' })
  }

  // ความสูง wrapper = จอเต็ม + ระยะ scroll ที่ใช้เลื่อนการ์ด (คูณ factor ให้เลื่อนนุ่มนวล)
  return (
    <section
      ref={wrapperRef}
      id="services"
      className="w-full relative bg-surface"
      style={{ height: shift > 0 ? `calc(100vh + ${shift * PIN_SCROLL_FACTOR}px)` : 'auto' }}
    >
      <div className={`${shift > 0 ? 'sticky top-0 h-screen overflow-hidden' : 'py-space-2xl'} flex flex-col justify-center`}>
        <div className="max-w-6xl mx-auto px-6 w-full">
          <FadeIn className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 md:mb-6">
            <div>
              <p className="font-label-md text-label-md uppercase text-terracotta-muted tracking-widest mb-space-xs">
                {t('services.label')}
              </p>
              <h2 className="font-headline-lg text-headline-lg text-primary">{t('services.title')}</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <p className="font-body-sm text-body-sm text-charcoal-muted flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">swipe_right</span>
                {t('services.scrollHint')}
              </p>

              {/* ปุ่มเลื่อนซ้าย-ขวาเสริมเพื่อการเข้าถึงและการควบคุมที่สะดวก (Accessibility & Control) */}
              {displayServices.length > 1 && (
                <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-sand-warm/40">
                  <button
                    type="button"
                    onClick={() => handleScrollByButton(-1)}
                    className="w-8 h-8 rounded-full border border-sand-warm/60 bg-surface flex items-center justify-center text-charcoal-soft hover:bg-surface-container hover:text-primary transition-colors cursor-pointer shadow-xs"
                    title="ก่อนหน้า"
                    aria-label="ก่อนหน้า"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScrollByButton(1)}
                    className="w-8 h-8 rounded-full border border-sand-warm/60 bg-surface flex items-center justify-center text-charcoal-soft hover:bg-surface-container hover:text-primary transition-colors cursor-pointer shadow-xs"
                    title="ถัดไป"
                    aria-label="ถัดไป"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              )}
            </div>
          </FadeIn>
        </div>

        {displayServices.length === 0 ? (
          <div className="max-w-6xl mx-auto px-6 w-full mt-8">
            <FadeIn className="text-center py-16 bg-surface-container-low rounded-2xl border border-outline-variant/30">
              <span className="material-symbols-outlined text-4xl text-charcoal-muted mb-2">spa</span>
              <p className="font-body-md text-charcoal-muted">
                {loading ? t('common.loading') || 'กำลังโหลดข้อมูล...' : t('services.empty') || 'ไม่พบข้อมูลรายการบริการในระบบ'}
              </p>
            </FadeIn>
          </div>
        ) : (
          /* track เลื่อนข้าง — กว้างตามเนื้อหา (w-max) เลื่อนด้วย scroll ที่ถูก "ล็อก" ไว้ในส่วนนี้ */
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex gap-8 md:gap-10 w-max px-6 md:px-12 mt-4 md:mt-6 items-stretch will-change-transform"
          >
            {displayServices.map((service, index) => {
              const key = DETAIL_KEYS[index] || `t${index + 1}`
              const serviceTitle = service.name || t(`servicesPage.${key}Title`)
              const serviceTag = t(`servicesPage.${key}Tag`) || 'TREATMENT'
              const serviceDesc = service.description || t(`servicesPage.${key}Desc`)

              return (
                <article
                  key={service.id}
                  className="w-[90vw] max-w-[1140px] md:w-[960px] lg:w-[1080px] xl:w-[1140px] shrink-0 bg-surface-container-low rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-sm flex flex-col md:flex-row gap-6 md:gap-10 lg:gap-12 items-stretch"
                >
                  {/* ฝั่งข้อความ */}
                  <div className="md:w-1/2 flex flex-col justify-between">
                    <div className="space-y-3">
                      <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
                        {serviceTag}
                      </span>
                      <h3 className="font-headline-md text-headline-md md:text-headline-lg text-on-surface font-normal leading-snug mt-1">
                        {serviceTitle}
                      </h3>
                      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed line-clamp-3 md:line-clamp-4">
                        {serviceDesc}
                      </p>

                      {/* แผงอัตราบริการ (สไตล์เดียวกับหน้าบริการ) */}
                      <div className="bg-surface rounded-xl p-4 md:p-5 space-y-2 mt-4">
                        <p className="font-label-caps text-label-caps text-secondary uppercase tracking-widest pb-1">
                          {t('servicesPage.durationRateLabel')}
                        </p>
                        <div className="space-y-2">
                          {(service.durationOptions || []).map((option) => (
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
                      alt={serviceTitle}
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
        )}
      </div>
    </section>
  )
}
