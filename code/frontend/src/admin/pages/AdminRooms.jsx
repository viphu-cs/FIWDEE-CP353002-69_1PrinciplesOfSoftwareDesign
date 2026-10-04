import React, { useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

export default function AdminRooms({ onOpenRoomModal }) {
  const { rooms, updateRoomStatus } = useAdminAuth()
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')

  const filteredRooms = rooms.filter(room => {
    if (statusFilter !== 'ALL' && room.status !== statusFilter) return false
    if (typeFilter !== 'ALL' && room.type !== typeFilter) return false
    return true
  })

  return (
    <div className="space-y-6 text-stone-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headline font-bold text-stone-900">
            ผังห้องนวด Real-time (Rooms Management)
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            ติดตามการใช้งานห้องนวด (Single / Couple / VIP / Foot Massage) และสถานะทำความสะอาด
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-stone-500 uppercase">สถานะห้อง:</span>
          {['ALL', 'AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                statusFilter === st
                  ? 'bg-amber-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-500 uppercase">ประเภทห้อง:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-300 bg-stone-50 text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer"
          >
            <option value="ALL">ทุกประเภทห้อง</option>
            <option value="SINGLE">SINGLE (เดี่ยว)</option>
            <option value="COUPLE">COUPLE (คู่)</option>
            <option value="VIP">VIP (วิไอพี)</option>
            <option value="FOOT_MASSAGE">FOOT_MASSAGE (เก้าอี้นวดเท้า)</option>
          </select>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            className={`bg-white rounded-2xl border p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
              room.status === 'OCCUPIED'
                ? 'border-amber-300 bg-amber-50/20'
                : room.status === 'AVAILABLE'
                ? 'border-emerald-200'
                : room.status === 'CLEANING'
                ? 'border-sky-200'
                : 'border-stone-300 bg-stone-50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold font-headline text-stone-900">{room.id}</span>
                  <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-600 border border-stone-200">
                    {room.type}
                  </span>
                </div>
                <StatusBadge status={room.status} size="sm" />
              </div>

              <h3 className="font-bold text-stone-800 text-base mt-2">{room.name}</h3>

              {room.status === 'OCCUPIED' ? (
                <div className="mt-4 p-3.5 bg-amber-100/60 rounded-xl border border-amber-200/80 space-y-1.5 text-xs">
                  <div className="font-bold text-amber-950 text-sm">บริการ: {room.service}</div>
                  <div className="text-stone-700">หมอนวด: <strong>{room.therapist}</strong></div>
                  <div className="text-stone-600 text-[11px]">รหัสการจอง: {room.currentBooking}</div>
                  <div className="text-amber-900 font-semibold text-[11px]">เวลาใช้งาน: {room.startTime} - {room.endTime} น. ({room.duration} นาที)</div>
                </div>
              ) : room.status === 'CLEANING' ? (
                <div className="mt-4 p-3.5 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900 space-y-1">
                  <div className="font-semibold">พนักงานกำลังทำความสะอาดและอบฆ่าเชื้อ</div>
                  <div className="text-[11px] text-sky-700">คาดว่าพร้อมใช้ภายใน 10 นาที</div>
                </div>
              ) : room.status === 'MAINTENANCE' ? (
                <div className="mt-4 p-3.5 bg-stone-100 rounded-xl border border-stone-200 text-xs text-stone-600">
                  {room.note || 'งดให้บริการชั่วคราว'}
                </div>
              ) : (
                <div className="mt-4 p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-xs text-emerald-900">
                  ห้องว่างสะอาด พร้อมจัดต้อนรับลูกค้าใหม่
                </div>
              )}
            </div>

            {/* Status Quick Actions */}
            <div className="pt-3 border-t border-stone-100 space-y-2">
              <div className="text-[11px] font-semibold text-stone-500 uppercase">อัปเดตสถานะห้องสด:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateRoomStatus(room.id, 'AVAILABLE')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                    room.status === 'AVAILABLE' ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-stone-50 text-stone-700 hover:bg-emerald-50'
                  }`}
                >
                  ตั้งเป็น พร้อมใช้
                </button>
                <button
                  onClick={() => updateRoomStatus(room.id, 'CLEANING')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                    room.status === 'CLEANING' ? 'bg-sky-700 text-white border-sky-700' : 'bg-stone-50 text-stone-700 hover:bg-sky-50'
                  }`}
                >
                  ทำความสะอาด
                </button>
                <button
                  onClick={() => onOpenRoomModal(room)}
                  className="col-span-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer text-center"
                >
                  แก้ไขสถานะ / จัดคิวเข้าห้อง
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
