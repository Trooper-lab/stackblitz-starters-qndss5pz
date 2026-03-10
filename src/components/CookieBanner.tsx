"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-6"
        >
          <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-grow">
                <h3 className="text-navy font-bold text-lg mb-2">Wij gebruiken cookies 🍪</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  We gebruiken cookies om uw ervaring te verbeteren, onze website te analyseren en gepersonaliseerde advertenties te tonen. 
                  Door op "Accepteren" te klikken, gaat u akkoord met ons gebruik van cookies. Lees meer in ons{" "}
                  <Link href="/cookiebeleid" className="text-accent hover:underline font-semibold">
                    Cookiebeleid
                  </Link>{" "}
                  en{" "}
                  <Link href="/privacybeleid" className="text-accent hover:underline font-semibold">
                    Privacybeleid
                  </Link>.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <button
                  onClick={handleDecline}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Weigeren
                </button>
                <button
                  onClick={handleAccept}
                  className="px-6 py-3 rounded-xl bg-accent text-white font-bold hover:bg-orange-600 transition-all shadow-lg shadow-accent/20"
                >
                  Accepteren
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
