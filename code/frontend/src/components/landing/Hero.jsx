import { motion, useScroll, useTransform } from 'motion/react'
import { images, shop } from '../../data/mock.js'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.25 } },
}

const item = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
}

export default function Hero({ ready = true }) {
  const { scrollY } = useScroll()
  // 🎬 Parallax: เลื่อนลง 600px ข้อความค่อย ๆ ลอยขึ้นและจางหาย (transform+opacity เท่านั้น)
  const textY = useTransform(scrollY, [0, 600], [0, -70])
  const textOpacity = useTransform(scrollY, [0, 480], [1, 0])

  return (
    <section className="relative w-full overflow-hidden -mt-20">
      <div className="relative w-full h-[88vh] min-h-[640px] max-h-[880px]">
        {/* 🎬 ภาพพื้นหลัง: zoom ช้า ๆ หลังม่าน preloader ยกออก */}
        <motion.div
          initial={{ scale: 1.12 }}
          animate={ready ? { scale: 1 } : { scale: 1.12 }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url("${images.hero}")` }}
        ></motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-primary/30"></div>

        <div className="absolute inset-0 flex items-end">
          <div className="max-w-6xl mx-auto w-full px-6 pb-space-2xl">
            <motion.div style={{ y: textY, opacity: textOpacity }} className="max-w-2xl">
              {/* 🎬 Staggered entrance: eyebrow → heading → ปุ่ม ไล่เข้ามาทีละชิ้น (เริ่มหลัง preloader) */}
              <motion.div
                variants={container}
                initial="hidden"
                animate={ready ? 'visible' : 'hidden'}
              >
                <motion.p
                  variants={item}
                  className="font-label-lg text-label-lg uppercase text-charcoal-muted tracking-widest mb-space-sm"
                >
                  {shop.name} MASSAGE
                </motion.p>
                <motion.h1
                  variants={item}
                  className="font-display text-display text-primary leading-tight tracking-tight mb-space-md"
                >
                  เลือกหมอนวดที่ใช่
                  <br />
                  <span className="font-normal text-charcoal-soft">สำหรับช่วงเวลาของคุณ</span>
                </motion.h1>
                <motion.div variants={item} className="pt-space-sm">
                  {/* TODO: เชื่อมกับหน้า /booking เมื่อทำหน้าจองคิว */}
                  <a
                    href="#therapists"
                    className="btn-lift inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-teak-dark text-warm-ivory font-label-lg text-label-lg uppercase tracking-wider hover:bg-teak-deep shadow-md cursor-pointer"
                  >
                    จองคิว
                  </a>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
