import { shop } from '../../data/mock.js'

const footerLinks = [
  { label: 'หน้าแรก', href: '#top' },
  { label: 'หมอนวด', href: '#therapists' },
  { label: 'บริการ', href: '#services' },
  { label: 'เกี่ยวกับเรา', href: '#location' },
  { label: 'จองคิว', href: '#therapists' },
]

const socialLinks = [
  { label: 'INSTAGRAM', href: '#' },
  { label: 'LINE OFFICIAL', href: '#' },
  { label: 'FACEBOOK', href: '#' },
]

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low transition-colors">
      <div className="max-w-6xl mx-auto px-6 py-space-2xl">
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-space-xl pb-space-xl border-b border-surface-container-highest">
          <div className="space-y-space-xs max-w-xs">
            <div className="font-headline-md text-headline-md text-primary font-normal tracking-widest text-xl">
              {shop.name}
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant tracking-wide">
              {shop.tagline} — {shop.city}
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-space-lg gap-y-space-sm">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-space-lg">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors duration-200 uppercase"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <p className="font-body-sm text-body-sm text-charcoal-muted tracking-wider">
            © {shop.name} Boutique Massage &amp; Retreat. สงวนลิขสิทธิ์
          </p>
          <p className="font-label-md text-label-md uppercase text-charcoal-muted tracking-widest">
            SANCTUARY FOR BODY &amp; MIND
          </p>
        </div>
      </div>
    </footer>
  )
}
