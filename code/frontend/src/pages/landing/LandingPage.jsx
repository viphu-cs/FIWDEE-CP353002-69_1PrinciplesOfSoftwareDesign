import Hero from '../../components/landing/Hero.jsx'
import TherapistsSection from '../../components/landing/TherapistsSection.jsx'
import ServicesSection from '../../components/landing/ServicesSection.jsx'
import AtmosphereSection from '../../components/landing/AtmosphereSection.jsx'
import LocationSection from '../../components/landing/LocationSection.jsx'
import FinalCta from '../../components/landing/FinalCta.jsx'

export default function LandingPage({ ready = true, onNavigate }) {
  return (
    <main className="w-full pt-20 bg-surface min-h-[calc(100vh-80px)]">
      <div className="flex flex-col w-full">
        <Hero ready={ready} />
        <TherapistsSection onNavigate={onNavigate} />
        <ServicesSection />
        <AtmosphereSection />
        <LocationSection />
        <FinalCta onNavigate={onNavigate} />
      </div>
    </main>
  )
}
