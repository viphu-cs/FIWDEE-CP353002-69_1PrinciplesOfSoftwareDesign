import React from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import StatusBadge from '../components/StatusBadge.jsx'

export default function AdminTherapistEarnings() {
  const { user, queueItems } = useAdminAuth()
  const { lang } = useLanguage()

  const therapistName = user?.name || ''
  const myCompletedJobs = queueItems.filter(q => {
    if (!q.therapistName) return false
    const matchName = therapistName.includes(q.therapistName) || q.therapistName.includes(therapistName)
    return matchName && q.status === 'COMPLETED'
  })

  // Commission standard rate: 40% of service price
  const COMMISSION_RATE = 0.40

  const totalServiceSales = myCompletedJobs.reduce((sum, q) => sum + (q.price || 0), 0)
  const totalCommission = Math.round(totalServiceSales * COMMISSION_RATE)

  return (
    <div className="space-y-6 text-on-surface font-body-md">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-xs font-semibold text-teak-deep mb-2">
          <span>{lang === 'th' ? 'สรุปรายได้หมอนวด:' : 'Earnings for:'}</span>
          <span className="font-bold">{therapistName}</span>
        </div>
        <h1 className="text-2xl font-headline font-semibold text-teak-dark">
          {lang === 'th' ? 'รายได้และค่าคอมมิชชันของฉัน' : 'My Earnings & Commission'}
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
          {lang === 'th'
            ? 'สรุปจำนวนรอบการให้บริการ ค่ามือ และค่าคอมมิชชันสะสมของตนเอง'
            : 'Track your completed services, service revenues, and personal commission payout'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-2xl border border-outline-variant p-5 shadow-[var(--admin-shadow-sm)]">
          <div className="text-xs font-semibold text-charcoal-muted uppercase">
            {lang === 'th' ? 'ค่าคอมมิชชันสะสม (40%)' : 'Estimated Commission'}
          </div>
          <div className="text-3xl font-headline font-bold text-teak-dark mt-1">
            ฿{totalCommission.toLocaleString()}
          </div>
          <div className="text-[11px] text-charcoal-muted mt-1">
            {lang === 'th' ? 'คำนวณจาก 40% ของยอดค่าบริการ' : 'Calculated at 40% standard rate'}
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-outline-variant p-5 shadow-[var(--admin-shadow-sm)]">
          <div className="text-xs font-semibold text-charcoal-muted uppercase">
            {lang === 'th' ? 'ยอดค่าบริการรวม' : 'Total Service Volume'}
          </div>
          <div className="text-3xl font-headline font-bold text-teak-dark mt-1">
            ฿{totalServiceSales.toLocaleString()}
          </div>
          <div className="text-[11px] text-charcoal-muted mt-1">
            {lang === 'th' ? 'ยอดรวมก่อนหักส่วนแบ่ง' : 'Gross booking sales value'}
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-outline-variant p-5 shadow-[var(--admin-shadow-sm)]">
          <div className="text-xs font-semibold text-charcoal-muted uppercase">
            {lang === 'th' ? 'รอบที่ให้บริการเสร็จ' : 'Completed Sessions'}
          </div>
          <div className="text-3xl font-headline font-bold text-teak-dark mt-1">
            {myCompletedJobs.length} <span className="text-xs font-normal text-charcoal-muted">{lang === 'th' ? 'รอบ' : 'sessions'}</span>
          </div>
          <div className="text-[11px] text-charcoal-muted mt-1">
            {lang === 'th' ? 'รอบงานที่มีการบันทึกจบงาน' : 'Successfully completed treatments'}
          </div>
        </div>
      </div>

      {/* List of completed treatments */}
      <div className="bg-surface rounded-2xl border border-outline-variant shadow-[var(--admin-shadow-sm)] overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-teak-dark">
            {lang === 'th' ? 'รายการงานที่ได้รับค่ามือ' : 'Completed Treatment Details'}
          </h2>
          <span className="text-xs text-charcoal-muted">
            {myCompletedJobs.length} {lang === 'th' ? 'รายการ' : 'records'}
          </span>
        </div>

        {myCompletedJobs.length === 0 ? (
          <div className="p-10 text-center text-xs text-charcoal-muted">
            {lang === 'th' ? 'ยังไม่มีประวัติการนวดที่เสร็จสิ้น' : 'No completed treatments recorded yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] text-charcoal-muted uppercase">
                  <th className="py-3 px-4">{lang === 'th' ? 'รหัสคิว' : 'Queue No'}</th>
                  <th className="py-3 px-4">{lang === 'th' ? 'ลูกค้า' : 'Customer'}</th>
                  <th className="py-3 px-4">{lang === 'th' ? 'หัตถการ' : 'Treatment'}</th>
                  <th className="py-3 px-4 text-right">{lang === 'th' ? 'ราคา' : 'Price'}</th>
                  <th className="py-3 px-4 text-right">{lang === 'th' ? 'ค่ามือ (40%)' : 'Commission (40%)'}</th>
                  <th className="py-3 px-4 text-center">{lang === 'th' ? 'สถานะ' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {myCompletedJobs.map((q) => {
                  const comm = Math.round((q.price || 0) * COMMISSION_RATE)
                  return (
                    <tr key={q.queueNo} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-4 font-bold text-teak-dark">{q.queueNo}</td>
                      <td className="py-3 px-4 font-semibold text-on-surface">{q.customerName}</td>
                      <td className="py-3 px-4 text-charcoal-muted">{q.serviceName} ({q.durationMinutes} นาที)</td>
                      <td className="py-3 px-4 text-right font-medium">฿{q.price?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-bold text-teak-dark">฿{comm.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status="COMPLETED" size="sm" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
