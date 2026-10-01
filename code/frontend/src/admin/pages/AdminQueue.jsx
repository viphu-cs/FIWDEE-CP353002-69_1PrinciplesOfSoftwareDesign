import React, { useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

export default function AdminQueue({ onOpenWalkInModal, onOpenAssignModal }) {
  const { queueItems, updateQueueStatus } = useAdminAuth()
  const [activeTab, setActiveTab] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const handleStartService = (item) => {
    // If therapist is unassigned ('ไม่ระบุ') or room is not set, open assignment modal
    if (!item.therapistName || item.therapistName === 'ไม่ระบุ' || !item.roomNo) {
      if (onOpenAssignModal) {
        onOpenAssignModal(item)
      } else {
        alert('กรุณาระบุหมอนวดและห้องนวดก่อนเริ่มบริการ')
      }
    } else {
      try {
        updateQueueStatus(item.queueNo, 'IN_SERVICE')
      } catch (err) {
        alert(err.message || 'ไม่สามารถเริ่มนวดได้')
      }
    }
  }

  const filteredItems = queueItems.filter((item) => {
    if (activeTab === 'WAITING' && !(item.status === 'WAITING' || item.status === 'PENDING' || item.status === 'CHECKED_IN')) return false
    if (activeTab === 'IN_SERVICE' && item.status !== 'IN_SERVICE') return false
    if (activeTab === 'COMPLETED' && item.status !== 'COMPLETED') return false
    if (activeTab === 'CANCELLED' && item.status !== 'CANCELLED') return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        item.queueNo.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.phone.includes(q) ||
        item.serviceName.toLowerCase().includes(q)
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
            จัดการคิวสด (Live Queue Board)
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            จัดการเรียกคิว เช็คอินลูกค้านวดไทย-อโรมา และส่งเข้าห้องนวดแบบ Real-time
          </p>
        </div>

        <button
          onClick={onOpenWalkInModal}
          className="px-5 py-2.5 rounded-2xl bg-amber-900 text-stone-100 hover:bg-amber-950 font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>เพิ่มคิว Walk-in ใหม่</span>
        </button>
      </div>

      {/* Control Bar: Tabs & Search */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { key: 'ALL', label: 'ทั้งหมด', count: queueItems.length },
            { key: 'WAITING', label: 'รอเรียก/เช็คอิน', count: queueItems.filter(q => ['WAITING', 'PENDING', 'CHECKED_IN'].includes(q.status)).length },
            { key: 'IN_SERVICE', label: 'กำลังให้บริการ', count: queueItems.filter(q => q.status === 'IN_SERVICE').length },
            { key: 'COMPLETED', label: 'เสร็จสิ้น', count: queueItems.filter(q => q.status === 'COMPLETED').length },
            { key: 'CANCELLED', label: 'ยกเลิก', count: queueItems.filter(q => q.status === 'CANCELLED').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? 'bg-amber-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.key ? 'bg-amber-800 text-amber-100' : 'bg-stone-200 text-stone-700'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="ค้นหาเลขคิว / ชื่อลูกค้า / เบอร์โทร..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-800/40"
          />
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="absolute left-3 top-3 text-stone-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Queue Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-stone-200 text-stone-500">
            <p className="font-medium text-sm">ไม่พบข้อมูลคิวในหมวดหมู่นี้</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.queueNo}
              className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-md ${
                item.status === 'IN_SERVICE'
                  ? 'border-emerald-300 ring-1 ring-emerald-300/50 bg-emerald-50/10'
                  : item.status === 'CHECKED_IN'
                  ? 'border-indigo-300 bg-indigo-50/10'
                  : 'border-stone-200/80'
              }`}
            >
              {/* Card Top Header */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold font-headline px-3 py-1 bg-amber-900 text-amber-100 rounded-xl shadow-xs">
                      {item.queueNo}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.type === 'WALK_IN' ? 'bg-amber-100 text-amber-900' : 'bg-sky-100 text-sky-900'}`}>
                      {item.type}
                    </span>
                  </div>
                  <StatusBadge status={item.status} size="sm" />
                </div>

                {/* Customer Details */}
                <div className="mt-3 space-y-1">
                  <h3 className="font-bold text-stone-900 text-base">{item.customerName}</h3>
                  <div className="text-xs text-stone-600 flex items-center gap-2">
                    <span>โทร: {item.phone}</span>
                    <span>•</span>
                    <span>เวลา: {item.time} น.</span>
                  </div>
                </div>

                {/* Service Details */}
                <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200/60 text-xs space-y-1">
                  <div className="font-semibold text-stone-800 flex items-center justify-between">
                    <span>บริการ: {item.serviceName}</span>
                    <span className="font-bold text-amber-900">฿{item.price}</span>
                  </div>
                  <div className="text-stone-500 text-[11px]">ระยะเวลา: {item.durationMinutes} นาที</div>
                  <div className="text-stone-600 text-[11px]">หมอนวด: <strong className="text-stone-800">{item.therapistName}</strong></div>
                  <div className="text-stone-600 text-[11px]">ห้องนวด: <strong className="text-stone-800">{item.roomNo || 'ยังไม่ได้ระบุ'}</strong></div>
                </div>
              </div>

              {/* Action Buttons for Queue */}
              <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-2">
                {item.status === 'WAITING' || item.status === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => {
                        alert(`เรียกคิว [${item.queueNo}] คุณ${item.customerName} เข้าจุดต้อนรับ`)
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      เรียกคิว
                    </button>
                    <button
                      onClick={() => updateQueueStatus(item.queueNo, 'CHECKED_IN')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-700 text-white hover:bg-indigo-800 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      เช็คอิน
                    </button>
                    <button
                      onClick={() => updateQueueStatus(item.queueNo, 'CANCELLED')}
                      className="px-2.5 py-1.5 rounded-xl bg-stone-100 text-stone-500 hover:bg-rose-50 hover:text-rose-700 text-xs font-medium transition-colors cursor-pointer ml-auto"
                    >
                      ยกเลิก
                    </button>
                  </>
                ) : item.status === 'CHECKED_IN' ? (
                  <>
                    <button
                      onClick={() => handleStartService(item)}
                      className="w-full px-3 py-2 rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 text-xs font-semibold transition-colors cursor-pointer text-center"
                    >
                      เริ่มนวด (ส่งเข้าห้องบริการ)
                    </button>
                  </>
                ) : item.status === 'IN_SERVICE' ? (
                  <>
                    <button
                      onClick={() => updateQueueStatus(item.queueNo, 'COMPLETED')}
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 text-white hover:bg-black text-xs font-semibold transition-colors cursor-pointer text-center"
                    >
                      นวดเสร็จสิ้น (Complete Service)
                    </button>
                  </>
                ) : (
                  <div className="text-[11px] text-stone-400 font-medium italic">
                    สถานะเสร็จสิ้นสมบูรณ์
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
