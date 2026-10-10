import { createContext, useContext, useEffect, useState } from 'react'

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

  // ซิงก์สถานะกับ storage เสมอเมื่อมีการเปลี่ยนแปลง (เช่น logout จากฝั่ง Admin หรือแท็บอื่น)
  // และซิงก์เมื่อ hash เปลี่ยนกลับมาที่หน้าเว็บหลัก
  useEffect(() => {
    const syncState = () => {
      const stored = readStoredProfile()
      const hasToken = !!localStorage.getItem(TOKEN_KEY)
      setUser(stored)
      setIsAuthenticated(hasToken && !!stored)
    }

    window.addEventListener('storage', syncState)
    window.addEventListener('hashchange', syncState)
    return () => {
      window.removeEventListener('storage', syncState)
      window.removeEventListener('hashchange', syncState)
    }
  }, [])

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

    // ซิงก์ข้อมูลผู้ใช้ไปยัง admin user storage สำหรับบทบาทที่มีสิทธิ์หลังบ้าน
    if (['OWNER', 'RECEPTIONIST', 'THERAPIST'].includes(data.role)) {
      localStorage.setItem('fiwdee_admin_user', JSON.stringify({
        id: data.userId,
        name: data.fullName,
        email: data.email,
        role: data.role,
      }))
    } else {
      localStorage.removeItem('fiwdee_admin_user')
    }

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
      if (['OWNER', 'RECEPTIONIST', 'THERAPIST'].includes(next.role)) {
        localStorage.setItem('fiwdee_admin_user', JSON.stringify({
          id: next.id,
          name: next.name,
          email: next.email,
          role: next.role,
        }))
      }
      return next
    })
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(CUSTOMER_AUTH_KEY)
    localStorage.removeItem('fiwdee_admin_user')
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
