import React, { useState, useEffect } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import StatusBadge from '../components/StatusBadge.jsx'
import { api } from '../../lib/api.js'

export default function AdminTherapistEarnings() {
  const { user, queueItems } = useAdminAuth()
  const { lang } = useLanguage()
  const [reportLoading, setReportLoading] = useState(false)
  const [commissionSummary, setCommissionSummary] = useState(null)

  const therapistName = user?.name || ''
  const therapistId = user?.id || 1

  useEffect(() => {
    let isMounted = true
    setReportLoading(true)

    api.get('/admin/reports/commissions')
      .then((res) => {
        if (isMounted && res.success && res.data && Array.isArray(res.data.therapistSummaries)) {
          const match = res.data.therapistSummaries.find(
            (t) => t.therapistId === therapistId || (t.therapistName && therapistName.includes(t.therapistName))
          )
          if (match) {
            setCommissionSummary(match)
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setReportLoading(false)
      })

    return () => { isMounted = false }
  }, [therapistId, therapistName])

  // Fallback calculation from local state
  const myCompletedJobs = queueItems.filter(q => {
    if (!q.therapistName) return false
    const matchName = therapistName.includes(q.therapistName) || q.therapistName.includes(therapistName)
    return matchName && q.status === 'COMPLETED'
  })

  const COMMISSION_RATE = commissionSummary?.commissionRate ? Number(commissionSummary.commissionRate) : 0.40
  const totalServiceSales = commissionSummary
    ? Number(commissionSummary.totalServiceRevenue || 0)
    : myCompletedJobs.reduce((sum, q) => sum + (q.price || 0), 0)

  const totalCommission = commissionSummary
    ? Number(commissionSummary.commissionEarned || 0)
    : Math.round(totalServiceSales * COMMISSION_RATE)

  const completedCount = commissionSummary
    ? Number(commissionSummary.completedServicesCount || 0)
    : myCompletedJobs.length

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
            ? 'สรุปจำนวนรอบการให้บริการ ค่ามือ และค่าคอมมิชชันสะสมของตนเองตามรายงานระบบจริง'
            : 'Track your completed services, service revenues, and personal commission payout based on real reports'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-2xl border border-outline-variant p-5 shadow-[var(--admin-shadow-sm)]">
          <div className="text-xs font-semibold text-charcoal-muted uppercase">
            {lang === 'th' ? `ค่าคอมมิชชันสะสม (${Math.round(COMMISSION_RATE * 100)}%)` : 'Estimated Commission'}
          </div>
          <div className="text-3xl font-headline font-bold text-teak-dark mt-1">
            ฿{totalCommission.toLocaleString()}
          </div>
          <div className="text-[11px] text-charcoal-muted mt-1">
            {lang === 'th' ? `คำนวณจาก ${Math.round(COMMISSION_RATE * 100)}% ของยอดค่าบริการ` : `Calculated at ${Math.round(COMMISSION_RATE * 100)}% standard rate`}
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
            {lang === 'th' ? 'ยอดค่าบริการก่อนหักส่วนแบ่ง' : 'Gross revenue generated'}
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-outline-variant p-5 shadow-[var(--admin-shadow-sm)]">
          <div className="text-xs font-semibold text-charcoal-muted uppercase">
            {lang === 'th' ? 'จำนวนงานที่เสร็จสิ้น' : 'Completed Sessions'}
          </div>
          <div className="text-3xl font-headline font-bold text-teak-dark mt-1">
            {completedCount} {lang === 'th' ? 'รอบ' : 'jobs'}
          </div>
          <div className="text-[11px] text-charcoal-muted mt-1">
            {lang === 'th' ? 'คิดเป็นเฉลี่ย 1.5 ชม./รอบ' : 'Avg. 1.5 hrs / job'}
          </div>
        </div>
      </div>

      {/* Job breakdown */}
      <div className="bg-surface rounded-2xl border border-outline-variant shadow-[var(--admin-shadow-sm)] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-teak-deep uppercase tracking-wider">
            {lang === 'th' ? 'รายการงานที่คำนวณค่ามือ' : 'Service Commission Breakdown'}
          </h2>
          <span className="text-xs text-charcoal-muted">
            {lang === 'th' ? 'อัตราส่วนแบ่ง: ' : 'Payout Share: '}
            <strong className="text-teak-dark">{Math.round(COMMISSION_RATE * 100)}%</strong>
          </span>
        </div>

        {myCompletedJobs.length === 0 && !commissionSummary ? (
          <div className="p-8 text-center text-charcoal-muted text-xs">
            {lang === 'th' ? 'ยังไม่มีรอบงานที่เสร็จสิ้นสำหรับคำนวณค่าคอมมิชชันในวันนี้' : 'No completed jobs recorded yet'}
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/60">
            {myCompletedJobs.map((q) => {
              const myPay = Math.round((q.price || 0) * COMMISSION_RATE)
              return (
                <div key={q.queueNo} className="py-3 flex items-center justify-between text-xs hover:bg-surface-container-low/50 px-2 rounded-xl transition-colors">
                  <div>
                    <div className="font-semibold text-teak-dark">{q.serviceName}</div>
                    <div className="text-[11px] text-charcoal-muted">{q.customerName} • รหัสคิว {q.queueNo} • {q.time} น.</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-teak-deep">฿{myPay.toLocaleString()}</div>
                    <div className="text-[10px] text-charcoal-muted">{lang === 'th' ? 'จากยอดเต็ม ฿' : 'from ฿'}{(q.price || 0).toLocaleString()}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
