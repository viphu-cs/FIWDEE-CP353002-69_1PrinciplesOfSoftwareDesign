import React from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import StatusBadge from '../components/StatusBadge.jsx'

export default function AdminDashboard({ onNavigate, onOpenWalkInModal, onOpenAssignModal }) {
  const { user, rooms, queueItems, therapists, bookings, updateQueueStatus } = useAdminAuth()
  const { lang, t } = useLanguage()

  const handleStartService = (q) => {
    if (!q.therapistName || q.therapistName === 'ไม่ระบุ' || !q.roomNo) {
      if (onOpenAssignModal) {
        onOpenAssignModal(q)
      } else {
        onNavigate('queue')
      }
    } else {
      try {
        updateQueueStatus(q.queueNo, 'IN_SERVICE')
      } catch (err) {
        alert(err.message || 'ไม่สามารถเริ่มนวดได้')
      }
    }
  }

  // Stats calculation
  const totalQueuesToday = queueItems.length
  const waitingQueues = queueItems.filter(q => q.status === 'WAITING' || q.status === 'PENDING' || q.status === 'CHECKED_IN').length
  const inServiceQueues = queueItems.filter(q => q.status === 'IN_SERVICE').length
  const occupiedRoomsCount = rooms.filter(r => r.status === 'OCCUPIED').length
  const totalRoomsCount = rooms.length
  const roomOccupancyRate = Math.round((occupiedRoomsCount / totalRoomsCount) * 100)
  const activeTherapistsCount = therapists.filter(t => t.status === 'ON_DUTY' || t.status === 'IN_SERVICE').length
  const todayEstimatedRevenue = bookings.reduce((sum, b) => sum + (b.price || 0), 0)

  return (
    <div className="space-y-6 font-body-md text-stone-800">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-3xl p-6 text-stone-100 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE OPERATIONS CENTER</span>
              <span>•</span>
              <span>2 Oct 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-headline font-bold text-white tracking-wide">
              {lang === 'th' ? 'ภาพรวมการดำเนินงานวันนี้' : 'Daily Operations Overview'}
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-xl">
              {lang === 'th'
                ? 'ระบบจัดการคิว ผังห้องนวด และบุคลากรฝั่งบริหารจัดการ FIWDEE Massage & Wellness'
                : 'Management dashboard for queueing, room layouts, and therapists staff at FIWDEE Massage & Wellness'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenWalkInModal}
              className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>{t('admin.addQueue')}</span>
            </button>
            <button
              onClick={() => onNavigate('queue')}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-200 font-medium text-xs sm:text-sm transition-all cursor-pointer border border-white/10"
            >
              {t('admin.queue')}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Queues Today */}
        <div className="bg-surface rounded-2xl p-5 border border-outline-variant/80 shadow-[var(--admin-shadow-sm)] hover:border-wood-deep/60 hover:shadow-[var(--admin-shadow-md)] hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-secondary-container text-secondary">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </span>
              <span>{lang === 'th' ? 'จำนวนคิวทั้งหมดวันนี้' : 'Total Queues Today'}</span>
            </div>
            <span className="text-secondary bg-secondary-container px-2 py-0.5 rounded-full font-bold text-[10px]">Today</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-bold font-headline text-teak-dark">{totalQueuesToday} {lang === 'th' ? 'คิว' : 'Queues'}</div>
            <div className="text-xs text-secondary font-semibold">
              {lang === 'th' ? 'รอเรียก/เช็คอิน' : 'Waiting'}: {waitingQueues}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-charcoal-muted">
            {lang === 'th' ? `กำลังให้บริการอยู่ ${inServiceQueues} คิว` : `${inServiceQueues} active in-service`}
          </div>
        </div>

        {/* Card 2: Room Occupancy Rate */}
        <div className="bg-surface rounded-2xl p-5 border border-outline-variant/80 shadow-[var(--admin-shadow-sm)] hover:border-wood-deep/60 hover:shadow-[var(--admin-shadow-md)] hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-tertiary-fixed text-on-tertiary-fixed-variant">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5" /></svg>
              </span>
              <span>{lang === 'th' ? 'อัตราการใช้งานห้องนวด' : 'Room Occupancy Rate'}</span>
            </div>
            <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px]">Occupancy</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-bold font-headline text-teak-dark">{roomOccupancyRate}%</div>
            <div className="text-xs text-on-surface-variant font-medium">
              {occupiedRoomsCount} / {totalRoomsCount} {lang === 'th' ? 'ห้อง' : 'Rooms'}
            </div>
          </div>
          <div className="mt-2 w-full bg-surface-container rounded-full h-2 overflow-hidden">
            <div
              className="bg-terracotta-muted h-full rounded-full transition-all duration-500"
              style={{ width: `${roomOccupancyRate}%` }}
            />
          </div>
        </div>

        {/* Card 3: Active Therapists */}
        <div className="bg-surface rounded-2xl p-5 border border-outline-variant/80 shadow-[var(--admin-shadow-sm)] hover:border-wood-deep/60 hover:shadow-[var(--admin-shadow-md)] hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary-fixed text-on-primary-fixed-variant">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2m17-10a4 4 0 010 8m3 2v-2a4 4 0 00-3-3.87M9 11a4 4 0 100-8 4 4 0 000 8z" /></svg>
              </span>
              <span>{lang === 'th' ? 'หมอนวดปฏิบัติงาน' : 'Active Therapists'}</span>
            </div>
            <span className="text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full font-bold text-[10px]">Duty</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-bold font-headline text-teak-dark">{activeTherapistsCount} {lang === 'th' ? 'ท่าน' : 'Staff'}</div>
            <div className="text-xs text-charcoal-muted">{lang === 'th' ? `จากทั้งหมด ${therapists.length}` : `of ${therapists.length} total`}</div>
          </div>
          <div className="mt-2 text-[11px] text-emerald-800 font-medium">
            {lang === 'th' ? `พร้อมรับคิว: ${therapists.filter(t => t.status === 'ON_DUTY').length} ท่าน` : `Ready: ${therapists.filter(t => t.status === 'ON_DUTY').length}`}
          </div>
        </div>

        {/* Card 4: Estimated Revenue (Restricted to OWNER) */}
        <div className="bg-surface rounded-2xl p-5 border border-outline-variant/80 shadow-[var(--admin-shadow-sm)] hover:border-wood-deep/60 hover:shadow-[var(--admin-shadow-md)] hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-secondary-container text-secondary">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.7 0-3 .8-3 2s1.3 2 3 2 3 .8 3 2-1.3 2-3 2m0-8V6m0 10v2m9-6a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
              <span>{lang === 'th' ? 'ประมาณการรายได้วันนี้' : 'Est. Revenue Today'}</span>
            </div>
            <span className="text-secondary bg-secondary-container px-2 py-0.5 rounded-full font-bold text-[10px]">THB</span>
          </div>

          {user.role === 'OWNER' ? (
            <>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-2xl sm:text-3xl font-bold font-headline text-teak-dark">
                  ฿{todayEstimatedRevenue.toLocaleString()}
                </div>
              </div>
              <div className="mt-2 text-[11px] text-charcoal-muted">
                {lang === 'th' ? `ชำระเงินเรียบร้อยแล้ว ${bookings.filter(b => b.paymentStatus === 'PAID').length} รายการ` : `${bookings.filter(b => b.paymentStatus === 'PAID').length} paid bookings`}
              </div>
            </>
          ) : (
            <div className="mt-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant text-charcoal-muted text-xs text-center font-medium">
              🔒 {lang === 'th' ? 'เฉพาะสิทธิ์ผู้จัดการ (OWNER)' : 'Restricted to OWNER'}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Room Status Grid & Active Queue timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-time Room Status Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline font-bold text-stone-900 text-lg">
                {lang === 'th' ? 'ผังสถานะห้องนวด (Real-time Room Status)' : 'Real-time Rooms Layout'}
              </h3>
              <p className="text-xs text-stone-500">
                {lang === 'th' ? 'คลิกที่ห้องเพื่ออัปเดตสถานะ หรือคลิกไปหน้าจัดการห้องแบบรายละเอียด' : 'Click room card to change status or manage layout'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('rooms')}
              className="text-xs font-semibold text-amber-900 hover:text-amber-950 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{lang === 'th' ? 'ดูรายละเอียดผังห้อง' : 'View All Rooms'}</span>
              <span>→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => onNavigate('rooms')}
                className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                  room.status === 'OCCUPIED'
                    ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300'
                    : room.status === 'AVAILABLE'
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : room.status === 'CLEANING'
                    ? 'bg-sky-50/40 border-sky-200'
                    : 'bg-stone-100 border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm font-headline">{room.id}</span>
                  <StatusBadge status={room.status} size="sm" />
                </div>
                <div className="mt-2 text-xs font-medium text-stone-700">{room.name}</div>
                <div className="text-[10px] text-stone-500 uppercase">{room.type}</div>

                {room.status === 'OCCUPIED' && (
                  <div className="mt-3 pt-2 border-t border-amber-200/60 text-[11px] space-y-0.5 text-stone-800">
                    <div className="truncate font-semibold">{room.service}</div>
                    <div className="text-stone-600 truncate">{lang === 'th' ? 'หมอ:' : 'Therapist:'} {room.therapist}</div>
                    <div className="text-amber-900 font-bold">{room.startTime} - {room.endTime}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Live Queue Timeline */}
        <div className="bg-surface rounded-2xl p-6 border border-outline-variant/80 shadow-[var(--admin-shadow-sm)] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline font-bold text-teak-dark text-lg">
                {lang === 'th' ? 'คิวถัดไปวันนี้' : 'Upcoming Queue'}
              </h3>
              <p className="text-xs text-charcoal-muted">{lang === 'th' ? 'รายการคิวล่าสุด' : 'Recent active queue items'}</p>
            </div>
            <button
              onClick={() => onNavigate('queue')}
              className="text-xs font-semibold text-secondary hover:text-terracotta-muted link-underline cursor-pointer"
            >
              {lang === 'th' ? `ดูคิวทั้งหมด (${queueItems.length})` : `View All (${queueItems.length})`}
            </button>
          </div>

          <div className="space-y-3">
            {queueItems.slice(0, 5).map((q) => (
              <div
                key={q.queueNo}
                className="p-4 rounded-xl border border-outline-variant/75 hover:border-wood-deep/60 bg-surface-container-low/70 hover:bg-surface-container-low transition-all duration-200 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-secondary text-xs px-2 py-0.5 rounded bg-secondary-container">{q.queueNo}</span>
                    <span className="text-xs font-semibold text-on-surface">{q.customerName}</span>
                  </div>
                  <div className="text-[11px] text-on-surface-variant mt-1">{q.serviceName} ({q.durationMinutes} {lang === 'th' ? 'นาที' : 'Mins'})</div>
                  <div className="text-[10px] text-charcoal-muted">{lang === 'th' ? 'เวลา:' : 'Time:'} {q.time} • {q.type}</div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={q.status} size="sm" />
                  {q.status === 'WAITING' || q.status === 'CHECKED_IN' ? (
                    <button
                      onClick={() => handleStartService(q)}
                      className="px-2.5 py-1.5 text-[10px] rounded-lg bg-teak-dark text-on-primary hover:bg-teak-deep transition-colors font-semibold cursor-pointer"
                    >
                      {lang === 'th' ? 'เข้าห้องนวด →' : 'Start Service →'}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
