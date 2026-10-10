import React, { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import StatusBadge from '../components/StatusBadge.jsx'
import { api } from '../../lib/api.js'

export default function AdminRooms({ onOpenRoomModal }) {
  const { rooms: fallbackRooms, updateRoomStatus: updateLocalRoomStatus } = useAdminAuth()
  const { lang, t } = useLanguage()
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [cleaningNotice, setCleaningNotice] = useState(null)
  const [liveRooms, setLiveRooms] = useState([])
  const [loading, setLoading] = useState(false)

  const showNotice = (msg) => {
    setCleaningNotice(msg)
    setTimeout(() => setCleaningNotice(null), 3500)
  }

  const fetchRooms = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/rooms')
      if (res && res.success && Array.isArray(res.data)) {
        const mapped = res.data.map(r => ({
          id: r.roomNumber || `RM-${r.id}`,
          backendId: r.id,
          name: `ห้อง ${r.roomNumber}`,
          type: r.roomType || 'SINGLE',
          status: r.roomStatus || 'AVAILABLE',
          capacity: r.capacity || 1,
          cleaningBufferMinutes: r.cleaningBufferMinutes || 15,
          currentBooking: null,
          therapist: null,
          service: null
        }))
        setLiveRooms(mapped)
      } else {
        setLiveRooms([])
      }
    } catch {
      setLiveRooms([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  const displayRooms = liveRooms

  const handleUpdateStatus = async (room, newStatus) => {
    if (room.backendId) {
      try {
        const res = await api.patch(`/admin/rooms/${room.backendId}/status`, { roomStatus: newStatus })
        if (res && res.success) {
          fetchRooms()
          showNotice(lang === 'th' ? `อัปเดตสถานะห้อง ${room.id} เป็น ${newStatus} สำเร็จ` : `Room ${room.id} marked ${newStatus}`)
          return
        }
      } catch (err) {
        console.warn('Backend room status update failed, falling back:', err)
      }
    }

    // Fallback update
    updateLocalRoomStatus(room.id, newStatus)
    setLiveRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: newStatus } : r))
    showNotice(lang === 'th' ? `อัปเดตสถานะห้อง ${room.id} เรียบร้อย` : `Room ${room.id} updated`)
  }

  const handleFinishCleaning = (room) => {
    handleUpdateStatus(room, 'AVAILABLE')
  }

  const filteredRooms = displayRooms.filter(room => {
    if (statusFilter !== 'ALL' && room.status !== statusFilter) return false
    if (typeFilter !== 'ALL' && room.type !== typeFilter) return false
    return true
  })

  const roomTypeLabel = (type) => {
    switch (type) {
      case 'SINGLE': return t('admin.roomSingle')
      case 'COUPLE': return t('admin.roomCouple')
      case 'VIP': return t('admin.roomVip')
      case 'FOOT_MASSAGE': return t('admin.roomFoot')
      default: return type
    }
  }

  return (
    <div className="space-y-6 text-on-surface font-body-md">
      {/* Toast Notice */}
      {cleaningNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <span>{cleaningNotice}</span>
          <button onClick={() => setCleaningNotice(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-semibold text-teak-dark">
            {t('admin.rooms')}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
            {lang === 'th'
              ? 'ติดตามการใช้งานห้องนวด (Single / Couple / VIP / Foot) และการเว้นระยะทำความสะอาด 15 นาที (Dynamic Resource Principle)'
              : 'Real-time room occupancy management with dynamic 15-minute sanitization turnaround buffers'}
          </p>
        </div>

        <button
          onClick={fetchRooms}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs border border-outline-variant shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>sync</span>
          <span>{loading ? '...' : (lang === 'th' ? 'รีเฟรชผังห้อง' : 'Refresh Rooms')}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-2xl p-4 border border-outline-variant shadow-[var(--admin-shadow-sm)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-charcoal-muted uppercase mr-1">{t('admin.filterRoomStatus')}</span>
          {['ALL', 'AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                statusFilter === st
                  ? 'bg-teak-dark text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {st === 'ALL' ? (lang === 'th' ? 'ทั้งหมด' : 'All') : st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-charcoal-muted uppercase">{t('admin.filterRoomType')}</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-outline-variant bg-surface-container-low text-xs font-semibold text-on-surface hover:border-wood-deep cursor-pointer focus:bg-surface"
          >
            <option value="ALL">{t('admin.allRooms')}</option>
            <option value="SINGLE">SINGLE</option>
            <option value="COUPLE">COUPLE</option>
            <option value="VIP">VIP</option>
            <option value="FOOT_MASSAGE">FOOT_MASSAGE</option>
          </select>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRooms.length === 0 ? (
          <div className="col-span-full bg-surface rounded-2xl p-12 text-center border border-outline-variant text-charcoal-muted shadow-[var(--admin-shadow-sm)]">
            <p className="font-medium text-sm">{t('admin.noMatchingRecords')}</p>
          </div>
        ) : (
          filteredRooms.map((room) => (
          <div
            key={room.id}
            className="bg-surface rounded-2xl border border-outline-variant p-5 shadow-[var(--admin-shadow-sm)] hover:border-outline transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-teak-deep">{room.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-surface-container text-charcoal-muted border border-outline-variant/60">
                    {room.type}
                  </span>
                </div>
                <StatusBadge status={room.status} size="sm" />
              </div>

              <h2 className="font-semibold text-teak-deep text-sm mt-2">{room.name}</h2>
              <p className="text-[11px] text-charcoal-muted">{roomTypeLabel(room.type)}</p>

              {room.status === 'OCCUPIED' ? (
                <div className="mt-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/70 space-y-1.5 text-xs">
                  <div className="font-medium text-teak-deep">{room.service || 'กำลังให้บริการ'}</div>
                  <div className="text-charcoal-muted">หมอนวด: <strong className="text-on-surface font-medium">{room.therapist || '—'}</strong></div>
                  {room.currentBooking && <div className="text-charcoal-muted text-[11px]">รหัสการจอง: {room.currentBooking}</div>}
                  {room.startTime && <div className="text-charcoal-muted text-[11px]">เวลาใช้งาน: {room.startTime} - {room.endTime} น. ({room.duration} {t('admin.minuteShort')})</div>}
                </div>
              ) : room.status === 'CLEANING' ? (
                <div className="mt-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/70 text-xs space-y-2">
                  <div className="font-medium text-amber-900 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{t('admin.cleaningCountdown', { m: room.cleaningBufferMinutes || 15 })}</span>
                  </div>
                  <p className="text-[11px] text-charcoal-muted">
                    {lang === 'th' ? 'เปลี่ยนผ้าปู เติมน้ำมันหอม และอบฆ่าเชื้อตามมาตรฐานสุขอนามัย' : 'Sanitizing, changing linens, and aerating room'}
                  </p>
                  <button
                    onClick={() => handleFinishCleaning(room)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface font-medium text-xs transition-colors cursor-pointer"
                  >
                    {t('admin.finishCleaning')}
                  </button>
                </div>
              ) : room.status === 'MAINTENANCE' ? (
                <div className="mt-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/70 text-xs text-charcoal-muted">
                  {room.note || (lang === 'th' ? 'งดให้บริการชั่วคราวเพื่อซ่อมบำรุง' : 'Temporarily offline for maintenance')}
                </div>
              ) : (
                <div className="mt-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/70 text-xs text-charcoal-muted flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>{lang === 'th' ? 'ห้องสะอาดพร้อมให้บริการ' : 'Clean and ready for next arrival'}</span>
                </div>
              )}
            </div>

            {/* Status Quick Actions */}
            <div className="pt-3 border-t border-outline-variant space-y-2">
              <div className="text-[11px] font-medium text-charcoal-muted uppercase">{t('admin.roomStatusChange')}</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleUpdateStatus(room, 'AVAILABLE')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer border ${
                    room.status === 'AVAILABLE'
                      ? 'bg-surface-container-high text-teak-deep border-outline font-semibold'
                      : 'bg-surface-container-low text-charcoal-muted border-outline-variant hover:bg-surface-container'
                  }`}
                >
                  {t('admin.available')}
                </button>
                <button
                  onClick={() => handleUpdateStatus(room, 'CLEANING')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer border ${
                    room.status === 'CLEANING'
                      ? 'bg-surface-container-high text-teak-deep border-outline font-semibold'
                      : 'bg-surface-container-low text-charcoal-muted border-outline-variant hover:bg-surface-container'
                  }`}
                >
                  {t('admin.cleaning')}
                </button>
                <button
                  onClick={() => onOpenRoomModal && onOpenRoomModal(room)}
                  className="col-span-2 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant transition-colors cursor-pointer text-center"
                >
                  {lang === 'th' ? 'แก้ไขรายละเอียดห้อง / จัดการผัง' : 'Edit Room Details'}
                </button>
              </div>
            </div>
          </div>
        )))}
      </div>
    </div>
  )
}
