import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import PromoBanner from '../../components/booking/PromoBanner.jsx'
import { PROMO } from '../../data/promo.js'

// ease เดียวกับ FadeIn ของเว็บ — ใช้ให้ทรานซิชันหน้าจองนุ่มต่อเนื่องกับทั้งเว็บ
const EASE_ENTER = [0.22, 1, 0.36, 1]

const therapistsData = [
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

// durationOptions อิงอัตราราคาตามระยะเวลาชุดเดียวกับหน้าบริการ (ServicesPage) และ mock.js
const servicesData = [
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

const dateOptions = [
  { id: '15', label: 'วันนี้', dayNum: '15', dayName: 'อังคาร', fullText: 'วันนี้ · 15 ต.ค. 2567' },
  { id: '16', label: 'พรุ่งนี้', dayNum: '16', dayName: 'พุธ', fullText: '16 ต.ค. 2567' },
  { id: '17', label: 'วันถัดไป', dayNum: '17', dayName: 'พฤหัสบดี', fullText: '17 ต.ค. 2567' },
  { id: '18', label: 'ว่าง 3 รอบ', dayNum: '18', dayName: 'ศุกร์', fullText: '18 ต.ค. 2567' },
  { id: '19', label: 'ว่าง 4 รอบ', dayNum: '19', dayName: 'เสาร์', fullText: '19 ต.ค. 2567' },
]

const timeSlots = [
  { time: '10:00', duration: '90 นาที', available: false, label: 'เต็มแล้ว' },
  { time: '13:00', timeRange: '13:00 - 14:30 น.', available: true, label: 'ว่างสำหรับ 1 ท่าน' },
  { time: '15:00', timeRange: '15:00 - 16:30 น.', available: true, label: 'ว่างสำหรับ 1 ท่าน' },
  { time: '17:30', timeRange: '17:30 - 19:00 น.', available: true, label: 'ว่างสำหรับ 1 ท่าน' },
  { time: '19:30', timeRange: '19:30 - 21:00 น.', available: true, label: 'ว่างสำหรับ 1 ท่าน' },
  { time: '20:30', duration: '90 นาที', available: false, label: 'เต็มแล้ว' },
]

export default function BookingPage({ onNavigate, initialStep = 1 }) {
  const [step, setStep] = useState(initialStep)
  const [selectedTherapist, setSelectedTherapist] = useState(therapistsData[0])
  const [selectedService, setSelectedService] = useState(servicesData[0])
  const [selectedDuration, setSelectedDuration] = useState(servicesData[0].durationOptions[1]) // 90 นาที
  const [selectedDate, setSelectedDate] = useState(dateOptions[0])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(timeSlots[2]) // 15:00
  const [pressureLevel, setPressureLevel] = useState('ปานกลาง (แนะนำ)')
  const [specialNotes, setSpecialNotes] = useState(
    'ปวดตึงกล้ามเนื้อบริเวณสะบักและคอเป็นพิเศษจากการทำงานหน้าจอคอมพิวเตอร์'
  )
  const [paymentMethod, setPaymentMethod] = useState('promptpay')
  const [promoInput, setPromoInput] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [countdown, setCountdown] = useState(14 * 60 + 45) // 14:45
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [bookingRef] = useState('FWD-20241015-883')

  const carouselRef = useRef(null)

  // ค่าที่ใช้จริงของบริการ = บริการที่เลือก + ระยะเวลา/ราคาที่เลือกจาก durationOptions
  const activeService = {
    ...selectedService,
    duration: `${selectedDuration.minutes} นาที`,
    price: `฿${selectedDuration.price.toLocaleString('en-US')}`,
    rawPrice: selectedDuration.price,
  }

  // ===== โปรโมชั่น (ใส่โค้ดถูกที่ช่องชำระเงิน → ลดราคาในสรุปยอดทุกจุด) =====
  const promoDiscountAmount = promoApplied
    ? Math.round(activeService.rawPrice * PROMO.discountRate)
    : 0
  const finalPrice = activeService.rawPrice - promoDiscountAmount
  const finalPriceLabel = `฿${finalPrice.toLocaleString('en-US')}`
  const discountLabel = `−฿${promoDiscountAmount.toLocaleString('en-US')}`

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    if (code === PROMO.code.toUpperCase()) {
      setPromoApplied(true)
      setPromoError('')
    } else {
      setPromoError('รหัสโปรโมชั่นไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง')
    }
  }

  const handleRemovePromo = () => {
    setPromoApplied(false)
    setPromoInput('')
    setPromoError('')
  }

  const handleSelectService = (svc) => {
    setSelectedService(svc)
    const keepSameMinutes = svc.durationOptions.find((o) => o.minutes === selectedDuration.minutes)
    setSelectedDuration(keepSameMinutes || svc.durationOptions[1] || svc.durationOptions[0])
  }

  const handleSelectDuration = (svc, option) => {
    setSelectedService(svc)
    setSelectedDuration(option)
  }

  // Live Countdown timer for PromptPay
  useEffect(() => {
    if (step !== 3 || paymentMethod !== 'promptpay') return
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [step, paymentMethod])

  const formatCountdown = () => {
    const m = Math.floor(countdown / 60)
    const s = countdown % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const handleNextStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (step === 1) setStep(2)
    else if (step === 2) setStep(3)
  }

  const handlePrevStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
  }

  const handleConfirmBooking = () => {
    setIsConfirmed(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="auth-theme w-full pt-20 bg-surface min-h-[calc(100vh-80px)]">
      <div className="flex flex-col w-full">
        {/* ========================================================
            TOP STEPPER RIBBON (Consistent across all 3 steps)
            ======================================================== */}
        <motion.section
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE_ENTER }}
          className="w-full bg-surface-container-low py-space-md border-b border-surface-container-high/60"
        >
          <div className="max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
            <div className="flex flex-wrap items-center justify-between gap-y-space-xs text-secondary">
              <div className="flex items-center gap-space-sm sm:gap-space-md">
                {/* Step 1 Button */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`flex items-center gap-2 cursor-pointer transition-colors ${
                    step === 1 ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  <span
                    className={`font-label-caps text-label-caps tracking-widest ${
                      step === 1 ? 'text-primary font-bold' : 'text-secondary'
                    }`}
                  >
                    01
                  </span>
                  <span
                    className={`font-label-md text-label-md ${
                      step === 1
                        ? 'text-primary font-medium'
                        : 'text-secondary underline underline-offset-4 decoration-outline-variant'
                    }`}
                  >
                    เลือกหมอนวดและบริการ
                  </span>
                </button>

                <span className="text-outline-variant font-light">—</span>

                {/* Step 2 Button */}
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className={`flex items-center gap-2 cursor-pointer transition-colors ${
                    step === 2
                      ? 'text-primary'
                      : step > 2
                        ? 'text-on-surface-variant hover:text-primary'
                        : 'opacity-60 text-secondary'
                  }`}
                >
                  {step === 2 && <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>}
                  <span
                    className={`font-label-caps text-label-caps tracking-widest ${
                      step === 2 ? 'text-primary font-bold' : 'text-secondary'
                    }`}
                  >
                    02
                  </span>
                  <span
                    className={`font-label-md text-label-md ${
                      step === 2
                        ? 'text-on-surface font-semibold'
                        : step > 2
                          ? 'underline underline-offset-4 decoration-outline-variant'
                          : 'text-secondary'
                    }`}
                  >
                    วันและรอบเวลา
                  </span>
                </button>

                <span className="text-outline-variant font-light hidden sm:inline">—</span>

                {/* Step 3 Button */}
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className={`hidden sm:flex items-center gap-2 cursor-pointer transition-colors ${
                    step === 3 ? 'text-primary font-semibold' : 'opacity-40 text-secondary'
                  }`}
                >
                  {step === 3 && <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>}
                  <span
                    className={`font-label-caps text-label-caps tracking-widest ${
                      step === 3 ? 'text-primary font-bold' : 'text-secondary'
                    }`}
                  >
                    03
                  </span>
                  <span
                    className={`font-label-md text-label-md ${
                      step === 3 ? 'text-primary font-semibold' : 'text-secondary'
                    }`}
                  >
                    ชำระเงินและยืนยัน
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate?.('login')}
                  className="inline-flex items-center gap-1.5 text-secondary hover:text-primary transition-colors cursor-pointer text-xs sm:text-sm font-medium group py-1 px-2.5 rounded hover:bg-surface-container"
                  title="ย้อนกลับไปหน้าเข้าสู่ระบบ"
                >
                  <span className="material-symbols-outlined text-base transition-transform duration-200 group-hover:-translate-x-1">
                    arrow_back
                  </span>
                  <span>ย้อนกลับไปหน้าเข้าสู่ระบบ</span>
                </button>
                <span className="text-outline-variant font-light hidden sm:inline">|</span>
                <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest hidden sm:inline">
                  ขั้นตอนที่ {step} จาก 3
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ========================================================
            SUCCESS CONFIRMATION SCREEN (When booking is confirmed)
            ======================================================== */}
        <motion.div
          key={isConfirmed ? 'confirmed' : `step-${step}`}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_ENTER }}
        >
        {isConfirmed ? (
          <section className="w-full py-space-xl min-h-[60vh] flex items-center justify-center">
            <div className="max-w-2xl mx-auto px-6 text-center space-y-space-md">
              <div className="w-20 h-20 rounded-full bg-secondary-container text-primary mx-auto flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
              <div className="space-y-1">
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-bold">
                  RESERVATION CONFIRMED
                </span>
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-normal">
                  ยืนยันการจองคิวบำบัดสำเร็จ
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mx-auto">
                  ระบบได้บันทึกการนัดหมายและส่ง SMS / LINE ยืนยันรหัสเข้าห้องรับรองส่วนตัวของท่านแล้ว
                </p>
              </div>

              <div className="p-space-lg bg-surface-container-low rounded-lg text-left space-y-space-sm border border-outline-variant/40">
                <div className="flex justify-between items-center pb-space-xs border-b border-outline-variant/30">
                  <span className="font-label-caps text-label-caps uppercase text-secondary">
                    รหัสการนัดหมาย (Booking Ref)
                  </span>
                  <span className="font-mono text-primary font-bold text-base">{bookingRef}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm font-body-sm text-body-sm">
                  <div>
                    <span className="text-secondary block">ผู้บำบัด:</span>
                    <span className="font-medium text-on-surface">{selectedTherapist.name}</span>
                  </div>
                  <div>
                    <span className="text-secondary block">บริการ:</span>
                    <span className="font-medium text-on-surface">
                      {selectedService.name} ({activeService.duration})
                    </span>
                  </div>
                  <div>
                    <span className="text-secondary block">วันและเวลา:</span>
                    <span className="font-medium text-primary">
                      {selectedDate.fullText} · {selectedTimeSlot.timeRange || selectedTimeSlot.time}
                    </span>
                  </div>
                  <div>
                    <span className="text-secondary block">สถานที่:</span>
                    <span className="font-medium text-on-surface">สาขาขอนแก่น (Private Suite)</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-space-sm pt-space-xs">
                <button
                  type="button"
                  onClick={() => onNavigate?.('home')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded bg-primary text-surface font-label-md text-label-md tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                >
                  กลับสู่หน้าแรก
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsConfirmed(false)
                    setStep(1)
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded border border-outline-variant text-on-surface font-label-md text-label-md tracking-wider hover:bg-surface-container transition-colors cursor-pointer"
                >
                  จองเวลาเพิ่มอีกรอบ
                </button>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* ========================================================
                STEP 1: SELECT THERAPIST & TREATMENT (Screen 1)
                ======================================================== */}
            {step === 1 && (
              <>
                <section className="w-full py-space-lg md:py-space-xl">
                  <div className="max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
                    <div className="max-w-2xl space-y-space-xs">
                      <p className="font-label-caps text-label-caps uppercase tracking-widest text-primary">
                        Boutique Appointment
                      </p>
                      <h1 className="font-headline-lg text-headline-lg text-on-surface">จองเวลาพักผ่อน</h1>
                      <p className="font-body-lg text-body-lg text-secondary">
                        เลือกบริการบำบัดที่ท่านต้องการและหมอนวดผู้เชี่ยวชาญเพื่อดูแลสุขภาพกายและใจในบรรยากาศสงบเป็นส่วนตัว
                      </p>
                    </div>
                  </div>
                </section>

                <section className="w-full pb-space-xl">
                  <div className="max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg lg:gap-gutter-desktop items-start">
                      {/* Left: 8 Cols */}
                      <div className="lg:col-span-8 flex flex-col gap-space-xl">
                        {/* Section 1.1: Therapist Carousel */}
                        <div className="space-y-space-md">
                          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-semibold">
                                  ขั้นตอน 1.1 • Master Therapists Roster
                                </span>
                                <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                                <span className="font-body-sm text-body-sm text-secondary">
                                  เลือกผู้บำบัดประจำตัว
                                </span>
                              </div>
                              <h2 className="font-headline-md text-headline-md text-on-surface">
                                เลือกหมอนวดผู้เชี่ยวชาญ
                              </h2>
                              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                                สัมผัสศาสตร์หัตถการเฉพาะตัว ผ่านผู้เชี่ยวชาญที่ผ่านการรับรองมาตรฐานสากล
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                className="w-9 h-9 rounded-full border border-outline-variant/50 bg-surface flex items-center justify-center text-on-surface hover:bg-secondary-container transition-colors shadow-sm cursor-pointer"
                                onClick={() => carouselRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
                                title="ก่อนหน้า"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                              </button>
                              <button
                                className="w-9 h-9 rounded-full border border-outline-variant/50 bg-surface flex items-center justify-center text-on-surface hover:bg-secondary-container transition-colors shadow-sm cursor-pointer"
                                onClick={() => carouselRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
                                title="ถัดไป"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                              </button>
                            </div>
                          </div>

                          {/* Carousel Cards */}
                          <div
                            ref={carouselRef}
                            className="flex gap-space-md overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
                          >
                            {therapistsData.map((therapist) => {
                              const isSelected = selectedTherapist.id === therapist.id
                              return (
                                <div
                                  key={therapist.id}
                                  onClick={() => setSelectedTherapist(therapist)}
                                  className={`snap-start flex-shrink-0 w-[290px] sm:w-[310px] rounded-lg overflow-hidden bg-surface-container-low transition-all duration-300 cursor-pointer flex flex-col justify-between group relative ${
                                    isSelected
                                      ? 'border-2 border-primary shadow-sm ring-1 ring-primary/20'
                                      : 'border border-outline-variant/40 shadow-sm hover:border-primary/50 hover:shadow-md'
                                  }`}
                                >
                                  {/* Selection Badge */}
                                  {isSelected && (
                                    <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-surface font-label-caps text-label-caps tracking-wider font-semibold shadow-sm">
                                      <span className="material-symbols-outlined text-[14px]">check</span>
                                      <span>เลือกแล้ว</span>
                                    </div>
                                  )}

                                  {/* Media / Concierge representation */}
                                  {therapist.isConcierge ? (
                                    <div className="relative h-[280px] w-full bg-secondary-fixed flex flex-col items-center justify-center p-6 text-center group-hover:bg-secondary-container transition-colors duration-300">
                                      <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center shadow-sm text-primary mb-3">
                                        <span className="font-headline-md text-headline-md font-normal">F</span>
                                      </div>
                                      <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                                        Retreat Concierge Choice
                                      </span>
                                      <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">
                                        {therapist.shortName}
                                      </h3>
                                      <p className="font-body-sm text-body-sm text-secondary mt-1 max-w-[200px]">
                                        {therapist.exp}
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="relative h-[280px] w-full overflow-hidden bg-surface-container">
                                      <img
                                        alt={therapist.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        src={therapist.image}
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/20 to-transparent"></div>
                                      <div className="absolute bottom-3 left-4 right-4 text-surface">
                                        <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary-fixed">
                                          {therapist.exp}
                                        </span>
                                        <h3 className="font-headline-sm text-headline-sm text-surface font-medium mt-0.5">
                                          {therapist.name}
                                        </h3>
                                      </div>
                                    </div>
                                  )}

                                  {/* Bio & Attributes */}
                                  <div className="p-4 flex flex-col justify-between flex-1 space-y-3 bg-surface-container-low">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        {therapist.badges.map((b, i) => (
                                          <span
                                            key={i}
                                            className={`font-label-caps text-label-caps px-2 py-0.5 rounded ${
                                              i === 0
                                                ? 'bg-secondary-container text-on-secondary-container font-semibold'
                                                : 'bg-surface text-secondary border border-outline-variant/30'
                                            }`}
                                          >
                                            {b}
                                          </span>
                                        ))}
                                      </div>
                                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                                        {therapist.bio}
                                      </p>
                                    </div>

                                    <div className="pt-2 border-t border-outline-variant/30 space-y-1.5">
                                      <div className="flex items-center justify-between text-secondary">
                                        <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">
                                          {therapist.isConcierge ? 'การจัดสรร' : 'น้ำหนักมือ'}
                                        </span>
                                        <span className="font-label-md text-label-md text-primary font-medium">
                                          {therapist.handWeight}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between text-secondary">
                                        <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">
                                          {therapist.isConcierge ? 'ความพร้อม' : 'สถานะ'}
                                        </span>
                                        <span className="font-body-sm text-body-sm text-tertiary flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary inline-block"></span>
                                          {therapist.isConcierge ? 'คิวว่างดีที่สุด' : 'พร้อมให้บริการ'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Section 1.2: Treatment Selection */}
                        <div className="space-y-space-sm pt-2">
                          <div className="flex items-baseline justify-between">
                            <div>
                              <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary font-semibold">
                                ขั้นตอน 1.2 • Select Treatment
                              </span>
                              <h2 className="font-headline-sm text-headline-sm text-on-surface mt-0.5">
                                เลือกรายการบำบัด
                              </h2>
                            </div>
                            <span className="font-body-sm text-body-sm text-secondary">
                              4 รายการพร้อมบริการ
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {servicesData.map((svc) => {
                              const isSelected = selectedService.id === svc.id
                              return (
                                <div
                                  key={svc.id}
                                  className={`rounded-xl p-5 transition-all duration-200 flex flex-col justify-between gap-4 ${
                                    isSelected
                                      ? 'bg-secondary-container border border-primary/40'
                                      : 'bg-surface-container-low border border-transparent hover:bg-surface-container hover:border-outline-variant/40'
                                  }`}
                                >
                                  {/* Service header & image (คลิกเลือกบริการ) */}
                                  <button
                                    type="button"
                                    onClick={() => handleSelectService(svc)}
                                    className="text-left cursor-pointer space-y-3 w-full group"
                                  >
                                    <div className="w-full h-36 sm:h-44 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                                      <img
                                        src={svc.image}
                                        alt={svc.name}
                                        loading="lazy"
                                        onError={(e) => {
                                          e.currentTarget.onerror = null
                                          e.currentTarget.src = '/images/services/room-architecture.jpg'
                                        }}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                      />
                                    </div>
                                    <div className="flex items-start gap-3">
                                      <div
                                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                          isSelected ? 'border-primary bg-primary' : 'border-outline bg-transparent'
                                        }`}
                                      >
                                        <span
                                          className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-surface' : 'bg-transparent'}`}
                                        ></span>
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-label-lg text-label-lg text-on-surface font-semibold">
                                            {svc.name}
                                          </h4>
                                          {svc.isPopular && (
                                            <span className="font-label-caps text-label-caps px-1.5 py-0.5 rounded bg-primary text-surface text-[10px] font-medium flex-shrink-0">
                                              ยอดนิยม
                                            </span>
                                          )}
                                        </div>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                                          {svc.desc}
                                        </p>
                                      </div>
                                    </div>
                                  </button>

                                  {/* อัตราราคาตามระยะเวลา (สไตล์เดียวกับหน้าบริการ) */}
                                  <div className="bg-surface rounded-lg p-4 space-y-1.5">
                                    <p className="font-label-caps text-label-caps text-secondary uppercase tracking-widest pb-1">
                                      อัตราราคาตามระยะเวลา
                                    </p>
                                    {svc.durationOptions.map((opt) => {
                                      const isDurationActive =
                                        isSelected && selectedDuration.minutes === opt.minutes
                                      return (
                                        <button
                                          key={opt.minutes}
                                          type="button"
                                          onClick={() => handleSelectDuration(svc, opt)}
                                          className={`w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded transition-all duration-200 cursor-pointer text-left ${
                                            isDurationActive
                                              ? 'bg-secondary-container ring-1 ring-primary/50'
                                              : 'hover:bg-surface-container'
                                          }`}
                                        >
                                          <span className="flex items-center gap-2.5 min-w-0">
                                            <span
                                              className={`w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                                isDurationActive
                                                  ? 'border-primary bg-primary'
                                                  : 'border-outline bg-transparent'
                                              }`}
                                            >
                                              <span
                                                className={`w-1 h-1 rounded-full ${
                                                  isDurationActive ? 'bg-surface' : 'bg-transparent'
                                                }`}
                                              ></span>
                                            </span>
                                            <span
                                              className={`font-body-md text-body-md ${
                                                isDurationActive ? 'text-primary font-semibold' : 'text-on-surface'
                                              }`}
                                            >
                                              {opt.minutes} นาที
                                            </span>
                                          </span>
                                          <span
                                            className={`font-headline-sm text-headline-sm font-normal ${
                                              isDurationActive ? 'text-primary' : 'text-on-surface'
                                            }`}
                                          >
                                            ฿{opt.price.toLocaleString('en-US')}
                                          </span>
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Bottom Disclaimer */}
                        <div className="pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md border-t border-outline-variant/30">
                          <div className="text-secondary font-body-sm text-body-sm text-center sm:text-left">
                            ท่านสามารถปรับเปลี่ยนหรือยกเลิกการจองได้ล่วงหน้า 4 ชั่วโมงโดยไม่มีค่าธรรมเนียม
                          </div>
                        </div>
                      </div>

                      {/* Right Sidebar: 4 Cols */}
                      <aside className="lg:col-span-4 w-full sticky top-28 space-y-space-md">
                        <div className="w-full rounded overflow-hidden shadow-sm bg-surface-container-low">
                          <div className="relative aspect-[16/10] w-full overflow-hidden">
                            <img
                              alt="Private Suite Treatment Sanctuary"
                              className="w-full h-full object-cover"
                              src="/images/booking/suite-room.jpg"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 via-transparent to-transparent"></div>
                            <div className="absolute bottom-space-sm left-space-md right-space-md text-inverse-on-surface">
                              <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary-fixed">
                                บรรยากาศห้องพักผ่อน
                              </span>
                              <p className="font-headline-sm text-headline-sm">Private Suite ห้องเดี่ยวส่วนตัว</p>
                            </div>
                          </div>

                          <div className="p-space-lg space-y-space-md">
                            <div className="space-y-1">
                              <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">
                                สรุปรายการ
                              </span>
                              <h3 className="font-headline-md text-headline-md text-on-surface">การจองของคุณ</h3>
                            </div>

                            <div className="space-y-space-sm py-space-sm">
                              <div className="flex flex-col space-y-0.5">
                                <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">
                                  ผู้บำบัด
                                </span>
                                <div className="flex items-baseline justify-between">
                                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                                    {selectedTherapist.shortName}
                                  </span>
                                  <span className="font-body-sm text-body-sm text-secondary truncate max-w-[180px]">
                                    {selectedTherapist.role}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col space-y-0.5 pt-2">
                                <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">
                                  บริการที่เลือก
                                </span>
                                <div className="flex items-baseline justify-between">
                                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                                    {selectedService.name}
                                  </span>
                                  <span className="font-body-sm text-body-sm text-secondary">
                                    {activeService.duration}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col space-y-0.5 pt-2">
                                <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">
                                  พื้นที่บริการ
                                </span>
                                <div className="flex items-baseline justify-between">
                                  <span className="font-label-md text-label-md text-on-surface">
                                    ห้องเดี่ยว Private Suite
                                  </span>
                                  <span className="font-body-sm text-body-sm text-primary font-medium">
                                    รวมในแพ็กเกจ
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="p-space-sm rounded bg-surface-container space-y-2">
                              <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">
                                สิทธิประโยชน์พิเศษ
                              </span>
                              <ul className="font-body-sm text-body-sm text-on-surface-variant space-y-1">
                                <li className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                                  <span>ชาเกสรบัวต้อนรับและของว่างสุขภาพ</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                                  <span>ห้องอาบน้ำและห้องแต่งตัวส่วนบุคคล</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                                  <span>สมุนไพรประคบสดสูตรเฉพาะของร้าน</span>
                                </li>
                              </ul>
                            </div>

                            <div className="pt-space-sm space-y-2">
                              <div className="flex items-baseline justify-between">
                                <span className="font-body-md text-body-md text-secondary">
                                  ยอดชำระเบื้องต้น
                                </span>
                                <span className="font-headline-md text-headline-md text-primary font-medium">
                                  {activeService.price}
                                </span>
                              </div>
                              <p className="font-body-sm text-body-sm text-secondary">
                                ราคารวมภาษีมูลค่าเพิ่มและค่าบริการแล้ว
                              </p>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="group w-full inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded bg-primary text-on-primary font-label-md text-label-md tracking-wider shadow-sm hover:opacity-95 hover:shadow-md transition-all duration-200 cursor-pointer"
                        >
                          <span className="font-medium">ถัดไป: เลือกวันและเวลา</span>
                          <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:scale-105">
                            arrow_forward
                          </span>
                        </button>
                      </aside>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* ========================================================
                STEP 2: SELECT DATE & TIME SLOT (Screen 2)
                ======================================================== */}
            {step === 2 && (
              <>
                <section className="w-full bg-surface">
                  <div className="max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop pt-6 md:pt-8 pb-space-md">
                    {/* Top Back Navigation */}
                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors duration-200 font-label-md text-label-md uppercase cursor-pointer py-1 group"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="transition-transform duration-200 group-hover:-translate-x-1"
                        >
                          <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        <span>ย้อนกลับไปขั้นตอนที่ 1</span>
                      </button>
                    </div>

                    <div className="max-w-2xl">
                      <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest block mb-space-xs">
                        นัดหมายการผ่อนคลาย
                      </span>
                      <h1 className="font-headline-lg text-headline-lg text-on-surface font-normal tracking-tight">
                        เลือกวันและช่วงเวลา
                      </h1>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
                        ระบุวัน เวลา และข้อมูลเพื่อจัดเตรียมห้องทรีตเมนต์ส่วนตัวสำหรับท่าน เพื่อความสุนทรีย์ที่สมบูรณ์แบบ
                      </p>
                    </div>
                  </div>
                </section>

                <section className="w-full bg-surface pb-space-xl">
                  <div className="max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg lg:gap-gutter-desktop items-start">
                      {/* Left Panel: 7 Cols */}
                      <div className="lg:col-span-7 space-y-space-xl">
                        {/* Section 1: Date Selection */}
                        <div className="space-y-space-sm">
                          <div className="flex items-baseline justify-between">
                            <h2 className="font-headline-sm text-headline-sm text-on-surface font-normal">
                              1. วันที่รับบริการ
                            </h2>
                            <span className="font-label-caps text-label-caps uppercase text-secondary">
                              ตุลาคม 2567
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-space-xs pt-space-xs">
                            {dateOptions.map((dateTab) => {
                              const isActive = selectedDate.id === dateTab.id
                              return (
                                <button
                                  key={dateTab.id}
                                  type="button"
                                  onClick={() => setSelectedDate(dateTab)}
                                  className={`p-space-sm text-left rounded-lg transition-all cursor-pointer ${
                                    isActive
                                      ? 'bg-on-surface text-surface'
                                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                                  }`}
                                >
                                  <span
                                    className={`font-label-caps text-label-caps uppercase block ${
                                      isActive ? 'text-surface opacity-75' : 'text-secondary'
                                    }`}
                                  >
                                    {dateTab.label}
                                  </span>
                                  <span
                                    className={`font-headline-sm text-headline-sm block mt-space-xs ${
                                      isActive ? 'text-surface' : 'text-on-surface'
                                    }`}
                                  >
                                    {dateTab.dayNum}
                                  </span>
                                  <span
                                    className={`font-body-sm text-body-sm block ${
                                      isActive ? 'text-surface opacity-90' : 'text-secondary'
                                    }`}
                                  >
                                    {dateTab.dayName}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Section 2: Time Slots Grid */}
                        <div className="space-y-space-sm">
                          <div className="flex items-baseline justify-between">
                            <h2 className="font-headline-sm text-headline-sm text-on-surface font-normal">
                              2. รอบเวลาที่เปิดรับจอง
                            </h2>
                            <span className="font-body-sm text-body-sm text-secondary">
                              ระยะเวลาทรีตเมนต์ {activeService.duration}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm pt-space-xs">
                            {timeSlots.map((slot, idx) => {
                              if (!slot.available) {
                                return (
                                  <div
                                    key={idx}
                                    className="p-space-md bg-surface-container-high rounded-lg opacity-50 cursor-not-allowed select-none"
                                  >
                                    <div className="font-headline-sm text-headline-sm text-secondary">
                                      {slot.time}
                                    </div>
                                    <div className="font-label-caps text-label-caps uppercase text-secondary mt-1">
                                      เต็มแล้ว
                                    </div>
                                  </div>
                                )
                              }
                              const isSlotActive = selectedTimeSlot.time === slot.time
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setSelectedTimeSlot(slot)}
                                  className={`p-space-md text-left rounded-lg transition-all cursor-pointer ${
                                    isSlotActive
                                      ? 'bg-on-surface text-surface shadow-sm'
                                      : 'bg-surface-container-low hover:bg-surface-container group'
                                  }`}
                                >
                                  <div
                                    className={`font-headline-sm text-headline-sm ${
                                      isSlotActive
                                        ? 'text-surface'
                                        : 'text-on-surface group-hover:text-primary transition-colors'
                                    }`}
                                  >
                                    {slot.time}
                                  </div>
                                  <div
                                    className={`font-label-caps text-label-caps uppercase mt-1 ${
                                      isSlotActive ? 'text-primary-fixed' : 'text-tertiary'
                                    }`}
                                  >
                                    {isSlotActive ? 'เลือกแล้ว' : 'ว่างสำหรับ 1 ท่าน'}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Section 3: Customization */}
                        <div className="space-y-space-md pt-space-sm border-t border-surface-container">
                          <div className="flex items-baseline justify-between">
                            <div>
                              <h2 className="font-headline-sm text-headline-sm text-on-surface font-normal">
                                3. ความต้องการเฉพาะบุคคล
                              </h2>
                              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                                ปรับแต่งสัมผัสและแจ้งบริเวณที่ต้องการดูแลพิเศษ เพื่อการบำบัดที่ตรงจุดและผ่อนคลายลึกซึ้ง
                              </p>
                            </div>
                            <span className="font-label-caps text-label-caps uppercase text-secondary tracking-wider hidden sm:inline-block">
                              Personal Touch
                            </span>
                          </div>

                          <div className="space-y-space-md bg-surface-container-low/40 p-space-md rounded-lg">
                            <div className="space-y-space-xs">
                              <label className="font-label-caps text-label-caps uppercase text-secondary block">
                                ระดับน้ำหนักการนวดที่ต้องการ
                              </label>
                              <div className="grid grid-cols-3 gap-space-xs">
                                {['เบา นุ่มนวล', 'ปานกลาง (แนะนำ)', 'หนัก คลายเส้น'].map((lvl) => {
                                  const isSelectedLvl = pressureLevel === lvl
                                  return (
                                    <button
                                      key={lvl}
                                      type="button"
                                      onClick={() => setPressureLevel(lvl)}
                                      className={`py-3 px-2 text-center rounded font-label-md text-label-md transition-colors cursor-pointer ${
                                        isSelectedLvl
                                          ? 'bg-on-surface text-surface'
                                          : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                                      }`}
                                    >
                                      {lvl === 'ปานกลาง (แนะนำ)' ? (
                                        <span>
                                          ปานกลาง{' '}
                                          <span className="text-[0.7rem] block opacity-80">(แนะนำ)</span>
                                        </span>
                                      ) : (
                                        lvl
                                      )}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>

                            <div className="space-y-space-xs">
                              <label
                                className="font-label-caps text-label-caps uppercase text-secondary block"
                                htmlFor="special-notes"
                              >
                                อาการตึงเมื่อยหรือบริเวณที่ต้องการเน้นพิเศษ (ถ้ามี)
                              </label>
                              <textarea
                                className="w-full bg-surface text-on-surface font-body-md text-body-md p-4 rounded focus:outline-none focus:bg-surface-container-highest transition-colors resize-none border border-outline-variant/30"
                                id="special-notes"
                                rows={3}
                                value={specialNotes}
                                onChange={(e) => setSpecialNotes(e.target.value)}
                                placeholder="เช่น เน้นบ่า สะบัก หรือหลีกเลี่ยงบริเวณใดเป็นพิเศษ..."
                              />
                            </div>
                          </div>
                        </div>

                        {/* Back Action */}
                        <div className="pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
                          <button
                            type="button"
                            onClick={handlePrevStep}
                            className="font-label-md text-label-md text-secondary hover:text-primary transition-colors underline underline-offset-4 decoration-outline-variant flex items-center gap-space-xs cursor-pointer"
                          >
                            ← ย้อนกลับไปเลือกบริการ
                          </button>
                        </div>
                      </div>

                      {/* Right Panel: 5 Cols */}
                      <div className="lg:col-span-5 sticky top-24 space-y-space-md">
                        <div className="bg-surface-container-low rounded-lg p-space-lg space-y-space-md shadow-sm">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest block">
                                สรุปการนัดหมาย
                              </span>
                              <h3 className="font-headline-sm text-headline-sm text-on-surface font-normal mt-0.5">
                                สาขาขอนแก่น
                              </h3>
                            </div>
                            <span className="px-2.5 py-1 bg-surface-container text-on-surface-variant font-label-caps text-label-caps rounded uppercase">
                              ห้องส่วนตัว
                            </span>
                          </div>

                          <div className="p-space-sm bg-surface rounded space-y-space-xs">
                            <div className="flex justify-between items-baseline">
                              <span className="font-headline-sm text-headline-sm text-primary font-normal">
                                {selectedService.name}
                              </span>
                              <span className="font-label-caps text-label-caps text-secondary">
                                {activeService.duration}
                              </span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              {selectedService.desc}
                            </p>
                          </div>

                          {/* Therapist Context */}
                          <div className="space-y-space-sm pt-space-xs">
                            <div className="flex items-center gap-space-md">
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-highest shrink-0">
                                {selectedTherapist.isConcierge ? (
                                  <div className="w-full h-full bg-secondary-container flex items-center justify-center text-primary font-bold">
                                    F
                                  </div>
                                ) : (
                                  <img
                                    className="w-full h-full object-cover"
                                    src={selectedTherapist.avatar || selectedTherapist.image}
                                    alt={selectedTherapist.name}
                                  />
                                )}
                              </div>
                              <div>
                                <span className="font-label-caps text-label-caps uppercase text-secondary block">
                                  ผู้บำบัดที่ท่านเลือก
                                </span>
                                <span className="font-headline-sm text-headline-sm text-on-surface font-normal">
                                  {selectedTherapist.shortName}
                                </span>
                                <span className="font-body-sm text-body-sm text-tertiary block">
                                  {selectedTherapist.avatarExp}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Appointment Data Points */}
                          <div className="space-y-space-xs py-space-xs bg-surface-container-lowest/60 p-space-sm rounded">
                            <div className="flex justify-between py-1">
                              <span className="font-body-sm text-body-sm text-secondary">วันที่นัดหมาย:</span>
                              <span className="font-label-md text-label-md text-on-surface font-medium">
                                {selectedDate.fullText}
                              </span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="font-body-sm text-body-sm text-secondary">ช่วงเวลา:</span>
                              <span className="font-label-md text-label-md text-primary font-medium">
                                {selectedTimeSlot.timeRange || selectedTimeSlot.time}
                              </span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="font-body-sm text-body-sm text-secondary">ห้องทรีตเมนต์:</span>
                              <span className="font-label-md text-label-md text-on-surface font-medium">
                                Private Suite (ชั้น 2)
                              </span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="font-body-sm text-body-sm text-secondary">น้ำหนักนวด:</span>
                              <span className="font-label-md text-label-md text-on-surface font-medium">
                                {pressureLevel}
                              </span>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="pt-space-sm space-y-space-xs">
                            <div className="flex justify-between items-baseline">
                              <span className="font-label-caps text-label-caps uppercase text-secondary">
                                ยอดรวมสุทธิ
                              </span>
                              <div className="text-right">
                                <span className="font-display-mobile text-display-mobile text-on-surface font-normal">
                                  {activeService.price}
                                </span>
                                <span className="font-body-sm text-body-sm text-secondary block">
                                  ราคารวมภาษีมูลค่าเพิ่มและอุปกรณ์แล้ว
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="p-space-sm bg-surface-container rounded text-on-surface-variant font-body-sm text-body-sm leading-relaxed">
                            <span className="font-label-caps text-label-caps uppercase text-on-surface block mb-1">
                              นโยบายความยืดหยุ่น
                            </span>
                            ท่านสามารถเปลี่ยนแปลงรอบเวลาหรือยกเลิกการจองได้ล่วงหน้าอย่างน้อย 4 ชั่วโมง โดยไม่มีค่าธรรมเนียมใดๆ
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="w-full py-3.5 px-8 bg-primary text-surface font-label-md text-label-md tracking-wider rounded hover:opacity-90 active:scale-[0.99] transition-all text-center shadow-sm cursor-pointer"
                        >
                          ถัดไป: ชำระเงินและยืนยัน
                        </button>

                        <div className="relative rounded-lg overflow-hidden bg-surface-container-high h-44 shadow-sm">
                          <img
                            className="w-full h-full object-cover"
                            alt="Minimalist luxury Thai spa treatment room"
                            src="/images/booking/suite-room-03.jpg"
                          />
                          <div className="absolute inset-0 bg-on-background/20 mix-blend-multiply"></div>
                          <div className="absolute bottom-3 left-4 text-surface font-label-caps text-label-caps uppercase tracking-wider drop-shadow-sm">
                            Private Suite 03 · สงบ ปลอดโปร่ง เป็นส่วนตัว
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* ========================================================
                STEP 3: PAYMENT & CONFIRMATION (Screen 3)
                ======================================================== */}
            {step === 3 && (
              <>
                <div className="max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-6 md:py-8 relative">
                  {/* จุดวางกล่องโปรโมชั่น — จอเล็กวางใน flow ของคอนเทนเนอร์
                      จอใหญ่ (lg+) ลอยทับมุมขวาในกรอบเนื้อหา (PromoBanner render ในนี้) */}
                  <div
                    id="promo-anchor"
                    className="relative z-40 ml-auto w-full max-w-[340px] mb-4 lg:absolute lg:top-5 lg:right-10 lg:mb-0"
                  >
                    <PromoBanner />
                  </div>
                  {/* Top Back Navigation */}
                  <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors duration-200 font-label-md text-label-md uppercase cursor-pointer py-1 group"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover:-translate-x-1"
                      >
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                      </svg>
                      <span>ย้อนกลับไปขั้นตอนที่ 2</span>
                    </button>
                  </div>

                  <div className="max-w-3xl mb-space-lg md:mb-space-xl">
                    <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary block mb-space-xs">
                      ขั้นตอนสุดท้ายเพื่อการพักผ่อน
                    </span>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface font-normal tracking-tight">
                      ชำระเงินและยืนยันการนัดหมาย
                    </h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
                      ตรวจสอบข้อมูลการนัดหมายและเลือกช่องทางการชำระเงินเพื่อล็อกคิวเวลาของท่าน
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-gutter-desktop items-start">
                    {/* Left: 7 cols */}
                    <section className="lg:col-span-7 flex flex-col gap-space-lg">
                      {/* Payment Methods Box */}
                      <div className="bg-surface-container-low p-space-md md:p-space-lg rounded">
                        <div className="flex items-center justify-between mb-space-md">
                          <h2 className="font-headline-sm text-headline-sm text-on-surface font-normal">
                            เลือกวิธีการชำระเงิน
                          </h2>
                          <span className="font-label-caps text-label-caps text-secondary uppercase">
                            Secure Transaction
                          </span>
                        </div>

                        <div className="space-y-space-sm">
                          {/* Option 1: PromptPay */}
                          <div
                            className={`p-space-md rounded transition-all duration-200 ${
                              paymentMethod === 'promptpay'
                                ? 'bg-surface-container-lowest shadow-sm'
                                : 'bg-surface-container'
                            }`}
                          >
                            <label className="flex items-start gap-space-sm cursor-pointer select-none">
                              <input
                                checked={paymentMethod === 'promptpay'}
                                onChange={() => setPaymentMethod('promptpay')}
                                className="mt-1 accent-primary w-4 h-4 cursor-pointer"
                                name="payment_method"
                                type="radio"
                              />
                              <div className="flex-1">
                                <div className="flex items-baseline justify-between">
                                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                                    พร้อมเพย์ QR Code
                                  </span>
                                  <span className="font-label-caps text-label-caps text-primary bg-secondary-container px-2 py-0.5 rounded">
                                    แนะนำ
                                  </span>
                                </div>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                                  สแกนจ่ายทันที ปลอดภัย ตรวจสอบและยืนยันนัดหมายอัตโนมัติ
                                </p>
                              </div>
                            </label>

                            {paymentMethod === 'promptpay' && (
                              <div className="mt-space-md pt-space-md bg-surface-container-low/60 rounded p-space-md flex flex-col sm:flex-row items-center gap-space-md">
                                {/* Minimalist PromptPay QR Code */}
                                <div className="w-44 h-44 bg-surface-container-lowest p-3 rounded flex flex-col items-center justify-between shrink-0 shadow-sm border border-outline-variant/30">
                                  <div className="w-full flex items-center justify-between pb-1">
                                    <span className="font-label-caps text-label-caps text-on-surface font-bold tracking-tight">
                                      PromptPay
                                    </span>
                                    <span className="material-symbols-outlined text-primary text-sm">
                                      qr_code_scanner
                                    </span>
                                  </div>
                                  <svg className="w-32 h-32 text-on-surface" fill="currentColor" viewBox="0 0 100 100">
                                    <rect fill="none" height="26" stroke="currentColor" strokeWidth="4" width="26" x="5" y="5" />
                                    <rect height="14" width="14" x="11" y="11" />
                                    <rect fill="none" height="26" stroke="currentColor" strokeWidth="4" width="26" x="69" y="5" />
                                    <rect height="14" width="14" x="75" y="11" />
                                    <rect fill="none" height="26" stroke="currentColor" strokeWidth="4" width="26" x="5" y="69" />
                                    <rect height="14" width="14" x="11" y="75" />
                                    <rect height="6" width="6" x="36" y="8" />
                                    <rect height="6" width="8" x="46" y="8" />
                                    <rect height="6" width="6" x="58" y="12" />
                                    <rect height="6" width="8" x="36" y="20" />
                                    <rect height="8" width="6" x="48" y="20" />
                                    <rect height="8" width="8" x="8" y="38" />
                                    <rect height="6" width="6" x="22" y="42" />
                                    <rect height="6" width="6" x="36" y="36" />
                                    <rect height="8" width="8" x="46" y="36" />
                                    <rect height="6" width="6" x="60" y="38" />
                                    <rect height="6" width="6" x="74" y="36" />
                                    <rect height="8" width="8" x="86" y="42" />
                                    <rect height="6" width="8" x="38" y="48" />
                                    <rect height="8" width="6" x="50" y="50" />
                                    <rect height="6" width="6" x="62" y="48" />
                                    <rect height="6" width="8" x="76" y="54" />
                                    <rect height="6" width="6" x="36" y="62" />
                                    <rect height="6" width="6" x="48" y="64" />
                                    <rect height="6" width="8" x="58" y="62" />
                                    <rect height="8" width="6" x="72" y="68" />
                                    <rect height="8" width="8" x="84" y="62" />
                                    <rect height="6" width="8" x="36" y="76" />
                                    <rect height="6" width="6" x="50" y="78" />
                                    <rect height="6" width="6" x="60" y="76" />
                                    <rect height="8" width="8" x="74" y="82" />
                                    <rect height="6" width="6" x="86" y="78" />
                                    <rect height="6" width="6" x="38" y="88" />
                                    <rect height="6" width="8" x="48" y="88" />
                                    <rect height="6" width="6" x="62" y="88" />
                                  </svg>
                                  <span className="font-label-caps text-label-caps text-secondary text-center text-[10px]">
                                    FIWDEE RETREAT
                                  </span>
                                </div>

                                <div className="flex-1 w-full space-y-space-xs text-left">
                                  <div>
                                    <span className="font-label-caps text-label-caps text-secondary uppercase block">
                                      พร้อมเพย์สแกนได้ทุกธนาคาร
                                    </span>
                                    <p className="font-headline-sm text-headline-sm text-primary font-medium">
                                      ยอดชำระ:{' '}
                                      {promoApplied && (
                                        <span className="font-body-sm text-body-sm text-stone-400 line-through mr-1.5">
                                          {activeService.price}
                                        </span>
                                      )}
                                      {finalPriceLabel}
                                    </p>
                                  </div>
                                  <div className="pt-1">
                                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                                      เลขอ้างอิง:{' '}
                                      <span className="font-mono text-on-surface font-medium">{bookingRef}</span>
                                    </p>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                                      <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                                      <span>
                                        กรุณาชำระภายใน{' '}
                                        <span className="font-mono text-primary font-semibold">
                                          {formatCountdown()}
                                        </span>{' '}
                                        นาที
                                      </span>
                                    </p>
                                  </div>
                                  <div className="pt-space-xs">
                                    <button
                                      type="button"
                                      onClick={() => alert('บันทึกรูปภาพ QR Code สำเร็จ')}
                                      className="font-label-caps text-label-caps uppercase text-secondary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-xs">download</span> บันทึกรูปภาพ QR ลงอุปกรณ์
                                    </button>
                                  </div>

                                  {/* ช่องกรอกรหัสโปรโมชั่น — ใช้โค้ดถูกแล้วยอดสรุปด้านขวาจะลดทันที */}
                                  <div className="mt-2 pt-3 border-t border-outline-variant/30 space-y-2">
                                    <span className="font-label-caps text-label-caps text-secondary uppercase block">
                                      รหัสโปรโมชั่น (ถ้ามี)
                                    </span>
                                    {promoApplied ? (
                                      <div className="flex items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                                        <span className="font-body-sm text-body-sm text-emerald-900 flex items-center gap-1.5">
                                          <span className="material-symbols-outlined text-base">check_circle</span>
                                          <span>
                                            ใช้โค้ด <span className="font-mono font-bold">{PROMO.code}</span> สำเร็จ · ส่วนลด {PROMO.discount}
                                          </span>
                                        </span>
                                        <button
                                          type="button"
                                          onClick={handleRemovePromo}
                                          aria-label="ถอนโค้ดโปรโมชั่น"
                                          className="w-6 h-6 rounded-full text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                                        >
                                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                          </svg>
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            value={promoInput}
                                            onChange={(e) => setPromoInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                                            placeholder="กรอกรหัส เช่น FIWDEE20"
                                            className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/50 font-mono text-sm uppercase tracking-wider text-on-surface placeholder:font-body-sm placeholder:normal-case placeholder:tracking-normal placeholder:text-outline/70 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                          />
                                          <button
                                            type="button"
                                            onClick={handleApplyPromo}
                                            className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-caps text-label-caps uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shrink-0"
                                          >
                                            ใช้โค้ด
                                          </button>
                                        </div>
                                        {promoError && (
                                          <p className="font-body-sm text-xs text-rose-700 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">error</span>
                                            {promoError}
                                          </p>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Option 2: Card */}
                          <div
                            className={`p-space-md rounded transition-all duration-200 ${
                              paymentMethod === 'creditcard'
                                ? 'bg-surface-container-lowest shadow-sm'
                                : 'bg-surface-container'
                            }`}
                          >
                            <label className="flex items-start gap-space-sm cursor-pointer select-none">
                              <input
                                checked={paymentMethod === 'creditcard'}
                                onChange={() => setPaymentMethod('creditcard')}
                                className="mt-1 accent-primary w-4 h-4 cursor-pointer"
                                name="payment_method"
                                type="radio"
                              />
                              <div className="flex-1">
                                <div className="flex items-baseline justify-between">
                                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                                    บัตรเครดิต / บัตรเดบิต
                                  </span>
                                  <span className="font-label-caps text-label-caps text-secondary">
                                    Visa · Master · JCB
                                  </span>
                                </div>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                                  รองรับระบบ 3D Secure ไม่มีค่าธรรมเนียมเพิ่มเติม
                                </p>
                              </div>
                            </label>

                            {paymentMethod === 'creditcard' && (
                              <div className="mt-space-md pt-space-sm space-y-space-sm">
                                <div className="space-y-1">
                                  <label className="font-label-caps text-label-caps uppercase text-secondary">
                                    หมายเลขบัตร
                                  </label>
                                  <input
                                    className="w-full bg-surface-container-lowest px-space-sm py-2 rounded font-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
                                    placeholder="•••• •••• •••• ••••"
                                    type="text"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-space-sm">
                                  <div className="space-y-1">
                                    <label className="font-label-caps text-label-caps uppercase text-secondary">
                                      วันหมดอายุ (MM/YY)
                                    </label>
                                    <input
                                      className="w-full bg-surface-container-lowest px-space-sm py-2 rounded font-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
                                      placeholder="MM / YY"
                                      type="text"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="font-label-caps text-label-caps uppercase text-secondary">
                                      CVV / CVC
                                    </label>
                                    <input
                                      className="w-full bg-surface-container-lowest px-space-sm py-2 rounded font-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
                                      maxLength={4}
                                      placeholder="•••"
                                      type="password"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Option 3: Deposit */}
                          <div
                            className={`p-space-md rounded transition-all duration-200 ${
                              paymentMethod === 'deposit'
                                ? 'bg-surface-container-lowest shadow-sm'
                                : 'bg-surface-container'
                            }`}
                          >
                            <label className="flex items-start gap-space-sm cursor-pointer select-none">
                              <input
                                checked={paymentMethod === 'deposit'}
                                onChange={() => setPaymentMethod('deposit')}
                                className="mt-1 accent-primary w-4 h-4 cursor-pointer"
                                name="payment_method"
                                type="radio"
                              />
                              <div className="flex-1">
                                <div className="flex items-baseline justify-between">
                                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                                    ชำระที่สาขาในวันรับบริการ
                                  </span>
                                  <span className="font-label-caps text-label-caps text-secondary font-medium">
                                    มัดจำ ฿300
                                  </span>
                                </div>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                                  ชำระมัดจำออนไลน์ ฿300 เพื่อล็อกห้องนวดและตารางเวลา ยอดคงเหลือ ฿
                                  {(finalPrice - 300).toLocaleString('en-US')} ชำระที่เคาน์เตอร์
                                </p>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Channels */}
                      <div className="bg-surface-container-low p-space-md md:p-space-lg rounded">
                        <h2 className="font-headline-sm text-headline-sm text-on-surface font-normal mb-space-xs">
                          ช่องทางรับใบเสร็จและการยืนยันนัดหมาย
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                          ระบบจะจัดส่งเอกสารยืนยันการจอง รหัสคิว และแผนที่การเดินทางทันทีหลังการชำระเงิน
                        </p>
                        <div className="space-y-space-sm">
                          <div className="flex items-center justify-between p-space-sm bg-surface-container-lowest rounded border border-outline-variant/20">
                            <div className="flex items-center gap-space-sm">
                              <span className="material-symbols-outlined text-primary text-xl">sms</span>
                              <div>
                                <span className="font-label-md text-label-md text-on-surface block">
                                  ข้อความ SMS
                                </span>
                                <span className="font-body-sm text-body-sm text-secondary">
                                  089-456-7890
                                </span>
                              </div>
                            </div>
                            <span className="font-label-caps text-label-caps text-secondary font-medium">
                              ยืนยันแล้ว
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-space-sm bg-surface-container-lowest rounded border border-outline-variant/20">
                            <div className="flex items-center gap-space-sm">
                              <span className="material-symbols-outlined text-primary text-xl">chat</span>
                              <div>
                                <span className="font-label-md text-label-md text-on-surface block">
                                  LINE Official Account
                                </span>
                                <span className="font-body-sm text-body-sm text-secondary">
                                  แจ้งเตือนเตือนความจำล่วงหน้า 2 ชม.
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-primary">
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              <span className="font-label-caps text-label-caps font-semibold">เชื่อมต่อ</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Back link */}
                      <div className="flex items-center justify-between pt-space-xs">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="font-label-md text-label-md text-secondary hover:text-primary transition-colors duration-200 inline-flex items-center gap-1 group cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base transition-transform group-hover:-translate-x-1">
                            arrow_back
                          </span>
                          ย้อนกลับไปแก้ไขวันเวลา
                        </button>
                        <span className="font-label-caps text-label-caps text-secondary hidden sm:inline-block">
                          FIWDEE BOUTIQUE WELLNESS
                        </span>
                      </div>
                    </section>

                    {/* Right: 5 cols */}
                    <aside className="lg:col-span-5 flex flex-col gap-space-md">
                      <div className="bg-surface-container-low rounded overflow-hidden shadow-sm sticky top-28">
                        <div className="relative w-full h-48 md:h-56 bg-surface-container overflow-hidden">
                          <img
                            alt="ห้องนวดไทยราชสำนัก บรรยากาศเงียบสงบ"
                            className="w-full h-full object-cover"
                            src="/images/booking/suite-room.jpg"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-surface">
                            <div>
                              <span className="font-label-caps text-label-caps uppercase text-secondary-fixed">
                                Private Sanctuary
                              </span>
                              <p className="font-headline-sm text-headline-sm text-surface font-normal">
                                ห้องเดี่ยวส่วนตัว Private Suite
                              </p>
                            </div>
                            <span className="font-label-caps text-label-caps px-2 py-0.5 bg-surface/20 backdrop-blur-sm rounded text-surface">
                              พร้อมบริการ
                            </span>
                          </div>
                        </div>

                        <div className="p-space-md md:p-space-lg space-y-space-md">
                          <div>
                            <span className="font-label-caps text-label-caps uppercase text-primary tracking-wider block mb-1">
                              สรุปการนัดหมาย
                            </span>
                            <h3 className="font-headline-md text-headline-md text-on-surface font-normal">
                              {selectedService.name}
                            </h3>
                            <p className="font-body-sm text-body-sm text-secondary">
                              {selectedService.desc} ({activeService.duration})
                            </p>
                          </div>

                          <div className="space-y-space-xs text-on-surface pt-space-xs">
                            <div className="flex items-center justify-between py-1 bg-surface-container/60 px-3 rounded">
                              <span className="font-body-sm text-body-sm text-secondary flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-primary">location_on</span>
                                สาขา
                              </span>
                              <span className="font-label-md text-label-md text-on-surface text-right">
                                ขอนแก่น (ถ.มิตรภาพ ซอย 12)
                              </span>
                            </div>

                            <div className="flex items-center justify-between py-1 bg-surface-container/60 px-3 rounded">
                              <span className="font-body-sm text-body-sm text-secondary flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-primary">calendar_today</span>
                                วันนัดหมาย
                              </span>
                              <span className="font-label-md text-label-md text-on-surface font-medium">
                                {selectedDate.fullText}
                              </span>
                            </div>

                            <div className="flex items-center justify-between py-1 bg-surface-container/60 px-3 rounded">
                              <span className="font-body-sm text-body-sm text-secondary flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-primary">schedule</span>
                                ช่วงเวลา
                              </span>
                              <span className="font-label-md text-label-md text-primary font-semibold">
                                {selectedTimeSlot.timeRange || selectedTimeSlot.time}
                              </span>
                            </div>

                            <div className="flex items-center justify-between py-1 bg-surface-container/60 px-3 rounded">
                              <span className="font-body-sm text-body-sm text-secondary flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-primary">person</span>
                                หมอนวดผู้ดูแล
                              </span>
                              <span className="font-label-md text-label-md text-on-surface">
                                {selectedTherapist.shortName}
                              </span>
                            </div>

                            <div className="flex items-center justify-between py-1 bg-surface-container/60 px-3 rounded">
                              <span className="font-body-sm text-body-sm text-secondary flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-primary">badge</span>
                                ผู้รับบริการ
                              </span>
                              <span className="font-label-md text-label-md text-on-surface">
                                คุณอภิสิทธิ์ วัฒนากุล
                              </span>
                            </div>
                          </div>

                          <div className="pt-space-xs space-y-2">
                            <div className="flex justify-between font-body-sm text-body-sm">
                              <span className="text-secondary">ค่าบริการบำบัด ({activeService.duration})</span>
                              <span className={`font-medium ${promoApplied ? 'line-through text-stone-400' : 'text-on-surface'}`}>
                                {activeService.price}
                              </span>
                            </div>
                            {promoApplied && (
                              <div className="flex justify-between font-body-sm text-body-sm text-emerald-800">
                                <span className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-base">local_offer</span>
                                  ส่วนลดโปรโมชั่น ({PROMO.code} · {PROMO.discount})
                                </span>
                                <span className="font-semibold">{discountLabel}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-body-sm text-body-sm">
                              <span className="text-secondary">ห้องทรีตเมนต์เดี่ยว &amp; เวลคัมดริ๊งก์สมุนไพร</span>
                              <span className="text-primary font-medium">ฟรี (รวมในแพ็กเกจ)</span>
                            </div>
                            <div className="flex justify-between font-body-sm text-body-sm">
                              <span className="text-secondary">ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
                              <span className="text-secondary">รวมในราคาแล้ว</span>
                            </div>

                            <div className="pt-space-sm flex items-baseline justify-between border-t border-outline-variant/30">
                              <div>
                                <span className="font-label-caps text-label-caps uppercase text-secondary">
                                  ยอดรวมสุทธิ
                                </span>
                                <p className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
                                  {paymentMethod === 'deposit' ? '฿300 (มัดจำ)' : finalPriceLabel}
                                </p>
                              </div>
                              <span className="font-label-caps text-label-caps text-secondary">
                                {paymentMethod === 'deposit' ? 'ยอดมัดจำออนไลน์' : 'สุทธิ (Net Price)'}
                              </span>
                            </div>
                          </div>

                          <div className="pt-space-xs">
                            <button
                              type="button"
                              onClick={handleConfirmBooking}
                              className="w-full bg-primary hover:opacity-90 active:scale-[0.99] text-on-primary py-3.5 px-space-md rounded font-label-md text-label-md tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-base">verified</span>
                              ยืนยันการจองและชำระเงิน ({paymentMethod === 'deposit' ? '฿300' : finalPriceLabel})
                            </button>
                          </div>

                          <div className="p-space-sm bg-surface-container rounded flex items-start gap-2">
                            <span className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0">
                              shield
                            </span>
                            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                              <span className="font-medium text-on-surface">การันตีล็อกเวลาทันที:</span>{' '}
                              ยกเลิกหรือเลื่อนนัดหมายได้โดยไม่มีค่าปรับ เมื่อแจ้งล่วงหน้าอย่างน้อย 4 ชั่วโมงก่อนเวลาเข้ารับบริการ
                            </p>
                          </div>
                        </div>
                      </div>
                    </aside>
                  </div>
                </div>
              </>
            )}

            {/* Retreat Standards Accent (Footer accent) */}
            <section className="w-full bg-surface-container-high py-space-xl mt-space-xl">
              <div className="max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
                  <div className="space-y-space-xs">
                    <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-bold">
                      STANDARD 01
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-normal">
                      ความเป็นส่วนตัวสูงสุด
                    </h3>
                    <p className="font-body-sm text-body-sm text-secondary">
                      ทุกห้องทำหัตถการได้รับการออกแบบอย่างมิดชิด ป้องกันเสียงรบกวน พร้อมปรับอุณหภูมิและแสงสว่างเฉพาะบุคคล
                    </p>
                  </div>
                  <div className="space-y-space-xs">
                    <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-bold">
                      STANDARD 02
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-normal">
                      ชาเกสรบัวต้อนรับ
                    </h3>
                    <p className="font-body-sm text-body-sm text-secondary">
                      สูตรชาสมุนไพรอุ่นปรุงสดเพื่อเตรียมความพร้อมร่างกายให้ผ่อนคลายและดูดซับคุณค่าแห่งการบำบัดอย่างเต็มที่
                    </p>
                  </div>
                  <div className="space-y-space-xs">
                    <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-bold">
                      STANDARD 03
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-normal">
                      สุขอนามัยระดับพรีเมียม
                    </h3>
                    <p className="font-body-sm text-body-sm text-secondary">
                      ผ้าลินินแท้และอุปกรณ์สัมผัสทุกชิ้นผ่านการซักอบฆ่าเชื้อมาตรฐานเดียวกับโรงแรมระดับห้าดาวทุกรอบบริการ
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
        </motion.div>
      </div>
    </main>
  )
}
