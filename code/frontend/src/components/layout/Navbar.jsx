import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useLanguage } from '../../i18n/useLanguage.js'
import { useCustomerAuth } from '../../context/CustomerAuthContext.jsx'
import { shop } from '../../data/mock.js'

const navItems = [
  { key: 'home' },
  { key: 'therapists' },
  { key: 'services' },
  { key: 'about' },
]

export default function Navbar({ ready = true, currentPage = 'home', onNavigate }) {
  const { lang, setLang, t } = useLanguage()
  const { user, isAuthenticated, logout } = useCustomerAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const profileRef = useRef(null)

  const avatarInitial = (user?.name || '?').trim().charAt(0).toUpperCase()
  const firstName = (user?.name || '').trim().split(/\s+/)[0] || ''

  // 🎬 ปิดแถบเด้งโปรไฟล์เมื่อคลิกนอกพื้นที่ avatar
  useEffect(() => {
    if (!profileOpen) return
    const closeOnOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [profileOpen])

  const links = navItems.map((item) => ({
    ...item,
    active:
      item.key === 'therapists'
        ? currentPage === 'therapists' || currentPage === 'therapist-profile'
        : item.key === currentPage,
  }))

  // 🎬 เปลี่ยนพื้นหลัง/เงาของ navbar เมื่อเลื่อนลง (listener แบบ passive ไม่บล็อก scroll)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleLang = () => setLang(lang === 'th' ? 'en' : 'th')

  const handleLinkClick = (key) => {
    setMenuOpen(false)
    setProfileOpen(false)
    if (onNavigate) {
      onNavigate(key)
    }
  }

  const handleLogout = () => {
    setMenuOpen(false)
    setProfileOpen(false)
    logout()
    if (onNavigate) {
      onNavigate('home')
    }
  }

  const profileMenuItems = [
    { key: 'profile', icon: 'person', label: t('nav.profile'), onClick: () => handleLinkClick('profile') },
    { key: 'my-bookings', icon: 'receipt_long', label: t('nav.myBookings'), onClick: () => handleLinkClick('my-bookings') },
  ]

  return (
    <motion.header
      initial={{ y: -72, opacity: 0 }}
      // 🎬 เริ่ม slide เข้ามาหลังม่าน preloader ยกออกเท่านั้น
      animate={ready ? { y: 0, opacity: 1 } : { y: -72, opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: ready ? 0.15 : 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-primary-container/95 shadow-lg backdrop-blur-xl' : 'bg-primary-container/75 backdrop-blur-xl'
      }`}
    >
      <div className="h-20 max-w-6xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            className="flex flex-col transition-opacity duration-200 hover:opacity-80 cursor-pointer"
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              handleLinkClick('home')
            }}
          >
            <span className="font-headline-sm text-headline-sm text-warm-ivory font-normal tracking-widest leading-none">
              {shop.name}
            </span>
            <span className="font-label-md text-label-md text-warm-ivory/70 uppercase mt-0.5">
              {shop.nameSuffix}
            </span>
          </a>
        </div>

        <nav className="hidden md:flex items-center gap-space-xl">
          {links.map((link) => (
            <button
              key={link.key}
              type="button"
              onClick={() => handleLinkClick(link.key)}
              aria-current={link.active ? 'page' : undefined}
              className={`link-underline uppercase transition-colors duration-200 text-label-lg font-label-lg cursor-pointer ${
                link.active ? 'text-warm-ivory font-semibold' : 'text-warm-ivory/70 hover:text-warm-ivory'
              }`}
            >
              {t(`nav.${link.key}`)}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-space-md">
          {/* 🎬 ปุ่มเปลี่ยนภาษา TH ↔ EN (โชว์ภาษาปลายทาง) */}
          <button
            type="button"
            onClick={toggleLang}
            aria-label="Switch language"
            title={lang === 'th' ? 'Switch to English' : 'สลับเป็นภาษาไทย'}
            className="btn-lift inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-warm-ivory/40 text-warm-ivory/80 hover:text-warm-ivory font-label-lg text-label-lg uppercase cursor-pointer"
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
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            {t('nav.switchLang')}
          </button>

          {/* 🎬 ยังไม่ล็อกอิน: ปุ่มเข้าสู่ระบบ · ล็อกอินแล้ว: avatar โปรไฟล์ + แถบเด้งเมนูผู้ใช้ */}
          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                aria-label={t('nav.profile')}
                aria-expanded={profileOpen}
                className="btn-lift hidden sm:flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full border border-warm-ivory/25 text-warm-ivory hover:border-warm-ivory/50 transition-colors cursor-pointer"
              >
                <span className="w-9 h-9 rounded-full bg-warm-ivory text-primary grid place-items-center font-label-md text-label-md font-semibold shrink-0">
                  {avatarInitial}
                </span>
                <span className="font-label-md text-label-md truncate max-w-24">{firstName}</span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    key="profile-menu"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute right-0 top-full mt-3 w-64 rounded-xl bg-primary-container border border-warm-ivory/15 shadow-2xl overflow-hidden origin-top-right"
                  >
                    <div className="px-4 py-3 border-b border-warm-ivory/10">
                      <p className="font-label-md text-label-md text-warm-ivory font-semibold truncate">
                        {user?.name}
                      </p>
                      {user?.email && (
                        <p className="font-body-sm text-body-sm text-warm-ivory/60 truncate">{user.email}</p>
                      )}
                    </div>
                    <div className="py-2">
                      {profileMenuItems.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={item.onClick}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left font-body-md text-body-md text-warm-ivory/85 hover:bg-warm-ivory/10 hover:text-warm-ivory transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-lg text-warm-ivory/60">{item.icon}</span>
                          {item.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left font-body-md text-body-md text-red-300/90 hover:bg-red-400/10 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        {t('nav.logout')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleLinkClick('login')}
              className="btn-lift hidden sm:inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full bg-warm-ivory text-primary font-label-lg text-label-lg uppercase hover:bg-warm-ivory/90 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">person</span>
              {t('nav.login')}
            </button>
          )}
          <button
            type="button"
            className="md:hidden w-8 h-8 grid place-items-center text-warm-ivory cursor-pointer transition-transform duration-200 active:scale-90"
            aria-label="เปิด/ปิดเมนู"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* 🎬 เมนูมือถือ: กาง/หุบแบบ animated นุ่มนวลด้วย AnimatePresence */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="md:hidden overflow-hidden bg-primary-container border-t border-warm-ivory/10"
          >
            <div className="px-6 py-4 flex flex-col gap-2">
              {links.map((link) => (
                <button
                  key={link.key}
                  type="button"
                  onClick={() => handleLinkClick(link.key)}
                  aria-current={link.active ? 'page' : undefined}
                  className={`uppercase text-label-lg font-label-lg py-2 text-left cursor-pointer transition-colors duration-200 ${
                    link.active ? 'text-warm-ivory font-semibold' : 'text-warm-ivory/70 hover:text-warm-ivory'
                  }`}
                >
                  {t(`nav.${link.key}`)}
                </button>
              ))}
              {/* ล็อกอิน / เมนูผู้ใช้ (มือถือ) */}
              <div className="border-t border-warm-ivory/10 pt-2 mt-2">
                {isAuthenticated ? (
                  <>
                    <p className="font-label-md text-label-md text-warm-ivory/60 py-1 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-warm-ivory text-primary grid place-items-center font-label-caps text-label-caps font-semibold">
                        {avatarInitial}
                      </span>
                      {user?.name}
                    </p>
                    {profileMenuItems.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={item.onClick}
                        className="uppercase text-label-lg font-label-lg py-2 text-left text-warm-ivory/70 hover:text-warm-ivory cursor-pointer flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="uppercase text-label-lg font-label-lg py-2 text-left text-red-300/90 hover:text-red-300 cursor-pointer flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleLinkClick('login')}
                    className="uppercase text-label-lg font-label-lg py-2 text-left text-warm-ivory hover:text-warm-ivory cursor-pointer flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">person</span>
                    {t('nav.login')}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  toggleLang()
                  setMenuOpen(false)
                }}
                className="uppercase text-label-lg font-label-lg py-2 text-left text-warm-ivory/60 hover:text-warm-ivory cursor-pointer"
              >
                🌐 {t('nav.switchLang')}
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
