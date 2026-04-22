import SiteFooter from '../components/site/SiteFooter'
import SiteHeader from '../components/site/SiteHeader'
import {
  aboutHighlights,
  clientReviews,
  contactCard,
  heroSlides,
  heroStats,
  operatingPrinciples,
  portfolioProjects,
  sectionIds,
  services,
  siteNavigation,
} from '../data/oavContent'
import useActiveSection from '../hooks/useActiveSection'
import useScrollStack from '../hooks/useScrollStack'
import AboutSection from '../sections/AboutSection'
import ContactSection from '../sections/ContactSection'
import HeroSection from '../sections/HeroSection'
import PortfolioSection from '../sections/PortfolioSection'
import ReviewsSection from '../sections/ReviewsSection'
import ServicesSection from '../sections/ServicesSection'


export default function LandingPage() {
  useScrollStack([...sectionIds, 'footer'])
  const { activeSection, setActiveSection } = useActiveSection(sectionIds)



  return (
    <>
      <SiteHeader
        activeSection={activeSection}
        navigation={siteNavigation}
        setActiveSection={setActiveSection}
      />

      <main className="oav-site">
        <HeroSection slides={heroSlides} />
        <AboutSection
          highlights={aboutHighlights}
          principles={operatingPrinciples}
          stats={heroStats}
        />
        <ServicesSection services={services} />
        <PortfolioSection projects={portfolioProjects} />
        <ReviewsSection reviews={clientReviews} />
        <ContactSection contact={contactCard} services={services} />
        <SiteFooter contact={contactCard} navigation={siteNavigation} services={services} />
      </main>
    </>
  )
}
