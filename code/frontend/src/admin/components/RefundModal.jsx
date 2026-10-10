import React, { useState, useEffect } from 'react'
import { api } from '../../lib/api.js'
import { useLanguage } from '../../i18n/useLanguage.js'

export default function RefundModal({ isOpen, onClose, booking, onRefundProcessed }) {
  const { lang, t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [payment, setPayment] = useState(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [existingRefunds, setExistingRefunds] = useState([])

  useEffect(() => {
    let isMounted = true
    if (!isOpen || !booking) return

    setLoading(true)
    setErrorMsg(null)

    const fetchPaymentAndRefunds = async () => {
      try {
        const payRes = await api.get(`/bookings/${booking.id}/payment`)
        if (payRes && payRes.success && payRes.data) {
          if (isMounted) {
            setPayment(payRes.data)
            setRefundAmount(String(payRes.data.amount || booking.totalPrice || 600))
          }

          // Also check existing refunds
          if (payRes.data.id) {
            const refRes = await api.get(`/payments/${payRes.data.id}/refunds`)
            if (refRes && refRes.success && Array.isArray(refRes.data)) {
              if (isMounted) setExistingRefunds(refRes.data)
            }
          }
        } else {
          if (isMounted) {
            setErrorMsg(lang === 'th' ? 'ไม่พบข้อมูลการชำระเงินสำหรับการจองนี้' : 'No payment transaction found for this booking')
          }
        }
      } catch (err) {
        if (isMounted) setErrorMsg(err.message || 'Error fetching payment')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchPaymentAndRefunds()

    return () => { isMounted = false }
  }, [isOpen, booking, lang])

  if (!isOpen || !booking) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!payment?.id) return

    const amountNum = Number(refundAmount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMsg(lang === 'th' ? 'กรุณาระบุจำนวนเงินที่ต้องการคืนที่ถูกต้อง' : 'Please enter a valid refund amount')
      return
    }
    if (!reason.trim()) {
      setErrorMsg(lang === 'th' ? 'กรุณาระบุเหตุผลการคืนเงิน' : 'Please enter a reason for refund')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const payload = {
        paymentId: payment.id,
        refundAmount: amountNum,
        reason: reason.trim(),
        processedByStaff: 'Staff/Owner'
      }

      const res = await api.post(`/payments/${payment.id}/refund`, payload)
      if (res && res.success) {
        onRefundProcessed?.(res.data)
        onClose()
      } else {
        setErrorMsg(res?.message || (lang === 'th' ? 'ประมวลผลการคืนเงินไม่สำเร็จ' : 'Failed to process refund'))
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-surface rounded-2xl border border-outline-variant shadow-2xl p-6 text-on-surface space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
          <div className="flex items-center gap-2 text-rose-700">
            <span className="material-symbols-outlined text-xl">currency_exchange</span>
            <h3 className="font-headline font-bold text-base text-teak-dark">
              {lang === 'th' ? 'ทำเรื่องคืนเงิน (Payment Refund)' : 'Process Refund'}
            </h3>
          </div>
          <button onClick={onClose} className="text-charcoal-muted hover:text-on-surface cursor-pointer">✕</button>
        </div>

        {/* Booking Summary */}
        <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60 text-xs space-y-1">
          <div className="flex justify-between font-semibold text-on-surface">
            <span>{booking.serviceName || '—'}</span>
            <span className="font-mono text-secondary">{booking.bookingReferenceCode || booking.id}</span>
          </div>
          <div className="text-[11px] text-charcoal-muted">
            {lang === 'th' ? 'ลูกค้า:' : 'Customer:'} {booking.customerName}
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-charcoal-muted">
            <span className="material-symbols-outlined text-2xl animate-spin inline-block text-primary">progress_activity</span>
            <p className="mt-2">{lang === 'th' ? 'กำลังดึงข้อมูลการชำระเงิน...' : 'Loading payment...'}</p>
          </div>
        ) : errorMsg && !payment ? (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block font-semibold text-charcoal-muted mb-1">
                {lang === 'th' ? 'ยอดเงินที่ต้องการคืน (บาท)' : 'Refund Amount (THB)'}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low focus:bg-surface font-bold text-sm text-teak-deep"
              />
              <span className="text-[10px] text-charcoal-muted mt-1 block">
                {lang === 'th' ? 'ยอดชำระเดิม: ฿' : 'Original payment: ฿'}{Number(payment?.amount || 0).toLocaleString()} ({payment?.paymentMethod || 'ONLINE'})
              </span>
            </div>

            <div>
              <label className="block font-semibold text-charcoal-muted mb-1">
                {lang === 'th' ? 'เหตุผลการคืนเงิน' : 'Refund Reason'}
              </label>
              <textarea
                rows="2"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={lang === 'th' ? 'เช่น ลูกค้ายกเลิกตามนโยบายล่วงหน้า 2 ชม. หรือร้านจำเป็นต้องยกเลิกนัด' : 'Reason for refund...'}
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low focus:bg-surface text-xs"
              />
            </div>

            {existingRefunds.length > 0 && (
              <div className="p-2.5 bg-surface-container rounded-xl text-[11px] text-charcoal-muted space-y-1">
                <span className="font-semibold text-teak-deep block">{lang === 'th' ? 'ประวัติการคืนเงินก่อนหน้า:' : 'Previous refunds:'}</span>
                {existingRefunds.map((r, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{r.reason}</span>
                    <span className="font-bold text-rose-700">-฿{Number(r.refundAmount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-outline-variant text-charcoal-muted hover:bg-surface-container-low cursor-pointer"
              >
                {t('admin.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-700 text-white font-semibold hover:bg-rose-800 cursor-pointer transition-colors disabled:opacity-50"
              >
                {isSubmitting ? '...' : (lang === 'th' ? 'ยืนยันการคืนเงิน' : 'Process Refund')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
