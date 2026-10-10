import React, { useState, useEffect } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import StatusBadge from '../components/StatusBadge.jsx'
import { api } from '../../lib/api.js'

export default function AdminTherapistSchedule() {
  const { user, therapists, getTherapistShiftForDate } = useAdminAuth()
  const { lang } = useLanguage()
  const [liveAppointments, setLiveAppointments] = useState([])
  const [loading, setLoading] = useState(false)

  // Match the therapist by name or take the first therapist as demo
  const therapistName = user?.name || ''
  const therapistId = user?.id || 1
  const myData = therapists.find(t => therapistName.includes(t.fullName) || therapistName.includes(t.nickname)) || therapists[0]

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    api.get(`/therapist/me/schedule?therapistId=${therapistId}`)
      .then((res) => {
        if (isMounted && res.success && Array.isArray(res.data)) {
          setLiveAppointments(res.data)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => { isMounted = false }
  }, [therapistId])

  // 7-day dates window starting today
  const shiftDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d.toISOString().slice(0, 10)
  })

  const getShiftBadge = (shift) => {
    switch (shift) {
      case 'MORNING':
        return { label: lang === 'th' ? 'กะเช้า (10:00 - 19:00)' : 'Morning (10:00 - 19:00)', cls: 'bg-surface-container text-teak-dark border border-outline-variant' }
      case 'EVENING':
        return { label: lang === 'th' ? 'กะบ่าย (13:00 - 22:00)' : 'Evening (13:00 - 22:00)', cls: 'bg-surface-container text-teak-deep border border-outline-variant' }
      case 'FULL_DAY':
        return { label: lang === 'th' ? 'เต็มวัน (10:00 - 22:00)' : 'Full Day (10:00 - 22:00)', cls: 'bg-teak-dark text-warm-ivory' }
      case 'OFF':
      default:
        return { label: lang === 'th' ? 'วันหยุด (Off Duty)' : 'Day Off', cls: 'bg-surface-container-low text-charcoal-muted border border-outline-variant/60' }
    }
  }

  const formatHeaderDate = (dateStr) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6 text-on-surface font-body-md">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-xs font-semibold text-teak-deep mb-2">
          <span>{lang === 'th' ? 'ตารางเวรหมอนวด:' : 'Work Schedule for:'}</span>
          <span className="font-bold">{myData?.fullName || therapistName}</span>
        </div>
        <h1 className="text-2xl font-headline font-semibold text-teak-dark">
          {lang === 'th' ? 'ตารางกะงานและวันหยุดของฉัน (7 วัน)' : 'My Work Shifts & Schedule'}
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
          {lang === 'th'
            ? 'ตรวจสอบรอบการเข้างาน กะเช้า/กะบ่าย/เต็มวัน หรือวันหยุด เพื่อเตรียมความพร้อมในการให้บริการ'
            : 'Review your upcoming 7-day duty shifts, timings, and scheduled days off'}
        </p>
      </div>

      {/* 7-Day Shift Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {shiftDates.map((dateStr, idx) => {
          const shift = getTherapistShiftForDate(myData, dateStr)
          const badge = getShiftBadge(shift)
          const isToday = idx === 0

          return (
            <div
              key={dateStr}
              className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                isToday
                  ? 'bg-surface border-teak-dark/40 shadow-sm ring-1 ring-teak-dark/20'
                  : 'bg-surface border-outline-variant shadow-[var(--admin-shadow-sm)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-charcoal-muted uppercase">
                    {formatHeaderDate(dateStr)}
                  </span>
                  {isToday && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teak-dark text-warm-ivory">
                      {lang === 'th' ? 'วันนี้' : 'Today'}
                    </span>
                  )}
                </div>
                <div className="text-lg font-headline font-bold text-teak-dark mt-1">
                  {new Date(dateStr).getDate()}
                </div>
              </div>

              <div>
                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold w-full text-center ${badge.cls}`}>
                  {badge.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Live Appointments Breakdown if any */}
      {liveAppointments.length > 0 && (
        <div className="bg-surface rounded-2xl border border-outline-variant p-5 shadow-[var(--admin-shadow-sm)] space-y-3">
          <h2 className="text-sm font-semibold text-teak-deep uppercase tracking-wider">
            {lang === 'th' ? 'รายการนัดหมายที่เชื่อมโยงกับระบบวันนี้' : 'Live Booked Appointments Today'}
          </h2>
          <div className="divide-y divide-outline-variant/60 text-xs">
            {liveAppointments.map(app => (
              <div key={app.queueId} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-teak-dark mr-2">{app.queueNumber}</span>
                  <span>{app.customerName}</span>
                  <span className="text-charcoal-muted ml-2">({app.serviceName})</span>
                </div>
                <StatusBadge status={app.queueStatus} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policy Notice */}
      <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 text-xs text-charcoal-muted leading-relaxed">
        <strong className="text-on-surface">{lang === 'th' ? 'หมายเหตุการขอสลับกะหรือลาหยุด:' : 'Shift swap policy:'}</strong>{' '}
        {lang === 'th'
          ? 'หากต้องการสลับเวรการทำงานหรือแจ้งวันหยุด กรุณาแจ้งผู้จัดการร้าน (Owner) ล่วงหน้าอย่างน้อย 2 วัน เพื่อให้ระบบจัดสรรหมอนวดสำรองได้อย่างราบรื่น'
          : 'Please notify the store manager at least 2 days in advance for any shift swaps or time-off requests.'}
      </div>
    </div>
  )
}
