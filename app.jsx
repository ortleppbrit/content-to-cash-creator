// Content to Cash Creator – by Brit Ortlepp
// Vercel-Version: API-Calls gehen über /api/generate (API-Key sicher im Backend)

const { useState, useEffect } = React;

const C = { pink:"#E94D60", blue:"#517383", yellow:"#ECEA54", beige:"#E7DFD7", dark:"#1a1a1a", mid:"#222", card:"#2a2a2a", border:"#383838", white:"#FFF" };

const VOICES = {
  Leader:    { emoji:"👑", kurz:"Klar, direkt, stark",          wording:"Aktive, präzise Sprache. Klare Aussagen ohne Relativierungen. Keine Modalverben. Haltung zeigen. Führt durch Klarheit.", beispiel:"Du führst, indem du entscheidest." },
  Mentorin:  { emoji:"🤍", kurz:"Warm, weise, vertrauensvoll",  wording:"Emotionale, ruhige Sprache. Tiefe Einblicke, persönliche Wärme, begleitend. Schafft Vertrauen durch Nähe.", beispiel:"Vertrauen ist der Beginn jeder Veränderung." },
  Visionary: { emoji:"🚀", kurz:"Groß, inspirierend, bewegend", wording:"Bildhafte, große Sprache. Zukunftsorientiert, visionär. Denkt in Möglichkeiten. Erzeugt Aufbruch.", beispiel:"Du erschaffst nicht Posts, du formst Gedanken." },
  Connector: { emoji:"💬", kurz:"Nahbar, ehrlich, humorvoll",   wording:"Alltagssprache, locker, humorvoll. Schafft Nähe durch Authentizität. Zeigt sich menschlich und echt.", beispiel:"Ich sags ehrlich: Das hatte ich nicht erwartet." },
  Rebell:    { emoji:"🔥", kurz:"Kantig, provokant, mutig",     wording:"Konfrontativ, mutig, kurz. Polarisiert bewusst. Unbequeme Wahrheiten, klare Kante, kein Weichspülen.", beispiel:"Brav verkauft nicht." },
};

const SYSTEM_PROMPT = `Du bist der Content to Cash Creator – das KI-Content-Tool von Brit Ortlepp, Expertin für Leadership-Content und Schöpferin des 3x3 Content to Cash Code.

KERNPHILOSOPHIE:
- Content muss nicht viral gehen. Er muss die RICHTIGEN Menschen ansprechen und zum Kauf vorbereiten.
- Mit weniger als 1.000 Followern sind 5-stellige Launches möglich – durch das richtige System.
- Der Hook muss so spezifisch sein, dass die Traumkundin denkt: Wow, sie spricht von MIR.
- Nicht Viralität ist das Ziel, sondern Kaufvorbereitung der vorhandenen Follower.

TRAUMKUNDEN-EBENEN:
Ebene 1 = Oberfläche (Demografie) – NUR für Format-Entscheidungen.
Ebene 2 = Psychografie (Werte, Ängste, Glaubenssätze, Sehnsüchte) – HAUPTQUELLE für Hooks und Captions.
Ebene 3 = Transformation (Identity Shift, gewünschtes Ergebnis) – HAUPTQUELLE für Hooks und Captions.
Hooks und Captions IMMER auf Basis von Ebene 2 und 3.

3x3 CONTENT TO CASH CODE:
1. AUTHORITY: Expertise zeigen, starke Haltung. Formate: Statements, Myth-Busting, Frameworks.
2. DEMAND: Verlangen und Verbindung wecken. Formate: Stories, BTS, Transformation.
3. CONVERSION: Kaufentscheidung herbeiführen. Formate: FAQ, Angebotspost, Testimonials.

CONTENTPLÄNE:
Wachstum: Authority 60% | Demand 30% | Conversion 10%
Verbindung: Authority 30% | Demand 50% | Conversion 20%
Launch: Authority 20% | Demand 30% | Conversion 50%

HOOK-TYPEN (alle auf Ebene 2+3 basierend):
Storytelling-Hook (Ich-Version, konkrete Zahlen), Bold-Statement, Spiegel-Hook, Provokation/Truthbomb, Zahl und Nutzen, Frage-Formel, Geheimnis-Formel, Labeling-Technik, Open-Loop.

CAPTION-REGELN:
- Erste Zeile MUSS einschlagen – kein weicher Einstieg.
- Emotional, konkret, klingt wie ein Mensch.
- VERBOTEN: auf das naechste Level heben, in dieser schnelllebigen Zeit, Lass uns gemeinsam, unvergesslich.
- Keywords natuerlich einweben.
- Grammatik und Rechtschreibung PERFEKT.
- Tone of Voice der Person MUSS spuerbar sein.

REEL-VARIANTEN (IMMER BEIDE):
Variante A: Statischer Hook – nur Text auf dem Cover. Kein Sprechen noetig.
Variante B: Talking-Head – vollstaendiges Skript zum Sprechen.

KARUSSELL: mind. 6 Slides nummeriert. Slide 1 = Hook, letzter Slide = CTA.
STORIES: 5-Step: Hook → Spiegelung → Positionierung → Öffnung → Einladung.
BONUS: Am Ende JEDES Plans eine kreative, ausgefallene Bonus-Idee.

OUTPUT-FORMAT:
Gesamtuebersicht als Tabelle: | Woche | Tag | Saeule | Format | Hook-Vorschau | Ebene |
Pro Woche Detail mit allen Posts, Story-Plan.
Am Ende: HOOK-BANK (8 Hooks) und BONUS-CONTENT-IDEE.

Schreibe auf Deutsch, in du-Form. Brand-Voice konsequent einsetzen. Grammatik perfekt.`;

const PROFILE_KEY = "ctc_vercel_v1";
const emptyProfile = { branche:"", brandstatement:"", brandstory:"", ebene1:"", ebene2:"", ebene3:"", angebote:[], keywords:"", voice1:"Leader", voice2:"Mentorin", voiceWords:"", plattform:"Instagram", contentFormat:"beides", lernbeispiele:[] };

// API-Call geht über Vercel Serverless Function – API-Key bleibt sicher
async function callAPI(system, prompt, max_tokens = 8000) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, prompt, max_tokens }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.text;
}

function App() {
  const [view, setView] = useState("home");
  const [tab, setTab] = useState(0);
  const [profile, setProfile] = useState(emptyProfile);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [gen, setGen] = useState({ feedDays:3, storyDays:5, weeks:4, ziel:"Wachstum (neue Reichweite)", thema:"", selectedAngebote:[] });
  const [newAng, setNewAng] = useState({ name:"", beschreibung:"", preis:"" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [lernText, setLernText] = useState("");
  const [lernLabel, setLernLabel] = useState("");
  const [suggestedKW, setSuggestedKW] = useState([]);
  const [kwLoading, setKwLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) { setProfile(JSON.parse(saved)); setSaved(true); }
    } catch {}
  }, []);

  const upd = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const updG = (k, v) => setGen(g => ({ ...g, [k]: v }));

  const validate = () => {
    const e = {};
    if (!profile.branche.trim()) e.branche = "Bitte gib deine Nische an.";
    if (!profile.brandstatement.trim()) e.brandstatement = "Das Brand-Statement ist Pflichtfeld.";
    if (!profile.brandstory.trim()) e.brandstory = "Die Brandstory ist Pflichtfeld.";
    if (!profile.ebene2.trim()) e.ebene2 = "Ebene 2 ist Pflicht – sie ist die Basis deiner Hooks.";
    if (!profile.ebene3.trim()) e.ebene3 = "Ebene 3 ist Pflicht – sie ist die Basis deiner Hooks.";
    if (profile.angebote.length === 0) e.angebote = "Bitte lege mindestens ein Angebot an.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveProfile = () => {
    if (!validate()) { setTab(0); return; }
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); setSaved(true); setView("home"); } catch {}
  };

  const addAngebot = () => {
    if (!newAng.name.trim()) return;
    upd("angebote", [...profile.angebote, { ...newAng, id: Date.now() }]);
    setNewAng({ name:"", beschreibung:"", preis:"" });
    setErrors(e => ({ ...e, angebote: undefined }));
  };

  const toggleAng = (id) => {
    const cur = gen.selectedAngebote;
    updG("selectedAngebote", cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]);
  };

  const addLern = () => {
    if (!lernText.trim()) return;
    upd("lernbeispiele", [...profile.lernbeispiele, { id: Date.now(), label: lernLabel || "Caption", text: lernText }]);
    setLernText(""); setLernLabel("");
  };

  const suggestKW = async () => {
    setKwLoading(true);
    try {
      const text = await callAPI(
        "Du bist ein Instagram-Marketing-Experte. Antworte NUR mit einer kommagetrennten Liste, kein anderer Text.",
        "Schlage 12 relevante Instagram-Keywords (keine Hashtags, inhaltliche Begriffe) fuer diese Nische vor: " + profile.branche + ". Traumkundin: " + profile.ebene1,
        500
      );
      setSuggestedKW(text.split(",").map(k => k.trim()).filter(Boolean));
    } catch {}
    setKwLoading(false);
  };

  const addKW = (kw) => {
    const cur = profile.keywords ? profile.keywords.split(",").map(k=>k.trim()).filter(Boolean) : [];
    if (!cur.includes(kw)) upd("keywords", [...cur, kw].join(", "));
  };

  const profileComplete = profile.branche && profile.brandstatement && profile.brandstory && profile.ebene2 && profile.ebene3 && profile.angebote.length > 0;

  const generate = async () => {
    if (!profileComplete) { setView("profile"); return; }
    setLoading(true); setView("result"); setResult("");

    const selAng = profile.angebote.filter(a => gen.selectedAngebote.includes(a.id));
    const angText = (selAng.length > 0 ? selAng : profile.angebote)
      .map(a => "- " + a.name + (a.preis ? " (" + a.preis + ")" : "") + (a.beschreibung ? ": " + a.beschreibung : "")).join("\n");

    const lernCtx = profile.lernbeispiele.length > 0
      ? "\n\nMEINE CAPTION-BEISPIELE (lerne meinen Stil):\n" + profile.lernbeispiele.map(l => "---\n" + l.text).join("\n")
      : "";

    const prompt = [
      "Erstelle einen vollstaendigen Content-Plan nach dem 3x3 Content to Cash Code.",
      "",
      "PROFIL:",
      "Branche: " + profile.branche,
      "Brand-Statement: " + profile.brandstatement,
      "Brandstory: " + profile.brandstory,
      "",
      "TRAUMKUNDEN-ANALYSE:",
      "Ebene 1: " + (profile.ebene1 || "nicht angegeben"),
      "Ebene 2 (HAUPTQUELLE Hooks/Captions): " + profile.ebene2,
      "Ebene 3 (HAUPTQUELLE Hooks/Captions): " + profile.ebene3,
      "",
      "ANGEBOTE:", angText,
      "",
      "BRAND-VOICE:",
      "Haupt-Voice: " + profile.voice1 + " – " + VOICES[profile.voice1]?.wording,
      "2. Voice: " + profile.voice2 + " – " + VOICES[profile.voice2]?.wording,
      "Typische Phrasen: " + (profile.voiceWords || "keine"),
      "",
      "KEYWORDS: " + (profile.keywords || "passende selbst waehlen"),
      "FORMAT-PRÄFERENZ: " + profile.contentFormat,
      "Plattform: " + profile.plattform,
      "",
      "EINSTELLUNGEN:",
      "Zeitraum: " + gen.weeks + " Woche(n)",
      "Feed-Posts/Woche: " + gen.feedDays + "x",
      "Stories/Woche: " + gen.storyDays + "x",
      "Ziel: " + gen.ziel,
      gen.thema ? "Thema: " + gen.thema : "",
      lernCtx,
    ].filter(Boolean).join("\n");

    try {
      const text = await callAPI(SYSTEM_PROMPT, prompt);
      setResult(text);
    } catch (e) {
      setResult("Fehler: " + e.message);
    }
    setLoading(false);
  };

  const copyAll = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(()=>setCopied(false), 2000); };

  const tabs = ["🏢 Basics", "👩 Traumkundin", "💎 Angebote", "🎤 Voice", "📚 Lernen"];

  return (
    <div style={{minHeight:"100vh", background:C.dark, fontFamily:"Montserrat,Arial,sans-serif", color:C.white}}>
      {/* HEADER */}
      <div style={{background:C.mid, borderBottom:"2px solid "+C.pink, padding:"13px 20px", display:"flex", alignItems:"center", gap:12}}>
        <div onClick={()=>setView("home")} style={{display:"flex", alignItems:"center", gap:10, cursor:"pointer"}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:C.pink,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:15,color:"#fff"}}>B</div>
          <div>
            <div style={{fontWeight:900,fontSize:14}}>Content to Cash Creator</div>
            <div style={{fontSize:9,color:C.beige,letterSpacing:2,textTransform:"uppercase"}}>by Brit Ortlepp</div>
          </div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          {view!=="home" && <button onClick={()=>setView("home")} style={S.ghost}>🏠</button>}
          {saved && view!=="generate" && view!=="result" && <button onClick={()=>setView("generate")} style={{...S.ghost,background:C.pink,borderColor:C.pink,color:"#fff"}}>✨ Erstellen</button>}
        </div>
      </div>

      <div style={{maxWidth:800,margin:"0 auto",padding:"24px 16px 80px"}}>

        {/* HOME */}
        {view==="home" && (
          <div>
            <div style={{textAlign:"center",padding:"16px 0 28px"}}>
              <div style={{color:C.pink,fontSize:11,letterSpacing:3,textTransform:"uppercase",marginBottom:8}}>Powered by Brit Ortlepp</div>
              <h1 style={{fontSize:26,fontWeight:900,margin:"0 0 8px",lineHeight:1.2}}>Content to Cash<br/><span style={{color:C.pink}}>Creator</span></h1>
              <p style={{color:C.beige,fontSize:13,maxWidth:440,margin:"0 auto",lineHeight:1.7}}>KI-Tool fuer Leadership-Content, der verkauft – nach dem 3x3 Content to Cash Code.</p>
            </div>
            {!profileComplete && (
              <div style={{background:"#2a1a1e",border:"1px solid "+C.pink,borderRadius:14,padding:"16px 20px",marginBottom:16}}>
                <div style={{fontWeight:700,marginBottom:4}}>⚡ Einmaliges Setup nötig</div>
                <div style={{color:C.beige,fontSize:13,lineHeight:1.6,marginBottom:12}}>Lege dein Profil einmalig an – dann klickst du nur noch auf Content erstellen.</div>
                <button onClick={()=>setView("profile")} style={S.primary}>Profil anlegen →</button>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
              <div onClick={()=>profileComplete?setView("generate"):setView("profile")} style={{background:profileComplete?C.pink:C.card,borderRadius:14,padding:"20px 18px",cursor:"pointer",border:"1px solid "+(profileComplete?C.pink:C.border)}}>
                <div style={{fontSize:28,marginBottom:8}}>✨</div>
                <div style={{fontWeight:800,fontSize:15,marginBottom:4}}>Content erstellen</div>
                <div style={{fontSize:12,color:profileComplete?"rgba(255,255,255,.8)":C.beige}}>Plan für 1–4 Wochen generieren</div>
              </div>
              <div onClick={()=>setView("profile")} style={{background:C.card,borderRadius:14,padding:"20px 18px",cursor:"pointer",border:"1px solid "+C.border}}>
                <div style={{fontSize:28,marginBottom:8}}>👤</div>
                <div style={{fontWeight:800,fontSize:15,marginBottom:4}}>{saved?"Profil bearbeiten":"Profil anlegen"}</div>
                <div style={{fontSize:12,color:C.beige}}>Nische, Traumkundin, Voice</div>
              </div>
            </div>
            {saved && (
              <div style={{background:C.card,borderRadius:14,padding:"18px 20px"}}>
                <div style={{color:C.beige,fontSize:11,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Gespeichertes Profil</div>
                <div style={{fontSize:13,lineHeight:2.1}}>
                  <b>Nische:</b> {profile.branche}<br/>
                  <b>Angebote:</b> {profile.angebote.map(a=>a.name).join(", ")||"–"}<br/>
                  <b>Voice:</b> {VOICES[profile.voice1]?.emoji} {profile.voice1} + {VOICES[profile.voice2]?.emoji} {profile.voice2}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PROFIL */}
        {view==="profile" && (
          <div>
            <h2 style={{fontSize:20,fontWeight:900,marginBottom:16}}>👤 Dein Profil</h2>
            <div style={{display:"flex",gap:6,marginBottom:24,flexWrap:"wrap"}}>
              {tabs.map((t,i)=>(
                <button key={i} onClick={()=>setTab(i)} style={{...S.chip,background:tab===i?C.pink:C.card,color:tab===i?"#fff":C.beige,border:"1px solid "+(tab===i?C.pink:C.border),fontSize:12}}>{t}</button>
              ))}
            </div>

            {tab===0 && (
              <div>
                <Grp label="🏢 Branche und Nische *" err={errors.branche}>
                  <TA value={profile.branche} onChange={v=>{upd("branche",v);setErrors(e=>({...e,branche:undefined}));}} ph="z.B. Business-Coach fuer selbststaendige Frauen, die mit Instagram mehr Umsatz machen wollen..." rows={2}/>
                </Grp>
                <Grp label="💬 Brand-Statement * (Pflichtfeld)" err={errors.brandstatement}>
                  <IN value={profile.brandstatement} onChange={v=>{upd("brandstatement",v);setErrors(e=>({...e,brandstatement:undefined}));}} ph="Ich helfe [Zielgruppe], [Ergebnis] zu erreichen, ohne [Hindernis]."/>
                </Grp>
                <Grp label="📖 Brandstory * (Pflichtfeld)" err={errors.brandstory}>
                  <TA value={profile.brandstory} onChange={v=>{upd("brandstory",v);setErrors(e=>({...e,brandstory:undefined}));}} ph="Mein Weg, mein Wendepunkt, meine Mission, meine Werte..." rows={6}/>
                </Grp>
                <Grp label="📱 Plattform">
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {["Instagram","TikTok","LinkedIn","Instagram + TikTok"].map(p=><Chip key={p} active={profile.plattform===p} onClick={()=>upd("plattform",p)}>{p}</Chip>)}
                  </div>
                </Grp>
                <Grp label="🎬 Content-Format-Präferenz">
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {["überwiegend Reels","überwiegend Karussell","beides gleich"].map(f=><Chip key={f} active={profile.contentFormat===f} onClick={()=>upd("contentFormat",f)}>{f}</Chip>)}
                  </div>
                </Grp>
              </div>
            )}

            {tab===1 && (
              <div>
                <div style={{background:"#1a2a1a",border:"1px solid #2d5a2d",borderRadius:12,padding:"14px 16px",marginBottom:20,fontSize:13,lineHeight:1.7}}>
                  <b style={{color:C.yellow}}>💡 Warum 3 Ebenen?</b><br/>
                  Ebene 2 und 3 sind die Basis deiner Hooks. Nur wer die innere Welt kennt, schreibt Hooks die treffen wie: "Sie spricht von MIR."
                </div>
                <Grp label="Ebene 1 – Oberfläche (Demografie)">
                  <TA value={profile.ebene1} onChange={v=>upd("ebene1",v)} ph="Alter, Beruf, Familienstatus, Plattformnutzung, Kaufverhalten..." rows={3}/>
                  <div style={{fontSize:11,color:"#888",marginTop:4}}>Nur für Format-Entscheidungen, nicht für Hooks.</div>
                </Grp>
                <Grp label="Ebene 2 – Psychografie * (Hauptquelle fuer Hooks)" err={errors.ebene2}>
                  <TA value={profile.ebene2} onChange={v=>{upd("ebene2",v);setErrors(e=>({...e,ebene2:undefined}));}} ph={"Werte und Prioritaeten: Wofuer gibt sie Geld aus?\n\nAlltags-Schmerzpunkte: Was stresst sie taeglich konkret?\n\nGlaubenssaetze: Welche inneren Saetze sagt sie sich?\n\nSehnsueichte: Welche Identitaet wuenscht sie sich?\n\nWas sie denkt aber nicht ausspricht..."} rows={7}/>
                </Grp>
                <Grp label="Ebene 3 – Transformation * (Hauptquelle fuer Hooks)" err={errors.ebene3}>
                  <TA value={profile.ebene3} onChange={v=>{upd("ebene3",v);setErrors(e=>({...e,ebene3:undefined}));}} ph={"Identity Shift: Von ... zu ...\n\nKonkretes gewuenschtes Ergebnis\n\nWarum JETZT? Was macht diesen Moment entscheidend?\n\nEmotionale Konsequenzen nach der Veraenderung\n\nEinwaende: Was haelt sie zurueck?"} rows={7}/>
                </Grp>
                <Grp label="🔑 Keywords (fliessen in Captions ein)">
                  <IN value={profile.keywords} onChange={v=>upd("keywords",v)} ph="Kommagetrennt: z.B. Leadership-Content, Instagram-Umsatz, Traumkundin..."/>
                  <div style={{display:"flex",gap:8,marginTop:10,alignItems:"center",flexWrap:"wrap"}}>
                    <button onClick={suggestKW} style={{...S.secondary,fontSize:12,padding:"8px 14px"}} disabled={kwLoading}>
                      {kwLoading?"⏳ Laden...":"✨ Keywords vorschlagen"}
                    </button>
                    {suggestedKW.map(kw=>(
                      <button key={kw} onClick={()=>addKW(kw)} style={{...S.chip,fontSize:11,padding:"6px 12px",background:C.card,color:C.beige,border:"1px solid "+C.border,cursor:"pointer"}}>+ {kw}</button>
                    ))}
                  </div>
                </Grp>
              </div>
            )}

            {tab===2 && (
              <div>
                {errors.angebote && <ErrBox msg={errors.angebote}/>}
                {profile.angebote.length>0 && (
                  <div style={{marginBottom:16,display:"flex",flexDirection:"column",gap:8}}>
                    {profile.angebote.map(a=>(
                      <div key={a.id} style={{background:C.mid,borderRadius:10,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",border:"1px solid "+C.border}}>
                        <div>
                          <div style={{fontWeight:700}}>{a.name}{a.preis&&<span style={{color:C.pink,fontWeight:400,fontSize:12}}> · {a.preis}</span>}</div>
                          {a.beschreibung&&<div style={{color:C.beige,fontSize:12,marginTop:2}}>{a.beschreibung}</div>}
                        </div>
                        <button onClick={()=>upd("angebote",profile.angebote.filter(x=>x.id!==a.id))} style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontSize:20,paddingLeft:10}}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{background:C.mid,borderRadius:12,padding:16,border:"1px dashed "+C.border}}>
                  <div style={{fontSize:12,color:C.beige,marginBottom:10,letterSpacing:1}}>+ NEUES ANGEBOT</div>
                  <IN value={newAng.name} onChange={v=>setNewAng(p=>({...p,name:v}))} ph="Name des Angebots"/>
                  <IN value={newAng.beschreibung} onChange={v=>setNewAng(p=>({...p,beschreibung:v}))} ph="Kurze Beschreibung (optional)" style={{marginTop:8}}/>
                  <IN value={newAng.preis} onChange={v=>setNewAng(p=>({...p,preis:v}))} ph="Preis (optional)" style={{marginTop:8}}/>
                  <button onClick={addAngebot} style={{...S.primary,marginTop:12,fontSize:13,padding:"10px 20px"}}>+ Angebot hinzufuegen</button>
                </div>
              </div>
            )}

            {tab===3 && (
              <div>
                <Grp label="🎤 Haupt-Voice *" err={errors.voice1}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {Object.entries(VOICES).map(([name,v])=>(
                      <div key={name} onClick={()=>{upd("voice1",name);setErrors(e=>({...e,voice1:undefined}));}} style={{background:profile.voice1===name?"#1a0a10":C.card,border:"2px solid "+(profile.voice1===name?C.pink:C.border),borderRadius:12,padding:14,cursor:"pointer"}}>
                        <div style={{fontSize:22,marginBottom:4}}>{v.emoji}</div>
                        <div style={{fontWeight:800,fontSize:14}}>{name}</div>
                        <div style={{fontSize:12,color:C.beige,marginBottom:6}}>{v.kurz}</div>
                        <div style={{fontSize:11,color:"#999",fontStyle:"italic"}}>"{v.beispiel}"</div>
                      </div>
                    ))}
                  </div>
                </Grp>
                <Grp label="🎤 2. Voice (ergänzend)">
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {Object.entries(VOICES).map(([name,v])=>(
                      <div key={name} onClick={()=>upd("voice2",name)} style={{background:profile.voice2===name?"#0a0f1a":C.card,border:"2px solid "+(profile.voice2===name?C.blue:C.border),borderRadius:12,padding:14,cursor:"pointer",opacity:profile.voice1===name?0.35:1}}>
                        <div style={{fontSize:22,marginBottom:4}}>{v.emoji}</div>
                        <div style={{fontWeight:800,fontSize:14}}>{name}</div>
                        <div style={{fontSize:12,color:C.beige,marginBottom:6}}>{v.kurz}</div>
                        <div style={{fontSize:11,color:"#999",fontStyle:"italic"}}>"{v.beispiel}"</div>
                      </div>
                    ))}
                  </div>
                </Grp>
                <Grp label="✍️ Typische Wörter und Phrasen (auch was du NICHT magst)">
                  <TA value={profile.voiceWords} onChange={v=>upd("voiceWords",v)} ph={"Woerter die du regelmaessig nutzt.\nAuch was du NIE schreiben wuerdest.\nz.B. Cash in the Täsch, Traumkundin – NICHT: naechstes Level, unvergesslich"} rows={4}/>
                </Grp>
              </div>
            )}

            {tab===4 && (
              <div>
                <div style={{background:"#1a1a2a",border:"1px solid "+C.blue,borderRadius:12,padding:"14px 16px",marginBottom:20,fontSize:13,lineHeight:1.7}}>
                  <b style={{color:C.yellow}}>🧠 Tool-Learning</b><br/>
                  Lade Captions hoch, die du vom Tool bekommen und dann selbst veraendert hast. Das Tool lernt deinen echten Stil daraus.
                </div>
                <Grp label="Bezeichnung"><IN value={lernLabel} onChange={setLernLabel} ph="z.B. Hook-Post vom 15.4."/></Grp>
                <Grp label="Deine bearbeitete Caption"><TA value={lernText} onChange={setLernText} ph="Fuege deine veraenderte Caption ein..." rows={6}/></Grp>
                <button onClick={addLern} style={{...S.primary,marginBottom:24}}>+ Caption speichern</button>
                {profile.lernbeispiele.length>0 && (
                  <div>
                    <div style={{color:C.beige,fontSize:12,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Gespeicherte Beispiele ({profile.lernbeispiele.length})</div>
                    {profile.lernbeispiele.map(l=>(
                      <div key={l.id} style={{background:C.card,borderRadius:10,padding:"12px 14px",marginBottom:8,border:"1px solid "+C.border}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <b style={{fontSize:13}}>{l.label}</b>
                          <button onClick={()=>upd("lernbeispiele",profile.lernbeispiele.filter(x=>x.id!==l.id))} style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontSize:18}}>×</button>
                        </div>
                        <div style={{fontSize:12,color:C.beige,lineHeight:1.6}}>{l.text.slice(0,120)}{l.text.length>120?"...":""}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{marginTop:24,display:"flex",gap:10}}>
              {tab>0 && <button onClick={()=>setTab(t=>t-1)} style={S.secondary}>← Zurück</button>}
              {tab<tabs.length-1 && <button onClick={()=>setTab(t=>t+1)} style={S.primary}>Weiter →</button>}
              {tab===tabs.length-1 && <button onClick={saveProfile} style={{...S.primary,flex:1}}>💾 Profil speichern</button>}
            </div>
            {tab<tabs.length-1 && <button onClick={saveProfile} style={{...S.secondary,width:"100%",marginTop:10,fontSize:12}}>Zwischenspeichern</button>}
          </div>
        )}

        {/* GENERATE */}
        {view==="generate" && (
          <div>
            <h2 style={{fontSize:20,fontWeight:900,marginBottom:4}}>✨ Content erstellen</h2>
            <p style={{color:C.beige,fontSize:13,marginBottom:20}}>Wähle deine Einstellungen fuer diese Periode.</p>
            <div style={{background:C.card,borderRadius:12,padding:"14px 18px",marginBottom:20,fontSize:13}}>
              <span style={{color:C.beige,fontSize:11,letterSpacing:2,textTransform:"uppercase"}}>Profil · </span>
              <b>{profile.branche}</b>
              <button onClick={()=>setView("profile")} style={{marginLeft:10,background:"none",border:"none",color:C.pink,fontSize:12,cursor:"pointer",textDecoration:"underline"}}>bearbeiten</button>
            </div>

            <Grp label="💎 Angebote (Mehrfachauswahl)">
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {profile.angebote.map(a=>(
                  <div key={a.id} onClick={()=>toggleAng(a.id)} style={{background:gen.selectedAngebote.includes(a.id)?"#2a0f15":C.card,border:"2px solid "+(gen.selectedAngebote.includes(a.id)?C.pink:C.border),borderRadius:10,padding:"12px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:20,height:20,borderRadius:4,background:gen.selectedAngebote.includes(a.id)?C.pink:"transparent",border:"2px solid "+(gen.selectedAngebote.includes(a.id)?C.pink:C.border),display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0,color:"#fff"}}>
                      {gen.selectedAngebote.includes(a.id)?"✓":""}
                    </div>
                    <div>
                      <div style={{fontWeight:700}}>{a.name}{a.preis&&<span style={{color:C.pink,fontSize:12}}> · {a.preis}</span>}</div>
                      {a.beschreibung&&<div style={{color:C.beige,fontSize:12}}>{a.beschreibung}</div>}
                    </div>
                  </div>
                ))}
                <div style={{fontSize:12,color:"#666"}}>Nichts ausgewaehlt = alle Angebote</div>
              </div>
            </Grp>

            <Grp label="📅 Zeitraum">
              <div style={{display:"flex",gap:8}}>{[1,2,4].map(w=><Chip key={w} active={gen.weeks===w} onClick={()=>updG("weeks",w)}>{w} {w===1?"Woche":"Wochen"}</Chip>)}</div>
            </Grp>
            <Grp label="📲 Feed-Posts / Woche">
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{[1,2,3,4,5].map(n=><Chip key={n} active={gen.feedDays===n} onClick={()=>updG("feedDays",n)}>{n}x</Chip>)}</div>
            </Grp>
            <Grp label="📖 Stories / Woche">
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{[0,1,2,3,5,7].map(n=><Chip key={n} active={gen.storyDays===n} onClick={()=>updG("storyDays",n)}>{n}x</Chip>)}</div>
            </Grp>
            <Grp label="🎯 Content-Ziel">
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {["Wachstum (neue Reichweite)","Verbindung und Vertrauen","Launch und Verkauf"].map(z=>(
                  <Chip key={z} active={gen.ziel===z} onClick={()=>updG("ziel",z)}>{z}</Chip>
                ))}
              </div>
              <div style={{marginTop:8,fontSize:12,color:C.beige}}>
                {gen.ziel==="Wachstum (neue Reichweite)"&&"Authority 60% | Demand 30% | Conversion 10%"}
                {gen.ziel==="Verbindung und Vertrauen"&&"Authority 30% | Demand 50% | Conversion 20%"}
                {gen.ziel==="Launch und Verkauf"&&"Authority 20% | Demand 30% | Conversion 50%"}
              </div>
            </Grp>
            <Grp label="💡 Schwerpunkt-Thema (optional)">
              <IN value={gen.thema} onChange={v=>updG("thema",v)} ph="z.B. Kurs-Launch im Oktober..."/>
            </Grp>
            <button onClick={generate} style={{...S.primary,width:"100%",fontSize:15,padding:16,marginTop:8}}>
              🚀 Content fuer {gen.weeks} {gen.weeks===1?"Woche":"Wochen"} erstellen!
            </button>
          </div>
        )}

        {/* RESULT */}
        {view==="result" && (
          <div>
            {loading ? (
              <div style={{textAlign:"center",padding:"60px 0"}}>
                <div style={{fontSize:44,marginBottom:16}}>✨</div>
                <div style={{fontWeight:800,fontSize:18,marginBottom:8}}>Dein Content wird erstellt...</div>
                <div style={{color:C.beige,fontSize:13,marginBottom:24}}>Hooks, Captions, Storytelling – alles wird auf deine Traumkundin zugeschnitten.</div>
                <div className="spinner"><div className="dot"/><div className="dot"/><div className="dot"/></div>
              </div>
            ):(
              <div>
                <div style={{background:C.pink,borderRadius:12,padding:"14px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:22}}>🎉</span>
                  <div>
                    <div style={{fontWeight:800,fontSize:15}}>Dein Content ist fertig!</div>
                    <div style={{fontSize:12,opacity:.85}}>3x3 Content to Cash Code · by Brit Ortlepp</div>
                  </div>
                  <button onClick={copyAll} style={{marginLeft:"auto",background:copied?"#27ae60":"rgba(255,255,255,.2)",border:"none",color:"#fff",borderRadius:20,padding:"8px 16px",fontSize:12,cursor:"pointer",fontWeight:700,whiteSpace:"nowrap"}}>
                    {copied?"✓ Kopiert!":"📋 Kopieren"}
                  </button>
                </div>
                <div style={{background:C.white,borderRadius:16,padding:"28px 24px",color:C.dark,fontSize:13.5,lineHeight:1.85}}>
                  <ResultRenderer text={result}/>
                </div>
                <div style={{display:"flex",gap:10,marginTop:16,flexWrap:"wrap"}}>
                  <button onClick={copyAll} style={{...S.primary,flex:1}}>{copied?"✓ Kopiert!":"📋 Alles kopieren"}</button>
                  <button onClick={generate} style={{...S.secondary,flex:1}}>🔄 Neu generieren</button>
                  <button onClick={()=>setView("generate")} style={{...S.secondary,flex:1}}>← Einstellungen</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultRenderer({text}) {
  const lines=text.split("\n"); const out=[]; let inTable=false, rows=[];
  const flush=()=>{
    if(!rows.length) return;
    const cols=r=>r.split("|").filter((_,i,a)=>i>0&&i<a.length-1);
    out.push(React.createElement("div",{key:"t"+out.length,style:{overflowX:"auto",margin:"12px 0 20px"}},
      React.createElement("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:12}},
        React.createElement("thead",null,React.createElement("tr",null,...cols(rows[0]).map((h,i)=>React.createElement("th",{key:i,style:{background:"#E94D60",color:"#fff",padding:"8px 10px",textAlign:"left",fontWeight:700,whiteSpace:"nowrap"}},h.trim())))),
        React.createElement("tbody",null,...rows.slice(2).map((row,ri)=>React.createElement("tr",{key:ri,style:{background:ri%2===0?"#f9f7f5":"#fff"}},...cols(row).map((c,ci)=>React.createElement("td",{key:ci,style:{padding:"7px 10px",borderBottom:"1px solid #eee",verticalAlign:"top"}},c.trim())))))
      )
    ));
    rows=[]; inTable=false;
  };
  lines.forEach((line,i)=>{
    if(line.startsWith("|")){inTable=true;rows.push(line);return;}
    if(inTable) flush();
    if(line.startsWith("# ")) out.push(React.createElement("h1",{key:i,style:{color:"#E94D60",fontSize:20,fontWeight:900,margin:"24px 0 10px",borderBottom:"2px solid #E94D60",paddingBottom:6}},line.slice(2)));
    else if(line.startsWith("## ")) out.push(React.createElement("h2",{key:i,style:{color:"#517383",fontSize:17,fontWeight:800,margin:"20px 0 8px"}},line.slice(3)));
    else if(line.startsWith("### ")) out.push(React.createElement("h3",{key:i,style:{color:"#1a1a1a",fontSize:14,fontWeight:800,margin:"14px 0 6px",background:"#f3f3f3",padding:"8px 12px",borderRadius:8,borderLeft:"3px solid #E94D60"}},line.slice(4)));
    else if(line.startsWith("**")&&line.includes(":**")){const idx=line.indexOf(":**");out.push(React.createElement("p",{key:i,style:{margin:"5px 0"}},React.createElement("strong",{style:{color:"#E94D60"}},line.slice(2,idx)+":"),line.slice(idx+3).replace(/\*\*/g,"")));}
    else if(line.startsWith("- ")||line.startsWith("* ")) out.push(React.createElement("li",{key:i,style:{marginLeft:20,marginBottom:3,lineHeight:1.75}},line.slice(2)));
    else if(line.trim()==="") out.push(React.createElement("div",{key:i,style:{height:6}}));
    else out.push(React.createElement("p",{key:i,style:{margin:"3px 0",lineHeight:1.85}},line.replace(/\*\*/g,"")));
  });
  if(inTable) flush();
  return React.createElement(React.Fragment,null,...out);
}

function ErrBox({msg}) { return React.createElement("div",{style:{background:"#2a0a0a",border:"1px solid #E94D60",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#ff8888",marginBottom:12}},"⚠️ "+msg); }
function Grp({label,children,err}) { return React.createElement("div",{style:{marginBottom:20}},React.createElement("label",{style:{display:"block",color:err?"#ff8888":"#E7DFD7",fontSize:11,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8,fontWeight:700}},label),children,err&&React.createElement("div",{style:{color:"#ff8888",fontSize:12,marginTop:6}},"⚠️ "+err)); }
function IN({value,onChange,ph,style={}}) { return React.createElement("input",{value,onChange:e=>onChange(e.target.value),placeholder:ph,style:{width:"100%",background:"#2a2a2a",border:"1px solid #383838",borderRadius:10,color:"#fff",padding:"13px 15px",fontSize:13.5,fontFamily:"inherit",boxSizing:"border-box",...style}}); }
function TA({value,onChange,ph,rows=3}) { return React.createElement("textarea",{value,onChange:e=>onChange(e.target.value),placeholder:ph,rows,style:{width:"100%",background:"#2a2a2a",border:"1px solid #383838",borderRadius:10,color:"#fff",padding:"13px 15px",fontSize:13.5,fontFamily:"inherit",boxSizing:"border-box",resize:"vertical",lineHeight:1.6}}); }
function Chip({children,active,onClick}) { return React.createElement("button",{onClick,style:{...S.chip,background:active?"#E94D60":"#2a2a2a",color:active?"#fff":"#E7DFD7",border:"1px solid "+(active?"#E94D60":"#383838")}},children); }

const S = {
  primary: {background:"#E94D60",color:"#fff",border:"none",borderRadius:25,padding:"13px 26px",fontSize:13.5,fontWeight:800,cursor:"pointer",fontFamily:"inherit"},
  secondary: {background:"transparent",color:"#E7DFD7",border:"1px solid #383838",borderRadius:25,padding:"13px 22px",fontSize:13,cursor:"pointer",fontFamily:"inherit"},
  ghost: {background:"transparent",color:"#E7DFD7",border:"1px solid #383838",borderRadius:20,padding:"7px 14px",cursor:"pointer",fontFamily:"inherit",fontWeight:600},
  chip: {borderRadius:22,padding:"9px 16px",fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:700},
};

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
