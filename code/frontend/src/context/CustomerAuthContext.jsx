import { createContext, useContext, useState } from 'react'

const CustomerAuthContext = createContext()

const CUSTOMER_AUTH_KEY = 'fiwdee_customer_auth'
const TOKEN_KEY = 'fiwdee_token'

// โปรไฟล์เก็บ localStorage (ติ๊ก "คงสถานะการเข้าสู่ระบบ") หรือ sessionStorage — token อยู่ localStorage เสมอ
const readStoredProfile = () => {
  try {
    const raw = localStorage.getItem(CUSTOMER_AUTH_KEY) || sessionStorage.getItem(CUSTOMER_AUTH_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function CustomerAuthProvider({ children }) {
  const [user, setUser] = useState(readStoredProfile)
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem(TOKEN_KEY) && !!readStoredProfile()
  )

  // เขียนโปรไฟล์ลง storage เดิมที่ใช้ก่อนหน้า (localStorage มี priority เพราะ "คงสถานะ")
  const persistProfile = (profile) => {
    const store = localStorage.getItem(CUSTOMER_AUTH_KEY) ? localStorage : sessionStorage
    store.setItem(CUSTOMER_AUTH_KEY, JSON.stringify(profile))
  }

  // รับ data จาก POST /api/auth/login | /api/auth/register (AuthResponseDTO) — auto-login ทันที
  const login = (data, rememberMe = true) => {
    const profile = {
      id: data.userId,
      name: data.fullName,
      email: data.email,
      identifier: data.email,
      role: data.role,
      loginAt: new Date().toISOString(),
    }
    localStorage.setItem(TOKEN_KEY, data.token)
    const store = rememberMe ? localStorage : sessionStorage
    store.setItem(CUSTOMER_AUTH_KEY, JSON.stringify(profile))
    setUser(profile)
    setIsAuthenticated(true)
    return profile
  }

  // ใช้หลัง PUT /api/auth/me สำเร็จ — ให้ชื่อ/อีเมลบน navbar กับ storage อัปเดตตาม
  const updateUser = (updates) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...updates }
      persistProfile(next)
      return next
    })
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(CUSTOMER_AUTH_KEY)
    sessionStorage.removeItem(CUSTOMER_AUTH_KEY)
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <CustomerAuthContext.Provider value={{ user, isAuthenticated, login, logout, updateUser }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext)
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider')
  }
  return context
}
