import { useState, useCallback } from 'react'
import { bookingService } from '../services/bookingService.js'

/**
 * usePromoCode - Hook สำหรับจัดการโค้ดโปรโมชั่น (SRP)
 * ไม่มีการคำนวณราคาหรือสูตรส่วนลดบน Frontend เด็ดขาด
 * ยอดเงินและส่วนลดทั้งหมดคำนวณและประเมินผ่าน Backend GoF Strategy Pattern
 * 
 * @param {number} rawPrice - ราคาบริการเต็มที่ดึงมาจากฐานข้อมูล (บาท)
 * @param {number|null} serviceId - รหัสบริการ
 */
export function usePromoCode(rawPrice = 0, serviceId = null) {
  const [promoInput, setPromoInput] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [isValidating, setIsValidating] = useState(false)

  // ข้อมูลที่ได้รับจาก Backend Quotation
  const [backendQuote, setBackendQuote] = useState({
    discountAmount: 0,
    netAmount: rawPrice,
    discountLabel: '฿0',
    promoCode: '',
    campaignName: '',
  })

  const handleApplyPromo = useCallback(async () => {
    const code = promoInput.trim()
    if (!code) return

    setIsValidating(true)
    setPromoError('')

    try {
      const res = await bookingService.validatePromotion(code, rawPrice, serviceId)
      if (res && res.success && res.data && res.data.valid) {
        setPromoApplied(true)
        setBackendQuote({
          discountAmount: Number(res.data.discountAmount) || 0,
          netAmount: Number(res.data.netAmount) || rawPrice,
          discountLabel: res.data.discountLabel || `−฿${Number(res.data.discountAmount).toLocaleString('en-US')}`,
          promoCode: res.data.promoCode,
          campaignName: res.data.campaignName,
        })
        setPromoError('')
      } else {
        setPromoApplied(false)
        setPromoError(res?.data?.message || res?.message || 'รหัสโปรโมชั่นไม่ถูกต้องหรือหมดอายุแล้ว')
      }
    } catch (err) {
      setPromoApplied(false)
      setPromoError(err?.message || 'ไม่สามารถตรวจสอบรหัสโปรโมชั่นได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsValidating(false)
    }
  }, [promoInput, rawPrice, serviceId])

  const handleRemovePromo = useCallback(() => {
    setPromoApplied(false)
    setPromoInput('')
    setPromoError('')
    setBackendQuote({
      discountAmount: 0,
      netAmount: rawPrice,
      discountLabel: '฿0',
      promoCode: '',
      campaignName: '',
    })
  }, [rawPrice])

  // คำนวณราคาสำหรับแสดงผล: หากยังไม่ใช้โปรโมชั่น ให้แสดงราคาเต็ม (rawPrice)
  // หากใช้โปรโมชั่นแล้ว ให้นำ netAmount ที่ได้จาก Backend มาแสดงผลโดยตรง
  const finalPrice = promoApplied ? backendQuote.netAmount : rawPrice
  const promoDiscountAmount = promoApplied ? backendQuote.discountAmount : 0
  const finalPriceLabel = `฿${finalPrice.toLocaleString('en-US')}`
  const discountLabel = promoApplied ? backendQuote.discountLabel : '฿0'

  return {
    promoInput,
    setPromoInput,
    promoApplied,
    promoError,
    isValidating,
    handleApplyPromo,
    handleRemovePromo,
    promoDiscountAmount,
    finalPrice,
    finalPriceLabel,
    discountLabel,
    promoInfo: {
      code: backendQuote.promoCode || promoInput.toUpperCase(),
      discount: backendQuote.campaignName || 'ส่วนลดพิเศษ',
    },
  }
}
