export interface PricingTier {
  id: string;
  name: string;
  desc: string;
  priceYearly: string;
  priceMonthly: string;
  priceYearlyValue: number;
  priceMonthlyValue: number;
  featured: boolean;
  features: string[];
  cta: string;
}

export interface PricingAddon {
  id: string;
  name: string;
  desc: string;
  priceMonthly: string;
  priceYearly: string;
  priceMonthlyValue: number;
  priceYearlyValue: number;
  features: string[];
}

export const pricingTiers: PricingTier[] = [
  {
    id: 'starter',
    name: '🌱 Groei Starter',
    desc: 'Perfect voor lokale dominantie',
    priceYearly: '€1.000',
    priceMonthly: '€100',
    priceYearlyValue: 1000,
    priceMonthlyValue: 100,
    featured: false,
    features: [
      'Hoog-converterende Landingspagina & Website (Waarde €3.500)',
      'AI-Gedreven SEO Fundering (Waarde €1.200/jr)',
      'Custom Lead Formulier & Funnel (Waarde €800)',
      'Premium, supersnelle hosting & GDPR compliance (Waarde €350/jr)',
    ],
    cta: 'Claim Dit Plan',
  },
  {
    id: 'leader',
    name: '👑 Marktleider',
    desc: 'Onze Beste Keuze - Domineer je markt',
    priceYearly: '€3.000',
    priceMonthly: '€300',
    priceYearlyValue: 3000,
    priceMonthlyValue: 300,
    featured: true,
    features: [
      'Tot 8 geoptimaliseerde pagina soorten (Waarde €6.000)',
      'Volledige Conversie Funnel & Meerdere Formulieren (Waarde €2.500)',
      "Onbeperkt aantal pagina's & CMS (Waarde €1.500/jr)",
      'Alles uit het Starter plan (Waarde €5.850)',
    ],
    cta: 'Begin Nu Met Groeien',
  },
  {
    id: 'custom',
    name: '⚡ Kracht op Maat',
    desc: 'Voor hoog volume & gevestigde bedrijven',
    priceYearly: '€7.000+',
    priceMonthly: '€700+',
    priceYearlyValue: 7000,
    priceMonthlyValue: 700,
    featured: false,
    features: [
      "Onbeperkte Pagina-architectuur",
      'Geavanceerde CRM-integraties',
      'Professionele Video-integratie',
      'Toegewijde Groeistrateeg',
    ],
    cta: 'Spreek met een Pro',
  },
];

export const pricingAddons: PricingAddon[] = [
  {
    id: "ai-assistant",
    name: '🤖 AI Assistent Toegang',
    desc: 'Zelf de volledige controle over je website met onze AI chat assistent',
    priceMonthly: '€90',
    priceYearly: '€900',
    priceMonthlyValue: 90,
    priceYearlyValue: 900,
    features: [
      'Chat met AI om je website aan te passen',
      "Creëer nieuwe pagina's via chat",
      'Pas designs en content real-time aan',
      'Wij fungeren als technische back-up',
    ],
  },
  {
    id: "premium-support",
    name: '🚀 Premium Support',
    desc: 'Voorrang op aanpassingen en direct contact',
    priceMonthly: '€150',
    priceYearly: '€1.500',
    priceMonthlyValue: 150,
    priceYearlyValue: 1500,
    features: [
      'Wijzigingen binnen 24 uur doorgevoerd ipv 3-4 dagen',
      'Direct contact via Slack of WhatsApp',
      'Proactief meedenken over optimalisaties',
      '1 op 1 strategie sessie per kwartaal',
    ],
  },
  {
    id: "seo-growth",
    name: '📈 SEO & Groei',
    desc: 'Doorlopende optimalisatie voor topposities',
    priceMonthly: '€400',
    priceYearly: '€4.000',
    priceMonthlyValue: 400,
    priceYearlyValue: 4000,
    features: [
      'Maandelijkse content updates',
      'Technische SEO monitoring',
      'Linkbuilding strategie',
      'Uitgebreide rapportage',
    ],
  },
];
