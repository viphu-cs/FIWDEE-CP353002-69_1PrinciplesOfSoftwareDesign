import { useState } from 'react'
import { AnimatePresence, MotionConfig } from 'motion/react'
import Footer from './components/layout/Footer.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Preloader from './components/layout/Preloader.jsx'
import LandingPage from './pages/landing/LandingPage.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'

// รอบหน้า: เพิ่ม react-router-dom แล้ว map route -> page ใน src/pages/ ที่จุดนี้
export default function App() {
  // 🎬 ready = ม่าน preloader ยกออกแล้ว — entrance animation ของ navbar/hero จะเริ่มตอนนั้น
  const [ready, setReady] = useState(false)

  return (
    // เคารพการตั้งค่า "ลด motion" ของผู้ใช้ในระบบปฏิบัติการ
    <MotionConfig reducedMotion="user">
      <LanguageProvider>
        <AnimatePresence>{!ready && <Preloader onDone={() => setReady(true)} />}</AnimatePresence>

        <div className="bg-surface font-body-md text-on-surface antialiased" id="top">
          <Navbar ready={ready} />
          <LandingPage ready={ready} />
          <Footer />
        </div>
      </LanguageProvider>
    </MotionConfig>
  )
}
