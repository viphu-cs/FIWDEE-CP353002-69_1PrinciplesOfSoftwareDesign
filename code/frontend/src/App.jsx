import { MotionConfig } from 'motion/react'
import Footer from './components/layout/Footer.jsx'
import Navbar from './components/layout/Navbar.jsx'
import LandingPage from './pages/landing/LandingPage.jsx'

// รอบหน้า: เพิ่ม react-router-dom แล้ว map route -> page ใน src/pages/ ที่จุดนี้
export default function App() {
  return (
    // เคารพการตั้งค่า "ลด motion" ของผู้ใช้ในระบบปฏิบัติการ
    <MotionConfig reducedMotion="user">
      <div className="bg-surface font-body-md text-on-surface antialiased" id="top">
        <Navbar />
        <LandingPage />
        <Footer />
      </div>
    </MotionConfig>
  )
}
