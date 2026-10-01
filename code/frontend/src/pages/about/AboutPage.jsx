import FadeIn from '../../components/motion/FadeIn.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'

export default function AboutPage({ onNavigate }) {
  const { t } = useLanguage()

  return (
    <main className="w-full pt-20 bg-surface min-h-[calc(100vh-80px)]">
      <div className="flex flex-col w-full">
        {/* Section 1: Editorial Introduction & Top-Left Back Button */}
        <section className="max-w-6xl mx-auto px-6 pt-8 md:pt-12 pb-space-lg w-full">
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
              <span>{t('aboutPage.backToHome')}</span>
            </button>
            <span className="text-charcoal-muted text-[11px] font-label-md">/</span>
            <span className="font-label-lg text-label-lg uppercase text-primary font-medium">
              {t('aboutPage.breadcrumbCurrent')}
            </span>
          </FadeIn>

          <FadeIn delay={0.08} className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <span className="font-label-caps text-label-caps uppercase tracking-[0.25em] text-terracotta-muted mb-space-sm">
              {t('aboutPage.eyebrow')}
            </span>
            <h1 className="font-headline-lg text-headline-lg md:text-display text-primary mb-space-md font-normal">
              {t('aboutPage.title')}
            </h1>
            <p className="font-body-lg text-body-lg text-charcoal-muted max-w-2xl font-light leading-relaxed">
              {t('aboutPage.desc')}
            </p>
          </FadeIn>
        </section>

        {/* Section 2: Philosophy Quote */}
        <section className="max-w-6xl mx-auto px-6 py-space-xl text-center w-full">
          <FadeIn delay={0.1} className="space-y-space-md max-w-4xl mx-auto">
            <p className="font-headline-md text-headline-md text-primary leading-relaxed md:leading-loose font-normal italic tracking-wide">
              {t('aboutPage.quote')}
            </p>
            <div className="font-label-md text-label-md uppercase tracking-[0.2em] text-charcoal-muted font-medium">
              {t('aboutPage.quoteAuthor')}
            </div>
          </FadeIn>
        </section>

        {/* Section 3: Architectural Sanctuary Visual & Story */}
        <section className="max-w-6xl mx-auto px-6 pb-space-xl w-full">
          <div className="flex flex-col gap-space-lg">
            <FadeIn delay={0.12} className="w-full overflow-hidden rounded-xl bg-surface-container-low shadow-sm group">
              <div
                className="bg-cover bg-center w-full h-[380px] sm:h-[480px] md:h-[620px] transition-transform duration-700 group-hover:scale-[1.01]"
                style={{ backgroundImage: `url('/images/about/sanctuary-courtyard.jpg')` }}
                role="img"
                aria-label={t('aboutPage.sanctuaryAlt')}
              />
            </FadeIn>

            <FadeIn delay={0.15} className="grid grid-cols-1 md:grid-cols-12 gap-space-md pt-space-xs">
              <div className="md:col-span-3">
                <span className="font-label-caps text-label-caps uppercase text-terracotta-muted tracking-[0.2em] block">
                  {t('aboutPage.sanctuaryLabel')}
                </span>
                <span className="font-body-sm text-body-sm text-secondary block mt-1">
                  {t('aboutPage.sanctuaryLocation')}
                </span>
              </div>
              <div className="md:col-span-9">
                <p className="font-body-lg text-body-lg text-charcoal-soft leading-relaxed font-light">
                  {t('aboutPage.sanctuaryStory')}
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Section 4: Contact & Details */}
        <section className="w-full bg-surface-container-low py-space-xl">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
              {/* Left: Contact Details */}
              <FadeIn className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <span className="font-label-caps text-label-caps uppercase text-terracotta-muted tracking-[0.2em] block mb-space-xs">
                    {t('aboutPage.contactEyebrow')}
                  </span>
                  <h2 className="font-headline-md text-headline-md text-primary mb-space-lg font-normal">
                    {t('aboutPage.contactTitle')}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-lg">
                    <div className="space-y-space-sm">
                      <div>
                        <span className="font-label-caps text-label-caps uppercase text-charcoal-muted tracking-wider block mb-1">
                          {t('aboutPage.branchLabel')}
                        </span>
                        <p className="font-body-md text-body-md text-primary font-medium">
                          {t('aboutPage.branchName')}
                        </p>
                        <p className="font-body-sm text-body-sm text-charcoal-muted font-light mt-1 leading-relaxed">
                          {t('aboutPage.branchAddressLine1')}
                          <br />
                          {t('aboutPage.branchAddressLine2')}
                        </p>
                      </div>

                      <div className="pt-space-xs">
                        <span className="font-label-caps text-label-caps uppercase text-charcoal-muted tracking-wider block mb-1">
                          {t('aboutPage.hoursLabel')}
                        </span>
                        <p className="font-body-md text-body-md text-primary">
                          {t('aboutPage.hoursValue')}
                        </p>
                        <p className="font-body-sm text-body-sm text-secondary font-light mt-0.5">
                          {t('aboutPage.hoursNote')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-space-sm">
                      <div>
                        <span className="font-label-caps text-label-caps uppercase text-charcoal-muted tracking-wider block mb-1">
                          {t('aboutPage.phoneLabel')}
                        </span>
                        <p className="font-body-md text-body-md text-primary font-medium">
                          <a href="tel:043241890" className="hover:text-secondary transition-colors block">
                            {t('aboutPage.phone1')}
                          </a>
                          <a href="tel:0812345678" className="hover:text-secondary transition-colors block">
                            {t('aboutPage.phone2')}
                          </a>
                        </p>
                      </div>

                      <div className="pt-space-xs">
                        <span className="font-label-caps text-label-caps uppercase text-charcoal-muted tracking-wider block mb-1">
                          {t('aboutPage.onlineChannelsLabel')}
                        </span>
                        <p className="font-body-sm text-body-sm text-charcoal-soft">
                          <span className="text-secondary font-light">LINE:</span> {t('aboutPage.line')}
                        </p>
                        <p className="font-body-sm text-body-sm text-charcoal-soft">
                          <span className="text-secondary font-light">Instagram:</span> {t('aboutPage.ig')}
                        </p>
                        <p className="font-body-sm text-body-sm text-charcoal-soft">
                          <span className="text-secondary font-light">Facebook:</span> {t('aboutPage.fb')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Right: Inquiry & Arrival Note Card */}
              <FadeIn delay={0.1} className="lg:col-span-5 flex flex-col justify-center">
                <div className="bg-surface p-space-lg rounded-xl shadow-xs flex flex-col justify-between h-full border border-sand-warm/30">
                  <div>
                    <span className="font-label-caps text-label-caps uppercase text-secondary tracking-[0.2em] block mb-space-xs">
                      {t('aboutPage.guestProtocolEyebrow')}
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-primary mb-space-sm font-normal">
                      {t('aboutPage.guestProtocolTitle')}
                    </h3>
                    <p className="font-body-md text-body-md text-charcoal-muted font-light leading-relaxed mb-space-md">
                      {t('aboutPage.guestProtocolDesc')}
                    </p>
                  </div>
                  <div className="pt-space-md">
                    <button
                      type="button"
                      onClick={() => onNavigate?.('booking')}
                      className="btn-lift inline-flex items-center justify-center w-full py-3.5 px-6 rounded-full bg-primary-container text-warm-ivory font-label-md text-label-md uppercase tracking-widest hover:bg-teak-deep transition-all duration-200 shadow-sm cursor-pointer"
                    >
                      {t('aboutPage.guestProtocolButton')}
                    </button>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Section 5: Location & Map */}
        <section className="max-w-6xl mx-auto px-6 py-space-xl w-full">
          <FadeIn className="flex flex-col gap-space-md mb-space-md">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-xs">
              <div>
                <span className="font-label-caps text-label-caps uppercase text-terracotta-muted tracking-[0.2em] block mb-1">
                  {t('aboutPage.directionsEyebrow')}
                </span>
                <h2 className="font-headline-md text-headline-md text-primary font-normal">
                  {t('aboutPage.directionsTitle')}
                </h2>
              </div>
              <p className="font-body-sm text-body-sm text-secondary font-light">
                {t('aboutPage.directionsDesc')}
              </p>
            </div>
          </FadeIn>

          {/* Map Container */}
          <FadeIn delay={0.1} className="w-full rounded-xl overflow-hidden relative shadow-sm">
            <div
              className="w-full h-80 md:h-96 bg-cover bg-center"
              style={{ backgroundImage: `url('/images/about/map-location.jpg')` }}
              role="img"
              aria-label="FIWDEE Khon Kaen Location Map"
            />
            <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-md bg-surface/95 backdrop-blur-md p-space-md rounded-lg shadow-sm border border-sand-warm/30">
              <span className="font-label-caps text-label-caps uppercase text-primary tracking-widest block mb-1">
                {t('aboutPage.gpsEyebrow')}
              </span>
              <p className="font-body-sm text-body-sm text-primary font-medium">
                {t('aboutPage.gpsValue')}
              </p>
              <p className="font-body-sm text-body-sm text-charcoal-muted font-light mt-1">
                {t('aboutPage.gpsNote')}
              </p>
            </div>
          </FadeIn>
        </section>

        {/* Section 6: Final CTA Section */}
        <section className="w-full bg-secondary-container/30 py-space-xl my-space-lg">
          <FadeIn className="max-w-6xl mx-auto px-6 text-center flex flex-col items-center">
            <span className="font-label-caps text-label-caps uppercase text-terracotta-muted tracking-[0.25em] mb-space-xs">
              {t('aboutPage.ctaEyebrow')}
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary font-normal mb-space-md">
              {t('aboutPage.ctaTitle')}
            </h2>
            <p className="font-body-md text-body-md text-charcoal-muted font-light mb-space-lg max-w-lg leading-relaxed">
              {t('aboutPage.ctaDesc')}
            </p>
            <button
              type="button"
              onClick={() => onNavigate?.('booking')}
              className="btn-lift inline-flex items-center justify-center px-10 py-3.5 rounded-full bg-primary-container text-warm-ivory font-label-md text-label-md uppercase tracking-widest hover:bg-teak-deep transition-all duration-200 shadow-sm cursor-pointer"
            >
              {t('aboutPage.ctaButton')}
            </button>
          </FadeIn>
        </section>
      </div>
    </main>
  )
}
