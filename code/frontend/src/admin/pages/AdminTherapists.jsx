import React, { useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import StatusBadge from '../components/StatusBadge.jsx'

export default function AdminTherapists() {
  const { user, therapists, updateTherapistStatus, updateTherapistShiftForDate, getTherapistShiftForDate, setTherapists } = useAdminAuth()
  const { lang, t } = useLanguage()
  const [filterDuty, setFilterDuty] = useState('ALL')
  const [selectedShiftDate, setSelectedShiftDate] = useState('2026-10-02')

  const isOwner = user.role === 'OWNER'

  const dateList = [
    { dateStr: '2026-10-02', label: lang === 'th' ? 'วันนี้ (2 ต.ค.)' : 'Today (2 Oct)' },
    { dateStr: '2026-10-03', label: lang === 'th' ? 'พรุ่งนี้ (3 ต.ค.)' : 'Tomorrow (3 Oct)' },
    { dateStr: '2026-10-04', label: '4 Oct 2026' },
    { dateStr: '2026-10-05', label: '5 Oct 2026' },
    { dateStr: '2026-10-06', label: '6 Oct 2026' },
    { dateStr: '2026-10-07', label: '7 Oct 2026' },
    { dateStr: '2026-10-08', label: '8 Oct 2026' },
  ]

  const filteredTherapists = therapists.filter(t => {
    if (filterDuty === 'ALL') return true
    return t.status === filterDuty
  })

  const handleSkillToggle = (therapistId, skill) => {
    if (!isOwner) {
      alert('สิทธิ์เฉพาะผู้จัดการ (OWNER) เท่านั้นในการแก้ไขทักษะของหมอนวด')
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

  const shiftLabels = {
    MORNING: lang === 'th' ? 'กะเช้า (10:00 - 19:00)' : 'Morning (10:00 - 19:00)',
    EVENING: lang === 'th' ? 'กะบ่าย (13:00 - 22:00)' : 'Evening (13:00 - 22:00)',
    FULL_DAY: lang === 'th' ? 'เต็มวัน (10:00 - 22:00)' : 'Full Day (10:00 - 22:00)',
    OFF: lang === 'th' ? 'วันหยุด / ลางาน (OFF)' : 'Off Duty / Day Off'
  }

  return (
    <div className="space-y-6 text-stone-800 font-body-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headline font-bold text-stone-900">
            {t('admin.therapists')}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {lang === 'th'
              ? 'จัดการสถานะการเข้างานวันนี้ (Duty Status), ทักษะความเชี่ยวชาญ (TherapistSkill) และตารางกะงานล่วงหน้า 7 วัน (Multi-day Shift Schedule)'
              : 'Manage duty status, therapist skills, and 7-day advance work shifts'}
          </p>
        </div>
      </div>

      {/* Multi-day Shift Schedule Date Selector */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
            📅 เลือกวันที่เพื่อดู/จัดการตารางกะงานล่วงหน้า (Work Shifts Schedule):
          </span>
          <span className="text-[11px] text-amber-900 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            {lang === 'th' ? 'เชื่อมโยงกับการจองล่วงหน้า' : 'Linked with advance bookings'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {dateList.map((d) => (
            <button
              key={d.dateStr}
              onClick={() => setSelectedShiftDate(d.dateStr)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all border ${
                selectedShiftDate === d.dateStr
                  ? 'bg-amber-900 text-white border-amber-900 shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-semibold text-stone-500 uppercase mr-2">
          {lang === 'th' ? 'กรองสถานะวันนี้:' : 'Today Status Filter:'}
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
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              filterDuty === item.key
                ? 'bg-amber-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
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
              className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-900 text-amber-100 font-bold font-headline text-lg flex items-center justify-center shadow-xs">
                      {tItem.nickname.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-base">{tItem.fullName} ({tItem.nickname})</h3>
                      <p className="text-xs text-stone-500 font-medium">
                        {lang === 'th' ? 'กะงานวันนี้:' : 'Today Shift:'} {shiftLabels[getTherapistShiftForDate(tItem, '2026-10-02')]}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <StatusBadge status={tItem.status} size="sm" />
                  <span className="text-xs text-amber-900 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    {lang === 'th' ? `รับงานวันนี้: ${tItem.totalJobsToday} คิว` : `Jobs today: ${tItem.totalJobsToday}`}
                  </span>
                </div>

                {/* Multi-day Work Shift Manager Section */}
                <div className="mt-4 p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">
                      🗓️ {lang === 'th' ? `ตารางกะงานวันที่ ${selectedShiftDate}:` : `Shift on ${selectedShiftDate}:`}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${shiftOnSelectedDate === 'OFF' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-900'}`}>
                      {shiftOnSelectedDate}
                    </span>
                  </div>

                  <select
                    value={shiftOnSelectedDate}
                    onChange={(e) => updateTherapistShiftForDate(tItem.id, selectedShiftDate, e.target.value)}
                    disabled={!isOwner}
                    className={`w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer ${
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
                <div className="mt-4 pt-3 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                      ทักษะความเชี่ยวชาญ (Skills):
                    </label>
                    {!isOwner && <span className="text-[10px] text-stone-400">🔒 เฉพาะผู้จัดการ</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['Traditional Thai Massage', 'Aroma Therapy Massage', 'Foot Reflexology', 'FIWDEE Royal Herbal Spa', 'Deep Tissue', 'Hot Stone'].map((skill) => {
                      const isSelected = tItem.skills.includes(skill)
                      return (
                        <button
                          key={skill}
                          onClick={() => handleSkillToggle(tItem.id, skill)}
                          disabled={!isOwner}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer border ${
                            isSelected
                              ? 'bg-amber-900 text-white border-amber-900'
                              : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
                          } ${!isOwner ? 'cursor-default opacity-90' : ''}`}
                        >
                          {isSelected ? '✓ ' : '+ '}{skill}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Change Duty Status Controls */}
              <div className="pt-3 border-t border-stone-100 space-y-2">
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
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
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer text-center ${
                        tItem.status === st.key
                          ? 'bg-amber-900 text-white border-amber-900 font-bold shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
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
    </div>
  )
}
