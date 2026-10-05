import { useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { bookingService } from '../../services/bookingService.js'
import { useCountdownTimer } from '../../hooks/useCountdownTimer.js'
import { usePromoCode } from '../../hooks/usePromoCode.js'
import BookingStepNav from './components/BookingStepNav.jsx'
import BookingConfirmation from './components/BookingConfirmation.jsx'
import BookingStepService from './components/BookingStepService.jsx'
import BookingStepSlot from './components/BookingStepSlot.jsx'
import BookingStepPayment from './components/BookingStepPayment.jsx'
import BookingStandardsFooter from './components/BookingStandardsFooter.jsx'

const EASE_ENTER = [0.22, 1, 0.36, 1]

// ดึงชุดข้อมูลผ่าน Booking Service Abstraction (DIP)
const therapistsData = bookingService.getTherapists()
const servicesData = bookingService.getServices()
const dateOptions = bookingService.getDateOptions()
const timeSlots = bookingService.getTimeSlots()

/**
 * BookingPage - Orchestrator Component สำหรับกระบวนการจอง 3 ขั้นตอน
 * ออกแบบตามหลัก SOLID:
 * - SRP: แยกความรับผิดชอบของ Timer, Promo, และ UI แต่ละขั้นตอนเป็น Hooks และ Components ย่อย
 * - OCP: วิธีชำระเงินรองรับการเพิ่มตัวเลือกใหม่ผ่าน Payment Strategies
 * - DIP: ดึงข้อมูลผ่าน bookingService abstraction layer
 */
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
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [bookingRef] = useState(bookingService.createBookingReference)

  // ค่าที่ใช้จริงของบริการ
  const activeService = {
    ...selectedService,
    duration: `${selectedDuration.minutes} นาที`,
    price: `฿${selectedDuration.price.toLocaleString('en-US')}`,
    rawPrice: selectedDuration.price,
  }

  // Hook สำหรับนับเวลาถอยหลัง 14:45 (SRP)
  const { formatCountdown } = useCountdownTimer(
    14 * 60 + 45,
    step === 3 && paymentMethod === 'promptpay'
  )

  // Hook สำหรับจัดการโค้ดโปรโมชั่นและส่วนลด (SRP)
  const promoState = usePromoCode(activeService.rawPrice)

  const handleSelectService = useCallback(
    (svc) => {
      setSelectedService(svc)
      const keepSameMinutes = svc.durationOptions.find((o) => o.minutes === selectedDuration.minutes)
      setSelectedDuration(keepSameMinutes || svc.durationOptions[1] || svc.durationOptions[0])
    },
    [selectedDuration.minutes]
  )

  const handleSelectDuration = useCallback((svc, option) => {
    setSelectedService(svc)
    setSelectedDuration(option)
  }, [])

  const handleNextStep = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setStep((prev) => (prev < 3 ? prev + 1 : prev))
  }, [])

  const handlePrevStep = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setStep((prev) => (prev > 1 ? prev - 1 : prev))
  }, [])

  const handleConfirmBooking = useCallback(() => {
    setIsConfirmed(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleResetBooking = useCallback(() => {
    setIsConfirmed(false)
    setStep(1)
  }, [])

  return (
    <main className="auth-theme w-full pt-20 bg-surface min-h-[calc(100vh-80px)]">
      <div className="flex flex-col w-full">
        {/* Top Stepper Ribbon */}
        <BookingStepNav step={step} setStep={setStep} onNavigate={onNavigate} />

        {/* Wizard Content / Confirmation Screen */}
        <motion.div
          key={isConfirmed ? 'confirmed' : `step-${step}`}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_ENTER }}
        >
          {isConfirmed ? (
            <BookingConfirmation
              bookingRef={bookingRef}
              selectedTherapist={selectedTherapist}
              selectedService={selectedService}
              activeService={activeService}
              selectedDate={selectedDate}
              selectedTimeSlot={selectedTimeSlot}
              onNavigate={onNavigate}
              onResetBooking={handleResetBooking}
            />
          ) : (
            <>
              {step === 1 && (
                <BookingStepService
                  therapists={therapistsData}
                  services={servicesData}
                  selectedTherapist={selectedTherapist}
                  setSelectedTherapist={setSelectedTherapist}
                  selectedService={selectedService}
                  selectedDuration={selectedDuration}
                  handleSelectService={handleSelectService}
                  handleSelectDuration={handleSelectDuration}
                  activeService={activeService}
                  onNext={handleNextStep}
                />
              )}

              {step === 2 && (
                <BookingStepSlot
                  dateOptions={dateOptions}
                  timeSlots={timeSlots}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedTimeSlot={selectedTimeSlot}
                  setSelectedTimeSlot={setSelectedTimeSlot}
                  pressureLevel={pressureLevel}
                  setPressureLevel={setPressureLevel}
                  specialNotes={specialNotes}
                  setSpecialNotes={setSpecialNotes}
                  selectedService={selectedService}
                  selectedTherapist={selectedTherapist}
                  activeService={activeService}
                  onPrev={handlePrevStep}
                  onNext={handleNextStep}
                />
              )}

              {step === 3 && (
                <BookingStepPayment
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  activeService={activeService}
                  selectedService={selectedService}
                  selectedTherapist={selectedTherapist}
                  selectedDate={selectedDate}
                  selectedTimeSlot={selectedTimeSlot}
                  bookingRef={bookingRef}
                  formatCountdown={formatCountdown}
                  promoState={promoState}
                  onPrev={handlePrevStep}
                  onConfirm={handleConfirmBooking}
                />
              )}

              {/* Retreat Standards Footer */}
              <BookingStandardsFooter />
            </>
          )}
        </motion.div>
      </div>
    </main>
  )
}
