import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutHero from "@/components/AboutHero";
import AboutTeam from "@/components/AboutTeam";
import CTA from "@/components/CTA";

export const metadata = {
  title: "Over Ons | AI Lead Site",
  description: "Leer ons team kennen. Wij zijn een groep experts met een globale mindset, gefocust op snelheid, resultaat en high-performance websites.",
};

export default function AboutPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-grow pt-24 md:pt-32 bg-navy">
        <AboutHero />
        <AboutTeam />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
