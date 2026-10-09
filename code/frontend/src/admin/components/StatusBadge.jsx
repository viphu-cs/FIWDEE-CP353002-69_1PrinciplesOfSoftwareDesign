import React from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'

export default function StatusBadge({ status, size = 'md' }) {
  const { lang, t } = useLanguage()
  let badgeStyle = 'bg-surface-container text-on-surface-variant border-outline-variant/60'
  let label = status
  let dotColor = 'bg-outline'

  switch (status) {
    // Room Statuses
    case 'AVAILABLE':
      badgeStyle = 'bg-stone-100 text-stone-700 border-stone-200'
      dotColor = 'bg-emerald-600'
      label = t('admin.available')
      break
    case 'OCCUPIED':
      badgeStyle = 'bg-stone-100 text-stone-800 border-stone-300 font-medium'
      dotColor = 'bg-amber-600'
      label = t('admin.occupied')
      break
    case 'CLEANING':
      badgeStyle = 'bg-stone-100 text-stone-700 border-stone-200'
      dotColor = 'bg-amber-500'
      label = t('admin.cleaning')
      break
    case 'MAINTENANCE':
      badgeStyle = 'bg-stone-100 text-stone-500 border-stone-200'
      dotColor = 'bg-stone-400'
      label = t('admin.maintenance')
      break

    // Queue / Booking Statuses
    case 'WAITING':
    case 'PENDING':
      badgeStyle = 'bg-amber-50/70 text-amber-900 border-amber-200/60'
      dotColor = 'bg-amber-500'
      label = t('admin.waiting')
      break
    case 'CONFIRMED':
      badgeStyle = 'bg-stone-100 text-stone-700 border-stone-200'
      dotColor = 'bg-stone-600'
      label = lang === 'th' ? 'ยืนยันแล้ว' : 'Confirmed'
      break
    case 'CHECKED_IN':
      badgeStyle = 'bg-stone-100 text-stone-800 border-stone-300 font-medium'
      dotColor = 'bg-stone-600'
      label = t('admin.checkedIn')
      break
    case 'IN_SERVICE':
      badgeStyle = 'bg-emerald-50/80 text-emerald-900 border-emerald-200/80 font-medium'
      dotColor = 'bg-emerald-600'
      label = t('admin.inService')
      break
    case 'COMPLETED':
      badgeStyle = 'bg-stone-100 text-stone-600 border-stone-200'
      dotColor = 'bg-stone-400'
      label = t('admin.completed')
      break
    case 'CANCELLED':
      badgeStyle = 'bg-rose-50 text-rose-800 border-rose-200/80'
      dotColor = 'bg-rose-500'
      label = t('admin.cancelled')
      break

    // Therapist Duty Statuses
    case 'ON_DUTY':
      badgeStyle = 'bg-emerald-50/80 text-emerald-900 border-emerald-200/80 font-medium'
      dotColor = 'bg-emerald-600'
      label = lang === 'th' ? 'เข้างาน / พร้อมรับคิว' : 'On Duty / Ready'
      break
    case 'BREAK':
      badgeStyle = 'bg-amber-50/70 text-amber-900 border-amber-200/60'
      dotColor = 'bg-amber-500'
      label = lang === 'th' ? 'พักผ่อน (Break)' : 'On Break'
      break
    case 'OFF_DUTY':
      badgeStyle = 'bg-stone-100 text-stone-500 border-stone-200'
      dotColor = 'bg-stone-400'
      label = lang === 'th' ? 'ออกกะ / ลางาน' : 'Off Duty'
      break

    // User Session Statuses
    case 'ONLINE':
      badgeStyle = 'bg-emerald-50/80 text-emerald-900 border-emerald-200/80 font-medium'
      dotColor = 'bg-emerald-600'
      label = lang === 'th' ? 'กำลังใช้งาน (Online)' : 'Online'
      break
    case 'OFFLINE':
      badgeStyle = 'bg-stone-100 text-stone-500 border-stone-200'
      dotColor = 'bg-stone-400'
      label = lang === 'th' ? 'ออฟไลน์' : 'Offline'
      break
    case 'SUSPENDED':
      badgeStyle = 'bg-rose-50 text-rose-800 border-rose-200/80'
      dotColor = 'bg-rose-500'
      label = lang === 'th' ? 'ถูกระงับ' : 'Suspended'
      break

    // Roles (Clean, restrained neutral labels — no rainbow pastel explosion)
    case 'OWNER':
      badgeStyle = 'bg-stone-100 text-stone-800 border-stone-300 font-semibold'
      dotColor = 'bg-stone-700'
      label = t('admin.owner')
      break
    case 'RECEPTIONIST':
      badgeStyle = 'bg-stone-100 text-stone-700 border-stone-200 font-medium'
      dotColor = 'bg-stone-500'
      label = t('admin.receptionist')
      break
    case 'THERAPIST':
      badgeStyle = 'bg-stone-100 text-stone-700 border-stone-200 font-medium'
      dotColor = 'bg-stone-500'
      label = lang === 'th' ? 'หมอนวด' : 'Therapist'
      break
    case 'CUSTOMER':
      badgeStyle = 'bg-stone-100 text-stone-600 border-stone-200'
      dotColor = 'bg-stone-400'
      label = lang === 'th' ? 'ลูกค้า' : 'Customer'
      break

    default:
      label = status
      break
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border ${sizeClasses} ${badgeStyle}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span className="leading-tight">{label}</span>
    </span>
  )
}
