import React, { useRef, useState, useMemo } from 'react'
import { useLanguage } from '../../../i18n/useLanguage.js'
import {
  therapistCanPerformService,
  getTherapistsForService,
} from '../../../services/skillMatcher.js'

/**
 * BookingStepService - ขั้นตอนที่ 1: เลือกหมอนวดและบริการบำบัด (SRP: จัดการเฉพาะ Step 1 UI)
 */
export default function BookingStepService({
  therapists,
  services,
  selectedTherapist,
  setSelectedTherapist,
  isDirectTherapistBooking,
  setIsDirectTherapistBooking,
  selectedService,
  selectedDuration,
  handleSelectService,
  handleSelectDuration,
  activeService,
  autoSwitchNotice,
  onNext,
}) {
  const { t } = useLanguage()
  const carouselRef = useRef(null)
  const [showChangeList, setShowChangeList] = useState(false)
  const [filterQualifiedOnly, setFilterQualifiedOnly] = useState(false)

  const isFeaturedMode =
    isDirectTherapistBooking &&
    !showChangeList &&
    selectedTherapist &&
    !selectedTherapist.isConcierge

  // Filtered therapists according to qualification toggle
  const displayedTherapists = useMemo(() => {
    if (!filterQualifiedOnly || !selectedService) return therapists
    return getTherapistsForService(selectedService, therapists)
  }, [filterQualifiedOnly, selectedService, therapists])

  // Count qualified services for the selected therapist
  const qualifiedServicesCount = useMemo(() => {
    if (!selectedTherapist || selectedTherapist.id === 'any' || selectedTherapist.isConcierge) {
      return services.length
    }
    return services.filter((svc) => therapistCanPerformService(selectedTherapist, svc)).length
  }, [selectedTherapist, services])

  return (
    <>
      <section className="w-full py-space-lg md:py-space-xl">
        <div className="max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
          <div className="max-w-2xl space-y-space-xs">
            <p className="font-label-caps text-label-caps uppercase tracking-widest text-primary">
              Boutique Appointment
            </p>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">จองเวลาพักผ่อน</h1>
            <p className="font-body-lg text-body-lg text-secondary">
              เลือกบริการบำบัดที่ท่านต้องการและหมอนวดผู้เชี่ยวชาญเพื่อดูแลสุขภาพกายและใจในบรรยากาศสงบเป็นส่วนตัว
            </p>
          </div>
        </div>
      </section>

      {/* Auto-switch service toast / banner */}
      {autoSwitchNotice && (
        <section className="w-full pb-4">
          <div className="max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center gap-3 text-primary animate-fade-in shadow-sm">
              <span className="material-symbols-outlined text-[24px] flex-shrink-0">
                auto_mode
              </span>
              <p className="font-body-md text-body-md">
                {t('bookingWizard.autoSwitchedServiceNotice')
                  .replace('{service}', autoSwitchNotice.serviceName)
                  .replace('{therapist}', autoSwitchNotice.therapistName)}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="w-full pb-space-xl">
        <div className="max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg lg:gap-gutter-desktop items-start">
            {/* Left: 8 Cols */}
            <div className="lg:col-span-8 flex flex-col gap-space-xl">
              {/* Section 1.1: Featured Large Therapist Profile OR Selection Roster */}
              {isFeaturedMode ? (
                <div className="space-y-space-md">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary font-semibold">
                        {t('bookingWizard.featuredTherapist')}
                      </span>
                      <h2 className="font-headline-md text-headline-md text-on-surface mt-0.5">
                        {selectedTherapist.name}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowChangeList(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded border border-primary/30 text-primary hover:bg-secondary-container transition-colors font-label-md text-label-md uppercase tracking-wider cursor-pointer"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
                      </svg>
                      <span>{t('bookingWizard.changeTherapist')}</span>
                    </button>
                  </div>

                  {/* Featured Large Therapist Profile Card */}
                  <div className="bg-linen-surface rounded-xl overflow-hidden border border-sand-warm/50 p-space-md sm:p-space-lg shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg items-center">
                      {/* Left: Large Portrait Photo */}
                      <div className="md:col-span-5 flex justify-center">
                        <div className="relative w-full max-w-[260px] aspect-[3/4] rounded-lg overflow-hidden bg-sand-warm shadow-sm">
                          <img
                            src={selectedTherapist.image || selectedTherapist.avatar}
                            alt={selectedTherapist.name}
                            className="w-full h-full object-cover object-top"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute bottom-3 left-3 right-3 text-warm-ivory">
                            <span className="font-label-caps text-label-caps uppercase tracking-wider opacity-90 block">
                              {selectedTherapist.exp}
                            </span>
                            <p className="font-title-md text-title-md font-medium">
                              {selectedTherapist.shortName || selectedTherapist.name}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Narrative, Expertise, Technique Details */}
                      <div className="md:col-span-7 space-y-space-md">
                        <div>
                          <p className="font-body-md text-body-md text-primary font-medium">
                            {selectedTherapist.role}
                          </p>
                          <p className="font-body-sm text-body-sm text-charcoal-soft leading-relaxed mt-2">
                            {selectedTherapist.bio}
                          </p>
                        </div>

                        {selectedTherapist.badges && selectedTherapist.badges.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="font-label-caps text-label-caps uppercase text-secondary tracking-wider block">
                              ความเชี่ยวชาญพิเศษ
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedTherapist.badges.map((b, i) => (
                                <span
                                  key={i}
                                  className="font-label-caps text-label-caps px-2.5 py-1 rounded bg-surface text-charcoal-soft border border-sand-warm/50"
                                >
                                  {b}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-sand-warm/30 grid grid-cols-2 gap-3">
                          <div>
                            <span className="font-label-caps text-label-caps uppercase text-secondary block">
                              น้ำหนักมือ
                            </span>
                            <span className="font-body-md text-body-md text-primary font-medium">
                              {selectedTherapist.handWeight || 'ปรับตามสรีระบุคคล'}
                            </span>
                          </div>
                          <div>
                            <span className="font-label-caps text-label-caps uppercase text-secondary block">
                              สถานะ
                            </span>
                            <span className="font-body-sm text-body-sm text-tertiary flex items-center gap-1.5 mt-0.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                              <span>พร้อมให้บริการตามเวลาที่คุณเลือก</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-space-md">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-semibold">
                          ขั้นตอน 1.1 • Master Therapists Roster
                        </span>
                        <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                        <span className="font-body-sm text-body-sm text-secondary">
                          เลือกผู้บำบัดประจำตัว
                        </span>
                      </div>
                      <h2 className="font-headline-md text-headline-md text-on-surface">
                        เลือกหมอนวดผู้เชี่ยวชาญ
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        สัมผัสศาสตร์หัตถการเฉพาะตัว ผ่านผู้เชี่ยวชาญที่ผ่านการรับรองมาตรฐานสากล
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {isDirectTherapistBooking && (
                        <button
                          type="button"
                          onClick={() => setShowChangeList(false)}
                          className="mr-2 text-secondary hover:text-primary font-label-md text-label-md uppercase tracking-wider underline cursor-pointer"
                        >
                          {t('bookingWizard.hideTherapistList')}
                        </button>
                      )}
                      {/* Filter by current service toggle button */}
                      {selectedService && (
                        <button
                          type="button"
                          onClick={() => setFilterQualifiedOnly((prev) => !prev)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer border ${
                            filterQualifiedOnly
                              ? 'bg-primary text-on-primary border-primary'
                              : 'bg-surface text-secondary border-outline-variant/60 hover:border-primary/50'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {filterQualifiedOnly ? 'check_circle' : 'filter_alt'}
                          </span>
                          <span>{t('bookingWizard.filterByCurrentService')}</span>
                        </button>
                      )}
                      <button
                        className="w-9 h-9 rounded-full border border-outline-variant/50 bg-surface flex items-center justify-center text-on-surface hover:bg-secondary-container transition-colors shadow-sm cursor-pointer"
                        onClick={() => carouselRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
                        title="ก่อนหน้า"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                      </button>
                      <button
                        className="w-9 h-9 rounded-full border border-outline-variant/50 bg-surface flex items-center justify-center text-on-surface hover:bg-secondary-container transition-colors shadow-sm cursor-pointer"
                        onClick={() => carouselRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
                        title="ถัดไป"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                      </button>
                    </div>
                  </div>

                  {/* Carousel Cards */}
                  <div
                    ref={carouselRef}
                    className="flex gap-space-md overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
                  >
                    {displayedTherapists.map((therapist) => {
                      const isSelected = selectedTherapist.id === therapist.id
                      const canDoSelectedService = therapistCanPerformService(therapist, selectedService)
                      return (
                        <div
                          key={therapist.id}
                          onClick={() => {
                            setSelectedTherapist(therapist)
                            if (!therapist.isConcierge) {
                              setIsDirectTherapistBooking?.(true)
                              setShowChangeList(false)
                            } else {
                              setIsDirectTherapistBooking?.(false)
                            }
                          }}
                          className={`snap-start flex-shrink-0 w-[290px] sm:w-[310px] rounded-lg overflow-hidden bg-surface-container-low transition-all duration-300 cursor-pointer flex flex-col justify-between group relative ${
                            isSelected
                              ? 'border-2 border-primary shadow-sm ring-1 ring-primary/20'
                              : 'border border-outline-variant/40 shadow-sm hover:border-primary/50 hover:shadow-md'
                          }`}
                        >
                          {/* Media / Concierge representation */}
                          {therapist.isConcierge ? (
                            <div className="relative h-[280px] w-full bg-secondary-fixed flex flex-col items-center justify-center p-6 text-center group-hover:bg-secondary-container transition-colors duration-300">
                              <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center shadow-sm text-primary mb-3">
                                <span className="font-headline-md text-headline-md font-normal">F</span>
                              </div>
                              <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                                Retreat Concierge Choice
                              </span>
                              <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">
                                {therapist.shortName}
                              </h3>
                              <p className="font-body-sm text-body-sm text-secondary mt-1 max-w-[200px]">
                                {therapist.exp}
                              </p>
                              {selectedService && (
                                <span className="mt-3 font-label-caps text-label-caps px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] inline-flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                  {t('bookingWizard.serviceMatchesTherapist')}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="relative h-[280px] w-full overflow-hidden bg-surface-container">
                              <img
                                alt={therapist.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                src={therapist.image}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/20 to-transparent"></div>
                              <div className="absolute bottom-3 left-4 right-4 text-surface">
                                <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary-fixed">
                                  {therapist.exp}
                                </span>
                                <h3 className="font-headline-sm text-headline-sm text-surface font-medium mt-0.5">
                                  {therapist.name}
                                </h3>
                                {/* Match badge for current selected service */}
                                {selectedService && canDoSelectedService && (
                                  <span className="mt-1.5 font-label-caps text-label-caps px-2 py-0.5 rounded bg-emerald-700/80 text-warm-ivory backdrop-blur-sm text-[11px] inline-flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[13px]">check</span>
                                    {t('bookingWizard.serviceMatchesTherapist')}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Bio & Attributes */}
                          <div className="p-4 flex flex-col justify-between flex-1 space-y-3 bg-surface-container-low">
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {therapist.badges.map((b, i) => (
                                  <span
                                    key={i}
                                    className={`font-label-caps text-label-caps px-2 py-0.5 rounded ${
                                      i === 0
                                        ? 'bg-secondary-container text-on-secondary-container font-semibold'
                                        : 'bg-surface text-secondary border border-outline-variant/30'
                                    }`}
                                  >
                                    {b}
                                  </span>
                                ))}
                              </div>
                              <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                                {therapist.bio}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-outline-variant/30 space-y-1.5">
                              <div className="flex items-center justify-between text-secondary">
                                <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">
                                  {therapist.isConcierge ? 'การจัดสรร' : 'น้ำหนักมือ'}
                                </span>
                                <span className="font-label-md text-label-md text-primary font-medium">
                                  {therapist.handWeight}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-secondary">
                                <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">
                                  {therapist.isConcierge ? 'ความพร้อม' : 'สถานะ'}
                                </span>
                                <span className="font-body-sm text-body-sm text-tertiary flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary inline-block"></span>
                                  {therapist.isConcierge ? 'คิวว่างดีที่สุด' : 'พร้อมให้บริการ'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Section 1.2: Treatment Selection */}
              <div className="space-y-space-sm pt-2">
                <div className="flex items-baseline justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-semibold">
                      ขั้นตอน 1.2 • Select Treatment
                    </span>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface mt-0.5">
                      เลือกรายการบำบัด
                    </h2>
                  </div>
                  <span className="font-body-sm text-body-sm text-secondary">
                    {t('bookingWizard.servicesAvailableForTherapist').replace('{count}', qualifiedServicesCount)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map((svc) => {
                    const isSelected = selectedService.id === svc.id
                    const isQualified = therapistCanPerformService(selectedTherapist, svc)

                    return (
                      <div
                        key={svc.id}
                        className={`rounded-xl p-5 transition-all duration-200 flex flex-col justify-between gap-4 relative ${
                          !isQualified
                            ? 'opacity-50 bg-surface-container-lowest border border-dashed border-outline-variant/60'
                            : isSelected
                            ? 'bg-secondary-container border border-primary/40'
                            : 'bg-surface-container-low border border-transparent hover:bg-surface-container hover:border-outline-variant/40'
                        }`}
                      >
                        {/* Service header & image */}
                        <button
                          type="button"
                          disabled={!isQualified}
                          onClick={() => {
                            if (isQualified) handleSelectService(svc)
                          }}
                          className={`text-left space-y-3 w-full group ${
                            isQualified ? 'cursor-pointer' : 'cursor-not-allowed'
                          }`}
                        >
                          <div className="w-full h-36 sm:h-44 rounded-lg overflow-hidden bg-surface-container flex-shrink-0 relative">
                            <img
                              src={svc.image}
                              alt={svc.name}
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.onerror = null
                                e.currentTarget.src = '/images/services/room-architecture.jpg'
                              }}
                              className={`w-full h-full object-cover transition-transform duration-500 ${
                                isQualified ? 'group-hover:scale-105' : 'grayscale'
                              }`}
                            />
                            {!isQualified && (
                              <div className="absolute inset-0 bg-on-surface/40 flex items-center justify-center p-3 text-center">
                                <span className="bg-surface/95 text-error px-2.5 py-1 rounded text-xs font-medium shadow-sm inline-flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[15px]">block</span>
                                  {t('bookingWizard.therapistNotQualified')}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                !isQualified
                                  ? 'border-outline-variant bg-transparent opacity-40'
                                  : isSelected
                                  ? 'border-primary bg-primary'
                                  : 'border-outline bg-transparent'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${isSelected && isQualified ? 'bg-surface' : 'bg-transparent'}`}
                              ></span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-label-lg text-label-lg text-on-surface font-semibold">
                                  {svc.name}
                                </h4>
                                {svc.isPopular && isQualified && (
                                  <span className="font-label-caps text-label-caps px-1.5 py-0.5 rounded bg-primary text-surface text-[10px] font-medium flex-shrink-0">
                                    ยอดนิยม
                                  </span>
                                )}
                              </div>
                              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                                {svc.desc}
                              </p>
                              {!isQualified && (
                                <p className="text-xs text-error/90 mt-1.5 font-medium flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">info</span>
                                  <span>{t('bookingWizard.therapistNotQualified')}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </button>

                        {/* อัตราราคาตามระยะเวลา */}
                        <div className={`bg-surface rounded-lg p-4 space-y-1.5 ${!isQualified ? 'opacity-50 pointer-events-none' : ''}`}>
                          <p className="font-label-caps text-label-caps text-secondary uppercase tracking-widest pb-1">
                            อัตราราคาตามระยะเวลา
                          </p>
                          {svc.durationOptions.map((opt) => {
                            const isDurationActive =
                              isSelected && selectedDuration.minutes === opt.minutes
                            return (
                              <button
                                key={opt.minutes}
                                type="button"
                                disabled={!isQualified}
                                onClick={() => {
                                  if (isQualified) handleSelectDuration(svc, opt)
                                }}
                                className={`w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded transition-all duration-200 text-left ${
                                  !isQualified
                                    ? 'cursor-not-allowed opacity-60'
                                    : isDurationActive
                                    ? 'bg-secondary-container ring-1 ring-primary/50 cursor-pointer'
                                    : 'hover:bg-surface-container cursor-pointer'
                                }`}
                              >
                                <span className="flex items-center gap-2.5 min-w-0">
                                  <span
                                    className={`w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                      isDurationActive && isQualified
                                        ? 'border-primary bg-primary'
                                        : 'border-outline bg-transparent'
                                    }`}
                                  >
                                    <span
                                      className={`w-1 h-1 rounded-full ${
                                        isDurationActive && isQualified ? 'bg-surface' : 'bg-transparent'
                                      }`}
                                    ></span>
                                  </span>
                                  <span
                                    className={`font-body-md text-body-md ${
                                      isDurationActive && isQualified ? 'text-primary font-semibold' : 'text-on-surface'
                                    }`}
                                  >
                                    {opt.minutes} นาที
                                  </span>
                                </span>
                                <span
                                  className={`font-headline-sm text-headline-sm font-normal ${
                                    isDurationActive && isQualified ? 'text-primary' : 'text-on-surface'
                                  }`}
                                >
                                  ฿{opt.price.toLocaleString('en-US')}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Bottom Disclaimer */}
              <div className="pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md border-t border-outline-variant/30">
                <div className="text-secondary font-body-sm text-body-sm text-center sm:text-left">
                  ท่านสามารถปรับเปลี่ยนหรือยกเลิกการจองได้ล่วงหน้า 4 ชั่วโมงโดยไม่มีค่าธรรมเนียม
                </div>
              </div>
            </div>

            {/* Right Sidebar: 4 Cols */}
            <aside className="lg:col-span-4 w-full sticky top-28 space-y-space-md">
              <div className="w-full rounded overflow-hidden shadow-sm bg-surface-container-low">
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <img
                    alt="Private Suite Treatment Sanctuary"
                    className="w-full h-full object-cover"
                    src="/images/booking/suite-room.jpg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-space-sm left-space-md right-space-md text-inverse-on-surface">
                    <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary-fixed">
                      บรรยากาศห้องพักผ่อน
                    </span>
                    <p className="font-headline-sm text-headline-sm">Private Suite ห้องเดี่ยวส่วนตัว</p>
                  </div>
                </div>

                <div className="p-space-lg space-y-space-md">
                  <div className="space-y-1">
                    <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">
                      สรุปรายการ
                    </span>
                    <h3 className="font-headline-md text-headline-md text-on-surface">การจองของคุณ</h3>
                  </div>

                  <div className="space-y-space-sm py-space-sm">
                    <div className="flex flex-col space-y-0.5">
                      <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">
                        ผู้บำบัด
                      </span>
                      <div className="flex items-baseline justify-between">
                        <span className="font-label-md text-label-md text-on-surface font-semibold">
                          {selectedTherapist.shortName}
                        </span>
                        <span className="font-body-sm text-body-sm text-secondary truncate max-w-[180px]">
                          {selectedTherapist.role}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-0.5 pt-2">
                      <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">
                        บริการที่เลือก
                      </span>
                      <div className="flex items-baseline justify-between">
                        <span className="font-label-md text-label-md text-on-surface font-semibold">
                          {selectedService.name}
                        </span>
                        <span className="font-body-sm text-body-sm text-secondary">
                          {activeService.duration}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-0.5 pt-2">
                      <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">
                        พื้นที่บริการ
                      </span>
                      <div className="flex items-baseline justify-between">
                        <span className="font-label-md text-label-md text-on-surface">
                          ห้องเดี่ยว Private Suite
                        </span>
                        <span className="font-body-sm text-body-sm text-primary font-medium">
                          รวมในแพ็กเกจ
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-space-sm rounded bg-surface-container space-y-2">
                    <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">
                      สิทธิประโยชน์พิเศษ
                    </span>
                    <ul className="font-body-sm text-body-sm text-on-surface-variant space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                        <span>ชาเกสรบัวต้อนรับและของว่างสุขภาพ</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                        <span>ห้องอาบน้ำและห้องแต่งตัวส่วนบุคคล</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                        <span>สมุนไพรประคบสดสูตรเฉพาะของร้าน</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-space-sm space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="font-body-md text-body-md text-secondary">
                        ยอดชำระเบื้องต้น
                      </span>
                      <span className="font-headline-md text-headline-md text-primary font-medium">
                        {activeService.price}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-secondary">
                      ราคารวมภาษีมูลค่าเพิ่มและค่าบริการแล้ว
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onNext}
                className="group w-full inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded bg-primary text-on-primary font-label-md text-label-md tracking-wider shadow-sm hover:opacity-95 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <span className="font-medium">ถัดไป: เลือกวันและเวลา</span>
                <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:scale-105">
                  arrow_forward
                </span>
              </button>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
