import React, { useEffect, useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import StatusBadge from '../components/StatusBadge.jsx'
import { api } from '../../lib/api.js'

export default function AdminDashboard({ onNavigate, onOpenWalkInModal, onOpenAssignModal }) {
  const { user, rooms, queueItems, therapists, bookings, updateQueueStatus } = useAdminAuth()
  const { lang, t } = useLanguage()

  // Real Executive Report from backend (Role OWNER)
  const [reportData, setReportData] = useState(null)
  const [revenueData, setRevenueData] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)

  const isOwner = user?.role === 'OWNER'

  useEffect(() => {
    let isMounted = true
    if (isOwner) {
      setReportLoading(true)
      Promise.all([
        api.get('/admin/reports/dashboard'),
        api.get('/admin/reports/revenue')
      ]).then(([dashRes, revRes]) => {
        if (isMounted) {
          if (dashRes && dashRes.success && dashRes.data) setReportData(dashRes.data)
          if (revRes && revRes.success && revRes.data) setRevenueData(revRes.data)
        }
      }).catch(() => {})
        .finally(() => {
          if (isMounted) setReportLoading(false)
        })
    }
    return () => { isMounted = false }
  }, [isOwner])

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
        alert(err.message || (lang === 'th' ? 'ไม่สามารถเริ่มนวดได้' : 'Cannot start treatment'))
      }
    }
  }

  // Fallback stats calculation from real/mock state
  const totalQueuesToday = queueItems.length
  const waitingQueues = queueItems.filter(q => q.status === 'WAITING' || q.status === 'PENDING' || q.status === 'CHECKED_IN').length
  const inServiceQueues = queueItems.filter(q => q.status === 'IN_SERVICE').length
  const occupiedRoomsCount = rooms.filter(r => r.status === 'OCCUPIED').length
  const cleaningRoomsCount = rooms.filter(r => r.status === 'CLEANING').length
  const totalRoomsCount = rooms.length || 6
  const roomOccupancyRate = Math.round((occupiedRoomsCount / totalRoomsCount) * 100)
  const activeTherapistsCount = therapists.filter(t => t.status === 'ON_DUTY' || t.status === 'IN_SERVICE').length

  // Revenue metrics (prioritize backend reportData when available)
  const displayTodayRevenue = reportData?.todayRevenue ?? bookings.reduce((sum, b) => sum + (b.price || 0), 0)
  const displayMonthlyRevenue = reportData?.monthlyRevenue ?? (displayTodayRevenue * 14)
  const displayTodayBookings = reportData?.todayBookingsCount ?? totalQueuesToday
  const displayMonthlyBookings = reportData?.monthlyBookingsCount ?? (bookings.length * 3)

  const formattedDate = new Intl.DateTimeFormat(lang === 'th' ? 'th-TH' : 'en-US', {
    dateStyle: 'full'
  }).format(new Date())

  return (
    <div className="space-y-6 font-body-md text-on-surface">
      {/* Top Banner / Welcome - Refined Serene Thai Sanctuary Styling */}
      <div className="bg-teak-deep text-warm-ivory rounded-2xl p-6 sm:p-7 border border-wood-deep/30 shadow-[var(--admin-shadow-sm)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/80 text-sand-warm text-[11px] font-medium border border-wood-deep/30 tracking-wider">
              <span>{t('admin.liveOperations')}</span>
              <span>•</span>
              <span className="capitalize">{formattedDate}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-headline font-normal text-warm-ivory tracking-tight">
              {t('admin.dashboardTitle')}
            </h1>
            <p className="text-sand-warm text-xs sm:text-sm max-w-2xl leading-relaxed">
              {t('admin.dashboardDesc')}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={onOpenWalkInModal}
              className="px-4 py-2 rounded-xl bg-surface text-teak-deep hover:bg-warm-ivory font-semibold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>{t('admin.addQueue')}</span>
            </button>
            <button
              onClick={() => onNavigate('queue')}
              className="px-4 py-2 rounded-xl bg-primary-container hover:bg-teak-dark text-warm-ivory font-medium text-xs transition-all border border-wood-deep/35 cursor-pointer"
            >
              {t('admin.queue')}
            </button>
            {isOwner && (
              <button
                onClick={() => onNavigate('users')}
                className="px-3.5 py-2 rounded-xl bg-primary-container/50 hover:bg-primary-container text-sand-warm hover:text-warm-ivory font-medium text-xs transition-all border border-wood-deep/20 cursor-pointer"
              >
                {t('admin.users')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid - Clean, Restrained, Unified */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue (Owner) or Today Queues (Receptionist) */}
        {isOwner ? (
          <div className="bg-surface rounded-2xl p-5 border border-outline-variant shadow-[var(--admin-shadow-sm)] hover:border-outline transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-charcoal-muted text-xs font-medium">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-surface-container text-teak-deep">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.7 0-3 .8-3 2s1.3 2 3 2 3 .8 3 2-1.3 2-3 2m0-8V6m0 10v2m9-6a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <span>{t('admin.monthlyRevenue')}</span>
              </div>
              <span className="text-charcoal-muted text-[10px] font-semibold uppercase tracking-wider">MONTH</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-headline font-bold text-teak-deep">
                ฿{Number(displayMonthlyRevenue).toLocaleString()}
              </div>
            </div>
            <div className="mt-2 text-[11px] text-charcoal-muted flex items-center justify-between">
              <span>{t('admin.todayRevenue')}: <strong className="text-on-surface font-semibold">฿{Number(displayTodayRevenue).toLocaleString()}</strong></span>
              <span className="text-charcoal-muted">{displayMonthlyBookings} {lang === 'th' ? 'รอบ' : 'bookings'}</span>
            </div>
          </div>
        ) : (
          <div className="bg-surface rounded-2xl p-5 border border-outline-variant shadow-[var(--admin-shadow-sm)] hover:border-outline transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-charcoal-muted text-xs font-medium">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-surface-container text-teak-deep">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <span>{t('admin.todayBookings')}</span>
              </div>
              <span className="text-charcoal-muted text-[10px] font-semibold uppercase tracking-wider">TODAY</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-3xl font-headline font-bold text-teak-deep">
                {totalQueuesToday} <span className="text-xs font-normal text-charcoal-muted">{lang === 'th' ? 'คิว' : 'Queues'}</span>
              </div>
              <div className="text-xs text-charcoal-muted font-medium">
                {t('admin.waiting')}: {waitingQueues}
              </div>
            </div>
            <div className="mt-2 text-[11px] text-charcoal-muted">
              {lang === 'th' ? `กำลังให้บริการ ${inServiceQueues} คิว` : `${inServiceQueues} in active treatment`}
            </div>
          </div>
        )}

        {/* Card 2: Room Occupancy Rate (Dynamic) */}
        <div className="bg-surface rounded-2xl p-5 border border-outline-variant shadow-[var(--admin-shadow-sm)] hover:border-outline transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-charcoal-muted text-xs font-medium">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-surface-container text-teak-deep">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0v-5a2 2 0 012-2h2a2 2 0 012 2v5m-6 0h6" />
                </svg>
              </span>
              <span>{t('admin.occupancyRate')}</span>
            </div>
            <span className="text-charcoal-muted text-[10px] font-semibold uppercase tracking-wider">
              {occupiedRoomsCount}/{totalRoomsCount} ROOMS
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-headline font-bold text-teak-deep">{roomOccupancyRate}%</div>
            <div className="text-xs text-charcoal-muted">
              {cleaningRoomsCount > 0 ? `${cleaningRoomsCount} ${lang === 'th' ? 'ห้องทำความสะอาด' : 'cleaning'}` : t('admin.roomOccupancyDesc')}
            </div>
          </div>
          <div className="mt-2 w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-teak-deep h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, roomOccupancyRate))}%` }}
            />
          </div>
        </div>

        {/* Card 3: Active Therapists */}
        <div className="bg-surface rounded-2xl p-5 border border-outline-variant shadow-[var(--admin-shadow-sm)] hover:border-outline transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-charcoal-muted text-xs font-medium">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-surface-container text-teak-deep">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
              <span>{t('admin.therapists')}</span>
            </div>
            <span className="text-charcoal-muted text-[10px] font-semibold uppercase tracking-wider">STAFF</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-headline font-bold text-teak-deep">
              {activeTherapistsCount} <span className="text-xs font-normal text-charcoal-muted">/ {therapists.length}</span>
            </div>
            <div className="text-xs text-charcoal-muted">
              {t('admin.onDuty')}: {therapists.filter(t => t.status === 'ON_DUTY').length}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-charcoal-muted">
            {lang === 'th' ? `กำลังนวด: ${therapists.filter(t => t.status === 'IN_SERVICE').length} ท่าน` : `In service: ${therapists.filter(t => t.status === 'IN_SERVICE').length}`}
          </div>
        </div>

        {/* Card 4: Completed Services / Active Operations */}
        <div className="bg-surface rounded-2xl p-5 border border-outline-variant shadow-[var(--admin-shadow-sm)] hover:border-outline transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-charcoal-muted text-xs font-medium">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-surface-container text-teak-deep">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span>{t('admin.completedServices')}</span>
            </div>
            <span className="text-charcoal-muted text-[10px] font-semibold uppercase tracking-wider">DONE</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-headline font-bold text-teak-deep">
              {reportData?.completedBookingsCount ?? queueItems.filter(q => q.status === 'COMPLETED').length}
            </div>
            <div className="text-xs text-charcoal-muted">
              {lang === 'th' ? 'รอบที่สมบูรณ์' : 'Success sessions'}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-charcoal-muted flex items-center justify-between">
            <span>{lang === 'th' ? 'ยกเลิก' : 'Cancelled'}: {reportData?.cancelledBookingsCount ?? 0}</span>
            {isOwner && reportData?.totalDiscountGiven > 0 && (
              <span className="text-charcoal-muted font-medium">Promo: -฿{Number(reportData.totalDiscountGiven).toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>

      {/* Executive Report Insights (Visible to OWNER) */}
      {isOwner && reportData?.topServices && reportData.topServices.length > 0 && (
        <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-[var(--admin-shadow-sm)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline font-semibold text-teak-dark text-base sm:text-lg">
                {t('admin.topServices')}
              </h2>
              <p className="text-xs text-charcoal-muted">
                {lang === 'th' ? 'วิเคราะห์ความนิยมและรายได้จากแต่ละหัตถการ' : 'Revenue and booking breakdown by treatment type'}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary-container text-secondary">
              Executive Analytics
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportData.topServices.map((svc, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-teak-dark">{svc.serviceName}</span>
                  <span className="text-[11px] font-bold text-secondary">{svc.bookingCount} {lang === 'th' ? 'ครั้ง' : 'times'}</span>
                </div>
                <div className="text-sm font-bold text-teak-dark">
                  ฿{Number(svc.totalRevenue).toLocaleString()}
                </div>
                <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-secondary h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.max(15, (svc.bookingCount / (reportData.monthlyBookingsCount || 1)) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial Revenue & Refund Summary (Visible to OWNER) */}
      {isOwner && revenueData && (
        <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-[var(--admin-shadow-sm)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-headline font-semibold text-teak-dark text-base sm:text-lg">
                {lang === 'th' ? 'รายงานรายได้และการเงิน (Financial Revenue & Refunds)' : 'Financial Revenue & Refunds Summary'}
              </h2>
              <p className="text-xs text-charcoal-muted">
                {lang === 'th' ? 'สรุปยอดขายสุทธิ ส่วนลดโปรโมชั่น และยอดเงินที่คืนลูกค้า' : 'Audited net revenues, promotional discounts, and refund logs'}
              </p>
            </div>
            <div className="text-xs text-secondary font-medium">
              {revenueData.startDate} — {revenueData.endDate}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60">
              <span className="text-[11px] font-semibold text-charcoal-muted uppercase block">
                {lang === 'th' ? 'ยอดขายรวม (Gross)' : 'Gross Total'}
              </span>
              <span className="text-base font-bold text-teak-deep mt-1 block">
                ฿{Number(revenueData.grossTotal || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60">
              <span className="text-[11px] font-semibold text-charcoal-muted uppercase block">
                {lang === 'th' ? 'ส่วนลด (Discounts)' : 'Discounts'}
              </span>
              <span className="text-base font-bold text-emerald-800 mt-1 block">
                -฿{Number(revenueData.discountTotal || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60">
              <span className="text-[11px] font-semibold text-charcoal-muted uppercase block">
                {lang === 'th' ? 'รายได้สุทธิ (Net Revenue)' : 'Net Revenue'}
              </span>
              <span className="text-base font-bold text-primary mt-1 block">
                ฿{Number(revenueData.netRevenue || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60">
              <span className="text-[11px] font-semibold text-charcoal-muted uppercase block">
                {lang === 'th' ? 'ยอดคืนเงิน (Refunded)' : 'Refunded Total'}
              </span>
              <span className="text-base font-bold text-rose-700 mt-1 block">
                ฿{Number(revenueData.refundedTotal || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {revenueData.breakdownByPaymentMethod && revenueData.breakdownByPaymentMethod.length > 0 && (
            <div className="pt-2 border-t border-outline-variant/60">
              <div className="text-[11px] font-semibold text-charcoal-muted uppercase mb-2">
                {lang === 'th' ? 'จำแนกตามช่องทางชำระเงิน:' : 'Breakdown by Payment Method:'}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {revenueData.breakdownByPaymentMethod.map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-surface border border-outline-variant flex items-center justify-between">
                    <span className="font-medium text-teak-dark uppercase text-[11px]">{m.paymentMethod}</span>
                    <span className="font-bold text-secondary">฿{Number(m.totalAmount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Operational Split: Real-time Room Layout & Upcoming Queue Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-time Rooms Floor Plan */}
        <div className="lg:col-span-2 bg-surface rounded-2xl p-6 border border-outline-variant shadow-[var(--admin-shadow-sm)] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline font-semibold text-teak-dark text-lg">
                {t('admin.rooms')}
              </h2>
              <p className="text-xs text-charcoal-muted">
                {lang === 'th'
                  ? 'ผังห้องนวด 6 ห้อง พร้อมระบบนับเวลาทำความสะอาด 15 นาทีอัตโนมัติ'
                  : 'Floor plan monitoring with 15-minute sanitization turnaround buffers'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('rooms')}
              className="text-xs font-semibold text-secondary hover:text-terracotta-muted flex items-center gap-1 cursor-pointer"
            >
              <span>{lang === 'th' ? 'จัดการผังห้อง' : 'Manage Rooms'}</span>
              <span>→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => onNavigate('rooms')}
                className="p-4 rounded-xl border border-outline-variant bg-surface-container-low hover:border-outline transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-[var(--admin-shadow-sm)]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teak-deep text-sm">{room.id}</span>
                  <StatusBadge status={room.status} size="sm" />
                </div>
                <div className="mt-2 text-xs font-medium text-teak-deep">{room.name}</div>
                <div className="text-[10px] text-charcoal-muted uppercase tracking-wider">{room.type}</div>

                {room.status === 'OCCUPIED' && (
                  <div className="mt-3 pt-2 border-t border-outline-variant text-[11px] space-y-0.5 text-on-surface">
                    <div className="truncate font-medium text-teak-deep">{room.service}</div>
                    <div className="text-charcoal-muted truncate">{lang === 'th' ? 'หมอ:' : 'Therapist:'} {room.therapist}</div>
                    <div className="text-charcoal-muted">{room.startTime} - {room.endTime} น.</div>
                  </div>
                )}

                {room.status === 'CLEANING' && (
                  <div className="mt-3 pt-2 border-t border-outline-variant text-[11px] text-amber-900 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{lang === 'th' ? 'กำลังทำความสะอาดห้อง' : 'Sanitizing in progress'}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Live Queue Board Preview */}
        <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-[var(--admin-shadow-sm)] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline font-semibold text-teak-dark text-lg">
                {t('admin.queue')}
              </h2>
              <p className="text-xs text-charcoal-muted">{lang === 'th' ? 'ลำดับคิวรับบริการสด' : 'Live treatment queue'}</p>
            </div>
            <button
              onClick={() => onNavigate('queue')}
              className="text-xs font-semibold text-secondary hover:text-terracotta-muted cursor-pointer"
            >
              {lang === 'th' ? `ดูทั้งหมด (${queueItems.length})` : `View All (${queueItems.length})`}
            </button>
          </div>

          <div className="space-y-3">
            {queueItems.slice(0, 5).map((q) => (
              <div
                key={q.queueNo}
                className="p-3.5 rounded-xl border border-outline-variant hover:border-wood-deep/60 bg-surface-container-low hover:bg-surface-container transition-all flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-secondary text-xs px-2 py-0.5 rounded bg-secondary-container">{q.queueNo}</span>
                    <span className="text-xs font-semibold text-on-surface">{q.customerName}</span>
                  </div>
                  <div className="text-[11px] text-on-surface-variant">{q.serviceName} ({q.durationMinutes} {lang === 'th' ? 'นาที' : 'mins'})</div>
                  <div className="text-[10px] text-charcoal-muted">{lang === 'th' ? 'เวลา:' : 'Time:'} {q.time} • {q.type}</div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <StatusBadge status={q.status} size="sm" />
                  {(q.status === 'WAITING' || q.status === 'CHECKED_IN') && (
                    <button
                      onClick={() => handleStartService(q)}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-teak-dark text-on-primary hover:bg-teak-deep transition-colors font-semibold cursor-pointer"
                    >
                      {lang === 'th' ? 'เข้าห้องนวด →' : 'Start →'}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {queueItems.length === 0 && (
              <div className="py-8 text-center text-xs text-charcoal-muted">
                {t('admin.noMatchingRecords')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
