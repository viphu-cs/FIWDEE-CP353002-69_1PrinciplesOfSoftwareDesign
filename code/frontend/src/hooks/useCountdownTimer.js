import { useState, useEffect, useCallback } from 'react'

/**
 * useCountdownTimer - Hook สำหรับนับเวลาถอยหลัง (SRP: จัดการเฉพาะ Countdown Timer)
 * @param {number} initialSeconds - จำนวนวินาทีเริ่มต้น (default: 14 นาที 45 วินาที = 885s)
 * @param {boolean} active - เริ่มนับเมื่อเงื่อนไขเป็นจริง
 */
export function useCountdownTimer(initialSeconds = 14 * 60 + 45, active = true) {
  const [countdown, setCountdown] = useState(initialSeconds)

  useEffect(() => {
    if (!active) return
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [active])

  const formatCountdown = useCallback(() => {
    const m = Math.floor(countdown / 60)
    const s = countdown % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }, [countdown])

  const resetCountdown = useCallback(
    (seconds = initialSeconds) => {
      setCountdown(seconds)
    },
    [initialSeconds]
  )

  return {
    countdown,
    formatCountdown,
    resetCountdown,
    isExpired: countdown === 0,
  }
}
