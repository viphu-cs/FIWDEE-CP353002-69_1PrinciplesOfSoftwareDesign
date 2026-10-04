import React, { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar.jsx'
import AdminTopbar from '../components/AdminTopbar.jsx'
import QuickActionModal from '../components/QuickActionModal.jsx'
import { AdminAuthProvider, useAdminAuth } from '../context/AdminAuthContext.jsx'
import AdminLoginPage from '../pages/AdminLoginPage.jsx'
import { RenderIcon, getNavLinks } from '../components/AdminSidebar.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'

function AdminLayoutContent({ currentRoute = 'dashboard', onNavigate, children }) {
  const { isAuthenticated } = useAdminAuth()
  const { t } = useLanguage()
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'walkin',
    initialData: null
  })

  // If not authenticated, force render Admin Login Page
  if (!isAuthenticated) {
    return <AdminLoginPage />
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

  const navLinks = getNavLinks(t)

  return (
    <div className="min-h-screen bg-stone-100/70 font-body-md text-stone-900 antialiased flex flex-col">
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
        <nav aria-label="Mobile Navigation Bar" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900 text-stone-200 border-t border-stone-800 px-2 py-2 flex items-center justify-around shadow-2xl">
          {navLinks.slice(0, 5).map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer ${
                currentRoute === item.key
                  ? 'text-amber-300 font-bold bg-stone-800'
                  : 'text-stone-400 hover:text-stone-200'
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
