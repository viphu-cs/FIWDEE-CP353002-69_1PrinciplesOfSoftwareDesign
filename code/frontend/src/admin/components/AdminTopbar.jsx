import React, { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import StatusBadge from './StatusBadge.jsx'
import { RenderIcon, getNavLinks } from './AdminSidebar.jsx'
import { shop } from '../../data/mock.js'

export default function AdminTopbar({ currentRoute, onNavigate, onOpenWalkInModal }) {
  const { user, logout } = useAdminAuth()
  const { lang, setLang, t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  const navLinks = getNavLinks(t, 0, user?.role)
  const toggleLang = () => setLang(lang === 'th' ? 'en' : 'th')

  const handleGoToCustomer = () => {
    window.location.hash = '#top'
  }

  return (
    <>
      <header className="h-20 bg-surface/95 backdrop-blur-md border-b border-outline-variant/70 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-2xs font-body-md">
        {/* Left side: Logo matching #top Navbar (No F icon circle) */}
        <div className="flex items-center gap-3">
          <a
            href="#admin/dashboard"
            onClick={(e) => {
              e.preventDefault()
              onNavigate('dashboard')
            }}
            className="flex flex-col transition-opacity duration-200 hover:opacity-80 cursor-pointer"
          >
            <span className="font-headline-sm text-headline-sm text-teak-dark font-normal tracking-widest leading-none text-xl">
              {shop.name}
            </span>
            <span className="font-label-md text-[10px] text-terracotta-muted uppercase tracking-widest mt-0.5 font-semibold">
              ADMIN PORTAL
            </span>
          </a>
        </div>

        {/* Right side: Customer Link + Language Switcher + User Profile + Hamburger (Right side) */}
        <div className="flex min-w-0 items-center gap-1 sm:gap-3">
          {/* Button to go to Customer Portal */}
          <button
            type="button"
            onClick={handleGoToCustomer}
            title={t('admin.goToCustomer')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full border border-outline-variant hover:bg-surface-container-low text-on-surface-variant text-xs font-semibold transition-colors cursor-pointer"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="hidden sm:inline">{t('admin.goToCustomer')}</span>
            <span className="sm:hidden">Customer</span>
          </button>

          {/* Quick Walk-in Button */}
          <button
            onClick={onOpenWalkInModal}
            type="button"
            className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teak-dark text-on-primary hover:bg-teak-deep text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>{t('admin.addQueue')}</span>
          </button>

          {/* Language Switcher TH ↔ EN (Matching Customer Navbar #top) */}
          <button
            type="button"
            onClick={toggleLang}
            aria-label="Switch language"
            title={lang === 'th' ? 'Switch to English' : 'สลับเป็นภาษาไทย'}
            className="btn-lift inline-flex items-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low font-label-lg text-xs uppercase cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>{lang === 'th' ? 'EN' : 'TH'}</span>
          </button>

          {/* User Profile Info (No profile picture frame/ring) */}
          <div className="relative hidden min-[420px]:block">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
            >
              <div className="text-left">
                <div className="text-xs font-bold text-on-surface leading-tight">{user.name}</div>
                <div className="text-[10px] text-charcoal-muted font-semibold uppercase">{user.role}</div>
              </div>
            </button>

            {/* User Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-surface rounded-2xl shadow-xl border border-outline-variant py-2 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-surface-container">
                  <p className="text-xs font-bold text-on-surface">{user.name}</p>
                  <p className="text-[11px] text-charcoal-muted">{user.email}</p>
                  <div className="mt-1">
                    <StatusBadge status={user.role} size="sm" />
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={handleGoToCustomer}
                    className="w-full text-left px-4 py-2 text-xs text-on-surface-variant hover:bg-surface-container-low flex items-center justify-between cursor-pointer"
                  >
                    <span>{t('admin.goToCustomer')}</span>
                    <span>→</span>
                  </button>
                </div>

                <div className="border-t border-surface-container pt-1">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false)
                      logout()
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-700 hover:bg-rose-50 font-semibold cursor-pointer flex items-center gap-2"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>{t('admin.logout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hamburger toggle button positioned on the RIGHT side (Exact match with Navbar #top) */}
          <button
            type="button"
            className="lg:hidden w-8 h-8 grid place-items-center text-teak-dark cursor-pointer transition-transform duration-200 active:scale-90 ml-1"
            aria-label="เปิด/ปิดเมนู"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* 🎬 เมนูกาง/หุบแบบเดียวกับหน้าลูกค้า #top ด้วย AnimatePresence & motion.nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            key="admin-mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="lg:hidden sticky top-20 z-20 overflow-hidden bg-surface border-b border-outline-variant shadow-xl text-on-surface font-body-md"
          >
            <div className="px-6 py-4 flex flex-col gap-2">
              <div className="text-[10px] font-semibold uppercase text-charcoal-muted tracking-wider mb-1">
                ADMIN MENU
              </div>
              {navLinks.map((link) => {
                const isActive = currentRoute === link.key
                return (
                  <button
                    key={link.key}
                    type="button"
                    onClick={() => {
                      onNavigate(link.key)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-teak-dark text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:bg-surface-container-low'
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

              <div className="pt-3 border-t border-surface-container flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleGoToCustomer()
                  }}
                  className="w-full text-left py-2 px-4 rounded-xl bg-surface-container-low text-on-surface text-xs font-semibold flex items-center justify-between"
                >
                  <span>{t('admin.goToCustomer')}</span>
                  <span>→</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    logout()
                  }}
                  className="w-full text-left py-2 px-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>{t('admin.logout')}</span>
                </button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
