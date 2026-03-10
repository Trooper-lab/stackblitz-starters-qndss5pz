import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CookiePolicy() {
  return (
    <main className="min-h-screen bg-navy text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-24">
        <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-8">Cookiebeleid</h1>
        <p className="text-slate-300 mb-6">Laatst bijgewerkt: 22 mei 2024 (Geoptimaliseerd voor 2026 richtlijnen)</p>
        
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-accent">1. Wat zijn cookies?</h2>
          <p className="text-slate-300 leading-relaxed">
            Cookies zijn kleine tekstbestanden die op uw computer, tablet of mobiele telefoon worden geplaatst wanneer u een website bezoekt. Op onze website maken we gebruik van verschillende soorten cookies om de werking van de website te verbeteren en uw bezoekervaring te optimaliseren.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-accent">2. Soorten cookies die wij gebruiken</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            Wij gebruiken de volgende soorten cookies op onze website:
          </p>
          <ul className="list-disc list-inside text-slate-300 space-y-2">
            <li><strong>Functionele cookies:</strong> Deze zijn noodzakelijk voor het correct functioneren van de website. Ze onthouden bijvoorbeeld of u bent ingelogd.</li>
            <li><strong>Analytische cookies:</strong> Hiermee verzamelen we anonieme informatie over het gebruik van onze website om de prestaties te meten en te verbeteren.</li>
            <li><strong>Marketing cookies:</strong> Deze worden gebruikt om u relevante advertenties te tonen op basis van uw interesses.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-accent">3. Toestemming</h2>
          <p className="text-slate-300 leading-relaxed">
            Bij uw eerste bezoek aan onze website informeren wij u over het gebruik van cookies en vragen wij u om toestemming voor het plaatsen van niet-noodzakelijke cookies. U kunt uw voorkeuren op elk moment aanpassen.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-accent">4. Beheren van cookies</h2>
          <p className="text-slate-300 leading-relaxed">
            U kunt uw internetbrowser zo instellen dat cookies worden geweigerd of dat u een waarschuwing krijgt wanneer er een cookie wordt geplaatst. Houd er rekening mee dat sommige functies van de website mogelijk niet correct werken als u cookies uitschakelt.
          </p>
        </section>
      </div>
      <Footer />
    </main>
  );
}
