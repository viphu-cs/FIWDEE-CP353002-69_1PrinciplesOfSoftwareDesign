import { useState, useEffect } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import FadeIn from '../../components/motion/FadeIn.jsx'
import api from '../../lib/api.js'

const filterCategories = [
  { key: 'all', labelKey: 'therapistsPage.filterAll' },
  { key: 'thai', labelKey: 'specialties.thai' },
  { key: 'aroma', labelKey: 'specialties.aroma' },
  { key: 'oil', labelKey: 'specialties.oil' },
  { key: 'foot', labelKey: 'specialties.foot' },
]

const THERAPIST_DEFAULT_IMAGES = {
  4: '/images/booking/therapist-mali.jpg',
  5: '/images/booking/therapist-mali.jpg',
  6: '/images/booking/therapist-bua.jpg',
  7: '/images/booking/therapist-praew.jpg',
  8: '/images/booking/therapist-karn.jpg',
  9: '/images/booking/therapist-bua.jpg',
}

export default function TherapistsPage({ onNavigate }) {
  const { t, lang } = useLanguage()
  const [therapistsList, setTherapistsList] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [hasLoadedMore, setHasLoadedMore] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    api.get('/therapists')
      .then((res) => {
        if (isMounted) {
          if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
            const mapped = res.data.map((bt) => {
              // Normalize backend skills into filter categories: thai, aroma, oil, foot
              const backendSkills = bt.skills || []
              const specialties = []
              backendSkills.forEach((s) => {
                const lower = s.toLowerCase()
                if (lower.includes('thai') || lower.includes('ไทย')) specialties.push('thai')
                if (lower.includes('aroma') || lower.includes('อโรมา') || lower.includes('อโรม่า')) specialties.push('aroma')
                if (lower.includes('oil') || lower.includes('น้ำมัน')) specialties.push('oil')
                if (lower.includes('foot') || lower.includes('เท้า')) specialties.push('foot')
              })

              const img = bt.photoUrl || bt.imageUrl || THERAPIST_DEFAULT_IMAGES[bt.id] || '/images/booking/therapist-mali.jpg'

              return {
                id: bt.id,
                nickname: bt.nickname,
                specialties: specialties.length > 0 ? specialties : ['thai'],
                rating: bt.averageRating > 0 ? Number(bt.averageRating) : 5.0,
                bio: bt.bio || '',
                imageUrl: img,
                experienceYears: bt.experienceYears || 5,
                roleKey: 'seniorTherapist',
                availableTime: '06:00'
              }
            })
            setTherapistsList(mapped)
          } else {
            setTherapistsList([])
          }
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setTherapistsList([])
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  // กรองตามหมวดหมู่และคำค้นหา
  const filteredTherapists = therapistsList.filter((therapist) => {
    const matchesCategory =
      activeFilter === 'all' || therapist.specialties.includes(activeFilter)

    const query = searchQuery.trim().toLowerCase()
    if (!query) return matchesCategory

    const nickname = therapist.nickname.toLowerCase()
    const role = (t(`roles.${therapist.roleKey}`) || '').toLowerCase()
    const specs = therapist.specialties
      .map((s) => (t(`specialties.${s}`) || '').toLowerCase())
      .join(' ')

    const matchesSearch =
      nickname.includes(query) || role.includes(query) || specs.includes(query)

    return matchesCategory && matchesSearch
  })

  const totalPossible = therapistsList.length * 3 // สอดคล้องกับดีไซน์ผู้เชี่ยวชาญ

  return (
    <main className="w-full pt-20 bg-surface min-h-[calc(100vh-80px)]">
      <div className="flex flex-col w-full">
        <div className="w-full max-w-6xl mx-auto px-6 pt-8 md:pt-12 pb-space-2xl">
          {/* Top-Left Back Button & Breadcrumbs (Borderless) */}
          <FadeIn className="flex items-center gap-space-sm mb-8 flex-wrap">
            <button
              type="button"
              onClick={() => onNavigate?.('home')}
              className="inline-flex items-center gap-2 text-charcoal-muted hover:text-primary transition-colors duration-200 font-label-lg text-label-lg uppercase cursor-pointer py-1 group"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:-translate-x-1"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>{t('therapistsPage.backToHome')}</span>
            </button>
            <span className="text-charcoal-muted text-[11px] font-label-md">/</span>
            <span className="font-label-lg text-label-lg uppercase text-primary font-medium">
              {t('therapistsPage.breadcrumbCurrent')}
            </span>
          </FadeIn>

          {/* Editorial Header & Philosophy Narrative */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg mb-space-2xl">
            <FadeIn className="max-w-2xl space-y-space-sm">
              <span className="font-label-md text-label-md uppercase tracking-[0.2em] text-terracotta-muted block">
                {t('therapistsPage.eyebrow')}
              </span>
              <h1 className="font-headline-lg text-headline-lg text-primary font-normal tracking-tight">
                {t('therapistsPage.title')}
              </h1>
              <p className="font-body-md text-body-md text-charcoal-muted leading-relaxed pt-space-xs">
                {t('therapistsPage.desc')}
              </p>
            </FadeIn>

            {/* Live Sanctuary Indicator Tag */}
            <FadeIn
              delay={0.15}
              className="flex items-center gap-space-sm self-start md:self-end pb-1"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
              </span>
              <span className="font-label-md text-label-md text-charcoal-muted uppercase tracking-wider">
                {t('therapistsPage.availableTodayCount', { n: filteredTherapists.length })}
              </span>
            </FadeIn>
          </section>

          {/* Refined Filtering & Uncluttered Search Strip */}
          <FadeIn
            delay={0.1}
            className="w-full mb-space-xl bg-linen-surface p-space-md md:p-space-lg flex flex-col md:flex-row md:items-center justify-between gap-space-lg rounded-sm"
          >
            {/* Minimalist Categories */}
            <nav
              aria-label="หมวดหมู่ความเชี่ยวชาญ"
              className="flex items-center flex-wrap gap-space-xs md:gap-space-sm"
            >
              {filterCategories.map((cat) => {
                const isActive = activeFilter === cat.key
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setActiveFilter(cat.key)}
                    className={`filter-btn px-5 py-2 text-label-md uppercase transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-primary-container text-warm-ivory shadow-xs'
                        : 'bg-transparent text-charcoal-soft hover:text-primary hover:bg-surface/50'
                    }`}
                  >
                    {t(cat.labelKey)}
                  </button>
                )
              })}
            </nav>

            {/* Quiet Search Field */}
            <div className="w-full md:w-72 relative">
              <label className="sr-only" htmlFor="therapist-search">
                {t('therapistsPage.searchPlaceholder')}
              </label>
              <input
                id="therapist-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('therapistsPage.searchPlaceholder')}
                className="w-full bg-surface py-2.5 pl-4 pr-10 text-body-sm text-charcoal-soft placeholder:text-charcoal-muted focus:outline-none transition-colors duration-200 shadow-sm border border-transparent focus:border-terracotta-muted/30"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-muted hover:text-primary text-xs cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </FadeIn>

          {/* Therapists Directory Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg min-h-[300px]">
            {loading ? (
              <div className="col-span-full py-20 text-center text-charcoal-muted">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-3">progress_activity</span>
                <p className="font-body-md text-secondary">
                  {lang === 'th' ? 'กำลังโหลดข้อมูลหมอนวด...' : 'Loading therapists...'}
                </p>
              </div>
            ) : filteredTherapists.length === 0 ? (
              <div className="col-span-full py-16 text-center text-charcoal-muted">
                <p className="font-headline-sm text-headline-sm text-primary font-normal mb-2">
                  {t('admin.noMatchingRecords')}
                </p>
                <p className="font-body-md text-body-md text-charcoal-muted">
                  {lang === 'th' ? 'ไม่พบข้อมูลหมอนวดในระบบขณะนี้' : 'No therapist profiles found in database'}
                </p>
              </div>
            ) : (
              filteredTherapists.map((therapist, index) => (
              <FadeIn key={therapist.id} delay={0.08 + index * 0.1} variant="up">
                <article className="bg-linen-surface flex flex-col h-full transition-all duration-300 hover:shadow-md group">
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-sand-warm">
                    <img
                      src={therapist.imageUrl}
                      alt={`คุณ${therapist.nickname} ${t(`roles.${therapist.roleKey}`)}`}
                      className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur-md px-3 py-1 shadow-sm">
                      <span className="font-label-md text-label-md text-charcoal-soft tracking-wider">
                        {t('therapistsPage.availableTodayBadge', {
                          time: therapist.availableTime,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="p-space-lg flex flex-col flex-1 justify-between gap-space-lg">
                    <div className="space-y-space-xs">
                      <div className="flex items-baseline justify-between">
                        <h2 className="font-headline-sm text-headline-sm text-primary">
                          {therapist.nickname}
                        </h2>
                        <span className="font-label-md text-label-md text-terracotta-muted">
                          {t('therapistsPage.experience', {
                            n: therapist.experienceYears,
                          })}
                        </span>
                      </div>
                      <p className="font-label-lg text-label-lg uppercase text-charcoal-muted tracking-wider">
                        {t(`roles.${therapist.roleKey}`)}
                      </p>
                      <p className="font-body-sm text-body-sm text-charcoal-soft pt-space-xs">
                        {therapist.specialties
                          .map((key) => t(`specialties.${key}`))
                          .join(' · ')}
                      </p>
                    </div>

                    <div className="pt-space-md border-t border-sand-warm/30 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onNavigate?.('therapist-profile', { therapistId: therapist.id })
                        }
                        className="inline-block font-label-lg text-label-lg text-primary underline underline-offset-8 transition-colors duration-200 hover:text-terracotta-muted cursor-pointer"
                      >
                        {t('therapistsPage.profile')}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onNavigate?.('booking', { therapistId: therapist.id })
                        }
                        className="btn-lift inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-primary text-warm-ivory font-label-md text-label-md tracking-wider hover:bg-teak-deep transition-all duration-200 cursor-pointer shadow-sm"
                      >
                        <span>{t('therapistsPage.bookNow')}</span>
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
            )))}

            {filteredTherapists.length === 0 && (
              <div className="col-span-full py-16 text-center space-y-4">
                <p className="font-body-md text-charcoal-muted">
                  {t('therapistsPage.noResults')}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('all')
                    setSearchQuery('')
                  }}
                  className="font-label-md text-label-md uppercase tracking-wider text-primary underline underline-offset-4 cursor-pointer hover:text-terracotta-muted"
                >
                  {t('therapistsPage.resetFilters')}
                </button>
              </div>
            )}
          </section>

          {/* Subdued Editorial Load More / Status */}
          <FadeIn
            delay={0.2}
            className="mt-space-2xl pt-space-lg text-center flex flex-col items-center gap-space-sm"
          >
            <button
              id="load-more-btn"
              type="button"
              disabled={hasLoadedMore}
              onClick={() => setHasLoadedMore(true)}
              className={`font-label-lg text-label-lg tracking-[0.15em] text-primary uppercase underline underline-offset-8 transition-all duration-200 ${
                hasLoadedMore
                  ? 'opacity-50 pointer-events-none'
                  : 'hover:text-terracotta-muted cursor-pointer'
              }`}
            >
              {hasLoadedMore
                ? t('therapistsPage.noMore')
                : t('therapistsPage.loadMore')}
            </button>
            <span className="font-label-md text-label-md text-charcoal-muted uppercase tracking-widest pt-2">
              {t('therapistsPage.showingCount', {
                current: filteredTherapists.length,
                total: totalPossible,
              })}
            </span>
          </FadeIn>

          {/* Sensory Guarantee Note */}
          <FadeIn
            delay={0.25}
            className="mt-space-2xl bg-surface-container p-space-xl flex flex-col md:flex-row items-baseline justify-between gap-space-md"
          >
            <div className="space-y-space-xs max-w-xl">
              <h3 className="font-headline-sm text-headline-sm text-primary">
                {t('therapistsPage.guaranteeTitle')}
              </h3>
              <p className="font-body-sm text-body-sm text-charcoal-soft leading-relaxed">
                {t('therapistsPage.guaranteeDesc')}
              </p>
            </div>
            <div className="pt-space-sm md:pt-0">
              <button
                type="button"
                onClick={() => onNavigate?.('booking')}
                className="btn-lift inline-flex items-center justify-center px-8 py-3.5 bg-primary-container text-warm-ivory font-label-lg text-label-lg uppercase tracking-wider transition-colors duration-200 hover:bg-teak-deep cursor-pointer"
              >
                {t('therapistsPage.guaranteeCta')}
              </button>
            </div>
          </FadeIn>
        </div>
      </div>
    </main>
  )
}
