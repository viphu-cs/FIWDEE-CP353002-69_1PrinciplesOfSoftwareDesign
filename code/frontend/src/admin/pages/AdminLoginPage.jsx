import React, { useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'

export default function AdminLoginPage() {
  const { login } = useAdminAuth()
  const { lang, setLang, t } = useLanguage()
  const [email, setEmail] = useState('owner@fiwdee-massage.co.th')
  const [password, setPassword] = useState('admin1234')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleLang = () => setLang(lang === 'th' ? 'en' : 'th')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
    } catch (err) {
      setError(err.message || t('admin.errLoginFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleQuickFill = (targetRole) => {
    if (targetRole === 'OWNER') {
      setEmail('owner@fiwdee-massage.co.th')
      setPassword('admin1234')
    } else {
      setEmail('reception@fiwdee-massage.co.th')
      setPassword('recep1234')
    }
  }

  return (
    <div className="min-h-screen bg-warm-ivory flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-body-md">
      {/* Subtle Background Glow Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-terracotta/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-wood-deep/10 rounded-full blur-3xl pointer-events-none" />

      {/* Language Toggle Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <button
          type="button"
          onClick={toggleLang}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface hover:bg-surface-container text-teak-deep border border-outline-variant text-xs font-semibold uppercase cursor-pointer transition-colors shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>{lang === 'th' ? 'EN' : 'TH'}</span>
        </button>
      </div>

      <div className="max-w-md w-full bg-surface/95 backdrop-blur-xl rounded-3xl border border-outline-variant p-8 shadow-xl relative z-10 space-y-6">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-terracotta to-wood-deep text-warm-ivory font-bold font-headline text-2xl flex items-center justify-center mx-auto shadow-lg">
            F
          </div>
          <h1 className="font-headline font-bold text-2xl text-teak-deep tracking-wider">
            FIWDEE
          </h1>
          <p className="text-xs uppercase tracking-widest text-terracotta-deep font-semibold">
            {t('admin.loginSubtitle')}
          </p>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant space-y-2">
          <div className="text-[11px] font-semibold uppercase text-charcoal-muted tracking-wider text-center">
            {lang === 'th' ? 'เลือกบัญชีทดสอบ:' : 'Select Demo Credentials:'}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('OWNER')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                email === 'owner@fiwdee-massage.co.th'
                  ? 'bg-teak-dark text-on-primary border-teak-dark'
                  : 'bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container'
              }`}
            >
              {t('admin.owner')}
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('RECEPTIONIST')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                email === 'reception@fiwdee-massage.co.th'
                  ? 'bg-teak-dark text-on-primary border-teak-dark'
                  : 'bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container'
              }`}
            >
              {t('admin.receptionist')}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-1.5">
              {t('admin.email')}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@fiwdee-massage.co.th"
              className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant text-on-surface text-sm placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-terracotta/35 focus:border-wood-deep transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-1.5">
              {t('admin.password')}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant text-on-surface text-sm placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-terracotta/35 focus:border-wood-deep transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-terracotta to-wood-deep hover:from-terracotta-deep hover:to-teak-deep text-warm-ivory font-semibold text-sm shadow-lg transition-all cursor-pointer mt-2 disabled:opacity-70"
          >
            {loading ? '...' : t('admin.signIn')}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-outline-variant">
          <p className="text-[11px] text-charcoal-muted">
            FIWDEE Massage Management System · Professional Edition
          </p>
        </div>
      </div>
    </div>
  )
}
