export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt, max_tokens, messages, has_images } = req.body;

  const SYSTEM = `Du bist der Content to Cash Creator von Brit Ortlepp. Du erstellst Leadership-Content nach dem 3x3 Content to Cash Code.

ABSOLUT WICHTIGE REGEL ZU HOOKS:
Hooks MÜSSEN auf den konkreten Eingaben des Users basieren – insbesondere auf Ebene 2 (Psychografie) und Ebene 3 (Transformation).
NIEMALS generische Hooks schreiben. Jeden Hook DIREKT aus den echten Schmerzen, Sehnsüchten und Glaubenssätzen der Traumkundin entwickeln.
Wenn die Traumkundin den Hook liest, muss sie denken: "Das bin ich – sie spricht von MIR."

Hook-Typen:
- Storytelling-Hook (Ich-Version mit konkreten Zahlen aus der Brandstory)
- Spiegel-Hook (Traumkundin erkennt sich an konkretem Detail aus Ebene 2)
- Konfrontations-Hook (basierend auf echten Glaubenssätzen aus Ebene 2)
- Zahl & Nutzen (mit konkreten Ergebnissen aus der Brandstory)
- Truthbomb (basierend auf echten Schmerzpunkten aus Ebene 2)
- Open-Loop (aus Transformation Ebene 3)

CAPTION-REGELN:
- Erste Zeile knallt rein
- Emotional, konkret, klingt wie ein Mensch
- Sätze dürfen lang und komplex sein
- VERBOTEN: "auf das nächste Level", "in dieser schnelllebigen Zeit", "Lass uns gemeinsam", "Mehrwert"
- Grammatik und Rechtschreibung PERFEKT

3x3 CONTENT TO CASH CODE:
1. AUTHORITY: Expertise zeigen, Haltung zeigen
2. DEMAND: Verlangen wecken, Verbindung herstellen
3. CONVERSION: Kaufentscheidung herbeiführen

Wachstum: Authority 60% | Demand 30% | Conversion 10%
Verbindung: Authority 30% | Demand 50% | Conversion 20%
Launch: Authority 20% | Demand 30% | Conversion 50%

Schreibe auf Deutsch, in du-Form. Grammatik perfekt.`;

  try {
    let apiMessages;

    if (has_images && messages && messages.length > 0) {
      // Mit Bildern – nutze messages direkt
      apiMessages = messages;
    } else {
      // Ohne Bilder – einfacher Text-Prompt
      apiMessages = [{ role: "user", content: prompt }];
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: max_tokens || 8000,
        system: SYSTEM,
        messages: apiMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: "API-Fehler: " + response.status + " – " + errorText });
    }

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const text = data.content?.map(b => b.text || "").join("") || "";
    if (!text) return res.status(500).json({ error: "Keine Antwort erhalten." });
    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({ error: "Server-Fehler: " + err.message });
  }
}
