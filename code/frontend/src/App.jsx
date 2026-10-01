import { useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'motion/react'
import Footer from './components/layout/Footer.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Preloader from './components/layout/Preloader.jsx'
import LandingPage from './pages/landing/LandingPage.jsx'
import TherapistsPage from './pages/therapists/TherapistsPage.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'

export default function App() {
  // 🎬 ready = ม่าน preloader ยกออกแล้ว — entrance animation ของ navbar/hero จะเริ่มตอนนั้น
  const [ready, setReady] = useState(false)
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase()
      if (hash.includes('therapist')) return 'therapists'
      if (window.location.pathname.includes('/therapists')) return 'therapists'
    }
    return 'home'
  })

  // 🎬 ซิงก์ URL hash และ browser back/forward
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.toLowerCase()
      if (hash.includes('therapist')) {
        setCurrentPage('therapists')
      } else {
        setCurrentPage('home')
      }
    }
    window.addEventListener('hashchange', handleLocationChange)
    window.addEventListener('popstate', handleLocationChange)
    return () => {
      window.removeEventListener('hashchange', handleLocationChange)
      window.removeEventListener('popstate', handleLocationChange)
    }
  }, [])

  const handleNavigate = (targetKey) => {
    if (targetKey === 'therapists') {
      setCurrentPage('therapists')
      window.history.pushState(null, '', '#therapists')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (targetKey === 'home') {
      setCurrentPage('home')
      window.history.pushState(null, '', '#top')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (targetKey === 'services') {
      if (currentPage !== 'home') {
        setCurrentPage('home')
        window.history.pushState(null, '', '#services')
        setTimeout(() => {
          document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } else {
        document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
      }
    } else if (targetKey === 'about') {
      if (currentPage !== 'home') {
        setCurrentPage('home')
        window.history.pushState(null, '', '#location')
        setTimeout(() => {
          document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } else {
        document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' })
      }
    } else if (targetKey === 'booking') {
      if (currentPage === 'therapists') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        document.getElementById('therapists')?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    // เคารพการตั้งค่า "ลด motion" ของผู้ใช้ในระบบปฏิบัติการ
    <MotionConfig reducedMotion="user">
      <LanguageProvider>
        <AnimatePresence>{!ready && <Preloader onDone={() => setReady(true)} />}</AnimatePresence>

        <div className="bg-surface font-body-md text-on-surface antialiased" id="top">
          <Navbar ready={ready} currentPage={currentPage} onNavigate={handleNavigate} />
          {currentPage === 'therapists' ? (
            <TherapistsPage onNavigate={handleNavigate} />
          ) : (
            <LandingPage ready={ready} onNavigate={handleNavigate} />
          )}
          <Footer onNavigate={handleNavigate} />
        </div>
      </LanguageProvider>
    </MotionConfig>
  )
}
