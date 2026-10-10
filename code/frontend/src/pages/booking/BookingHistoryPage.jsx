import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { useLanguage } from '../../i18n/useLanguage.js'
import BookingReviewModal from './components/BookingReviewModal.jsx'
import BookingReceiptModal from './components/BookingReceiptModal.jsx'

// สี badge ตามสถานะการจอง (BookingStatus 7 ค่าจาก backend)
const STATUS_BADGE_STYLES = {
  PENDING: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-sky-100 text-sky-800',
  CHECKED_IN: 'bg-teal-100 text-teal-800',
  IN_SERVICE: 'bg-violet-100 text-violet-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-700',
  NO_SHOW: 'bg-neutral-200 text-neutral-600',
}

export default function BookingHistoryPage({ onNavigate }) {
  const { t, lang } = useLanguage()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  // Interactive Action Modals
  const [cancellingBooking, setCancellingBooking] = useState(null)
  const [cancellingLoading, setCancellingLoading] = useState(false)
  const [cancelError, setCancelError] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  const [activeReviewBooking, setActiveReviewBooking] = useState(null)
  const [activeReceiptBooking, setActiveReceiptBooking] = useState(null)
  const [reviewedIds, setReviewedIds] = useState(new Set())

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const loadBookings = async () => {
    setLoading(true)
    setLoadError(false)
    const res = await api.get('/bookings/my')
    if (!res.success || !Array.isArray(res.data)) {
      setLoading(false)
      setLoadError(true)
      return
    }
    setBookings(res.data)
    setLoading(false)
  }

  useEffect(() => {
    loadBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const locale = lang === 'th' ? 'th-TH' : 'en-GB'

  const formatDateTime = (value) => {
    if (!value) return '—'
    return new Date(value).toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (value) =>
    value != null
      ? `฿${Number(value).toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
      : '—'

  const statusLabel = (status) => t(`history.status.${status}`)
  const statusStyle = (status) => STATUS_BADGE_STYLES[status] || 'bg-neutral-200 text-neutral-600'

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return
    setCancellingLoading(true)
    setCancelError(null)

    try {
      const res = await api.patch(`/bookings/${cancellingBooking.id}/cancel`)
      if (res && res.success) {
        showToast(t('history.cancelSuccess'))
        // Update local state to CANCELLED
        setBookings((prev) =>
          prev.map((b) => (b.id === cancellingBooking.id ? { ...b, status: 'CANCELLED' } : b))
        )
        setCancellingBooking(null)
      } else {
        setCancelError(res?.message || t('history.cancelFailed'))
      }
    } catch (err) {
      setCancelError(err.message || t('history.cancelFailed'))
    } finally {
      setCancellingLoading(false)
    }
  }

  const handleReviewSubmitted = (bookingId) => {
    setReviewedIds((prev) => new Set([...prev, bookingId]))
    showToast(t('review.success'))
  }

  const headerCellClass =
    'px-4 py-3 font-label-caps text-label-caps uppercase tracking-wider text-secondary whitespace-nowrap'
  const bodyCellClass = 'px-4 py-3.5 font-body-md text-body-md text-on-surface align-middle'

  return (
    <main className="w-full pt-20 bg-surface min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-6xl mx-auto px-6 py-space-lg md:py-space-xl">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-24 right-6 z-50 p-4 bg-primary text-on-primary rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in text-xs font-semibold">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center gap-space-xs text-secondary mb-space-lg font-label-caps uppercase tracking-widest text-label-caps">
          <button
            type="button"
            onClick={() => onNavigate?.('home')}
            className="inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>{t('history.backToHome')}</span>
          </button>
          <span>—</span>
          <span className="text-primary font-semibold">{t('history.title')}</span>
        </div>

        {/* Heading */}
        <div className="space-y-space-xs mb-space-lg">
          <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest block">
            {t('history.eyebrow')}
          </span>
          <h1 className="font-headline-lg text-headline-lg text-primary">{t('history.title')}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">{t('history.subtitle')}</p>
        </div>

        {loading ? (
          <div className="p-space-xl rounded-xl bg-surface-container-low font-body-md text-body-md text-on-surface-variant text-center">
            <span className="material-symbols-outlined text-3xl animate-spin inline-block">progress_activity</span>
          </div>
        ) : loadError ? (
          <div className="p-space-xl rounded-xl bg-surface-container-low text-center space-y-space-md">
            <p className="font-body-md text-body-md text-on-surface-variant">{t('history.errLoading')}</p>
            <button
              type="button"
              onClick={loadBookings}
              className="px-6 py-2.5 rounded-full bg-primary text-surface font-label-md text-label-md uppercase cursor-pointer hover:opacity-90 transition-opacity"
            >
              {t('history.retry')}
            </button>
          </div>
        ) : bookings.length === 0 ? (
          /* Empty state */
          <div className="p-space-xl rounded-xl bg-surface-container-low text-center space-y-space-md">
            <span className="material-symbols-outlined text-5xl text-secondary/60 inline-block">spa</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">{t('history.empty')}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">{t('history.emptyDesc')}</p>
            <button
              type="button"
              onClick={() => onNavigate?.('booking')}
              className="inline-flex items-center gap-1.5 px-space-lg py-3 rounded-full bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider cursor-pointer hover:opacity-90 transition-opacity"
            >
              {t('history.emptyCta')}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        ) : (
          <>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              {t('history.count', { n: bookings.length })}
            </p>

            {/* ตารางประวัติการจอง (เลื่อนแนวนอนได้บนจอเล็ก) */}
            <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low overflow-x-auto shadow-xs">
              <table className="w-full min-w-[960px] text-left">
                <thead>
                  <tr className="border-b border-outline-variant/60 bg-surface-container">
                    <th scope="col" className={headerCellClass}>{t('history.refCode')}</th>
                    <th scope="col" className={headerCellClass}>{t('history.service')}</th>
                    <th scope="col" className={headerCellClass}>{t('history.when')}</th>
                    <th scope="col" className={headerCellClass}>{t('history.therapist')}</th>
                    <th scope="col" className={headerCellClass}>{t('history.room')} · {t('history.duration')}</th>
                    <th scope="col" className={`${headerCellClass} text-right`}>{t('history.total')}</th>
                    <th scope="col" className={headerCellClass}>{t('history.statusHeader')}</th>
                    <th scope="col" className={`${headerCellClass} text-center`}>{t('history.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const isCancellable = booking.status === 'PENDING' || booking.status === 'CONFIRMED'
                    const isCompleted = booking.status === 'COMPLETED'
                    const isReviewed = reviewedIds.has(booking.id)
                    const canViewReceipt = booking.status !== 'CANCELLED'

                    return (
                      <tr
                        key={booking.id}
                        className="border-b border-outline-variant/30 last:border-0 hover:bg-surface-container/70 transition-colors"
                      >
                        <td className={`${bodyCellClass} font-label-caps text-label-caps tracking-wider text-secondary whitespace-nowrap`}>
                          {booking.bookingReferenceCode}
                        </td>
                        <td className={`${bodyCellClass} font-semibold`}>
                          {booking.serviceName || '—'}
                        </td>
                        <td className={`${bodyCellClass} whitespace-nowrap`}>
                          {formatDateTime(booking.startDateTime)}
                        </td>
                        <td className={bodyCellClass}>
                          {booking.therapistName || (
                            <span className="text-on-surface-variant">{t('history.noTherapist')}</span>
                          )}
                        </td>
                        <td className={`${bodyCellClass} whitespace-nowrap`}>
                          {booking.roomNumber || '—'} · {t('history.durationMinutes', { n: booking.durationMinutes })}
                        </td>
                        <td className={`${bodyCellClass} text-right font-semibold whitespace-nowrap`}>
                          {booking.discountAmount && Number(booking.discountAmount) > 0 ? (
                            <div className="inline-flex items-baseline justify-end gap-1.5">
                              <span className="text-on-surface font-semibold text-sm">
                                {formatPrice(booking.netAmount ?? booking.totalPrice)}
                              </span>
                              <span className="text-[11px] text-on-surface-variant/60 line-through font-normal tabular-nums">
                                {formatPrice(booking.totalPrice)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-on-surface font-semibold text-sm">
                              {formatPrice(booking.netAmount ?? booking.totalPrice)}
                            </span>
                          )}
                        </td>
                        <td className={bodyCellClass}>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full font-label-caps text-label-caps uppercase tracking-wider ${statusStyle(booking.status)}`}
                          >
                            {statusLabel(booking.status)}
                          </span>
                        </td>
                        <td className={`${bodyCellClass} text-center whitespace-nowrap`}>
                          <div className="inline-flex items-center gap-1.5">
                            {/* Receipt Button */}
                            {canViewReceipt && (
                              <button
                                type="button"
                                onClick={() => setActiveReceiptBooking(booking)}
                                className="px-2.5 py-1 rounded-lg border border-outline-variant/80 hover:border-primary text-secondary hover:text-primary text-xs font-medium cursor-pointer transition-colors"
                                title={t('history.receiptBtn')}
                              >
                                {t('history.receiptBtn')}
                              </button>
                            )}

                            {/* Review Button for COMPLETED */}
                            {isCompleted && (
                              <button
                                type="button"
                                disabled={isReviewed}
                                onClick={() => setActiveReviewBooking(booking)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                                  isReviewed
                                    ? 'bg-neutral-100 text-neutral-400 cursor-default'
                                    : 'bg-primary/10 text-primary hover:bg-primary hover:text-on-primary'
                                }`}
                              >
                                {isReviewed ? t('history.reviewed') : t('history.reviewBtn')}
                              </button>
                            )}

                            {/* Cancel Button for PENDING or CONFIRMED */}
                            {isCancellable && (
                              <button
                                type="button"
                                onClick={() => setCancellingBooking(booking)}
                                className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium cursor-pointer transition-colors"
                              >
                                {t('history.cancelBtn')}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-surface rounded-2xl border border-outline-variant/60 shadow-xl p-6 text-on-surface space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <span className="material-symbols-outlined text-2xl">warning</span>
              <h3 className="font-headline-sm text-headline-sm font-semibold">
                {t('history.cancelConfirmTitle')}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-on-surface-variant">
              {t('history.cancelConfirmDesc', { ref: cancellingBooking.bookingReferenceCode })}
            </p>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs leading-relaxed">
              {t('history.cancelPolicyNotice')}
            </div>

            {cancelError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                {cancelError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={cancellingLoading}
                onClick={() => {
                  setCancellingBooking(null)
                  setCancelError(null)
                }}
                className="px-4 py-2 rounded-full border border-outline-variant text-xs font-medium text-secondary hover:bg-surface-container cursor-pointer transition-colors"
              >
                {t('review.cancel')}
              </button>
              <button
                type="button"
                disabled={cancellingLoading}
                onClick={handleConfirmCancel}
                className="px-5 py-2 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700 cursor-pointer transition-colors disabled:opacity-50"
              >
                {cancellingLoading ? '...' : t('history.confirmCancelBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {activeReviewBooking && (
        <BookingReviewModal
          isOpen={Boolean(activeReviewBooking)}
          onClose={() => setActiveReviewBooking(null)}
          booking={activeReviewBooking}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {/* Receipt Modal */}
      {activeReceiptBooking && (
        <BookingReceiptModal
          isOpen={Boolean(activeReceiptBooking)}
          onClose={() => setActiveReceiptBooking(null)}
          booking={activeReceiptBooking}
        />
      )}
    </main>
  )
}
