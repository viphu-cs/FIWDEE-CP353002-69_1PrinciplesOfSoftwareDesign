import { therapists } from '../../data/mock.js'

// Micro-interaction จากดีไซน์: การ์ดเอียงตามตำแหน่งเมาส์เบา ๆ
function handleTilt(event) {
  const card = event.currentTarget
  const rect = card.getBoundingClientRect()
  const x = event.clientX - rect.left - rect.width / 2
  const y = event.clientY - rect.top - rect.height / 2
  const rotateX = -(y / rect.height) * 6
  const rotateY = (x / rect.width) * 6
  card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`
}

function resetTilt(event) {
  event.currentTarget.style.transform = ''
}

export default function TherapistsSection() {
  return (
    <section className="w-full py-space-2xl bg-surface" id="therapists">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-xl">
          <div>
            <p className="font-label-md text-label-md uppercase text-terracotta-muted tracking-widest mb-space-xs">
              THERAPISTS
            </p>
            <h2 className="font-headline-lg text-headline-lg text-primary">หมอนวดของเรา</h2>
          </div>
          <p className="font-body-md text-body-md text-charcoal-muted mt-2 md:mt-0">
            เลือกคนที่เหมาะกับคุณ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {therapists.map((therapist) => (
            <article
              key={therapist.id}
              className="group cursor-pointer bg-linen-surface rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
              onMouseMove={handleTilt}
              onMouseLeave={resetTilt}
            >
              <div className="relative w-full aspect-[3/4] overflow-hidden bg-sand-warm">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={therapist.imageUrl}
                  alt={`หมอนวด ${therapist.nickname}`}
                />
              </div>
              <div className="p-space-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline justify-between mb-space-xs">
                    <h3 className="font-headline-sm text-headline-sm text-primary font-medium">
                      {therapist.nickname}
                    </h3>
                    <span className="font-label-lg text-label-lg text-terracotta-muted">
                      {therapist.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-charcoal-soft mb-1">
                    {therapist.specialties.join(' · ')}
                  </p>
                  <p className="font-body-sm text-body-sm text-charcoal-muted">
                    ประสบการณ์ {therapist.experienceYears} ปี
                  </p>
                </div>
                <div className="pt-space-md mt-space-sm flex items-center justify-between">
                  {/* TODO: เชื่อมกับหน้าโปรไฟล์หมอนวด /therapists/:id */}
                  <a
                    className="font-label-lg text-label-lg text-primary underline underline-offset-8 transition-colors duration-200 hover:text-secondary"
                    href="#therapists"
                  >
                    ดูโปรไฟล์
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-space-xl text-center">
          <a
            className="font-label-lg text-label-lg uppercase tracking-widest text-primary underline underline-offset-8 transition-colors duration-200 hover:text-secondary"
            href="#therapists"
          >
            ดูหมอนวดทั้งหมด
          </a>
        </div>
      </div>
    </section>
  )
}
