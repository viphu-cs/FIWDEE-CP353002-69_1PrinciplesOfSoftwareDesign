import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { useLanguage } from '../../i18n/useLanguage.js'

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

  const headerCellClass =
    'px-4 py-3 font-label-caps text-label-caps uppercase tracking-wider text-secondary whitespace-nowrap'
  const bodyCellClass = 'px-4 py-3.5 font-body-md text-body-md text-on-surface align-middle'

  return (
    <main className="w-full pt-20 bg-surface min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-6xl mx-auto px-6 py-space-lg md:py-space-xl">
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
              <table className="w-full min-w-[880px] text-left">
                <thead>
                  <tr className="border-b border-outline-variant/60 bg-surface-container">
                    <th scope="col" className={headerCellClass}>{t('history.refCode')}</th>
                    <th scope="col" className={headerCellClass}>{t('history.service')}</th>
                    <th scope="col" className={headerCellClass}>{t('history.when')}</th>
                    <th scope="col" className={headerCellClass}>{t('history.therapist')}</th>
                    <th scope="col" className={headerCellClass}>{t('history.room')} · {t('history.duration')}</th>
                    <th scope="col" className={`${headerCellClass} text-right`}>{t('history.total')}</th>
                    <th scope="col" className={headerCellClass}>{t('history.statusHeader')}</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
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
                        {formatPrice(booking.totalPrice)}
                      </td>
                      <td className={bodyCellClass}>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full font-label-caps text-label-caps uppercase tracking-wider ${statusStyle(booking.status)}`}
                        >
                          {statusLabel(booking.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
