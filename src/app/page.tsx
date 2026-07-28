import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PricingSection } from "@/components/landing/pricing-section";
import { Testimonials } from "@/components/landing/testimonials";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaSection } from "@/components/landing/cta-section";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteNavbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <PricingSection />
        <Testimonials />
        <FaqSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
