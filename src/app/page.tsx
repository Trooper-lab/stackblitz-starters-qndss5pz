import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Pricing from "@/components/Pricing";
import WorkShowcase from "@/components/WorkShowcase";
import TechStack from "@/components/TechStack";
import Testimonials from "@/components/Testimonials";
import Process from "@/components/Process";
import FAQ from "@/components/FAQ";
import ContactForm from "@/components/ContactForm";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import WhatIsAILeadSite from "@/components/WhatIsAILeadSite";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Stats />
        <WhatIsAILeadSite />
        <Pricing />
        <WorkShowcase />
        <TechStack />
        <Testimonials />
        <Process />
        <FAQ />
        <ContactForm />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
