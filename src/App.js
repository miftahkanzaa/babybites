import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

const INGREDIENTS = {
  "🍼 Susu & Dairy": [
    { name: "ASI / Breast Milk", unit: "ml", kcalPer: 0.65 },
    { name: "Susu Formula", unit: "ml", kcalPer: 0.67 },
    { name: "Susu UHT Full Cream", unit: "ml", kcalPer: 0.61 },
    { name: "Susu UHT Low Fat", unit: "ml", kcalPer: 0.42 },
    { name: "Keju (umum)", unit: "g", kcalPer: 4.02 },
    { name: "Keju Gouda", unit: "g", kcalPer: 3.56 },
    { name: "Keju Babybel", unit: "g", kcalPer: 3.06 },
    { name: "Yogurt Plain", unit: "g", kcalPer: 0.59 },
    { name: "Mentega / Unsalted Butter", unit: "g", kcalPer: 7.17 },
    { name: "Santan", unit: "ml", kcalPer: 2.3 },
  ],
  "🍚 Karbohidrat": [
    { name: "Beras / Nasi Tim", unit: "g", kcalPer: 1.3 },
    { name: "Bubur Bayi Instan", unit: "g", kcalPer: 3.9 },
    { name: "Oatmeal", unit: "g", kcalPer: 3.89 },
    { name: "Ubi Jalar", unit: "g", kcalPer: 0.86 },
    { name: "Kentang", unit: "g", kcalPer: 0.77 },
    { name: "Singkong", unit: "g", kcalPer: 1.6 },
    { name: "Jagung", unit: "g", kcalPer: 0.86 },
    { name: "Roti Gandum", unit: "g", kcalPer: 2.47 },
    { name: "Makaroni / Pasta", unit: "g", kcalPer: 1.31 },
  ],
  "🥩 Protein Hewani": [
    { name: "Ayam Suwir", unit: "g", kcalPer: 1.65 },
    { name: "Daging Sapi", unit: "g", kcalPer: 2.5 },
    { name: "Otak Sapi", unit: "g", kcalPer: 1.51 },
    { name: "Bone Marrow (Sumsum)", unit: "g", kcalPer: 7.78 },
    { name: "Ikan Salmon", unit: "g", kcalPer: 2.08 },
    { name: "Ikan Tuna", unit: "g", kcalPer: 1.32 },
    { name: "Ikan Kakap", unit: "g", kcalPer: 0.92 },
    { name: "Ikan Kembung", unit: "g", kcalPer: 1.03 },
    { name: "Ikan Lele", unit: "g", kcalPer: 1.16 },
    { name: "Belut", unit: "g", kcalPer: 1.85 },
    { name: "Telur Ayam", unit: "g", kcalPer: 1.55 },
    { name: "Kuning Telur", unit: "g", kcalPer: 3.22 },
    { name: "Udang", unit: "g", kcalPer: 0.85 },
    { name: "Hati Ayam", unit: "g", kcalPer: 1.19 },
  ],
  "🌱 Protein Nabati": [
    { name: "Tahu", unit: "g", kcalPer: 0.76 },
    { name: "Tempe", unit: "g", kcalPer: 1.93 },
    { name: "Kacang Merah", unit: "g", kcalPer: 1.27 },
    { name: "Kacang Hijau", unit: "g", kcalPer: 1.47 },
    { name: "Edamame", unit: "g", kcalPer: 1.22 },
  ],
  "🥦 Sayuran": [
    { name: "Wortel", unit: "g", kcalPer: 0.41 },
    { name: "Brokoli", unit: "g", kcalPer: 0.35 },
    { name: "Bayam", unit: "g", kcalPer: 0.23 },
    { name: "Labu Kuning", unit: "g", kcalPer: 0.26 },
    { name: "Kabocha", unit: "g", kcalPer: 0.34 },
    { name: "Butternut Squash", unit: "g", kcalPer: 0.45 },
    { name: "Kangkung", unit: "g", kcalPer: 0.19 },
    { name: "Tomat", unit: "g", kcalPer: 0.18 },
    { name: "Buncis", unit: "g", kcalPer: 0.31 },
    { name: "Zucchini", unit: "g", kcalPer: 0.17 },
  ],
  "🍌 Buah": [
    { name: "Pisang", unit: "g", kcalPer: 0.89 },
    { name: "Alpukat", unit: "g", kcalPer: 1.6 },
    { name: "Apel", unit: "g", kcalPer: 0.52 },
    { name: "Pir", unit: "g", kcalPer: 0.57 },
    { name: "Mangga", unit: "g", kcalPer: 0.6 },
    { name: "Pepaya", unit: "g", kcalPer: 0.43 },
    { name: "Melon", unit: "g", kcalPer: 0.34 },
  ],
  "🫒 Lemak & Minyak": [
    { name: "Minyak Zaitun", unit: "ml", kcalPer: 8.84 },
    { name: "Minyak Kelapa", unit: "ml", kcalPer: 8.62 },
    { name: "Minyak Goreng", unit: "ml", kcalPer: 8.84 },
    { name: "Beef Tallow", unit: "g", kcalPer: 9.02 },
    { name: "Unsalted Butter", unit: "g", kcalPer: 7.17 },
  ],
};

const FOOD_DB = Object.values(INGREDIENTS).flat();
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d) => {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
};

export default function BabyCalorieTracker() {
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [screen, setScreen] = useState("home");
  const [babies, setBabies] = useState([]);
  const [activeBaby, setActiveBaby] = useState(null);
  const [journal, setJournal] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [notifShown, setNotifShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [babyForm, setBabyForm] = useState({ name: "", birthYear: "", birthMonth: "", birthDay: "", weight: "" });
  const [editingBaby, setEditingBaby] = useState(null);
  const [addFood, setAddFood] = useState({ search: "", selected: null, amount: "", note: "", isCustom: false, customName: "", customKcal: "" });
  const [recipeName, setRecipeName] = useState("");
  const [recipeServings, setRecipeServings] = useState("1");
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [openCategory, setOpenCategory] = useState(null);
  const [pendingIngredient, setPendingIngredient] = useState(null);
  const [pendingAmount, setPendingAmount] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoadingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session) loadBabies(); }, [session]);
  useEffect(() => { if (activeBaby) loadJournal(); }, [activeBaby, selectedDate]);

  const loadBabies = async () => {
    const { data } = await supabase.from("babies").select("*").order("created_at");
    if (data) { setBabies(data); if (data.length > 0) setActiveBaby(data[0]); }
  };

  const loadJournal = async () => {
    if (!activeBaby) return;
    const { data } = await supabase.from("journal_entries").select("*").eq("baby_id", activeBaby.id).eq("date", selectedDate).order("created_at");
    if (data) setJournal(data);
  };

  const handleAuth = async () => {
    setAuthError(""); setLoading(true);
    if (authMode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
      if (error) setAuthError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
      if (error) setAuthError(error.message);
      else setAuthError("✅ Cek email kamu untuk verifikasi!");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null); setBabies([]); setActiveBaby(null); setJournal([]); setScreen("home");
  };

  const saveBaby = async () => {
    const { name, birthYear, birthMonth, birthDay, weight } = babyForm;
    if (!name || !birthYear || !birthMonth || !birthDay || !weight) return;
    setLoading(true);
    if (editingBaby) {
      const { data } = await supabase.from("babies").update({ name, birth_year: +birthYear, birth_month: +birthMonth, birth_day: +birthDay, weight: +weight }).eq("id", editingBaby.id).select().single();
      if (data) { setBabies(b => b.map(x => x.id === data.id ? data : x)); setActiveBaby(data); }
    } else {
      const { data } = await supabase.from("babies").insert({ user_id: session.user.id, name, birth_year: +birthYear, birth_month: +birthMonth, birth_day: +birthDay, weight: +weight }).select().single();
      if (data) { setBabies(b => [...b, data]); setActiveBaby(data); }
    }
    setEditingBaby(null);
    setBabyForm({ name: "", birthYear: "", birthMonth: "", birthDay: "", weight: "" });
    setLoading(false); setScreen("home");
  };

  const deleteBaby = async (id) => {
    await supabase.from("babies").delete().eq("id", id);
    const left = babies.filter(b => b.id !== id);
    setBabies(left); setActiveBaby(left[0] || null);
    if (left.length === 0) setScreen("setup");
  };

  const addEntry = async () => {
    const { selected, amount, note, isCustom, customName, customKcal } = addFood;
    if (!amount || !activeBaby) return;
    let kcal, label;
    if (isCustom) {
      if (!customName || !customKcal) return;
      kcal = Math.round(parseFloat(customKcal)); label = customName;
    } else {
      if (!selected) return;
      kcal = Math.round(selected.kcalPer * parseFloat(amount));
      label = `${selected.name} (${amount} ${selected.unit})`;
    }
    const time = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const { data } = await supabase.from("journal_entries").insert({ user_id: session.user.id, baby_id: activeBaby.id, date: selectedDate, label, kcal, note, time }).select().single();
    if (data) setJournal(j => [...j, data]);
    setAddFood({ search: "", selected: null, amount: "", note: "", isCustom: false, customName: "", customKcal: "" });
    setScreen("journal");
  };

  const deleteEntry = async (id) => {
    await supabase.from("journal_entries").delete().eq("id", id);
    setJournal(j => j.filter(e => e.id !== id));
  };

  const recipeTotalKcal = recipeIngredients.reduce((s, i) => s + i.kcal, 0);
  const recipeKcalPerServing = parseFloat(recipeServings) > 0 ? Math.round(recipeTotalKcal / parseFloat(recipeServings)) : 0;

  const addIngredientToRecipe = () => {
    if (!pendingIngredient || !pendingAmount) return;
    const kcal = Math.round(pendingIngredient.kcalPer * parseFloat(pendingAmount));
    setRecipeIngredients(r => [...r, { id: Date.now(), name: pendingIngredient.name, amount: pendingAmount, unit: pendingIngredient.unit, kcal }]);
    setPendingIngredient(null); setPendingAmount(""); setOpenCategory(null);
  };

  const addRecipeToJournal = async () => {
    if (!recipeIngredients.length || !activeBaby) return;
    const label = recipeName || "Resep MPASI";
    const time = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const { data } = await supabase.from("journal_entries").insert({ user_id: session.user.id, baby_id: activeBaby.id, date: selectedDate, label: `${label} (1 porsi)`, kcal: recipeKcalPerServing, note: `dari ${recipeIngredients.length} bahan`, time }).select().single();
    if (data) setJournal(j => [...j, data]);
    setRecipeName(""); setRecipeServings("1"); setRecipeIngredients([]);
    setScreen("journal");
  };

  const getAgeMonths = () => {
    if (!activeBaby) return 0;
    const birth = new Date(activeBaby.birth_year, activeBaby.birth_month - 1, activeBaby.birth_day);
    const now = new Date();
    return Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth()));
  };

  const ageMonths = getAgeMonths();
  const calTarget = activeBaby ? getCalorieNeeds(ageMonths, parseFloat(activeBaby.weight)) : 0;
  const totalKcal = journal.reduce((s, e) => s + e.kcal, 0);
  const remaining = Math.max(0, calTarget - totalKcal);
  const pct = calTarget > 0 ? Math.min(100, Math.round((totalKcal / calTarget) * 100)) : 0;
  const filteredFoods = FOOD_DB.filter(f => f.name.toLowerCase().includes(addFood.search.toLowerCase()));

  useEffect(() => {
    if (!activeBaby || selectedDate !== todayStr()) return;
    const hour = new Date().getHours();
    if (hour >= 18 && remaining > 0 && !notifShown) setNotifShown(true);
  }, [activeBaby, selectedDate, remaining, notifShown]);

  const S = {
    app: { minHeight: "100vh", background: "linear-gradient(135deg,#1a0533 0%,#2d1052 40%,#0f2044 100%)", fontFamily: "'Nunito', sans-serif", color: "#fff", display: "flex", flexDirection: "column", maxWidth: 430, margin: "0 auto", position: "relative" },
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
    btnSmall: { background: "linear-gradient(135deg,#f472b6,#c084fc)", border: "none", borderRadius: 10, padding: "8px 16px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Nunito',sans-serif", whiteSpace: "nowrap" },
    btnDanger: { background: "rgba(255,100,100,0.15)", color: "#fca5a5", border: "1px solid rgba(255,100,100,0.3)", borderRadius: 10, padding: "6px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Nunito',sans-serif" },
    input: { width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 14, fontFamily: "'Nunito',sans-serif", boxSizing: "border-box", outline: "none" },
    label: { fontSize: 12, color: "#c084fc", fontWeight: 700, marginBottom: 6, display: "block" },
    entryRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" },
    entryIcon: { width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg,rgba(244,114,182,0.3),rgba(192,132,252,0.3))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    bottomNav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(15,5,35,0.9)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", padding: "8px 0 16px" },
    navBtn: (active) => ({ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", color: active ? "#f472b6" : "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 10, fontWeight: 700, fontFamily: "'Nunito',sans-serif", letterSpacing: 0.5 }),
    notifBanner: { position: "fixed", top: 16, left: 16, right: 16, zIndex: 999, background: "linear-gradient(135deg,#f472b6,#c084fc)", borderRadius: 18, padding: "14px 18px", boxShadow: "0 8px 30px rgba(244,114,182,0.5)", display: "flex", alignItems: "center", gap: 12 },
    catBtn: (open) => ({ width: "100%", padding: "12px 16px", borderRadius: 14, border: open ? "1px solid rgba(244,114,182,0.5)" : "1px solid rgba(255,255,255,0.1)", background: open ? "rgba(244,114,182,0.15)" : "rgba(255,255,255,0.05)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Nunito',sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }),
    ingItem: (sel) => ({ padding: "9px 12px", borderRadius: 10, cursor: "pointer", marginBottom: 4, background: sel ? "rgba(244,114,182,0.2)" : "rgba(255,255,255,0.04)", border: sel ? "1px solid rgba(244,114,182,0.5)" : "1px solid transparent", display: "flex", justifyContent: "space-between", alignItems: "center" }),
  };

  const Ring = ({ pct: p, size = 160, stroke = 14 }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (p / 100) * circ;
    const color = p >= 100 ? "#4ade80" : p >= 60 ? "#fbbf24" : "#f472b6";
    return (
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
    );
  };

  const BottomNav = () => (
    <div style={S.bottomNav}>
      {[{ id: "home", icon: "🏠", label: "Beranda" }, { id: "journal", icon: "📋", label: "Journal" }, { id: "recipe", icon: "🍲", label: "Resep" }, { id: "profiles", icon: "👶", label: "Profil" }].map(item => (
        <button key={item.id} style={S.navBtn(screen === item.id)} onClick={() => setScreen(item.id)}>
          <span style={{ fontSize: 18 }}>{item.icon}</span>{item.label}
        </button>
      ))}
    </div>
  );

  if (loadingAuth) return (
    <div style={{ ...S.app, alignItems: "center", justifyContent: "center" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ fontSize: 40 }}>🍼</div>
      <div style={{ marginTop: 12, color: "#c084fc", fontWeight: 700 }}>Loading BabyBites…</div>
    </div>
  );

  if (!session) return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={S.header}><span style={S.logo}>🍼 BabyBites</span></div>
      <div style={{ ...S.main, paddingTop: 24 }}>
        <div style={S.cardPink}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👶✨</div>
          <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 6 }}>Selamat Datang!</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
            {authMode === "login" ? "Login untuk melanjutkan tracking kalori si kecil 🌸" : "Daftar untuk mulai tracking kalori si kecil 🌸"}
          </div>
        </div>
        <div style={S.card}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button onClick={() => { setAuthMode("login"); setAuthError(""); }} style={{ ...S.btnGhost, width: "auto", flex: 1, padding: "10px", ...(authMode === "login" ? { background: "rgba(244,114,182,0.25)", borderColor: "#f472b6", color: "#fff" } : {}) }}>Login</button>
            <button onClick={() => { setAuthMode("register"); setAuthError(""); }} style={{ ...S.btnGhost, width: "auto", flex: 1, padding: "10px", ...(authMode === "register" ? { background: "rgba(244,114,182,0.25)", borderColor: "#f472b6", color: "#fff" } : {}) }}>Daftar</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div><label style={S.label}>Email</label><input style={S.input} type="email" placeholder="email@kamu.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} /></div>
            <div><label style={S.label}>Password</label><input style={S.input} type="password" placeholder="minimal 6 karakter" value={authPassword} onChange={e => setAuthPassword(e.target.value)} /></div>
          </div>
          {authError && <div style={{ marginTop: 10, fontSize: 13, color: authError.startsWith("✅") ? "#4ade80" : "#fca5a5" }}>{authError}</div>}
          <button style={{ ...S.btn, marginTop: 16, opacity: loading ? 0.7 : 1 }} onClick={handleAuth} disabled={loading}>
            {loading ? "⏳ Proses…" : authMode === "login" ? "🚀 Login" : "✨ Daftar Sekarang"}
          </button>
        </div>
      </div>
    </div>
  );

  if (babies.length === 0 || screen === "setup") return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={S.header}><span style={S.logo}>🍼 BabyBites</span><button style={S.settingsBtn} onClick={handleLogout}>Keluar</button></div>
      <div style={{ ...S.main, paddingTop: 24 }}>
        <div style={S.cardPink}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>👶</div>
          <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 4 }}>{editingBaby ? "Edit Profil" : "Tambah Profil Bayi"} 🌸</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>Isi data si kecil untuk menghitung kebutuhan kalori otomatis!</div>
        </div>
        <div style={S.card}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div><label style={S.label}>Nama Bayi</label><input style={S.input} placeholder="Contoh: Bintang" value={babyForm.name} onChange={e => setBabyForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div>
              <label style={S.label}>Tanggal Lahir</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input style={{ ...S.input, width: "33%" }} placeholder="DD" type="number" value={babyForm.birthDay} onChange={e => setBabyForm(f => ({ ...f, birthDay: e.target.value }))} />
                <input style={{ ...S.input, width: "33%" }} placeholder="MM" type="number" value={babyForm.birthMonth} onChange={e => setBabyForm(f => ({ ...f, birthMonth: e.target.value }))} />
                <input style={{ ...S.input, width: "34%" }} placeholder="YYYY" type="number" value={babyForm.birthYear} onChange={e => setBabyForm(f => ({ ...f, birthYear: e.target.value }))} />
              </div>
            </div>
            <div><label style={S.label}>Berat Badan (kg)</label><input style={S.input} placeholder="Contoh: 7.5" type="number" step="0.1" value={babyForm.weight} onChange={e => setBabyForm(f => ({ ...f, weight: e.target.value }))} /></div>
          </div>
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <button style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} onClick={saveBaby} disabled={loading}>{loading ? "⏳ Menyimpan…" : "Simpan 🚀"}</button>
            {babies.length > 0 && <button style={S.btnGhost} onClick={() => { setScreen("home"); setEditingBaby(null); }}>Batal</button>}
          </div>
        </div>
      </div>
    </div>
  );

  if (screen === "profiles") return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={S.header}><span style={S.logo}>🍼 BabyBites</span><button style={S.settingsBtn} onClick={handleLogout}>Keluar</button></div>
      <div style={{ ...S.main, paddingTop: 16 }}>
        <div style={S.cardPink}>
          <div style={S.sectionTitle}>Akun</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>📧 {session.user.email}</div>
        </div>
        <div style={S.card}>
          <div style={S.sectionTitle}>Profil Bayi</div>
          {babies.map(b => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div onClick={() => { setActiveBaby(b); setScreen("home"); }} style={{ flex: 1, cursor: "pointer", background: activeBaby?.id === b.id ? "rgba(244,114,182,0.15)" : "transparent", borderRadius: 12, padding: "8px 12px", border: activeBaby?.id === b.id ? "1px solid rgba(244,114,182,0.4)" : "1px solid transparent" }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{b.name} {activeBaby?.id === b.id ? "✓" : ""}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{b.weight} kg</div>
              </div>
              <button style={S.settingsBtn} onClick={() => { setEditingBaby(b); setBabyForm({ name: b.name, birthYear: b.birth_year, birthMonth: b.birth_month, birthDay: b.birth_day, weight: b.weight }); setScreen("setup"); }}>✏️</button>
              <button style={S.btnDanger} onClick={() => deleteBaby(b.id)}>Hapus</button>
            </div>
          ))}
          <button style={{ ...S.btn, marginTop: 16 }} onClick={() => { setEditingBaby(null); setBabyForm({ name: "", birthYear: "", birthMonth: "", birthDay: "", weight: "" }); setScreen("setup"); }}>+ Tambah Profil Bayi</button>
        </div>
      </div>
      <BottomNav />
    </div>
  );

  if (screen === "add") return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={S.header}>
        <button style={S.settingsBtn} onClick={() => setScreen("journal")}>←</button>
        <span style={S.logo}>Tambah Makanan</span>
        <div style={{ width: 42 }} />
      </div>
      <div style={{ ...S.main, paddingTop: 16 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          <button onClick={() => setAddFood(f => ({ ...f, isCustom: false }))} style={{ ...S.btnGhost, width: "auto", padding: "8px 16px", ...(addFood.isCustom ? {} : { background: "rgba(244,114,182,0.25)", borderColor: "#f472b6", color: "#fff" }) }}>Pilih Makanan</button>
          <button onClick={() => setAddFood(f => ({ ...f, isCustom: true }))} style={{ ...S.btnGhost, width: "auto", padding: "8px 16px", ...(!addFood.isCustom ? {} : { background: "rgba(244,114,182,0.25)", borderColor: "#f472b6", color: "#fff" }) }}>Input Manual</button>
        </div>
        {!addFood.isCustom ? (
          <div style={S.card}>
            <input style={S.input} placeholder="🔍 Cari makanan…" value={addFood.search} onChange={e => setAddFood(f => ({ ...f, search: e.target.value, selected: null }))} />
            <div style={{ maxHeight: 220, overflowY: "auto", marginTop: 10 }}>
              {filteredFoods.map(f => (
                <div key={f.name} onClick={() => setAddFood(a => ({ ...a, selected: f, search: f.name }))}
                  style={{ padding: "10px 12px", borderRadius: 12, cursor: "pointer", marginBottom: 4, background: addFood.selected?.name === f.name ? "rgba(244,114,182,0.2)" : "rgba(255,255,255,0.04)", border: addFood.selected?.name === f.name ? "1px solid rgba(244,114,182,0.5)" : "1px solid transparent", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14 }}>{f.name}</span>
                  <span style={{ fontSize: 12, color: "#c084fc" }}>{f.kcalPer} kkal/{f.unit}</span>
                </div>
              ))}
            </div>
            {addFood.selected && (
              <div style={{ marginTop: 12 }}>
                <label style={S.label}>Jumlah ({addFood.selected.unit})</label>
                <input style={S.input} type="number" placeholder="0" value={addFood.amount} onChange={e => setAddFood(f => ({ ...f, amount: e.target.value }))} />
                {addFood.amount && <div style={{ ...S.pill, marginTop: 8 }}>≈ {Math.round(addFood.selected.kcalPer * parseFloat(addFood.amount || 0))} kkal</div>}
              </div>
            )}
          </div>
        ) : (
          <div style={S.card}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div><label style={S.label}>Nama Makanan</label><input style={S.input} placeholder="Misal: Bubur Ayam Wortel" value={addFood.customName} onChange={e => setAddFood(f => ({ ...f, customName: e.target.value }))} /></div>
              <div><label style={S.label}>Total Kalori (kkal)</label><input style={S.input} type="number" placeholder="0" value={addFood.customKcal} onChange={e => setAddFood(f => ({ ...f, customKcal: e.target.value }))} /></div>
            </div>
          </div>
        )}
        <div style={S.card}>
          <label style={S.label}>Catatan (opsional)</label>
          <input style={S.input} placeholder="Misal: makan siang, lahap banget 😄" value={addFood.note} onChange={e => setAddFood(f => ({ ...f, note: e.target.value }))} />
        </div>
        <div style={{ marginTop: 16 }}><button style={S.btn} onClick={addEntry}>✓ Simpan ke Journal</button></div>
      </div>
    </div>
  );

  if (screen === "recipe") return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={S.header}>
        <button style={S.settingsBtn} onClick={() => setScreen("home")}>←</button>
        <span style={S.logo}>Buat Resep</span>
        <div style={{ width: 42 }} />
      </div>
      <div style={{ ...S.main, paddingTop: 16 }}>
        <div style={S.card}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 2 }}><label style={S.label}>Nama Resep</label><input style={S.input} placeholder="Misal: Bubur Rendang" value={recipeName} onChange={e => setRecipeName(e.target.value)} /></div>
            <div style={{ flex: 1 }}><label style={S.label}>Porsi</label><input style={S.input} type="number" min="1" value={recipeServings} onChange={e => setRecipeServings(e.target.value)} /></div>
          </div>
        </div>
        {recipeIngredients.length > 0 && (
          <div style={{ ...S.cardPink, display: "flex", justifyContent: "space-around", textAlign: "center" }}>
            <div><div style={{ fontWeight: 900, fontSize: 28, color: "#f9a8d4" }}>{Math.round(recipeTotalKcal)}</div><div style={S.smallLabel}>Total kkal</div></div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
            <div><div style={{ fontWeight: 900, fontSize: 28, color: "#c084fc" }}>{recipeKcalPerServing}</div><div style={S.smallLabel}>kkal / porsi</div></div>
          </div>
        )}
        {recipeIngredients.length > 0 && (
          <div style={S.card}>
            <div style={S.sectionTitle}>Bahan Ditambahkan</div>
            {recipeIngredients.map(ing => (
              <div key={ing.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div><div style={{ fontSize: 13, fontWeight: 700 }}>{ing.name}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{ing.amount} {ing.unit}</div></div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#f9a8d4", fontWeight: 800 }}>{ing.kcal} kkal</span>
                  <button onClick={() => setRecipeIngredients(r => r.filter(i => i.id !== ing.id))} style={{ background: "none", border: "none", color: "rgba(255,100,100,0.6)", cursor: "pointer", fontSize: 16 }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={S.card}>
          <div style={S.sectionTitle}>Tambah Bahan</div>
          {Object.entries(INGREDIENTS).map(([cat, items]) => (
            <div key={cat}>
              <button style={S.catBtn(openCategory === cat)} onClick={() => { setOpenCategory(openCategory === cat ? null : cat); setPendingIngredient(null); setPendingAmount(""); }}>
                <span>{cat}</span><span style={{ fontSize: 12 }}>{openCategory === cat ? "▲" : "▼"}</span>
              </button>
              {openCategory === cat && (
                <div style={{ paddingLeft: 8, paddingBottom: 8 }}>
                  {items.map(item => (
                    <div key={item.name}>
                      <div style={S.ingItem(pendingIngredient?.name === item.name)} onClick={() => { setPendingIngredient(item); setPendingAmount(""); }}>
                        <span style={{ fontSize: 13 }}>{item.name}</span>
                        <span style={{ fontSize: 11, color: "#c084fc" }}>{item.kcalPer} kkal/{item.unit}</span>
                      </div>
                      {pendingIngredient?.name === item.name && (
                        <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                          <input style={{ ...S.input, flex: 1 }} type="number" placeholder={`Jumlah (${item.unit})`} value={pendingAmount} onChange={e => setPendingAmount(e.target.value)} autoFocus />
                          <button style={S.btnSmall} onClick={addIngredientToRecipe}>+ Tambah</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {recipeIngredients.length > 0 && <div style={{ marginTop: 8 }}><button style={S.btn} onClick={addRecipeToJournal}>✓ Simpan {recipeKcalPerServing} kkal ke Journal</button></div>}
      </div>
      <BottomNav />
    </div>
  );

  if (screen === "journal") {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    }).reverse();
    return (
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <div style={S.header}><span style={S.logo}>🍼 BabyBites</span></div>
        <div style={{ ...S.main, paddingTop: 16 }}>
          {babies.length > 1 && (
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
              {babies.map(b => (
                <button key={b.id} onClick={() => setActiveBaby(b)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 12, border: "none", background: activeBaby?.id === b.id ? "linear-gradient(135deg,#f472b6,#c084fc)" : "rgba(255,255,255,0.08)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>{b.name}</button>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginTop: 8 }}>
            {days.map(d => (
              <button key={d} onClick={() => setSelectedDate(d)} style={{ flexShrink: 0, padding: "8px 12px", borderRadius: 14, border: "none", background: selectedDate === d ? "linear-gradient(135deg,#f472b6,#c084fc)" : "rgba(255,255,255,0.08)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>{fmtDate(d)}</button>
            ))}
          </div>
          <div style={{ ...S.cardPink, display: "flex", alignItems: "center", gap: 16 }}>
            <Ring pct={pct} size={80} stroke={8} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 22 }}>{totalKcal} <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>/ {calTarget} kkal</span></div>
              <div style={S.smallLabel}>{pct}% terpenuhi</div>
              {remaining > 0 ? <div style={{ ...S.pill, marginTop: 6 }}>Kurang {remaining} kkal lagi</div>
                : <div style={{ ...S.pill, marginTop: 6, background: "rgba(74,222,128,0.2)", borderColor: "#4ade80", color: "#4ade80" }}>✓ Target tercapai!</div>}
            </div>
          </div>
          <div style={S.card}>
            <div style={S.sectionTitle}>Food Journal {selectedDate === todayStr() ? "Hari Ini" : fmtDate(selectedDate)}</div>
            {journal.length === 0 && <div style={{ textAlign: "center", padding: "24px 0", color: "rgba(255,255,255,0.35)", fontSize: 14 }}>Belum ada makanan dicatat 🍽️</div>}
            {journal.map(e => (
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
                  <button onClick={() => deleteEntry(e.id)} style={{ background: "none", border: "none", color: "rgba(255,100,100,0.5)", cursor: "pointer", fontSize: 14 }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => setScreen("add")} style={{ position: "fixed", bottom: 90, right: 24, width: 56, height: 56, borderRadius: 20, background: "linear-gradient(135deg,#f472b6,#c084fc)", border: "none", color: "#fff", fontSize: 26, cursor: "pointer", boxShadow: "0 8px 24px rgba(244,114,182,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      {notifShown && (
        <div style={S.notifBanner}>
          <span style={{ fontSize: 24 }}>🔔</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>Perhatian, Bun!</div>
            <div style={{ fontSize: 12 }}>{activeBaby?.name} masih butuh <b>{remaining} kkal</b> lagi hari ini</div>
          </div>
          <button onClick={() => setNotifShown(false)} style={{ background: "rgba(255,255,255,0.3)", border: "none", borderRadius: 10, padding: "4px 10px", color: "#fff", cursor: "pointer", fontWeight: 700 }}>✕</button>
        </div>
      )}
      <div style={S.header}>
        <span style={S.logo}>🍼 BabyBites</span>
        {babies.length > 1 && (
          <div style={{ display: "flex", gap: 6 }}>
            {babies.map(b => (
              <button key={b.id} onClick={() => setActiveBaby(b)} style={{ ...S.settingsBtn, fontSize: 12, fontWeight: 700, padding: "6px 10px", ...(activeBaby?.id === b.id ? { background: "rgba(244,114,182,0.3)" } : {}) }}>{b.name}</button>
            ))}
          </div>
        )}
      </div>
      <div style={{ ...S.main, paddingTop: 16 }}>
        <div style={S.cardPink}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={S.sectionTitle}>Profil Bayi</div>
              <div style={{ fontWeight: 900, fontSize: 22 }}>{activeBaby?.name} 👶</div>
              <div style={{ ...S.smallLabel, marginTop: 4 }}>{ageMonths} bulan · {activeBaby?.weight} kg</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={S.sectionTitle}>Kebutuhan Harian</div>
              <div style={{ fontWeight: 900, fontSize: 28, color: "#f9a8d4" }}>{calTarget}</div>
              <div style={S.smallLabel}>kkal / hari</div>
            </div>
          </div>
        </div>
        <div style={{ ...S.card, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "24px 20px" }}>
          <div style={S.sectionTitle}>Kalori Hari Ini</div>
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ring pct={pct} size={180} stroke={16} />
            <div style={{ position: "absolute", textAlign: "center" }}>
              <div style={S.bigNum}>{totalKcal}</div>
              <div style={S.smallLabel}>dari {calTarget} kkal</div>
              <div style={{ ...S.pill, marginTop: 6 }}>{pct}%</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
            <div style={{ textAlign: "center" }}><div style={{ fontWeight: 800, fontSize: 18, color: "#4ade80" }}>{totalKcal}</div><div style={S.smallLabel}>Dikonsumsi</div></div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ textAlign: "center" }}><div style={{ fontWeight: 800, fontSize: 18, color: "#f472b6" }}>{remaining}</div><div style={S.smallLabel}>Sisa</div></div>
          </div>
        </div>
        {pct < 50 && <div style={{ ...S.card, background: "rgba(251,191,36,0.1)", borderColor: "rgba(251,191,36,0.3)" }}><div style={{ fontWeight: 800, color: "#fbbf24" }}>⚠️ Kalori masih kurang</div><div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>Si kecil butuh {remaining} kkal lagi. Yuk tambahkan makanan! 🍲</div></div>}
        {pct >= 50 && pct < 100 && <div style={{ ...S.card, background: "rgba(192,132,252,0.1)", borderColor: "rgba(192,132,252,0.3)" }}><div style={{ fontWeight: 800, color: "#c084fc" }}>💜 Hampir sampai!</div><div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>Tinggal {remaining} kkal lagi untuk {activeBaby?.name} 🎯</div></div>}
        {pct >= 100 && <div style={{ ...S.card, background: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.3)" }}><div style={{ fontWeight: 800, color: "#4ade80" }}>🎉 Target tercapai!</div><div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>Keren, Bun! Kebutuhan kalori {activeBaby?.name} hari ini sudah terpenuhi ✨</div></div>}
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button style={{ ...S.btn, flex: 1 }} onClick={() => setScreen("add")}>+ Catat Makanan</button>
          <button style={{ ...S.btnGhost, flex: 1 }} onClick={() => setScreen("recipe")}>🍲 Buat Resep</button>
        </div>
        {journal.length > 0 && (
          <div style={S.card}>
            <div style={S.sectionTitle}>Terakhir Dicatat</div>
            {journal.slice(-3).reverse().map(e => (
              <div key={e.id} style={S.entryRow}>
                <div style={S.entryIcon}>🥣</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700 }}>{e.label}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{e.time}</div></div>
                <div style={{ fontWeight: 800, color: "#f9a8d4" }}>{e.kcal} kkal</div>
              </div>
            ))}
            <button style={{ ...S.btnGhost, marginTop: 12 }} onClick={() => setScreen("journal")}>Lihat Semua →</button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}