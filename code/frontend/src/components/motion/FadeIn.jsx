import { motion } from 'motion/react'

// รูปแบบ animation ที่ใช้ซ้ำได้ทั้งเว็บ
const variants = {
  up: { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } },
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  scale: { hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1 } },
  left: { hidden: { opacity: 0, x: -36 }, visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 36 }, visible: { opacity: 1, x: 0 } },
}

// FadeIn — ค่อย ๆ ปรากฏเมื่อ scroll เข้ามาถึง (เล่นครั้งเดียวพอ)
// variant: up | fade | scale | left | right, delay: วินาที (ใช้ทำ stagger ทีละชิ้น)
export default function FadeIn({
  variant = 'up',
  delay = 0,
  duration = 0.65,
  amount = 0.25,
  className,
  children,
  ...rest
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      variants={variants[variant] ?? variants.up}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
