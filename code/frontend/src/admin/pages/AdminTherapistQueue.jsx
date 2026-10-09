import React from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import StatusBadge from '../components/StatusBadge.jsx'

export default function AdminTherapistQueue() {
  const { user, queueItems, updateQueueStatus, rooms } = useAdminAuth()
  const { lang, t } = useLanguage()

  // Match jobs assigned to this therapist (by full name or nickname)
  const therapistName = user?.name || ''
  const myQueueItems = queueItems.filter(q => {
    if (!q.therapistName || q.therapistName === 'ไม่ระบุ') return false
    return therapistName.includes(q.therapistName) || q.therapistName.includes(therapistName)
  })

  // In-service active jobs vs waiting vs completed
  const activeJobs = myQueueItems.filter(q => q.status === 'IN_SERVICE')
  const waitingJobs = myQueueItems.filter(q => q.status === 'WAITING' || q.status === 'CHECKED_IN' || q.status === 'CONFIRMED')
  const completedJobs = myQueueItems.filter(q => q.status === 'COMPLETED')

  const handleStart = (queueNo) => {
    try {
      updateQueueStatus(queueNo, 'IN_SERVICE')
    } catch (err) {
      alert(err.message)
    }
  }

  const handleComplete = (queueNo) => {
    try {
      updateQueueStatus(queueNo, 'COMPLETED')
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-6 text-on-surface font-body-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-xs font-semibold text-teak-deep mb-2">
            <span>{lang === 'th' ? 'หมอนวดผู้ให้บริการ:' : 'Therapist:'}</span>
            <span className="font-bold">{therapistName}</span>
          </div>
          <h1 className="text-2xl font-headline font-semibold text-teak-dark">
            {lang === 'th' ? 'คิวงานและบริการของฉัน' : 'My Assigned Queues'}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
            {lang === 'th'
              ? 'ตรวจสอบรายการลูกค้าที่ได้รับมอบหมาย กดเริ่มการนวด และกดจบงานเมื่อให้บริการเสร็จสิ้น'
              : 'Review your assigned customer sessions, start treatments, and complete services'}
          </p>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-2xl border border-outline-variant p-4 shadow-[var(--admin-shadow-sm)]">
          <div className="text-xs font-semibold text-charcoal-muted uppercase">
            {lang === 'th' ? 'กำลังให้บริการอยู่' : 'In Service Now'}
          </div>
          <div className="text-3xl font-headline font-semibold text-teak-dark mt-1">
            {activeJobs.length}
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-outline-variant p-4 shadow-[var(--admin-shadow-sm)]">
          <div className="text-xs font-semibold text-charcoal-muted uppercase">
            {lang === 'th' ? 'คิวที่รอดำเนินการ' : 'Waiting in Queue'}
          </div>
          <div className="text-3xl font-headline font-semibold text-teak-dark mt-1">
            {waitingJobs.length}
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-outline-variant p-4 shadow-[var(--admin-shadow-sm)]">
          <div className="text-xs font-semibold text-charcoal-muted uppercase">
            {lang === 'th' ? 'เสร็จสิ้นวันนี้' : 'Completed Today'}
          </div>
          <div className="text-3xl font-headline font-semibold text-teak-dark mt-1">
            {completedJobs.length}
          </div>
        </div>
      </div>

      {/* Active Treatment In Progress Banner */}
      {activeJobs.length > 0 && (
        <div className="bg-surface rounded-2xl border-2 border-emerald-800/20 p-5 shadow-[var(--admin-shadow-sm)] space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-teak-dark">
              {lang === 'th' ? 'หัตถการที่กำลังดำเนินการอยู่ในขณะนี้' : 'Active Treatment In Progress'}
            </h2>
          </div>
          {activeJobs.map((q) => (
            <div key={q.queueNo} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base font-headline text-teak-dark">{q.queueNo}</span>
                  <span className="text-xs text-charcoal-muted font-medium">({q.customerName})</span>
                  <StatusBadge status="IN_SERVICE" size="sm" />
                </div>
                <div className="text-xs text-on-surface mt-1">
                  <span className="font-semibold">{q.serviceName}</span> · {q.durationMinutes} {lang === 'th' ? 'นาที' : 'mins'}
                  {q.roomNo && <span className="ml-2 text-teak-deep font-semibold">ห้อง {q.roomNo}</span>}
                </div>
              </div>
              <button
                onClick={() => handleComplete(q.queueNo)}
                className="px-5 py-2.5 rounded-xl bg-teak-dark text-warm-ivory hover:bg-teak-deep font-semibold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{lang === 'th' ? 'เสร็จสิ้นบริการ (จบงาน)' : 'Complete Service'}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Waiting Queue List */}
      <div className="bg-surface rounded-2xl border border-outline-variant shadow-[var(--admin-shadow-sm)] overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-teak-dark">
            {lang === 'th' ? 'คิวงานที่ต้องรับผิดชอบถัดไป' : 'Upcoming Queue Jobs'}
          </h2>
          <span className="text-xs text-charcoal-muted">
            {waitingJobs.length} {lang === 'th' ? 'รายการ' : 'jobs'}
          </span>
        </div>

        {waitingJobs.length === 0 ? (
          <div className="p-10 text-center text-xs text-charcoal-muted">
            {lang === 'th' ? 'ขณะนี้ไม่มีคิวงานที่รอให้บริการ' : 'No upcoming queue jobs assigned right now'}
          </div>
        ) : (
          <div className="divide-y divide-outline-variant">
            {waitingJobs.map((q) => (
              <div key={q.queueNo} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container-low transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-teak-dark">{q.queueNo}</span>
                    <span className="text-xs font-semibold text-on-surface">{q.customerName}</span>
                    <span className="text-[11px] text-charcoal-muted">{q.phone}</span>
                    <StatusBadge status={q.status} size="sm" />
                  </div>
                  <div className="text-xs text-charcoal-muted">
                    <span>{q.serviceName} ({q.durationMinutes} {lang === 'th' ? 'นาที' : 'mins'})</span>
                    {q.roomNo && <span className="ml-2 font-medium text-teak-deep">· ห้อง {q.roomNo}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStart(q.queueNo)}
                    className="px-4 py-2 rounded-xl bg-teak-dark text-warm-ivory hover:bg-teak-deep text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    {lang === 'th' ? 'เริ่มนวดทันที' : 'Start Service'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Jobs History */}
      <div className="bg-surface rounded-2xl border border-outline-variant shadow-[var(--admin-shadow-sm)] overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-teak-dark">
            {lang === 'th' ? 'ประวัติงานที่เสร็จสิ้นแล้ววันนี้' : 'Completed Jobs Today'}
          </h2>
          <span className="text-xs text-charcoal-muted">
            {completedJobs.length} {lang === 'th' ? 'รอบ' : 'completed'}
          </span>
        </div>

        {completedJobs.length === 0 ? (
          <div className="p-8 text-center text-xs text-charcoal-muted">
            {lang === 'th' ? 'ยังไม่มีงานที่เสร็จสิ้นในวันนี้' : 'No completed jobs recorded today'}
          </div>
        ) : (
          <div className="divide-y divide-outline-variant">
            {completedJobs.map((q) => (
              <div key={q.queueNo} className="p-4 flex items-center justify-between text-xs hover:bg-surface-container-low transition-colors">
                <div>
                  <div className="font-semibold text-on-surface">{q.queueNo} · {q.customerName}</div>
                  <div className="text-charcoal-muted text-[11px]">{q.serviceName} ({q.durationMinutes} นาที)</div>
                </div>
                <div className="text-right">
                  <StatusBadge status="COMPLETED" size="sm" />
                  <div className="text-[11px] font-bold text-teak-dark mt-1">฿{q.price?.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
