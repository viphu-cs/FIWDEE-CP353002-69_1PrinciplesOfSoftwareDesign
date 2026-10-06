import { useState } from 'react'
import { api } from '../../lib/api.js'
import { useLanguage } from '../../i18n/useLanguage.js'

export default function LoginPage({ onNavigate }) {
  const { t } = useLanguage()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [feedbackError, setFeedbackError] = useState(false)

  // redirect path ที่แนบมาตอนถูกส่งมาจากปุ่มจองคิว (เก็บใน sessionStorage)
  const pendingRedirect = sessionStorage.getItem('fiwdee_pending_redirect')

  // บันทึกผลล็อกอินจริงจาก POST /api/auth/login:
  // - fiwdee_token → JWT ที่ lib/api.js แนบเป็น Bearer ทุก request
  // - fiwdee_customer_auth → โปรไฟล์สำหรับ UI (ติ๊ก "คงสถานะ" → localStorage, ไม่ติ๊ก → sessionStorage)
  const saveCustomerAuth = (data) => {
    const profile = {
      id: data.userId,
      name: data.fullName,
      identifier,
      role: data.role,
      loginAt: new Date().toISOString(),
    }
    localStorage.setItem('fiwdee_token', data.token)
    const store = rememberMe ? localStorage : sessionStorage
    store.setItem('fiwdee_customer_auth', JSON.stringify(profile))
  }

  // หลังล็อกอินสำเร็จ: ถ้ามี redirect ที่แนบมาให้กลับไปหน้านั้น (เช่น หน้าจองคิว)
  const navigateAfterLogin = () => {
    if (pendingRedirect === 'booking') {
      sessionStorage.removeItem('fiwdee_pending_redirect')
      onNavigate?.('booking-flow')
      return
    }
    onNavigate?.('booking-flow')
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    if (!identifier.trim() || !password.trim()) return

    setSubmitting(true)
    setFeedback('')
    setFeedbackError(false)

    const res = await api.post('/auth/login', {
      identifier: identifier.trim(),
      password,
    })

    if (!res.success) {
      setSubmitting(false)
      setFeedbackError(true)
      setFeedback(res.message || t('auth.errLoginFailed'))
      return
    }

    saveCustomerAuth(res.data)
    setFeedback(
      `${pendingRedirect === 'booking' ? t('auth.loginSuccessRedirect') : t('auth.loginSuccess')}`
    )
    setTimeout(() => {
      setSubmitting(false)
      navigateAfterLogin()
    }, 700)
  }

  const handleGoogleLogin = () => {
    setFeedbackError(true)
    setFeedback(t('auth.googleNotAvailable'))
  }

  return (
    <main className="auth-theme w-full pt-20 bg-surface min-h-[calc(100vh-80px)]">
      <div className="flex flex-col w-full">
        <div className="w-full max-w-6xl mx-auto px-6 py-space-lg md:py-space-xl">
          {/* Breadcrumb / Ritual Progression */}
          <div className="flex items-center gap-space-xs text-secondary mb-space-lg font-label-caps uppercase tracking-widest text-label-caps flex-wrap">
            <button
              type="button"
              onClick={() => onNavigate?.('home')}
              className="inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>หน้าแรก</span>
            </button>
            <span>—</span>
            <span className="text-primary font-semibold">เข้าสู่ระบบสมาชิก</span>
          </div>

          {/* Main Editorial Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg lg:gap-gutter-desktop items-stretch">
            {/* Left Column: Ambient Sanctuary Imagery & Member Privileges */}
            <div className="lg:col-span-6 flex flex-col justify-between rounded-xl bg-surface-container-low p-space-md md:p-space-lg relative overflow-hidden">
              {/* Architectural Retreat Ambient Media */}
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-space-lg bg-surface-container">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  alt="Serene Thai luxury wellness boutique courtyard with teak wood architecture, natural stone reflection pool with water lilies, lush tropical foliage, Monstera plants, and warm evening lantern light radiating stillness and organic calmness."
                  src="/images/auth/login-courtyard.jpg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-background/70 via-transparent to-transparent flex items-end p-space-md">
                  <div>
                    <span className="text-primary-fixed font-label-caps uppercase tracking-widest text-label-caps block mb-1">
                      FIWDEE SANCTUARY
                    </span>
                    <p className="font-headline-sm text-headline-sm text-surface text-balance">
                      บรรยากาศพักผ่อนใจกลางขอนแก่น คืนความสมดุลแด่กายและใจ
                    </p>
                  </div>
                </div>
              </div>

              {/* Membership Exclusives / Ritual Care Card */}
              <div className="space-y-space-md">
                <div className="space-y-1">
                  <span className="font-label-caps text-label-caps uppercase text-primary tracking-widest block">
                    MEMBERSHIP PRIVILEGES
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    สุนทรียภาพแห่งการดูแลเฉพาะคุณ
                  </h3>
                </div>
                <div className="space-y-space-sm pt-space-xs">
                  {/* Benefit 1 */}
                  <div className="p-space-md rounded-lg bg-surface-container flex items-start gap-space-sm">
                    <span className="material-symbols-outlined text-primary text-xl mt-0.5">spa</span>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-semibold">
                        ห้องพักผ่อนและอ่างแช่สมุนไพรส่วนตัว
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        สิทธิ์เลือกห้องเดี่ยวพร้อมโซนอาบน้ำศิลาธรรมชาติล่วงหน้าโดยไม่มีค่าใช้จ่ายเพิ่ม
                      </p>
                    </div>
                  </div>
                  {/* Benefit 2 */}
                  <div className="p-space-md rounded-lg bg-surface-container flex items-start gap-space-sm">
                    <span className="material-symbols-outlined text-primary text-xl mt-0.5">tune</span>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-semibold">
                        บันทึกระดับน้ำหนักและน้ำมันหอมระเหยประจำตัว
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        หมอนวดเฉพาะทางจะรับทราบจุดเมื่อยล้าและกลิ่นอโรมาที่คุณโปรดปรานก่อนเริ่มพิธีกรรม
                      </p>
                    </div>
                  </div>
                  {/* Benefit 3 */}
                  <div className="p-space-md rounded-lg bg-surface-container flex items-start gap-space-sm">
                    <span className="material-symbols-outlined text-primary text-xl mt-0.5">coffee</span>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-semibold">
                        สำรับชาต้อนรับสูตรพฤกษศาสตร์เฉพาะฤดูกาล
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        พร้อมสะสมเวลาบำบัดรับการอัปเกรดทรีตเมนต์พอกผิวกายฟรีทุก 10 ชั่วโมง
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ambient Metadata footer */}
              <div className="pt-space-lg flex items-center justify-between text-secondary">
                <span className="font-label-caps text-label-caps uppercase tracking-wider">
                  ESTABLISHED 2021
                </span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider">
                  KHON KAEN RETREAT
                </span>
              </div>
            </div>

            {/* Right Column: Sign In Form */}
            <div className="lg:col-span-6 flex flex-col justify-center py-space-md md:py-space-lg px-2 sm:px-space-md lg:px-space-lg">
              <div className="space-y-space-xs mb-space-lg">
                <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest block">
                  MEMBER ACCESS
                </span>
                <h1 className="font-headline-lg text-headline-lg text-primary">
                  ยินดีต้อนรับกลับสู่ความสงบ
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  เข้าสู่ระบบสมาชิก FIWDEE เพื่อจัดการเวลานัดหมาย ปรับแต่งรายละเอียดการบำบัด และดำเนินการจองคิวต่อเนื่อง
                </p>
              </div>

              {/* ทางลัดเข้าสู่หน้าจองคิวทันทีโดยไม่ต้องล็อกอิน */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container border border-primary/20 mb-space-md shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">bolt</span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    ทางลัด: ไปหน้าจองคิวโดยตรง (ไม่ต้องล็อกอิน)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate?.('booking-flow')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-surface font-label-caps text-label-caps uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-sm shrink-0"
                >
                  <span>จองคิวทันที</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {/* Interactive Form */}
              <form className="space-y-space-md" onSubmit={handleLoginSubmit}>
                {/* Contact / Identifier Input */}
                <div className="space-y-1.5">
                  <label className="block font-label-caps text-label-caps uppercase text-secondary tracking-wider" htmlFor="identifier">
                    เบอร์โทรศัพท์มือถือ หรือ อีเมล <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <input
                      className="w-full px-space-md py-3.5 rounded bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline/60 focus:outline-none focus:bg-surface-container transition-colors"
                      id="identifier"
                      name="identifier"
                      placeholder="081 234 5678 หรือ name@domain.com"
                      required
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute right-space-md top-1/2 -translate-y-1/2 text-secondary text-lg pointer-events-none">
                      person
                    </span>
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-label-caps text-label-caps uppercase text-secondary tracking-wider" htmlFor="password">
                      รหัสผ่าน <span className="text-primary">*</span>
                    </label>
                    <a
                      className="font-body-sm text-body-sm text-secondary hover:text-primary transition-colors underline underline-offset-4 decoration-secondary/30"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        alert('กรุณาติดต่อแผนกต้อนรับ 043-XXX-XXXX เพื่อรับการช่วยเหลือด้านบัญชี')
                      }}
                    >
                      ลืมรหัสผ่าน?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      className="w-full px-space-md py-3.5 rounded bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline/60 focus:outline-none focus:bg-surface-container transition-colors"
                      id="password"
                      name="password"
                      placeholder="กรอกรหัสผ่าน 8 ตัวอักษรขึ้นไป"
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      aria-label="Toggle password view"
                      className="absolute right-space-md top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors focus:outline-none cursor-pointer"
                      onClick={() => setShowPassword((prev) => !prev)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Remember me & Security badge */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-space-xs cursor-pointer select-none">
                    <input
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-surface-container accent-primary cursor-pointer"
                      id="rememberMe"
                      type="checkbox"
                    />
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      คงสถานะการเข้าสู่ระบบไว้
                    </span>
                  </label>
                  <span className="font-label-caps text-label-caps text-secondary uppercase flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">lock</span> ระบบความปลอดภัย 256-bit
                  </span>
                </div>

                {/* Primary CTA Button */}
                <div className="pt-space-xs">
                  <button
                    disabled={submitting}
                    className="w-full py-3.5 px-6 rounded bg-primary text-on-primary font-label-md text-label-md tracking-wider flex items-center justify-center gap-2 hover:opacity-95 transition-opacity active:scale-[0.99] cursor-pointer disabled:opacity-70"
                    type="submit"
                  >
                    <span>{submitting ? 'กำลังเชื่อมต่อห้องพักผ่อน...' : 'เข้าสู่ระบบและไปที่การจองคิว'}</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-space-sm">
                  <div className="w-full h-px bg-surface-container-high"></div>
                  <span className="absolute px-space-sm bg-surface font-label-caps text-label-caps uppercase text-secondary tracking-widest">
                    หรือเข้าสู่ระบบผ่าน
                  </span>
                </div>

                {/* Google Login Alternative */}
                <button
                  className="w-full py-3.5 px-6 rounded bg-surface-container-lowest text-on-surface font-label-md text-label-md tracking-wider flex items-center justify-center gap-space-sm border border-outline-variant hover:bg-surface-container transition-colors active:scale-[0.99] shadow-sm cursor-pointer"
                  onClick={handleGoogleLogin}
                  type="button"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>ดำเนินการต่อด้วย Google</span>
                </button>

                {/* Register Link Section - Placed at the bottom matching Stitch */}
                <div className="p-space-md rounded bg-surface-container-low text-center space-y-1 mt-space-sm">
                  <p className="font-body-md text-body-md text-on-surface">ยังไม่ได้เป็นสมาชิก FIWDEE?</p>
                  <p className="font-body-sm text-body-sm text-secondary">
                    ลงทะเบียนเพียง 1 นาทีเพื่อรับเอกสิทธิ์และบันทึกประวัติการบำบัด
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onNavigate?.('register')}
                      className="inline-flex items-center gap-1 font-label-md text-label-md text-primary font-semibold hover:opacity-85 transition-opacity underline underline-offset-4 decoration-primary/40 cursor-pointer"
                    >
                      <span>สมัครสมาชิกใหม่รับส่วนลดการจองครั้งแรก</span>
                      <span className="material-symbols-outlined text-sm">north_east</span>
                    </button>
                  </div>
                </div>

                {/* Notification feedback banner */}
                {feedback && (
                  <div
                    className={`p-space-sm rounded font-body-sm text-body-sm text-center ${
                      feedbackError
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-secondary-container text-on-secondary-container'
                    }`}
                  >
                    {feedback}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Assurance & Safety Footnote */}
          <div className="mt-space-xl pt-space-lg grid grid-cols-1 sm:grid-cols-3 gap-space-md text-center">
            <div className="space-y-1">
              <span className="material-symbols-outlined text-secondary text-2xl">verified_user</span>
              <h4 className="font-label-md text-label-md text-on-surface font-semibold">
                ใบอนุญาตสถานประกอบการสปา
              </h4>
              <p className="font-body-sm text-body-sm text-secondary">
                ผ่านมาตรฐานรับรองกรมสนับสนุนบริการสุขภาพ กระทรวงสาธารณสุข
              </p>
            </div>
            <div className="space-y-1">
              <span className="material-symbols-outlined text-secondary text-2xl">self_improvement</span>
              <h4 className="font-label-md text-label-md text-on-surface font-semibold">
                เธอราปิสต์ผู้เชี่ยวชาญ
              </h4>
              <p className="font-body-sm text-body-sm text-secondary">
                ผ่านการทดสอบมาตรฐานหัตถเวชแผนไทยชั้นสูงและการบริการแบบอบอุ่น
              </p>
            </div>
            <div className="space-y-1">
              <span className="material-symbols-outlined text-secondary text-2xl">nest_eco_leaf</span>
              <h4 className="font-label-md text-label-md text-on-surface font-semibold">
                ออร์แกนิกและบริสุทธิ์ 100%
              </h4>
              <p className="font-body-sm text-body-sm text-secondary">
                สมุนไพรสดและน้ำมันสกัดเย็นปลอดภัย ไร้สารเคมีสังเคราะห์
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
