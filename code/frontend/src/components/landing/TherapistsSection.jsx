import FadeIn from '../motion/FadeIn.jsx'
import { therapists } from '../../data/mock.js'

// 🎬 Micro-interaction: การ์ดเอียงตามตำแหน่งเมาส์ (เขียน transform ตรงทุก mousemove —
// เรียลไทม์ 1:1 ไม่มี transition ค้าง จึงลื่นไม่แลค) / เงา+ขอบจัดการโดย .card-highlight แยกกัน
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
        {/* 🎬 Reveal: หัวข้อปรากฏก่อน แล้วการ์ดไล่ตามทีละใบ */}
        <FadeIn className="flex flex-col md:flex-row md:items-end justify-between mb-space-xl">
          <div>
            <p className="font-label-md text-label-md uppercase text-terracotta-muted tracking-widest mb-space-xs">
              THERAPISTS
            </p>
            <h2 className="font-headline-lg text-headline-lg text-primary">หมอนวดของเรา</h2>
          </div>
          <p className="font-body-md text-body-md text-charcoal-muted mt-2 md:mt-0">
            เลือกคนที่เหมาะกับคุณ
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {therapists.map((therapist, index) => (
            <FadeIn key={therapist.id} delay={0.12 + index * 0.14} variant="up">
              <article
                className="card-highlight group cursor-pointer bg-linen-surface rounded-xl overflow-hidden"
                onMouseMove={handleTilt}
                onMouseLeave={resetTilt}
              >
                {/* 🎬 รูป zoom ช้า ๆ เมื่อ hover การ์ด (CSS group-hover, GPU) */}
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-sand-warm">
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
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
                      <span className="font-label-lg text-label-lg text-terracotta-muted transition-transform duration-200 group-hover:-translate-y-0.5">
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
                    {/* 🎬 ลิงก์: เส้นใต้วาดจากซ้ายเมื่อ hover */}
                    <a
                      className="link-underline font-label-lg text-label-lg text-primary transition-colors duration-200 hover:text-secondary"
                      href="#therapists"
                    >
                      ดูโปรไฟล์
                    </a>
                  </div>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.25} className="mt-space-xl text-center">
          {/* TODO: เชื่อมกับหน้า /therapists เมื่อทำหน้ารวมหมอนวด */}
          <a
            className="link-underline font-label-lg text-label-lg uppercase tracking-widest text-primary transition-colors duration-200 hover:text-secondary"
            href="#therapists"
          >
            ดูหมอนวดทั้งหมด
          </a>
        </FadeIn>
      </div>
    </section>
  )
}
