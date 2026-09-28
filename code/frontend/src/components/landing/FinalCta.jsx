import FadeIn from '../motion/FadeIn.jsx'

export default function FinalCta() {
  return (
    <section className="w-full py-space-2xl bg-surface text-center">
      <div className="max-w-6xl mx-auto px-6 py-space-xl">
        <div className="max-w-3xl mx-auto">
          {/* 🎬 หัวข้อขึ้นก่อน ปุ่มตามมา (stagger) */}
          <FadeIn>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-space-md">
              พร้อมพักแล้วหรือยัง?
            </h2>
          </FadeIn>
          <FadeIn delay={0.18} className="pt-space-xs">
            {/* TODO: เชื่อมกับหน้า /booking เมื่อทำหน้าจองคิว */}
            <a
              href="#therapists"
              className="btn-lift inline-flex items-center justify-center px-10 py-3.5 rounded-full bg-teak-dark text-warm-ivory font-label-lg text-label-lg uppercase tracking-wider hover:bg-teak-deep shadow-md cursor-pointer"
            >
              จองคิว
            </a>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
