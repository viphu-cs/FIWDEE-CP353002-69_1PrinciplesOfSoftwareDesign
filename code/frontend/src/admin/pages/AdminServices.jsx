import React, { useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'

export default function AdminServices() {
  const { user, services, setServices, addOrUpdateService } = useAdminAuth()
  const { lang, t } = useLanguage()
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
      alert(lang === 'th' ? 'สิทธิ์เฉพาะผู้จัดการ (OWNER) เท่านั้นในการเพิ่มหรือแก้ไขเมนูบริการและราคา' : 'Only OWNER can manage services and pricing')
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
      alert(lang === 'th' ? 'สิทธิ์เฉพาะผู้จัดการ (OWNER) เท่านั้น' : 'Only OWNER can change service availability')
      return
    }
    setServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s))
  }

  return (
    <div className="space-y-6 text-on-surface font-body-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headline font-bold text-teak-deep">
            {t('admin.services')} (Service Catalog & Pricing)
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
            {lang === 'th'
              ? 'ตั้งค่ารายการนวด ระยะเวลา (60 / 90 / 120 นาที) และราคาค่าบริการของร้าน'
              : 'Configure massage services, duration options (60 / 90 / 120 mins), and shop pricing'}
          </p>
        </div>

        {isOwner ? (
          <button
            onClick={() => handleOpenEdit(null)}
            className="px-5 py-2.5 rounded-2xl bg-teak-dark text-warm-ivory hover:bg-teak-deep font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>{lang === 'th' ? 'เพิ่มเมนูบริการใหม่' : 'Add New Service'}</span>
          </button>
        ) : (
          <div className="px-3.5 py-2 rounded-xl bg-surface-container text-charcoal-muted border border-outline-variant text-xs font-semibold flex items-center gap-1.5">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>{lang === 'th' ? 'มุมมองสำหรับพนักงานต้อนรับ (Read-only)' : 'Receptionist View (Read-only)'}</span>
          </div>
        )}
      </div>

      {/* Services List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((svc) => (
          <div
            key={svc.id}
            className={`bg-surface rounded-2xl border p-6 shadow-[var(--admin-shadow-sm)] hover:shadow-[var(--admin-shadow-md)] transition-all flex flex-col justify-between space-y-4 ${
              svc.isActive ? 'border-outline-variant' : 'border-outline-variant opacity-60 bg-surface-container-low'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-terracotta-deep px-2.5 py-1 bg-terracotta-soft rounded-lg border border-terracotta/30">
                  {svc.code}
                </span>
                <button
                  onClick={() => toggleServiceActive(svc.id)}
                  disabled={!isOwner}
                  className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border ${
                    svc.isActive
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-surface-container text-on-surface-variant border-outline-variant'
                  } ${!isOwner ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  {svc.isActive ? (lang === 'th' ? 'เปิดให้บริการ' : 'Active') : (lang === 'th' ? 'ปิดบริการชั่วคราว' : 'Inactive')}
                </button>
              </div>

              <h3 className="font-bold font-headline text-teak-deep text-lg mt-3">{svc.name}</h3>
              <p className="text-xs text-charcoal-muted mt-1">{svc.description}</p>
              <div className="mt-2 text-[11px] font-semibold uppercase text-charcoal-muted">
                {lang === 'th' ? 'หมวดหมู่:' : 'Category:'} {svc.category}
              </div>

              {/* Durations & Pricing Table */}
              <div className="mt-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant space-y-2">
                <div className="text-xs font-semibold text-teak-deep uppercase tracking-wider">
                  {lang === 'th' ? 'ราคาตามระยะเวลา (Duration & Pricing):' : 'Duration & Pricing:'}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {svc.durations.map((d) => (
                    <div key={d.minutes} className="p-2 bg-surface rounded-lg border border-outline-variant shadow-2xs">
                      <div className="text-[11px] text-charcoal-muted font-medium">{d.minutes} {lang === 'th' ? 'นาที' : 'mins'}</div>
                      <div className="font-bold text-teak-deep text-sm">฿{d.price.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {isOwner && (
              <div className="pt-3 border-t border-outline-variant flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(svc)}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors cursor-pointer border border-outline-variant"
                >
                  {lang === 'th' ? 'แก้ไขราคา & ข้อมูล' : 'Edit Price & Info'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit/Add Service Modal */}
      {showModal && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-lg w-full border border-outline-variant overflow-hidden">
            <div className="bg-teak-deep text-warm-ivory px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base font-headline">
                {editingService ? `${lang === 'th' ? 'แก้ไขบริการ:' : 'Edit Service:'} ${editingService.name}` : (lang === 'th' ? 'เพิ่มเมนูบริการใหม่' : 'Add New Service')}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-warm-ivory/70 hover:text-warm-ivory cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-on-surface">
              <div>
                <label className="block text-xs font-semibold text-charcoal-muted uppercase mb-1">
                  {lang === 'th' ? 'ชื่อรายการบริการ *' : 'Service Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === 'th' ? 'เช่น นวดประคบสมุนไพรสด' : 'e.g. Royal Thai Herbal Spa'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-muted uppercase mb-1">
                    {lang === 'th' ? 'รหัสบริการ Code' : 'Service Code'}
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm font-mono focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-muted uppercase mb-1">
                    {lang === 'th' ? 'หมวดหมู่' : 'Category'}
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-muted uppercase mb-1">
                  {lang === 'th' ? 'รายละเอียดบริการ' : 'Description'}
                </label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
              </div>

              {/* Prices for 60/90/120 mins */}
              <div>
                <label className="block text-xs font-semibold text-teak-deep uppercase mb-2">
                  {lang === 'th' ? 'กำหนดราคา (บาท)' : 'Pricing (THB)'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] text-charcoal-muted">60 {lang === 'th' ? 'นาที' : 'mins'}</span>
                    <input
                      type="number"
                      value={p60}
                      onChange={(e) => setP60(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface text-sm font-bold text-teak-deep"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-charcoal-muted">90 {lang === 'th' ? 'นาที' : 'mins'}</span>
                    <input
                      type="number"
                      value={p90}
                      onChange={(e) => setP90(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface text-sm font-bold text-teak-deep"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-charcoal-muted">120 {lang === 'th' ? 'นาที' : 'mins'}</span>
                    <input
                      type="number"
                      value={p120}
                      onChange={(e) => setP120(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface text-sm font-bold text-teak-deep"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-charcoal-muted hover:bg-surface-container text-xs font-medium cursor-pointer"
                >
                  {t('admin.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teak-dark text-warm-ivory hover:bg-teak-deep text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {t('admin.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
