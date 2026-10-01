import { useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'motion/react'
import Footer from './components/layout/Footer.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Preloader from './components/layout/Preloader.jsx'
import LandingPage from './pages/landing/LandingPage.jsx'
import TherapistsPage from './pages/therapists/TherapistsPage.jsx'
import TherapistProfilePage from './pages/therapists/TherapistProfilePage.jsx'
import ServicesPage from './pages/services/ServicesPage.jsx'
import AboutPage from './pages/about/AboutPage.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'
import BookingPage from './pages/booking/BookingPage.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import { therapists } from './data/mock.js'

function getInitialNavigation() {
  if (typeof window === 'undefined') return { page: 'home', therapistId: 1 }
  const hash = window.location.hash.toLowerCase()
  if (hash.startsWith('#therapists/') || hash.startsWith('#profile/')) {
    const parts = hash.split('/')
    const id = parseInt(parts[1], 10) || 1
    return { page: 'therapist-profile', therapistId: id }
  }
  if (hash.includes('therapist')) {
    return { page: 'therapists', therapistId: 1 }
  }
  if (hash.startsWith('#services')) {
    return { page: 'services', therapistId: 1 }
  }
  if (hash.startsWith('#about')) {
    return { page: 'about', therapistId: 1 }
  }
  if (hash.startsWith('#booking') || hash.startsWith('#book-flow')) {
    return { page: 'booking', therapistId: 1 }
  }
  if (hash.startsWith('#login') || hash.startsWith('#book')) {
    return { page: 'login', therapistId: 1 }
  }
  if (hash.startsWith('#register')) {
    return { page: 'register', therapistId: 1 }
  }
  return { page: 'home', therapistId: 1 }
}

export default function App() {
  // 🎬 ready = ม่าน preloader ยกออกแล้ว — entrance animation ของ navbar/hero จะเริ่มตอนนั้น
  const [ready, setReady] = useState(false)
  const [currentPage, setCurrentPage] = useState(() => getInitialNavigation().page)
  const [selectedTherapistId, setSelectedTherapistId] = useState(
    () => getInitialNavigation().therapistId
  )

  // 🎬 ซิงก์ URL hash และ browser back/forward
  useEffect(() => {
    const handleLocationChange = () => {
      const nav = getInitialNavigation()
      setCurrentPage(nav.page)
      setSelectedTherapistId(nav.therapistId)
    }
    window.addEventListener('hashchange', handleLocationChange)
    window.addEventListener('popstate', handleLocationChange)
    return () => {
      window.removeEventListener('hashchange', handleLocationChange)
      window.removeEventListener('popstate', handleLocationChange)
    }
  }, [])

  const handleNavigate = (targetKey, params) => {
    if (targetKey === 'therapist-profile') {
      const id = params?.therapistId || 1
      setSelectedTherapistId(id)
      setCurrentPage('therapist-profile')
      window.history.pushState(null, '', `#therapists/${id}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (targetKey === 'therapists') {
      setCurrentPage('therapists')
      window.history.pushState(null, '', '#therapists')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (targetKey === 'home') {
      setCurrentPage('home')
      window.history.pushState(null, '', '#top')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (targetKey === 'services') {
      setCurrentPage('services')
      window.history.pushState(null, '', '#services')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (targetKey === 'about') {
      setCurrentPage('about')
      window.history.pushState(null, '', '#about')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (targetKey === 'booking-flow' || targetKey === 'direct-booking') {
      setCurrentPage('booking')
      window.history.pushState(null, '', '#booking')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (targetKey === 'booking' || targetKey === 'book' || targetKey === 'login') {
      setCurrentPage('login')
      window.history.pushState(null, '', '#login')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (targetKey === 'register') {
      setCurrentPage('register')
      window.history.pushState(null, '', '#register')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // หาหมอนวดที่เลือกอยู่ สำหรับหน้าโปรไฟล์
  const activeTherapist =
    therapists.find((t) => t.id === selectedTherapistId) || therapists[0]

  return (
    // เคารพการตั้งค่า "ลด motion" ของผู้ใช้ในระบบปฏิบัติการ
    <MotionConfig reducedMotion="user">
      <LanguageProvider>
        <AnimatePresence>{!ready && <Preloader onDone={() => setReady(true)} />}</AnimatePresence>

        <div className="bg-surface font-body-md text-on-surface antialiased" id="top">
          <Navbar ready={ready} currentPage={currentPage} onNavigate={handleNavigate} />
          {currentPage === 'therapist-profile' ? (
            <TherapistProfilePage
              therapist={activeTherapist}
              onNavigate={handleNavigate}
            />
          ) : currentPage === 'therapists' ? (
            <TherapistsPage onNavigate={handleNavigate} />
          ) : currentPage === 'services' ? (
            <ServicesPage onNavigate={handleNavigate} />
          ) : currentPage === 'about' ? (
            <AboutPage onNavigate={handleNavigate} />
          ) : currentPage === 'booking' ? (
            <BookingPage onNavigate={handleNavigate} />
          ) : currentPage === 'login' ? (
            <LoginPage onNavigate={handleNavigate} />
          ) : currentPage === 'register' ? (
            <RegisterPage onNavigate={handleNavigate} />
          ) : (
            <LandingPage ready={ready} onNavigate={handleNavigate} />
          )}
          <Footer onNavigate={handleNavigate} />
        </div>
      </LanguageProvider>
    </MotionConfig>
  )
}
