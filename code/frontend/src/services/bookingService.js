import api from '../lib/api.js'

/**
 * Booking Service Abstraction (DIP: Data Access & Business Logic abstraction)
 * High-level components depend on this service instead of raw hardcoded datasets.
 */

// Fallback & mapping asset helpers
const SERVICE_IMAGES = {
  THAI: '/images/services/service-thai.jpg',
  AROMA: '/images/services/service-aroma.jpg',
  HOT_OIL: '/images/services/service-warm-oil.jpg',
  FOOT: '/images/services/service-foot.jpg',
  HERBAL: '/images/services/service-warm-oil.jpg',
}

const THERAPIST_ASSETS = {
  5: {
    avatar: '/images/booking/therapist-mali-avatar.jpg',
    image: '/images/booking/therapist-mali.jpg',
    exp: 'Master Specialist • 6 ปี',
    badges: ['ไทยราชสำนัก', 'อโรมาเธอราปี', 'ศีรษะอินเดียน'],
    handWeight: 'ปานกลาง - นุ่มลึก',
  },
  6: {
    avatar: '/images/booking/therapist-bua.jpg',
    image: '/images/booking/therapist-bua.jpg',
    exp: 'Aroma Specialist • 8 ปี',
    badges: ['สุคนธบำบัด', 'สวีดิชรีแลกซ์', 'ปรับสมดุลหลับ'],
    handWeight: 'นุ่มนวล - ละมุนจิต',
  },
  7: {
    avatar: '/images/booking/therapist-praew.jpg',
    image: '/images/booking/therapist-praew.jpg',
    exp: 'Deep Tissue Master • 10 ปี',
    badges: ['ไทยแก้อาการ', 'ประคบสมุนไพร', 'สะท้อนฝ่าเท้า'],
    handWeight: 'แน่นลึก - ตรงจุด',
  },
  8: {
    avatar: '/images/booking/therapist-karn.jpg',
    image: '/images/booking/therapist-karn.jpg',
    exp: 'Holistic Practitioner • 7 ปี',
    badges: ['หัตถเวชโบราณ', 'ยืดเหยียดกาย', 'น้ำมันอุ่น'],
    handWeight: 'ปานกลาง - จังหวะต่อเนื่อง',
  },
  9: {
    avatar: '/images/booking/therapist-mali.jpg',
    image: '/images/booking/therapist-mali.jpg',
    exp: 'Aroma Specialist • 5 ปี',
    badges: ['อโรมาเธอราปี', 'นวดเท้าผ่อนคลาย'],
    handWeight: 'นุ่มนวล - สบายคลายเกร็ง',
  },
  10: {
    avatar: '/images/booking/therapist-bua.jpg',
    image: '/images/booking/therapist-bua.jpg',
    exp: 'Senior Specialist • 9 ปี',
    badges: ['ครบเครื่องศาสตร์หัตถการ', 'อโรมา', 'ไทยประคบ'],
    handWeight: 'ปรับตามสรีระบุคคล',
  },
  15: {
    avatar: '/images/booking/therapist-praew.jpg',
    image: '/images/booking/therapist-praew.jpg',
    exp: 'Master Aroma Specialist • 7 ปี',
    badges: ['สุคนธบำบัด', 'นวดอโรมาลึก'],
    handWeight: 'นุ่มลึก - ละเมียดละไม',
  },
}

export const therapistsData = [
  {
    id: 5,
    backendId: 5,
    name: 'คุณมะลิ (Mali)',
    shortName: 'คุณมะลิ',
    role: 'เชี่ยวชาญนวดไทยราชสำนักและอโรมา',
    exp: 'Master Specialist • 6 ปี',
    avatarExp: 'ความเชี่ยวชาญราชสำนัก 8 ปี',
    badges: ['ไทยราชสำนัก', 'อโรมาเธอราปี', 'ศีรษะอินเดียน'],
    bio: 'เน้นสัมผัสนุ่มลึก จังหวะช้าละเมียดละไม ช่วยปลดล็อกอาการตึงเกร็งสะสมได้อย่างเป็นธรรมชาติ',
    handWeight: 'ปานกลาง - นุ่มลึก',
    image: '/images/booking/therapist-mali.jpg',
    avatar: '/images/booking/therapist-mali-avatar.jpg',
  },
  {
    id: 6,
    backendId: 6,
    name: 'คุณดาว (Dao)',
    shortName: 'คุณดาว',
    role: 'ผู้เชี่ยวชาญศาสตร์อโรมาและกลิ่นบำบัด',
    exp: 'Aroma Specialist • 8 ปี',
    avatarExp: 'ผู้เชี่ยวชาญกลิ่นบำบัด 8 ปี',
    badges: ['สุคนธบำบัด', 'สวีดิชรีแลกซ์', 'ปรับสมดุลหลับ'],
    bio: 'เชี่ยวชาญการจับคู่กลิ่นและลูบไล้เส้นลมปราณเพื่อระบายความล้า ส่งจิตใจเข้าสู่สภาวะพักผ่อนอย่างล้ำลึก',
    handWeight: 'นุ่มนวล - ละมุนจิต',
    image: '/images/booking/therapist-bua.jpg',
    avatar: '/images/booking/therapist-bua.jpg',
  },
  {
    id: 7,
    backendId: 7,
    name: 'คุณพิม (Pim)',
    shortName: 'คุณพิม',
    role: 'ผู้ชำนาญการแก้อาการและสะท้อนเท้า',
    exp: 'Deep Tissue Master • 10 ปี',
    avatarExp: 'แก้อาการและพังผืดลึก 10 ปี',
    badges: ['ไทยแก้อาการ', 'ประคบสมุนไพร', 'สะท้อนฝ่าเท้า'],
    bio: 'สลายพังผืดกล้ามเนื้อชั้นลึก บรรเทาออฟฟิศซินโดรมและอาการคอบ่าไหล่เรื้อรังอย่างตรงจุดแม่นยำ',
    handWeight: 'แน่นลึก - ตรงจุด',
    image: '/images/booking/therapist-praew.jpg',
    avatar: '/images/booking/therapist-praew.jpg',
  },
  {
    id: 8,
    backendId: 8,
    name: 'คุณนก (Nok)',
    shortName: 'คุณนก',
    role: 'หัตถเวชโบราณและปรับโครงสร้างกาย',
    exp: 'Holistic Practitioner • 7 ปี',
    avatarExp: 'หัตถเวชโบราณ 7 ปี',
    badges: ['หัตถเวชโบราณ', 'ยืดเหยียดกาย', 'น้ำมันอุ่น'],
    bio: 'ศาสตร์ยืดเหยียดผสานจุดเส้นเอ็น ฟื้นฟูความคล่องตัวและคืนความสมดุลให้กระดูกสันหลัง',
    handWeight: 'ปานกลาง - จังหวะต่อเนื่อง',
    image: '/images/booking/therapist-karn.jpg',
    avatar: '/images/booking/therapist-karn.jpg',
  },
  {
    id: 'any',
    backendId: null,
    name: 'ให้ร้านจัดสรรให้ (Any Specialist)',
    shortName: 'ให้ร้านจัดสรรให้',
    role: 'คัดสรรโดย FIWDEE Boutique Retreatment',
    exp: 'Any Available Specialist',
    avatarExp: 'คัดเลือกโดยผู้จัดการสาขา',
    badges: ['คัดเลือกเฉพาะบุคคล', 'เวลาคิวรวดเร็ว'],
    bio: 'ให้ทีมงานคัดเลือกผู้บำบัดที่เชี่ยวชาญเหมาะสมกับทรีตเมนต์และสรีระของท่านที่สุด',
    handWeight: 'แมตช์ตามประเภทบริการ',
    isConcierge: true,
  },
]

export const servicesData = [
  {
    id: 1,
    serviceCode: 'THAI',
    name: 'นวดไทยราชสำนัก (Royal Thai Massage)',
    desc: 'ศาสตร์การกดจุดตามแนวเส้นประธานสิบ ผสานการยืดเหยียดอย่างนุ่มนวล คลายความตึงเกร็ง',
    isPopular: true,
    image: '/images/services/service-thai.jpg',
    durationOptions: [
      { id: 1, minutes: 60, price: 500 },
      { id: 2, minutes: 90, price: 700 },
      { id: 3, minutes: 120, price: 900 },
    ],
  },
  {
    id: 2,
    serviceCode: 'AROMA',
    name: 'นวดอโรมาเธอราปี (Organic Aromatherapy)',
    desc: 'น้ำมันสกัดออร์แกนิกและศาสตร์กลิ่นบำบัดผ่อนคลายลึก จังหวะนุ่มนวลฟื้นฟูการนอนหลับ',
    image: '/images/services/service-aroma.jpg',
    durationOptions: [
      { id: 4, minutes: 60, price: 700 },
      { id: 5, minutes: 90, price: 950 },
      { id: 6, minutes: 120, price: 1200 },
    ],
  },
  {
    id: 3,
    serviceCode: 'HOT_OIL',
    name: 'นวดน้ำมันอุ่นสมุนไพร (Warm Herbal Oil)',
    desc: 'น้ำมันงาดำและไพลสดอุ่น กระตุ้นการไหลเวียนโลหิต บรรเทาอาการเมื่อยล้าสะสม',
    image: '/images/services/service-warm-oil.jpg',
    durationOptions: [
      { id: 7, minutes: 60, price: 800 },
      { id: 8, minutes: 90, price: 1100 },
      { id: 9, minutes: 120, price: 1400 },
    ],
  },
  {
    id: 4,
    serviceCode: 'FOOT',
    name: 'นวดกดจุดสะท้อนเท้า (Foot Reflexology)',
    desc: 'กระตุ้นศูนย์รวมประสาทฝ่าเท้า คืนความเบาสบายคล่องตัวและการทำงานสมดุลของร่างกาย',
    image: '/images/services/service-foot.jpg',
    durationOptions: [
      { id: 10, minutes: 60, price: 400 },
      { id: 11, minutes: 90, price: 550 },
      { id: 12, minutes: 120, price: 700 },
    ],
  },
  {
    id: 6,
    serviceCode: 'HERBAL',
    name: 'นวดประคบสมุนไพรสด (Herbal Compress)',
    desc: 'นวดประคบสมุนไพรสดตำรับโบราณ บรรเทาอาการเมื่อยล้าเส้นเอ็นและกล้ามเนื้ออย่างตรงจุด',
    image: '/images/services/service-warm-oil.jpg',
    durationOptions: [
      { id: 15, minutes: 60, price: 600 },
      { id: 16, minutes: 90, price: 850 },
    ],
  },
]

export function generateDateOptions() {
  const daysOfWeekTh = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
  const monthsTh = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
  ]
  const list = []
  const now = new Date()

  for (let i = 0; i < 7; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    const isoDate = d.toISOString().slice(0, 10)
    const dayNum = String(d.getDate())
    const dayName = daysOfWeekTh[d.getDay()]
    const monthName = monthsTh[d.getMonth()]
    const thaiYear = d.getFullYear() + 543

    let label = `${dayNum} ${monthName}`
    if (i === 0) label = 'วันนี้'
    else if (i === 1) label = 'พรุ่งนี้'
    else if (i === 2) label = 'วันถัดไป'

    list.push({
      id: isoDate,
      isoDate,
      label,
      dayNum,
      dayName,
      fullText: `${label} · ${dayNum} ${monthName} ${thaiYear}`,
    })
  }
  return list
}

export const dateOptions = generateDateOptions()

export const timeSlots = [
  { time: '10:00', duration: '60-90 นาที', available: true, label: 'ว่างสำหรับ 1 ท่าน' },
  { time: '11:00', duration: '60-90 นาที', available: true, label: 'ว่างสำหรับ 1 ท่าน' },
  { time: '13:00', duration: '60-90 นาที', available: true, label: 'ว่างสำหรับ 1 ท่าน' },
  { time: '14:00', duration: '60-90 นาที', available: true, label: 'ว่างสำหรับ 1 ท่าน' },
  { time: '15:00', duration: '60-90 นาที', available: true, label: 'ว่างสำหรับ 1 ท่าน' },
  { time: '17:00', duration: '60-90 นาที', available: true, label: 'ว่างสำหรับ 1 ท่าน' },
  { time: '18:30', duration: '60-90 นาที', available: true, label: 'ว่างสำหรับ 1 ท่าน' },
  { time: '20:00', duration: '60-90 นาที', available: true, label: 'ว่างสำหรับ 1 ท่าน' },
]

export const bookingService = {
  getTherapists: async () => {
    try {
      const res = await api.get('/therapists')
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map((t) => {
          const extra = THERAPIST_ASSETS[t.id] || {}
          return {
            id: t.id,
            backendId: t.id,
            name: `คุณ${t.nickname}`,
            shortName: `คุณ${t.nickname}`,
            role: (t.skills && t.skills.length > 0)
              ? `เชี่ยวชาญ ${t.skills.join(', ')}`
              : 'ผู้เชี่ยวชาญการนวดและสรีระบำบัด',
            exp: extra.exp || 'Specialist • 5+ ปี',
            avatarExp: extra.exp || 'รับรองมาตรฐานวิชาชีพ',
            badges: t.skills || ['สรีระบำบัด', 'ผ่อนคลายลึก'],
            bio: t.bio || 'มุ่งเน้นการดูแลสุขภาพและฟื้นฟูสมดุลของร่างกายด้วยความประณีต',
            handWeight: extra.handWeight || 'ปานกลาง - ละเมียดละไม',
            image: extra.image || '/images/booking/therapist-mali.jpg',
            avatar: extra.avatar || '/images/booking/therapist-mali-avatar.jpg',
          }
        })
        mapped.push(therapistsData.find((t) => t.id === 'any'))
        return mapped
      }
    } catch {
      // Graceful fallback to static therapistsData
    }
    return therapistsData
  },

  getServices: async () => {
    try {
      const res = await api.get('/services')
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((s) => {
          const img = SERVICE_IMAGES[s.serviceCode] || '/images/services/service-thai.jpg'
          const durationOptions = (s.durationOptions || []).map((d) => ({
            id: d.id,
            minutes: d.durationMinutes,
            price: Number(d.price),
          }))
          return {
            id: s.id,
            serviceCode: s.serviceCode,
            name: s.serviceName,
            desc: s.description,
            image: img,
            isPopular: s.serviceCode === 'THAI',
            durationOptions,
          }
        })
      }
    } catch {
      // Graceful fallback
    }
    return servicesData
  },

  getDateOptions: () => generateDateOptions(),

  getAvailability: async (dateStr, serviceId, durationMinutes) => {
    try {
      const url = `/bookings/availability?date=${dateStr}&serviceId=${serviceId}&durationMinutes=${durationMinutes}`
      const res = await api.get(url)
      if (res && res.success && res.data && Array.isArray(res.data.availableSlots)) {
        return res.data.availableSlots.map((slot) => ({
          time: slot.time,
          startTime: slot.startTime,
          endTime: slot.endTime,
          available: slot.available,
          label: slot.available ? 'ว่างสำหรับนัดหมาย' : 'เต็มแล้ว',
          availableTherapists: slot.availableTherapists || [],
          availableRooms: slot.availableRooms || [],
        }))
      }
    } catch {
      // Graceful fallback
    }
    return null
  },

  getTimeSlots: () => timeSlots,

  createBooking: async (payload) => {
    return await api.post('/bookings', payload)
  },

  processPayment: async (bookingId, paymentPayload) => {
    return await api.post(`/bookings/${bookingId}/payment`, paymentPayload)
  },

  createBookingReference: () =>
    `BK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
}
