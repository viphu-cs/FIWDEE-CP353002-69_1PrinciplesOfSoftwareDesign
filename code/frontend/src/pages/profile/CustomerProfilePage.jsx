import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { useLanguage } from '../../i18n/useLanguage.js'
import { useCustomerAuth } from '../../context/CustomerAuthContext.jsx'

const PRESSURE_OPTIONS = ['SOFT', 'MEDIUM', 'HARD']

const initialForm = {
  fullName: '',
  email: '',
  phoneNumber: '',
  healthNotes: '',
  preferredPressure: '',
}

export default function CustomerProfilePage({ onNavigate }) {
  const { t, lang } = useLanguage()
  const { user, updateUser } = useCustomerAuth()
  const [form, setForm] = useState(initialForm)
  const [account, setAccount] = useState({ username: '', registeredAt: null, totalBookings: null })
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [feedbackError, setFeedbackError] = useState(false)

  const avatarInitial = (user?.name || '?').trim().charAt(0).toUpperCase()

  const loadProfile = async () => {
    setLoading(true)
    setLoadError(false)
    const res = await api.get('/auth/me')
    if (!res.success || !res.data) {
      setLoading(false)
      setLoadError(true)
      return
    }
    const profile = res.data
    setForm({
      fullName: profile.name || '',
      email: profile.email || '',
      phoneNumber: profile.phone || '',
      healthNotes: profile.healthNotes || '',
      preferredPressure: profile.preferredPressure || '',
    })
    setAccount({
      username: profile.username || '',
      registeredAt: profile.registeredAt || null,
      totalBookings: profile.totalBookings ?? null,
    })
    setLoading(false)
  }

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setField = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }))
  }

  const setPasswordField = (key) => (event) => {
    setPasswords((prev) => ({ ...prev, [key]: event.target.value }))
  }

  const resetPasswords = () => setPasswords({ current: '', next: '', confirm: '' })

  const handleSave = async (event) => {
    event.preventDefault()
    setFeedback('')
    setFeedbackError(false)

    if (passwords.next && passwords.next !== passwords.confirm) {
      setFeedbackError(true)
      setFeedback(t('profile.errPasswordMismatch'))
      return
    }

    setSaving(true)
    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      healthNotes: form.healthNotes.trim() || null,
      preferredPressure: form.preferredPressure || null,
    }
    if (passwords.next) {
      payload.currentPassword = passwords.current
      payload.newPassword = passwords.next
    }

    const res = await api.put('/auth/me', payload)
    setSaving(false)

    if (!res.success) {
      setFeedbackError(true)
      setFeedback(res.message || t('profile.errSaveFailed'))
      return
    }

    updateUser({ name: res.data.name, email: res.data.email })
    resetPasswords()
    setFeedback(t('profile.saved'))
  }

  const handleCancel = () => {
    setFeedback('')
    setFeedbackError(false)
    resetPasswords()
    loadProfile()
  }

  const formatDate = (value) => {
    if (!value) return '—'
    return new Date(value).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const inputClass =
    'w-full px-space-md py-2.5 rounded bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline/60 focus:outline-none focus:bg-surface-container transition-colors'
  // คอลัมน์ชื่อฟิลด์ของตาราง (ความกว้างคงที่ให้ทุกแถวตรงกัน)
  const labelCellClass = 'w-40 sm:w-52 px-4 py-3 align-top font-label-caps text-label-caps uppercase tracking-wider text-secondary whitespace-nowrap'
  const valueCellClass = 'px-4 py-3 font-body-md text-body-md text-on-surface'
  const sectionHeaderClass = 'px-4 py-3 border-b border-outline-variant/40 bg-surface-container font-label-caps text-label-caps uppercase tracking-widest text-secondary'

  // แถวตารางแบบอ่านอย่างเดียว / แถวฟอร์ม (label | value)
  const InfoRow = ({ label, value }) => (
    <tr className="border-b border-outline-variant/30 last:border-0">
      <th scope="row" className={labelCellClass}>{label}</th>
      <td className={`${valueCellClass} font-medium`}>{value}</td>
    </tr>
  )

  const FormRow = ({ label, htmlFor, required, children }) => (
    <tr className="border-b border-outline-variant/30 last:border-0">
      <th scope="row" className={labelCellClass}>
        <label htmlFor={htmlFor}>
          {label} {required && <span className="text-primary normal-case">*</span>}
        </label>
      </th>
      <td className={valueCellClass}>{children}</td>
    </tr>
  )

  return (
    <main className="w-full pt-20 bg-surface min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-4xl mx-auto px-6 py-space-lg md:py-space-xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-space-xs text-secondary mb-space-lg font-label-caps uppercase tracking-widest text-label-caps">
          <button
            type="button"
            onClick={() => onNavigate?.('home')}
            className="inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>{t('profile.backToHome')}</span>
          </button>
          <span>—</span>
          <span className="text-primary font-semibold">{t('profile.title')}</span>
        </div>

        {/* Heading */}
        <div className="space-y-space-xs mb-space-lg">
          <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest block">
            {t('profile.eyebrow')}
          </span>
          <h1 className="font-headline-lg text-headline-lg text-primary">{t('profile.title')}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">{t('profile.subtitle')}</p>
        </div>

        {loading ? (
          <div className="p-space-xl rounded-xl bg-surface-container-low font-body-md text-body-md text-on-surface-variant text-center">
            <span className="material-symbols-outlined text-3xl animate-spin inline-block">progress_activity</span>
          </div>
        ) : loadError ? (
          <div className="p-space-xl rounded-xl bg-surface-container-low text-center space-y-space-md">
            <p className="font-body-md text-body-md text-on-surface-variant">{t('profile.errLoading')}</p>
            <button
              type="button"
              onClick={loadProfile}
              className="px-6 py-2.5 rounded-full bg-primary text-surface font-label-md text-label-md uppercase cursor-pointer hover:opacity-90 transition-opacity"
            >
              {t('profile.retry')}
            </button>
          </div>
        ) : (
          <div className="space-y-space-lg">
            {/* ตาราง 1: ข้อมูลบัญชี (อ่านอย่างเดียว) */}
            <section className="rounded-xl border border-outline-variant/40 bg-surface-container-low overflow-hidden shadow-xs">
              <header className="flex items-center gap-space-md px-4 py-3 border-b border-outline-variant/40 bg-surface-container">
                <span className="w-11 h-11 rounded-full bg-primary text-surface grid place-items-center font-label-md text-label-md font-semibold shrink-0">
                  {avatarInitial}
                </span>
                <div className="min-w-0">
                  <p className="font-headline-sm text-headline-sm text-on-surface truncate">{user?.name}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{form.email}</p>
                </div>
                <span className="ml-auto hidden sm:inline-flex font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                  {t('profile.accountInfo')}
                </span>
              </header>
              <table className="w-full text-left">
                <tbody>
                  <InfoRow label={t('profile.username')} value={account.username || '—'} />
                  <InfoRow
                    label={t('profile.role')}
                    value={
                      <span className="inline-flex px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-caps text-label-caps uppercase tracking-wider">
                        {t('profile.roleCustomer')}
                      </span>
                    }
                  />
                  <InfoRow label={t('profile.registeredAt')} value={account.registeredAt ? formatDate(account.registeredAt) : '—'} />
                  <InfoRow label={t('profile.totalBookings')} value={account.totalBookings ?? '—'} />
                </tbody>
              </table>
            </section>

            {/* ตาราง 2 + 3: ฟอร์มแก้ไข */}
            <form onSubmit={handleSave} className="space-y-space-lg">
              <section className="rounded-xl border border-outline-variant/40 bg-surface-container-low overflow-hidden shadow-xs">
                <header className={sectionHeaderClass}>{t('profile.personalInfo')}</header>
                <table className="w-full text-left">
                  <tbody>
                    <FormRow label={t('profile.fullName')} htmlFor="profile-fullName" required>
                      <input
                        className={inputClass}
                        id="profile-fullName"
                        required
                        type="text"
                        value={form.fullName}
                        onChange={setField('fullName')}
                      />
                    </FormRow>
                    <FormRow label={t('profile.email')} htmlFor="profile-email" required>
                      <input
                        className={inputClass}
                        id="profile-email"
                        required
                        type="email"
                        value={form.email}
                        onChange={setField('email')}
                      />
                    </FormRow>
                    <FormRow label={t('profile.phone')} htmlFor="profile-phone" required>
                      <input
                        className={inputClass}
                        id="profile-phone"
                        required
                        type="tel"
                        value={form.phoneNumber}
                        onChange={setField('phoneNumber')}
                      />
                    </FormRow>
                    <FormRow label={t('profile.preferredPressure')} htmlFor="profile-pressure">
                      <select
                        className={inputClass}
                        id="profile-pressure"
                        value={form.preferredPressure}
                        onChange={setField('preferredPressure')}
                      >
                        <option value="">{t('profile.pressureNone')}</option>
                        {PRESSURE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {t(`profile.pressure${option.charAt(0)}${option.slice(1).toLowerCase()}`)}
                          </option>
                        ))}
                      </select>
                    </FormRow>
                    <FormRow label={t('profile.healthNotes')} htmlFor="profile-healthNotes">
                      <textarea
                        className={`${inputClass} min-h-20 resize-y`}
                        id="profile-healthNotes"
                        placeholder={t('profile.healthNotesPlaceholder')}
                        value={form.healthNotes}
                        onChange={setField('healthNotes')}
                      />
                    </FormRow>
                  </tbody>
                </table>
              </section>

              <section className="rounded-xl border border-outline-variant/40 bg-surface-container-low overflow-hidden shadow-xs">
                <header className={sectionHeaderClass}>{t('profile.passwordSection')}</header>
                <table className="w-full text-left">
                  <tbody>
                    <tr className="border-b border-outline-variant/30">
                      <th scope="row" className={labelCellClass}></th>
                      <td className="px-4 py-2 font-body-sm text-body-sm text-on-surface-variant">
                        {t('profile.passwordHint')}
                      </td>
                    </tr>
                    <FormRow label={t('profile.currentPassword')} htmlFor="profile-current-password">
                      <input
                        autoComplete="current-password"
                        className={inputClass}
                        id="profile-current-password"
                        type="password"
                        value={passwords.current}
                        onChange={setPasswordField('current')}
                      />
                    </FormRow>
                    <FormRow label={t('profile.newPassword')} htmlFor="profile-new-password">
                      <input
                        autoComplete="new-password"
                        className={inputClass}
                        id="profile-new-password"
                        type="password"
                        value={passwords.next}
                        onChange={setPasswordField('next')}
                      />
                    </FormRow>
                    <FormRow label={t('profile.confirmPassword')} htmlFor="profile-confirm-password">
                      <input
                        autoComplete="new-password"
                        className={inputClass}
                        id="profile-confirm-password"
                        type="password"
                        value={passwords.confirm}
                        onChange={setPasswordField('confirm')}
                      />
                    </FormRow>
                  </tbody>
                </table>
              </section>

              {/* Actions + feedback */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md">
                <button
                  className="px-space-lg py-3 rounded bg-primary text-on-primary font-label-md text-label-md tracking-wider flex items-center justify-center gap-2 hover:opacity-95 transition-opacity active:scale-[0.99] cursor-pointer disabled:opacity-70"
                  disabled={saving}
                  type="submit"
                >
                  <span className="material-symbols-outlined text-lg">save</span>
                  <span>{saving ? t('profile.saving') : t('profile.save')}</span>
                </button>
                <button
                  className="px-space-lg py-3 rounded border border-outline-variant font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:border-on-surface-variant transition-colors cursor-pointer disabled:opacity-50"
                  disabled={saving}
                  onClick={handleCancel}
                  type="button"
                >
                  {t('profile.cancel')}
                </button>
                {feedback && (
                  <div
                    className={`flex-1 p-space-sm rounded font-body-sm text-body-sm text-center ${
                      feedbackError
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-secondary-container text-on-secondary-container'
                    }`}
                  >
                    {feedback}
                  </div>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}
