import React, { createContext, useContext, useState } from 'react'
import { api } from '../../lib/api.js'
import { useLanguage } from '../../i18n/useLanguage.js'

const AdminAuthContext = createContext()

const AUTH_USER_KEY = 'fiwdee_admin_user'

// สิทธิ์ที่เข้าระบบหลังบ้านได้ — ยืนยันจาก JWT ที่ backend ออกให้ (role จริงจาก DB)
export const STAFF_ROLES = ['OWNER', 'RECEPTIONIST', 'THERAPIST']

// Domain Data (Initialized empty until fetched from Database)
const initialRooms = []
const initialTherapists = []
const initialQueueItems = []
const initialBookings = []
const initialServices = []

export function AdminAuthProvider({ children }) {
  const { t } = useLanguage()

  // Authentication State — JWT จริงจาก POST /api/auth/login (token + role จาก backend)
  const readAdminUser = () => {
    try {
      const rawAdmin = localStorage.getItem(AUTH_USER_KEY)
      if (rawAdmin) {
        const parsed = JSON.parse(rawAdmin)
        if (STAFF_ROLES.includes(parsed?.role)) return parsed
      }
      const rawCustomer = localStorage.getItem('fiwdee_customer_auth') || sessionStorage.getItem('fiwdee_customer_auth')
      if (rawCustomer) {
        const parsed = JSON.parse(rawCustomer)
        if (STAFF_ROLES.includes(parsed?.role)) return parsed
      }
      return null
    } catch {
      return null
    }
  }

  const [user, setUser] = useState(readAdminUser)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (!localStorage.getItem('fiwdee_token')) return false
    const u = readAdminUser()
    return !!u && STAFF_ROLES.includes(u.role)
  })

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error(t('admin.errRequired'))
    }

    const res = await api.post('/auth/login', { identifier: email, password })
    if (!res.success) {
      throw new Error(res.message || t('admin.errLoginFailed'))
    }

    const data = res.data
    if (!STAFF_ROLES.includes(data.role)) {
      throw new Error(t('admin.errNotStaff'))
    }

    const loggedUser = {
      id: data.userId,
      name: data.fullName,
      email: data.email,
      role: data.role,
    }
    localStorage.setItem('fiwdee_token', data.token)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(loggedUser))
    setUser(loggedUser)
    setIsAuthenticated(true)
    return loggedUser
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('fiwdee_token')
    localStorage.removeItem(AUTH_USER_KEY)
    localStorage.removeItem('fiwdee_customer_auth')
    sessionStorage.removeItem('fiwdee_customer_auth')
    window.location.hash = '#top'
  }

  // Shared domain state
  const [rooms, setRooms] = useState(initialRooms)
  const [therapists, setTherapists] = useState(initialTherapists)
  const [queueItems, setQueueItems] = useState(initialQueueItems)
  const [bookings, setBookings] = useState(initialBookings)
  const [services, setServices] = useState(initialServices)

  // ซิงก์ข้อมูลจริงจาก Database เมื่อล็อกอินสำเร็จ
  React.useEffect(() => {
    let isMounted = true
    if (!isAuthenticated) return

    // 1. ดึงผังห้องนวดจริง
    api.get('/admin/rooms').then((res) => {
      if (isMounted && res && res.success && Array.isArray(res.data)) {
        setRooms(res.data.map(r => ({
          id: r.roomNumber || `RM-${r.id}`,
          backendId: r.id,
          name: `ห้อง ${r.roomNumber}`,
          type: r.roomType || 'SINGLE',
          status: r.roomStatus || 'AVAILABLE',
          capacity: r.capacity || 1,
          cleaningBufferMinutes: r.cleaningBufferMinutes || 15,
          currentBooking: null,
          therapist: null,
          service: null
        })))
      }
    }).catch(() => {})

    // 2. ดึงเมนูบริการจริง
    api.get('/admin/services').then((res) => {
      if (isMounted && res && res.success && Array.isArray(res.data)) {
        setServices(res.data.map(s => ({
          id: s.id,
          code: s.serviceCode,
          name: s.serviceName,
          category: s.category || 'Massage',
          description: s.description,
          durations: (s.durationOptions || []).map(d => ({
            id: d.id,
            minutes: d.durationMinutes,
            price: Number(d.price)
          })),
          isActive: s.isActive
        })))
      }
    }).catch(() => {})

    // 2.1 ดึงหมอนวดจริง
    api.get('/admin/therapists').then((res) => {
      if (isMounted && res && res.success && Array.isArray(res.data)) {
        setTherapists(res.data.map(bt => ({
          id: bt.id,
          nickname: bt.nickname,
          fullName: bt.fullName,
          email: bt.email || '',
          phoneNumber: bt.phoneNumber || '',
          bio: bt.bio || '',
          commissionRate: bt.commissionRate !== undefined && bt.commissionRate !== null ? Number(bt.commissionRate) : 30.0,
          status: bt.isActive ? 'ON_DUTY' : 'OFF_DUTY',
          skills: bt.skills || [],
          shiftsByDate: {},
          totalJobsToday: 0,
          currentRoom: null
        })))
      }
    }).catch(() => {})

    // 3. ดึงคิวสดประจำวัน
    const todayStr = new Date().toISOString().slice(0, 10)
    api.get(`/admin/queue?date=${todayStr}`).then((res) => {
      if (isMounted && res && res.success && Array.isArray(res.data)) {
        if (res.data.length > 0) {
          setQueueItems(res.data.map(q => {
            const timeFormatted = q.scheduledStartDateTime
              ? new Date(q.scheduledStartDateTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
              : (q.checkInTime ? new Date(q.checkInTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-')

            return {
              queueId: q.queueId,
              queueNo: q.queueNumber || `Q-${q.queueId}`,
              bookingCode: q.bookingReferenceCode || (q.bookingId ? `BK-${q.bookingId}` : '-'),
              bookingId: q.bookingId,
              customerName: q.customerName || 'ลูกค้าหน้าร้าน',
              phone: '—',
              serviceName: q.serviceName || 'นวดแผนไทย',
              durationMinutes: 60,
              therapistName: q.therapistName || null,
              roomNo: q.roomNumber || null,
              status: q.queueStatus,
              type: 'ONLINE',
              time: timeFormatted,
              price: 600,
            }
          }))
        } else {
          // หากไม่มีคิวจริงในวันนี้ ล้างคิวม็อกออก
          setQueueItems([])
        }
      }
    }).catch(() => {})

    // 4. ดึงตารางการจองจริง
    api.get('/admin/bookings?size=20').then((res) => {
      if (isMounted && res && res.success && res.data) {
        const content = res.data.content || (Array.isArray(res.data) ? res.data : [])
        if (content.length > 0) {
          setBookings(content)
        }
      }
    }).catch(() => {})

    return () => { isMounted = false }
  }, [isAuthenticated])

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
    const targetRoomObj = rooms.find(r => r.id === selectedRoomNo)
    if (targetRoomObj?.backendId) {
      api.patch(`/admin/rooms/${targetRoomObj.backendId}/status`, { roomStatus: 'OCCUPIED' }).catch(() => {})
    }

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

    if (targetQueue?.queueId) {
      api.patch(`/admin/queue/${targetQueue.queueId}/status`, { status: 'IN_SERVICE' }).catch(() => {})
    }

    // Update corresponding Booking item
    if (targetQueue?.bookingId) {
      api.patch(`/bookings/${targetQueue.bookingId}/status?status=IN_SERVICE`).catch(() => {})
    }

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
    const todayStr = new Date().toISOString().slice(0, 10)
    const targetDate = newQueueData.date || todayStr
    const targetType = newQueueData.type || 'WALK_IN'

    // ⚠️ Validation Check: If Therapist selected, verify availability for the specific date!
    if (newQueueData.therapistName && newQueueData.therapistName !== 'ไม่ระบุ') {
      const selectedT = therapists.find(t => t.fullName === newQueueData.therapistName || t.nickname === newQueueData.therapistName)
      if (selectedT) {
        const shiftOnDate = getTherapistShiftForDate(selectedT, targetDate)
        if (shiftOnDate === 'OFF') {
          throw new Error(`หมอนวด "${selectedT.fullName}" มีตารางหยุดงาน (OFF) ในวันที่ ${targetDate} กรุณาเลือกหมอนวดท่านอื่น`)
        }
        const isToday = targetDate === todayStr || targetDate === '2026-10-02'
        if (isToday && selectedT.status !== 'ON_DUTY' && selectedT.status !== 'IN_SERVICE' && targetType === 'WALK_IN') {
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
    const bookingCode = `BK-${targetDate.replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    
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

  const addTherapist = (therapistData) => {
    if (user?.role !== 'OWNER') {
      throw new Error('สิทธิ์เฉพาะผู้จัดการ (OWNER) เท่านั้นในการเพิ่มหมอนวดใหม่')
    }
    const newId = therapists.length > 0 ? Math.max(...therapists.map(t => Number(t.id) || 0)) + 1 : 1
    const newTherapist = {
      id: newId,
      nickname: therapistData.nickname,
      fullName: therapistData.fullName,
      status: therapistData.status || 'ON_DUTY',
      skills: therapistData.skills || ['Traditional Thai Massage'],
      shiftsByDate: therapistData.shiftsByDate || {},
      totalJobsToday: 0,
      currentRoom: null,
    }
    setTherapists(prev => [...prev, newTherapist])
    return newTherapist
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
        addTherapist,
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
