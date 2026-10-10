import React, { useState } from 'react'
import { api } from '../../lib/api.js'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import StatusBadge from '../components/StatusBadge.jsx'

export default function AdminTherapists() {
  const { user, therapists, updateTherapistStatus, updateTherapistShiftForDate, getTherapistShiftForDate, setTherapists, addTherapist } = useAdminAuth()
  const { lang, t } = useLanguage()
  const today = new Date()
  const formatDateKey = (d) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  const todayStr = formatDateKey(today)

  const dateList = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(today.getDate() + i)
    const dateStr = formatDateKey(d)
    let label = ''
    if (i === 0) {
      label = lang === 'th'
        ? `วันนี้ (${d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })})`
        : `Today (${d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })})`
    } else if (i === 1) {
      label = lang === 'th'
        ? `พรุ่งนี้ (${d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })})`
        : `Tomorrow (${d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })})`
    } else {
      label = d.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    }
    return { dateStr, label }
  })

  const [filterDuty, setFilterDuty] = useState('ALL')
  const [selectedShiftDate, setSelectedShiftDate] = useState(todayStr)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTherapist, setNewTherapist] = useState({
    fullName: '',
    nickname: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    skills: ['Traditional Thai Massage'],
    initialShift: 'FULL_DAY',
  })
  const [modalError, setModalError] = useState('')

  const availableSkills = [
    'Traditional Thai Massage',
    'Aroma Therapy Massage',
    'Foot Reflexology',
    'FIWDEE Royal Herbal Spa',
    'Deep Tissue',
    'Hot Stone',
  ]

  const isOwner = user?.role === 'OWNER'

  React.useEffect(() => {
    let isMounted = true
    api.get('/admin/therapists').then((res) => {
      if (isMounted && res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setTherapists((prev) => {
          return res.data.map((bt) => {
            const matched = prev.find(p => p.id === bt.id || (p.nickname && bt.nickname && p.nickname.toLowerCase() === bt.nickname.toLowerCase()))
            return {
              id: bt.id,
              nickname: bt.nickname,
              fullName: bt.fullName,
              status: bt.isActive ? (matched?.status || 'ON_DUTY') : 'OFF_DUTY',
              skills: bt.skills && bt.skills.length > 0 ? bt.skills : (matched?.skills || ['Traditional Thai Massage']),
              shiftsByDate: matched?.shiftsByDate || {},
              totalJobsToday: matched?.totalJobsToday || 0,
              currentRoom: matched?.currentRoom || null
            }
          })
        })
      }
    }).catch(() => {})

    return () => { isMounted = false }
  }, [setTherapists])

  const filteredTherapists = therapists.filter(t => {
    if (filterDuty === 'ALL') return true
    return t.status === filterDuty
  })

  const handleSkillToggle = (therapistId, skill) => {
    if (!isOwner) {
      alert(t('admin.ownerOnlySkills'))
      return
    }
    setTherapists(prev => prev.map(t => {
      if (t.id === therapistId) {
        const hasSkill = t.skills.includes(skill)
        const newSkills = hasSkill ? t.skills.filter(s => s !== skill) : [...t.skills, skill]
        return { ...t, skills: newSkills }
      }
      return t
    }))
  }

  const handleAddModalSkillToggle = (skill) => {
    setNewTherapist(prev => {
      const hasSkill = prev.skills.includes(skill)
      const nextSkills = hasSkill ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill]
      return { ...prev, skills: nextSkills }
    })
  }

  const handleAddTherapistSubmit = async (e) => {
    e.preventDefault()
    setModalError('')
    if (!newTherapist.fullName.trim() || !newTherapist.nickname.trim()) {
      setModalError(lang === 'th' ? 'กรุณากรอกชื่อ-นามสกุล และชื่อเล่นของหมอนวด' : 'Please provide full name and nickname.')
      return
    }
    if (newTherapist.skills.length === 0) {
      setModalError(lang === 'th' ? 'กรุณาเลือกทักษะอย่างน้อย 1 รายการ' : 'Please select at least 1 skill.')
      return
    }

    const defaultUsername = newTherapist.username.trim() || `therapist_${Date.now()}@fiwdee-massage.co.th`
    const defaultPhone = newTherapist.phone.trim() || `08${Math.floor(10000000 + Math.random() * 90000000)}`
    const rawPassword = newTherapist.password.trim() || 'therapist1234'

    setIsSubmitting(true)
    try {
      // 1. ลองยิงสร้างผ่าน Backend API จริง (เพื่อสร้าง User + Therapist record ใน DB)
      const payload = {
        username: defaultUsername,
        password: rawPassword,
        fullName: newTherapist.fullName.trim(),
        email: newTherapist.email.trim() || (defaultUsername.includes('@') ? defaultUsername : null),
        phoneNumber: defaultPhone,
        nickname: newTherapist.nickname.trim(),
        bio: `หมอนวดผู้เชี่ยวชาญ ${newTherapist.skills.join(', ')}`,
        commissionRate: 30.0,
        serviceIds: []
      }

      let createdId = null
      try {
        const apiRes = await api.post('/admin/therapists', payload)
        if (apiRes && apiRes.success && apiRes.data?.id) {
          createdId = apiRes.data.id
        }
      } catch (apiErr) {
        // หาก backend ยังไม่พร้อม ทำงานต่อด้วย local context
        console.warn('Backend /admin/therapists unreachable, falling back to local context state:', apiErr)
      }

      // 2. ซิงก์เข้า Local context สำหรับตารางกะงานและคิวสด
      const initialShifts = {}
      initialShifts[todayStr] = newTherapist.initialShift

      addTherapist({
        id: createdId,
        fullName: newTherapist.fullName.trim(),
        nickname: newTherapist.nickname.trim(),
        status: newTherapist.initialShift === 'OFF' ? 'OFF_DUTY' : 'ON_DUTY',
        skills: newTherapist.skills,
        shiftsByDate: initialShifts,
      })

      setIsAddModalOpen(false)
      setNewTherapist({
        fullName: '',
        nickname: '',
        username: '',
        email: '',
        password: '',
        phone: '',
        skills: ['Traditional Thai Massage'],
        initialShift: 'FULL_DAY',
      })
    } catch (err) {
      setModalError(err.message || 'Error adding therapist')
    } finally {
      setIsSubmitting(false)
    }
  }

  const shiftLabels = {
    MORNING: lang === 'th' ? 'กะเช้า (10:00 - 19:00)' : 'Morning (10:00 - 19:00)',
    EVENING: lang === 'th' ? 'กะบ่าย (13:00 - 22:00)' : 'Evening (13:00 - 22:00)',
    FULL_DAY: lang === 'th' ? 'เต็มวัน (10:00 - 22:00)' : 'Full Day (10:00 - 22:00)',
    OFF: lang === 'th' ? 'วันหยุด / ลางาน (OFF)' : 'Off Duty / Day Off'
  }

  return (
    <div className="space-y-6 text-on-surface font-body-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headline font-bold text-teak-deep">
            {t('admin.therapists')}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
            {lang === 'th'
              ? 'จัดการสถานะการเข้างานวันนี้ (Duty Status), ทักษะความเชี่ยวชาญ (TherapistSkill) และตารางกะงานล่วงหน้า 7 วัน (Multi-day Shift Schedule)'
              : 'Manage duty status, therapist skills, and 7-day advance work shifts'}
          </p>
        </div>

        {isOwner && (
          <button
            type="button"
            onClick={() => {
              setModalError('')
              setIsAddModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teak-dark hover:bg-teak-deep text-warm-ivory text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>{t('admin.addTherapist')}</span>
          </button>
        )}
      </div>

      {/* Multi-day Shift Schedule Date Selector */}
      <div className="bg-surface rounded-2xl p-4 border border-outline-variant shadow-[var(--admin-shadow-sm)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-teak-deep uppercase tracking-wider">
            {lang === 'th' ? 'ตารางกะงานล่วงหน้า 7 วัน (Shift Schedule):' : '7-Day Shift Schedule:'}
          </span>
          <span className="text-[11px] text-charcoal-muted font-medium bg-surface-container px-2.5 py-0.5 rounded border border-outline-variant/60">
            {lang === 'th' ? 'เชื่อมโยงกับการจองล่วงหน้า' : 'Linked with advance bookings'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {dateList.map((d) => (
            <button
              key={d.dateStr}
              onClick={() => setSelectedShiftDate(d.dateStr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap cursor-pointer transition-all border ${
                selectedShiftDate === d.dateStr
                  ? 'bg-teak-dark text-warm-ivory border-teak-dark shadow-xs font-semibold'
                  : 'bg-surface-container-low text-charcoal-muted border-outline-variant hover:bg-surface-container'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-surface rounded-2xl p-4 border border-outline-variant shadow-[var(--admin-shadow-sm)] flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-medium text-charcoal-muted uppercase mr-2">
          {lang === 'th' ? 'สถานะวันนี้:' : 'Today Status:'}
        </span>
        {[
          { key: 'ALL', label: 'ทั้งหมด' },
          { key: 'ON_DUTY', label: 'เข้างาน / พร้อมรับคิว' },
          { key: 'IN_SERVICE', label: 'กำลังนวด (In-Service)' },
          { key: 'BREAK', label: 'พักผ่อน (Break)' },
          { key: 'OFF_DUTY', label: 'ออกกะ / ลางาน' }
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilterDuty(item.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap cursor-pointer transition-all ${
              filterDuty === item.key
                ? 'bg-teak-dark text-warm-ivory font-semibold shadow-xs'
                : 'bg-surface-container-low text-charcoal-muted hover:bg-surface-container'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Therapists Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTherapists.map((tItem) => {
          const shiftOnSelectedDate = getTherapistShiftForDate(tItem, selectedShiftDate)

          return (
            <div
              key={tItem.id}
              className="bg-surface rounded-2xl border border-outline-variant p-5 shadow-[var(--admin-shadow-sm)] hover:border-outline transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container text-teak-deep font-bold font-headline text-base flex items-center justify-center border border-outline-variant">
                      {tItem.nickname.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-teak-deep text-sm">{tItem.fullName} ({tItem.nickname})</h3>
                      <p className="text-xs text-charcoal-muted">
                        {lang === 'th' ? 'กะงานวันนี้:' : 'Today Shift:'} {shiftLabels[getTherapistShiftForDate(tItem, todayStr)]}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <StatusBadge status={tItem.status} size="sm" />
                  <span className="text-xs text-charcoal-muted font-medium bg-surface-container px-2 py-0.5 rounded border border-outline-variant/60">
                    {lang === 'th' ? `รับงานวันนี้: ${tItem.totalJobsToday} คิว` : `Jobs today: ${tItem.totalJobsToday}`}
                  </span>
                </div>

                {/* Multi-day Work Shift Manager Section */}
                <div className="mt-4 p-3 bg-surface-container-low rounded-xl border border-outline-variant/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-on-surface">
                      {lang === 'th' ? `ตารางกะวันที่ ${selectedShiftDate}:` : `Shift on ${selectedShiftDate}:`}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase border ${shiftOnSelectedDate === 'OFF' ? 'bg-surface text-charcoal-muted border-outline-variant' : 'bg-surface text-teak-deep border-outline-variant font-semibold'}`}>
                      {shiftOnSelectedDate}
                    </span>
                  </div>

                  <select
                    value={shiftOnSelectedDate}
                    onChange={(e) => updateTherapistShiftForDate(tItem.id, selectedShiftDate, e.target.value)}
                    disabled={!isOwner}
                    className={`w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface text-xs font-semibold text-on-surface hover:border-wood-deep cursor-pointer ${
                      !isOwner ? 'opacity-80 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="MORNING">{shiftLabels.MORNING}</option>
                    <option value="EVENING">{shiftLabels.EVENING}</option>
                    <option value="FULL_DAY">{shiftLabels.FULL_DAY}</option>
                    <option value="OFF">{shiftLabels.OFF}</option>
                  </select>
                </div>

                {/* Skills (TherapistSkill) */}
                <div className="mt-4 pt-3 border-t border-outline-variant">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider">
                      ทักษะความเชี่ยวชาญ (Skills):
                    </label>
                    {!isOwner && <span className="text-[10px] text-charcoal-muted">🔒 เฉพาะผู้จัดการ</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['Traditional Thai Massage', 'Aroma Therapy Massage', 'Foot Reflexology', 'FIWDEE Royal Herbal Spa', 'Deep Tissue', 'Hot Stone'].map((skill) => {
                      const isSelected = tItem.skills.includes(skill)
                      return (
                        <button
                          key={skill}
                          onClick={() => handleSkillToggle(tItem.id, skill)}
                          disabled={!isOwner}
                          className={`px-2.5 py-1 rounded-lg text-[10px] transition-colors cursor-pointer border ${
                            isSelected
                              ? 'bg-teak-deep text-warm-ivory border-teak-deep font-medium'
                              : 'bg-surface-container-low text-charcoal-muted border-outline-variant hover:bg-surface-container'
                          } ${!isOwner ? 'cursor-default opacity-90' : ''}`}
                        >
                          {skill}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Change Duty Status Controls */}
              <div className="pt-3 border-t border-outline-variant space-y-2">
                <label className="block text-[11px] font-medium text-charcoal-muted uppercase tracking-wider">
                  {lang === 'th' ? 'อัปเดตสถานะปฏิบัติงานวันนี้:' : 'Update Today Duty Status:'}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { key: 'ON_DUTY', label: 'เข้างาน/พร้อม' },
                    { key: 'IN_SERVICE', label: 'กำลังนวด' },
                    { key: 'BREAK', label: 'พักผ่อน' },
                    { key: 'OFF_DUTY', label: 'ออกกะ/ลางาน' }
                  ].map((st) => (
                    <button
                      key={st.key}
                      onClick={() => updateTherapistStatus(tItem.id, st.key)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer text-center border ${
                        tItem.status === st.key
                          ? 'bg-surface-container-high text-teak-deep border-outline font-semibold shadow-xs'
                          : 'bg-surface-container-low text-charcoal-muted border-outline-variant hover:bg-surface-container'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Therapist Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface w-full max-w-lg rounded-2xl border border-outline-variant shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <div>
                <h3 className="text-lg font-headline font-bold text-teak-deep">
                  {t('admin.addTherapist')}
                </h3>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  {lang === 'th' ? 'เพิ่มข้อมูลหมอนวดคนใหม่พร้อมกำหนดทักษะและกะงานเริ่มต้น' : 'Register a new therapist with skills and initial shift'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-charcoal-muted hover:bg-surface-container cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTherapistSubmit} className="space-y-4 pt-4">
              {modalError && (
                <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs font-medium">
                  {modalError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-charcoal-muted uppercase">
                    {t('admin.therapistFullName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTherapist.fullName}
                    onChange={(e) => setNewTherapist(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="เช่น สมพร รักสงบ"
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface text-xs text-on-surface focus:border-teak-dark outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-charcoal-muted uppercase">
                    {t('admin.therapistNickname')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTherapist.nickname}
                    onChange={(e) => setNewTherapist(prev => ({ ...prev, nickname: e.target.value }))}
                    placeholder="เช่น พร"
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface text-xs text-on-surface focus:border-teak-dark outline-none"
                  />
                </div>
              </div>

              {/* Account Credentials (User entity link) */}
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/70 space-y-3">
                <div className="text-[11px] font-semibold text-teak-deep uppercase tracking-wider flex items-center justify-between">
                  <span>ข้อมูลบัญชีผู้ใช้เข้าสู่ระบบ (User Account)</span>
                  <span className="text-[10px] text-charcoal-muted font-normal">บทบาท: THERAPIST</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-charcoal-muted">
                      {t('admin.therapistPhone')}
                    </label>
                    <input
                      type="text"
                      value={newTherapist.phone}
                      onChange={(e) => setNewTherapist(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="เช่น 081-999-8877"
                      className="w-full px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-xs text-on-surface focus:border-teak-dark outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-charcoal-muted">
                      {t('admin.therapistEmail')}
                    </label>
                    <input
                      type="email"
                      value={newTherapist.email}
                      onChange={(e) => setNewTherapist(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="เช่น sorn@fiwdee-massage.co.th"
                      className="w-full px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-xs text-on-surface focus:border-teak-dark outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-charcoal-muted">
                      {t('admin.therapistUsername')}
                    </label>
                    <input
                      type="text"
                      value={newTherapist.username}
                      onChange={(e) => setNewTherapist(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="เว้นว่างได้ (สร้างอัตโนมัติ)"
                      className="w-full px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-xs text-on-surface focus:border-teak-dark outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-charcoal-muted">
                      {t('admin.therapistPassword')}
                    </label>
                    <input
                      type="password"
                      value={newTherapist.password}
                      onChange={(e) => setNewTherapist(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="ค่าเริ่มต้น therapist1234"
                      className="w-full px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-xs text-on-surface focus:border-teak-dark outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal-muted uppercase">
                  {lang === 'th' ? 'กะงานเริ่มต้นวันนี้' : 'Initial Shift Today'}
                </label>
                <select
                  value={newTherapist.initialShift}
                  onChange={(e) => setNewTherapist(prev => ({ ...prev, initialShift: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface text-xs text-on-surface focus:border-teak-dark outline-none"
                >
                  <option value="FULL_DAY">{shiftLabels.FULL_DAY}</option>
                  <option value="MORNING">{shiftLabels.MORNING}</option>
                  <option value="EVENING">{shiftLabels.EVENING}</option>
                  <option value="OFF">{shiftLabels.OFF}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-charcoal-muted uppercase block">
                  {t('admin.therapistSkillsSelect')} *
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1">
                  {availableSkills.map((skill) => {
                    const isSelected = newTherapist.skills.includes(skill)
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleAddModalSkillToggle(skill)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer border ${
                          isSelected
                            ? 'bg-teak-deep text-warm-ivory border-teak-deep font-medium shadow-xs'
                            : 'bg-surface-container-low text-charcoal-muted border-outline-variant hover:bg-surface-container'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{skill}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-charcoal-muted hover:bg-surface-container cursor-pointer transition-colors"
                >
                  {t('admin.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-teak-dark hover:bg-teak-deep text-warm-ivory text-xs font-semibold shadow-xs cursor-pointer transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? (lang === 'th' ? 'กำลังบันทึก...' : 'Saving...') : t('admin.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
