import FadeIn from '../motion/FadeIn.jsx'
import { images, shop } from '../../data/mock.js'

export default function LocationSection() {
  return (
    <section className="w-full py-space-2xl bg-surface-container-low" id="location">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
          <FadeIn variant="left" amount={0.3} className="lg:col-span-5 space-y-space-md">
            <p className="font-label-md text-label-md uppercase text-terracotta-muted tracking-widest">
              LOCATION
            </p>
            <h2 className="font-headline-lg text-headline-lg text-primary">{shop.name} Massage</h2>
            <div className="space-y-2 pt-space-xs text-charcoal-soft">
              <p className="font-title-md text-title-md text-primary">{shop.city}</p>
              <p className="font-body-md text-body-md">{shop.address}</p>
              <p className="font-body-md text-body-md pt-space-sm text-charcoal-muted">
                {shop.openTime} — {shop.closeTime}
              </p>
              <p className="font-label-lg text-label-lg text-primary tracking-wide">เปิดบริการทุกวัน</p>
            </div>
          </FadeIn>

          {/* 🎬 แผนที่ zoom-reveal + hover เงา/ขอบเบา ๆ */}
          <FadeIn variant="scale" delay={0.15} amount={0.3} className="lg:col-span-7">
            <div
              className="card-lift w-full h-80 rounded-xl overflow-hidden shadow-sm bg-sand-warm flex items-center justify-center p-space-xl"
              style={{
                backgroundImage: `url("${images.map}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
              }}
            >
              <div className="bg-surface/90 backdrop-blur-md px-6 py-4 rounded-lg shadow-sm text-center transition-transform duration-300 ease-out hover:-translate-y-1">
                <p className="font-headline-sm text-headline-sm text-primary mb-1">
                  {shop.name} {shop.city}
                </p>
                <p className="font-body-sm text-body-sm text-charcoal-muted">
                  ใจกลางเมือง{shop.city} พร้อมที่จอดรถส่วนตัว
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
