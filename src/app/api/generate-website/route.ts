import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface GenerateWebsiteRequest {
  companyName: string;
  industry: string;
  description?: string;
  targetAudience?: string;
  services?: string;
}

export interface GenerateWebsiteResponse {
  html: string;
  companyName: string;
  industry: string;
}

function buildPrompt(req: GenerateWebsiteRequest): string {
  return `Je bent een expert webdesigner die professionele websites maakt voor Nederlandse middelgrote bedrijven.

Maak een volledige, moderne, en mooie HTML-website voor het volgende bedrijf:

**Bedrijfsnaam:** ${req.companyName}
**Branche:** ${req.industry}
${req.description ? `**Omschrijving:** ${req.description}` : ""}
${req.targetAudience ? `**Doelgroep:** ${req.targetAudience}` : ""}
${req.services ? `**Diensten/Producten:** ${req.services}` : ""}

VEREISTEN:
- Schrijf ALLES in het Nederlands
- Één zelfstandig HTML-bestand met inline CSS (geen externe afhankelijkheden behalve Google Fonts)
- Vier secties: Home (hero + USP's), Over Ons, Diensten, Contact
- Vloeiende navigatie met ankerlinks (#home, #over-ons, #diensten, #contact)
- Kleurstelling: professioneel en passend bij de branche
- Mobiel-responsief met CSS media queries
- Moderne uitstraling: grote hero met gradient achtergrond, kaarten voor diensten/USP's, contactformulier
- Footer met contactgegevens, KvK-vermelding en copyright
- Gebruik Nederlandse zakelijke taal (geen Engelse tekst)
- Maak realistische, branche-specifieke inhoud (geen placeholder tekst zoals "Lorem ipsum")
- Hero-sectie: pakkende headline, ondertitel, CTA-knop
- Over Ons-sectie: bedrijfsverhaal, missie, kernwaarden
- Diensten-sectie: minimaal 4 concrete diensten met beschrijving en icoon (gebruik Unicode/emoji)
- Contact-sectie: formulier (naam, e-mail, telefoonnummer, bericht) + adresgegevens

Geef ALLEEN de volledige HTML-code terug, beginnend met <!DOCTYPE html> en eindigend met </html>. Geen uitleg, geen markdown codeblokken.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateWebsiteRequest;

    if (!body.companyName || !body.industry) {
      return NextResponse.json(
        { error: "companyName en industry zijn verplicht" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your-anthropic-api-key-here") {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is niet geconfigureerd" },
        { status: 500 }
      );
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 16000,
      messages: [
        {
          role: "user",
          content: buildPrompt(body),
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json(
        { error: "Onverwachte respons van AI" },
        { status: 500 }
      );
    }

    let html = content.text.trim();

    // Strip any accidental markdown code fences
    if (html.startsWith("```")) {
      html = html.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "").trim();
    }

    return NextResponse.json({
      html,
      companyName: body.companyName,
      industry: body.industry,
    } satisfies GenerateWebsiteResponse);
  } catch (err: unknown) {
    console.error("[generate-website]", err);
    const message = err instanceof Error ? err.message : "Interne serverfout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
