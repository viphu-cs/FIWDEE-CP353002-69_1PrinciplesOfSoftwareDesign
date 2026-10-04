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
    <div className="space-y-6 text-stone-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headline font-bold text-stone-900">
            ตารางจัดการนัดหมายและการจองคิว (Bookings)
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            ค้นหา ตรวจสอบสถานะการชำระเงิน และอัปเดตนัดหมายล่วงหน้าของลูกค้า
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {['ALL', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_SERVICE', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                statusFilter === st
                  ? 'bg-amber-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
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
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-800/40"
          />
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="absolute left-3 top-3 text-stone-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-900 text-stone-200 text-xs uppercase tracking-wider font-semibold border-b border-stone-800">
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
            <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-stone-500">
                    ไม่พบข้อมูลรายการจอง
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-900">
                      <div>{b.id}</div>
                      <div className="text-[10px] text-stone-500 font-sans font-normal">คิว: {b.queueNo} ({b.channel})</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-900">{b.customerName}</div>
                      <div className="text-stone-500 text-[11px]">{b.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-stone-800">{b.serviceName}</div>
                      <div className="text-stone-500 text-[10px]">{b.durationMinutes} นาที • ฿{b.price}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-800">{b.time} น.</div>
                      <div className="text-stone-500 text-[10px]">{b.date}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-stone-800 font-medium">หมอ: {b.therapistName}</div>
                      <div className="text-stone-500 text-[10px]">ห้อง: {b.roomNo || 'ไม่ระบุ'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleTogglePayment(b.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                          b.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
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
                        className="px-2 py-1 rounded-lg border border-stone-300 bg-stone-50 text-[11px] font-semibold text-stone-800 focus:outline-none cursor-pointer"
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
