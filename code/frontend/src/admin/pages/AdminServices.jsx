import React, { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import { api } from '../../lib/api.js'

export default function AdminServices() {
  const { user, services: fallbackServices, addOrUpdateService } = useAdminAuth()
  const { lang, t } = useLanguage()
  const [editingService, setEditingService] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [liveServices, setLiveServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMsg, setToastMsg] = useState(null)

  const isOwner = user?.role === 'OWNER'

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const fetchServices = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/services')
      if (res && res.success && Array.isArray(res.data)) {
        const mapped = res.data.map(s => ({
          id: s.id,
          code: s.serviceCode,
          name: s.serviceName,
          category: s.category,
          description: s.description,
          durations: (s.durationOptions || []).map(d => ({
            minutes: d.durationMinutes,
            price: Number(d.price)
          })),
          isActive: true
        }))
        setLiveServices(mapped)
      } else {
        setLiveServices([])
      }
    } catch {
      setLiveServices([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const displayServices = liveServices

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isOwner) return
    setIsSubmitting(true)

    const durationOptions = [
      { durationMinutes: 60, price: Number(p60) },
      { durationMinutes: 90, price: Number(p90) },
      { durationMinutes: 120, price: Number(p120) }
    ]

    const payload = {
      serviceCode: code,
      serviceName: name,
      category: category || 'Thai Massage',
      description: description || name,
      requiredRoomType: 'SINGLE',
      durationOptions
    }

    try {
      if (editingService && editingService.id) {
        // PUT update
        const res = await api.put(`/admin/services/${editingService.id}`, payload)
        if (res && res.success) {
          showToast(lang === 'th' ? 'แก้ไขบริการสำเร็จ' : 'Service updated successfully')
          fetchServices()
          setShowModal(false)
          return
        }
      } else {
        // POST create
        const res = await api.post('/admin/services', payload)
        if (res && res.success) {
          showToast(lang === 'th' ? 'เพิ่มบริการใหม่สำเร็จ' : 'Service created successfully')
          fetchServices()
          setShowModal(false)
          return
        }
      }
    } catch (err) {
      console.warn('API service save error, falling back to local context:', err)
    } finally {
      setIsSubmitting(false)
    }

    // Local fallback
    try {
      addOrUpdateService({
        id: editingService ? editingService.id : null,
        code,
        name,
        category,
        description,
        durations: durationOptions.map(d => ({ minutes: d.durationMinutes, price: d.price }))
      })
      setShowModal(false)
      showToast(lang === 'th' ? 'บันทึกข้อมูลบริการสำเร็จ' : 'Service saved')
    } catch (err) {
      alert(err.message)
    }
  }

  const toggleServiceActive = async (service) => {
    if (!isOwner) {
      alert(lang === 'th' ? 'สิทธิ์เฉพาะผู้จัดการ (OWNER) เท่านั้น' : 'Only OWNER can change service availability')
      return
    }

    if (service.id) {
      try {
        const res = await api.delete(`/admin/services/${service.id}`)
        if (res && res.success) {
          showToast(lang === 'th' ? 'ปิดการใช้งานบริการเรียบร้อย' : 'Service deactivated')
          fetchServices()
          return
        }
      } catch (err) {
        console.warn('API delete service error, falling back:', err)
      }
    }

    // Fallback
    setLiveServices(prev => prev.map(s => s.id === service.id ? { ...s, isActive: !s.isActive } : s))
  }

  return (
    <div className="space-y-6 text-on-surface font-body-md">
      {/* Toast Notice */}
      {toastMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">✕</button>
        </div>
      )}

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

        <div className="flex items-center gap-2">
          <button
            onClick={fetchServices}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs border border-outline-variant shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="รีเฟรชข้อมูลบริการ"
          >
            <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>sync</span>
            <span>{loading ? '...' : (lang === 'th' ? 'รีเฟรช' : 'Refresh')}</span>
          </button>

          {isOwner ? (
            <button
              onClick={() => handleOpenEdit(null)}
              className="px-4 py-2.5 rounded-xl bg-teak-dark text-warm-ivory hover:bg-teak-deep font-semibold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>{lang === 'th' ? 'เพิ่มรายการบริการใหม่' : 'Add New Service'}</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-surface-container text-xs text-charcoal-muted">
              {lang === 'th' ? 'สิทธิ์ดูอย่างเดียว (Receptionist)' : 'View-only access'}
            </div>
          )}
        </div>
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {displayServices.length === 0 ? (
          <div className="col-span-full bg-surface rounded-2xl p-12 text-center border border-outline-variant text-charcoal-muted shadow-[var(--admin-shadow-sm)]">
            <p className="font-medium text-sm">{t('admin.noMatchingRecords')}</p>
          </div>
        ) : (
          displayServices.map((service) => (
          <div
            key={service.id || service.code}
            className={`bg-surface rounded-2xl border p-5 shadow-[var(--admin-shadow-sm)] flex flex-col justify-between space-y-4 transition-all ${
              service.isActive !== false ? 'border-outline-variant hover:border-outline' : 'border-outline-variant/50 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-surface-container text-teak-deep rounded border border-outline-variant">
                    {service.code}
                  </span>
                  <span className="text-xs text-charcoal-muted">
                    {service.category}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${service.isActive !== false ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-surface-container text-charcoal-muted'}`}>
                  {service.isActive !== false ? (lang === 'th' ? 'เปิดให้บริการ' : 'Active') : (lang === 'th' ? 'ปิดบริการ' : 'Inactive')}
                </span>
              </div>

              <h3 className="font-headline font-bold text-base text-teak-dark mt-2.5">
                {service.name}
              </h3>
              <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                {service.description}
              </p>

              {/* Durations Table */}
              <div className="mt-4 p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
                <div className="text-[11px] font-semibold text-charcoal-muted uppercase mb-2">
                  {lang === 'th' ? 'อัตราค่าบริการตามระยะเวลา' : 'Duration & Pricing'}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {(service.durations || []).map((dur) => (
                    <div key={dur.minutes} className="p-2 rounded-lg bg-surface border border-outline-variant/80">
                      <div className="text-xs font-semibold text-on-surface">{dur.minutes} {t('admin.minuteShort')}</div>
                      <div className="text-sm font-bold text-teak-deep mt-0.5">฿{dur.price.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions for OWNER */}
            {isOwner && (
              <div className="pt-3 border-t border-outline-variant flex items-center justify-end gap-2">
                <button
                  onClick={() => toggleServiceActive(service)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-charcoal-muted hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  {service.isActive !== false ? (lang === 'th' ? 'ปิดบริการ' : 'Deactivate') : (lang === 'th' ? 'เปิดบริการ' : 'Activate')}
                </button>
                <button
                  onClick={() => handleOpenEdit(service)}
                  className="px-4 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant text-xs font-semibold transition-colors cursor-pointer"
                >
                  {t('admin.edit')}
                </button>
              </div>
            )}
          </div>
        )))}
      </div>

      {/* Edit/Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface rounded-2xl border border-outline-variant max-w-lg w-full p-6 shadow-2xl text-on-surface space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <h3 className="font-headline font-bold text-lg text-teak-deep">
                {editingService ? (lang === 'th' ? 'แก้ไขรายการบริการ' : 'Edit Service') : (lang === 'th' ? 'เพิ่มรายการบริการใหม่' : 'Add New Service')}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-charcoal-muted hover:text-on-surface cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal-muted mb-1">{lang === 'th' ? 'รหัสบริการ (Service Code)' : 'Service Code'}</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low focus:bg-surface"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal-muted mb-1">{lang === 'th' ? 'ชื่อบริการ (ภาษาไทยและอังกฤษ)' : 'Service Name'}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น นวดแผนไทยราชสำนัก (Royal Thai Massage)"
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low focus:bg-surface"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal-muted mb-1">{lang === 'th' ? 'หมวดหมู่' : 'Category'}</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="เช่น Thai Massage, Aromatherapy"
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low focus:bg-surface"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal-muted mb-1">{lang === 'th' ? 'คำอธิบายทรีตเมนต์' : 'Description'}</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low focus:bg-surface"
                />
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant space-y-3">
                <div className="font-semibold text-teak-deep">{lang === 'th' ? 'กำหนดราคาตามรอบเวลา (บาท)' : 'Pricing by Duration (THB)'}</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-charcoal-muted mb-1">60 นาที</label>
                    <input
                      type="number"
                      required
                      value={p60}
                      onChange={(e) => setP60(e.target.value)}
                      className="w-full p-2 rounded-lg border border-outline-variant bg-surface text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-charcoal-muted mb-1">90 นาที</label>
                    <input
                      type="number"
                      required
                      value={p90}
                      onChange={(e) => setP90(e.target.value)}
                      className="w-full p-2 rounded-lg border border-outline-variant bg-surface text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-charcoal-muted mb-1">120 นาที</label>
                    <input
                      type="number"
                      required
                      value={p120}
                      onChange={(e) => setP120(e.target.value)}
                      className="w-full p-2 rounded-lg border border-outline-variant bg-surface text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant text-charcoal-muted hover:bg-surface-container-low cursor-pointer"
                >
                  {t('admin.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-teak-dark text-warm-ivory font-semibold hover:bg-teak-deep cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? '...' : (lang === 'th' ? 'บันทึกบริการ' : 'Save Service')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
