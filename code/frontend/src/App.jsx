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
import CustomerProfilePage from './pages/profile/CustomerProfilePage.jsx'
import BookingHistoryPage from './pages/booking/BookingHistoryPage.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import { CustomerAuthProvider } from './context/CustomerAuthContext.jsx'
import { therapists as mockTherapists } from './data/mock.js'
import api from './lib/api.js'

// Admin Portal Imports
import AdminLayout from './admin/layouts/AdminLayout.jsx'
import AdminDashboard from './admin/pages/AdminDashboard.jsx'
import AdminQueue from './admin/pages/AdminQueue.jsx'
import AdminBookings from './admin/pages/AdminBookings.jsx'
import AdminTherapists from './admin/pages/AdminTherapists.jsx'
import AdminRooms from './admin/pages/AdminRooms.jsx'
import AdminServices from './admin/pages/AdminServices.jsx'
import AdminUsers from './admin/pages/AdminUsers.jsx'
import AdminTherapistQueue from './admin/pages/AdminTherapistQueue.jsx'
import AdminTherapistSchedule from './admin/pages/AdminTherapistSchedule.jsx'
import AdminTherapistEarnings from './admin/pages/AdminTherapistEarnings.jsx'

// สถานะล็อกอิน = มีทั้ง JWT token และโปรไฟล์ (เช็คแค่โปรไฟล์ไม่พอ — ข้อมูลเก่าค้างจากยุค mock
// ต้องไม่นับเป็นล็อกอิน ให้ตรงกับเงื่อนไขของ CustomerAuthContext)
const isCustomerLoggedIn = () =>
  !!(
    localStorage.getItem('fiwdee_token') &&
    (localStorage.getItem('fiwdee_customer_auth') || sessionStorage.getItem('fiwdee_customer_auth'))
  )

// ปุ่ม CTA ที่พาไปหน้าจองคิวทั้งหมด — ต้องเช็กสถานะล็อกอินก่อนเสมอ
const BOOKING_NAV_KEYS = ['booking', 'book', 'booking-flow', 'direct-booking']

// หน้าที่ต้องล็อกอินก่อน (โปรไฟล์ / ประวัติการจอง รวมอยู่ด้วย)
const LOGIN_REQUIRED_KEYS = [...BOOKING_NAV_KEYS, 'profile', 'my-bookings']

const getStoredUserRole = () => {
  try {
    const raw = localStorage.getItem('fiwdee_admin_user') || localStorage.getItem('fiwdee_customer_auth') || sessionStorage.getItem('fiwdee_customer_auth')
    return raw ? JSON.parse(raw)?.role : null
  } catch {
    return null
  }
}

function getInitialNavigation() {
  if (typeof window === 'undefined') return { page: 'home', adminRoute: 'dashboard', therapistId: 1 }
  const hash = window.location.hash.toLowerCase()

  if (hash.startsWith('#admin')) {
    const token = localStorage.getItem('fiwdee_token')
    const role = getStoredUserRole()

    // หากยังไม่ล็อกอิน หรือเป็นลูกค้าทั่วไป (CUSTOMER) ห้ามเข้าหลังบ้าน ให้กลับหน้าแรกทันที
    if (!token || !role || role === 'CUSTOMER') {
      window.location.hash = '#top'
      return { page: 'home', adminRoute: 'dashboard', therapistId: 1 }
    }

    const parts = hash.split('/')
    let subRoute = parts[1] || (role === 'THERAPIST' ? 'therapist-queue' : 'dashboard')

    // ตรวจสอบสิทธิ์เฉพาะของแต่ละบทบาท
    if (role === 'THERAPIST') {
      const allowedTherapist = ['therapist-queue', 'therapist-schedule', 'therapist-earnings']
      if (!allowedTherapist.includes(subRoute)) {
        subRoute = 'therapist-queue'
      }
    } else if (role === 'RECEPTIONIST') {
      if (subRoute === 'users') {
        subRoute = 'dashboard'
      }
    }

    return { page: 'admin', adminRoute: subRoute, therapistId: 1 }
  }

  if (hash.startsWith('#therapists/') || hash.startsWith('#profile/')) {
    const parts = hash.split('/')
    const id = parseInt(parts[1], 10) || 1
    return { page: 'therapist-profile', adminRoute: 'dashboard', therapistId: id }
  }
  if (hash.includes('therapist')) {
    return { page: 'therapists', adminRoute: 'dashboard', therapistId: 1 }
  }
  if (hash.startsWith('#services')) {
    return { page: 'services', adminRoute: 'dashboard', therapistId: 1 }
  }
  if (hash.startsWith('#about')) {
    return { page: 'about', adminRoute: 'dashboard', therapistId: 1 }
  }
  // เข้าถึงหน้าโปรไฟล์/ประวัติการจองได้เฉพาะเมื่อล็อกอิน
  // (เช็ค #my-bookings ก่อน #booking เพราะ hash prefix ทับกัน)
  if (hash.startsWith('#my-bookings')) {
    if (isCustomerLoggedIn()) {
      return { page: 'my-bookings', adminRoute: 'dashboard', therapistId: 1 }
    }
    sessionStorage.setItem('fiwdee_pending_redirect', 'my-bookings')
    return { page: 'login', adminRoute: 'dashboard', therapistId: 1 }
  }
  if (hash === '#profile') {
    if (isCustomerLoggedIn()) {
      return { page: 'profile', adminRoute: 'dashboard', therapistId: 1 }
    }
    sessionStorage.setItem('fiwdee_pending_redirect', 'profile')
    return { page: 'login', adminRoute: 'dashboard', therapistId: 1 }
  }
  if (hash.startsWith('#booking') || hash.startsWith('#book-flow')) {
    let bookingTherapistId = null
    const queryIdx = hash.indexOf('?')
    if (queryIdx !== -1) {
      const search = new URLSearchParams(hash.substring(queryIdx))
      bookingTherapistId = search.get('therapistId')
    }
    const pendingTherapistId = sessionStorage.getItem('fiwdee_pending_therapist_id')
    if (!bookingTherapistId && pendingTherapistId) {
      bookingTherapistId = pendingTherapistId
    }

    // เข้าถึงหน้าจองคิวได้เฉพาะเมื่อล็อกอินแล้ว ไม่งั้นพาไปหน้าล็อกอิน
    if (isCustomerLoggedIn()) {
      return { page: 'booking', adminRoute: 'dashboard', therapistId: 1, bookingTherapistId }
    }
    sessionStorage.setItem('fiwdee_pending_redirect', 'booking')
    if (bookingTherapistId) {
      sessionStorage.setItem('fiwdee_pending_therapist_id', String(bookingTherapistId))
    }
    return { page: 'login', adminRoute: 'dashboard', therapistId: 1 }
  }
  if (hash.startsWith('#login')) {
    return { page: 'login', adminRoute: 'dashboard', therapistId: 1 }
  }
  if (hash.startsWith('#register')) {
    return { page: 'register', adminRoute: 'dashboard', therapistId: 1 }
  }
  return { page: 'home', adminRoute: 'dashboard', therapistId: 1 }
}

export default function App() {
  // 🎬 ready = ม่าน preloader ยกออกแล้ว — entrance animation ของ navbar/hero จะเริ่มตอนนั้น
  const [ready, setReady] = useState(false)
  const [navState, setNavState] = useState(() => getInitialNavigation())

  const currentPage = navState.page
  const adminRoute = navState.adminRoute
  const selectedTherapistId = navState.therapistId

  // 🎬 ซิงก์ URL hash และ browser back/forward
  useEffect(() => {
    const handleLocationChange = () => {
      const nav = getInitialNavigation()
      setNavState(nav)
    }
    window.addEventListener('hashchange', handleLocationChange)
    window.addEventListener('popstate', handleLocationChange)
    return () => {
      window.removeEventListener('hashchange', handleLocationChange)
      window.removeEventListener('popstate', handleLocationChange)
    }
  }, [])

  const handleNavigate = (targetKey, params) => {
    if (targetKey === 'admin') {
      const role = getStoredUserRole()
      const defaultSub = role === 'THERAPIST' ? 'therapist-queue' : 'dashboard'
      const sub = params?.subRoute || defaultSub
      setNavState({ page: 'admin', adminRoute: sub, therapistId: 1 })
      window.history.pushState(null, '', `#admin/${sub}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (targetKey === 'admin-therapist') {
      setNavState({ page: 'admin', adminRoute: 'therapist-queue', therapistId: 1 })
      window.history.pushState(null, '', '#admin/therapist-queue')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (targetKey === 'therapist-profile') {
      const id = params?.therapistId || 1
      setNavState({ page: 'therapist-profile', adminRoute: 'dashboard', therapistId: id })
      window.history.pushState(null, '', `#therapists/${id}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (targetKey === 'therapists') {
      setNavState({ page: 'therapists', adminRoute: 'dashboard', therapistId: 1 })
      window.history.pushState(null, '', '#therapists')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (targetKey === 'home') {
      setNavState({ page: 'home', adminRoute: 'dashboard', therapistId: 1 })
      window.history.pushState(null, '', '#top')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (targetKey === 'services') {
      setNavState({ page: 'services', adminRoute: 'dashboard', therapistId: 1 })
      window.history.pushState(null, '', '#services')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (targetKey === 'about') {
      setNavState({ page: 'about', adminRoute: 'dashboard', therapistId: 1 })
      window.history.pushState(null, '', '#about')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (LOGIN_REQUIRED_KEYS.includes(targetKey)) {
      // CTA จองคิว / โปรไฟล์ / ประวัติการจอง: เช็กสถานะล็อกอินก่อน — ถ้ายังไม่ล็อกอิน
      // พาไปหน้าล็อกอินพร้อมแนบ redirect กลับมาหน้าเดิมหลังล็อกอินสำเร็จ
      const destination = BOOKING_NAV_KEYS.includes(targetKey) ? 'booking' : targetKey
      const bTherapistId = params?.therapistId || null
      if (!isCustomerLoggedIn()) {
        sessionStorage.setItem('fiwdee_pending_redirect', destination)
        if (bTherapistId) {
          sessionStorage.setItem('fiwdee_pending_therapist_id', String(bTherapistId))
        } else {
          sessionStorage.removeItem('fiwdee_pending_therapist_id')
        }
        setNavState({ page: 'login', adminRoute: 'dashboard', therapistId: 1 })
        window.history.pushState(null, '', '#login')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setNavState({
          page: destination,
          adminRoute: 'dashboard',
          therapistId: 1,
          bookingTherapistId: bTherapistId,
        })
        const queryStr = bTherapistId ? `?therapistId=${bTherapistId}` : ''
        window.history.pushState(null, '', `#${destination}${queryStr}`)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else if (targetKey === 'login') {
      // เข้าหน้าล็อกอินตรง ๆ (ไม่มีการ redirect ค้างไว้)
      sessionStorage.removeItem('fiwdee_pending_redirect')
      setNavState({ page: 'login', adminRoute: 'dashboard', therapistId: 1 })
      window.history.pushState(null, '', '#login')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (targetKey === 'register') {
      setNavState({ page: 'register', adminRoute: 'dashboard', therapistId: 1 })
      window.history.pushState(null, '', '#register')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleAdminNavigate = (targetSubRoute) => {
    setNavState({ page: 'admin', adminRoute: targetSubRoute, therapistId: 1 })
    window.history.pushState(null, '', `#admin/${targetSubRoute}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // โหลดรายชื่อผู้บำบัดจริงจาก API (พร้อม fallback จาก mock)
  const [allTherapists, setAllTherapists] = useState(mockTherapists)

  useEffect(() => {
    let isMounted = true
    api.get('/therapists')
      .then((res) => {
        if (isMounted && res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const merged = res.data.map((bt, idx) => {
            const matchedMock =
              mockTherapists.find((mt) => mt.nickname.toLowerCase() === bt.nickname.toLowerCase()) ||
              mockTherapists[idx % mockTherapists.length]

            const backendSkills = bt.skills || []
            const specialties = []
            backendSkills.forEach((s) => {
              const lower = s.toLowerCase()
              if (lower.includes('thai')) specialties.push('thai')
              if (lower.includes('aroma')) specialties.push('aroma')
              if (lower.includes('oil')) specialties.push('oil')
              if (lower.includes('foot')) specialties.push('foot')
            })

            return {
              ...matchedMock,
              id: bt.id,
              nickname: bt.nickname,
              skills: backendSkills,
              specialties: specialties.length > 0 ? specialties : matchedMock.specialties,
              rating: bt.averageRating > 0 ? Number(bt.averageRating) : matchedMock.rating,
              bio: bt.bio || matchedMock.bio,
            }
          })
          setAllTherapists(merged)
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [])

  // หาหมอนวดที่เลือกอยู่ สำหรับหน้าโปรไฟล์ (รองรับทั้ง id ตัวเลขและ string)
  const activeTherapist =
    allTherapists.find((t) => String(t.id) === String(selectedTherapistId)) ||
    allTherapists[0] ||
    therapists[0]

  return (
    <MotionConfig reducedMotion="user">
      <LanguageProvider>
        <CustomerAuthProvider>
        {currentPage === 'admin' ? (
          <AdminLayout currentRoute={adminRoute} onNavigate={handleAdminNavigate}>
            {adminRoute === 'queue' ? (
              <AdminQueue />
            ) : adminRoute === 'bookings' ? (
              <AdminBookings />
            ) : adminRoute === 'therapists' ? (
              <AdminTherapists />
            ) : adminRoute === 'rooms' ? (
              <AdminRooms />
            ) : adminRoute === 'services' ? (
              <AdminServices />
            ) : adminRoute === 'users' ? (
              <AdminUsers />
            ) : adminRoute === 'therapist-queue' ? (
              <AdminTherapistQueue />
            ) : adminRoute === 'therapist-schedule' ? (
              <AdminTherapistSchedule />
            ) : adminRoute === 'therapist-earnings' ? (
              <AdminTherapistEarnings />
            ) : (
              <AdminDashboard />
            )}
          </AdminLayout>
        ) : (
          <div className="bg-surface font-body-md text-on-surface antialiased" id="top">
            <AnimatePresence>{!ready && <Preloader onDone={() => setReady(true)} />}</AnimatePresence>
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
              <BookingPage
                onNavigate={handleNavigate}
                initialTherapistId={navState.bookingTherapistId}
              />
            ) : currentPage === 'profile' ? (
              <CustomerProfilePage onNavigate={handleNavigate} />
            ) : currentPage === 'my-bookings' ? (
              <BookingHistoryPage onNavigate={handleNavigate} />
            ) : currentPage === 'login' ? (
              <LoginPage onNavigate={handleNavigate} />
            ) : currentPage === 'register' ? (
              <RegisterPage onNavigate={handleNavigate} />
            ) : (
              <LandingPage ready={ready} onNavigate={handleNavigate} />
            )}
            <Footer onNavigate={handleNavigate} />
          </div>
        )}
        </CustomerAuthProvider>
      </LanguageProvider>
    </MotionConfig>
  )
}
