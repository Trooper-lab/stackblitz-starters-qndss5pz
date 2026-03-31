'use client';

import { useState } from 'react';

const faqs = [
  {
    q: '🧠 Wat is het AI Business OS precies?',
    a: 'Het AI Business OS is de combinatie van je website, je CRM en je sales-automatisering in één intelligent systeem. In plaats van losse tools te stapelen (website hier, CRM daar, ads-tool ergens anders), bouw je bij ons één geïntegreerd organisme dat wekelijks meegroeit. Het adaptive design past zich aan de markt aan, het AI-native CRM beheert je leads automatisch, en alles werkt samen zonder extra licentiekosten.',
  },
  {
    q: '💰 Hoe zit de prijsstructuur in elkaar?',
    a: 'We werken met een transparant model: een eenmalige setup + een vaste maandelijkse investering. Geen verborgen kosten, geen uurtje-factuurtje. Snelstarter (LP): €295 setup + €95/mnd — ideaal als je direct resultaat wilt uit advertentieverkeer. Marktleider (Full Site): €750 setup + €250/mnd — de levende website die wekelijks meebeweegt. Business OS (CRM): €1.950 setup + €495/mnd — volledige automatisering van website én sales-backend. Alle plannen bevatten hosting, onderhoud en doorlopende optimalisaties.',
  },
  {
    q: '🔄 Wat betekent "adaptive design" in de praktijk?',
    a: 'Adaptive design betekent dat je website nooit meer veroudert. Ons systeem monitort marktontwikkelingen en past copy, structuur en aanbod aan waar nodig — zonder dat jij er een opdracht voor hoeft in te sturen. Grotere aanpassingen bespreken we met je in de maandelijkse flow. Dit is geen uurtje-factuurtje-model, maar onderdeel van je abonnement.',
  },
  {
    q: '📈 Hoe lang duurt het voordat ik resultaat zie?',
    a: 'Onze systemen zijn vanaf dag één gebouwd voor conversie. Veel klanten zien een verhoogde leadstroom binnen de eerste 14 dagen na lancering dankzij de geoptimaliseerde architectuur en conversiegerichte structuur. Organische SEO (via onze Groei add-on) duurt 30-90 dagen om volledig op te starten. Wil je direct testen met advertentieverkeer? We kunnen ook lanceren op een beveiligd subdomein zodat je data verzamelt vóór je het live zet.',
  },
  {
    q: '⏳ Hoe snel worden aanpassingen doorgevoerd?',
    a: 'Standaard aanpassingen worden binnen 3-4 werkdagen verwerkt als onderdeel van je abonnement — geen aparte factuur. Heb je hogere urgentie? Met de Premium Support add-on (€150/mnd) worden wijzigingen binnen 24 uur doorgevoerd en heb je direct contact via Slack of WhatsApp, plus een kwartaalstrategie-sessie.',
  },
  {
    q: '🚀 Zit ik aan jullie vast?',
    a: 'We verkopen commitment in beide richtingen. Jij investeert in een doorlopend systeem — wij leveren doorlopend resultaat. Je kunt opzeggen volgens je contracttermijn (maandelijks of jaarlijks). Het platform is exclusief gebouwd voor maximale performance en kan niet zomaar worden overgezet naar een standaard hosting. Maar eerlijk gezegd: klanten die groeien, stappen niet over. Dat is onze beste garantie.',
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
