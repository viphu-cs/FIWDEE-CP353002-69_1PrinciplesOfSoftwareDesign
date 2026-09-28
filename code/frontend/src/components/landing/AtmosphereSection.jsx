import { images } from '../../data/mock.js'

export default function AtmosphereSection() {
  return (
    <section className="w-full py-space-2xl bg-surface overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-space-xl">
          <p className="font-label-md text-label-md uppercase text-terracotta-muted tracking-widest mb-space-xs">
            ATMOSPHERE
          </p>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-space-sm">
            ช่วงเวลาของคุณ เริ่มต้นที่นี่
          </h2>
          <p className="font-body-lg text-body-lg text-charcoal-muted">
            พื้นที่สำหรับการพักผ่อน สัมผัสความสงบและกลิ่นอายธรรมชาติในทุกสัมผัส
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-stretch">
          <div className="md:col-span-8 rounded-xl overflow-hidden bg-sand-warm min-h-[380px]">
            <img
              className="w-full h-full object-cover"
              src={images.atmosphere}
              alt="บรรยากาศร้านหวงไม้โค้ง เตี้ยเบา และมุมสงบริมสวน"
            />
          </div>
          <div className="md:col-span-4 flex flex-col justify-between p-space-xl bg-linen-surface rounded-xl">
            <div className="space-y-space-md">
              <p className="font-label-lg text-label-lg uppercase tracking-wider text-charcoal-muted">
                หัตถการ &amp; สมาธิ
              </p>
              <p className="font-headline-sm text-headline-sm text-primary leading-snug">
                ความเงียบสงบที่ตั้งใจสร้าง เพื่อให้จิตใจและร่างกายได้พักผ่อนอย่างแท้จริง
              </p>
            </div>
            <div className="pt-space-xl">
              <p className="font-body-sm text-body-sm text-charcoal-soft">
                กลิ่นหอมสกัดจากสมุนไพรท้องถิ่น ผ้าลินินธรรมชาติ และเสียงน้ำไหลเบาบาง
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
