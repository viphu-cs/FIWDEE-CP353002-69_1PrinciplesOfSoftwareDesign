/**
 * Booking Service Abstraction (DIP: Data Access & Business Logic abstraction)
 * High-level components depend on this service instead of raw hardcoded datasets.
 */

export const therapistsData = [
  {
    id: 'mali',
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
    id: 'bua',
    name: 'คุณบัว (Bua)',
    shortName: 'คุณบัว',
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
    id: 'praew',
    name: 'คุณแพรว (Praew)',
    shortName: 'คุณแพรว',
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
    id: 'karn',
    name: 'คุณกานต์ (Karn)',
    shortName: 'คุณกานต์',
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
    id: 'thai',
    name: 'นวดไทยราชสำนัก',
    desc: 'กดจุดเส้นประธานสิบ คลายกล้ามเนื้อและสมดุลลมปราณ',
    isPopular: true,
    image: '/images/services/service-thai.jpg',
    durationOptions: [
      { minutes: 60, price: 600 },
      { minutes: 90, price: 850 },
      { minutes: 120, price: 1100 },
    ],
  },
  {
    id: 'aroma',
    name: 'นวดอโรมาเธอราปี',
    desc: 'น้ำมันสกัดออร์แกนิกและศาสตร์กลิ่นบำบัดผ่อนคลายลึก',
    image: '/images/services/service-aroma.jpg',
    durationOptions: [
      { minutes: 60, price: 800 },
      { minutes: 90, price: 1100 },
      { minutes: 120, price: 1400 },
    ],
  },
  {
    id: 'warm_oil',
    name: 'นวดน้ำมันอุ่นสมุนไพร',
    desc: 'น้ำมันงาดำและไพลสดอุ่น กระตุ้นการไหลเวียนโลหิต',
    image: '/images/services/service-warm-oil.jpg',
    durationOptions: [
      { minutes: 60, price: 750 },
      { minutes: 90, price: 1000 },
    ],
  },
  {
    id: 'foot',
    name: 'นวดกดจุดสะท้อนเท้า',
    desc: 'กระตุ้นศูนย์รวมประสาทฝ่าเท้า คืนความเบาสบายคล่องตัว',
    image: '/images/services/service-foot.jpg',
    durationOptions: [
      { minutes: 60, price: 500 },
      { minutes: 90, price: 700 },
    ],
  },
]

export const dateOptions = [
  { id: '15', label: 'วันนี้', dayNum: '15', dayName: 'อังคาร', fullText: 'วันนี้ · 15 ต.ค. 2567' },
  { id: '16', label: 'พรุ่งนี้', dayNum: '16', dayName: 'พุธ', fullText: '16 ต.ค. 2567' },
  { id: '17', label: 'วันถัดไป', dayNum: '17', dayName: 'พฤหัสบดี', fullText: '17 ต.ค. 2567' },
  { id: '18', label: 'ว่าง 3 รอบ', dayNum: '18', dayName: 'ศุกร์', fullText: '18 ต.ค. 2567' },
  { id: '19', label: 'ว่าง 4 รอบ', dayNum: '19', dayName: 'เสาร์', fullText: '19 ต.ค. 2567' },
]

export const timeSlots = [
  { time: '10:00', duration: '90 นาที', available: false, label: 'เต็มแล้ว' },
  { time: '13:00', timeRange: '13:00 - 14:30 น.', available: true, label: 'ว่างสำหรับ 1 ท่าน' },
  { time: '15:00', timeRange: '15:00 - 16:30 น.', available: true, label: 'ว่างสำหรับ 1 ท่าน' },
  { time: '17:30', timeRange: '17:30 - 19:00 น.', available: true, label: 'ว่างสำหรับ 1 ท่าน' },
  { time: '19:30', timeRange: '19:30 - 21:00 น.', available: true, label: 'ว่างสำหรับ 1 ท่าน' },
  { time: '20:30', duration: '90 นาที', available: false, label: 'เต็มแล้ว' },
]

export const bookingService = {
  getTherapists: () => therapistsData,
  getServices: () => servicesData,
  getDateOptions: () => dateOptions,
  getTimeSlots: () => timeSlots,
  createBookingReference: () => `FWD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-883`,
}
