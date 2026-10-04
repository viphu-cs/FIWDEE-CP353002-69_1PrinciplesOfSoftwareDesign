import React, { useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

// หน้าสรุปข้อมูล Users — แยกชัดเจนระหว่าง "ผู้ใช้ที่กำลัง login อยู่" กับ "ผู้ใช้ที่สมัครไว้ทั้งหมด"
// ปัจจุบันใช้ mock data จาก AdminAuthContext (ยังไม่เชื่อม DB) — เมื่อ backend พร้อมจะสลับไปเรียก
// GET /api/admin/users ตาม AGENTS.md §5

function StatCard({ label, value, sub, accent = 'stone' }) {
  const accentStyles = {
    stone: 'bg-stone-900 text-stone-100 border-stone-900',
    emerald: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    amber: 'bg-amber-50 text-amber-900 border-amber-200',
    sky: 'bg-sky-50 text-sky-900 border-sky-200',
  }
  return (
    <div className={`rounded-2xl border p-5 shadow-2xs ${accentStyles[accent]}`}>
      <div className="text-3xl font-headline font-bold leading-none">{value}</div>
      <div className={`text-xs font-semibold uppercase tracking-wider mt-2 ${accent === 'stone' ? 'text-stone-300' : 'text-stone-500'}`}>
        {label}
      </div>
      {sub && (
        <div className={`text-[11px] mt-1 ${accent === 'stone' ? 'text-stone-400' : 'text-stone-600'}`}>{sub}</div>
      )}
    </div>
  )
}

export default function AdminUsers() {
  const { users, forceLogoutUser } = useAdminAuth()
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [sessionFilter, setSessionFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const onlineUsers = users.filter((u) => u.status === 'ONLINE')
  const activeToday = users.filter((u) => u.lastLoginAt?.startsWith('2026-10-03'))
  const newThisMonth = users.filter((u) => u.registeredAt?.startsWith('2026-10'))

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false
    if (sessionFilter !== 'ALL' && u.status !== sessionFilter) return false
    if (search && !`${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6 text-stone-800">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-headline font-bold text-stone-900">
          สรุปข้อมูลผู้ใช้ทั้งหมด (Users Management)
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
          แยกผู้ใช้ที่กำลัง login ใช้งานอยู่ (Online Session) ออกจากผู้ใช้ที่สมัครไว้แล้วทั้งหมด (Registered)
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="สมัครใช้งานทั้งหมด" value={users.length} sub="บัญชีที่ลงทะเบียนในระบบ" accent="stone" />
        <StatCard
          label="กำลัง Login อยู่"
          value={onlineUsers.length}
          sub={`Owner/Receptionist/Therapist/Customer · ล่าสุด ${onlineUsers[0]?.onlineSince ?? '-'} น.`}
          accent="emerald"
        />
        <StatCard label="ใช้งานวันนี้" value={activeToday.length} sub="login ในวันที่ 2026-10-03" accent="amber" />
        <StatCard label="สมาชิกใหม่เดือนนี้" value={newThisMonth.length} sub="สมัครระหว่าง ต.ค. 2026" accent="sky" />
      </div>

      {/* Currently Logged-in Panel */}
      <div className="bg-emerald-50/40 rounded-2xl border border-emerald-200/80 p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping-subtle" />
          <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">
            กำลังใช้งานอยู่ตอนนี้ ({onlineUsers.length} คน)
          </h3>
        </div>
        {onlineUsers.length === 0 ? (
          <p className="text-xs text-stone-500">ไม่มีผู้ใช้ login ในขณะนี้</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {onlineUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-2 bg-white rounded-xl border border-emerald-200 px-3 py-2">
                <div className="w-7 h-7 rounded-full bg-emerald-800 text-white text-[10px] font-bold flex items-center justify-center">
                  {u.name.slice(0, 2)}
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-bold text-stone-800">{u.name}</div>
                  <div className="text-[10px] text-stone-500">Online ตั้งแต่ {u.onlineSince} น.</div>
                </div>
                <StatusBadge status={u.role} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-stone-500 uppercase">สถานะ Session:</span>
          {['ALL', 'ONLINE', 'OFFLINE', 'SUSPENDED'].map((st) => (
            <button
              key={st}
              onClick={() => setSessionFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                sessionFilter === st ? 'bg-amber-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-300 bg-stone-50 text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer"
          >
            <option value="ALL">ทุกบทบาท</option>
            <option value="OWNER">OWNER (ผู้จัดการ)</option>
            <option value="RECEPTIONIST">RECEPTIONIST (พนักงานต้อนรับ)</option>
            <option value="THERAPIST">THERAPIST (หมอนวด)</option>
            <option value="CUSTOMER">CUSTOMER (ลูกค้า)</option>
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ / อีเมล..."
            className="px-3 py-1.5 rounded-xl border border-stone-300 bg-stone-50 text-xs font-semibold text-stone-800 focus:outline-none w-full sm:w-52"
          />
        </div>
      </div>

      {/* Registered Users Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            ผู้ใช้ที่สมัครไว้ทั้งหมด ({filteredUsers.length} จาก {users.length} คน)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-stone-500 bg-stone-50 border-b border-stone-200">
                <th className="px-5 py-3 font-semibold">ผู้ใช้</th>
                <th className="px-4 py-3 font-semibold">บทบาท</th>
                <th className="px-4 py-3 font-semibold">เบอร์โทร</th>
                <th className="px-4 py-3 font-semibold text-center">จองทั้งหมด</th>
                <th className="px-4 py-3 font-semibold">วันที่สมัคร</th>
                <th className="px-4 py-3 font-semibold">Login ล่าสุด</th>
                <th className="px-4 py-3 font-semibold">สถานะ</th>
                <th className="px-4 py-3 font-semibold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-stone-100 hover:bg-stone-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-stone-800 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {u.name.slice(0, 2)}
                      </div>
                      <div className="leading-tight">
                        <div className="text-xs font-bold text-stone-800">{u.name}</div>
                        <div className="text-[11px] text-stone-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><StatusBadge status={u.role} size="sm" /></td>
                  <td className="px-4 py-3.5 text-xs text-stone-600">{u.phone}</td>
                  <td className="px-4 py-3.5 text-xs font-bold text-stone-800 text-center">{u.totalBookings}</td>
                  <td className="px-4 py-3.5 text-xs text-stone-600">{u.registeredAt}</td>
                  <td className="px-4 py-3.5 text-xs text-stone-600">{u.lastLoginAt}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={u.status} size="sm" /></td>
                  <td className="px-4 py-3.5 text-right">
                    {u.status === 'ONLINE' ? (
                      <button
                        onClick={() => forceLogoutUser(u.id)}
                        className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        Force Logout
                      </button>
                    ) : (
                      <span className="text-[11px] text-stone-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-xs text-stone-500">
                    ไม่พบผู้ใช้ที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
