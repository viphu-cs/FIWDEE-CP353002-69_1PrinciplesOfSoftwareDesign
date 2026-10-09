import React, { useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import StatusBadge from '../components/StatusBadge.jsx'

export default function AdminRooms({ onOpenRoomModal }) {
  const { rooms, updateRoomStatus } = useAdminAuth()
  const { lang, t } = useLanguage()
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [cleaningNotice, setCleaningNotice] = useState(null)

  const showNotice = (msg) => {
    setCleaningNotice(msg)
    setTimeout(() => setCleaningNotice(null), 3500)
  }

  const handleFinishCleaning = (roomId) => {
    updateRoomStatus(roomId, 'AVAILABLE')
    showNotice(lang === 'th' ? `ห้อง ${roomId} ทำความสะอาดเสร็จสิ้น พร้อมรับลูกค้าใหม่แล้ว` : `Room ${roomId} cleaning complete and marked AVAILABLE`)
  }

  const filteredRooms = rooms.filter(room => {
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
        {filteredRooms.map((room) => (
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
                  <div className="font-medium text-teak-deep">{room.service}</div>
                  <div className="text-charcoal-muted">หมอนวด: <strong className="text-on-surface font-medium">{room.therapist}</strong></div>
                  <div className="text-charcoal-muted text-[11px]">รหัสการจอง: {room.currentBooking}</div>
                  <div className="text-charcoal-muted text-[11px]">เวลาใช้งาน: {room.startTime} - {room.endTime} น. ({room.duration} {t('admin.minuteShort')})</div>
                </div>
              ) : room.status === 'CLEANING' ? (
                <div className="mt-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/70 text-xs space-y-2">
                  <div className="font-medium text-amber-900 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{t('admin.cleaningCountdown', { m: 12 })}</span>
                  </div>
                  <p className="text-[11px] text-charcoal-muted">
                    {lang === 'th' ? 'เปลี่ยนผ้าปู เติมน้ำมันหอม และอบฆ่าเชื้อตามมาตรฐานสุขอนามัย' : 'Sanitizing, changing linens, and aerating room'}
                  </p>
                  <button
                    onClick={() => handleFinishCleaning(room.id)}
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
                  onClick={() => updateRoomStatus(room.id, 'AVAILABLE')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer border ${
                    room.status === 'AVAILABLE'
                      ? 'bg-surface-container-high text-teak-deep border-outline font-semibold'
                      : 'bg-surface-container-low text-charcoal-muted border-outline-variant hover:bg-surface-container'
                  }`}
                >
                  {t('admin.available')}
                </button>
                <button
                  onClick={() => updateRoomStatus(room.id, 'CLEANING')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer border ${
                    room.status === 'CLEANING'
                      ? 'bg-surface-container-high text-teak-deep border-outline font-semibold'
                      : 'bg-surface-container-low text-charcoal-muted border-outline-variant hover:bg-surface-container'
                  }`}
                >
                  {t('admin.cleaning')}
                </button>
                <button
                  onClick={() => onOpenRoomModal(room)}
                  className="col-span-2 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant transition-colors cursor-pointer text-center"
                >
                  {lang === 'th' ? 'แก้ไขรายละเอียดห้อง / จัดการผัง' : 'Edit Room Details'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
