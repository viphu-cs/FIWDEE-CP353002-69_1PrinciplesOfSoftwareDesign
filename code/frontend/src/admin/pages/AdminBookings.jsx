import React, { useCallback, useEffect, useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import StatusBadge from '../components/StatusBadge.jsx'
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
      const res = await api.patch(`/bookings/${bookingId}/status?status=${newStatus}`)
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
                <th className="py-3.5 px-4">{lang === 'th' ? 'สถานะ' : 'Status'}</th>
                <th className="py-3.5 px-4 text-right">{lang === 'th' ? 'เปลี่ยนสถานะ (State)' : 'Action'}</th>
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
                        <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {b.paymentStatus === 'PAID' ? t('admin.paymentPaid') : t('admin.paymentUnpaid')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={b.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {nextStatuses.length > 0 ? (
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {nextStatuses.map((st) => (
                              <button
                                key={st}
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus(b.id, st)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                  st === 'CONFIRMED'
                                    ? 'bg-secondary-container text-secondary hover:bg-secondary hover:text-warm-ivory'
                                    : st === 'CHECKED_IN'
                                    ? 'bg-teak-dark text-on-primary hover:bg-teak-deep'
                                    : st === 'IN_SERVICE'
                                    ? 'bg-emerald-800 text-warm-ivory hover:bg-emerald-900'
                                    : st === 'COMPLETED'
                                    ? 'bg-teak-deep text-warm-ivory hover:bg-wood-deep'
                                    : 'bg-surface-container text-charcoal-muted hover:bg-rose-50 hover:text-rose-700'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-charcoal-muted italic">Closed</span>
                        )}
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
    </div>
  )
}
