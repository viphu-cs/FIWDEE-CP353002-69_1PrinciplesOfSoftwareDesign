import { motion, useScroll, useTransform } from 'motion/react'
import { useLanguage } from '../../i18n/useLanguage.js'
import { images } from '../../data/mock.js'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.25 } },
}

const item = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
}

export default function Hero({ ready = true }) {
  const { t } = useLanguage()
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
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-primary/30"></div>

        {/* 🎬 ข้อความ: มือถือกึ่งกลาง / desktop มุมซ้ายล่างแบบเดิม */}
        <div className="absolute inset-0 flex items-center justify-center md:items-end">
          <div className="max-w-6xl mx-auto w-full px-6 md:pb-[7.5rem]">
            <motion.div
              style={{ y: textY, opacity: textOpacity }}
              className="max-w-2xl mx-auto md:mx-0 text-center md:text-left"
            >
              {/* 🎬 Staggered entrance: eyebrow → heading ไล่เข้ามาทีละชิ้น (เริ่มหลัง preloader) */}
              <motion.div variants={container} initial="hidden" animate={ready ? 'visible' : 'hidden'}>
                <motion.p
                  variants={item}
                  className="font-label-lg text-label-lg uppercase text-charcoal-muted tracking-widest mb-space-md"
                >
                  {t('hero.eyebrow')}
                </motion.p>
                <motion.h1
                  variants={item}
                  className="text-balance font-display text-display text-primary leading-tight tracking-tight"
                >
                  {t('hero.title1')}
                  <br />
                  <span className="font-normal text-charcoal-soft">{t('hero.title2')}</span>
                </motion.h1>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* 🎬 Scroll indicator: ลูกศรเด้งเบา ๆ บอกว่าเลื่อนลงต่อได้ (กดแล้วเลื่อนลงมาด้านล่างอย่างนุ่มนวล) */}
        <motion.button
          type="button"
          onClick={() => {
            const target = document.getElementById('therapists')
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' })
            } else {
              window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' })
            }
          }}
          aria-label={t('common.scrollDown')}
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="absolute bottom-7 left-0 right-0 mx-auto w-fit flex flex-col items-center gap-1.5 text-charcoal-soft transition-colors duration-200 hover:text-primary cursor-pointer bg-transparent border-0 outline-none"
        >
          <span className="font-label-md text-label-md uppercase tracking-widest">
            {t('common.scrollDown')}
          </span>
          <motion.svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={ready ? { y: [0, 7, 0] } : { y: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="m6 9 6 6 6-6" />
          </motion.svg>
        </motion.button>
      </div>
    </section>
  )
}
