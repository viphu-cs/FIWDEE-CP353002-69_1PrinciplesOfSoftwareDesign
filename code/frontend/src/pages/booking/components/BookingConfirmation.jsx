import React from 'react'

/**
 * BookingConfirmation - หน้าจอยืนยันการจองสำเร็จ (SRP: จัดการเฉพาะ Confirmation UI)
 */
export default function BookingConfirmation({
  bookingRef,
  recipientName,
  recipientPhone,
  selectedTherapist,
  selectedService,
  activeService,
  selectedDate,
  selectedTimeSlot,
  onNavigate,
  onResetBooking,
}) {
  return (
    <section className="w-full py-space-xl min-h-[60vh] flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 text-center space-y-space-md">
        <div className="w-20 h-20 rounded-full bg-secondary-container text-primary mx-auto flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-4xl">check_circle</span>
        </div>
        <div className="space-y-1">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-bold">
            RESERVATION CONFIRMED
          </span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-normal">
            ยืนยันการจองคิวบำบัดสำเร็จ
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mx-auto">
            ระบบได้บันทึกการนัดหมายและส่ง SMS / LINE ยืนยันรหัสเข้าห้องรับรองส่วนตัวของท่านแล้ว
          </p>
        </div>

        <div className="p-space-lg bg-surface-container-low rounded-lg text-left space-y-space-sm border border-outline-variant/40">
          <div className="flex justify-between items-center pb-space-xs border-b border-outline-variant/30">
            <span className="font-label-caps text-label-caps uppercase text-secondary">
              รหัสการนัดหมาย (Booking Ref)
            </span>
            <span className="font-mono text-primary font-bold text-base">{bookingRef}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm font-body-sm text-body-sm">
            {recipientName && (
              <div>
                <span className="text-secondary block">ผู้รับบริการ:</span>
                <span className="font-medium text-on-surface">
                  {recipientName} {recipientPhone ? `(${recipientPhone})` : ''}
                </span>
              </div>
            )}
            <div>
              <span className="text-secondary block">ผู้บำบัด:</span>
              <span className="font-medium text-on-surface">
                {selectedTherapist?.name || selectedTherapist?.shortName || 'ให้ร้านจัดสรรให้'}
              </span>
            </div>
            <div>
              <span className="text-secondary block">บริการ:</span>
              <span className="font-medium text-on-surface">
                {selectedService?.name || '—'} {activeService?.duration ? `(${activeService.duration})` : ''}
              </span>
            </div>
            <div>
              <span className="text-secondary block">วันและเวลา:</span>
              <span className="font-medium text-primary">
                {selectedDate?.fullText || selectedDate?.label || '—'} · {selectedTimeSlot?.timeRange || selectedTimeSlot?.time || '—'}
              </span>
            </div>
            <div>
              <span className="text-secondary block">สถานที่:</span>
              <span className="font-medium text-on-surface">สาขาขอนแก่น (Private Suite)</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-space-sm pt-space-xs">
          <button
            type="button"
            onClick={() => onNavigate?.('home')}
            className="w-full sm:w-auto px-8 py-3.5 rounded bg-primary text-surface font-label-md text-label-md tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            กลับสู่หน้าแรก
          </button>
          <button
            type="button"
            onClick={onResetBooking}
            className="w-full sm:w-auto px-8 py-3.5 rounded border border-outline-variant text-on-surface font-label-md text-label-md tracking-wider hover:bg-surface-container transition-colors cursor-pointer"
          >
            จองเวลาเพิ่มอีกรอบ
          </button>
        </div>
      </div>
    </section>
  )
}
