import React from 'react'
import { motion } from 'motion/react'

const EASE_ENTER = [0.22, 1, 0.36, 1]

/**
 * BookingStepNav - คอมโพเนนต์ Stepper นำทางด้านบน (SRP: จัดการเฉพาะ Step Navigation Ribbon)
 */
export default function BookingStepNav({ step, setStep, onNavigate }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE_ENTER }}
      className="w-full bg-surface-container-low py-space-md border-b border-surface-container-high/60"
    >
      <div className="max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
        <div className="flex flex-wrap items-center justify-between gap-y-space-xs text-secondary">
          <div className="flex items-center gap-space-sm sm:gap-space-md">
            {/* Step 1 Button */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${
                step === 1 ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span
                className={`font-label-caps text-label-caps tracking-widest ${
                  step === 1 ? 'text-primary font-bold' : 'text-secondary'
                }`}
              >
                01
              </span>
              <span
                className={`font-label-md text-label-md ${
                  step === 1
                    ? 'text-primary font-medium'
                    : 'text-secondary underline underline-offset-4 decoration-outline-variant'
                }`}
              >
                เลือกหมอนวดและบริการ
              </span>
            </button>

            <span className="text-outline-variant font-light">—</span>

            {/* Step 2 Button */}
            <button
              type="button"
              onClick={() => setStep(2)}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${
                step === 2
                  ? 'text-primary'
                  : step > 2
                    ? 'text-on-surface-variant hover:text-primary'
                    : 'opacity-60 text-secondary'
              }`}
            >
              {step === 2 && <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>}
              <span
                className={`font-label-caps text-label-caps tracking-widest ${
                  step === 2 ? 'text-primary font-bold' : 'text-secondary'
                }`}
              >
                02
              </span>
              <span
                className={`font-label-md text-label-md ${
                  step === 2
                    ? 'text-on-surface font-semibold'
                    : step > 2
                      ? 'underline underline-offset-4 decoration-outline-variant'
                      : 'text-secondary'
                }`}
              >
                วันและรอบเวลา
              </span>
            </button>

            <span className="text-outline-variant font-light hidden sm:inline">—</span>

            {/* Step 3 Button */}
            <button
              type="button"
              onClick={() => setStep(3)}
              className={`hidden sm:flex items-center gap-2 cursor-pointer transition-colors ${
                step === 3 ? 'text-primary font-semibold' : 'opacity-40 text-secondary'
              }`}
            >
              {step === 3 && <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>}
              <span
                className={`font-label-caps text-label-caps tracking-widest ${
                  step === 3 ? 'text-primary font-bold' : 'text-secondary'
                }`}
              >
                03
              </span>
              <span
                className={`font-label-md text-label-md ${
                  step === 3 ? 'text-primary font-semibold' : 'text-secondary'
                }`}
              >
                ชำระเงินและยืนยัน
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate?.('login')}
              className="inline-flex items-center gap-1.5 text-secondary hover:text-primary transition-colors cursor-pointer text-xs sm:text-sm font-medium group py-1 px-2.5 rounded hover:bg-surface-container"
              title="ย้อนกลับไปหน้าเข้าสู่ระบบ"
            >
              <span className="material-symbols-outlined text-base transition-transform duration-200 group-hover:-translate-x-1">
                arrow_back
              </span>
              <span>ย้อนกลับไปหน้าเข้าสู่ระบบ</span>
            </button>
            <span className="text-outline-variant font-light hidden sm:inline">|</span>
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest hidden sm:inline">
              ขั้นตอนที่ {step} จาก 3
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
