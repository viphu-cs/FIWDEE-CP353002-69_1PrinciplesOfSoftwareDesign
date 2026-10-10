import { useState, useCallback, useEffect } from 'react'
import { motion } from 'motion/react'
import { useCustomerAuth } from '../../context/CustomerAuthContext.jsx'
import {
  bookingService,
  formatLocalDateISO,
  therapistsData as initialTherapists,
  servicesData as initialServices,
  dateOptions as initialDateOptions,
  timeSlots as initialTimeSlots,
} from '../../services/bookingService.js'
import {
  therapistCanPerformService,
  getAvailableServicesForTherapist,
} from '../../services/skillMatcher.js'
import { useCountdownTimer } from '../../hooks/useCountdownTimer.js'
import { usePromoCode } from '../../hooks/usePromoCode.js'
import BookingStepNav from './components/BookingStepNav.jsx'
import BookingConfirmation from './components/BookingConfirmation.jsx'
import BookingStepService from './components/BookingStepService.jsx'
import BookingStepSlot from './components/BookingStepSlot.jsx'
import BookingStepPayment from './components/BookingStepPayment.jsx'
import BookingStandardsFooter from './components/BookingStandardsFooter.jsx'

const EASE_ENTER = [0.22, 1, 0.36, 1]

/**
 * BookingPage - Orchestrator Component สำหรับกระบวนการจอง 3 ขั้นตอน
 * ออกแบบตามหลัก SOLID:
 * - SRP: แยกความรับผิดชอบของ Timer, Promo, และ UI แต่ละขั้นตอนเป็น Hooks และ Components ย่อย
 * - OCP: วิธีชำระเงินรองรับการเพิ่มตัวเลือกใหม่ผ่าน Payment Strategies
 * - DIP: ดึงข้อมูลผ่าน bookingService abstraction layer
 */
export default function BookingPage({ onNavigate, initialStep = 1, initialTherapistId = null }) {
  const { user } = useCustomerAuth()
  const [step, setStep] = useState(initialStep)

  // Dataset states loaded asynchronously from backend with instant fallback
  const [therapistsList, setTherapistsList] = useState(initialTherapists)
  const [servicesList, setServicesList] = useState(initialServices)
  const [dateList, setDateList] = useState(initialDateOptions)
  const [slotsList, setSlotsList] = useState(initialTimeSlots)

  const initialMatchedTherapist = initialTherapistId
    ? initialTherapists.find(
        (t) =>
          String(t.id) === String(initialTherapistId) ||
          String(t.backendId) === String(initialTherapistId)
      )
    : null
  const anyTherapist =
    initialTherapists.find((t) => t.id === 'any') || initialTherapists[0]

  const [selectedTherapist, setSelectedTherapist] = useState(
    initialMatchedTherapist || anyTherapist
  )
  const [isDirectTherapistBooking, setIsDirectTherapistBooking] = useState(
    Boolean(initialMatchedTherapist)
  )
  const [selectedService, setSelectedService] = useState(initialServices[0])
  const [selectedDuration, setSelectedDuration] = useState(
    initialServices[0]?.durationOptions?.[0]
  )
  const [selectedDate, setSelectedDate] = useState(initialDateOptions[0])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(initialTimeSlots[2] || initialTimeSlots[0])
  const [pressureLevel, setPressureLevel] = useState('ปานกลาง (แนะนำ)')
  const [specialNotes, setSpecialNotes] = useState(
    'ปวดตึงกล้ามเนื้อบริเวณสะบักและคอเป็นพิเศษจากการทำงานหน้าจอคอมพิวเตอร์'
  )
  const [recipientName, setRecipientName] = useState(user?.name || '')
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || user?.phoneNumber || '')
  const [paymentMethod, setPaymentMethod] = useState('promptpay')
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [bookingRef, setBookingRef] = useState(bookingService.createBookingReference)

  // Load live catalogs on mount
  useEffect(() => {
    let isMounted = true

    bookingService.getServices().then((svcs) => {
      if (isMounted && Array.isArray(svcs) && svcs.length > 0) {
        setServicesList(svcs)
        // Keep selected service in sync with live data
        const match = svcs.find((s) => s.id === selectedService.id || s.serviceCode === selectedService.serviceCode)
        if (match) {
          setSelectedService(match)
          const durMatch = match.durationOptions.find((d) => d.minutes === selectedDuration?.minutes)
          setSelectedDuration(durMatch || match.durationOptions[0])
        }
      }
    })

    bookingService.getTherapists().then((thps) => {
      if (isMounted && Array.isArray(thps) && thps.length > 0) {
        setTherapistsList(thps)
        if (initialTherapistId) {
          const matchThp = thps.find(
            (t) =>
              String(t.id) === String(initialTherapistId) ||
              String(t.backendId) === String(initialTherapistId)
          )
          if (matchThp) {
            setSelectedTherapist(matchThp)
            setIsDirectTherapistBooking(true)
          }
        } else {
          const matchThp = thps.find((t) => t.id === selectedTherapist.id)
          if (matchThp) {
            setSelectedTherapist(matchThp)
          }
        }
      }
    })

    const dates = bookingService.getDateOptions()
    setDateList(dates)
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0])
    }

    return () => {
      isMounted = false
    }
  }, [])

  // Sync recipient defaults when logged in user profile becomes available
  useEffect(() => {
    if (user) {
      if (!recipientName && user.name) setRecipientName(user.name)
      if (!recipientPhone && (user.phone || user.phoneNumber)) {
        setRecipientPhone(user.phone || user.phoneNumber)
      }
    }
  }, [user])

  // Dynamic slot availability fetch when date, service or duration changes
  useEffect(() => {
    let isMounted = true
    if (!selectedService?.id || !selectedDuration?.minutes || !selectedDate?.isoDate) {
      return
    }

    bookingService
      .getAvailability(selectedDate.isoDate, selectedService.id, selectedDuration.minutes)
      .then((liveSlots) => {
        if (isMounted && Array.isArray(liveSlots) && liveSlots.length > 0) {
          // If a specific therapist is selected, adjust slot availability based on therapist's presence
          const processedSlots = liveSlots.map((slot) => {
            if (selectedTherapist?.backendId) {
              const hasTherapist = Array.isArray(slot.availableTherapists) &&
                slot.availableTherapists.some((t) => Number(t.id) === Number(selectedTherapist.backendId))
              return {
                ...slot,
                available: slot.available && hasTherapist,
                label: slot.available && hasTherapist ? 'ว่างสำหรับนัดหมาย' : 'คิวเต็มสำหรับผู้บำบัดนี้',
              }
            }
            return slot
          })

          setSlotsList(processedSlots)
          // Keep current selection if still available, else select first available
          const currentValid = processedSlots.find((s) => s.time === selectedTimeSlot?.time && s.available)
          if (currentValid) {
            setSelectedTimeSlot(currentValid)
          } else {
            const firstAvail = processedSlots.find((s) => s.available)
            if (firstAvail) setSelectedTimeSlot(firstAvail)
          }
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [selectedDate?.isoDate, selectedService?.id, selectedDuration?.minutes, selectedTherapist?.backendId])

  // Active service presentation object
  const activeService = {
    ...selectedService,
    duration: `${selectedDuration?.minutes || 60} นาที`,
    price: `฿${(selectedDuration?.price || 0).toLocaleString('en-US')}`,
    rawPrice: selectedDuration?.price || 0,
  }

  // Countdown timer for PromptPay
  const { formatCountdown } = useCountdownTimer(
    14 * 60 + 45,
    step === 3 && paymentMethod === 'promptpay'
  )

  // Promotion code and discounts (100% server-side calculation)
  const promoState = usePromoCode(activeService.rawPrice, selectedService?.id)

  // Toast/Notice when service is auto-switched to match therapist skills
  const [autoSwitchNotice, setAutoSwitchNotice] = useState(null)

  const handleSelectTherapist = useCallback(
    (therapist) => {
      setSelectedTherapist(therapist)
      if (therapist.id === 'any' || therapist.isConcierge) {
        setIsDirectTherapistBooking(false)
        setAutoSwitchNotice(null)
        return
      }

      setIsDirectTherapistBooking(true)

      // Check if selected therapist can perform the currently selected service
      const canPerform = therapistCanPerformService(therapist, selectedService)
      if (!canPerform) {
        // Auto-switch to the first compatible service
        const compatibleServices = getAvailableServicesForTherapist(therapist, servicesList)
        if (compatibleServices.length > 0) {
          const newSvc = compatibleServices[0]
          setSelectedService(newSvc)
          const keepSameMinutes = newSvc.durationOptions?.find((o) => o.minutes === selectedDuration?.minutes)
          setSelectedDuration(keepSameMinutes || newSvc.durationOptions?.[1] || newSvc.durationOptions?.[0])

          setAutoSwitchNotice({
            therapistName: therapist.shortName || therapist.name,
            serviceName: newSvc.name,
          })
          setTimeout(() => setAutoSwitchNotice(null), 5000)
        }
      } else {
        setAutoSwitchNotice(null)
      }
    },
    [selectedService, selectedDuration?.minutes, servicesList]
  )

  const handleSelectService = useCallback(
    (svc) => {
      setSelectedService(svc)
      const keepSameMinutes = svc.durationOptions?.find((o) => o.minutes === selectedDuration?.minutes)
      setSelectedDuration(keepSameMinutes || svc.durationOptions?.[1] || svc.durationOptions?.[0])
      setAutoSwitchNotice(null)
    },
    [selectedDuration?.minutes]
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

  const handleConfirmBooking = useCallback(async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const dateStr = selectedDate?.isoDate || formatLocalDateISO(new Date())
      const timeStr = selectedTimeSlot?.time || '10:00'
      const startDateTime = `${dateStr}T${timeStr.length === 5 ? timeStr + ':00' : timeStr}`

      const customerNotes = [
        recipientName ? `ผู้รับบริการ: ${recipientName}` : '',
        recipientPhone ? `เบอร์ติดต่อ: ${recipientPhone}` : '',
        pressureLevel ? `ระดับน้ำหนัก: ${pressureLevel}` : '',
        specialNotes ? `รายละเอียดเพิ่มเติม: ${specialNotes}` : '',
        promoState.promoApplied
          ? `โปรโมชั่น: ${promoState.promoInfo.code} (ส่วนลด ฿${promoState.discountAmount.toLocaleString('en-US')}, ยอดสุทธิ ฿${promoState.finalPrice.toLocaleString('en-US')})`
          : '',
      ].filter(Boolean).join(' | ')

      const resolvedDurationId =
        selectedDuration?.id ||
        selectedService?.durationOptions?.find((d) => d.minutes === selectedDuration?.minutes)?.id ||
        1

      const bookingPayload = {
        serviceId: selectedService.id,
        durationOptionId: resolvedDurationId,
        therapistId: selectedTherapist?.backendId || null,
        startDateTime,
        bookingChannel: 'ONLINE',
        specialNotes: customerNotes,
      }

      const res = await bookingService.createBooking(bookingPayload)

      if (res && res.success && res.data) {
        const createdBooking = res.data
        setConfirmedBooking(createdBooking)
        setBookingRef(createdBooking.bookingReferenceCode)

        // Process payment via Strategy pattern endpoint if online method selected
        if (paymentMethod === 'promptpay' || paymentMethod === 'creditcard') {
          try {
            const backendPaymentMethod = paymentMethod === 'promptpay' ? 'QR_PROMPTPAY' : 'CREDIT_CARD'
            await bookingService.processPayment(createdBooking.id, {
              paymentMethod: backendPaymentMethod,
              promoCode: promoState.promoApplied ? promoState.promoInfo.code : null,
              transactionNote: 'จองผ่านระบบออนไลน์ลูกค้า',
            })
          } catch (payErr) {
            console.warn('Payment strategy error, booking kept pending:', payErr)
          }
        }

        setIsConfirmed(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        throw new Error(res?.message || 'ไม่สามารถทำการจองได้ กรุณาลองใหม่อีกครั้ง')
      }
    } catch (err) {
      console.error('Booking confirmation failed:', err)
      setSubmitError(err.message || 'เกิดข้อผิดพลาดในการสร้างการจอง กรุณาลองใหม่อีกครั้งหรือติดต่อเจ้าหน้าที่')
    } finally {
      setIsSubmitting(false)
    }
  }, [
    selectedService,
    selectedDuration,
    selectedTherapist,
    selectedDate,
    selectedTimeSlot,
    pressureLevel,
    specialNotes,
    recipientName,
    recipientPhone,
    paymentMethod,
    promoState,
  ])

  const handleResetBooking = useCallback(() => {
    setIsConfirmed(false)
    setConfirmedBooking(null)
    setBookingRef(bookingService.createBookingReference())
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
              recipientName={recipientName}
              recipientPhone={recipientPhone}
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
                  therapists={therapistsList}
                  services={servicesList}
                  selectedTherapist={selectedTherapist}
                  setSelectedTherapist={handleSelectTherapist}
                  isDirectTherapistBooking={isDirectTherapistBooking}
                  setIsDirectTherapistBooking={setIsDirectTherapistBooking}
                  selectedService={selectedService}
                  selectedDuration={selectedDuration}
                  handleSelectService={handleSelectService}
                  handleSelectDuration={handleSelectDuration}
                  activeService={activeService}
                  autoSwitchNotice={autoSwitchNotice}
                  onNext={handleNextStep}
                />
              )}

              {step === 2 && (
                <BookingStepSlot
                  dateOptions={dateList}
                  timeSlots={slotsList}
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
                  recipientName={recipientName}
                  recipientPhone={recipientPhone}
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
                  isSubmitting={isSubmitting}
                  submitError={submitError}
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
