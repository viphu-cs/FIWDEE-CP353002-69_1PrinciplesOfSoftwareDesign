import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useLanguage } from '../../i18n/useLanguage.js'
import { shop } from '../../data/mock.js'

const navItems = [
  { key: 'home' },
  { key: 'therapists' },
  { key: 'services' },
  { key: 'about' },
]

export default function Navbar({ ready = true, currentPage = 'home', onNavigate }) {
  const { lang, setLang, t } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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
    if (onNavigate) {
      onNavigate(key)
    }
  }

  return (
    <motion.header
      initial={{ y: -72, opacity: 0 }}
      // 🎬 เริ่ม slide เข้ามาหลังม่าน preloader ยกออกเท่านั้น
      animate={ready ? { y: 0, opacity: 1 } : { y: -72, opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: ready ? 0.15 : 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-surface/95 shadow-md backdrop-blur-xl' : 'bg-surface/80 backdrop-blur-xl'
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
            <span className="font-headline-sm text-headline-sm text-primary font-normal tracking-widest leading-none">
              {shop.name}
            </span>
            <span className="font-label-md text-label-md text-charcoal-muted uppercase mt-0.5">
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
                link.active ? 'text-primary font-medium' : 'text-on-surface-variant hover:text-on-surface'
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
            className="btn-lift inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-sand-warm text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg uppercase cursor-pointer"
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

          {/* 🎬 hover ยกตัว + เงา, กดยุบเบา ๆ — เป็น pure CSS (.btn-lift) ไม่ใช้ JS */}
          <button
            type="button"
            onClick={() => handleLinkClick('booking')}
            className="btn-lift hidden sm:inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-primary-container text-warm-ivory font-label-lg text-label-lg uppercase hover:bg-teak-deep cursor-pointer"
          >
            {t('nav.book')}
          </button>
          <button
            type="button"
            className="md:hidden w-8 h-8 grid place-items-center text-primary cursor-pointer transition-transform duration-200 active:scale-90"
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
            className="md:hidden overflow-hidden bg-surface border-t border-surface-container-highest"
          >
            <div className="px-6 py-4 flex flex-col gap-2">
              {links.map((link) => (
                <button
                  key={link.key}
                  type="button"
                  onClick={() => handleLinkClick(link.key)}
                  aria-current={link.active ? 'page' : undefined}
                  className={`uppercase text-label-lg font-label-lg py-2 text-left cursor-pointer transition-colors duration-200 ${
                    link.active ? 'text-primary font-medium' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {t(`nav.${link.key}`)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  toggleLang()
                  setMenuOpen(false)
                }}
                className="uppercase text-label-lg font-label-lg py-2 text-left text-on-surface-variant hover:text-on-surface cursor-pointer"
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
