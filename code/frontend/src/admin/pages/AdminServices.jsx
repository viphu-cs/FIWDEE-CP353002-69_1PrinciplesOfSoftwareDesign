import React, { useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'

export default function AdminServices() {
  const { user, services, setServices, addOrUpdateService } = useAdminAuth()
  const [editingService, setEditingService] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const isOwner = user.role === 'OWNER'

  // Form states
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [p60, setP60] = useState(600)
  const [p90, setP90] = useState(850)
  const [p120, setP120] = useState(1100)

  const handleOpenEdit = (service = null) => {
    if (!isOwner) {
      alert('สิทธิ์เฉพาะผู้จัดการ (OWNER) เท่านั้นในการเพิ่มหรือแก้ไขเมนูบริการและราคา')
      return
    }
    if (service) {
      setEditingService(service)
      setCode(service.code)
      setName(service.name)
      setCategory(service.category)
      setDescription(service.description)
      const d60 = service.durations.find(d => d.minutes === 60)
      const d90 = service.durations.find(d => d.minutes === 90)
      const d120 = service.durations.find(d => d.minutes === 120)
      setP60(d60 ? d60.price : 600)
      setP90(d90 ? d90.price : 850)
      setP120(d120 ? d120.price : 1100)
    } else {
      setEditingService(null)
      setCode(`SVC-CUSTOM-${Date.now().toString().slice(-3)}`)
      setName('')
      setCategory('Thai Massage')
      setDescription('')
      setP60(650)
      setP90(900)
      setP120(1200)
    }
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isOwner) return

    const durations = [
      { minutes: 60, price: Number(p60) },
      { minutes: 90, price: Number(p90) },
      { minutes: 120, price: Number(p120) }
    ]

    try {
      addOrUpdateService({
        id: editingService ? editingService.id : null,
        code,
        name,
        category,
        description,
        durations
      })
      setShowModal(false)
    } catch (err) {
      alert(err.message)
    }
  }

  const toggleServiceActive = (id) => {
    if (!isOwner) {
      alert('สิทธิ์เฉพาะผู้จัดการ (OWNER) เท่านั้น')
      return
    }
    setServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s))
  }

  return (
    <div className="space-y-6 text-stone-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headline font-bold text-stone-900">
            เมนูบริการ ระยะเวลา & กำหนดราคา (Services)
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            ตั้งค่ารายการนวด ระยะเวลา (60 / 90 / 120 นาที) และราคาค่าบริการในแต่ละสาขา
          </p>
        </div>

        {isOwner ? (
          <button
            onClick={() => handleOpenEdit(null)}
            className="px-5 py-2.5 rounded-2xl bg-amber-900 text-stone-100 hover:bg-amber-950 font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>เพิ่มเมนูบริการใหม่</span>
          </button>
        ) : (
          <div className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
            🔒 มุมมองสำหรับพนักงานต้อนรับ (Read-only)
          </div>
        )}
      </div>

      {/* Services List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((svc) => (
          <div
            key={svc.id}
            className={`bg-white rounded-2xl border p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
              svc.isActive ? 'border-stone-200/80' : 'border-stone-200 opacity-60 bg-stone-50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-900 px-2.5 py-1 bg-amber-50 rounded-lg border border-amber-200">
                  {svc.code}
                </span>
                <button
                  onClick={() => toggleServiceActive(svc.id)}
                  disabled={!isOwner}
                  className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border ${
                    svc.isActive
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-stone-200 text-stone-700 border-stone-300'
                  } ${!isOwner ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  {svc.isActive ? 'เปิดให้บริการ' : 'ปิดบริการชั่วคราว'}
                </button>
              </div>

              <h3 className="font-bold font-headline text-stone-900 text-lg mt-3">{svc.name}</h3>
              <p className="text-xs text-stone-500 mt-1">{svc.description}</p>
              <div className="mt-2 text-[11px] font-semibold uppercase text-stone-400">
                หมวดหมู่: {svc.category}
              </div>

              {/* Durations & Pricing Table */}
              <div className="mt-4 p-4 bg-stone-50 rounded-xl border border-stone-200/60 space-y-2">
                <div className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  ราคาตามระยะเวลา (Duration & Pricing):
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {svc.durations.map((d) => (
                    <div key={d.minutes} className="p-2 bg-white rounded-lg border border-stone-200 shadow-2xs">
                      <div className="text-[11px] text-stone-500 font-medium">{d.minutes} นาที</div>
                      <div className="font-bold text-amber-900 text-sm">฿{d.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {isOwner && (
              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(svc)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  แก้ไขราคา & ข้อมูล
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit/Add Service Modal */}
      {showModal && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-stone-200 overflow-hidden">
            <div className="bg-stone-900 text-stone-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base font-headline">
                {editingService ? `แก้ไขบริการ: ${editingService.name}` : 'เพิ่มเมนูบริการใหม่'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-stone-800">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">ชื่อรายการบริการ *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น นวดประคบสมุนไพรสด"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">รหัสบริการ Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-800/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">หมวดหมู่</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">รายละเอียดบริการ</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/40"
                />
              </div>

              {/* Prices for 60/90/120 mins */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-2">กำหนดราคา (บาท)</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] text-stone-500">60 นาที</span>
                    <input
                      type="number"
                      value={p60}
                      onChange={(e) => setP60(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-bold text-amber-900"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-500">90 นาที</span>
                    <input
                      type="number"
                      value={p90}
                      onChange={(e) => setP90(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-bold text-amber-900"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-500">120 นาที</span>
                    <input
                      type="number"
                      value={p120}
                      onChange={(e) => setP120(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-bold text-amber-900"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-medium cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-900 text-stone-100 hover:bg-amber-950 text-xs font-semibold shadow-xs cursor-pointer"
                >
                  บันทึกข้อมูลบริการ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
