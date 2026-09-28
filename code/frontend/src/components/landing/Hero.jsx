import { images, shop } from '../../data/mock.js'

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden -mt-20">
      <div className="relative w-full h-[88vh] min-h-[640px] max-h-[880px]">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url("${images.hero}")` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-primary/30"></div>
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-6xl mx-auto w-full px-6 pb-space-2xl">
            <div className="max-w-2xl">
              <p className="font-label-lg text-label-lg uppercase text-charcoal-muted tracking-widest mb-space-sm">
                {shop.name} MASSAGE
              </p>
              <h1 className="font-display text-display text-primary leading-tight tracking-tight mb-space-md">
                เลือกหมอนวดที่ใช่
                <br />
                <span className="font-normal text-charcoal-soft">สำหรับช่วงเวลาของคุณ</span>
              </h1>
              <div className="pt-space-sm">
                {/* TODO: เชื่อมกับหน้า /booking เมื่อทำหน้าจองคิว */}
                <a
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-teak-dark text-warm-ivory font-label-lg text-label-lg uppercase tracking-wider hover:bg-teak-deep transition-all duration-300 shadow-md hover:shadow-xl"
                  href="#therapists"
                >
                  จองคิว
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
