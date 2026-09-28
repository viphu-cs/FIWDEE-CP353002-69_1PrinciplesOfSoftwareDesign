import { images, services } from '../../data/mock.js'

export default function ServicesSection() {
  return (
    <section className="w-full py-space-2xl bg-surface-container-low" id="services">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-space-xl">
          <p className="font-label-md text-label-md uppercase text-terracotta-muted tracking-widest mb-space-xs">
            SANCTUARY MENU
          </p>
          <h2 className="font-headline-lg text-headline-lg text-primary">บริการ</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
          <div className="lg:col-span-6">
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-sand-warm shadow-md">
              <img
                className="w-full h-full object-cover"
                src={images.serviceRoom}
                alt="ห้องนวดส่วนตัวสไตล์มินิมอลพร้อมเตียงไม้สักและผ้าลินินสีขาว"
              />
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-center space-y-space-lg">
            {services.map((service) => {
              const prices = service.durationOptions.map((option) => option.price.toLocaleString('th-TH'))
              return (
                <div
                  key={service.id}
                  className="p-space-lg bg-linen-surface rounded-xl transition-colors duration-200 hover:bg-surface-container-highest"
                >
                  <div className="flex items-baseline justify-between mb-space-xs">
                    <h3 className="font-headline-sm text-headline-sm text-primary">{service.nameTh}</h3>
                    <div className="text-right">
                      <span className="font-body-md text-body-md text-teak-dark font-medium">
                        {prices.join(' / ')}
                      </span>
                      <span className="font-body-sm text-body-sm text-charcoal-muted ml-1">บาท</span>
                    </div>
                  </div>
                  <p className="font-body-sm text-body-sm text-charcoal-muted">{service.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
