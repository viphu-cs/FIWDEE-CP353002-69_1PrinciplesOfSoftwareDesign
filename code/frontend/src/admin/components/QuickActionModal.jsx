import React, { useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'

const serviceSkillMap = {
  'นวดแผนไทยโบราณ': 'Traditional Thai Massage',
  'นวดอโรมาสุคนธบำบัด': 'Aroma Therapy Massage',
  'นวดเท้าคลายตึง': 'Foot Reflexology',
  'FIWDEE Royal Herbal Spa': 'FIWDEE Royal Herbal Spa'
}

export default function QuickActionModal({ isOpen, onClose, modalType = 'walkin', initialData = null }) {
  const { services, therapists, rooms, addWalkInQueue, updateRoomStatus, assignAndStartService } = useAdminAuth()
  const { lang, t } = useLanguage()

  const todayStr = new Date().toISOString().slice(0, 10)
  const nowTimeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })

  // Registration Mode: 'WALK_IN' or 'PHONE_BOOKING'
  const [bookingType, setBookingType] = useState('WALK_IN')

  // Form State
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedService, setSelectedService] = useState(services[0]?.name || '')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [selectedTherapist, setSelectedTherapist] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')
  const [bookingDate, setBookingDate] = useState(todayStr)
  const [bookingTime, setBookingTime] = useState(nowTimeStr || '14:30')
  const [errorMsg, setErrorMsg] = useState('')

  // Form State for Room Status Edit
  const [roomStatus, setRoomStatus] = useState(initialData?.status || 'AVAILABLE')

  // State for Assign Service Mode
  const [assignTherapist, setAssignTherapist] = useState(
    initialData?.therapistName && initialData?.therapistName !== 'ไม่ระบุ' ? initialData.therapistName : ''
  )
  const [assignRoom, setAssignRoom] = useState(initialData?.roomNo || '')
  const [assignService, setAssignService] = useState(initialData?.serviceName || services[0]?.name || '')
  const [assignDuration, setAssignDuration] = useState(initialData?.durationMinutes || 60)

  if (!isOpen) return null

  const availableTherapists = therapists.filter(t => t.status === 'ON_DUTY' || t.fullName === assignTherapist || t.nickname === assignTherapist)
  const availableRooms = rooms.filter(r => r.status === 'AVAILABLE' || r.id === assignRoom)

  const handleQueueSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!customerName.trim()) {
      setErrorMsg(lang === 'th' ? 'กรุณากรอกชื่อลูกค้า' : 'Please enter customer name')
      return
    }

    const serviceObj = services.find(s => s.name === selectedService) || services[0]
    const durOpt = serviceObj?.durations?.find(d => d.minutes === Number(durationMinutes))
    const price = durOpt ? durOpt.price : 600

    try {
      addWalkInQueue({
        customerName: bookingType === 'PHONE_BOOKING' ? `${customerName} (โทรจอง)` : customerName,
        phone,
        serviceName: selectedService,
        durationMinutes: Number(durationMinutes),
        therapistName: selectedTherapist || 'ไม่ระบุ',
        roomNo: selectedRoom || null,
        price,
        type: bookingType,
        date: bookingDate,
        time: bookingTime
      })

      setCustomerName('')
      setPhone('')
      setErrorMsg('')
      onClose()
    } catch (err) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาด ไม่สามารถลงทะเบียนคิวได้')
    }
  }

  const handleAssignSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!assignTherapist) {
      setErrorMsg(lang === 'th' ? 'กรุณาเลือกหมอนวดที่ว่างรับงาน' : 'Please select an available therapist')
      return
    }
    if (!assignRoom) {
      setErrorMsg(lang === 'th' ? 'กรุณาเลือกห้องนวดที่ว่างอยู่' : 'Please select an available room')
      return
    }

    const serviceObj = services.find(s => s.name === assignService) || services[0]
    const durOpt = serviceObj?.durations?.find(d => d.minutes === Number(assignDuration))
    const price = durOpt ? durOpt.price : (initialData?.price || 600)

    try {
      assignAndStartService(initialData.queueNo, {
        therapistName: assignTherapist,
        roomNo: assignRoom,
        serviceName: assignService,
        durationMinutes: Number(assignDuration),
        price
      })
      setErrorMsg('')
      onClose()
    } catch (err) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาด')
    }
  }

  const handleRoomStatusSubmit = (e) => {
    e.preventDefault()
    if (initialData?.id) {
      updateRoomStatus(initialData.id, roomStatus)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-body-md">
      <div className="bg-surface rounded-2xl shadow-2xl max-w-lg w-full border border-outline-variant overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="bg-teak-deep text-warm-ivory px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-terracotta">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <h3 className="font-semibold text-lg font-headline tracking-wide">
              {modalType === 'walkin'
                ? (lang === 'th' ? 'ลงทะเบียนคิวใหม่ (Walk-in & โทรจอง)' : 'New Queue Registration (Walk-in & Phone)')
                : modalType === 'assign_service'
                ? (lang === 'th' ? `ระบุหมอนวดและห้องนวด (คิว ${initialData?.queueNo})` : `Assign Therapist & Room (Queue ${initialData?.queueNo})`)
                : `${t('admin.rooms')} (${initialData?.name || initialData?.id})`}
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-warm-ivory/70 hover:text-warm-ivory text-xl leading-none p-1 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        {modalType === 'walkin' ? (
          <form onSubmit={handleQueueSubmit} className="p-6 space-y-4 text-stone-800">
            {/* Booking Type Selector */}
            <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200">
              <button
                type="button"
                onClick={() => setBookingType('WALK_IN')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  bookingType === 'WALK_IN'
                    ? 'bg-teak-dark text-warm-ivory shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {lang === 'th' ? 'ลูกค้า Walk-in หน้าร้าน' : 'Walk-in Customer'}
              </button>
              <button
                type="button"
                onClick={() => setBookingType('PHONE_BOOKING')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  bookingType === 'PHONE_BOOKING'
                    ? 'bg-teak-dark text-warm-ivory shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {lang === 'th' ? 'โทรจองนัดหมาย (Phone)' : 'Phone Booking'}
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                {t('admin.customerName')} *
              </label>
              <input
                type="text"
                required
                placeholder={lang === 'th' ? 'เช่น คุณกิตติศักดิ์ มีสุข' : 'e.g. John Doe'}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/40 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  {t('admin.phone')}
                </label>
                <input
                  type="tel"
                  placeholder="08X-XXX-XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/40 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  {t('admin.duration')}
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/40 text-sm bg-stone-50"
                >
                  <option value={60}>60 {lang === 'th' ? 'นาที' : 'Mins'}</option>
                  <option value={90}>90 {lang === 'th' ? 'นาที' : 'Mins'}</option>
                  <option value={120}>120 {lang === 'th' ? 'นาที' : 'Mins'}</option>
                </select>
              </div>
            </div>

            {/* Date & Time Slot Selection (Especially for Phone Booking) */}
            {bookingType === 'PHONE_BOOKING' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-200/60">
                <div>
                  <label className="block text-xs font-semibold text-amber-900 uppercase tracking-wider mb-1">
                    {t('admin.date')}
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-semibold text-stone-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-900 uppercase tracking-wider mb-1">
                    {t('admin.timeSlot')}
                  </label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-semibold text-stone-800 focus:outline-none"
                  >
                    {['10:00', '11:00', '12:00', '13:00', '14:00', '14:30', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map(t => (
                      <option key={t} value={t}>{t} น.</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                {t('admin.service')}
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/40 text-sm bg-stone-50"
              >
                {services.map((svc) => (
                  <option key={svc.id} value={svc.name}>
                    {svc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  {t('admin.therapist')}
                </label>
                <select
                  value={selectedTherapist}
                  onChange={(e) => setSelectedTherapist(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/40 text-sm bg-stone-50"
                >
                  <option value="">{lang === 'th' ? 'ไม่ระบุ (หมอนวดคิวถัดไป)' : 'Auto Assign'}</option>
                  {therapists.map((t) => {
                    const isAvail = t.status === 'ON_DUTY'
                    const reqSkill = serviceSkillMap[selectedService]
                    const hasSkill = reqSkill ? t.skills?.includes(reqSkill) : true
                    return (
                      <option key={t.id} value={t.fullName} disabled={!isAvail}>
                        {t.nickname} - {t.fullName} ({isAvail ? (lang === 'th' ? 'พร้อมให้บริการ' : 'Ready') : (lang === 'th' ? 'ไม่ว่าง' : 'Busy')}){reqSkill ? (hasSkill ? ' · มีทักษะตรง' : ' · ทักษะไม่ตรง') : ''}
                      </option>
                    )
                  })}
                </select>
                {availableTherapists.length === 0 && (
                  <p className="text-[11px] text-stone-500 mt-1 font-medium">ขณะนี้ไม่มีหมอนวดว่าง</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  {t('admin.room')}
                </label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/40 text-sm bg-stone-50"
                >
                  <option value="">{lang === 'th' ? 'จัดห้องทีหลัง' : 'Assign Later'}</option>
                  {rooms.map((r) => {
                    const isAvail = r.status === 'AVAILABLE'
                    return (
                      <option key={r.id} value={r.id} disabled={!isAvail}>
                        {r.id} - {r.name} ({isAvail ? (lang === 'th' ? 'ห้องว่าง' : 'Available') : (lang === 'th' ? 'ไม่ว่าง' : 'Unavailable')})
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-2 border-t border-stone-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-sm font-medium transition-colors cursor-pointer"
              >
                {t('admin.cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teak-dark text-warm-ivory hover:bg-teak-deep text-sm font-semibold shadow-xs transition-all cursor-pointer"
              >
                {t('admin.save')}
              </button>
            </div>
          </form>
        ) : modalType === 'assign_service' ? (
          <form onSubmit={handleAssignSubmit} className="p-6 space-y-4 text-stone-800">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between font-bold text-stone-900">
                <span>คิว: {initialData?.queueNo}</span>
                <span className="text-amber-900">คุณ {initialData?.customerName}</span>
              </div>
              <div className="text-stone-500">
                เบอร์โทร: {initialData?.phone} | เวลา: {initialData?.time} น.
              </div>
            </div>

            {/* Service & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  บริการ (Service)
                </label>
                <select
                  value={assignService}
                  onChange={(e) => setAssignService(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/40 text-xs bg-stone-50"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  ระยะเวลา (นาที)
                </label>
                <select
                  value={assignDuration}
                  onChange={(e) => setAssignDuration(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/40 text-xs bg-stone-50"
                >
                  {[60, 90, 120].map(m => (
                    <option key={m} value={m}>{m} นาที</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Select Therapist (Only Available / ON_DUTY) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                ระบุหมอนวดที่ผู้ให้บริการ <span className="text-rose-600">*</span>
              </label>
              <select
                value={assignTherapist}
                onChange={(e) => setAssignTherapist(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/40 text-sm bg-stone-50 font-medium"
              >
                <option value="">-- {lang === 'th' ? 'เลือกหมอนวด (เฉพาะผู้ที่เข้ากะและว่างอยู่)' : 'Select Therapist (On Duty)'} --</option>
                {therapists.map((t) => {
                  const isAvailable = t.status === 'ON_DUTY' || t.fullName === assignTherapist || t.nickname === assignTherapist
                  const reqSkill = serviceSkillMap[assignService]
                  const hasSkill = reqSkill ? t.skills?.includes(reqSkill) : true
                  return (
                    <option key={t.id} value={t.fullName} disabled={!isAvailable}>
                      {t.nickname} ({t.fullName}) - {isAvailable ? (lang === 'th' ? 'พร้อมรับงาน' : 'On Duty') : (lang === 'th' ? 'ไม่ว่าง' : 'Busy')}{reqSkill ? (hasSkill ? ' · มีทักษะตรง' : ' · ทักษะไม่ตรง') : ''}
                    </option>
                  )
                })}
              </select>
              {availableTherapists.length === 0 && (
                <p className="text-[11px] text-stone-500 mt-1 font-medium">ไม่มีหมอนวดว่างในขณะนี้ กรุณาเปลี่ยนกะหมอนวดหรือรอหมอนวดทำบริการเสร็จ</p>
              )}
            </div>

            {/* Select Room (Only Available / AVAILABLE) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                ระบุห้องนวดที่ใช้งาน <span className="text-rose-600">*</span>
              </label>
              <select
                value={assignRoom}
                onChange={(e) => setAssignRoom(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/40 text-sm bg-stone-50 font-medium"
              >
                <option value="">-- {lang === 'th' ? 'เลือกห้องนวด (เฉพาะห้องว่าง)' : 'Select Available Room'} --</option>
                {rooms.map((r) => {
                  const isAvailable = r.status === 'AVAILABLE' || r.id === assignRoom
                  return (
                    <option key={r.id} value={r.id} disabled={!isAvailable}>
                      {r.id} - {r.name} ({r.type}) - {isAvailable ? (lang === 'th' ? 'ห้องว่าง' : 'Available') : (lang === 'th' ? 'ไม่ว่าง' : 'Unavailable')}
                    </option>
                  )
                })}
              </select>
              {availableRooms.length === 0 && (
                <p className="text-[11px] text-stone-500 mt-1 font-medium">ไม่มีห้องนวดว่างในขณะนี้ กรุณารอทำความสะอาดห้องนวดก่อน</p>
              )}
            </div>

            <div className="pt-4 flex items-center justify-end gap-2 border-t border-stone-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-sm font-medium transition-colors cursor-pointer"
              >
                {t('admin.cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teak-dark text-warm-ivory hover:bg-teak-deep text-sm font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {lang === 'th' ? 'ยืนยันและเริ่มบริการ' : 'Confirm & Start'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRoomStatusSubmit} className="p-6 space-y-4 text-stone-800">
            <div>
              <p className="text-sm text-stone-600 mb-3">
                เปลี่ยนสถานะสำหรับห้อง: <strong className="text-stone-900">{initialData?.name}</strong> ({initialData?.id})
              </p>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                เลือกสถานะห้องใหม่
              </label>
              <div className="space-y-2">
                {[
                  { key: 'AVAILABLE', label: `พร้อมใช้งาน (${t('admin.available')})`, desc: 'ห้องว่าง สามารถจัดลูกค้าเข้าใช้งานได้ทันที' },
                  { key: 'OCCUPIED', label: `มีผู้ใช้บริการ (${t('admin.occupied')})`, desc: 'กำลังอยู่ในระหว่างการให้บริการนวด' },
                  { key: 'CLEANING', label: `กำลังทำความสะอาด (${t('admin.cleaning')})`, desc: 'พนักงานกำลังทำความสะอาดและเปลี่ยนผ้าเช็ดตัว' },
                  { key: 'MAINTENANCE', label: `ปิดปรับปรุง (${t('admin.maintenance')})`, desc: 'งดให้บริการชั่วคราวเพื่อซ่อมแซม' }
                ].map((st) => (
                  <label
                    key={st.key}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      roomStatus === st.key ? 'border-amber-800 bg-amber-50/60 ring-1 ring-amber-800' : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="roomStatus"
                      value={st.key}
                      checked={roomStatus === st.key}
                      onChange={(e) => setRoomStatus(e.target.value)}
                      className="mt-1 accent-amber-900"
                    />
                    <div>
                      <div className="text-sm font-medium text-stone-900">{st.label}</div>
                      <div className="text-xs text-stone-500">{st.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-2 border-t border-stone-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-sm font-medium transition-colors cursor-pointer"
              >
                {t('admin.cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teak-dark text-warm-ivory hover:bg-teak-deep text-sm font-semibold shadow-xs transition-all cursor-pointer"
              >
                {t('admin.save')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
