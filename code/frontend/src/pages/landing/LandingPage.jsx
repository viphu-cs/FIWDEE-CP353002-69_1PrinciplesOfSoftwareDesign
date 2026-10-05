import Hero from '../../components/landing/Hero.jsx'
import TherapistsSection from '../../components/landing/TherapistsSection.jsx'
import ServicesSection from '../../components/landing/ServicesSection.jsx'
import AtmosphereSection from '../../components/landing/AtmosphereSection.jsx'
import LocationSection from '../../components/landing/LocationSection.jsx'
import FinalCta from '../../components/landing/FinalCta.jsx'
import PromoPopup from '../../components/landing/PromoPopup.jsx'

export default function LandingPage({ ready = true, onNavigate }) {
  return (
    <main className="w-full pt-20 bg-surface min-h-[calc(100vh-80px)]">
      {/* ป๊อปอัพโปรโมชั่นตอนเปิดเว็บ (โชว์ครั้งเดียวต่อ session) */}
      <PromoPopup ready={ready} onNavigate={onNavigate} />
      <div className="flex flex-col w-full">
        <Hero ready={ready} />
        <TherapistsSection onNavigate={onNavigate} />
        <ServicesSection onNavigate={onNavigate} />
        <AtmosphereSection />
        <LocationSection />
        <FinalCta onNavigate={onNavigate} />
      </div>
    </main>
  )
}
