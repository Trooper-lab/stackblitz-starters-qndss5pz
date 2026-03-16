// src/app/not-found.tsx
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function NotFound() {
    return (
        <div className="relative w-full flex-col overflow-x-hidden bg-black">
            <Navbar />
            <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center pt-24 pb-12">
                <h1 className="text-8xl font-display font-bold mb-4 text-[--color-primary]">404</h1>
                <h2 className="text-3xl font-display text-white font-semibold mb-4">Oeps! Pagina niet gevonden.</h2>
                <p className="mb-8 max-w-lg text-lg text-white">
                    Het lijkt erop dat je een link hebt gevolgd die niet (meer) bestaat. Geen zorgen, we bouwen liever winstgevende websites dan dat we je laten verdwalen. Laten we je terugbrengen naar de juiste plek.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <Link href="/" className="px-8 py-4 bg-[--color-primary] text-white rounded-md hover:bg-[--color-accent] transition-colors font-semibold shadow-lg">
                        Terug naar de Startpagina
                    </Link>
                    <Link href="/over-ons" className="px-8 py-4 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors font-semibold shadow-lg">
                        Leer ons kennen
                    </Link>
                </div>
                <div className="mt-16 text-sm text-gray-500">
                    <p>Waarschijnlijk onze fout, excuses! We zijn drukker met het bouwen van converterende sites voor onze klanten.</p>
                </div>
            </main>
        </div>
    );
}
