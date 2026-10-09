import { useState, useEffect } from 'react'
import FadeIn from '../motion/FadeIn.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import { therapists as mockTherapists } from '../../data/mock.js'
import api from '../../lib/api.js'

// 🎬 Micro-interaction: การ์ดเอียงตามตำแหน่งเมาส์ (เขียน transform ตรงทุก mousemove —
// เรียลไทม์ 1:1 ไม่มี transition ค้าง จึงลื่นไม่แลค) / เงา+ขอบจัดการโดย .card-highlight แยกกัน
function handleTilt(event) {
  const card = event.currentTarget
  const rect = card.getBoundingClientRect()
  const x = event.clientX - rect.left - rect.width / 2
  const y = event.clientY - rect.top - rect.height / 2
  const rotateX = -(y / rect.height) * 6
  const rotateY = (x / rect.width) * 6
  card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`
}

function resetTilt(event) {
  event.currentTarget.style.transform = ''
}

export default function TherapistsSection({ onNavigate }) {
  const { t } = useLanguage()
  const [displayTherapists, setDisplayTherapists] = useState(mockTherapists)

  useEffect(() => {
    let isMounted = true
    api.get('/therapists')
      .then((res) => {
        if (isMounted && res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const merged = res.data.map((bt, idx) => {
            const matchedMock =
              mockTherapists.find((mt) => mt.nickname.toLowerCase() === bt.nickname.toLowerCase()) ||
              mockTherapists[idx % mockTherapists.length]

            return {
              ...matchedMock,
              id: bt.id,
              nickname: bt.nickname,
              rating: bt.averageRating > 0 ? Number(bt.averageRating) : matchedMock.rating,
              bio: bt.bio || matchedMock.bio,
            }
          })
          setDisplayTherapists(merged)
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="w-full py-space-2xl bg-surface" id="therapists">
      <div className="max-w-6xl mx-auto px-6">
        {/* 🎬 Reveal: หัวข้อปรากฏก่อน แล้วการ์ดไล่ตามทีละใบ */}
        <FadeIn className="flex flex-col md:flex-row md:items-end justify-between mb-space-xl">
          <div>
            <p className="font-label-md text-label-md uppercase text-terracotta-muted tracking-widest mb-space-xs">
              {t('therapists.label')}
            </p>
            <h2 className="font-headline-lg text-headline-lg text-primary">
              {t('therapists.title')}
            </h2>
          </div>
          <p className="font-body-md text-body-md text-charcoal-muted mt-2 md:mt-0">
            {t('therapists.subtitle')}
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {displayTherapists.slice(0, 3).map((therapist, index) => (
            <FadeIn key={therapist.id} delay={0.12 + index * 0.14} variant="up">
              <article
                className="card-highlight group cursor-pointer bg-linen-surface rounded-xl overflow-hidden"
                onMouseMove={handleTilt}
                onMouseLeave={resetTilt}
              >
                {/* 🎬 รูป zoom ช้า ๆ เมื่อ hover การ์ด (CSS group-hover, GPU) */}
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-sand-warm">
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    src={therapist.imageUrl}
                    alt={`หมอนวด ${therapist.nickname}`}
                  />
                </div>
                <div className="p-space-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-baseline justify-between mb-space-xs">
                      <h3 className="font-headline-sm text-headline-sm text-primary font-medium">
                        {therapist.nickname}
                      </h3>
                      <span className="font-label-lg text-label-lg text-terracotta-muted transition-transform duration-200 group-hover:-translate-y-0.5">
                        {therapist.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-charcoal-soft mb-1">
                      {therapist.specialties.map((key) => t(`specialties.${key}`)).join(' · ')}
                    </p>
                    <p className="font-body-sm text-body-sm text-charcoal-muted">
                      {t('therapists.experience', { n: therapist.experienceYears })}
                    </p>
                  </div>
                  <div className="pt-space-md mt-space-sm flex items-center justify-between border-t border-sand-warm/30">
                    {/* 🎬 ลิงก์: เส้นใต้วาดจากซ้ายเมื่อ hover */}
                    <button
                      type="button"
                      onClick={() =>
                        onNavigate?.('therapist-profile', { therapistId: therapist.id })
                      }
                      className="link-underline font-label-lg text-label-lg text-primary transition-colors duration-200 hover:text-secondary cursor-pointer"
                    >
                      {t('therapists.profile')}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onNavigate?.('booking', { therapistId: therapist.id })
                      }
                      className="btn-lift inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-primary text-warm-ivory font-label-md text-label-md tracking-wider hover:bg-teak-deep transition-all duration-200 cursor-pointer shadow-sm"
                    >
                      <span>{t('therapists.bookNow')}</span>
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.25} className="mt-space-xl text-center">
          <button
            type="button"
            onClick={() => onNavigate?.('therapists')}
            className="link-underline font-label-lg text-label-lg uppercase tracking-widest text-primary transition-colors duration-200 hover:text-secondary cursor-pointer"
          >
            {t('therapists.viewAll')}
          </button>
        </FadeIn>
      </div>
    </section>
  )
}
