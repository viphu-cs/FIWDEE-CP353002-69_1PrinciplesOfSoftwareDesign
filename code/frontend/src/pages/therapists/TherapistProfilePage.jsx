import { useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import FadeIn from '../../components/motion/FadeIn.jsx'

export default function TherapistProfilePage({ therapist, onNavigate }) {
  const { t } = useLanguage()

  // State สำหรับรอบเวลาที่เลือก (สามารถเชื่อมโยงระบบการจองต่อไป)
  const defaultSlotTime =
    therapist?.defaultSlot ||
    therapist?.slots?.find((s) => s.available)?.time ||
    '15:00'
  const [selectedSlot, setSelectedSlot] = useState(defaultSlotTime)

  if (!therapist) {
    return (
      <main className="w-full pt-20 bg-surface min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center py-20">
          <p className="font-headline-sm text-primary mb-4">ไม่พบข้อมูลหมอนวด</p>
          <button
            type="button"
            onClick={() => onNavigate?.('therapists')}
            className="btn-lift px-6 py-2.5 rounded-full bg-primary-container text-warm-ivory font-label-lg uppercase cursor-pointer"
          >
            {t('therapistProfile.backToTherapists')}
          </button>
        </div>
      </main>
    )
  }

  const slots = therapist.slots || [
    { time: '10:00', available: false },
    { time: '13:00', available: true },
    { time: '15:00', available: true },
    { time: '18:00', available: true },
    { time: '20:00', available: false },
  ]

  const handleSelectSlot = (timeString) => {
    setSelectedSlot(timeString)
  }

  const handleBooking = () => {
    if (onNavigate) {
      onNavigate('booking', { therapistId: therapist.id, slot: selectedSlot })
    }
  }

  return (
    <main className="w-full pt-20 bg-surface min-h-[calc(100vh-80px)]">
      <div className="flex flex-col w-full">
        <div className="w-full max-w-6xl mx-auto px-6 py-space-xl">
          {/* Top-Left Back Button & Breadcrumb Navigation (No border/frame) */}
          <FadeIn className="flex items-center gap-space-sm mb-space-xl flex-wrap">
            <button
              type="button"
              onClick={() => onNavigate?.('therapists')}
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
              <span>{t('therapistProfile.backToTherapists')}</span>
            </button>
            <span className="text-charcoal-muted text-[11px] font-label-md">/</span>
            <span className="font-label-lg text-label-lg uppercase text-primary font-medium">
              {therapist.nickname} ({therapist.englishName})
            </span>
          </FadeIn>

          {/* Editorial Hero Split Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            {/* Left Column: Portrait & Atmosphere Photography */}
            <FadeIn variant="left" className="lg:col-span-6 flex flex-col gap-space-lg">
              <div className="relative overflow-hidden bg-linen-surface rounded-xl shadow-sm">
                <img
                  className="w-full h-[520px] sm:h-[620px] object-cover object-top transition-transform duration-700 hover:scale-[1.01]"
                  src={therapist.detailPortrait || therapist.imageUrl}
                  alt={`คุณ${therapist.nickname} ผู้เชี่ยวชาญการบำบัด`}
                />
                <div className="absolute bottom-0 inset-x-0 p-space-lg bg-gradient-to-t from-primary/75 via-primary/30 to-transparent">
                  <span className="font-label-md text-label-md text-warm-ivory uppercase tracking-widest block mb-1">
                    {t('therapistProfile.sanctuaryPractitioner')}
                  </span>
                  <p className="font-headline-sm text-headline-sm text-warm-ivory">
                    {therapist.fullName || therapist.nickname}
                  </p>
                </div>
              </div>

              {/* Ambient Sanctuary Glimpse */}
              <div className="bg-linen-surface p-space-lg rounded-xl flex items-center justify-between gap-space-lg">
                <div className="space-y-1">
                  <span className="font-label-md text-label-md uppercase text-terracotta-muted">
                    {t('therapistProfile.workplaceLabel')}
                  </span>
                  <p className="font-body-md text-body-md text-primary font-medium">
                    {therapist.roomName}
                  </p>
                  <p className="font-body-sm text-body-sm text-charcoal-muted">
                    {therapist.roomDesc}
                  </p>
                </div>
                <div className="hidden sm:block w-28 h-20 overflow-hidden rounded-lg flex-shrink-0">
                  <img
                    className="w-full h-full object-cover"
                    src={therapist.roomImage || '/images/profile/room-celadon.jpg'}
                    alt="Sanctuary Room"
                  />
                </div>
              </div>
            </FadeIn>

            {/* Right Column: Editorial Profile Narrative & Real-time Slots */}
            <FadeIn
              variant="right"
              delay={0.1}
              className="lg:col-span-6 flex flex-col justify-between space-y-space-xl"
            >
              {/* Header & Identity Group */}
              <div className="space-y-space-md">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-label-lg text-label-lg uppercase tracking-widest text-terracotta-muted">
                    {t(`roles.${therapist.roleKey}`)}
                  </span>
                  <span className="font-body-sm text-body-sm text-charcoal-soft">
                    {t('therapistProfile.ratingReviews', {
                      rating: therapist.rating.toFixed(1),
                      count: therapist.reviewCount,
                    })}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <h1 className="font-headline-lg text-headline-lg text-primary font-normal tracking-tight">
                    {therapist.nickname}
                  </h1>
                  <p className="font-title-md text-title-md text-charcoal-soft font-normal">
                    {therapist.specialties
                      .map((key) => t(`specialties.${key}`))
                      .join(' · ')}
                  </p>
                </div>

                {/* Quick Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm pt-2">
                  <div className="bg-surface-container p-space-md rounded-lg">
                    <span className="font-label-md text-label-md uppercase text-charcoal-muted block mb-1">
                      {t('therapistProfile.trainingPeriod')}
                    </span>
                    <p className="font-body-md text-body-md text-primary font-medium">
                      {t('therapistProfile.experienceYears', {
                        n: therapist.experienceYears,
                      })}
                    </p>
                  </div>
                  <div className="bg-surface-container p-space-md rounded-lg">
                    <span className="font-label-md text-label-md uppercase text-charcoal-muted block mb-1">
                      {t('therapistProfile.pressureLevel')}
                    </span>
                    <p className="font-body-md text-body-md text-primary font-medium">
                      {therapist.pressureLevel}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1 bg-surface-container p-space-md rounded-lg">
                    <span className="font-label-md text-label-md uppercase text-charcoal-muted block mb-1">
                      {t('therapistProfile.signatureTechnique')}
                    </span>
                    <p className="font-body-md text-body-md text-primary font-medium">
                      {therapist.signatureTechnique}
                    </p>
                  </div>
                </div>
              </div>

              {/* Narrative Section: เกี่ยวกับหมอนวด */}
              <div className="space-y-space-sm bg-linen-surface/60 p-space-lg rounded-xl">
                <h2 className="font-headline-sm text-headline-sm text-primary">
                  {t('therapistProfile.aboutHeading', { name: therapist.nickname })}
                </h2>
                <p className="font-body-lg text-body-lg text-charcoal-soft leading-relaxed">
                  {therapist.bio}
                </p>
                <p className="font-body-md text-body-md text-charcoal-muted pt-space-xs">
                  {therapist.bioSub}
                </p>
              </div>

              {/* Interactive Availability Section */}
              <div className="space-y-space-md bg-warm-ivory p-space-lg rounded-xl shadow-sm border border-sand-warm/30">
                <div className="flex items-baseline justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-primary">
                      {t('therapistProfile.availabilitySchedule')}
                    </h2>
                    <p className="font-label-lg text-label-lg uppercase tracking-wider text-charcoal-muted mt-1">
                      {t('therapistProfile.today')}
                    </p>
                  </div>
                  <span className="font-body-sm text-body-sm text-terracotta-muted">
                    {t('therapistProfile.chooseTimeNotice')}
                  </span>
                </div>

                {/* Time Slots Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot === slot.time
                    if (!slot.available) {
                      return (
                        <div
                          key={slot.time}
                          className="h-12 px-4 rounded-lg bg-surface-container-highest flex items-center justify-between cursor-not-allowed opacity-60"
                        >
                          <span className="font-body-md text-body-md text-charcoal-muted line-through">
                            {slot.time}
                          </span>
                          <span className="font-label-md text-label-md uppercase text-charcoal-muted">
                            {t('therapistProfile.booked')}
                          </span>
                        </div>
                      )
                    }

                    if (isSelected) {
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => handleSelectSlot(slot.time)}
                          className="slot-btn h-12 px-4 rounded-lg bg-primary-container text-warm-ivory flex items-center justify-between transition-colors text-left group shadow-sm cursor-pointer"
                        >
                          <span className="font-body-md text-body-md text-warm-ivory font-medium">
                            {slot.time}
                          </span>
                          <span className="font-label-md text-label-md uppercase text-primary-fixed">
                            {t('therapistProfile.selected')}
                          </span>
                        </button>
                      )
                    }

                    return (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => handleSelectSlot(slot.time)}
                        className="slot-btn h-12 px-4 rounded-lg bg-linen-surface hover:bg-sand-warm flex items-center justify-between transition-colors text-left group cursor-pointer"
                      >
                        <span className="font-body-md text-body-md text-primary font-medium group-hover:text-teak-deep">
                          {slot.time}
                        </span>
                        <span className="font-label-md text-label-md uppercase text-secondary font-medium">
                          {t('therapistProfile.available')}
                        </span>
                      </button>
                    )
                  })}

                  {/* Additional info tile */}
                  <div className="h-12 px-4 rounded-lg bg-surface-container-low flex items-center justify-center text-center">
                    <span className="font-label-md text-label-md text-charcoal-muted">
                      {t('therapistProfile.duration90Min')}
                    </span>
                  </div>
                </div>

                {/* Booking Submission Panel */}
                <div className="pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md border-t border-sand-warm/30">
                  <div>
                    <span className="font-label-md text-label-md uppercase text-charcoal-muted block">
                      {t('therapistProfile.specifiedSlot')}
                    </span>
                    <p className="font-title-md text-title-md text-primary font-medium">
                      {t('therapistProfile.slotFormat', { time: selectedSlot })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleBooking}
                    className="btn-lift w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-primary-container text-warm-ivory font-label-lg text-label-lg uppercase tracking-wider hover:bg-teak-deep transition-all duration-200 shadow-md text-center cursor-pointer"
                  >
                    {t('therapistProfile.bookWith', { name: therapist.nickname })}
                  </button>
                </div>
              </div>

              {/* Footnote Hospitality Guarantee */}
              <div className="flex items-center justify-between text-charcoal-muted pt-space-xs flex-wrap gap-2">
                <p className="font-body-sm text-body-sm">
                  {t('therapistProfile.hospitalityGuarantee')}
                </p>
                <span className="font-label-md text-label-md uppercase tracking-wider text-charcoal-muted">
                  {t('therapistProfile.sanctuaryBadge')}
                </span>
              </div>
            </FadeIn>
          </div>

          {/* Editorial Signature Footnote */}
          <FadeIn
            delay={0.2}
            className="mt-space-2xl pt-space-xl bg-linen-surface/40 rounded-xl p-space-xl grid grid-cols-1 md:grid-cols-3 gap-space-lg"
          >
            <div className="space-y-1">
              <span className="font-label-md text-label-md uppercase text-terracotta-muted">
                {t('therapistProfile.featurePersonalTouchTag')}
              </span>
              <h3 className="font-headline-sm text-headline-sm text-primary font-normal">
                {t('therapistProfile.featurePersonalTouchTitle')}
              </h3>
              <p className="font-body-sm text-body-sm text-charcoal-muted">
                {t('therapistProfile.featurePersonalTouchDesc')}
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-label-md text-label-md uppercase text-terracotta-muted">
                {t('therapistProfile.featurePureProductTag')}
              </span>
              <h3 className="font-headline-sm text-headline-sm text-primary font-normal">
                {t('therapistProfile.featurePureProductTitle')}
              </h3>
              <p className="font-body-sm text-body-sm text-charcoal-muted">
                {t('therapistProfile.featurePureProductDesc')}
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-label-md text-label-md uppercase text-terracotta-muted">
                {t('therapistProfile.featureQuietTag')}
              </span>
              <h3 className="font-headline-sm text-headline-sm text-primary font-normal">
                {t('therapistProfile.featureQuietTitle')}
              </h3>
              <p className="font-body-sm text-body-sm text-charcoal-muted">
                {t('therapistProfile.featureQuietDesc')}
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </main>
  )
}
