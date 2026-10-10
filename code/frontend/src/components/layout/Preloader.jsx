import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { shop } from '../../data/mock.js'

const DURATION_MS = 900 // รวมเร็ว ~1.1 วิ รวมช่วงพักที่ 100%

// 🎬 Preloader: ม่านโหลด 0–100% ตอนเปิดเว็บ/รีเฟรช — นับแบบ ease-out (เร่งตอนต้น) แล้วยกม่านขึ้น
export default function Preloader({ onDone }) {
  const [progress, setProgress] = useState(0)
  const doneRef = useRef(false)

  useEffect(() => {
    // 🎬 รีเฟรช = เริ่มที่บนสุดเสมอ (ปิด browser scroll restoration ที่พากลับตำแหน่งเดิม
    // ทำให้ hero/preloader เล่นจังหวะพลาดและผู้ใช้เจอหน้าค้างกลางเว็บตอนรีเฟรช)
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    document.body.style.overflow = 'hidden' // ล็อก scroll ระหว่างโหลด
    let raf
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min((now - start) / DURATION_MS, 1)
      const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic: เร็วตอนต้น นุ่มตอนจบ
      setProgress(Math.round(eased * 100))
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else if (!doneRef.current) {
        doneRef.current = true
        setTimeout(onDone, 180) // ค้างที่ 100% แป๊บเดียวก่อนยกม่าน
      }
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      document.body.style.overflow = ''
    }
  }, [onDone])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-teak-deep text-warm-ivory"
      exit={{ y: '-100%' }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
      role="status"
      aria-label="กำลังโหลดหน้าเว็บ"
    >
      <p className="font-label-md text-label-md uppercase tracking-widest text-warm-ivory/60 mb-4">
        {shop.name} MASSAGE &amp; WELLNESS
      </p>

      <div className="font-display text-7xl leading-none tabular-nums">
        {progress}
        <span className="text-2xl align-top text-warm-ivory/70">%</span>
      </div>

      {/* แถบ progress บาง ๆ (transition กันตัวเลข/แถบกระตุกเป็นจังหวะ) */}
      <div className="mt-6 h-px w-56 bg-warm-ivory/20 overflow-hidden">
        <div
          className="h-full bg-warm-ivory transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  )
}
