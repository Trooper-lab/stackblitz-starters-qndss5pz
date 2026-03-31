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
  focus: string;
  setupFee: string;
  setupFeeValue: number;
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
    id: 'snelstarter',
    name: '🚀 Snelstarter',
    desc: 'Eén krachtige landingspagina, direct resultaat uit Ads.',
    focus: 'Direct resultaat uit Ads',
    setupFee: '€295',
    setupFeeValue: 295,
    priceYearly: '€950',
    priceMonthly: '95',
    priceYearlyValue: 950,
    priceMonthlyValue: 95,
    featured: false,
    features: [
      { text: 'Hoog-converterende Landingspagina (Ads-ready)', value: '€3.450', numericValue: 3450 },
      { text: 'Custom Lead Formulier & Conversie Funnel', value: '€795', numericValue: 795 },
      { text: 'Maandelijkse copy- & CRO-optimalisaties', value: '€600/JR', numericValue: 600 },
      { text: 'Supersnelle hosting, SSL & GDPR compliance', value: '€420/JR', numericValue: 420 },
    ],
    cta: 'START JE TRANSFORMATIE',
  },
  {
    id: 'marktleider',
    name: '👑 Marktleider',
    desc: 'De Levende Website — past zich wekelijks aan de markt aan.',
    focus: 'De Levende Website',
    setupFee: '€750',
    setupFeeValue: 750,
    priceYearly: '€2.500',
    priceMonthly: '250',
    priceYearlyValue: 2500,
    priceMonthlyValue: 250,
    featured: true,
    features: [
      { text: 'Volledige multi-page website (tot 8 pagina\'s)', value: '€5.850', numericValue: 5850 },
      { text: 'Wekelijkse AI-gedreven content & marktadaptaties', value: '€2.400/JR', numericValue: 2400 },
      { text: 'Volledige Conversie Funnel & meerdere formulieren', value: '€2.495', numericValue: 2495 },
      { text: 'Alles uit het Snelstarter plan', value: '€5.265', numericValue: 5265, isTotal: true },
    ],
    cta: 'BEGIN NU MET GROEIEN',
  },
  {
    id: 'business-os',
    name: '🧠 Business OS',
    desc: 'Volledige automatisering — website én sales-backend als één slim systeem.',
    focus: 'Volledige automatisering',
    setupFee: '€1.950',
    setupFeeValue: 1950,
    priceYearly: '€4.950',
    priceMonthly: '495',
    priceYearlyValue: 4950,
    priceMonthlyValue: 495,
    featured: false,
    features: [
      { text: 'AI-native CRM geïntegreerd in je website', value: '€4.800/JR', numericValue: 4800 },
      { text: 'Volledige sales-pipeline & lead-automatisering', value: '€3.850', numericValue: 3850 },
      { text: 'AI-integraties & workflows op maat', value: '€3.600/JR', numericValue: 3600 },
      { text: 'Alles uit het Marktleider plan', value: '€16.010', numericValue: 16010, isTotal: true },
    ],
    cta: 'BEKIJK JE BUSINESS OS',
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
  {
    id: "advertising",
    name: '📣 Advertising (ADS)',
    desc: 'Wij beheren jouw advertentiebudget voor maximale ROI',
    priceMonthly: '€500',
    priceYearly: '€5.000',
    priceMonthlyValue: 500,
    priceYearlyValue: 5000,
    features: [
      { text: 'Beheer van Google & Meta Ads' },
      { text: 'Optimalisaties op basis van conversies' },
      { text: 'Maandelijks prestatieoverzicht' },
      { text: 'Excl. media-uitgaven' },
    ],
  },
];
