import { useState } from 'react'
import { api } from '../../lib/api.js'
import { useLanguage } from '../../i18n/useLanguage.js'
import { useCustomerAuth } from '../../context/CustomerAuthContext.jsx'

export default function RegisterPage({ onNavigate }) {
  const { t } = useLanguage()
  const { login } = useCustomerAuth()
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [googleAccount, setGoogleAccount] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [healthNotes, setHealthNotes] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [receiveNews, setReceiveNews] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    if (!fullName.trim() || !phoneNumber.trim() || !email.trim() || !password.trim()) return

    setSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    // POST /api/auth/register — backend สร้าง Customer + ออก JWT ทันที (auto-login)
    const res = await api.post('/auth/register', {
      fullName: fullName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      password,
      healthNotes: healthNotes.trim() || null,
    })

    if (!res.success) {
      setSubmitting(false)
      setErrorMessage(res.message || t('auth.errRegisterFailed'))
      return
    }

    // เก็บ token + โปรไฟล์ผ่าน CustomerAuthContext (รูปแบบเดียวกับหน้า Login)
    login(res.data, true)

    setSuccessMessage(t('auth.registerSuccess'))
    setTimeout(() => {
      setSubmitting(false)
      // ถ้าถูกส่งมาจากปุ่มจองคิว/โปรไฟล์ ให้กลับไปหน้านั้น ไม่งั้นไปหน้าแรก
      const pendingRedirect = sessionStorage.getItem('fiwdee_pending_redirect')
      if (pendingRedirect) {
        sessionStorage.removeItem('fiwdee_pending_redirect')
        onNavigate?.(pendingRedirect)
      } else {
        onNavigate?.('home')
      }
    }, 800)
  }

  return (
    <main className="auth-theme w-full pt-20 bg-surface min-h-[calc(100vh-80px)]">
      <div className="flex flex-col w-full">
        {/* Minimal Ambient Flow Ribbon */}
        <section className="w-full bg-surface-container-low py-space-sm">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-xs text-secondary font-label-caps uppercase tracking-widest text-label-caps">
            <div className="flex items-center gap-space-xs text-primary font-medium">
              <button
                type="button"
                onClick={() => onNavigate?.('home')}
                className="inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer mr-2"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>หน้าแรก</span>
              </button>
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span>ขั้นตอนที่ 01 — สมาชิกและการยืนยันตัวตน</span>
            </div>
            <div className="flex items-center gap-space-sm">
              <span className="text-primary font-semibold">1. สร้างบัญชี</span>
              <span className="text-outline-variant">—</span>
              <span>2. เลือกทรีตเมนต์</span>
              <span className="text-outline-variant">—</span>
              <span>3. หมอนวด &amp; เวลา</span>
            </div>
          </div>
        </section>

        {/* Main Content Split Grid */}
        <section className="w-full py-space-lg lg:py-space-xl">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-space-lg lg:gap-gutter-desktop items-start">
            <div className="lg:col-span-7 flex flex-col space-y-space-lg">
              <div className="space-y-space-xs">
                <p className="font-label-caps text-label-caps text-secondary tracking-widest uppercase">
                  SANCTUARY ADMISSION &amp; APPOINTMENT
                </p>
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-normal leading-tight">
                  สมัครสมาชิก FIWDEE Member
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-xl pt-space-xs">
                  ลงทะเบียนเพียงไม่กี่ขั้นตอนเพื่อเริ่มต้นประสบการณ์นัดหมายการบำบัดและดูแลสุขภาพกายใจในบรรยากาศส่วนตัว เราจัดเก็บข้อมูลเพื่อออกแบบทรีตเมนต์ที่สอดคล้องกับสรีระของคุณอย่างประณีต
                </p>
              </div>

              <div className="bg-surface-container p-space-md rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
                <div className="space-y-1">
                  <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest block">
                    Instant Verification
                  </span>
                  <p className="font-body-md text-body-md text-on-surface font-medium">
                    เชื่อมต่อผ่านบัญชี Google
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    เชื่อมต่อผ่านบัญชี Google จองคิวสะดวกและจัดการนัดหมายได้ทันที
                  </p>
                </div>
                <button
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded bg-secondary-container text-on-secondary-fixed hover:bg-secondary-fixed transition-colors duration-200 font-label-md text-label-md gap-2 cursor-pointer shrink-0"
                  type="button"
                  onClick={() => setErrorMessage(t('auth.googleNotAvailable'))}
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>ลงทะเบียนด้วย Google</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center my-space-xs">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full bg-outline-variant/40 h-px"></div>
                </div>
                <span className="relative px-4 bg-surface font-label-caps text-label-caps uppercase text-secondary">
                  หรือกรอกข้อมูลด้านล่าง
                </span>
              </div>

              <form className="space-y-space-md" onSubmit={handleRegisterSubmit}>
                {/* API error / success feedback */}
                {errorMessage && (
                  <div className="p-3 rounded bg-error-container text-on-error-container font-body-sm text-body-sm">
                    {errorMessage}
                  </div>
                )}
                {successMessage && (
                  <div className="p-3 rounded bg-secondary-container text-on-secondary-container font-body-sm text-body-sm">
                    {successMessage}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="block font-label-caps text-label-caps uppercase text-secondary" htmlFor="fullName">
                    ชื่อ - นามสกุล (Full Name) <span className="text-primary">*</span>
                  </label>
                  <input
                    className="w-full bg-surface-container-low text-on-surface px-4 py-3 rounded text-body-md font-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container focus:ring-1 focus:ring-primary transition-all duration-150"
                    id="fullName"
                    placeholder="เช่น พิชญา อมรเวช"
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  <div className="space-y-1.5">
                    <label className="block font-label-caps text-label-caps uppercase text-secondary" htmlFor="phoneNumber">
                      เบอร์โทรศัพท์ (Mobile Phone) <span className="text-primary">*</span>
                    </label>
                    <input
                      className="w-full bg-surface-container-low text-on-surface px-4 py-3 rounded text-body-md font-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container focus:ring-1 focus:ring-primary transition-all duration-150"
                      id="phoneNumber"
                      placeholder="081 234 5678"
                      required
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <span className="block text-body-sm font-body-sm text-secondary">
                      สำหรับรับ SMS ยืนยันรหัสเข้าห้องรับรอง
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-label-caps text-label-caps uppercase text-secondary" htmlFor="googleAccount">
                      Google Account / Gmail (ถ้ามี)
                    </label>
                    <input
                      className="w-full bg-surface-container-low text-on-surface px-4 py-3 rounded text-body-md font-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container focus:ring-1 focus:ring-primary transition-all duration-150"
                      id="googleAccount"
                      placeholder="example@gmail.com"
                      type="email"
                      value={googleAccount}
                      onChange={(e) => setGoogleAccount(e.target.value)}
                    />
                    <span className="block text-body-sm font-body-sm text-secondary">
                      เพื่อความสะดวกรวดเร็วในการซิงค์ปฏิทินนัดหมาย
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-label-caps text-label-caps uppercase text-secondary" htmlFor="email">
                    อีเมล (Email Address) <span className="text-primary">*</span>
                  </label>
                  <input
                    className="w-full bg-surface-container-low text-on-surface px-4 py-3 rounded text-body-md font-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container focus:ring-1 focus:ring-primary transition-all duration-150"
                    id="email"
                    placeholder="sanctuary@fiwdee.com"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-label-caps text-label-caps uppercase text-secondary" htmlFor="password">
                    รหัสผ่าน (Password) <span className="text-primary">*</span>
                  </label>
                  <input
                    className="w-full bg-surface-container-low text-on-surface px-4 py-3 rounded text-body-md font-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container focus:ring-1 focus:ring-primary transition-all duration-150"
                    id="password"
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 pt-space-xs">
                  <label className="block font-label-caps text-label-caps uppercase text-secondary" htmlFor="healthNotes">
                    จุดที่ต้องการเน้นเป็นพิเศษ หรือข้อจำกัดด้านสุขภาพ (Optional Note)
                  </label>
                  <textarea
                    className="w-full bg-surface-container-low text-on-surface px-4 py-3 rounded text-body-md font-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container focus:ring-1 focus:ring-primary transition-all duration-150 resize-none"
                    id="healthNotes"
                    placeholder="เช่น ตึงสะบักซ้ายเรื้อรัง, มีอาการไมเกรน, ระดับน้ำหนักมือปานกลาง, กำลังตั้งครรภ์"
                    rows={2}
                    value={healthNotes}
                    onChange={(e) => setHealthNotes(e.target.value)}
                  />
                </div>

                <div className="pt-space-xs space-y-space-xs">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded accent-primary bg-surface-container-low cursor-pointer"
                      required
                      type="checkbox"
                    />
                    <span className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed select-none">
                      ข้าพเจ้ายอมรับ <a className="text-primary underline underline-offset-4 hover:opacity-80" href="#">ข้อกำหนดการให้บริการ</a> และยินยอมให้บันทึกประวัติสุขภาพเพื่อความปลอดภัยตาม <a className="text-primary underline underline-offset-4 hover:opacity-80" href="#">นโยบายความเป็นส่วนตัวของ FIWDEE Retreat</a>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      checked={receiveNews}
                      onChange={(e) => setReceiveNews(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded accent-primary bg-surface-container-low cursor-pointer"
                      type="checkbox"
                    />
                    <span className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed select-none">
                      รับการแจ้งเตือนสิทธิประโยชน์ ส่วนลดรอบบำบัดฤดูกาล และการจัดเตรียมกลิ่นอโรมาพิเศษผ่าน SMS
                    </span>
                  </label>
                </div>

                <div className="pt-space-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md">
                  <button
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded bg-primary text-surface font-label-md text-label-md tracking-wider hover:opacity-90 active:scale-[0.99] transition-all duration-150 text-center cursor-pointer disabled:opacity-70"
                    type="submit"
                  >
                    {submitting ? 'กำลังสร้างบัญชีสมาชิก...' : 'สมัครสมาชิกและดำเนินการจองคิว'}
                  </button>
                  <div className="text-center sm:text-right">
                    <span className="font-body-sm text-body-sm text-secondary">มีบัญชีสมาชิกอยู่แล้ว?</span>
                    <button
                      type="button"
                      onClick={() => onNavigate?.('login')}
                      className="ml-2 font-label-md text-label-md text-primary font-medium underline underline-offset-4 hover:opacity-80 cursor-pointer"
                    >
                      เข้าสู่ระบบที่นี่
                    </button>
                  </div>
                </div>
              </form>

              <div className="pt-space-sm flex items-center gap-space-sm text-secondary font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-primary text-lg">verified_user</span>
                <span>ข้อมูลส่วนบุคคลของท่านได้รับการปกป้องตามมาตรฐานสูงสุด ไร้การเปิดเผยแก่บุคคลภายนอก</span>
              </div>
            </div>

            {/* Right Column: Imagery & Privileges */}
            <div className="lg:col-span-5 flex flex-col space-y-space-lg">
              <div className="relative rounded-lg overflow-hidden bg-surface-container shadow-sm group">
                <div className="w-full h-80 sm:h-96 overflow-hidden">
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    alt="Intimate Thai boutique massage treatment suite with natural warm teak wood walls, pristine white linen covered massage bed, herbal compress balls on a rustic carved wooden tray, soft diffused sunlight streaming through wooden louvers, tranquil tropical greenery visible outside, serene luxury spa sanctuary atmosphere"
                    src="/images/auth/register-suite.jpg"
                  />
                </div>
                <div className="p-space-md bg-surface-container-low flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps text-label-caps uppercase text-secondary">PRIVATE SUITE</span>
                    <span className="font-label-caps text-label-caps text-primary">KHON KAEN RETREAT</span>
                  </div>
                  <p className="font-headline-sm text-headline-sm text-on-surface">สุนทรียะแห่งความเงียบสงบ</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    ทุกการจองจัดเตรียมห้องรับรองส่วนตัว เครื่องหอมไทยโบราณ และน้ำดื่มชาสมุนไพรต้มสดเฉพาะบุคคล
                  </p>
                </div>
              </div>

              <div className="bg-surface-container-low p-space-lg rounded-lg space-y-space-md">
                <div className="space-y-1">
                  <span className="font-label-caps text-label-caps uppercase text-primary tracking-widest block">
                    MEMBER PRIVILEGES
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    เอกสิทธิ์การเป็นสมาชิก FIWDEE
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    ความใส่ใจในรายละเอียดเพื่อให้ช่วงเวลาแห่งการผ่อนคลายไร้รอยต่อ
                  </p>
                </div>
                <div className="space-y-space-md pt-space-xs">
                  <div className="flex items-start gap-space-sm">
                    <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center shrink-0 text-primary">
                      <span className="material-symbols-outlined text-base">spa</span>
                    </div>
                    <div>
                      <h3 className="font-label-md text-label-md text-on-surface font-semibold">
                        การันตีห้องเดี่ยวส่วนตัว (Private Suite)
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        ไร้เสียงรบกวน พร้อมปรับอุณหภูมิห้องและดนตรีบำบัดคลื่นเสียงธรรมชาติ (Singing Bowl) ตามต้องการ
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-space-sm">
                    <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center shrink-0 text-primary">
                      <span className="material-symbols-outlined text-base">person</span>
                    </div>
                    <div>
                      <h3 className="font-label-md text-label-md text-on-surface font-semibold">
                        บันทึกสรีระและน้ำหนักมือนวด
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        ระบบจดจำความพึงพอใจและจุดเมื่อยล้าสะสม เพื่อให้เธอราพิสต์จัดเตรียมสมุนไพรอบและบาล์มที่ตรงจุด
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-space-sm">
                    <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center shrink-0 text-primary">
                      <span className="material-symbols-outlined text-base">event_available</span>
                    </div>
                    <div>
                      <h3 className="font-label-md text-label-md text-on-surface font-semibold">
                        ความยืดหยุ่นในการเลื่อนนัดหมาย
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        สิทธิ์เลื่อนเวลาเข้ารับบริการล่วงหน้าอย่างสะดวกผ่านหน้าโปรไฟล์ โดยไม่มีค่าธรรมเนียมเพิ่มเติม
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-space-md pt-space-md bg-surface-container/50 p-space-sm rounded text-center">
                  <p className="font-headline-sm text-headline-sm italic text-secondary leading-snug">
                    “พักผ่อน คืนความเบาสบายสู่ร่างกายและจิตใจ”
                  </p>
                  <span className="block mt-1 font-label-caps text-label-caps uppercase text-outline">
                    FIWDEE WELLNESS PHILOSOPHY
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reassurance Bottom Note */}
        <section className="w-full bg-surface-container-lowest py-space-md">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-space-sm text-center md:text-left">
            <div className="flex items-center gap-space-xs text-secondary font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-primary text-base">call</span>
              <span>หากต้องการความช่วยเหลือในการลงทะเบียนหรือจองรอบด่วน โทร 043-XXX-XXXX</span>
            </div>
            <div className="font-label-caps text-label-caps uppercase text-secondary">
              เปิดบริการทุกวัน: 10:00 – 21:30 น. (รับคิวสุดท้าย 20:00 น.)
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
