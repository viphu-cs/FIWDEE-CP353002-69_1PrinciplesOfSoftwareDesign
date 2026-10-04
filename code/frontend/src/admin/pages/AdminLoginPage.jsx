import React, { useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'

export default function AdminLoginPage() {
  const { login } = useAdminAuth()
  const { lang, setLang, t } = useLanguage()
  const [email, setEmail] = useState('owner@fiwdee-massage.co.th')
  const [password, setPassword] = useState('12345678')
  const [role, setRole] = useState('OWNER')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleLang = () => setLang(lang === 'th' ? 'en' : 'th')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      login(email, password, role)
    } catch (err) {
      setError(err.message || 'การเข้าสู่ระบบล้มเหลว กรุณาตรวจสอบข้อมูลอีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickFill = (targetRole) => {
    if (targetRole === 'OWNER') {
      setEmail('owner@fiwdee-massage.co.th')
      setPassword('admin1234')
      setRole('OWNER')
    } else {
      setEmail('reception@fiwdee-massage.co.th')
      setPassword('recep1234')
      setRole('RECEPTIONIST')
    }
  }

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-body-md">
      {/* Subtle Background Glow Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-900/15 rounded-full blur-3xl pointer-events-none" />

      {/* Language Toggle Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <button
          type="button"
          onClick={toggleLang}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold uppercase cursor-pointer transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>{lang === 'th' ? 'EN' : 'TH'}</span>
        </button>
      </div>

      <div className="max-w-md w-full bg-stone-950/90 backdrop-blur-xl rounded-3xl border border-stone-800 p-8 shadow-2xl relative z-10 space-y-6">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-900 text-white font-bold font-headline text-2xl flex items-center justify-center mx-auto shadow-lg">
            F
          </div>
          <h1 className="font-headline font-bold text-2xl text-stone-100 tracking-wider">
            FIWDEE
          </h1>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">
            {t('admin.loginSubtitle')}
          </p>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="p-3 bg-stone-900/80 rounded-2xl border border-stone-800 space-y-2">
          <div className="text-[11px] font-semibold uppercase text-stone-400 tracking-wider text-center">
            {lang === 'th' ? 'เลือกสิทธิ์เข้าใช้งานสาธิต:' : 'Select Demo Credentials:'}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('OWNER')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                role === 'OWNER'
                  ? 'bg-amber-900/80 text-amber-100 border-amber-700'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
              }`}
            >
              {t('admin.owner')}
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('RECEPTIONIST')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                role === 'RECEPTIONIST'
                  ? 'bg-amber-900/80 text-amber-100 border-amber-700'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
              }`}
            >
              {t('admin.receptionist')}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              {t('admin.email')}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@fiwdee-massage.co.th"
              className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/60 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              {t('admin.password')}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/60 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              {t('admin.role')}
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/60 transition-all cursor-pointer"
            >
              <option value="OWNER">{t('admin.owner')}</option>
              <option value="RECEPTIONIST">{t('admin.receptionist')}</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-stone-100 font-semibold text-sm shadow-lg transition-all cursor-pointer mt-2"
          >
            {loading ? '...' : t('admin.signIn')}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-stone-800/80">
          <p className="text-[11px] text-stone-500">
            FIWDEE Massage Management System · Professional Edition
          </p>
        </div>
      </div>
    </div>
  )
}
