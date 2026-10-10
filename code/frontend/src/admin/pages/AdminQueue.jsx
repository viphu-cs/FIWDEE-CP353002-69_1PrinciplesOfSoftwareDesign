import React, { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import StatusBadge from '../components/StatusBadge.jsx'
import { api } from '../../lib/api.js'

export default function AdminQueue({ onOpenWalkInModal, onOpenAssignModal }) {
  const { queueItems: fallbackQueueItems, updateQueueStatus: updateLocalQueueStatus, rooms, updateRoomStatus } = useAdminAuth()
  const { lang, t } = useLanguage()
  const [activeTab, setActiveTab] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [notification, setNotification] = useState(null)
  const [loading, setLoading] = useState(false)
  const [liveQueueItems, setLiveQueueItems] = useState([])

  const showNotification = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 4000)
  }

  const fetchDailyQueue = useCallback(async () => {
    setLoading(true)
    try {
      const todayStr = new Date().toISOString().slice(0, 10)
      const res = await api.get(`/admin/queue?date=${todayStr}`)
      if (res && res.success && Array.isArray(res.data)) {
        const mapped = res.data.map((q) => {
          const timeFormatted = q.scheduledStartDateTime
            ? new Date(q.scheduledStartDateTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
            : (q.checkInTime ? new Date(q.checkInTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-')

          return {
            queueId: q.queueId,
            queueNo: q.queueNumber || `Q-${q.queueId}`,
            bookingCode: q.bookingId ? `BK-${q.bookingId}` : '-',
            bookingId: q.bookingId,
            customerName: q.customerName || 'ลูกค้าหน้าร้าน',
            phone: '—',
            serviceName: q.serviceName || 'นวดแผนไทย',
            durationMinutes: 60,
            therapistName: q.therapistName || null,
            roomNo: q.roomNumber || null,
            status: q.queueStatus, // WAITING, CALLED, IN_SERVICE, COMPLETED, CANCELLED
            type: 'ONLINE',
            time: timeFormatted,
            price: 600,
          }
        })
        setLiveQueueItems(mapped)
      } else {
        setLiveQueueItems([])
      }
    } catch {
      setLiveQueueItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDailyQueue()
  }, [fetchDailyQueue])

  // Current display items from live DB
  const displayItems = liveQueueItems

  const handleCallNext = async () => {
    try {
      const res = await api.post('/admin/queue/call-next')
      if (res.success && res.data) {
        showNotification(`${t('admin.callNextSuccess')}: ${res.data.queueNumber || 'Next'}`)
        fetchDailyQueue()
        return
      }
    } catch {
      // Fallback to local queue items
    }

    const nextItem = displayItems.find(q => q.status === 'WAITING' || q.status === 'PENDING')
    if (nextItem) {
      updateLocalQueueStatus(nextItem.queueNo, 'CHECKED_IN')
      showNotification(`${t('admin.callNextSuccess')}: ${nextItem.queueNo} (${nextItem.customerName})`)
    } else {
      showNotification(lang === 'th' ? 'ไม่มีคิวที่รอดำเนินการในขณะนี้' : 'No pending queues waiting at the moment')
    }
  }

  const handleUpdateStatus = async (item, newStatus) => {
    // 1. Try Backend API first if queueId is available
    if (item.queueId) {
      try {
        const res = await api.patch(`/admin/queue/${item.queueId}/status`, { status: newStatus })
        if (res.success) {
          fetchDailyQueue()
          return
        }
      } catch (err) {
        console.warn('Backend queue status error, falling back to local state:', err)
      }
    }

    // 2. Fallback to context
    updateLocalQueueStatus(item.queueNo, newStatus)
    setLiveQueueItems(prev => prev.map(q => q.queueNo === item.queueNo ? { ...q, status: newStatus } : q))
  }

  const handleStartService = (item) => {
    if (!item.therapistName || item.therapistName === 'ไม่ระบุ' || !item.roomNo) {
      if (onOpenAssignModal) {
        onOpenAssignModal(item)
      } else {
        alert(lang === 'th' ? 'กรุณาระบุหมอนวดและห้องนวดก่อนเริ่มบริการ' : 'Please assign room and therapist before starting service')
      }
    } else {
      try {
        handleUpdateStatus(item, 'IN_SERVICE')
        // Automatically set room to OCCUPIED
        if (item.roomNo && updateRoomStatus) {
          updateRoomStatus(item.roomNo, 'OCCUPIED')
        }
        showNotification(lang === 'th' ? `เริ่มบริการคิว ${item.queueNo} เข้าห้อง ${item.roomNo}` : `Started queue ${item.queueNo} in room ${item.roomNo}`)
      } catch (err) {
        alert(err.message || (lang === 'th' ? 'ไม่สามารถเริ่มนวดได้' : 'Cannot start treatment'))
      }
    }
  }

  const handleCompleteService = (item) => {
    try {
      handleUpdateStatus(item, 'COMPLETED')
      // Rule: Completed service triggers 15-minute CLEANING buffer on room
      if (item.roomNo && updateRoomStatus) {
        updateRoomStatus(item.roomNo, 'CLEANING')
      }
      showNotification(lang === 'th'
        ? `จบบริการคิว ${item.queueNo} — ห้อง ${item.roomNo || ''} เข้าสู่โหมดทำความสะอาด 15 นาทีอัตโนมัติ`
        : `Completed service ${item.queueNo} — room entered 15-min sanitization cleaning buffer`)
    } catch (err) {
      alert(err.message || 'Error completing service')
    }
  }

  const filteredItems = displayItems.filter((item) => {
    if (activeTab === 'WAITING' && !(item.status === 'WAITING' || item.status === 'PENDING' || item.status === 'CHECKED_IN' || item.status === 'CALLED')) return false
    if (activeTab === 'IN_SERVICE' && item.status !== 'IN_SERVICE') return false
    if (activeTab === 'COMPLETED' && item.status !== 'COMPLETED') return false
    if (activeTab === 'CANCELLED' && item.status !== 'CANCELLED') return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        item.queueNo.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        (item.phone && item.phone.includes(q)) ||
        item.serviceName.toLowerCase().includes(q)
      )
    }

    return true
  })

  return (
    <div className="space-y-6 text-on-surface font-body-md">
      {/* Toast Notification */}
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
          <h1 className="text-2xl font-headline font-semibold text-teak-deep">
            {t('admin.queue')}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
            {lang === 'th'
              ? 'จัดการเรียกคิว เช็คอินลูกค้านวดไทย-อโรมา และส่งเข้าห้องนวดแบบ Real-time'
              : 'Live front-desk queue management, check-in, and treatment room allocation'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchDailyQueue}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs border border-outline-variant shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="รีเฟรชคิวสดจากเซิร์ฟเวอร์"
          >
            <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>sync</span>
            <span>{loading ? '...' : (lang === 'th' ? 'รีเฟรช' : 'Refresh')}</span>
          </button>

          <button
            onClick={handleCallNext}
            className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs border border-outline-variant shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <span>{t('admin.callNext')}</span>
          </button>

          <button
            onClick={onOpenWalkInModal}
            className="px-4 py-2.5 rounded-xl bg-teak-dark text-warm-ivory hover:bg-teak-deep font-semibold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>{t('admin.addQueue')}</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Tabs & Search */}
      <div className="bg-surface rounded-2xl p-4 border border-outline-variant shadow-[var(--admin-shadow-sm)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { key: 'ALL', label: lang === 'th' ? 'ทั้งหมด' : 'All', count: displayItems.length },
            { key: 'WAITING', label: t('admin.waiting'), count: displayItems.filter(q => ['WAITING', 'PENDING', 'CHECKED_IN', 'CALLED'].includes(q.status)).length },
            { key: 'IN_SERVICE', label: t('admin.inService'), count: displayItems.filter(q => q.status === 'IN_SERVICE').length },
            { key: 'COMPLETED', label: t('admin.completed'), count: displayItems.filter(q => q.status === 'COMPLETED').length },
            { key: 'CANCELLED', label: t('admin.cancelled'), count: displayItems.filter(q => q.status === 'CANCELLED').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? 'bg-teak-dark text-warm-ivory shadow-xs'
                  : 'bg-surface-container-low text-charcoal-muted hover:bg-surface-container'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${activeTab === tab.key ? 'bg-white/20 text-warm-ivory' : 'bg-surface-container text-charcoal-muted'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder={t('admin.searchBookingPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-xs placeholder:text-charcoal-muted hover:border-wood-deep focus:bg-surface"
          />
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="absolute left-3 top-3 text-charcoal-muted">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Queue Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full bg-surface rounded-2xl p-12 text-center border border-outline-variant text-charcoal-muted shadow-[var(--admin-shadow-sm)]">
            <p className="font-medium text-sm">{t('admin.noMatchingRecords')}</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.queueNo}
              className="bg-surface rounded-2xl border border-outline-variant p-5 flex flex-col justify-between space-y-4 shadow-[var(--admin-shadow-sm)] hover:border-outline transition-all"
            >
              {/* Card Top Header */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold font-headline px-2.5 py-0.5 bg-surface-container text-teak-deep rounded-lg border border-outline-variant">
                      {item.queueNo}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-surface-container-low text-charcoal-muted border border-outline-variant/60">
                      {item.type || 'ONLINE'}
                    </span>
                  </div>
                  <StatusBadge status={item.status} size="sm" />
                </div>

                {/* Customer Details */}
                <div className="mt-3 space-y-1">
                  <h3 className="font-semibold text-teak-dark text-base">{item.customerName}</h3>
                  <div className="text-xs text-charcoal-muted flex items-center gap-2">
                    {item.phone && item.phone !== '—' && (
                      <>
                        <span>{t('admin.phone')}: {item.phone}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{item.time} น.</span>
                  </div>
                </div>

                {/* Service Details */}
                <div className="mt-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant text-xs space-y-1.5">
                  <div className="font-semibold text-on-surface flex items-center justify-between">
                    <span>{item.serviceName}</span>
                    <span className="font-bold text-secondary">฿{item.price}</span>
                  </div>
                  <div className="text-charcoal-muted text-[11px] flex items-center justify-between">
                    <span>{t('admin.duration')}: {item.durationMinutes} {t('admin.minuteShort')}</span>
                    <span>{item.bookingCode || ''}</span>
                  </div>
                  <div className="text-on-surface-variant text-[11px]">
                    {t('admin.therapist')}: <strong className="text-on-surface">{item.therapistName || (lang === 'th' ? 'ยังไม่ได้ระบุ' : 'Unassigned')}</strong>
                  </div>
                  <div className="text-on-surface-variant text-[11px] flex items-center justify-between">
                    <span>{t('admin.room')}: <strong className="text-on-surface">{item.roomNo || (lang === 'th' ? 'ยังไม่ได้ระบุ' : 'Unassigned')}</strong></span>
                    {!item.roomNo && item.status !== 'COMPLETED' && (
                      <span className="text-[10px] text-terracotta-muted font-bold">⚠️ {lang === 'th' ? 'รอห้อง' : 'Needs room'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons for Queue */}
              <div className="pt-2 border-t border-outline-variant flex flex-wrap items-center gap-2">
                {item.status === 'WAITING' || item.status === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => showNotification(lang === 'th' ? `เรียกคิว [${item.queueNo}] คุณ${item.customerName} เข้าจุดต้อนรับ` : `Called queue ${item.queueNo} to reception`)}
                      className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant text-xs font-medium transition-colors cursor-pointer"
                    >
                      {t('admin.callNext')}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(item, 'CHECKED_IN')}
                      className="px-3 py-1.5 rounded-xl bg-teak-dark text-warm-ivory hover:bg-teak-deep text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {t('admin.checkedIn')}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(item, 'CANCELLED')}
                      className="px-2.5 py-1.5 rounded-xl text-charcoal-muted hover:bg-rose-50 hover:text-rose-700 text-xs font-medium transition-colors cursor-pointer ml-auto"
                    >
                      {t('admin.cancelled')}
                    </button>
                  </>
                ) : item.status === 'CHECKED_IN' || item.status === 'CALLED' ? (
                  <>
                    <button
                      onClick={() => handleStartService(item)}
                      className="w-full px-3 py-2 rounded-xl bg-teak-dark text-warm-ivory hover:bg-teak-deep text-xs font-semibold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      <span>{lang === 'th' ? 'เริ่มบริการ (เข้าห้องบริการ)' : 'Start Service'}</span>
                      <span>→</span>
                    </button>
                  </>
                ) : item.status === 'IN_SERVICE' ? (
                  <>
                    <button
                      onClick={() => handleCompleteService(item)}
                      className="w-full px-3 py-2 rounded-xl bg-teak-deep text-warm-ivory hover:bg-teak-dark text-xs font-semibold transition-colors cursor-pointer text-center"
                    >
                      {lang === 'th' ? 'นวดเสร็จสิ้น (เข้าสู่โหมดทำความสะอาด 15 นาที)' : 'Complete Treatment (15m Cleaning Trigger)'}
                    </button>
                  </>
                ) : (
                  <div className="text-[11px] text-charcoal-muted font-medium italic">
                    ✓ {lang === 'th' ? 'สถานะเสร็จสิ้นสมบูรณ์' : 'Service completed'}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
