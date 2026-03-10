"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { User, Zap, Code, Palette, Rocket, Target } from "lucide-react";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const TEAM_MEMBERS = [
  {
    role: "Strategie & Visie",
    description: "De stuurman die zorgt dat elke beslissing bijdraagt aan de groei en het succes van onze klanten.",
    icon: Target,
  },
  {
    role: "Techniek & Performance",
    description: "De architect achter razendsnelle, veilige en schaalbare code. Snelheid is hier geen luxe, maar de standaard.",
    icon: Code,
  },
  {
    role: "Design & UX",
    description: "Creëert interfaces die niet alleen mooi zijn, maar vooral intuïtief werken en converteren.",
    icon: Palette,
  },
  {
    role: "Groei & Optimalisatie",
    description: "Data-gedreven en altijd op zoek naar die extra procenten conversie en zichtbaarheid.",
    icon: Rocket,
  },
  {
    role: "Projectmanagement",
    description: "De spin in het web die zorgt dat alles soepel loopt, deadlines gehaald worden en communicatie helder is.",
    icon: Zap,
  },
  {
    role: "Jouw Succes",
    description: "Onze belangrijkste focus: luisteren naar wat jij nodig hebt en dat vertalen naar meetbaar resultaat.",
    icon: User,
  },
];

export default function AboutTeam() {
  const containerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the intro text
      gsap.fromTo(
        ".team-intro-text",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".team-intro-text",
            start: "top 80%",
          },
        }
      );

      // Animate team cards
      gsap.fromTo(
        ".team-card",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".team-grid",
            start: "top 75%",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 bg-white relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20 team-intro-text">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-navy mb-6">
            Sterk op onze eigen positie
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            We geloven niet in manusjes-van-alles. We geloven in specialisatie. Door te focussen op waar we het beste in zijn, creëren we een synergie die leidt tot buitengewone resultaten voor jouw onderneming.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 team-grid">
          {TEAM_MEMBERS.map((member, index) => {
            const Icon = member.icon;
            return (
              <div
                key={index}
                className="team-card bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                  <Icon className="w-7 h-7 text-accent" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-navy mb-3">{member.role}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {member.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-24 bg-navy rounded-3xl p-10 md:p-16 text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-accent/5 transform -skew-y-3 group-hover:skew-y-0 transition-transform duration-700 ease-out" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-4xl font-display font-bold text-white mb-6">
              Klaar om snelheid te maken?
            </h3>
            <p className="text-slate-300 mb-8 text-lg">
              We staan klaar om onze expertise in te zetten voor jouw doelen. Geen verborgen agenda&apos;s, gewoon hard werken en resultaat boeken.
            </p>
            <Link
              href="/#contact"
              className="inline-flex justify-center items-center rounded-xl bg-accent px-8 py-4 text-sm md:text-base font-black uppercase tracking-widest text-white shadow-[0_0_40px_-10px_rgba(255,125,41,0.5)] transition-all hover:bg-orange-600 hover:-translate-y-1"
            >
              Start een project
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
