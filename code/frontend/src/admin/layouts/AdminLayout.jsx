import React, { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar.jsx'
import AdminTopbar from '../components/AdminTopbar.jsx'
import QuickActionModal from '../components/QuickActionModal.jsx'
import { AdminAuthProvider, useAdminAuth } from '../context/AdminAuthContext.jsx'
import { RenderIcon, getNavLinks } from '../components/AdminSidebar.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'

function AdminLayoutContent({ currentRoute = 'dashboard', onNavigate, children }) {
  const { isAuthenticated, user, queueItems } = useAdminAuth()
  const { t } = useLanguage()
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'walkin',
    initialData: null
  })

  // หากไม่มีสิทธิ์เข้าถึงหลังบ้าน (ไม่ได้ล็อกอิน หรือเป็น CUSTOMER) ให้กลับหน้าแรกทันที
  React.useEffect(() => {
    if (!isAuthenticated || user?.role === 'CUSTOMER') {
      window.location.hash = '#top'
      return
    }

    // Role-based route guard
    if (user?.role === 'THERAPIST') {
      const allowedTherapistRoutes = ['therapist-schedule', 'therapist-earnings']
      if (!allowedTherapistRoutes.includes(currentRoute)) {
        onNavigate('therapist-schedule')
      }
    } else if (user?.role === 'RECEPTIONIST') {
      if (currentRoute === 'users') {
        onNavigate('dashboard')
      }
    }
  }, [isAuthenticated, user?.role, currentRoute, onNavigate])

  if (!isAuthenticated || user?.role === 'CUSTOMER') {
    return null
  }

  const openWalkInModal = () => {
    setModalState({
      isOpen: true,
      type: 'walkin',
      initialData: null
    })
  }

  const openRoomModal = (roomData) => {
    setModalState({
      isOpen: true,
      type: 'room',
      initialData: roomData
    })
  }

  const openAssignModal = (queueData) => {
    setModalState({
      isOpen: true,
      type: 'assign_service',
      initialData: queueData
    })
  }

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }))
  }

  const waitingCount = queueItems?.filter(q => q.status === 'WAITING' || q.status === 'PENDING' || q.status === 'CHECKED_IN').length || 0
  const navLinks = getNavLinks(t, waitingCount, user?.role)

  return (
    <div className="admin-theme min-h-screen bg-[var(--admin-page)] font-body-md text-on-surface antialiased flex flex-col">
      {/* Desktop Fixed Sidebar */}
      <AdminSidebar
        currentRoute={currentRoute}
        onNavigate={onNavigate}
      />

      {/* Main Content Area Right of Desktop Sidebar */}
      <div className="lg:pl-64 flex-1 flex flex-col transition-all">
        {/* Topbar with Mobile Animated Drawer Menu */}
        <AdminTopbar
          currentRoute={currentRoute}
          onNavigate={onNavigate}
          onOpenWalkInModal={openWalkInModal}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                onNavigate,
                onOpenWalkInModal: openWalkInModal,
                onOpenRoomModal: openRoomModal,
                onOpenAssignModal: openAssignModal
              })
            }
            return child
          })}
        </main>

        {/* Bottom Navigation for Mobile & Tablet */}
        <nav aria-label="Mobile Navigation Bar" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-teak-deep text-warm-ivory border-t border-wood-deep/30 px-2 py-2 flex items-center justify-around shadow-2xl">
          {navLinks.slice(0, 5).map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer ${
                currentRoute === item.key
                  ? 'text-wood-light font-bold bg-primary-container'
                  : 'text-sand-warm hover:text-warm-ivory'
              }`}
            >
              <RenderIcon type={item.iconType} />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Quick Action Modal */}
      <QuickActionModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        modalType={modalState.type}
        initialData={modalState.initialData}
      />
    </div>
  )
}

export default function AdminLayout(props) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent {...props} />
    </AdminAuthProvider>
  )
}
