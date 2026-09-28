import FadeIn from '../motion/FadeIn.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import { images, services } from '../../data/mock.js'

export default function ServicesSection() {
  const { t } = useLanguage()

  return (
    <section className="w-full py-space-2xl bg-surface-container-low" id="services">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn className="mb-space-xl">
          <p className="font-label-md text-label-md uppercase text-terracotta-muted tracking-widest mb-space-xs">
            {t('services.label')}
          </p>
          <h2 className="font-headline-lg text-headline-lg text-primary">{t('services.title')}</h2>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
          {/* 🎬 Reveal จากซ้าย + รูป zoom เบา ๆ เมื่อ hover */}
          <FadeIn variant="left" amount={0.3} className="lg:col-span-6">
            <div className="card-lift group w-full aspect-[4/3] rounded-xl overflow-hidden bg-sand-warm shadow-md">
              <img
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                src={images.serviceRoom}
                alt="ห้องนวดส่วนตัวสไตล์มินิมอลพร้อมเตียงไม้สักและผ้าลินินสีขาว"
                loading="lazy"
              />
            </div>
          </FadeIn>

          <div className="lg:col-span-6 flex flex-col justify-center space-y-space-lg">
            {/* 🎬 แถวราคาไล่เข้าจากขวาทีละแถว + hover ยกตัวเบา ๆ */}
            {services.map((service, index) => (
              <FadeIn key={service.id} variant="right" delay={0.1 + index * 0.1} amount={0.4}>
                <div className="card-lift p-space-lg bg-linen-surface rounded-xl">
                  <div className="flex items-baseline justify-between mb-space-xs">
                    <h3 className="font-headline-sm text-headline-sm text-primary">
                      {t(`services.items.${service.id}.name`)}
                    </h3>
                    <div className="text-right">
                      <span className="font-body-md text-body-md text-teak-dark font-medium">
                        {service.durationOptions
                          .map((option) => option.price.toLocaleString('th-TH'))
                          .join(' / ')}
                      </span>
                      <span className="font-body-sm text-body-sm text-charcoal-muted ml-1">
                        {t('services.baht')}
                      </span>
                    </div>
                  </div>
                  <p className="font-body-sm text-body-sm text-charcoal-muted">
                    {service.durationOptions
                      .map((option) =>
                        t('services.durationPrice', {
                          min: option.durationMinutes,
                          price: option.price.toLocaleString('th-TH'),
                        }),
                      )
                      .join(' / ')}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
