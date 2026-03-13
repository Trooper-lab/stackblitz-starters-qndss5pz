'use client';

import { useState, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

import { pricingTiers, pricingAddons } from '@/lib/config/pricing';

const comparison = [
  {
    label: 'Opstartkosten',
    ai: '€0 (maar zelf bouwen)',
    us: 'Vanaf €50 (50% commitment fee)',
    agency: '€3.000 - €10.000+',
  },
  {
    label: 'Doorlooptijd',
    ai: 'Minuten (daarna uren finetunen)',
    us: 'Binnen 5 dagen live',
    agency: '2 tot 3 maanden',
  },
  {
    label: 'Design & Strategie',
    ai: 'Generieke, standaard templates',
    us: 'Mensenwerk + AI, focus op leads',
    agency: 'Volledig maatwerk (vaak traag)',
  },
  {
    label: 'Aanpassingen & Onderhoud',
    ai: 'Zelf alles updaten en oplossen',
    us: 'Zelf via AI chat óf wij doen het',
    agency: 'Traag, uurtje-factuurtje (€100/u+)',
  },
  {
    label: 'Eindresultaat',
    ai: 'Een digitaal visitekaartje',
    us: 'Een geoptimaliseerde leadmachine',
    agency: 'Een prachtig (maar duur) kunstwerk',
  },
];

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('monthly');
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gridRef.current?.children;
      if (!cards || cards.length < 3) return;

      const mm = gsap.matchMedia();

      mm.add('(min-width: 768px)', () => {
        const cardLeft = cards[0];
        const cardMiddle = cards[1];
        const cardRight = cards[2];

        // Ensure clean initial state
        gsap.set([cardLeft, cardMiddle, cardRight], { opacity: 0 });
        gsap.set(cardMiddle, { scale: 0.8, zIndex: 10 });
        gsap.set(cardLeft, { xPercent: 100, x: 32, scale: 0.9, zIndex: 1 });
        gsap.set(cardRight, { xPercent: -100, x: -32, scale: 0.9, zIndex: 1 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });

        tl.to(cardMiddle, {
          opacity: 1,
          scale: 1.05,
          duration: 0.8,
          ease: 'power3.out'
        })
        .to(cardLeft, {
          xPercent: 0,
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power4.out'
        }, '<0.2')
        .to(cardRight, {
          xPercent: 0,
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power4.out'
        }, '<');

        // Force a refresh after a small delay to ensure page layout is settled
        setTimeout(() => ScrollTrigger.refresh(), 100);
      });

      mm.add('(max-width: 767px)', () => {
        gsap.fromTo(cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="pricing"
      ref={containerRef}
      className="py-24 overflow-hidden relative z-10 bg-slate-50"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-navy mb-4 leading-tight">
            Probeer eerst, beslis later
          </h2>
          <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            We zijn zo overtuigd van onze aanpak dat we je een gratis voorproefje
            geven. Ontvang een op maat gemaakt homepage design, volledig
            vrijblijvend.
          </p>
        </div>

        <div className="bg-white p-12 rounded-3xl shadow-2xl border-4 border-accent max-w-4xl mx-auto text-center mb-32">
          <h3 className="font-display text-3xl font-extrabold text-navy mb-4">
            Claim je Gratis Homepage Design
          </h3>
          <p className="text-slate-600 mb-8 max-w-xl mx-auto">
            Geen kleine lettertjes, geen addertjes onder het gras. We maken een
            uniek design voor je, met de kracht van AI en onze expertise. Ben je
            overtuigd? Dan kijken we samen naar de volgende stap.
          </p>
          <a
            href="#contact"
            className="inline-block bg-accent text-white px-10 py-5 rounded-2xl text-lg font-black uppercase tracking-widest hover:bg-orange-600 transition-all duration-300 shadow-xl"
          >
            Ja, ik wil mijn gratis design!
          </a>
        </div>

        {/* --- POSITIONERING / VERGELIJKING --- */}
        <div className="max-w-5xl mx-auto mb-32">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-display font-extrabold text-navy mb-4">
              Waarom we de <span className="text-accent italic">sweet spot</span> zijn
            </h3>
            <p className="text-slate-600 font-medium max-w-2xl mx-auto">
              Je hebt de keuze uit goedkope doe-het-zelf AI tools of extreem dure traditionele bureaus. Wij combineren bewust de snelheid van AI met de kwaliteit van een bureau.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr>
                    <th className="p-6 bg-slate-50 border-b border-slate-200 w-1/4"></th>
                    <th className="p-6 bg-slate-50 border-b border-slate-200 text-slate-500 font-bold w-1/4">
                      Gratis AI Website
                      <p className="text-xs font-normal mt-1 opacity-70">Zelf knutselen</p>
                    </th>
                    <th className="p-6 bg-navy text-white border-b border-navy font-extrabold text-xl w-1/4 relative shadow-lg text-center">
                      AI Lead Site
                      <p className="text-xs font-medium mt-1 text-accent uppercase tracking-widest">Onze Oplossing</p>
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-accent"></div>
                    </th>
                    <th className="p-6 bg-slate-50 border-b border-slate-200 text-slate-500 font-bold w-1/4">
                      Traditioneel Bureau
                      <p className="text-xs font-normal mt-1 opacity-70">Log en duur</p>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, index) => (
                    <tr key={index} className="group">
                      <td className="p-6 border-b border-slate-100 font-bold text-navy bg-slate-50/50">{row.label}</td>
                      <td className="p-6 border-b border-slate-100 text-slate-500 font-medium">{row.ai}</td>
                      <td className="p-6 border-b border-slate-100 font-bold text-navy bg-accent/5 text-center">{row.us}</td>
                      <td className="p-6 border-b border-slate-100 text-slate-500 font-medium">{row.agency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* --- EINDE POSITIONERING --- */}

        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-navy mb-4 leading-tight">
              💼 Onze <span className="text-accent italic">Groeiplannen</span>{' '}
              (Gebouwd voor Schaal)<span className="text-accent">.</span>
            </h2>
            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              Geen vage offertes of technisch jargon. Duidelijke prijzen, inclusief supersnelle hosting en onderhoud. Omdat we efficiënt werken met AI, krijg jij de waarde van een high-end bureau voor een fractie van de prijs.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex bg-white p-1 rounded-full border border-slate-200 shadow-sm relative">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-600 hover:text-navy'
                  }`}
              >
                Maandelijks
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-600 hover:text-navy'
                  }`}
              >
                Jaarlijks
              </button>
              {/* Sliding background */}
              <div
                className="absolute top-1 bottom-1 w-1/2 bg-navy rounded-full transition-transform duration-300 ease-out"
                style={{ transform: billingCycle === 'monthly' ? 'translateX(0)' : 'translateX(100%)' }}
              />
            </div>
            {billingCycle === 'monthly' && (
              <span className="text-xs font-bold text-accent">Bespaar 2 maanden met jaarlijks!</span>
            )}
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-24"
          ref={gridRef}
        >
          {pricingTiers.map(tier => (
            <div key={tier.name} className="relative w-full h-full flex">
              <div
                className={`flex flex-col p-6 lg:p-8 rounded-2xl transition-all duration-300 relative w-full h-full
                                  ${tier.featured
                    ? 'border-4 border-accent bg-white shadow-2xl scale-[1.02] lg:scale-105 z-10'
                    : 'border-2 border-slate-200 bg-white/50 hover:border-accent hover:bg-white md:hover:scale-100 md:scale-100 scale-100'
                  }`}
              >
                {tier.featured && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-accent text-white px-6 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap">
                  ⭐ Onze Beste Keuze
                </div>
              )}

              <div className="mb-8">
                <h3 className="font-display text-xl lg:text-2xl font-extrabold mb-2 text-navy">
                  {tier.name}
                </h3>
                <p className="text-xs lg:text-sm text-slate-500 font-medium mb-6">
                  {tier.desc}
                </p>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`font-display text-4xl sm:text-5xl font-black ${tier.featured ? 'text-accent' : 'text-navy'
                      }`}
                  >
                    {billingCycle === 'yearly' ? tier.priceYearly : tier.priceMonthly}
                  </span>
                  <span className="text-sm font-bold text-slate-400 uppercase">
                    /{billingCycle === 'yearly' ? 'jaar' : 'maand'}
                  </span>
                </div>
                {billingCycle === 'yearly' && (
                  <div className="mt-2 inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">
                    Inclusief 2 maanden gratis
                  </div>
                )}
              </div>

              <ul className="grow space-y-4 mb-8 list-none p-0 text-sm lg:text-base">
                {tier.features.map((f: string) => (
                  <li
                    key={f}
                    className={`flex items-start gap-3 font-semibold ${tier.featured ? 'text-navy' : 'text-slate-600'
                      }`}
                  >
                    <span className="text-accent text-lg lg:text-xl leading-none shrink-0 font-bold">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`block w-full py-4 rounded-xl text-center font-black text-sm uppercase tracking-wider transition-all duration-200
                                    ${tier.featured
                    ? 'bg-accent text-white shadow-xl hover:bg-orange-600'
                    : 'border-2 border-navy text-navy hover:bg-navy hover:text-white'
                  }`}
              >
                {tier.cta}
              </a>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-display font-extrabold text-navy mb-8 text-center">
            🚀 Groei Add-ons
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingAddons.map(addon => (
              <div
                key={addon.name}
                className="bg-white border-2 border-slate-200 rounded-2xl p-8 hover:border-accent transition-colors duration-300 flex flex-col"
              >
                <div className="mb-6">
                  <h4 className="font-display text-2xl font-bold text-navy mb-2">
                    {addon.name}
                  </h4>
                  <p className="text-slate-500 text-sm mb-4">{addon.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-3xl font-black text-navy">
                      {billingCycle === 'yearly' ? addon.priceYearly : addon.priceMonthly}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      /{billingCycle === 'yearly' ? 'jaar' : 'maand'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <div className="mt-2 inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">
                      Inclusief 2 maanden gratis
                    </div>
                  )}
                </div>
                <ul className="space-y-3 list-none p-0 mb-8 flex-grow">
                  {addon.features.map((f: string) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 font-medium text-slate-600 text-sm"
                    >
                      <span className="text-accent font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className="inline-block w-full py-3 rounded-lg text-center font-bold text-sm uppercase tracking-wider bg-slate-100 text-navy hover:bg-navy hover:text-white transition-colors duration-200 mt-auto"
                >
                  Voeg toe aan plan
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
