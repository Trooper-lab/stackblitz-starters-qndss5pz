'use client';

import { useState } from 'react';

const faqs = [
  {
    q: '🎨 Hoe werkt het gratis design proces?',
    a: 'Jij maakt een gratis account aan en wij maken samen met AI een uniek design voor jouw homepage. Dit is geen gratis AI auto-generated website service, maar mensenwerk versterkt door AI. Ben je overtuigd? Dan sturen we nog 2 andere variaties om er zeker van te zijn dat we goed zitten en starten we met de ontwikkeling.',
  },
  {
    q: '💰 Wat kost een AI Lead Site?',
    a: 'Onze prijzen zijn transparant en flexibel. Je kunt kiezen voor een maandelijks abonnement (vanaf €100/mnd) of een jaarlijks abonnement (vanaf €1.000/jaar), waarbij je 2 maanden gratis krijgt. Bij beide opties is supersnelle hosting en onderhoud inbegrepen. Er zijn geen verborgen eenmalige opstartkosten.',
  },
  {
    q: '🤖 Hoe werkt de AI Assistent precies?',
    a: 'Wanneer je kiest voor de AI Assistent add-on (€90/mnd), krijg je direct in je dashboard toegang tot een slimme chat. Je kunt de AI opdrachten geven zoals "Pas de hoofdkleur aan naar blauw" of "Maak een nieuwe landingspagina over onze nieuwste service", en de AI voert deze wijzigingen direct en zonder technische code uit. Je werkt in een afgeschermde omgeving, zodat je website nooit zomaar offline gaat. Wij fungeren hierbij als technische back-up.',
  },
  {
    q: '📈 Hoe lang duurt het voordat ik resultaat zie?',
    a: 'Onze sites zijn vanaf dag één gebouwd voor conversie. Hoewel organische SEO (via onze Groei add-on) 30-90 dagen duurt om volledig op te starten, zien veel klanten een verhoogde leadstroom binnen de eerste 14 dagen na lancering dankzij de geoptimaliseerde site-architectuur en conversiegerichte designs. Wil je het eerst testen met advertenties? We kunnen je site ook lanceren op een adpagina.nl subdomein.',
  },
  {
    q: '⏳ Hoe snel worden aanpassingen doorgevoerd?',
    a: 'Omdat wij geen traditioneel website bureau zijn, focussen wij ons primair op het lanceren van nieuwe projecten. Standaard aanpassingen kunnen daarom 3 tot 4 werkdagen duren. Heb je vaker snelle aanpassingen nodig? Dan bieden we een Premium Support add-on (€150/mnd) aan waarmee wijzigingen binnen 24 uur worden doorgevoerd en je direct contact hebt via Slack of WhatsApp.',
  },
  {
    q: '🚀 Zit ik aan jullie vast?',
    a: 'Ja en nee. Wij verkopen geen losse website, maar een doorlopende service (Website as a Service). Onze abonnementen dekken de supersnelle hosting, het doorlopende onderhoud en de licenties voor de technologie die we gebruiken. Je besteedt de techniek aan ons uit, zodat jij je kunt focussen op je bedrijf. Je kunt natuurlijk opzeggen volgens je contracttermijn (maandelijks of jaarlijks), maar de website is gebouwd op ons exclusieve platform en kan niet zomaar worden overgezet naar een standaard WordPress hosting.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-navy mb-3">
            🤔 U vraagt, wij antwoorden
          </h2>
          <p className="text-slate-500 font-medium">
            Duidelijke antwoorden voor drukke ondernemers over onze prijzen, AI-tools en garanties.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex items-center justify-between w-full p-6 text-left font-bold text-navy text-lg hover:bg-slate-100 transition-colors"
              >
                <span>{faq.q}</span>
                <span
                  className={`text-2xl font-black text-accent transition-transform duration-200 shrink-0 ml-4 leading-none
                                        ${
                                          open === i ? 'rotate-45' : 'rotate-0'
                                        }
                                    `}
                >
                  +
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-6 text-slate-600 font-medium leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
