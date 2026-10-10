import React, { useCallback, useEffect, useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import StatusBadge from '../components/StatusBadge.jsx'
import RefundModal from '../components/RefundModal.jsx'
import PaymentCollectModal from '../components/PaymentCollectModal.jsx'
import { api } from '../../lib/api.js'

export default function AdminBookings() {
  const { bookings: fallbackBookings, setBookings } = useAdminAuth()
  const { lang, t } = useLanguage()

  const [realBookings, setRealBookings] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const [refundTargetBooking, setRefundTargetBooking] = useState(null)
  const [paymentTargetBooking, setPaymentTargetBooking] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('size', '10')
    if (statusFilter !== 'ALL') {
      params.set('status', statusFilter)
    }
    if (search.trim()) {
      params.set('search', search.trim())
    }

    try {
      const res = await api.get(`/admin/bookings?${params.toString()}`)
      if (res.success && res.data) {
        setRealBookings(res.data.content || [])
        setTotalPages(res.data.totalPages || 1)
      } else {
        // Fallback to local context state
        setRealBookings(fallbackBookings)
      }
    } catch {
      setRealBookings(fallbackBookings)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, search, fallbackBookings])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings()
    }, 250)
    return () => clearTimeout(timer)
  }, [fetchBookings])

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setUpdatingId(bookingId)
    try {
      let res
      if (newStatus === 'CHECKED_IN') {
        // Call FrontDeskController to register arrival in queue system
        res = await api.patch(`/bookings/${bookingId}/check-in`)
        if (!res.success) {
          // Fallback to generic status update
          res = await api.patch(`/bookings/${bookingId}/status?status=${newStatus}`)
        }
      } else {
        res = await api.patch(`/bookings/${bookingId}/status?status=${newStatus}`)
      }

      if (res.success) {
        showToast(lang === 'th' ? `อัปเดตสถานะการจองเป็น ${newStatus} สำเร็จ` : `Updated status to ${newStatus}`)
        fetchBookings()
      } else {
        // Fallback update in state
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
        setRealBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
        showToast(res.message || 'Status updated locally')
      }
    } catch {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
      setRealBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
    } finally {
      setUpdatingId(null)
    }
  }

  const formatDateTime = (dtStr) => {
    if (!dtStr) return '-'
    try {
      const d = new Date(dtStr)
      return new Intl.DateTimeFormat(lang === 'th' ? 'th-TH' : 'en-US', {
        dateStyle: 'short',
        timeStyle: 'short'
      }).format(d)
    } catch {
      return dtStr
    }
  }

  // GoF State Pattern allowed next transitions:
  const getNextStatuses = (currentStatus) => {
    switch (currentStatus) {
      case 'PENDING':
        return ['CONFIRMED', 'CANCELLED']
      case 'CONFIRMED':
        return ['CHECKED_IN', 'CANCELLED', 'NO_SHOW']
      case 'CHECKED_IN':
        return ['IN_SERVICE', 'CANCELLED']
      case 'IN_SERVICE':
        return ['COMPLETED']
      default:
        return []
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING':
        return lang === 'th' ? 'รอยืนยัน' : 'Pending'
      case 'CONFIRMED':
        return lang === 'th' ? 'ยืนยันแล้ว' : 'Confirmed'
      case 'CHECKED_IN':
        return lang === 'th' ? 'เช็คอินแล้ว' : 'Checked In'
      case 'IN_SERVICE':
        return lang === 'th' ? 'กำลังให้บริการ' : 'In Service'
      case 'COMPLETED':
        return lang === 'th' ? 'เสร็จสิ้น' : 'Completed'
      case 'CANCELLED':
        return lang === 'th' ? 'ยกเลิก' : 'Cancelled'
      case 'NO_SHOW':
        return lang === 'th' ? 'ไม่มาตามนัด' : 'No Show'
      default:
        return status
    }
  }

  const handleStatusChange = async (booking, newStatus) => {
    if (!newStatus || newStatus === booking.status) return

    // Strict validation: check if transition is allowed by State Machine
    const allowed = getNextStatuses(booking.status)
    if (!allowed.includes(newStatus)) {
      showToast(lang === 'th' ? `ไม่อนุญาตให้เปลี่ยนสถานะจาก ${booking.status} ไปเป็น ${newStatus}` : `Invalid transition from ${booking.status} to ${newStatus}`)
      return
    }

    // Invariant Guard: If trying to complete, must be paid first
    if (newStatus === 'COMPLETED') {
      const isPaid = booking.paymentStatus === 'PAID' || booking.paymentStatus === 'COMPLETED'
      if (!isPaid) {
        showToast(t('admin.cannotCompleteUnpaid'))
        setPaymentTargetBooking(booking)
        return
      }
    }

    // Confirm prompt for cancellation
    if (newStatus === 'CANCELLED') {
      const confirmMsg = t('admin.confirmCancelBooking', { ref: booking.bookingReferenceCode || booking.id })
      if (!window.confirm(confirmMsg)) return
    }

    await handleUpdateStatus(booking.id, newStatus)
  }

  const statusOptions = ['ALL', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_SERVICE', 'COMPLETED', 'CANCELLED', 'NO_SHOW']

  return (
    <div className="space-y-6 text-on-surface font-body-md">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-semibold text-teak-dark">
            {t('admin.bookings')}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
            {lang === 'th'
              ? 'ค้นหา ตรวจสอบสถานะการชำระเงิน และอัปเดตสถานะการจองตาม GoF State Pattern'
              : 'Manage customer reservations, payments, and GoF State Machine lifecycle'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface rounded-2xl p-4 border border-outline-variant shadow-[var(--admin-shadow-sm)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* State filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {statusOptions.map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st)
                setPage(0)
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                statusFilter === st
                  ? 'bg-teak-dark text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {st === 'ALL' ? (lang === 'th' ? 'ทั้งหมด' : 'All') : st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder={t('admin.searchBookingPlaceholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-xs placeholder:text-charcoal-muted hover:border-wood-deep focus:bg-surface"
          />
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="absolute left-3 top-3 text-charcoal-muted">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-surface rounded-2xl border border-outline-variant shadow-[var(--admin-shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left border-collapse">
            <thead>
              <tr className="bg-teak-deep text-warm-ivory text-xs uppercase tracking-wider font-semibold border-b border-wood-deep/30">
                <th className="py-3.5 px-4">{lang === 'th' ? 'รหัสการจอง' : 'Ref Code'}</th>
                <th className="py-3.5 px-4">{t('admin.customerName')}</th>
                <th className="py-3.5 px-4">{t('admin.service')}</th>
                <th className="py-3.5 px-4">{lang === 'th' ? 'วัน - เวลา' : 'Schedule'}</th>
                <th className="py-3.5 px-4">{t('admin.therapist')} / {t('admin.room')}</th>
                <th className="py-3.5 px-4">{t('admin.paymentStatus')}</th>
                <th className="py-3.5 px-4">{lang === 'th' ? 'สถานะการจอง (State)' : 'Booking Status'}</th>
                <th className="py-3.5 px-4 text-right">{lang === 'th' ? 'การดำเนินการ' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-xs text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-charcoal-muted">
                    {lang === 'th' ? 'กำลังโหลดข้อมูลการจอง...' : 'Loading bookings...'}
                  </td>
                </tr>
              ) : realBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-charcoal-muted">
                    {t('admin.noMatchingRecords')}
                  </td>
                </tr>
              ) : (
                realBookings.map((b) => {
                  const nextStatuses = getNextStatuses(b.status)
                  const isUpdating = updatingId === b.id
                  const isTerminal = ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(b.status)

                  return (
                    <tr key={b.id || b.bookingReferenceCode} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-3.5 px-4 font-bold font-headline text-teak-dark">
                        {b.bookingReferenceCode || b.id}
                        <div className="text-[10px] font-normal text-charcoal-muted">{b.bookingChannel || b.channel || 'ONLINE'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-teak-dark">{b.customerName}</div>
                        <div className="text-charcoal-muted text-[11px]">{b.customerPhone || b.phone || '-'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-on-surface">{b.serviceName}</div>
                        <div className="text-charcoal-muted text-[11px]">{b.durationMinutes} {t('admin.minuteShort')}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-on-surface font-medium">{formatDateTime(b.startDateTime) || `${b.date} ${b.time}`}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-on-surface font-medium">{b.therapistName || (lang === 'th' ? 'รอจัดหมอนวด' : 'Unassigned')}</div>
                        <div className="text-secondary font-semibold text-[11px]">{b.roomNumber || b.roomNo || '-'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-teak-dark">฿{Number(b.totalPrice || b.price || 0).toLocaleString()}</div>
                        {(() => {
                          const isPaid = b.paymentStatus === 'PAID' || b.paymentStatus === 'COMPLETED'
                          const isRefunded = b.paymentStatus === 'REFUNDED'

                          if (isPaid) {
                            return (
                              <div>
                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  {t('admin.paymentPaid')}
                                </span>
                                {b.paymentMethod && (
                                  <div className="text-[10px] text-charcoal-muted mt-0.5 font-medium">{b.paymentMethod}</div>
                                )}
                              </div>
                            )
                          }

                          if (isRefunded) {
                            return (
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 text-rose-800 border border-rose-200">
                                {t('admin.paymentRefunded')}
                              </span>
                            )
                          }

                          return (
                            <div className="space-y-1">
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                                {t('admin.paymentUnpaid')}
                              </span>
                              {b.status !== 'CANCELLED' && b.status !== 'NO_SHOW' && (
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => setPaymentTargetBooking(b)}
                                    className="px-2 py-0.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-warm-ivory text-[10px] font-semibold cursor-pointer shadow-xs transition-colors"
                                  >
                                    {t('admin.collectPayment')}
                                  </button>
                                </div>
                              )}
                            </div>
                          )
                        })()}
                      </td>
                      <td className="py-3.5 px-4">
                        {isTerminal ? (
                          <div className="inline-flex items-center gap-1.5">
                            <StatusBadge status={b.status} size="sm" />
                            <span className="text-[10px] text-charcoal-muted italic">({t('admin.closedLifecycle')})</span>
                          </div>
                        ) : (
                          <div className="relative inline-block min-w-[145px]">
                            <select
                              value={b.status}
                              disabled={isUpdating}
                              onChange={(e) => handleStatusChange(b, e.target.value)}
                              aria-label={t('admin.changeStatus')}
                              className={`w-full appearance-none pl-2.5 pr-7 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-teak-dark/30 ${
                                b.status === 'PENDING' ? 'bg-amber-50 text-amber-900 border-amber-300' :
                                b.status === 'CONFIRMED' ? 'bg-sky-50 text-sky-900 border-sky-300' :
                                b.status === 'CHECKED_IN' ? 'bg-stone-100 text-stone-800 border-stone-300' :
                                b.status === 'IN_SERVICE' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' :
                                'bg-surface-container text-on-surface border-outline-variant'
                              }`}
                            >
                              <option value={b.status} disabled>
                                ● {getStatusLabel(b.status)} ({t('admin.currentStatus')})
                              </option>
                              {nextStatuses.map((st) => (
                                <option key={st} value={st} className="bg-surface text-on-surface">
                                  → {getStatusLabel(st)}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-charcoal-muted">
                              {isUpdating ? (
                                <span className="text-[10px] animate-spin">⏳</span>
                              ) : (
                                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {b.status === 'CANCELLED' && (
                            <button
                              type="button"
                              onClick={() => setRefundTargetBooking(b)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
                            >
                              {lang === 'th' ? 'คืนเงิน (Refund)' : 'Refund'}
                            </button>
                          )}
                          {b.status === 'COMPLETED' && (
                            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                              <span>✓</span> {lang === 'th' ? 'เสร็จสมบูรณ์' : 'Completed'}
                            </span>
                          )}
                          {b.status === 'NO_SHOW' && (
                            <span className="text-[11px] text-rose-600 font-medium">
                              {lang === 'th' ? 'ไม่ปรากฏตัว' : 'No Show'}
                            </span>
                          )}
                          {!isTerminal && (
                            <span className="text-[11px] text-charcoal-muted">
                              {lang === 'th' ? 'เลือกสถานะในช่องทางซ้าย' : 'Select next state'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-outline-variant bg-surface-container-low flex items-center justify-between">
            <span className="text-xs text-charcoal-muted">
              {lang === 'th' ? `หน้า ${page + 1} จาก ${totalPages}` : `Page ${page + 1} of ${totalPages}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-xs font-semibold disabled:opacity-40 cursor-pointer"
              >
                ← {lang === 'th' ? 'ก่อนหน้า' : 'Previous'}
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-xs font-semibold disabled:opacity-40 cursor-pointer"
              >
                {lang === 'th' ? 'ถัดไป' : 'Next'} →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {refundTargetBooking && (
        <RefundModal
          isOpen={Boolean(refundTargetBooking)}
          onClose={() => setRefundTargetBooking(null)}
          booking={refundTargetBooking}
          onRefundProcessed={() => {
            showToast(lang === 'th' ? 'ทำเรื่องคืนเงินสำเร็จ' : 'Refund processed successfully')
            fetchBookings()
          }}
        />
      )}

      {/* Payment Collection Modal */}
      {paymentTargetBooking && (
        <PaymentCollectModal
          isOpen={Boolean(paymentTargetBooking)}
          onClose={() => setPaymentTargetBooking(null)}
          booking={paymentTargetBooking}
          onPaymentProcessed={() => {
            showToast(t('admin.paymentSuccess'))
            fetchBookings()
          }}
        />
      )}
    </div>
  )
}
