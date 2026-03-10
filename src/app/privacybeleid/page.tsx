import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-navy text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-24">
        <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-8">Privacybeleid</h1>
        <p className="text-slate-300 mb-6">Laatst bijgewerkt: 22 mei 2024 (Geoptimaliseerd voor 2026 richtlijnen)</p>
        
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-accent">1. Inleiding</h2>
          <p className="text-slate-300 leading-relaxed">
            AI Lead Site respecteert uw privacy en is toegewijd aan het beschermen van uw persoonsgegevens. Dit privacybeleid informeert u over hoe wij omgaan met uw persoonsgegevens wanneer u onze website bezoekt en vertelt u over uw privacyrechten.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-accent">2. Welke gegevens we verzamelen</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            Wij kunnen de volgende categorieën persoonsgegevens verzamelen, gebruiken, opslaan en overdragen:
          </p>
          <ul className="list-disc list-inside text-slate-300 space-y-2">
            <li><strong>Identiteitsgegevens:</strong> naam, voornaam, gebruikersnaam.</li>
            <li><strong>Contactgegevens:</strong> e-mailadres, telefoonnummer.</li>
            <li><strong>Technische gegevens:</strong> IP-adres, inloggegevens, browsertype en -versie, tijdzone-instelling en locatie.</li>
            <li><strong>Gebruiksgegevens:</strong> informatie over hoe u onze website en diensten gebruikt.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-accent">3. Hoe we uw gegevens gebruiken</h2>
          <p className="text-slate-300 leading-relaxed">
            Wij gebruiken uw gegevens alleen wanneer de wet ons dat toestaat. Meestal gebruiken wij uw gegevens om de overeenkomst die wij met u aangaan uit te voeren, wanneer dit noodzakelijk is voor onze gerechtvaardigde belangen of wanneer wij moeten voldoen aan een wettelijke verplichting.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-accent">4. Uw rechten</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            Onder de AVG heeft u rechten met betrekking tot uw persoonsgegevens:
          </p>
          <ul className="list-disc list-inside text-slate-300 space-y-2">
            <li>Recht op inzage</li>
            <li>Recht op rectificatie</li>
            <li>Recht op wissen (vergetelheid)</li>
            <li>Recht op beperking van verwerking</li>
            <li>Recht op gegevensoverdraagbaarheid</li>
            <li>Recht van bezwaar</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-accent">5. Contact</h2>
          <p className="text-slate-300 leading-relaxed">
            Voor vragen over dit privacybeleid of onze privacypraktijken kunt u contact met ons opnemen via onze contactpagina.
          </p>
        </section>
      </div>
      <Footer />
    </main>
  );
}
