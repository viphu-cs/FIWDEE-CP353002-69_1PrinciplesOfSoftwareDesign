import React from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'

export default function StatusBadge({ status, size = 'md' }) {
  const { lang, t } = useLanguage()
  let badgeStyle = 'bg-stone-100 text-stone-700 border-stone-200'
  let label = status
  let dotColor = 'bg-stone-400'

  switch (status) {
    // Room Statuses
    case 'AVAILABLE':
      badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
      dotColor = 'bg-emerald-500'
      label = t('admin.available')
      break
    case 'OCCUPIED':
      badgeStyle = 'bg-amber-100/80 text-amber-900 border-amber-300 font-semibold'
      dotColor = 'bg-amber-600 animate-ping-subtle'
      label = t('admin.occupied')
      break
    case 'CLEANING':
      badgeStyle = 'bg-sky-50 text-sky-800 border-sky-200'
      dotColor = 'bg-sky-500'
      label = t('admin.cleaning')
      break
    case 'MAINTENANCE':
      badgeStyle = 'bg-stone-200 text-stone-700 border-stone-300'
      dotColor = 'bg-stone-500'
      label = t('admin.maintenance')
      break

    // Queue / Booking Statuses
    case 'WAITING':
    case 'PENDING':
      badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200/70'
      dotColor = 'bg-amber-500'
      label = t('admin.waiting')
      break
    case 'CONFIRMED':
      badgeStyle = 'bg-teal-50 text-teal-800 border-teal-200'
      dotColor = 'bg-teal-500'
      label = lang === 'th' ? 'ยืนยันแล้ว' : 'Confirmed'
      break
    case 'CHECKED_IN':
      badgeStyle = 'bg-indigo-50 text-indigo-800 border-indigo-200'
      dotColor = 'bg-indigo-500'
      label = t('admin.checkedIn')
      break
    case 'IN_SERVICE':
      badgeStyle = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold'
      dotColor = 'bg-emerald-600'
      label = t('admin.inService')
      break
    case 'COMPLETED':
      badgeStyle = 'bg-stone-100 text-stone-600 border-stone-200'
      dotColor = 'bg-stone-400'
      label = t('admin.completed')
      break
    case 'CANCELLED':
      badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200'
      dotColor = 'bg-rose-500'
      label = t('admin.cancelled')
      break

    // Therapist Statuses
    case 'ON_DUTY':
      badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200'
      dotColor = 'bg-emerald-500'
      label = lang === 'th' ? 'เข้างาน / พร้อมรับคิว' : 'On Duty / Ready'
      break
    case 'BREAK':
      badgeStyle = 'bg-orange-50 text-orange-800 border-orange-200'
      dotColor = 'bg-orange-500'
      label = lang === 'th' ? 'พักผ่อน (Break)' : 'On Break'
      break
    case 'OFF_DUTY':
      badgeStyle = 'bg-stone-100 text-stone-500 border-stone-200'
      dotColor = 'bg-stone-400'
      label = lang === 'th' ? 'ออกกะ / ลางาน' : 'Off Duty'
      break

    // Roles
    case 'OWNER':
      badgeStyle = 'bg-purple-50 text-purple-900 border-purple-200 font-semibold'
      dotColor = 'bg-purple-600'
      label = t('admin.owner')
      break
    case 'RECEPTIONIST':
      badgeStyle = 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
      dotColor = 'bg-amber-600'
      label = t('admin.receptionist')
      break

    default:
      label = status
      break
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs font-medium'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border transition-all ${sizeClasses} ${badgeStyle}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  )
}
