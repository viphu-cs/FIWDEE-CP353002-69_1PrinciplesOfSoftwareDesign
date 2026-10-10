import { useLanguage } from '../../i18n/useLanguage.js'
import { shop } from '../../data/mock.js'

const footerLinks = [
  { key: 'home', href: '#top' },
  { key: 'therapists', href: '#therapists' },
  { key: 'services', href: '#services' },
  { key: 'about', href: '#about' },
  { key: 'book', href: '#therapists' },
]

const socialLinks = [
  { label: 'INSTAGRAM', href: '#' },
  { label: 'LINE OFFICIAL', href: '#' },
  { label: 'FACEBOOK', href: '#' },
]

export default function Footer({ onNavigate }) {
  const { t } = useLanguage()

  const handleLinkClick = (e, link) => {
    if (onNavigate) {
      e.preventDefault()
      onNavigate(link.key)
    }
  }

  return (
    <footer className="w-full bg-primary-container transition-colors">
      <div className="max-w-6xl mx-auto px-6 py-space-2xl">
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-space-xl pb-space-xl border-b border-warm-ivory/15">
          <div className="space-y-space-xs max-w-xs">
            <div className="font-headline-md text-headline-md text-warm-ivory font-normal tracking-widest text-xl">
              {shop.name}
            </div>
            <p className="font-body-sm text-body-sm text-warm-ivory/70 tracking-wide">
              {t('footer.tagline')} — {t('location.city')}
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-space-lg gap-y-space-sm">
            {footerLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                className="font-label-lg text-label-lg text-warm-ivory/70 hover:text-warm-ivory transition-colors duration-200 cursor-pointer"
              >
                {t(`nav.${link.key}`)}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-space-lg">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-label-lg text-label-lg text-warm-ivory/70 hover:text-warm-ivory transition-colors duration-200 uppercase"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <p className="font-body-sm text-body-sm text-warm-ivory/50 tracking-wider">
            {t('footer.rights')}
          </p>
          <p className="font-label-md text-label-md uppercase text-warm-ivory/50 tracking-widest">
            {t('footer.motto')}
          </p>
        </div>
      </div>
    </footer>
  )
}
