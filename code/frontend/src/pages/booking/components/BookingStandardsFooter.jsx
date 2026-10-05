import React from 'react'

/**
 * BookingStandardsFooter - ส่วนล่างแสดงมาตรฐานบริการ 3 ข้อ (SRP: แสดงเฉพาะ Retreat Standards)
 */
export default function BookingStandardsFooter() {
  return (
    <section className="w-full bg-surface-container-high py-space-xl mt-space-xl">
      <div className="max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          <div className="space-y-space-xs">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-bold">
              STANDARD 01
            </span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-normal">
              ความเป็นส่วนตัวสูงสุด
            </h3>
            <p className="font-body-sm text-body-sm text-secondary">
              ทุกห้องทำหัตถการได้รับการออกแบบอย่างมิดชิด ป้องกันเสียงรบกวน พร้อมปรับอุณหภูมิและแสงสว่างเฉพาะบุคคล
            </p>
          </div>
          <div className="space-y-space-xs">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-bold">
              STANDARD 02
            </span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-normal">
              ชาเกสรบัวต้อนรับ
            </h3>
            <p className="font-body-sm text-body-sm text-secondary">
              สูตรชาสมุนไพรอุ่นปรุงสดเพื่อเตรียมความพร้อมร่างกายให้ผ่อนคลายและดูดซับคุณค่าแห่งการบำบัดอย่างเต็มที่
            </p>
          </div>
          <div className="space-y-space-xs">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-bold">
              STANDARD 03
            </span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-normal">
              สุขอนามัยระดับพรีเมียม
            </h3>
            <p className="font-body-sm text-body-sm text-secondary">
              ผ้าลินินแท้และอุปกรณ์สัมผัสทุกชิ้นผ่านการซักอบฆ่าเชื้อมาตรฐานเดียวกับโรงแรมระดับห้าดาวทุกรอบบริการ
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
