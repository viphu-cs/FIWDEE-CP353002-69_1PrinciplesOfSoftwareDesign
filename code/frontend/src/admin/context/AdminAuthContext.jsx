import React, { createContext, useContext, useState } from 'react'

const AdminAuthContext = createContext()

// Mock Initial Domain Data
const initialRooms = [
  { id: 'RM-101', name: 'ห้องศิลาดล 1', type: 'SINGLE', status: 'OCCUPIED', currentBooking: 'BKG-20261002-001', therapist: 'มะลิ กัลยาณี', service: 'นวดอโรมาสุคนธบำบัด', duration: 90, startTime: '13:00', endTime: '14:30' },
  { id: 'RM-102', name: 'ห้องบุษบัน 2', type: 'SINGLE', status: 'AVAILABLE', currentBooking: null, therapist: null, service: null, duration: null },
  { id: 'RM-103', name: 'ห้องคู่วิมาน 3', type: 'COUPLE', status: 'CLEANING', currentBooking: null, therapist: null, service: null, duration: null },
  { id: 'RM-104', name: 'ห้องเกสร VIP 4', type: 'VIP', status: 'OCCUPIED', currentBooking: 'BKG-20261002-003', therapist: 'บัว รวีวรรณ', service: 'FIWDEE Royal Herbal Spa', duration: 120, startTime: '13:30', endTime: '15:30' },
  { id: 'RM-105', name: 'โซนนวดเท้า 1', type: 'FOOT_MASSAGE', status: 'AVAILABLE', currentBooking: null, therapist: null, service: null, duration: null },
  { id: 'RM-106', name: 'โซนนวดเท้า 2', type: 'FOOT_MASSAGE', status: 'MAINTENANCE', currentBooking: null, therapist: null, service: null, duration: null, note: 'ปรับปรุงเก้าอี้นวด' }
]

// Multi-day Work Shifts Schedule Mock (7 Days: 2026-10-02 to 2026-10-08)
const initialTherapists = [
  {
    id: 1,
    nickname: 'มะลิ',
    fullName: 'มะลิ กัลยาณี',
    status: 'IN_SERVICE',
    skills: ['Traditional Thai Massage', 'Aroma Therapy Massage', 'Foot Reflexology'],
    shiftsByDate: {
      '2026-10-02': 'MORNING', // 10:00 - 19:00
      '2026-10-03': 'MORNING',
      '2026-10-04': 'FULL_DAY', // 10:00 - 22:00
      '2026-10-05': 'OFF',
      '2026-10-06': 'EVENING', // 13:00 - 22:00
      '2026-10-07': 'MORNING',
      '2026-10-08': 'MORNING',
    },
    totalJobsToday: 3,
    currentRoom: 'RM-101'
  },
  {
    id: 2,
    nickname: 'บัว',
    fullName: 'บัว รวีวรรณ',
    status: 'IN_SERVICE',
    skills: ['Aroma Therapy Massage', 'FIWDEE Royal Herbal Spa', 'Hot Stone'],
    shiftsByDate: {
      '2026-10-02': 'FULL_DAY',
      '2026-10-03': 'OFF',
      '2026-10-04': 'EVENING',
      '2026-10-05': 'FULL_DAY',
      '2026-10-06': 'MORNING',
      '2026-10-07': 'FULL_DAY',
      '2026-10-08': 'EVENING',
    },
    totalJobsToday: 4,
    currentRoom: 'RM-104'
  },
  {
    id: 3,
    nickname: 'แพรว',
    fullName: 'แพรวพรรณ วงศ์สว่าง',
    status: 'ON_DUTY',
    skills: ['Traditional Thai Massage', 'Foot Reflexology', 'Deep Tissue'],
    shiftsByDate: {
      '2026-10-02': 'EVENING',
      '2026-10-03': 'FULL_DAY',
      '2026-10-04': 'MORNING',
      '2026-10-05': 'EVENING',
      '2026-10-06': 'OFF',
      '2026-10-07': 'EVENING',
      '2026-10-08': 'FULL_DAY',
    },
    totalJobsToday: 2,
    currentRoom: null
  },
  {
    id: 4,
    nickname: 'แก้ว',
    fullName: 'แก้วตา กุลนันท์',
    status: 'BREAK',
    skills: ['Foot Reflexology', 'Head & Shoulder'],
    shiftsByDate: {
      '2026-10-02': 'MORNING',
      '2026-10-03': 'MORNING',
      '2026-10-04': 'OFF',
      '2026-10-05': 'FULL_DAY',
      '2026-10-06': 'FULL_DAY',
      '2026-10-07': 'MORNING',
      '2026-10-08': 'MORNING',
    },
    totalJobsToday: 3,
    currentRoom: null
  },
  {
    id: 5,
    nickname: 'ฝน',
    fullName: 'น้ำฝน ชลธี',
    status: 'OFF_DUTY',
    skills: ['Traditional Thai Massage', 'Aroma Therapy Massage'],
    shiftsByDate: {
      '2026-10-02': 'OFF',
      '2026-10-03': 'EVENING',
      '2026-10-04': 'FULL_DAY',
      '2026-10-05': 'MORNING',
      '2026-10-06': 'EVENING',
      '2026-10-07': 'OFF',
      '2026-10-08': 'FULL_DAY',
    },
    totalJobsToday: 0,
    currentRoom: null
  }
]

const initialQueueItems = [
  { queueNo: 'Q-001', bookingCode: 'BKG-20261002-001', customerName: 'คุณกิตติศักดิ์', phone: '081-234-5678', serviceName: 'นวดอโรมาสุคนธบำบัด', durationMinutes: 90, therapistName: 'มะลิ กัลยาณี', roomNo: 'RM-101', status: 'IN_SERVICE', type: 'ONLINE', time: '13:00', price: 850 },
  { queueNo: 'Q-002', bookingCode: 'BKG-20261002-002', customerName: 'คุณวรรณิสา', phone: '089-876-5432', serviceName: 'นวดแผนไทยโบราณ', durationMinutes: 60, therapistName: 'แพรวพรรณ วงศ์สว่าง', roomNo: null, status: 'CHECKED_IN', type: 'WALK_IN', time: '13:45', price: 600 },
  { queueNo: 'Q-003', bookingCode: 'BKG-20261002-003', customerName: 'คุณธนกฤต & คุณภาวิณี', phone: '086-555-1234', serviceName: 'FIWDEE Royal Herbal Spa', durationMinutes: 120, therapistName: 'บัว รวีวรรณ', roomNo: 'RM-104', status: 'IN_SERVICE', type: 'ONLINE', time: '13:30', price: 1500 },
  { queueNo: 'Q-004', bookingCode: 'BKG-20261002-004', customerName: 'คุณอารียา', phone: '092-333-4444', serviceName: 'นวดเท้าคลายตึง', durationMinutes: 60, therapistName: 'แก้วตา กุลนันท์', roomNo: null, status: 'WAITING', type: 'WALK_IN', time: '14:00', price: 500 },
  { queueNo: 'Q-005', bookingCode: 'BKG-20261002-005', customerName: 'คุณณัฐพล', phone: '084-111-2222', serviceName: 'นวดคอบ่าไหล่ & กดจุด', durationMinutes: 60, therapistName: 'แพรวพรรณ วงศ์สว่าง', roomNo: null, status: 'CONFIRMED', type: 'ONLINE', time: '14:30', price: 750 }
]

const initialBookings = [
  { id: 'BKG-20261002-001', queueNo: 'Q-001', customerName: 'คุณกิตติศักดิ์', phone: '081-234-5678', serviceName: 'นวดอโรมาสุคนธบำบัด', durationMinutes: 90, therapistName: 'มะลิ กัลยาณี', roomNo: 'RM-101', date: '2026-10-02', time: '13:00', status: 'IN_SERVICE', price: 850, paymentStatus: 'PAID', channel: 'Mobile App' },
  { id: 'BKG-20261002-002', queueNo: 'Q-002', customerName: 'คุณวรรณิสา', phone: '089-876-5432', serviceName: 'นวดแผนไทยโบราณ', durationMinutes: 60, therapistName: 'แพรวพรรณ วงศ์สว่าง', roomNo: 'RM-102', date: '2026-10-02', time: '13:45', status: 'CHECKED_IN', price: 600, paymentStatus: 'PAID', channel: 'Walk-in' },
  { id: 'BKG-20261002-003', queueNo: 'Q-003', customerName: 'คุณธนกฤต & คุณภาวิณี', phone: '086-555-1234', serviceName: 'FIWDEE Royal Herbal Spa', durationMinutes: 120, therapistName: 'บัว รวีวรรณ', roomNo: 'RM-104', date: '2026-10-02', time: '13:30', status: 'IN_SERVICE', price: 1500, paymentStatus: 'PAID', channel: 'Website' },
  { id: 'BKG-20261002-004', queueNo: 'Q-004', customerName: 'คุณอารียา', phone: '092-333-4444', serviceName: 'นวดเท้าคลายตึง', durationMinutes: 60, therapistName: 'แก้วตา กุลนันท์', roomNo: 'RM-105', date: '2026-10-02', time: '14:00', status: 'PENDING', price: 500, paymentStatus: 'UNPAID', channel: 'Walk-in' },
  { id: 'BKG-20261002-005', queueNo: 'Q-005', customerName: 'คุณณัฐพล', phone: '084-111-2222', serviceName: 'นวดคอบ่าไหล่ & กดจุด', durationMinutes: 60, therapistName: 'แพรวพรรณ วงศ์สว่าง', roomNo: null, date: '2026-10-02', time: '14:30', status: 'CONFIRMED', price: 750, paymentStatus: 'PAID', channel: 'LINE OA' },
  { id: 'BKG-20261003-001', queueNo: 'Q-010', customerName: 'คุณปรียาพร', phone: '088-777-6666', serviceName: 'นวดแผนไทยโบราณ', durationMinutes: 90, therapistName: 'แพรวพรรณ วงศ์สว่าง', roomNo: 'RM-102', date: '2026-10-03', time: '11:00', status: 'CONFIRMED', price: 850, paymentStatus: 'PAID', channel: 'Phone Booking' },
  { id: 'BKG-20261004-001', queueNo: 'Q-012', customerName: 'คุณศุภโชค', phone: '082-111-9999', serviceName: 'นวดอโรมาสุคนธบำบัด', durationMinutes: 90, therapistName: 'บัว รวีวรรณ', roomNo: 'RM-104', date: '2026-10-04', time: '15:00', status: 'CONFIRMED', price: 1100, paymentStatus: 'PAID', channel: 'Website' }
]

const initialServices = [
  { id: 1, code: 'SVC-THAI', name: 'นวดแผนไทยโบราณ (Traditional Thai Massage)', category: 'Thai Massage', description: 'นวดกดจุดยืดเหยียดกล้ามเนื้อ ปรับสมดุลธาตุตามศาสตร์ไทยโบราณ', durations: [{ minutes: 60, price: 600 }, { minutes: 90, price: 850 }, { minutes: 120, price: 1100 }], isActive: true },
  { id: 2, code: 'SVC-AROMA', name: 'นวดอโรมาสุคนธบำบัด (Aroma Therapy Massage)', category: 'Aromatherapy', description: 'นวดน้ำมันหอมระเหยผ่อนคลายความเครียด บำรุงผิวพรรณอย่างล้ำลึก', durations: [{ minutes: 60, price: 800 }, { minutes: 90, price: 1100 }, { minutes: 120, price: 1400 }], isActive: true },
  { id: 3, code: 'SVC-HERBAL', name: 'FIWDEE Royal Herbal Spa (นวดประคบสมุนไพร)', category: 'Signature Spa', description: 'นวดไทยร่วมกับลูกประคบสมุนไพรอุ่น กระตุ้นการไหลเวียนโลหิต', durations: [{ minutes: 60, price: 750 }, { minutes: 90, price: 1000 }, { minutes: 120, price: 1300 }], isActive: true },
  { id: 4, code: 'SVC-FOOT', name: 'นวดเท้าคลายตึง (Foot Reflexology)', category: 'Reflexology', description: 'กดจุดสะท้อนเท้า ปรับสมดุลอวัยวะภายใน สบายเท้าและเบาตัว', durations: [{ minutes: 60, price: 500 }, { minutes: 90, price: 700 }], isActive: true }
]

export function AdminAuthProvider({ children }) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('fiwdee_admin_auth') === 'true'
  })

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fiwdee_admin_user')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
    return {
      id: 1,
      name: 'สมชาย สุขสบาย',
      email: 'owner@fiwdee-massage.co.th',
      role: 'OWNER',
    }
  })

  const login = (email, password, selectedRole = 'OWNER') => {
    if (!email || !password) {
      throw new Error('กรุณากรอกอีเมลและรหัสผ่าน')
    }
    const loggedUser = {
      id: Date.now(),
      name: selectedRole === 'OWNER' ? 'สมชาย สุขสบาย (ผู้จัดการ)' : 'คุณวิภาวรรณ (ต้อนรับ)',
      email: email,
      role: selectedRole,
    }
    setUser(loggedUser)
    setIsAuthenticated(true)
    localStorage.setItem('fiwdee_admin_auth', 'true')
    localStorage.setItem('fiwdee_admin_user', JSON.stringify(loggedUser))
    return true
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('fiwdee_admin_auth')
    localStorage.removeItem('fiwdee_admin_user')
  }

  // Shared domain state
  const [rooms, setRooms] = useState(initialRooms)
  const [therapists, setTherapists] = useState(initialTherapists)
  const [queueItems, setQueueItems] = useState(initialQueueItems)
  const [bookings, setBookings] = useState(initialBookings)
  const [services, setServices] = useState(initialServices)

  // Multi-day Work Shift Manager
  const updateTherapistShiftForDate = (therapistId, dateStr, shiftType) => {
    setTherapists(prev => prev.map(t => {
      if (t.id === therapistId) {
        return {
          ...t,
          shiftsByDate: {
            ...t.shiftsByDate,
            [dateStr]: shiftType
          }
        }
      }
      return t
    }))
  }

  const getTherapistShiftForDate = (therapist, dateStr) => {
    if (!therapist || !therapist.shiftsByDate) return 'OFF'
    return therapist.shiftsByDate[dateStr] || 'FULL_DAY'
  }

  // Domain Actions
  const updateRoomStatus = (roomId, newStatus, currentBooking = null, therapist = null, service = null) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          status: newStatus,
          currentBooking: newStatus === 'AVAILABLE' || newStatus === 'CLEANING' ? null : (currentBooking || room.currentBooking),
          therapist: newStatus === 'AVAILABLE' || newStatus === 'CLEANING' ? null : (therapist || room.therapist),
          service: newStatus === 'AVAILABLE' || newStatus === 'CLEANING' ? null : (service || room.service)
        }
      }
      return room
    }))
  }

  const updateQueueStatus = (queueNo, newStatus) => {
    const targetQueue = queueItems.find(q => q.queueNo === queueNo)
    if (targetQueue && newStatus === 'IN_SERVICE') {
      if (targetQueue.roomNo) {
        updateRoomStatus(targetQueue.roomNo, 'OCCUPIED', targetQueue.bookingCode, targetQueue.therapistName, targetQueue.serviceName)
      }
      if (targetQueue.therapistName) {
        setTherapists(prev => prev.map(t => (t.fullName === targetQueue.therapistName || t.nickname === targetQueue.therapistName) ? { ...t, status: 'IN_SERVICE' } : t))
      }
    } else if (targetQueue && newStatus === 'COMPLETED') {
      if (targetQueue.roomNo) {
        updateRoomStatus(targetQueue.roomNo, 'CLEANING')
      }
      if (targetQueue.therapistName) {
        setTherapists(prev => prev.map(t => (t.fullName === targetQueue.therapistName || t.nickname === targetQueue.therapistName) ? { ...t, status: 'ON_DUTY' } : t))
      }
    }

    setQueueItems(prev => prev.map(item => item.queueNo === queueNo ? { ...item, status: newStatus } : item))
    setBookings(prev => prev.map(bkg => {
      if (targetQueue && bkg.id === targetQueue.bookingCode) {
        return { ...bkg, status: newStatus }
      }
      return bkg
    }))
  }

  const assignAndStartService = (queueNo, { therapistName, roomNo, serviceName, durationMinutes, price }) => {
    const targetQueue = queueItems.find(q => q.queueNo === queueNo)
    if (!targetQueue) throw new Error('ไม่พบข้อมูลคิวนี้ในระบบ')

    const selectedTherapistName = therapistName || targetQueue.therapistName
    const selectedRoomNo = roomNo || targetQueue.roomNo
    const selectedServiceName = serviceName || targetQueue.serviceName
    const selectedDuration = durationMinutes ? parseInt(durationMinutes, 10) : targetQueue.durationMinutes
    const selectedPrice = price || targetQueue.price

    if (!selectedTherapistName || selectedTherapistName === 'ไม่ระบุ') {
      throw new Error('กรุณาระบุหมอนวดผู้ให้บริการ')
    }
    if (!selectedRoomNo) {
      throw new Error('กรุณาระบุห้องนวดที่ใช้งาน')
    }

    // Update Room status to OCCUPIED
    updateRoomStatus(selectedRoomNo, 'OCCUPIED', targetQueue.bookingCode, selectedTherapistName, selectedServiceName)

    // Update Therapist status to IN_SERVICE
    setTherapists(prev => prev.map(t => (t.fullName === selectedTherapistName || t.nickname === selectedTherapistName) ? { ...t, status: 'IN_SERVICE', currentRoom: selectedRoomNo } : t))

    // Update Queue item
    setQueueItems(prev => prev.map(item => item.queueNo === queueNo ? {
      ...item,
      status: 'IN_SERVICE',
      therapistName: selectedTherapistName,
      roomNo: selectedRoomNo,
      serviceName: selectedServiceName,
      durationMinutes: selectedDuration,
      price: selectedPrice
    } : item))

    // Update corresponding Booking item
    setBookings(prev => prev.map(bkg => {
      if (bkg.id === targetQueue.bookingCode || bkg.queueNo === queueNo) {
        return {
          ...bkg,
          status: 'IN_SERVICE',
          therapistName: selectedTherapistName,
          roomNo: selectedRoomNo,
          serviceName: selectedServiceName,
          durationMinutes: selectedDuration,
          price: selectedPrice
        }
      }
      return bkg
    }))
  }



  const addWalkInQueue = (newQueueData) => {
    const targetDate = newQueueData.date || '2026-10-02'
    const targetType = newQueueData.type || 'WALK_IN'

    // ⚠️ Validation Check: If Therapist selected, verify availability for the specific date!
    if (newQueueData.therapistName && newQueueData.therapistName !== 'ไม่ระบุ') {
      const selectedT = therapists.find(t => t.fullName === newQueueData.therapistName || t.nickname === newQueueData.therapistName)
      if (selectedT) {
        const shiftOnDate = getTherapistShiftForDate(selectedT, targetDate)
        if (shiftOnDate === 'OFF') {
          throw new Error(`หมอนวด "${selectedT.fullName}" มีตารางหยุดงาน (OFF) ในวันที่ ${targetDate} กรุณาเลือกหมอนวดท่านอื่น`)
        }
        if (targetDate === '2026-10-02' && selectedT.status !== 'ON_DUTY' && selectedT.status !== 'IN_SERVICE' && targetType === 'WALK_IN') {
          throw new Error(`หมอนวด "${selectedT.fullName}" ไม่พร้อมรับงานทันทีในขณะนี้ (${selectedT.status})`)
        }
      }
    }

    // ⚠️ Validation Check: If Room selected, verify availability
    if (newQueueData.roomNo && targetType === 'WALK_IN') {
      const selectedR = rooms.find(r => r.id === newQueueData.roomNo)
      if (selectedR && selectedR.status !== 'AVAILABLE') {
        throw new Error(`ห้องนวด "${selectedR.id} - ${selectedR.name}" ไม่พร้อมใช้งาน (สถานะ: ${selectedR.status})`)
      }
    }

    const nextNum = queueItems.length + 1
    const queueNo = `Q-${String(nextNum).padStart(3, '0')}`
    const bookingCode = `BKG-${targetDate.replace(/-/g, '')}-${String(Math.floor(1000 + Math.random() * 9000))}`
    
    const newQueue = {
      queueNo,
      bookingCode,
      customerName: newQueueData.customerName,
      phone: newQueueData.phone || '080-000-0000',
      serviceName: newQueueData.serviceName,
      durationMinutes: parseInt(newQueueData.durationMinutes || 60, 10),
      therapistName: newQueueData.therapistName || 'ไม่ระบุ',
      roomNo: newQueueData.roomNo || null,
      status: newQueueData.roomNo && targetType === 'WALK_IN' ? 'CHECKED_IN' : 'WAITING',
      type: targetType,
      time: newQueueData.time || new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      price: newQueueData.price || 600
    }

    const newBooking = {
      id: bookingCode,
      queueNo,
      customerName: newQueueData.customerName,
      phone: newQueueData.phone || '080-000-0000',
      serviceName: newQueueData.serviceName,
      durationMinutes: parseInt(newQueueData.durationMinutes || 60, 10),
      therapistName: newQueueData.therapistName || 'ไม่ระบุ',
      roomNo: newQueueData.roomNo || null,
      date: targetDate,
      time: newQueueData.time || new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      status: newQueueData.roomNo && targetType === 'WALK_IN' ? 'CHECKED_IN' : 'PENDING',
      price: newQueueData.price || 600,
      paymentStatus: 'PAID',
      channel: targetType === 'PHONE_BOOKING' ? 'Phone Reservation' : 'Walk-in'
    }

    setQueueItems(prev => [newQueue, ...prev])
    setBookings(prev => [newBooking, ...prev])

    if (newQueueData.roomNo && targetType === 'WALK_IN') {
      updateRoomStatus(newQueueData.roomNo, 'OCCUPIED', bookingCode, newQueueData.therapistName, newQueueData.serviceName)
    }
    if (newQueueData.therapistName && newQueueData.therapistName !== 'ไม่ระบุ' && targetType === 'WALK_IN') {
      setTherapists(prev => prev.map(t => (t.fullName === newQueueData.therapistName || t.nickname === newQueueData.therapistName) ? { ...t, status: 'IN_SERVICE' } : t))
    }
  }

  const updateTherapistStatus = (therapistId, newStatus) => {
    setTherapists(prev => prev.map(t => t.id === therapistId ? { ...t, status: newStatus } : t))
  }

  const addOrUpdateService = (serviceData) => {
    if (user.role !== 'OWNER') {
      throw new Error('สิทธิ์เฉพาะผู้จัดการ (OWNER) เท่านั้นในการแก้ไขหรือเพิ่มเมนูบริการ')
    }
    if (serviceData.id) {
      setServices(prev => prev.map(s => s.id === serviceData.id ? { ...s, ...serviceData } : s))
    } else {
      const newId = services.length + 1
      setServices(prev => [...prev, { ...serviceData, id: newId, isActive: true }])
    }
  }

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        user,
        setUser,
        rooms,
        setRooms,
        updateRoomStatus,
        therapists,
        setTherapists,
        updateTherapistStatus,
        updateTherapistShiftForDate,
        getTherapistShiftForDate,
        queueItems,
        setQueueItems,
        updateQueueStatus,
        assignAndStartService,
        addWalkInQueue,
        bookings,
        setBookings,
        services,
        setServices,
        addOrUpdateService
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
