import FadeIn from '../motion/FadeIn.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import { images } from '../../data/mock.js'

export default function AtmosphereSection() {
  const { t } = useLanguage()

  return (
    <section className="w-full py-space-2xl bg-surface overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn className="max-w-2xl mb-space-xl">
          <p className="font-label-md text-label-md uppercase text-terracotta-muted tracking-widest mb-space-xs">
            {t('atmosphere.label')}
          </p>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-space-sm">
            {t('atmosphere.title')}
          </h2>
          <p className="font-body-lg text-body-lg text-charcoal-muted">{t('atmosphere.subtitle')}</p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-stretch">
          {/* 🎬 รูปใหญ่ zoom-reveal + hover zoom เบา ๆ */}
          <FadeIn variant="scale" amount={0.2} className="md:col-span-8">
            <div className="card-lift group rounded-xl overflow-hidden bg-sand-warm min-h-[380px] h-full">
              <img
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                src={images.atmosphere}
                alt="บรรยากาศร้านหวงไม้โค้ง เตี้ยเบา และมุมสงบริมสวน"
                loading="lazy"
              />
            </div>
          </FadeIn>
          <FadeIn variant="right" delay={0.15} amount={0.3} className="md:col-span-4">
            <div className="card-highlight flex flex-col justify-between p-space-xl bg-linen-surface rounded-xl h-full">
              <div className="space-y-space-md">
                <p className="font-label-lg text-label-lg uppercase tracking-wider text-charcoal-muted">
                  {t('atmosphere.panelLabel')}
                </p>
                <p className="font-headline-sm text-headline-sm text-primary leading-snug">
                  {t('atmosphere.panelTitle')}
                </p>
              </div>
              <div className="pt-space-xl">
                <p className="font-body-sm text-body-sm text-charcoal-soft">
                  {t('atmosphere.panelDesc')}
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
