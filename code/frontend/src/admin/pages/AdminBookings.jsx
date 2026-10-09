import React, { useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

export default function AdminBookings() {
  const { bookings, setBookings } = useAdminAuth()
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const handleUpdateStatus = (bookingId, newStatus) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
  }

  const handleTogglePayment = (bookingId) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, paymentStatus: b.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID' } : b))
  }

  const filteredBookings = bookings.filter(b => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return (
        b.id.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.serviceName.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="space-y-6 text-on-surface">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headline font-bold text-teak-deep">
            ตารางจัดการนัดหมายและการจองคิว (Bookings)
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
            ค้นหา ตรวจสอบสถานะการชำระเงิน และอัปเดตนัดหมายล่วงหน้าของลูกค้า
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface rounded-2xl p-4 border border-outline-variant shadow-[var(--admin-shadow-sm)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {['ALL', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_SERVICE', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                statusFilter === st
                  ? 'bg-teak-dark text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {st === 'ALL' ? 'ทั้งหมด' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="ค้นหารหัสจอง BKG- / ชื่อ / เบอร์..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-xs placeholder:text-charcoal-muted hover:border-wood-deep"
          />
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="absolute left-3 top-3 text-charcoal-muted">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-surface rounded-2xl border border-outline-variant shadow-[var(--admin-shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-teak-deep text-warm-ivory text-xs uppercase tracking-wider font-semibold border-b border-teak-dark">
                <th className="py-3.5 px-4">รหัสการจอง / คิว</th>
                <th className="py-3.5 px-4">ลูกค้า & เบอร์โทร</th>
                <th className="py-3.5 px-4">รายการบริการ</th>
                <th className="py-3.5 px-4">วัน - เวลา</th>
                <th className="py-3.5 px-4">ผู้ให้บริการ / ห้อง</th>
                <th className="py-3.5 px-4">การชำระเงิน</th>
                <th className="py-3.5 px-4">สถานะ</th>
                <th className="py-3.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-xs text-on-surface">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-charcoal-muted">
                    ไม่พบข้อมูลรายการจอง
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="admin-table-row transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-wood-deep">
                      <div>{b.id}</div>
                      <div className="text-[10px] text-charcoal-muted font-sans font-normal">คิว: {b.queueNo} ({b.channel})</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-teak-deep">{b.customerName}</div>
                      <div className="text-charcoal-muted text-[11px]">{b.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-on-surface">{b.serviceName}</div>
                      <div className="text-charcoal-muted text-[10px]">{b.durationMinutes} นาที • ฿{b.price}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-on-surface">{b.time} น.</div>
                      <div className="text-charcoal-muted text-[10px]">{b.date}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-on-surface font-medium">หมอ: {b.therapistName}</div>
                      <div className="text-charcoal-muted text-[10px]">ห้อง: {b.roomNo || 'ไม่ระบุ'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleTogglePayment(b.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                          b.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-terracotta-soft text-terracotta-deep border-terracotta/30 hover:bg-terracotta/15'
                        }`}
                      >
                        {b.paymentStatus === 'PAID' ? 'ชำระแล้ว' : 'ยังไม่ชำระ'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={b.status}
                        onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-outline-variant bg-surface-container-low text-[11px] font-semibold text-on-surface hover:border-wood-deep cursor-pointer"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="CHECKED_IN">CHECKED_IN</option>
                        <option value="IN_SERVICE">IN_SERVICE</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
