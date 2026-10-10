import React, { useState } from 'react'
import { api } from '../../lib/api.js'
import { useLanguage } from '../../i18n/useLanguage.js'

export default function PaymentCollectModal({ isOpen, onClose, booking, onPaymentProcessed }) {
  const { lang, t } = useLanguage()
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [transactionNote, setTransactionNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  if (!isOpen || !booking) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const payload = {
        paymentMethod,
        transactionNote: transactionNote.trim() || (lang === 'th' ? 'ชำระเงินที่เคาน์เตอร์หน้าร้าน' : 'Front-desk counter payment'),
      }

      const res = await api.post(`/bookings/${booking.id}/payment`, payload)
      if (res.success) {
        if (onPaymentProcessed) {
          onPaymentProcessed()
        }
        onClose()
      } else {
        setErrorMsg(res.message || t('admin.paymentError'))
      }
    } catch (err) {
      setErrorMsg(err.message || t('admin.paymentError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fade-in font-body-md text-on-surface">
      <div className="bg-surface rounded-3xl max-w-lg w-full border border-outline-variant shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-teak-deep text-warm-ivory p-6 border-b border-wood-deep/30 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary-container text-[11px] font-semibold text-sand-warm uppercase tracking-wider mb-2">
              <span>GoF Strategy Pattern</span>
            </div>
            <h2 className="text-xl font-headline font-semibold text-warm-ivory">
              {t('admin.paymentModalTitle')}
            </h2>
            <p className="text-xs text-sand-warm mt-1">
              {t('admin.paymentModalDesc')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-warm-ivory/80 hover:text-warm-ivory p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Booking Summary Box */}
          <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/60 space-y-2.5 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/40">
              <span className="text-charcoal-muted">{lang === 'th' ? 'รหัสการจอง' : 'Ref Code'}</span>
              <span className="font-bold text-teak-dark font-headline">{booking.bookingReferenceCode || booking.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-charcoal-muted">{t('admin.customerName')}</span>
              <span className="font-semibold text-on-surface">{booking.customerName || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-charcoal-muted">{t('admin.service')}</span>
              <span className="font-medium text-on-surface">{booking.serviceName || '-'} ({booking.durationMinutes || 60} {t('admin.minuteShort')})</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-outline-variant/40">
              <span className="text-charcoal-muted font-semibold">{lang === 'th' ? 'ยอดชำระสุทธิ' : 'Total Amount'}</span>
              <span className="text-base font-bold text-teak-dark">฿{Number(booking.totalPrice || booking.price || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-teak-dark">
              {lang === 'th' ? 'เลือกวิธีการชำระเงิน (Payment Strategy):' : 'Select Payment Method (Strategy):'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'CASH', label: t('admin.paymentMethodCash'), icon: '💵' },
                { id: 'QR_PROMPTPAY', label: t('admin.paymentMethodPromptPay'), icon: '📱' },
                { id: 'CREDIT_CARD', label: t('admin.paymentMethodCard'), icon: '💳' },
              ].map((m) => {
                const isSelected = paymentMethod === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-teak-dark text-warm-ivory border-teak-dark shadow-xs'
                        : 'bg-surface-container-low text-on-surface border-outline-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="text-lg mb-1">{m.icon}</span>
                    <span className="text-xs font-semibold">{m.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Transaction Note */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-teak-dark">
              {lang === 'th' ? 'บันทึกเพิ่มเติม / เลขที่อ้างอิง (ถ้ามี):' : 'Transaction Note / Reference (Optional):'}
            </label>
            <input
              type="text"
              value={transactionNote}
              onChange={(e) => setTransactionNote(e.target.value)}
              placeholder={lang === 'th' ? 'เช่น รับเงินสดครบถ้วน, สลิปผ่านเคาน์เตอร์ 1' : 'e.g. Received exact cash, Counter 1'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-xs focus:bg-surface placeholder:text-charcoal-muted"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/40">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-muted hover:bg-surface-container transition-colors cursor-pointer"
            >
              {t('admin.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-teak-dark text-warm-ivory hover:bg-teak-deep font-semibold text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>{lang === 'th' ? 'กำลังบันทึก...' : 'Processing...'}</span>
              ) : (
                <span>{t('admin.confirmPayment')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
