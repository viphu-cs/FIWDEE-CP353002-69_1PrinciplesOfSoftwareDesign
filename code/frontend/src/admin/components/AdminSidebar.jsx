import React from 'react'
import StatusBadge from './StatusBadge.jsx'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import { shop } from '../../data/mock.js'

export function getNavLinks(t) {
  const translate = (key, fallback) => (t ? t(`admin.${key}`) : fallback)
  return [
    { key: 'dashboard', label: translate('dashboard', 'แดชบอร์ดภาพรวม'), hash: '#admin/dashboard', iconType: 'dashboard' },
    { key: 'queue', label: translate('queue', 'จัดการคิวสด'), hash: '#admin/queue', badge: '5', iconType: 'queue' },
    { key: 'bookings', label: translate('bookings', 'ตารางการจองนัดหมาย'), hash: '#admin/bookings', iconType: 'bookings' },
    { key: 'rooms', label: translate('rooms', 'ผังห้องนวด (Real-time)'), hash: '#admin/rooms', iconType: 'rooms' },
    { key: 'therapists', label: translate('therapists', 'ข้อมูลหมอนวด & กะงาน'), hash: '#admin/therapists', iconType: 'therapists' },
    { key: 'services', label: translate('services', 'เมนูบริการ & ราคา'), hash: '#admin/services', iconType: 'services' },
    { key: 'users', label: translate('users', 'สรุปข้อมูลผู้ใช้ทั้งหมด'), hash: '#admin/users', iconType: 'users' },
  ]
}

export function RenderIcon({ type }) {
  switch (type) {
    case 'dashboard':
      return (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.2V3.6a.6.6 0 01.6-.6h7.2a.6.6 0 01.6.6v9.6a.6.6 0 01-.6.6H3.6a.6.6 0 01-.6-.6zM12 20.4v-9.6a.6.6 0 01.6-.6h7.2a.6.6 0 01.6.6v9.6a.6.6 0 01-.6.6h-7.2a.6.6 0 01-.6-.6zM3 20.4v-3.6a.6.6 0 01.6-.6h7.2a.6.6 0 01.6.6v3.6a.6.6 0 01-.6.6H3.6a.6.6 0 01-.6-.6zM12 6V3.6a.6.6 0 01.6-.6h7.2a.6.6 0 01.6.6V6a.6.6 0 01-.6.6h-7.2a.6.6 0 01-.6-.6z" />
        </svg>
      )
    case 'queue':
      return (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    case 'bookings':
      return (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    case 'rooms':
      return (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0v-5a2 2 0 012-2h2a2 2 0 012 2v5m-6 0h6" />
        </svg>
      )
    case 'therapists':
      return (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    case 'users':
      return (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    case 'services':
      return (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    default:
      return null
  }
}

export default function AdminSidebar({ currentRoute = 'dashboard', onNavigate }) {
  const { user, logout } = useAdminAuth()
  const { t } = useLanguage()
  const navLinks = getNavLinks(t)

  const handleGoToCustomer = () => {
    window.location.hash = '#top'
  }

  return (
    <aside className="hidden lg:flex fixed top-0 bottom-0 left-0 z-40 w-64 bg-teak-deep text-warm-ivory border-r border-wood-deep/30 flex-col justify-between font-body-md">
      <div>
        {/* Header Branding Matching #top Navbar (No F icon circle) */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-wood-deep/30">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              handleGoToCustomer()
            }}
            className="flex flex-col transition-opacity duration-200 hover:opacity-80 cursor-pointer"
          >
            <span className="font-headline-sm text-headline-sm text-wood-light font-normal tracking-widest leading-none text-xl">
              {shop.name}
            </span>
            <span className="font-label-md text-[10px] text-terracotta-muted uppercase tracking-widest mt-1 font-semibold">
              ADMIN MANAGEMENT
            </span>
          </a>
        </div>

        {/* Clean User Profile Banner (No avatar picture frame/ring) */}
        <div className="px-4 py-3 mx-3 my-4 bg-primary-container/70 rounded-2xl border border-wood-deep/35 flex items-center justify-between">
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-warm-ivory truncate">{user.name}</div>
            <div className="text-[10px] text-sand-warm uppercase font-medium">{user.role}</div>
          </div>
          <StatusBadge status={user.role} size="sm" />
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1">
          <div className="px-3 text-[11px] font-semibold uppercase text-sand-warm tracking-wider mb-2">
            MAIN MENU
          </div>
          {navLinks.map((link) => {
            const isActive = currentRoute === link.key
            return (
              <button
                key={link.key}
                type="button"
                onClick={() => onNavigate(link.key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-terracotta-muted/20 text-warm-ivory font-semibold shadow-sm border border-terracotta-muted/45'
                    : 'text-sand-warm hover:bg-primary-container hover:text-warm-ivory'
                }`}
              >
                <div className="flex items-center gap-3">
                  <RenderIcon type={link.iconType} />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-terracotta-muted text-white font-bold">
                    {link.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Footer Navigation Switcher & Logout */}
      <div className="p-4 border-t border-wood-deep/30 bg-primary-container/40 space-y-2">
        <button
          onClick={handleGoToCustomer}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-primary-container hover:bg-teak-dark text-warm-ivory text-xs font-semibold transition-colors border border-wood-deep/40 cursor-pointer"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span>{t('admin.goToCustomer')}</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-teak-deep hover:bg-rose-950/80 hover:text-rose-200 text-sand-warm hover:text-rose-200 text-xs font-medium transition-colors border border-wood-deep/25 cursor-pointer"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>{t('admin.logout')}</span>
        </button>
      </div>
    </aside>
  )
}
