export interface Feature {
  text: string;
  value?: string;
  numericValue?: number;
  isTotal?: boolean;
}

export interface PricingTier {
  id: string;
  name: string;
  desc: string;
  priceYearly: string;
  priceMonthly: string;
  priceYearlyValue: number;
  priceMonthlyValue: number;
  featured: boolean;
  features: Feature[];
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
  features: { text: string }[];
}

export const pricingTiers: PricingTier[] = [
  {
    id: 'starter',
    name: '🌱 Groei Starter',
    desc: 'Perfect voor lokale dominantie',
    priceYearly: '€1.000',
    priceMonthly: '100',
    priceYearlyValue: 1000,
    priceMonthlyValue: 100,
    featured: false,
    features: [
      { text: 'Hoog-converterende Landingspagina', value: '€3.450', numericValue: 3450 },
      { text: 'AI-Gedreven SEO Fundering', value: '€1.140/JR', numericValue: 1140 },
      { text: 'Custom Lead Formulier & Funnel', value: '€795', numericValue: 795 },
      { text: 'Premium, supersnelle hosting & GDPR compliance', value: '€420/JR', numericValue: 420 },
    ],
    cta: 'CLAIM DIT PLAN',
  },
  {
    id: 'leader',
    name: '👑 Marktleider',
    desc: 'Onze Beste Keuze - Domineer je markt',
    priceYearly: '€3.000',
    priceMonthly: '300',
    priceYearlyValue: 3000,
    priceMonthlyValue: 300,
    featured: true,
    features: [
      { text: 'Tot 8 geoptimaliseerde pagina soorten', value: '€5.850', numericValue: 5850 },
      { text: 'Volledige Conversie Funnel & Meerdere Formulieren', value: '€2.495', numericValue: 2495 },
      { text: "Onbeperkt aantal pagina's & CMS", value: '€1.440/JR', numericValue: 1440 },
      { text: 'Alles uit het Starter plan', value: '€5.805', numericValue: 5805, isTotal: true },
    ],
    cta: 'BEGIN NU MET GROEIEN',
  },
  {
    id: 'custom',
    name: '⚡ Kracht op Maat',
    desc: 'Voor hoog volume & gevestigde bedrijven',
    priceYearly: '€7.000',
    priceMonthly: '700',
    priceYearlyValue: 7000,
    priceMonthlyValue: 700,
    featured: false,
    features: [
      { text: 'Onbeperkte Pagina-architectuur', value: '€11.500', numericValue: 11500 },
      { text: 'Geintegreerd Custom CRM', value: '€2.940/JR', numericValue: 2940 },
      { text: 'AI integraties/automatisering', value: '€3.850', numericValue: 3850 },
      { text: 'Toegewijde Groeistrateeg', value: '€3.600/JR', numericValue: 3600 },
    ],
    cta: 'SPREEK MET EEN PRO',
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
      { text: 'Chat met AI om je website aan te passen' },
      { text: "Creëer nieuwe pagina's via chat" },
      { text: 'Pas designs en content real-time aan' },
      { text: 'Wij fungeren als technische back-up' },
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
      { text: 'Wijzigingen binnen 24 uur doorgevoerd ipv 3-4 dagen' },
      { text: 'Direct contact via Slack of WhatsApp' },
      { text: 'Proactief meedenken over optimalisaties' },
      { text: '1 op 1 strategie sessie per kwartaal' },
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
      { text: 'Maandelijkse content updates' },
      { text: 'Technische SEO monitoring' },
      { text: 'Linkbuilding strategie' },
      { text: 'Uitgebreide rapportage' },
    ],
  },
];
