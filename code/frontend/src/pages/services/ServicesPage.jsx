import { useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import FadeIn from '../../components/motion/FadeIn.jsx'
import { services } from '../../data/mock.js'

export default function ServicesPage({ onNavigate }) {
  const { t } = useLanguage()

  const thaiService = services.find((s) => s.id === 1) || { image: '/images/services/service-thai.jpg' }
  const aromaService = services.find((s) => s.id === 2) || { image: '/images/services/service-aroma.jpg' }
  const warmOilService = services.find((s) => s.id === 3) || { image: '/images/services/service-warm-oil.jpg' }
  const footService = services.find((s) => s.id === 4) || { image: '/images/services/service-foot.jpg' }

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: 'thai',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="w-full pt-20 bg-surface min-h-[calc(100vh-80px)]">
      <div className="flex flex-col w-full">
        {/* Editorial Page Header & Top-Left Back Navigation */}
        <section className="w-full max-w-6xl mx-auto px-6 pt-8 md:pt-12 pb-12">
          {/* Top-Left Back Button (Borderless) */}
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
              <span>{t('servicesPage.backToHome')}</span>
            </button>
            <span className="text-charcoal-muted text-[11px] font-label-md">/</span>
            <span className="font-label-lg text-label-lg uppercase text-primary font-medium">
              {t('servicesPage.breadcrumbCurrent')}
            </span>
          </FadeIn>

          <FadeIn delay={0.08} className="max-w-3xl space-y-4">
            <p className="font-label-caps text-label-caps text-secondary uppercase tracking-[0.2em]">
              {t('servicesPage.eyebrow')}
            </p>
            <h1 className="font-headline-lg text-headline-lg md:text-display text-on-surface font-normal">
              {t('servicesPage.title')}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl pt-2">
              {t('servicesPage.desc')}
            </p>
          </FadeIn>
        </section>

        {/* Architectural Showcase Section */}
        <section className="w-full max-w-6xl mx-auto px-6 pb-20">
          <FadeIn delay={0.12} className="relative overflow-hidden rounded-xl bg-surface-container shadow-sm group">
            <img
              alt={t('servicesPage.roomAlt')}
              className="w-full h-[400px] md:h-[580px] object-cover transition-transform duration-700 group-hover:scale-[1.01]"
              src="/images/services/room-architecture.jpg"
            />
            {/* White blur gradient rising from bottom (soft & translucent) */}
            <div
              className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/70 via-white/35 to-transparent backdrop-blur-sm pointer-events-none [-webkit-mask-image:linear-gradient(to_top,black_30%,transparent)] [mask-image:linear-gradient(to_top,black_30%,transparent)]"
              aria-hidden="true"
            />
            {/* Text content over the white blur gradient */}
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-4 z-10">
              <p className="font-headline-sm text-headline-sm text-primary font-medium max-w-xl">
                {t('servicesPage.roomOverlayText')}
              </p>
              <span className="font-label-caps text-label-caps uppercase text-secondary font-semibold tracking-widest">
                {t('servicesPage.roomTag')}
              </span>
            </div>
          </FadeIn>
        </section>

        {/* Detailed Service Treatments (Menu Detail) */}
        <section className="w-full max-w-6xl mx-auto px-6 py-8 md:py-16">
          <FadeIn className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 pb-12">
            <div>
              <p className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">
                {t('servicesPage.ritualsEyebrow')}
              </p>
              <h2 className="font-headline-md text-headline-md text-on-surface font-normal mt-1">
                {t('servicesPage.ritualsTitle')}
              </h2>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {t('servicesPage.ritualsNote')}
            </p>
          </FadeIn>

          {/* Treatment List Cards */}
          <div className="flex flex-col gap-10">
            {/* Treatment 1: Royal Thai Massage */}
            <FadeIn delay={0.05}>
              <article className="bg-surface-container-low rounded-xl p-8 md:p-12 hover:bg-surface-container transition-colors duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
                      {t('servicesPage.t1Tag')}
                    </span>
                    <h3 className="font-headline-md text-headline-md text-on-surface font-normal">
                      {t('servicesPage.t1Title')}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      {t('servicesPage.t1Desc')}
                    </p>
                    <div className="py-4 space-y-3">
                      <div className="flex items-baseline justify-between py-1.5">
                        <span className="font-body-md text-body-md text-on-surface">
                          {t('servicesPage.minuteUnit', { n: 60 })}
                        </span>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-normal">
                          {t('servicesPage.bahtUnit', { price: '600' })}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between py-1.5">
                        <span className="font-body-md text-body-md text-on-surface">
                          {t('servicesPage.minuteUnit', { n: 90 })}
                        </span>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-normal">
                          {t('servicesPage.bahtUnit', { price: '850' })}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between py-1.5">
                        <span className="font-body-md text-body-md text-on-surface">
                          {t('servicesPage.minuteUnit', { n: 120 })}
                        </span>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-normal">
                          {t('servicesPage.bahtUnit', { price: '1,100' })}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 flex items-center gap-6">
                      <button
                        type="button"
                        onClick={() => onNavigate?.('booking', { service: 'thai' })}
                        className="font-label-md text-label-md text-primary hover:text-on-primary-fixed-variant underline underline-offset-8 transition-colors cursor-pointer"
                      >
                        {t('servicesPage.bookThis')}
                      </button>
                    </div>
                  </div>
                  <div className="lg:col-span-6 overflow-hidden rounded-lg">
                    <img
                      alt={t('servicesPage.t1Title')}
                      className="w-full h-80 lg:h-96 object-cover rounded-lg transition-transform duration-700 hover:scale-[1.01]"
                      src={thaiService?.image || '/images/services/service-thai.jpg'}
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = '/images/services/room-architecture.jpg'
                      }}
                    />
                  </div>
                </div>
              </article>
            </FadeIn>

            {/* Treatment 2: Organic Aromatherapy Massage */}
            <FadeIn delay={0.1}>
              <article className="bg-surface-container-low rounded-xl p-8 md:p-12 hover:bg-surface-container transition-colors duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
                      {t('servicesPage.t2Tag')}
                    </span>
                    <h3 className="font-headline-md text-headline-md text-on-surface font-normal">
                      {t('servicesPage.t2Title')}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      {t('servicesPage.t2Desc')}
                    </p>
                    <div className="py-4 space-y-3">
                      <div className="flex items-baseline justify-between py-1.5">
                        <span className="font-body-md text-body-md text-on-surface">
                          {t('servicesPage.minuteUnit', { n: 60 })}
                        </span>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-normal">
                          {t('servicesPage.bahtUnit', { price: '800' })}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between py-1.5">
                        <span className="font-body-md text-body-md text-on-surface">
                          {t('servicesPage.minuteUnit', { n: 90 })}
                        </span>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-normal">
                          {t('servicesPage.bahtUnit', { price: '1,100' })}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between py-1.5">
                        <span className="font-body-md text-body-md text-on-surface">
                          {t('servicesPage.minuteUnit', { n: 120 })}
                        </span>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-normal">
                          {t('servicesPage.bahtUnit', { price: '1,400' })}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => onNavigate?.('booking', { service: 'aroma' })}
                        className="font-label-md text-label-md text-primary hover:text-on-primary-fixed-variant underline underline-offset-8 transition-colors cursor-pointer"
                      >
                        {t('servicesPage.bookThis')}
                      </button>
                    </div>
                  </div>
                  <div className="lg:col-span-6 overflow-hidden rounded-lg">
                    <img
                      alt={t('servicesPage.t2ImageAlt')}
                      className="w-full h-80 lg:h-96 object-cover rounded-lg transition-transform duration-700 hover:scale-[1.01]"
                      src={aromaService?.image || '/images/services/service-aroma.jpg'}
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = '/images/services/aromatherapy-herbs.jpg'
                      }}
                    />
                  </div>
                </div>
              </article>
            </FadeIn>

            {/* Treatment 3 & 4: Two-column symmetric grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Treatment 3: Warm Herbal Oil Massage */}
              <FadeIn delay={0.08} className="h-full">
                <article className="bg-surface-container-low rounded-xl p-8 md:p-10 flex flex-col justify-between h-full hover:bg-surface-container transition-colors duration-300">
                  <div className="space-y-4">
                    <div className="w-full h-52 md:h-60 overflow-hidden rounded-lg mb-4">
                      <img
                        alt={t('servicesPage.t3Title')}
                        className="w-full h-full object-cover rounded-lg transition-transform duration-700 hover:scale-[1.01]"
                        src={warmOilService?.image || '/images/services/service-warm-oil.jpg'}
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = '/images/services/aromatherapy-herbs.jpg'
                        }}
                      />
                    </div>
                    <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
                      {t('servicesPage.t3Tag')}
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-normal">
                      {t('servicesPage.t3Title')}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      {t('servicesPage.t3Desc')}
                    </p>
                  </div>
                  <div className="pt-8 space-y-4">
                    <div className="bg-surface rounded-lg p-5 space-y-2.5">
                      <div className="flex items-baseline justify-between">
                        <span className="font-body-md text-body-md text-on-surface">
                          {t('servicesPage.minuteUnit', { n: 60 })}
                        </span>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-normal">
                          {t('servicesPage.bahtUnit', { price: '750' })}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="font-body-md text-body-md text-on-surface">
                          {t('servicesPage.minuteUnit', { n: 90 })}
                        </span>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-normal">
                          {t('servicesPage.bahtUnit', { price: '1,000' })}
                        </span>
                      </div>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => onNavigate?.('booking', { service: 'oil' })}
                        className="font-label-md text-label-md text-primary hover:text-on-primary-fixed-variant underline underline-offset-8 transition-colors cursor-pointer"
                      >
                        {t('servicesPage.bookThis')}
                      </button>
                    </div>
                  </div>
                </article>
              </FadeIn>

              {/* Treatment 4: Foot Reflexology & Hand Relief */}
              <FadeIn delay={0.12} className="h-full">
                <article className="bg-surface-container-low rounded-xl p-8 md:p-10 flex flex-col justify-between h-full hover:bg-surface-container transition-colors duration-300">
                  <div className="space-y-4">
                    <div className="w-full h-52 md:h-60 overflow-hidden rounded-lg mb-4">
                      <img
                        alt={t('servicesPage.t4Title')}
                        className="w-full h-full object-cover rounded-lg transition-transform duration-700 hover:scale-[1.01]"
                        src={footService?.image || '/images/services/service-foot.jpg'}
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = '/images/services/aromatherapy-herbs.jpg'
                        }}
                      />
                    </div>
                    <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
                      {t('servicesPage.t4Tag')}
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-normal">
                      {t('servicesPage.t4Title')}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      {t('servicesPage.t4Desc')}
                    </p>
                  </div>
                  <div className="pt-8 space-y-4">
                    <div className="bg-surface rounded-lg p-5 space-y-2.5">
                      <div className="flex items-baseline justify-between">
                        <span className="font-body-md text-body-md text-on-surface">
                          {t('servicesPage.minuteUnit', { n: 60 })}
                        </span>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-normal">
                          {t('servicesPage.bahtUnit', { price: '500' })}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="font-body-md text-body-md text-on-surface">
                          {t('servicesPage.minuteUnit', { n: 90 })}
                        </span>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-normal">
                          {t('servicesPage.bahtUnit', { price: '700' })}
                        </span>
                      </div>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => onNavigate?.('booking', { service: 'foot' })}
                        className="font-label-md text-label-md text-primary hover:text-on-primary-fixed-variant underline underline-offset-8 transition-colors cursor-pointer"
                      >
                        {t('servicesPage.bookThis')}
                      </button>
                    </div>
                  </div>
                </article>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Section ติดต่อสอบถาม (Inquiries & Reservation) */}
        <section className="w-full max-w-6xl mx-auto px-6 py-16 md:py-24" id="inquiries">
          <FadeIn className="bg-surface-container-low rounded-xl p-8 md:p-16">
            <div className="max-w-2xl mb-12">
              <p className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">
                {t('servicesPage.inquiriesEyebrow')}
              </p>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-normal mt-1">
                {t('servicesPage.inquiriesTitle')}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-3 leading-relaxed">
                {t('servicesPage.inquiriesDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              {/* Contact Meta Info */}
              <div className="lg:col-span-5 space-y-8">
                <div>
                  <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest block mb-2">
                    {t('servicesPage.branchLabel')}
                  </span>
                  <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                    {t('servicesPage.branchAddressLine1')}
                    <br />
                    {t('servicesPage.branchAddressLine2')}
                  </p>
                </div>

                <div>
                  <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest block mb-2">
                    {t('servicesPage.hoursLabel')}
                  </span>
                  <p className="font-body-md text-body-md text-on-surface">
                    {t('servicesPage.hoursValue')}
                  </p>
                </div>

                <div>
                  <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest block mb-2">
                    {t('servicesPage.phoneLabel')}
                  </span>
                  <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                    <a
                      href="tel:043241890"
                      className="hover:text-primary transition-colors block"
                    >
                      {t('servicesPage.phoneLine1')}
                    </a>
                    <a
                      href="tel:0812345678"
                      className="hover:text-primary transition-colors block"
                    >
                      {t('servicesPage.phoneLine2')}
                    </a>
                  </p>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <div>
                    <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest block mb-1">
                      {t('servicesPage.lineLabel')}
                    </span>
                    <p className="font-body-md text-body-md text-primary font-medium">
                      {t('servicesPage.lineValue')}
                    </p>
                  </div>
                  <div>
                    <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest block mb-1">
                      {t('servicesPage.igLabel')}
                    </span>
                    <p className="font-body-md text-body-md text-primary font-medium">
                      {t('servicesPage.igValue')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Minimalist Contact Form */}
              <div className="lg:col-span-7">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label
                      className="font-label-caps text-label-caps text-secondary uppercase tracking-widest block mb-2"
                      htmlFor="client-name"
                    >
                      {t('servicesPage.formNameLabel')}
                    </label>
                    <input
                      id="client-name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t('servicesPage.formNamePlaceholder')}
                      className="w-full bg-surface-container px-4 py-3.5 rounded text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface transition-all"
                    />
                  </div>

                  <div>
                    <label
                      className="font-label-caps text-label-caps text-secondary uppercase tracking-widest block mb-2"
                      htmlFor="client-phone"
                    >
                      {t('servicesPage.formPhoneLabel')}
                    </label>
                    <input
                      id="client-phone"
                      name="phone"
                      type="text"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={t('servicesPage.formPhonePlaceholder')}
                      className="w-full bg-surface-container px-4 py-3.5 rounded text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface transition-all"
                    />
                  </div>

                  <div>
                    <label
                      className="font-label-caps text-label-caps text-secondary uppercase tracking-widest block mb-2"
                      htmlFor="service-select"
                    >
                      {t('servicesPage.formServiceLabel')}
                    </label>
                    <select
                      id="service-select"
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container px-4 py-3.5 rounded text-on-surface font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface transition-all cursor-pointer"
                    >
                      <option value="thai">{t('servicesPage.formOptionThai')}</option>
                      <option value="aroma">{t('servicesPage.formOptionAroma')}</option>
                      <option value="warm-oil">{t('servicesPage.formOptionWarmOil')}</option>
                      <option value="reflexology">
                        {t('servicesPage.formOptionReflexology')}
                      </option>
                      <option value="general">{t('servicesPage.formOptionGeneral')}</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="font-label-caps text-label-caps text-secondary uppercase tracking-widest block mb-2"
                      htmlFor="client-message"
                    >
                      {t('servicesPage.formMessageLabel')}
                    </label>
                    <textarea
                      id="client-message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={t('servicesPage.formMessagePlaceholder')}
                      className="w-full bg-surface-container px-4 py-3.5 rounded text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface transition-all resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="btn-lift w-full md:w-auto px-10 py-4 bg-primary-container text-warm-ivory rounded font-label-md text-label-md tracking-widest uppercase hover:bg-teak-deep transition-all duration-200 cursor-pointer shadow-sm"
                    >
                      {t('servicesPage.formSubmit')}
                    </button>
                  </div>

                  {submitted && (
                    <FadeIn
                      variant="fade"
                      duration={0.3}
                      className="p-4 rounded-lg bg-sand-warm/30 border border-sand-warm text-primary font-body-sm text-body-sm leading-relaxed"
                    >
                      ✓ {t('servicesPage.formSuccess')}
                    </FadeIn>
                  )}
                </form>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* Pre-Footer / Final CTA */}
        <section className="w-full max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
          <FadeIn className="max-w-2xl mx-auto space-y-6">
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">
              {t('servicesPage.ctaEyebrow')}
            </span>
            <h2 className="font-headline-lg text-headline-lg md:text-display text-on-surface font-normal">
              {t('servicesPage.ctaTitle')}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto leading-relaxed">
              {t('servicesPage.ctaDesc')}
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={() => onNavigate?.('booking')}
                className="btn-lift inline-flex items-center justify-center px-10 py-4 rounded-full bg-primary-container text-warm-ivory font-label-md text-label-md tracking-widest uppercase hover:bg-teak-deep transition-all duration-200 shadow-sm cursor-pointer"
              >
                {t('servicesPage.ctaButton')}
              </button>
            </div>
          </FadeIn>
        </section>
      </div>
    </main>
  )
}
