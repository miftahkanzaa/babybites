import { useState, useEffect, useRef } from "react";

// ── Calorie needs lookup ──────────────────────────────────────────────────────
// Based on WHO / Indonesian MoH 2019 guidelines (kcal/kg/day)
const getCalorieNeeds = (ageMonths, weightKg) => {
  let kcalPerKg;
  if (ageMonths < 3) kcalPerKg = 108;
  else if (ageMonths < 6) kcalPerKg = 98;
  else if (ageMonths < 9) kcalPerKg = 94;
  else if (ageMonths < 12) kcalPerKg = 95;
  else if (ageMonths < 24) kcalPerKg = 90;
  else kcalPerKg = 82;
  return Math.round(kcalPerKg * weightKg);
};

// ── Common baby foods (kcal per 100g unless noted) ────────────────────────────
const FOOD_DB = [
  { name: "ASI / Breast Milk", unit: "ml", kcalPer: 0.65 },
  { name: "Susu Formula", unit: "ml", kcalPer: 0.67 },
  { name: "Bubur Bayi (instan)", unit: "g", kcalPer: 3.9 },
  { name: "Nasi Tim", unit: "g", kcalPer: 1.1 },
  { name: "Pisang", unit: "g", kcalPer: 0.89 },
  { name: "Alpukat", unit: "g", kcalPer: 1.6 },
  { name: "Ubi Jalar", unit: "g", kcalPer: 0.86 },
  { name: "Kentang Kukus", unit: "g", kcalPer: 0.77 },
  { name: "Wortel Kukus", unit: "g", kcalPer: 0.41 },
  { name: "Brokoli Kukus", unit: "g", kcalPer: 0.35 },
  { name: "Kuning Telur", unit: "g", kcalPer: 3.22 },
  { name: "Telur Ayam", unit: "g", kcalPer: 1.55 },
  { name: "Ayam Suwir", unit: "g", kcalPer: 1.65 },
  { name: "Daging Sapi", unit: "g", kcalPer: 2.5 },
  { name: "Ikan Salmon", unit: "g", kcalPer: 2.08 },
  { name: "Tahu", unit: "g", kcalPer: 0.76 },
  { name: "Tempe", unit: "g", kcalPer: 1.93 },
  { name: "Bubur Kacang Hijau", unit: "g", kcalPer: 1.42 },
  { name: "Keju", unit: "g", kcalPer: 4.02 },
  { name: "Yogurt Plain", unit: "g", kcalPer: 0.59 },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

// ── Tiny helpers ─────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");
const fmtDate = (d) => {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
};

// ══════════════════════════════════════════════════════════════════════════════
export default function BabyCalorieTracker() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [screen, setScreen] = useState("home"); // home | setup | journal | add | recipe
  const [baby, setBaby] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bct_baby")) || null; } catch { return null; }
  });
  const [journal, setJournal] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bct_journal")) || {}; } catch { return {}; }
  });
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [notifShown, setNotifShown] = useState(false);

  // setup form
  const [setupForm, setSetupForm] = useState({ name: "", birthYear: "", birthMonth: "", birthDay: "", weight: "" });

  // add food form
  const [addFood, setAddFood] = useState({ search: "", selected: null, amount: "", note: "", isCustom: false, customName: "", customKcal: "" });

  // recipe upload
  const [recipeText, setRecipeText] = useState("");
  const [recipeResult, setRecipeResult] = useState(null);
  const [recipeLoading, setRecipeLoading] = useState(false);

  const notifRef = useRef(null);

  // ── Persist ────────────────────────────────────────────────────────────────
  useEffect(() => { if (baby) localStorage.setItem("bct_baby", JSON.stringify(baby)); }, [baby]);
  useEffect(() => { localStorage.setItem("bct_journal", JSON.stringify(journal)); }, [journal]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const getAgeMonths = () => {
    if (!baby) return 0;
    const birth = new Date(baby.birthYear, baby.birthMonth - 1, baby.birthDay);
    const now = new Date();
    return Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth()));
  };

  const ageMonths = getAgeMonths();
  const calTarget = baby ? getCalorieNeeds(ageMonths, parseFloat(baby.weight)) : 0;
  const todayEntries = journal[selectedDate] || [];
  const totalKcal = todayEntries.reduce((s, e) => s + e.kcal, 0);
  const remaining = Math.max(0, calTarget - totalKcal);
  const pct = calTarget > 0 ? Math.min(100, Math.round((totalKcal / calTarget) * 100)) : 0;

  // ── Notification ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!baby || selectedDate !== todayStr()) return;
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 18 && remaining > 0 && !notifShown) {
      setNotifShown(true);
    }
  }, [totalKcal, baby, selectedDate]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const saveBaby = () => {
    const { name, birthYear, birthMonth, birthDay, weight } = setupForm;
    if (!name || !birthYear || !birthMonth || !birthDay || !weight) return;
    setBaby({ name, birthYear: +birthYear, birthMonth: +birthMonth, birthDay: +birthDay, weight: +weight });
    setScreen("home");
  };

  const addEntry = () => {
    const { selected, amount, note, isCustom, customName, customKcal } = addFood;
    if (!amount) return;
    let kcal, label;
    if (isCustom) {
      if (!customName || !customKcal) return;
      kcal = Math.round(parseFloat(customKcal));
      label = customName;
    } else {
      if (!selected) return;
      kcal = Math.round(selected.kcalPer * parseFloat(amount));
      label = `${selected.name} (${amount} ${selected.unit})`;
    }
    const entry = { id: Date.now(), label, kcal, note, time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) };
    setJournal(j => ({ ...j, [selectedDate]: [...(j[selectedDate] || []), entry] }));
    setAddFood({ search: "", selected: null, amount: "", note: "", isCustom: false, customName: "", customKcal: "" });
    setScreen("journal");
  };

  const deleteEntry = (id) => {
    setJournal(j => ({ ...j, [selectedDate]: (j[selectedDate] || []).filter(e => e.id !== id) }));
  };

  const analyzeRecipe = async () => {
    if (!recipeText.trim()) return;
    setRecipeLoading(true);
    setRecipeResult(null);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Analisa resep MPASI berikut dan hitung total kalori. Balas HANYA dalam format JSON berikut tanpa markdown:\n{"total_kcal": <angka>, "servings": <porsi>, "kcal_per_serving": <angka>, "ingredients": [{"name": "...", "amount": "...", "kcal": <angka>}], "notes": "..."}\n\nResep:\n${recipeText}`
          }]
        })
      });
      const data = await resp.json();
      const text = data.content?.map(c => c.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      setRecipeResult(JSON.parse(clean));
    } catch (e) {
      setRecipeResult({ error: "Gagal menganalisa resep. Coba lagi." });
    }
    setRecipeLoading(false);
  };

  const addRecipeToJournal = () => {
    if (!recipeResult || recipeResult.error) return;
    const kcal = recipeResult.kcal_per_serving || recipeResult.total_kcal;
    const entry = { id: Date.now(), label: `Resep: ${recipeText.slice(0, 40)}…`, kcal: Math.round(kcal), note: `${recipeResult.servings || 1} porsi`, time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) };
    setJournal(j => ({ ...j, [selectedDate]: [...(j[selectedDate] || []), entry] }));
    setRecipeText("");
    setRecipeResult(null);
    setScreen("journal");
  };

  const filteredFoods = FOOD_DB.filter(f => f.name.toLowerCase().includes(addFood.search.toLowerCase()));

  // ── Ring SVG ──────────────────────────────────────────────────────────────
  const Ring = ({ pct, size = 160, stroke = 14 }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    const color = pct >= 100 ? "#4ade80" : pct >= 60 ? "#fbbf24" : "#f472b6";
    return (
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round" style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // STYLES
  // ══════════════════════════════════════════════════════════════════════════
  const S = {
    app: { minHeight: "100vh", background: "linear-gradient(135deg,#1a0533 0%,#2d1052 40%,#0f2044 100%)", fontFamily: "'Nunito', sans-serif", color: "#fff", display: "flex", flexDirection: "column", maxWidth: 430, margin: "0 auto", position: "relative", overflow: "hidden" },
    header: { padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" },
    logo: { fontSize: 22, fontWeight: 900, background: "linear-gradient(90deg,#f9a8d4,#c084fc,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    settingsBtn: { background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 12, padding: "8px 12px", color: "#fff", cursor: "pointer", fontSize: 18 },
    main: { flex: 1, padding: "0 20px 100px", overflowY: "auto" },
    card: { background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", borderRadius: 24, padding: 20, marginTop: 16, border: "1px solid rgba(255,255,255,0.12)" },
    cardPink: { background: "linear-gradient(135deg,rgba(244,114,182,0.25),rgba(192,132,252,0.25))", backdropFilter: "blur(20px)", borderRadius: 24, padding: 20, marginTop: 16, border: "1px solid rgba(244,114,182,0.3)" },
    sectionTitle: { fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#c084fc", textTransform: "uppercase", marginBottom: 8 },
    bigNum: { fontSize: 42, fontWeight: 900, lineHeight: 1 },
    smallLabel: { fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 },
    pill: { display: "inline-block", background: "rgba(192,132,252,0.2)", border: "1px solid rgba(192,132,252,0.4)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#e9d5ff" },
    btn: { width: "100%", padding: "14px 20px", borderRadius: 16, border: "none", background: "linear-gradient(135deg,#f472b6,#c084fc)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "'Nunito',sans-serif" },
    btnGhost: { background: "rgba(255,255,255,0.08)", color: "#e9d5ff", border: "1px solid rgba(255,255,255,0.15)", width: "100%", padding: "12px 20px", borderRadius: 16, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Nunito',sans-serif" },
    input: { width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 14, fontFamily: "'Nunito',sans-serif", boxSizing: "border-box", outline: "none" },
    label: { fontSize: 12, color: "#c084fc", fontWeight: 700, marginBottom: 6, display: "block" },
    entryRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" },
    entryIcon: { width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg,rgba(244,114,182,0.3),rgba(192,132,252,0.3))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    fab: { position: "fixed", bottom: 90, right: 24, width: 56, height: 56, borderRadius: 20, background: "linear-gradient(135deg,#f472b6,#c084fc)", border: "none", color: "#fff", fontSize: 26, cursor: "pointer", boxShadow: "0 8px 24px rgba(244,114,182,0.5)", display: "flex", alignItems: "center", justifyContent: "center" },
    bottomNav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(15,5,35,0.9)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", padding: "8px 0 16px" },
    navBtn: (active) => ({ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", color: active ? "#f472b6" : "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 10, fontWeight: 700, fontFamily: "'Nunito',sans-serif", letterSpacing: 0.5 }),
    notifBanner: { position: "fixed", top: 16, left: 16, right: 16, zIndex: 999, background: "linear-gradient(135deg,#f472b6,#c084fc)", borderRadius: 18, padding: "14px 18px", boxShadow: "0 8px 30px rgba(244,114,182,0.5)", display: "flex", alignItems: "center", gap: 12 },
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SCREENS
  // ══════════════════════════════════════════════════════════════════════════

  // ── Setup ─────────────────────────────────────────────────────────────────
  if (!baby || screen === "setup") {
    return (
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <div style={S.header}><span style={S.logo}>🍼 BabyBites</span></div>
        <div style={{ ...S.main, paddingTop: 24 }}>
          <div style={S.cardPink}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>👶</div>
            <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 4 }}>Halo, Bun! 🌸</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>Yuk isi data si kecil dulu supaya kita bisa hitung kebutuhan kalorinya secara otomatis!</div>
          </div>
          <div style={S.card}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={S.label}>Nama Bayi</label><input style={S.input} placeholder="Contoh: Bintang" value={setupForm.name} onChange={e => setSetupForm(f => ({...f, name: e.target.value}))} /></div>
              <div>
                <label style={S.label}>Tanggal Lahir</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input style={{...S.input, width: "33%"}} placeholder="DD" maxLength={2} type="number" value={setupForm.birthDay} onChange={e => setSetupForm(f => ({...f, birthDay: e.target.value}))} />
                  <input style={{...S.input, width: "33%"}} placeholder="MM" maxLength={2} type="number" value={setupForm.birthMonth} onChange={e => setSetupForm(f => ({...f, birthMonth: e.target.value}))} />
                  <input style={{...S.input, width: "34%"}} placeholder="YYYY" maxLength={4} type="number" value={setupForm.birthYear} onChange={e => setSetupForm(f => ({...f, birthYear: e.target.value}))} />
                </div>
              </div>
              <div><label style={S.label}>Berat Badan (kg)</label><input style={S.input} placeholder="Contoh: 7.5" type="number" step="0.1" value={setupForm.weight} onChange={e => setSetupForm(f => ({...f, weight: e.target.value}))} /></div>
            </div>
            <div style={{ marginTop: 20 }}>
              <button style={S.btn} onClick={saveBaby}>Simpan & Mulai Tracking 🚀</button>
              {baby && <button style={{...S.btnGhost, marginTop: 10}} onClick={() => setScreen("home")}>Batal</button>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Add Food ──────────────────────────────────────────────────────────────
  if (screen === "add") {
    return (
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <div style={S.header}>
          <button style={S.settingsBtn} onClick={() => setScreen("journal")}>←</button>
          <span style={S.logo}>Tambah Makanan</span>
          <div style={{ width: 42 }} />
        </div>
        <div style={{ ...S.main, paddingTop: 16 }}>
          {/* Toggle custom */}
          <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
            <button onClick={() => setAddFood(f => ({...f, isCustom: false}))} style={{ ...S.btnGhost, width: "auto", padding: "8px 16px", ...(addFood.isCustom ? {} : { background: "rgba(244,114,182,0.25)", borderColor: "#f472b6", color: "#fff" }) }}>Pilih Makanan</button>
            <button onClick={() => setAddFood(f => ({...f, isCustom: true}))} style={{ ...S.btnGhost, width: "auto", padding: "8px 16px", ...(!addFood.isCustom ? {} : { background: "rgba(244,114,182,0.25)", borderColor: "#f472b6", color: "#fff" }) }}>Input Manual</button>
          </div>

          {!addFood.isCustom ? (
            <div style={S.card}>
              <input style={S.input} placeholder="🔍 Cari makanan…" value={addFood.search} onChange={e => setAddFood(f => ({...f, search: e.target.value, selected: null}))} />
              <div style={{ maxHeight: 220, overflowY: "auto", marginTop: 10 }}>
                {filteredFoods.map(f => (
                  <div key={f.name} onClick={() => setAddFood(a => ({...a, selected: f, search: f.name}))}
                    style={{ padding: "10px 12px", borderRadius: 12, cursor: "pointer", marginBottom: 4, background: addFood.selected?.name === f.name ? "rgba(244,114,182,0.2)" : "rgba(255,255,255,0.04)", border: addFood.selected?.name === f.name ? "1px solid rgba(244,114,182,0.5)" : "1px solid transparent", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14 }}>{f.name}</span>
                    <span style={{ fontSize: 12, color: "#c084fc" }}>{f.kcalPer} kkal/{f.unit}</span>
                  </div>
                ))}
              </div>
              {addFood.selected && (
                <div style={{ marginTop: 12 }}>
                  <label style={S.label}>Jumlah ({addFood.selected.unit})</label>
                  <input style={S.input} type="number" placeholder="0" value={addFood.amount} onChange={e => setAddFood(f => ({...f, amount: e.target.value}))} />
                  {addFood.amount && <div style={{ ...S.pill, marginTop: 8 }}>≈ {Math.round(addFood.selected.kcalPer * parseFloat(addFood.amount || 0))} kkal</div>}
                </div>
              )}
            </div>
          ) : (
            <div style={S.card}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div><label style={S.label}>Nama Makanan</label><input style={S.input} placeholder="Misal: Bubur Ayam Wortel" value={addFood.customName} onChange={e => setAddFood(f => ({...f, customName: e.target.value}))} /></div>
                <div><label style={S.label}>Total Kalori (kkal)</label><input style={S.input} type="number" placeholder="0" value={addFood.customKcal} onChange={e => setAddFood(f => ({...f, customKcal: e.target.value}))} /></div>
              </div>
            </div>
          )}

          <div style={S.card}>
            <label style={S.label}>Catatan (opsional)</label>
            <input style={S.input} placeholder="Misal: makan siang, lahap banget 😄" value={addFood.note} onChange={e => setAddFood(f => ({...f, note: e.target.value}))} />
          </div>

          <div style={{ marginTop: 16 }}>
            <button style={S.btn} onClick={addEntry}>✓ Simpan ke Journal</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Recipe Analyzer ───────────────────────────────────────────────────────
  if (screen === "recipe") {
    return (
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <div style={S.header}>
          <button style={S.settingsBtn} onClick={() => setScreen("home")}>←</button>
          <span style={S.logo}>Analisa Resep</span>
          <div style={{ width: 42 }} />
        </div>
        <div style={{ ...S.main, paddingTop: 16 }}>
          <div style={S.cardPink}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
              🤖 Masukkan resep MPASI (bahan + takaran) dan AI akan menghitung kalorinya secara otomatis!
            </div>
          </div>
          <div style={S.card}>
            <label style={S.label}>Resep MPASI</label>
            <textarea style={{ ...S.input, height: 180, resize: "none", lineHeight: 1.6 }} placeholder={"Contoh:\nBubur Ayam Wortel (2 porsi)\n- Beras 50g\n- Ayam fillet 30g\n- Wortel 40g\n- Kaldu ayam 200ml\n- Keju parut 10g"} value={recipeText} onChange={e => setRecipeText(e.target.value)} />
            <button style={{ ...S.btn, marginTop: 12 }} onClick={analyzeRecipe} disabled={recipeLoading}>
              {recipeLoading ? "⏳ Menghitung…" : "🔬 Analisa Kalori"}
            </button>
          </div>

          {recipeResult && !recipeResult.error && (
            <div style={S.card}>
              <div style={{ ...S.sectionTitle, marginBottom: 12 }}>Hasil Analisa</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div><div style={{ ...S.bigNum, fontSize: 32 }}>{recipeResult.total_kcal}</div><div style={S.smallLabel}>Total kkal</div></div>
                <div style={{ textAlign: "right" }}><div style={{ ...S.bigNum, fontSize: 32 }}>{recipeResult.kcal_per_serving}</div><div style={S.smallLabel}>kkal / porsi</div></div>
              </div>
              {recipeResult.ingredients?.map((ing, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.07)", fontSize: 13 }}>
                  <span>{ing.name} <span style={{ color: "rgba(255,255,255,0.45)" }}>({ing.amount})</span></span>
                  <span style={{ color: "#f9a8d4" }}>{ing.kcal} kkal</span>
                </div>
              ))}
              {recipeResult.notes && <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.55)", fontStyle: "italic" }}>{recipeResult.notes}</div>}
              <button style={{ ...S.btn, marginTop: 16 }} onClick={addRecipeToJournal}>+ Tambah ke Journal Hari Ini</button>
            </div>
          )}
          {recipeResult?.error && <div style={{ ...S.card, color: "#fca5a5" }}>{recipeResult.error}</div>}
        </div>
      </div>
    );
  }

  // ── Journal ───────────────────────────────────────────────────────────────
  if (screen === "journal") {
    // last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    }).reverse();

    return (
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <div style={S.header}><span style={S.logo}>🍼 BabyBites</span><button style={S.settingsBtn} onClick={() => setScreen("setup")}>⚙️</button></div>
        <div style={{ ...S.main, paddingTop: 16 }}>
          {/* Date selector */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
            {days.map(d => (
              <button key={d} onClick={() => setSelectedDate(d)} style={{ flexShrink: 0, padding: "8px 12px", borderRadius: 14, border: "none", background: selectedDate === d ? "linear-gradient(135deg,#f472b6,#c084fc)" : "rgba(255,255,255,0.08)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>{fmtDate(d)}</button>
            ))}
          </div>

          {/* Summary mini card */}
          <div style={{ ...S.cardPink, display: "flex", alignItems: "center", gap: 16 }}>
            <Ring pct={pct} size={80} stroke={8} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 22 }}>{totalKcal} <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>/ {calTarget} kkal</span></div>
              <div style={S.smallLabel}>{pct}% terpenuhi</div>
              {remaining > 0 && <div style={{ ...S.pill, marginTop: 6, fontSize: 11 }}>Kurang {remaining} kkal lagi</div>}
              {remaining === 0 && <div style={{ ...S.pill, marginTop: 6, fontSize: 11, background: "rgba(74,222,128,0.2)", borderColor: "#4ade80", color: "#4ade80" }}>✓ Target tercapai!</div>}
            </div>
          </div>

          {/* Entries */}
          <div style={S.card}>
            <div style={S.sectionTitle}>Food Journal {selectedDate === todayStr() ? "Hari Ini" : fmtDate(selectedDate)}</div>
            {todayEntries.length === 0 && <div style={{ textAlign: "center", padding: "24px 0", color: "rgba(255,255,255,0.35)", fontSize: 14 }}>Belum ada makanan dicatat 🍽️</div>}
            {todayEntries.map(e => (
              <div key={e.id} style={S.entryRow}>
                <div style={S.entryIcon}>🥣</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{e.label}</div>
                  {e.note && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{e.note}</div>}
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{e.time}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, color: "#f9a8d4" }}>{e.kcal}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>kkal</div>
                  <button onClick={() => deleteEntry(e.id)} style={{ background: "none", border: "none", color: "rgba(255,100,100,0.5)", cursor: "pointer", fontSize: 14, marginTop: 2 }}>✕</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            <button style={S.btnGhost} onClick={() => setScreen("recipe")}>🔬 Analisa Resep dengan AI</button>
          </div>
        </div>
        <button style={S.fab} onClick={() => setScreen("add")}>+</button>
        <BottomNav screen={screen} setScreen={setScreen} S={S} />
      </div>
    );
  }

  // ── Home ─────────────────────────────────────────────────────────────────
  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Notification banner */}
      {notifShown && (
        <div style={S.notifBanner}>
          <span style={{ fontSize: 24 }}>🔔</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>Perhatian, Bun!</div>
            <div style={{ fontSize: 12 }}>{baby.name} masih butuh <b>{remaining} kkal</b> lagi hari ini</div>
          </div>
          <button onClick={() => setNotifShown(false)} style={{ background: "rgba(255,255,255,0.3)", border: "none", borderRadius: 10, padding: "4px 10px", color: "#fff", cursor: "pointer", fontWeight: 700 }}>✕</button>
        </div>
      )}

      <div style={S.header}>
        <span style={S.logo}>🍼 BabyBites</span>
        <button style={S.settingsBtn} onClick={() => { setSetupForm({ name: baby.name, birthYear: baby.birthYear, birthMonth: baby.birthMonth, birthDay: baby.birthDay, weight: baby.weight }); setScreen("setup"); }}>⚙️</button>
      </div>

      <div style={{ ...S.main, paddingTop: 16 }}>
        {/* Baby info */}
        <div style={S.cardPink}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={S.sectionTitle}>Profil Bayi</div>
              <div style={{ fontWeight: 900, fontSize: 22 }}>{baby.name} 👶</div>
              <div style={{ ...S.smallLabel, marginTop: 4 }}>{ageMonths} bulan · {baby.weight} kg</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={S.sectionTitle}>Kebutuhan Harian</div>
              <div style={{ fontWeight: 900, fontSize: 28, color: "#f9a8d4" }}>{calTarget}</div>
              <div style={S.smallLabel}>kkal / hari</div>
            </div>
          </div>
        </div>

        {/* Calorie ring */}
        <div style={{ ...S.card, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "24px 20px" }}>
          <div style={S.sectionTitle}>Kalori Hari Ini</div>
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ring pct={pct} size={180} stroke={16} />
            <div style={{ position: "absolute", textAlign: "center" }}>
              <div style={{ ...S.bigNum }}>{totalKcal}</div>
              <div style={S.smallLabel}>dari {calTarget} kkal</div>
              <div style={{ ...S.pill, marginTop: 6 }}>{pct}%</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#4ade80" }}>{totalKcal}</div>
              <div style={S.smallLabel}>Dikonsumsi</div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#f472b6" }}>{remaining}</div>
              <div style={S.smallLabel}>Sisa</div>
            </div>
          </div>
        </div>

        {/* Status message */}
        {pct < 50 && (
          <div style={{ ...S.card, background: "rgba(251,191,36,0.1)", borderColor: "rgba(251,191,36,0.3)" }}>
            <div style={{ fontWeight: 800, color: "#fbbf24" }}>⚠️ Kalori masih kurang</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>Si kecil butuh {remaining} kkal lagi. Yuk tambahkan makanan! 🍲</div>
          </div>
        )}
        {pct >= 50 && pct < 100 && (
          <div style={{ ...S.card, background: "rgba(192,132,252,0.1)", borderColor: "rgba(192,132,252,0.3)" }}>
            <div style={{ fontWeight: 800, color: "#c084fc" }}>💜 Hampir sampai!</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>Tinggal {remaining} kkal lagi untuk memenuhi kebutuhan {baby.name} 🎯</div>
          </div>
        )}
        {pct >= 100 && (
          <div style={{ ...S.card, background: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.3)" }}>
            <div style={{ fontWeight: 800, color: "#4ade80" }}>🎉 Target tercapai!</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>Keren, Bun! Kebutuhan kalori {baby.name} hari ini sudah terpenuhi ✨</div>
          </div>
        )}

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button style={{ ...S.btn, flex: 1 }} onClick={() => setScreen("add")}>+ Catat Makanan</button>
          <button style={{ ...S.btnGhost, flex: 1 }} onClick={() => setScreen("recipe")}>🔬 Analisa Resep</button>
        </div>

        {/* Recent entries */}
        {todayEntries.length > 0 && (
          <div style={S.card}>
            <div style={S.sectionTitle}>Terakhir Dicatat</div>
            {todayEntries.slice(-3).reverse().map(e => (
              <div key={e.id} style={S.entryRow}>
                <div style={S.entryIcon}>🥣</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{e.label}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{e.time}</div>
                </div>
                <div style={{ fontWeight: 800, color: "#f9a8d4" }}>{e.kcal} kkal</div>
              </div>
            ))}
            <button style={{ ...S.btnGhost, marginTop: 12 }} onClick={() => setScreen("journal")}>Lihat Semua →</button>
          </div>
        )}
      </div>

      <BottomNav screen={screen} setScreen={setScreen} S={S} />
    </div>
  );
}

function BottomNav({ screen, setScreen, S }) {
  const items = [
    { id: "home", icon: "🏠", label: "Beranda" },
    { id: "journal", icon: "📋", label: "Journal" },
    { id: "recipe", icon: "🔬", label: "Resep" },
  ];
  return (
    <div style={S.bottomNav}>
      {items.map(item => (
        <button key={item.id} style={S.navBtn(screen === item.id)} onClick={() => setScreen(item.id)}>
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}