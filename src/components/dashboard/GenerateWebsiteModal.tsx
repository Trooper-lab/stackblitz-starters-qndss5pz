"use client";

import { useState } from "react";
import { X, Sparkles, Loader2, Eye, Download, Save } from "lucide-react";
import type { GenerateWebsiteRequest, GenerateWebsiteResponse } from "@/app/api/generate-website/route";

interface Props {
  projectId?: string;
  initialCompanyName?: string;
  initialIndustry?: string;
  onSave?: (html: string, name: string) => Promise<void>;
  onClose: () => void;
}

export default function GenerateWebsiteModal({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  projectId,
  initialCompanyName = "",
  initialIndustry = "",
  onSave,
  onClose,
}: Props) {
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [industry, setIndustry] = useState(initialIndustry);
  const [description, setDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [services, setServices] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateWebsiteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const generate = async () => {
    if (!companyName.trim() || !industry.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const body: GenerateWebsiteRequest = {
        companyName: companyName.trim(),
        industry: industry.trim(),
        description: description.trim() || undefined,
        targetAudience: targetAudience.trim() || undefined,
        services: services.trim() || undefined,
      };

      const res = await fetch("/api/generate-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generatie mislukt");
      setResult(data as GenerateWebsiteResponse);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Er is een fout opgetreden");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!result) return;
    const blob = new Blob([result.html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.companyName.toLowerCase().replace(/\s+/g, "-")}-website.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const save = async () => {
    if (!result || !onSave) return;
    setSaving(true);
    try {
      await onSave(result.html, `AI Website – ${result.companyName}`);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-navy-light border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">AI Website Generator</h2>
              <p className="text-white/50 text-sm">Genereer een complete website op maat</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!result ? (
            <>
              {/* Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1.5">
                    Bedrijfsnaam <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="bijv. Van der Berg Logistiek"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1.5">
                    Branche <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="bijv. Transport & Logistiek"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1.5">Omschrijving</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Korte beschrijving van het bedrijf en wat ze doen..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1.5">Doelgroep</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="bijv. MKB-bedrijven in de Randstad"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1.5">Diensten / Producten</label>
                  <input
                    type="text"
                    value={services}
                    onChange={(e) => setServices(e.target.value)}
                    placeholder="bijv. Transport, Opslag, Douane"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={generate}
                disabled={loading || !companyName.trim() || !industry.trim()}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-white/10 disabled:text-white/30 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Website genereren... (30–60 seconden)
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Genereer Website
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-green-400 font-medium text-sm">Website gegenereerd!</p>
                  <p className="text-white/60 text-xs mt-1">
                    Complete website voor <strong className="text-white">{result.companyName}</strong> in de branche <strong className="text-white">{result.industry}</strong>
                  </p>
                </div>
              </div>

              {/* Preview toggle */}
              {preview && (
                <div className="rounded-xl overflow-hidden border border-white/10 bg-white" style={{ height: "400px" }}>
                  <iframe
                    srcDoc={result.html}
                    title="Website preview"
                    className="w-full h-full"
                    sandbox="allow-same-origin"
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setPreview(!preview)}
                  className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-medium py-2.5 rounded-xl transition-colors text-sm"
                >
                  <Eye className="w-4 h-4" />
                  {preview ? "Verberg preview" : "Preview bekijken"}
                </button>

                <button
                  onClick={download}
                  className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-medium py-2.5 rounded-xl transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download HTML
                </button>

                {onSave && (
                  <button
                    onClick={save}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-white/10 disabled:text-white/30 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? "Opslaan..." : "Opslaan in project"}
                  </button>
                )}
              </div>

              <button
                onClick={() => { setResult(null); setError(null); }}
                className="w-full text-white/40 hover:text-white/60 text-sm transition-colors py-2"
              >
                ← Opnieuw genereren
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}