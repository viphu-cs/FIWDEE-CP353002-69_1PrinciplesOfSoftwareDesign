import { useState } from 'react'
import { api } from '../../../lib/api.js'
import { useLanguage } from '../../../i18n/useLanguage.js'

export default function BookingReviewModal({ isOpen, onClose, booking, onReviewSubmitted }) {
  const { t, lang } = useLanguage()
  const [overallRating, setOverallRating] = useState(5)
  const [therapistRating, setTherapistRating] = useState(5)
  const [cleanlinessRating, setCleanlinessRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  if (!isOpen || !booking) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg(null)

    const payload = {
      overallRating,
      therapistRating,
      cleanlinessRating,
      comment: comment.trim() || undefined,
    }

    try {
      const res = await api.post(`/bookings/${booking.id}/review`, payload)
      if (res && res.success) {
        onReviewSubmitted?.(booking.id, res.data)
        onClose()
      } else {
        setErrorMsg(res?.message || (lang === 'th' ? 'ไม่สามารถส่งรีวิวได้' : 'Failed to submit review'))
      }
    } catch (err) {
      setErrorMsg(err.message || (lang === 'th' ? 'เกิดข้อผิดพลาดในการเชื่อมต่อ' : 'Network error'))
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating, setRating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer focus:outline-hidden"
            aria-label={`${star} star`}
          >
            <span
              className={`material-symbols-outlined text-2xl ${
                star <= rating ? 'fill-current' : 'text-neutral-300'
              }`}
            >
              star
            </span>
          </button>
        ))}
        <span className="text-xs font-semibold text-secondary ml-1.5">{rating} / 5</span>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-surface rounded-2xl border border-outline-variant/60 shadow-xl p-6 sm:p-8 overflow-hidden text-on-surface">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/40">
          <div>
            <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest block">
              {t('review.eyebrow')}
            </span>
            <h2 className="font-headline-sm text-headline-sm text-primary mt-0.5">
              {t('review.title')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-secondary hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Booking Brief */}
        <div className="mt-4 p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs text-on-surface-variant flex items-center justify-between">
          <div>
            <span className="font-semibold text-on-surface block">{booking.serviceName}</span>
            <span className="text-[11px] text-secondary">
              {t('review.therapist')}: {booking.therapistName || t('history.noTherapist')}
            </span>
          </div>
          <span className="font-label-caps text-label-caps tracking-wider text-secondary">
            {booking.bookingReferenceCode}
          </span>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Overall Rating */}
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs sm:text-sm font-semibold text-on-surface">
              {t('review.overallRating')}
            </label>
            {renderStars(overallRating, setOverallRating)}
          </div>

          {/* Therapist Rating */}
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs sm:text-sm font-semibold text-on-surface">
              {t('review.therapistRating')}
            </label>
            {renderStars(therapistRating, setTherapistRating)}
          </div>

          {/* Cleanliness Rating */}
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs sm:text-sm font-semibold text-on-surface">
              {t('review.cleanlinessRating')}
            </label>
            {renderStars(cleanlinessRating, setCleanlinessRating)}
          </div>

          {/* Comment */}
          <div className="space-y-1 pt-2">
            <label className="block text-xs font-semibold text-on-surface">
              {t('review.commentLabel')}
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('review.commentPlaceholder')}
              maxLength={1000}
              className="w-full p-3 rounded-xl border border-outline-variant/60 bg-surface-container-low text-xs sm:text-sm focus:outline-hidden focus:border-primary transition-colors resize-none"
            />
            <span className="text-[10px] text-secondary text-right block">
              {comment.length} / 1000
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/40">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-full border border-outline-variant text-xs font-medium text-secondary hover:bg-surface-container transition-colors cursor-pointer"
            >
              {t('review.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-full bg-primary text-on-primary text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {submitting ? t('review.submitting') : t('review.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
