import { useEffect, useState } from 'react'
import { api } from '../../../lib/api.js'
import { useLanguage } from '../../../i18n/useLanguage.js'

export default function BookingReceiptModal({ isOpen, onClose, booking }) {
  const { t, lang } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [receipt, setReceipt] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    let isMounted = true
    if (!isOpen || !booking) return

    setLoading(true)
    setErrorMsg(null)

    const fetchReceipt = async () => {
      try {
        // 1. Try to fetch payment by booking ID
        const payRes = await api.get(`/bookings/${booking.id}/payment`).catch(() => null)
        
        if (payRes && payRes.success && payRes.data?.id) {
          const paymentId = payRes.data.id
          // 2. Fetch receipt by payment ID
          const recRes = await api.get(`/payments/${paymentId}/receipt`).catch(() => null)
          if (recRes && recRes.success && recRes.data) {
            if (isMounted) {
              setReceipt({
                ...recRes.data,
                isPaid: true,
              })
            }
          } else {
            // Fallback receipt synthesis from payment + booking details
            if (isMounted) {
              setReceipt({
                receiptNumber: payRes.data.receiptNumber || `REC-${payRes.data.paymentReferenceCode || booking.bookingReferenceCode}`,
                paymentReferenceCode: payRes.data.paymentReferenceCode,
                bookingReferenceCode: booking.bookingReferenceCode,
                customerName: booking.customerName || 'ลูกค้าคนพิเศษ',
                customerPhone: booking.customerPhone || '—',
                serviceName: booking.serviceName,
                durationMinutes: booking.durationMinutes,
                therapistName: booking.therapistName,
                roomNumber: booking.roomNumber,
                serviceStartDateTime: booking.startDateTime,
                grossAmount: payRes.data.grossAmount || booking.totalPrice,
                discountAmount: payRes.data.discountAmount || booking.discountAmount || 0,
                netAmount: payRes.data.netAmount || booking.netAmount || booking.totalPrice,
                paymentMethod: payRes.data.paymentMethod || 'QR_PROMPTPAY',
                paidAt: payRes.data.paidAt || booking.createdAt,
                shopName: 'FIWDEE MASSAGE & SANCTUARY',
                shopAddress: '123/45 ถนนมิตรภาพ ขอนแก่น 40000',
                shopPhone: '043-241-890',
                isPaid: true,
              })
            }
          }
        } else {
          // Booking has no payment yet (e.g. Counter payment, Confirmed appointment slip)
          if (isMounted) {
            setReceipt({
              receiptNumber: `SLIP-${booking.bookingReferenceCode}`,
              paymentReferenceCode: 'PAY-ON-SITE',
              bookingReferenceCode: booking.bookingReferenceCode,
              customerName: booking.customerName || 'ลูกค้าคนพิเศษ',
              customerPhone: booking.customerPhone || '—',
              serviceName: booking.serviceName,
              durationMinutes: booking.durationMinutes,
              therapistName: booking.therapistName,
              roomNumber: booking.roomNumber,
              serviceStartDateTime: booking.startDateTime,
              grossAmount: booking.totalPrice,
              discountAmount: booking.discountAmount || 0,
              netAmount: booking.netAmount || booking.totalPrice,
              paymentMethod: 'COUNTER',
              paidAt: booking.createdAt,
              shopName: 'FIWDEE MASSAGE & SANCTUARY',
              shopAddress: '123/45 ถนนมิตรภาพ ขอนแก่น 40000',
              shopPhone: '043-241-890',
              isPaid: false,
            })
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorMsg(err.message || (lang === 'th' ? 'เกิดข้อผิดพลาดในการโหลดใบเสร็จ' : 'Failed to load receipt'))
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchReceipt()

    return () => {
      isMounted = false
    }
  }, [isOpen, booking, lang])

  if (!isOpen || !booking) return null

  const locale = lang === 'th' ? 'th-TH' : 'en-GB'

  const formatMoney = (val) =>
    val != null
      ? `฿${Number(val).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : '฿0.00'

  const formatDateTime = (val) => {
    if (!val) return '—'
    return new Date(val).toLocaleString(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in print:p-0 print:bg-white">
      <div className="relative w-full max-w-xl bg-surface rounded-2xl border border-outline-variant/60 shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh] text-on-surface print:shadow-none print:border-0 print:max-w-none print:p-8">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/40 print:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">receipt_long</span>
            <span className="font-headline-sm text-headline-sm text-primary">
              {t('receipt.title')}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-secondary hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <span className="material-symbols-outlined text-3xl animate-spin text-primary inline-block">
              progress_activity
            </span>
            <p className="text-xs text-secondary">{t('receipt.loading')}</p>
          </div>
        ) : errorMsg ? (
          <div className="py-12 text-center space-y-4">
            <span className="material-symbols-outlined text-4xl text-amber-600 inline-block">
              info
            </span>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm mx-auto">{errorMsg}</p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-surface-container text-xs font-semibold text-secondary hover:text-primary cursor-pointer"
            >
              {t('receipt.close')}
            </button>
          </div>
        ) : receipt ? (
          <div className="mt-4 space-y-6">
            {/* Shop Header */}
            <div className="text-center pb-5 border-b border-dashed border-outline-variant/60 space-y-1">
              <h3 className="font-headline-md text-headline-md tracking-wider text-primary font-bold">
                {receipt.shopName || 'FIWDEE MASSAGE'}
              </h3>
              <p className="text-[11px] text-secondary">
                {receipt.shopAddress || '123/45 Sukhumvit Rd., Bangkok 10110'}
              </p>
              <p className="text-[11px] text-secondary">
                {t('receipt.tel')}: {receipt.shopPhone || '02-123-4567'}
              </p>
              <div className="pt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                  receipt.isPaid
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {receipt.isPaid ? t('receipt.paidStatus') : t('receipt.unpaidStatus')}
                </span>
              </div>
            </div>

            {/* Receipt Metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
              <div>
                <span className="text-[10px] uppercase text-secondary tracking-wider block">
                  {t('receipt.number')}
                </span>
                <span className="font-semibold text-on-surface font-mono">
                  {receipt.receiptNumber}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase text-secondary tracking-wider block">
                  {t('receipt.date')}
                </span>
                <span className="font-medium text-on-surface">
                  {formatDateTime(receipt.paidAt)}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-secondary tracking-wider block">
                  {t('receipt.refCode')}
                </span>
                <span className="font-medium text-secondary">
                  {receipt.bookingReferenceCode}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase text-secondary tracking-wider block">
                  {t('receipt.paymentMethod')}
                </span>
                <span className="font-medium text-on-surface">
                  {receipt.paymentMethod === 'COUNTER'
                    ? t('receipt.payAtCounter')
                    : (receipt.paymentMethod || 'QR_PROMPTPAY')}
                </span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="text-xs space-y-2 border-b border-outline-variant/40 pb-4">
              <div className="flex justify-between font-semibold text-secondary pb-1 border-b border-outline-variant/30 text-[11px]">
                <span>{t('receipt.description')}</span>
                <span>{t('receipt.amount')}</span>
              </div>

              <div className="flex justify-between py-1.5">
                <div>
                  <span className="font-semibold text-on-surface block">
                    {receipt.serviceName}
                  </span>
                  <span className="text-[11px] text-secondary">
                    {receipt.durationMinutes} {t('history.minutes')} ·{' '}
                    {receipt.therapistName || t('history.noTherapist')} (
                    {receipt.roomNumber || '—'})
                  </span>
                </div>
                <span className="font-medium text-on-surface">
                  {formatMoney(receipt.grossAmount)}
                </span>
              </div>

              {receipt.discountAmount && Number(receipt.discountAmount) > 0 ? (
                <div className="flex justify-between py-1 text-emerald-700 font-medium">
                  <span>{t('receipt.discount')}</span>
                  <span>-{formatMoney(receipt.discountAmount)}</span>
                </div>
              ) : null}
            </div>

            {/* Summary Totals */}
            <div className="space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-secondary">
                <span>{t('receipt.subtotal')}</span>
                <span>{formatMoney(receipt.grossAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm sm:text-base text-primary pt-2 border-t border-outline-variant/50">
                <span>{receipt.isPaid ? t('receipt.totalPaid') : t('receipt.totalEstimated')}</span>
                <span>{formatMoney(receipt.netAmount)}</span>
              </div>
            </div>

            {/* Footer Note */}
            <div className="text-center text-[10px] text-secondary/80 pt-4 border-t border-dashed border-outline-variant/40">
              <p>{t('receipt.thankYou')}</p>
              <p className="mt-0.5">{t('receipt.vatNotice')}</p>
            </div>

            {/* Buttons (Hidden in Print) */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/40 print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary/5 text-xs font-semibold cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-base">print</span>
                <span>{t('receipt.print')}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-full bg-primary text-on-primary text-xs font-semibold hover:opacity-90 cursor-pointer transition-opacity"
              >
                {t('receipt.close')}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
