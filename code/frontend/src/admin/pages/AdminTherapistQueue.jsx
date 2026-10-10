import React, { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import StatusBadge from '../components/StatusBadge.jsx'
import { api } from '../../lib/api.js'

export default function AdminTherapistQueue() {
  const { user, queueItems: fallbackQueueItems, updateQueueStatus } = useAdminAuth()
  const { lang, t } = useLanguage()
  const [liveQueueItems, setLiveQueueItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const showNotification = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 4000)
  }

  const therapistName = user?.name || ''
  const therapistId = user?.id || 1

  const fetchMySchedule = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get(`/therapist/me/schedule?therapistId=${therapistId}`)
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map(q => ({
          queueId: q.queueId,
          queueNo: q.queueNumber || `Q-${q.queueId}`,
          bookingCode: q.bookingId ? `BK-${q.bookingId}` : '-',
          bookingId: q.bookingId,
          customerName: q.customerName || 'ลูกค้าของฉัน',
          phone: '—',
          serviceName: q.serviceName || 'นวดแผนไทย',
          durationMinutes: 60,
          therapistName: q.therapistName || therapistName,
          roomNo: q.roomNumber || null,
          status: q.queueStatus, // WAITING, CALLED, IN_SERVICE, COMPLETED, CANCELLED
          type: 'ONLINE',
          time: q.scheduledStartDateTime
            ? new Date(q.scheduledStartDateTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
            : (q.checkInTime ? new Date(q.checkInTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-'),
          price: 600,
        }))
        setLiveQueueItems(mapped)
      } else {
        // Filter from fallback queue
        const matched = fallbackQueueItems.filter(q => {
          if (!q.therapistName || q.therapistName === 'ไม่ระบุ') return false
          return therapistName.includes(q.therapistName) || q.therapistName.includes(therapistName)
        })
        setLiveQueueItems(matched)
      }
    } catch {
      const matched = fallbackQueueItems.filter(q => {
        if (!q.therapistName || q.therapistName === 'ไม่ระบุ') return false
        return therapistName.includes(q.therapistName) || q.therapistName.includes(therapistName)
      })
      setLiveQueueItems(matched)
    } finally {
      setLoading(false)
    }
  }, [therapistId, therapistName, fallbackQueueItems])

  useEffect(() => {
    fetchMySchedule()
  }, [fetchMySchedule])

  const myQueueItems = liveQueueItems.length > 0 ? liveQueueItems : fallbackQueueItems.filter(q => {
    if (!q.therapistName || q.therapistName === 'ไม่ระบุ') return false
    return therapistName.includes(q.therapistName) || q.therapistName.includes(therapistName)
  })

  // In-service active jobs vs waiting vs completed
  const activeJobs = myQueueItems.filter(q => q.status === 'IN_SERVICE')
  const waitingJobs = myQueueItems.filter(q => ['WAITING', 'CHECKED_IN', 'CONFIRMED', 'CALLED', 'PENDING'].includes(q.status))
  const completedJobs = myQueueItems.filter(q => q.status === 'COMPLETED')

  const handleStart = async (item) => {
    setUpdatingId(item.queueId || item.queueNo)
    try {
      if (item.queueId) {
        const res = await api.post(`/therapist/queue/${item.queueId}/start?therapistId=${therapistId}`)
        if (res.success) {
          showNotification(lang === 'th' ? `เริ่มบริการคิว ${item.queueNo} สำเร็จ` : `Started service for queue ${item.queueNo}`)
          fetchMySchedule()
          return
        }
      }
      // Fallback
      updateQueueStatus(item.queueNo, 'IN_SERVICE')
      setLiveQueueItems(prev => prev.map(q => q.queueNo === item.queueNo ? { ...q, status: 'IN_SERVICE' } : q))
      showNotification(lang === 'th' ? `เริ่มบริการคิว ${item.queueNo} เรียบร้อย` : `Started service for ${item.queueNo}`)
    } catch (err) {
      alert(err.message || 'Error starting treatment')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleComplete = async (item) => {
    setUpdatingId(item.queueId || item.queueNo)
    try {
      if (item.queueId) {
        const res = await api.post(`/therapist/queue/${item.queueId}/complete?therapistId=${therapistId}`)
        if (res.success) {
          showNotification(lang === 'th' ? `จบงานคิว ${item.queueNo} — ห้องเข้าสู่โหมดทำความสะอาด 15 นาที` : `Completed service for queue ${item.queueNo}`)
          fetchMySchedule()
          return
        }
      }
      // Fallback
      updateQueueStatus(item.queueNo, 'COMPLETED')
      setLiveQueueItems(prev => prev.map(q => q.queueNo === item.queueNo ? { ...q, status: 'COMPLETED' } : q))
      showNotification(lang === 'th' ? `จบงานคิว ${item.queueNo} เรียบร้อย` : `Completed service for ${item.queueNo}`)
    } catch (err) {
      alert(err.message || 'Error completing treatment')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6 text-on-surface font-body-md">
      {/* Toast */}
      {notification && (
        <div className="p-3.5 bg-surface border border-outline-variant text-on-surface rounded-xl text-xs font-medium flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-charcoal-muted hover:text-on-surface cursor-pointer">✕</button>
        </div>
      )}

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

        <button
          onClick={fetchMySchedule}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs border border-outline-variant shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>sync</span>
          <span>{loading ? '...' : (lang === 'th' ? 'รีเฟรชคิว' : 'Refresh Queue')}</span>
        </button>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-2xl border border-outline-variant p-4 shadow-[var(--admin-shadow-sm)]">
          <div className="text-xs font-semibold text-charcoal-muted uppercase">{lang === 'th' ? 'กำลังนวดอยู่' : 'In Service'}</div>
          <div className="text-2xl font-headline font-bold text-teak-dark mt-1">{activeJobs.length}</div>
        </div>
        <div className="bg-surface rounded-2xl border border-outline-variant p-4 shadow-[var(--admin-shadow-sm)]">
          <div className="text-xs font-semibold text-charcoal-muted uppercase">{lang === 'th' ? 'คิวที่รอดำเนินการ' : 'Waiting Queues'}</div>
          <div className="text-2xl font-headline font-bold text-teak-dark mt-1">{waitingJobs.length}</div>
        </div>
        <div className="bg-surface rounded-2xl border border-outline-variant p-4 shadow-[var(--admin-shadow-sm)]">
          <div className="text-xs font-semibold text-charcoal-muted uppercase">{lang === 'th' ? 'ให้บริการเสร็จแล้ววันนี้' : 'Completed Today'}</div>
          <div className="text-2xl font-headline font-bold text-teak-dark mt-1">{completedJobs.length}</div>
        </div>
      </div>

      {/* Active Jobs in Progress */}
      {activeJobs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-teak-deep uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>{lang === 'th' ? 'งานที่กำลังให้บริการอยู่ขณะนี้' : 'Active Sessions In Progress'}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeJobs.map((item) => (
              <div key={item.queueNo} className="bg-surface rounded-2xl border border-outline-variant p-5 shadow-[var(--admin-shadow-sm)] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold font-headline px-2.5 py-0.5 bg-surface-container text-teak-deep rounded-lg border border-outline-variant">
                    {item.queueNo}
                  </span>
                  <StatusBadge status="IN_SERVICE" size="sm" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-teak-dark text-base">{item.customerName}</h3>
                  <div className="text-xs text-charcoal-muted">{item.serviceName} • {item.durationMinutes} นาที</div>
                  <div className="text-xs text-secondary font-medium mt-1">
                    {lang === 'th' ? 'ห้องบริการ:' : 'Assigned Room:'} <strong>{item.roomNo || '-'}</strong>
                  </div>
                </div>
                <button
                  onClick={() => handleComplete(item)}
                  disabled={updatingId === (item.queueId || item.queueNo)}
                  className="w-full py-2.5 rounded-xl bg-teak-dark text-warm-ivory hover:bg-teak-deep text-xs font-semibold transition-colors cursor-pointer text-center disabled:opacity-50"
                >
                  {updatingId === (item.queueId || item.queueNo) ? '...' : (lang === 'th' ? 'กดจบงานเมื่อให้บริการเสร็จสิ้น (Complete)' : 'Complete Treatment')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Waiting or Assigned Jobs */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider">
          {lang === 'th' ? 'คิวที่ได้รับมอบหมายและรอดำเนินการ' : 'Upcoming & Waiting Sessions'}
        </h2>
        {waitingJobs.length === 0 ? (
          <div className="bg-surface rounded-2xl p-8 text-center border border-outline-variant text-charcoal-muted">
            {lang === 'th' ? 'ไม่มีคิวที่รอเริ่มงานในขณะนี้' : 'No upcoming sessions waiting right now'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {waitingJobs.map((item) => (
              <div key={item.queueNo} className="bg-surface rounded-2xl border border-outline-variant p-5 shadow-[var(--admin-shadow-sm)] space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold font-headline px-2.5 py-0.5 bg-surface-container text-teak-deep rounded-lg border border-outline-variant">
                      {item.queueNo}
                    </span>
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                  <div className="mt-3 space-y-1">
                    <h3 className="font-semibold text-teak-dark text-base">{item.customerName}</h3>
                    <div className="text-xs text-charcoal-muted">{item.serviceName} • {item.durationMinutes} นาที</div>
                    <div className="text-xs text-secondary font-medium mt-1">
                      {lang === 'th' ? 'ห้องบริการ:' : 'Assigned Room:'} <strong>{item.roomNo || '-'}</strong>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleStart(item)}
                  disabled={updatingId === (item.queueId || item.queueNo)}
                  className="w-full py-2 rounded-xl bg-teak-dark text-warm-ivory hover:bg-teak-deep text-xs font-semibold transition-colors cursor-pointer text-center disabled:opacity-50"
                >
                  {updatingId === (item.queueId || item.queueNo) ? '...' : (lang === 'th' ? 'เริ่มนวด (Start Service)' : 'Start Service')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Jobs History */}
      {completedJobs.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-outline-variant">
          <h2 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider">
            {lang === 'th' ? 'ประวัติงานที่เสร็จสิ้นแล้ววันนี้' : 'Completed Sessions Today'}
          </h2>
          <div className="bg-surface rounded-2xl border border-outline-variant overflow-hidden">
            <div className="divide-y divide-outline-variant/60 text-xs">
              {completedJobs.map(item => (
                <div key={item.queueNo} className="p-3.5 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                  <div>
                    <span className="font-semibold text-teak-dark mr-2">{item.queueNo}</span>
                    <span className="text-on-surface">{item.customerName}</span>
                    <span className="text-charcoal-muted ml-2">({item.serviceName})</span>
                  </div>
                  <StatusBadge status="COMPLETED" size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
