import React from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import StatusBadge from '../components/StatusBadge.jsx'

export default function AdminTherapistSchedule() {
  const { user, therapists, getTherapistShiftForDate } = useAdminAuth()
  const { lang } = useLanguage()

  // Match the therapist by name or take the first therapist as demo
  const therapistName = user?.name || ''
  const myData = therapists.find(t => therapistName.includes(t.fullName) || therapistName.includes(t.nickname)) || therapists[0]

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
            ? 'ตรวจสอบช่วงเวลาเข้ากะทำงาน ประจำสัปดาห์ และทักษะหัตถการที่ผ่านการรับรอง'
            : 'View your 7-day scheduled shifts, rest days, and certified massage techniques'}
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-surface rounded-2xl border border-outline-variant p-5 shadow-[var(--admin-shadow-sm)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-charcoal-muted uppercase tracking-wider font-semibold">
            {lang === 'th' ? 'สถานะการทำงานปัจจุบัน' : 'Current Duty Status'}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={myData?.status || 'ON_DUTY'} size="md" />
            <span className="text-xs font-semibold text-teak-dark">
              {myData?.nickname} ({myData?.fullName})
            </span>
          </div>
        </div>

        <div>
          <div className="text-xs text-charcoal-muted uppercase tracking-wider font-semibold mb-1.5">
            {lang === 'th' ? 'ทักษะที่ผ่านการรับรอง' : 'Certified Skills'}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {myData?.skills?.map((sk, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-surface-container text-[11px] font-medium text-on-surface border border-outline-variant">
                {sk}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 7-Day Schedule Matrix */}
      <div className="bg-surface rounded-2xl border border-outline-variant shadow-[var(--admin-shadow-sm)] overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-teak-dark">
            {lang === 'th' ? 'ตารางเวร 7 วันข้างหน้า' : 'Upcoming 7-Day Shift Roster'}
          </h2>
        </div>

        <div className="divide-y divide-outline-variant">
          {shiftDates.map((dateStr, idx) => {
            const shiftType = getTherapistShiftForDate(myData, dateStr)
            const badge = getShiftBadge(shiftType)
            const isToday = idx === 0

            return (
              <div key={dateStr} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isToday ? 'bg-surface-container-low/60' : 'hover:bg-surface-container-low transition-colors'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center text-xs font-bold ${isToday ? 'bg-teak-dark text-warm-ivory' : 'bg-surface-container text-on-surface'}`}>
                    <span>{new Date(dateStr).getDate()}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-on-surface">
                      {formatHeaderDate(dateStr)} {isToday && <span className="ml-2 text-[10px] font-bold text-secondary uppercase tracking-wider">({lang === 'th' ? 'วันนี้' : 'Today'})</span>}
                    </div>
                    <div className="text-[11px] text-charcoal-muted">{dateStr}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
