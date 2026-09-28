import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { shop } from '../../data/mock.js'

// TODO: รอหน้าใหม่ (/therapists, /services, /about, /booking) — ตอนนี้ปุ่ม nav ยังไม่ไปที่ไหน
const links = [
  { label: 'หน้าแรก', active: true },
  { label: 'หมอนวด' },
  { label: 'บริการ' },
  { label: 'เกี่ยวกับเรา' },
]

export default function Navbar({ ready = true }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // 🎬 เปลี่ยนพื้นหลัง/เงาของ navbar เมื่อเลื่อนลง (listener แบบ passive ไม่บล็อก scroll)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
            className="flex flex-col transition-opacity duration-200 hover:opacity-80"
            href="#top"
            onClick={() => setMenuOpen(false)}
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
              key={link.label}
              type="button"
              title="เร็ว ๆ นี้"
              aria-current={link.active ? 'page' : undefined}
              className={`link-underline uppercase transition-colors duration-200 text-label-lg font-label-lg cursor-pointer ${
                link.active ? 'text-primary font-medium' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-space-md">
          {/* TODO: เชื่อมกับหน้า /booking เมื่อทำหน้าจองคิว */}
          {/* 🎬 hover ยกตัว + เงา, กดยุบเบา ๆ — เป็น pure CSS (.btn-lift) ไม่ใช้ JS */}
          <button
            type="button"
            title="เร็ว ๆ นี้"
            className="btn-lift inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-primary-container text-warm-ivory font-label-lg text-label-lg uppercase hover:bg-teak-deep cursor-pointer"
          >
            จองคิว
          </button>
          <div className="hidden sm:flex w-8 h-8 rounded-full bg-primary items-center justify-center">
            <svg
              className="text-on-primary"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12Zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8Z" />
            </svg>
          </div>
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
                  key={link.label}
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className={`uppercase text-label-lg font-label-lg py-2 text-left cursor-pointer transition-colors duration-200 ${
                    link.active ? 'text-primary font-medium' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
