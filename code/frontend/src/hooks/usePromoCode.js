import { useState, useMemo, useCallback } from 'react'
import { PROMO } from '../data/promo.js'

/**
 * usePromoCode - Hook สำหรับจัดการโค้ดโปรโมชั่นและคำนวณส่วนลด (SRP: จัดการเฉพาะ Promo & Discount)
 * @param {number} rawPrice - ราคาบริการก่อนหักส่วนลด (บาท)
 */
export function usePromoCode(rawPrice = 0) {
  const [promoInput, setPromoInput] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState('')

  const handleApplyPromo = useCallback(() => {
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    if (code === PROMO.code.toUpperCase()) {
      setPromoApplied(true)
      setPromoError('')
    } else {
      setPromoError('รหัสโปรโมชั่นไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง')
    }
  }, [promoInput])

  const handleRemovePromo = useCallback(() => {
    setPromoApplied(false)
    setPromoInput('')
    setPromoError('')
  }, [])

  const { promoDiscountAmount, finalPrice, finalPriceLabel, discountLabel } = useMemo(() => {
    const discount = promoApplied ? Math.round(rawPrice * PROMO.discountRate) : 0
    const final = rawPrice - discount
    return {
      promoDiscountAmount: discount,
      finalPrice: final,
      finalPriceLabel: `฿${final.toLocaleString('en-US')}`,
      discountLabel: `−฿${discount.toLocaleString('en-US')}`,
    }
  }, [promoApplied, rawPrice])

  return {
    promoInput,
    setPromoInput,
    promoApplied,
    promoError,
    handleApplyPromo,
    handleRemovePromo,
    promoDiscountAmount,
    finalPrice,
    finalPriceLabel,
    discountLabel,
    promoInfo: PROMO,
  }
}
