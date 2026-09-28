export default function FinalCta() {
  return (
    <section className="w-full py-space-2xl bg-surface text-center">
      <div className="max-w-6xl mx-auto px-6 py-space-xl">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-space-md">
            พร้อมพักแล้วหรือยัง?
          </h2>
          <div className="pt-space-xs">
            {/* TODO: เชื่อมกับหน้า /booking เมื่อทำหน้าจองคิว */}
            <a
              className="inline-flex items-center justify-center px-10 py-3.5 rounded-full bg-teak-dark text-warm-ivory font-label-lg text-label-lg uppercase tracking-wider hover:bg-teak-deep transition-all duration-300 shadow-md hover:shadow-xl"
              href="#therapists"
            >
              จองคิว
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
