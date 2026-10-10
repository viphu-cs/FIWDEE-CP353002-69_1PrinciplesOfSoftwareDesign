import React from 'react'
import { useLanguage } from '../../../i18n/useLanguage.js'

/**
 * BookingStepSlot - ขั้นตอนที่ 2: เลือกวันและช่วงเวลา และปรับแต่งความต้องการ (SRP: จัดการเฉพาะ Step 2 UI)
 */
export default function BookingStepSlot({
  dateOptions,
  timeSlots,
  selectedDate,
  setSelectedDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
  pressureLevel,
  setPressureLevel,
  specialNotes,
  setSpecialNotes,
  selectedService,
  selectedTherapist,
  activeService,
  onPrev,
  onNext,
}) {
  const { t } = useLanguage()

  return (
    <>
      <section className="w-full bg-surface">
        <div className="max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop pt-6 md:pt-8 pb-space-md">
          {/* Top Back Navigation */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <button
              type="button"
              onClick={onPrev}
              className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors duration-200 font-label-md text-label-md uppercase cursor-pointer py-1 group"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:-translate-x-1"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>ย้อนกลับไปขั้นตอนที่ 1</span>
            </button>
          </div>

          <div className="max-w-2xl">
            <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest block mb-space-xs">
              นัดหมายการผ่อนคลาย
            </span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-normal tracking-tight">
              เลือกวันและช่วงเวลา
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              ระบุวัน เวลา และข้อมูลเพื่อจัดเตรียมห้องทรีตเมนต์ส่วนตัวสำหรับท่าน เพื่อความสุนทรีย์ที่สมบูรณ์แบบ
            </p>
          </div>
        </div>
      </section>

      <section className="w-full bg-surface pb-space-xl">
        <div className="max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg lg:gap-gutter-desktop items-start">
            {/* Left Panel: 7 Cols */}
            <div className="lg:col-span-7 space-y-space-xl">
              {/* Section 1: Date Selection */}
              <div className="space-y-space-sm">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-normal">
                    1. วันที่รับบริการ
                  </h2>
                  <span className="font-label-caps text-label-caps uppercase text-secondary">
                    {selectedDate?.monthYearHeader || 'ปฏิทินการจอง'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-primary-container/30 border border-primary/20 rounded-lg text-xs text-primary font-body-sm">
                  <span className="material-symbols-outlined text-sm shrink-0">info</span>
                  <span>{t('bookingWizard.advanceBookingNotice')}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-space-xs pt-space-xs">
                  {dateOptions.map((dateTab) => {
                    const isActive = selectedDate.id === dateTab.id
                    return (
                      <button
                        key={dateTab.id}
                        type="button"
                        onClick={() => setSelectedDate(dateTab)}
                        className={`p-space-sm text-left rounded-lg transition-all cursor-pointer ${
                          isActive
                            ? 'bg-on-surface text-surface'
                            : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                        }`}
                      >
                        <span
                          className={`font-label-caps text-label-caps uppercase block ${
                            isActive ? 'text-surface opacity-75' : 'text-secondary'
                          }`}
                        >
                          {dateTab.label}
                        </span>
                        <span
                          className={`font-headline-sm text-headline-sm block mt-space-xs ${
                            isActive ? 'text-surface' : 'text-on-surface'
                          }`}
                        >
                          {dateTab.dayNum}
                        </span>
                        <span
                          className={`font-body-sm text-body-sm block ${
                            isActive ? 'text-surface opacity-90' : 'text-secondary'
                          }`}
                        >
                          {dateTab.dayName}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Section 2: Flexible Timeline Bar & Time Slots */}
              <div className="space-y-space-sm">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-normal">
                    2. กำหนดเวลาบนไทม์ไลน์ (ก้าวละ 30 นาที)
                  </h2>
                  <span className="font-body-sm text-body-sm text-secondary">
                    ระยะเวลาบำบัด {activeService.duration}
                  </span>
                </div>

                {/* Timeline Active Duration Strip Indicator */}
                <div className="p-3.5 bg-surface-container-low/80 border border-outline-variant/40 rounded-xl space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-on-surface">
                      <span className="material-symbols-outlined text-base text-primary">timelapse</span>
                      <span className="font-semibold">ช่วงเวลาที่เลือก:</span>
                      <span className="font-mono text-primary font-bold text-sm">
                        {selectedTimeSlot?.time} - {selectedTimeSlot?.endTime ? String(selectedTimeSlot.endTime).slice(0, 5) : '—'} น.
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-secondary">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span> ว่าง
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-surface-container-high border border-outline-variant inline-block"></span> ไม่ว่าง/ติดจอง
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-primary">cleaning_services</span> พักทำความสะอาด 15 น.
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar representing the service flow */}
                  <div className="w-full bg-surface-container rounded-lg p-2.5 flex items-center justify-between text-xs text-secondary border border-outline-variant/30">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary text-sm">{selectedTimeSlot?.time} น.</span>
                      <span className="text-[11px] text-secondary">เริ่มบริการ</span>
                    </div>
                    <div className="flex-1 mx-4 flex items-center">
                      <div className="h-2 w-full bg-primary/25 rounded-full relative overflow-hidden">
                        <div className="h-full bg-primary w-full rounded-full"></div>
                      </div>
                      <span className="ml-2 text-[11px] font-medium text-primary whitespace-nowrap">
                        {activeService.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-secondary">เสร็จสิ้น</span>
                      <span className="font-mono font-bold text-on-surface text-sm">
                        {selectedTimeSlot?.endTime ? String(selectedTimeSlot.endTime).slice(0, 5) : '—'} น.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Day Part Timeline Segments */}
                <div className="space-y-4 pt-2">
                  {/* เช้า */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-wider">
                      <span className="material-symbols-outlined text-sm">light_mode</span>
                      <span>ช่วงเช้า (10:00 - 12:30 น.)</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {timeSlots.filter(s => parseInt(s.time.split(':')[0], 10) < 13).map((slot) => {
                        const isSelected = selectedTimeSlot?.time === slot.time
                        if (!slot.available) {
                          return (
                            <div key={slot.time} className="px-3 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-high/40 opacity-45 cursor-not-allowed select-none text-left">
                              <div className="flex items-baseline justify-between">
                                <span className="font-headline-sm text-sm text-secondary line-through">{slot.time}</span>
                                <span className="text-[10px] text-error font-medium">ไม่ว่าง</span>
                              </div>
                              <span className="text-[10px] text-secondary truncate block mt-0.5">{slot.label || 'คิวเต็ม'}</span>
                            </div>
                          )
                        }
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-primary text-on-primary border-primary shadow-md ring-2 ring-primary ring-offset-2 ring-offset-surface'
                                : 'bg-surface-container-low hover:bg-surface-container border-outline-variant/40 hover:border-primary/50 text-on-surface'
                            }`}
                          >
                            <div className="flex items-baseline justify-between">
                              <span className="font-headline-sm text-base font-medium">{slot.time}</span>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isSelected ? 'bg-on-primary/20 text-on-primary' : 'bg-emerald-500/10 text-emerald-800'}`}>
                                {isSelected ? 'เลือกแล้ว' : 'ว่าง'}
                              </span>
                            </div>
                            <div className={`text-[11px] mt-1 font-mono flex items-center gap-1 ${isSelected ? 'text-surface/85' : 'text-secondary'}`}>
                              <span className="material-symbols-outlined text-xs">schedule</span>
                              <span>ถึง {slot.endTime ? String(slot.endTime).slice(0, 5) : '—'} น.</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* บ่าย */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-wider">
                      <span className="material-symbols-outlined text-sm">sunny</span>
                      <span>ช่วงบ่าย (13:00 - 16:30 น.)</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {timeSlots.filter(s => {
                        const h = parseInt(s.time.split(':')[0], 10)
                        return h >= 13 && h < 17
                      }).map((slot) => {
                        const isSelected = selectedTimeSlot?.time === slot.time
                        if (!slot.available) {
                          return (
                            <div key={slot.time} className="px-3 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-high/40 opacity-45 cursor-not-allowed select-none text-left">
                              <div className="flex items-baseline justify-between">
                                <span className="font-headline-sm text-sm text-secondary line-through">{slot.time}</span>
                                <span className="text-[10px] text-error font-medium">ไม่ว่าง</span>
                              </div>
                              <span className="text-[10px] text-secondary truncate block mt-0.5">{slot.label || 'คิวเต็ม'}</span>
                            </div>
                          )
                        }
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-primary text-on-primary border-primary shadow-md ring-2 ring-primary ring-offset-2 ring-offset-surface'
                                : 'bg-surface-container-low hover:bg-surface-container border-outline-variant/40 hover:border-primary/50 text-on-surface'
                            }`}
                          >
                            <div className="flex items-baseline justify-between">
                              <span className="font-headline-sm text-base font-medium">{slot.time}</span>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isSelected ? 'bg-on-primary/20 text-on-primary' : 'bg-emerald-500/10 text-emerald-800'}`}>
                                {isSelected ? 'เลือกแล้ว' : 'ว่าง'}
                              </span>
                            </div>
                            <div className={`text-[11px] mt-1 font-mono flex items-center gap-1 ${isSelected ? 'text-surface/85' : 'text-secondary'}`}>
                              <span className="material-symbols-outlined text-xs">schedule</span>
                              <span>ถึง {slot.endTime ? String(slot.endTime).slice(0, 5) : '—'} น.</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* เย็น */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-wider">
                      <span className="material-symbols-outlined text-sm">nights_stay</span>
                      <span>ช่วงเย็น - ค่ำ (17:00 - 20:00 น.)</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {timeSlots.filter(s => parseInt(s.time.split(':')[0], 10) >= 17).map((slot) => {
                        const isSelected = selectedTimeSlot?.time === slot.time
                        if (!slot.available) {
                          return (
                            <div key={slot.time} className="px-3 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-high/40 opacity-45 cursor-not-allowed select-none text-left">
                              <div className="flex items-baseline justify-between">
                                <span className="font-headline-sm text-sm text-secondary line-through">{slot.time}</span>
                                <span className="text-[10px] text-error font-medium">ไม่ว่าง</span>
                              </div>
                              <span className="text-[10px] text-secondary truncate block mt-0.5">{slot.label || 'คิวเต็ม'}</span>
                            </div>
                          )
                        }
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-primary text-on-primary border-primary shadow-md ring-2 ring-primary ring-offset-2 ring-offset-surface'
                                : 'bg-surface-container-low hover:bg-surface-container border-outline-variant/40 hover:border-primary/50 text-on-surface'
                            }`}
                          >
                            <div className="flex items-baseline justify-between">
                              <span className="font-headline-sm text-base font-medium">{slot.time}</span>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isSelected ? 'bg-on-primary/20 text-on-primary' : 'bg-emerald-500/10 text-emerald-800'}`}>
                                {isSelected ? 'เลือกแล้ว' : 'ว่าง'}
                              </span>
                            </div>
                            <div className={`text-[11px] mt-1 font-mono flex items-center gap-1 ${isSelected ? 'text-surface/85' : 'text-secondary'}`}>
                              <span className="material-symbols-outlined text-xs">schedule</span>
                              <span>ถึง {slot.endTime ? String(slot.endTime).slice(0, 5) : '—'} น.</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Customization (Personal Touch) - Direct from Login account */}
              <div className="space-y-space-md pt-space-sm border-t border-surface-container">
                <div className="flex items-baseline justify-between">
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-normal">
                      3. ความต้องการเฉพาะบุคคล (Personal Touch)
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      ปรับแต่งระดับน้ำหนักและบริเวณที่ต้องการเน้นพิเศษ เพื่อการบำบัดที่ตรงจุดและผ่อนคลายลึกซึ้ง
                    </p>
                  </div>
                  <span className="font-label-caps text-label-caps uppercase text-secondary tracking-wider hidden sm:inline-block">
                    Personal Touch
                  </span>
                </div>

                <div className="space-y-space-md bg-surface-container-low/40 p-space-md rounded-lg">

                  <div className="space-y-space-xs pt-1 border-t border-surface-container/60">
                    <label className="font-label-caps text-label-caps uppercase text-secondary block">
                      ระดับน้ำหนักการนวดที่ต้องการ
                    </label>
                    <div className="grid grid-cols-3 gap-space-xs">
                      {['เบา นุ่มนวล', 'ปานกลาง (แนะนำ)', 'หนัก คลายเส้น'].map((lvl) => {
                        const isSelectedLvl = pressureLevel === lvl
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setPressureLevel(lvl)}
                            className={`py-3 px-2 text-center rounded font-label-md text-label-md transition-colors cursor-pointer ${
                              isSelectedLvl
                                ? 'bg-on-surface text-surface'
                                : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                            }`}
                          >
                            {lvl === 'ปานกลาง (แนะนำ)' ? (
                              <span>
                                ปานกลาง{' '}
                                <span className="text-[0.7rem] block opacity-80">(แนะนำ)</span>
                              </span>
                            ) : (
                              lvl
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-space-xs">
                    <label
                      className="font-label-caps text-label-caps uppercase text-secondary block"
                      htmlFor="special-notes"
                    >
                      อาการตึงเมื่อยหรือบริเวณที่ต้องการเน้นพิเศษ (ถ้ามี)
                    </label>
                    <textarea
                      className="w-full bg-surface text-on-surface font-body-md text-body-md p-4 rounded focus:outline-none focus:bg-surface-container-highest transition-colors resize-none border border-outline-variant/30"
                      id="special-notes"
                      rows={3}
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      placeholder="เช่น เน้นบ่า สะบัก หรือหลีกเลี่ยงบริเวณใดเป็นพิเศษ..."
                    />
                  </div>
                </div>
              </div>

              {/* Back Action */}
              <div className="pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
                <button
                  type="button"
                  onClick={onPrev}
                  className="font-label-md text-label-md text-secondary hover:text-primary transition-colors underline underline-offset-4 decoration-outline-variant flex items-center gap-space-xs cursor-pointer"
                >
                  ← ย้อนกลับไปเลือกบริการ
                </button>
              </div>
            </div>

            {/* Right Panel: 5 Cols */}
            <div className="lg:col-span-5 sticky top-24 space-y-space-md">
              <div className="bg-surface-container-low rounded-lg p-space-lg space-y-space-md shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest block">
                      สรุปการนัดหมาย
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-normal mt-0.5">
                      สาขาขอนแก่น
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 bg-surface-container text-on-surface-variant font-label-caps text-label-caps rounded uppercase">
                    ห้องส่วนตัว
                  </span>
                </div>

                <div className="p-space-sm bg-surface rounded space-y-space-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="font-headline-sm text-headline-sm text-primary font-normal">
                      {selectedService.name}
                    </span>
                    <span className="font-label-caps text-label-caps text-secondary">
                      {activeService.duration}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {selectedService.desc}
                  </p>
                </div>

                {/* Therapist Context */}
                <div className="space-y-space-sm pt-space-xs">
                  <div className="flex items-center gap-space-md">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-highest shrink-0">
                      {selectedTherapist?.isConcierge ? (
                        <div className="w-full h-full bg-secondary-container flex items-center justify-center text-primary font-bold">
                          F
                        </div>
                      ) : (
                        <img
                          className="w-full h-full object-cover"
                          src={selectedTherapist?.avatar || selectedTherapist?.image || '/images/booking/therapist-mali.jpg'}
                          alt={selectedTherapist?.name || 'Therapist'}
                        />
                      )}
                    </div>
                    <div>
                      <span className="font-label-caps text-label-caps uppercase text-secondary block">
                        ผู้บำบัดที่ท่านเลือก
                      </span>
                      <span className="font-headline-sm text-headline-sm text-on-surface font-normal">
                        {selectedTherapist?.shortName || selectedTherapist?.name || 'ให้ร้านจัดสรรให้'}
                      </span>
                      <span className="font-body-sm text-body-sm text-tertiary block">
                        {selectedTherapist?.avatarExp || selectedTherapist?.exp || 'รับรองมาตรฐานวิชาชีพ'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Appointment Data Points */}
                <div className="space-y-space-xs py-space-xs bg-surface-container-lowest/60 p-space-sm rounded">
                  <div className="flex justify-between py-1">
                    <span className="font-body-sm text-body-sm text-secondary">วันที่นัดหมาย:</span>
                    <span className="font-label-md text-label-md text-on-surface font-medium">
                      {selectedDate?.fullText || selectedDate?.label || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-body-sm text-body-sm text-secondary">ช่วงเวลา:</span>
                    <span className="font-label-md text-label-md text-primary font-medium">
                      {selectedTimeSlot?.timeRange || selectedTimeSlot?.time || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-body-sm text-body-sm text-secondary">ห้องทรีตเมนต์:</span>
                    <span className="font-label-md text-label-md text-on-surface font-medium">
                      Private Suite (ชั้น 2)
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-body-sm text-body-sm text-secondary">น้ำหนักนวด:</span>
                    <span className="font-label-md text-label-md text-on-surface font-medium">
                      {pressureLevel}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="pt-space-sm space-y-space-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="font-label-caps text-label-caps uppercase text-secondary">
                      ยอดรวมสุทธิ
                    </span>
                    <div className="text-right">
                      <span className="font-display-mobile text-display-mobile text-on-surface font-normal">
                        {activeService.price}
                      </span>
                      <span className="font-body-sm text-body-sm text-secondary block">
                        ราคารวมภาษีมูลค่าเพิ่มและอุปกรณ์แล้ว
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-space-sm bg-surface-container rounded text-on-surface-variant font-body-sm text-body-sm leading-relaxed">
                  <span className="font-label-caps text-label-caps uppercase text-on-surface block mb-1">
                    นโยบายความยืดหยุ่น
                  </span>
                  ท่านสามารถเปลี่ยนแปลงรอบเวลาหรือยกเลิกการจองได้ล่วงหน้าอย่างน้อย 4 ชั่วโมง โดยไม่มีค่าธรรมเนียมใดๆ
                </div>
              </div>

              <button
                type="button"
                onClick={onNext}
                className="w-full py-3.5 px-8 bg-primary text-surface font-label-md text-label-md tracking-wider rounded hover:opacity-90 active:scale-[0.99] transition-all text-center shadow-sm cursor-pointer"
              >
                ถัดไป: ชำระเงินและยืนยัน
              </button>

              <div className="relative rounded-lg overflow-hidden bg-surface-container-high h-44 shadow-sm">
                <img
                  className="w-full h-full object-cover"
                  alt="Minimalist luxury Thai spa treatment room"
                  src="/images/booking/suite-room-03.jpg"
                />
                <div className="absolute inset-0 bg-on-background/20 mix-blend-multiply"></div>
                <div className="absolute bottom-3 left-4 text-surface font-label-caps text-label-caps uppercase tracking-wider drop-shadow-sm">
                  Private Suite 03 · สงบ ปลอดโปร่ง เป็นส่วนตัว
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
