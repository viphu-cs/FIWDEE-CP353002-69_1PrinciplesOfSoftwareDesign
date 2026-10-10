import { useState, useEffect } from 'react'
import FadeIn from '../motion/FadeIn.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
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
  const [displayTherapists, setDisplayTherapists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    api.get('/therapists')
      .then((res) => {
        if (isMounted) {
          if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
            const mapped = res.data.map((bt) => {
              const backendSkills = bt.skills || []
              const specialties = []
              backendSkills.forEach((s) => {
                const lower = s.toLowerCase()
                if (lower.includes('thai')) specialties.push('thai')
                if (lower.includes('aroma')) specialties.push('aroma')
                if (lower.includes('oil')) specialties.push('oil')
                if (lower.includes('foot')) specialties.push('foot')
              })

              return {
                id: bt.id,
                nickname: bt.nickname,
                specialties: specialties.length > 0 ? specialties : ['thai'],
                rating: bt.averageRating > 0 ? Number(bt.averageRating) : 5.0,
                bio: bt.bio || '',
                experienceYears: bt.experienceYears || 5,
                imageUrl: bt.imageUrl || '/images/booking/therapist-mali.jpg',
              }
            })
            setDisplayTherapists(mapped)
          } else {
            setDisplayTherapists([])
          }
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setDisplayTherapists([])
          setLoading(false)
        }
      })

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

        {displayTherapists.length === 0 ? (
          <FadeIn className="text-center py-12 bg-linen-surface rounded-xl border border-sand-warm/30">
            <span className="material-symbols-outlined text-4xl text-charcoal-muted mb-2">person_off</span>
            <p className="font-body-md text-charcoal-muted">
              {loading ? t('common.loading') || 'กำลังโหลดข้อมูล...' : t('therapists.empty') || 'ไม่พบข้อมูลหมอนวดในระบบ'}
            </p>
          </FadeIn>
        ) : (
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
                        {therapist.specialties.map((key) => t(`specialties.${key}`) || key).join(' · ')}
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
        )}

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
