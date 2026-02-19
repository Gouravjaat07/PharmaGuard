import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ─── SHARED NAV ITEMS — must match FamilySection exactly ─────────────────────
const NAV_ITEMS = [
  { label: "Dashboard",        key: "main",       path: "/analysis",       dot: false },
  { label: "👨‍👩‍👧‍👦 Family",    key: "family",     path: "/family-section", dot: true  },
  { label: "Book Technician",  key: "technician", path: "/technician",     dot: false },
  { label: "History",          key: "history",    path: "/history",        dot: false },
  { label: "About",            key: "about",      path: "/about",          dot: false },
  { label: "Profile",          key: "profile",    path: "/profile",        dot: false },
];

// ─── ALL_DRUGS (needed by AboutPage) ─────────────────────────────────────────
const ALL_DRUGS = [
  "ABACAVIR","AMITRIPTYLINE","ATAZANAVIR","ATOMOXETINE","AZATHIOPRINE",
  "CARBAMAZEPINE","CITALOPRAM","CLOMIPRAMINE","CLOPIDOGREL","CODEINE",
  "DESIPRAMINE","DOXEPIN","EFAVIRENZ","ESCITALOPRAM","FLUVOXAMINE",
  "FLUOROURACIL","IMIPRAMINE","IRINOTECAN","MERCAPTOPURINE","METOPROLOL",
  "NORTRIPTYLINE","OLANZAPINE","ONDANSETRON","OXCARBAZEPINE","OXYCODONE",
  "PAROXETINE","PHENYTOIN","RISPERIDONE","SERTRALINE","SIMVASTATIN",
  "TAMOXIFEN","THIOGUANINE","TRAMADOL","TRIMIPRAMINE","VENLAFAXINE",
  "VORICONAZOLE","WARFARIN","LOVASTATIN","PRAVASTATIN","ATORVASTATIN",
  "FLUVASTATIN","CELECOXIB","DICLOFENAC","IBUPROFEN","PIROXICAM",
  "ALLOPURINOL","RASBURICASE","DAPSONE","PRIMAQUINE","CHLOROQUINE",
  "TACROLIMUS","SIROLIMUS","CYCLOSPORINE","MYCOPHENOLATE","AZATHIOPRINE",
  "CAPECITABINE","TEGAFUR","MERCAPTOPURINE","THIOGUANINE","GEFITINIB",
  "ERLOTINIB","LAPATINIB","IMATINIB","METFORMIN","GLIPIZIDE","GLIMEPIRIDE"
];

// ─── HISTORY DATA ─────────────────────────────────────────────────────────────
const HISTORY = [
  { id:"H001", date:"2025-02-15", sampleId:"SAMPLE_AB12CD", drugs:["WARFARIN","CLOPIDOGREL"], highRiskCount:1, status:"Complete", sampleCount:834 },
  { id:"H002", date:"2025-02-10", sampleId:"SAMPLE_XY99ZW", drugs:["CODEINE","SIMVASTATIN","TRAMADOL"], highRiskCount:2, status:"Complete", sampleCount:1247 },
  { id:"H003", date:"2025-01-28", sampleId:"SAMPLE_GH34MN", drugs:["AZATHIOPRINE","IRINOTECAN"], highRiskCount:2, status:"Complete", sampleCount:962 },
  { id:"H004", date:"2025-01-14", sampleId:"SAMPLE_KL77PQ", drugs:["TAMOXIFEN","VORICONAZOLE"], highRiskCount:1, status:"Complete", sampleCount:1108 },
];

// ─── STYLES ──────────────────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("pg-profile-styles")) return;
  const s = document.createElement("style");
  s.id = "pg-profile-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,700;0,800;0,900;1,700;1,800&family=Syne:wght@600;700;800&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    html { scroll-behavior:smooth; }
    body { background:#F8F9FA; color:#212529; font-family:'DM Sans',sans-serif; }
    ::-webkit-scrollbar { width:5px; }
    ::-webkit-scrollbar-track { background:#e8ecf0; }
    ::-webkit-scrollbar-thumb { background:#6EA8FE; border-radius:3px; }

    @keyframes fadeUp   { from{opacity:0;transform:translateY(24px);} to{opacity:1;transform:translateY(0);} }
    @keyframes float    { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
    @keyframes dnaFloat { 0%{transform:translateY(0) scale(1);opacity:.7;} 50%{transform:translateY(-14px) scale(1.1);opacity:1;} 100%{transform:translateY(0) scale(1);opacity:.7;} }
    @keyframes progressFill { from{width:0;} to{width:var(--w);} }
    @keyframes countUp  { from{opacity:0;transform:scale(0.85);} to{opacity:1;transform:scale(1);} }
    @keyframes slideInRight { from{opacity:0;transform:translateX(20px);} to{opacity:1;transform:translateX(0);} }
    @keyframes ringExpand { 0%{transform:scale(1);opacity:0.5;} 100%{transform:scale(2.2);opacity:0;} }

    .fraunces { font-family:'Fraunces',serif; }
    .syne     { font-family:'Syne',sans-serif; }
    .mono     { font-family:'DM Mono',monospace; }
    .fade-up  { animation:fadeUp 0.6s ease both; }
    .float    { animation:float 3.5s ease-in-out infinite; }
    .pg-fadeUp { animation:fadeUp 0.5s ease both; }

    /* Buttons */
    .pg-btn { display:inline-flex; align-items:center; gap:7px; padding:10px 20px; border-radius:10px; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-weight:600; font-size:13px; transition:all 0.18s; }
    .pg-btn:hover { transform:translateY(-2px); }
    .pg-btn:active { transform:translateY(0); }
    .pg-btn-primary { background:linear-gradient(135deg,#0B5ED7,#094bb3); color:#fff; box-shadow:0 4px 18px rgba(11,94,215,0.3); }
    .pg-btn-primary:hover { box-shadow:0 6px 28px rgba(11,94,215,0.45); }
    .pg-btn-ghost { background:#fff; color:#495057; border:1.5px solid rgba(11,94,215,0.18); }
    .pg-btn-ghost:hover { background:#F8F9FA; color:#0B5ED7; border-color:#0B5ED7; }
    .pg-btn-teal { background:linear-gradient(135deg,#20C997,#17a880); color:#fff; box-shadow:0 4px 18px rgba(32,201,151,0.28); }
    .pg-btn-family { background:linear-gradient(135deg,#0B5ED7,#094bb3); color:#fff; box-shadow:0 4px 16px rgba(11,94,215,0.2); }
    .pg-btn-family:hover { box-shadow:0 8px 28px rgba(11,94,215,0.32); }

    /* Cards */
    .pg-card { background:#fff; border:1.5px solid rgba(11,94,215,0.1); border-radius:16px; padding:24px; box-shadow:0 2px 12px rgba(11,94,215,0.06); transition:all 0.25s; }
    .pg-card:hover { border-color:rgba(11,94,215,0.2); box-shadow:0 6px 24px rgba(11,94,215,0.1); }
    .feature-card { background:#fff; border:1.5px solid rgba(11,94,215,0.1); border-radius:18px; padding:28px 24px; box-shadow:0 2px 14px rgba(11,94,215,0.06); transition:all 0.3s; position:relative; overflow:hidden; }
    .feature-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--accent,linear-gradient(90deg,#0B5ED7,#6EA8FE)); }
    .feature-card:hover { transform:translateY(-4px); border-color:rgba(11,94,215,0.22); box-shadow:0 12px 36px rgba(11,94,215,0.12); }
    .stat-card { background:#fff; border:1.5px solid rgba(11,94,215,0.1); border-radius:16px; padding:22px 20px; box-shadow:0 2px 12px rgba(11,94,215,0.06); text-align:center; transition:all 0.25s; }
    .stat-card:hover { border-color:rgba(11,94,215,0.2); box-shadow:0 6px 24px rgba(11,94,215,0.1); }
    .step-card { background:#fff; border:1.5px solid rgba(11,94,215,0.1); border-radius:18px; padding:26px 22px; box-shadow:0 2px 12px rgba(11,94,215,0.06); transition:all 0.3s; }
    .step-card:hover { border-color:rgba(11,94,215,0.2); box-shadow:0 6px 24px rgba(11,94,215,0.1); transform:translateY(-3px); }

    /* Badge */
    .pg-badge { display:inline-flex; align-items:center; gap:4px; padding:4px 11px; border-radius:100px; font-size:11px; font-weight:600; letter-spacing:0.3px; }

    /* Nav */
    .nav-link { transition:all 0.2s; position:relative; cursor:pointer; }
    .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; right:0; height:2px; background:#0B5ED7; transform:scaleX(0); transition:transform 0.2s; border-radius:1px; }
    .nav-link:hover::after, .nav-link.active::after { transform:scaleX(1); }
    .tab-btn { padding:7px 16px; border-radius:8px; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; transition:all 0.18s; background:transparent; color:#6c757d; }
    .tab-btn.active { background:rgba(11,94,215,0.1); color:#0B5ED7; }
    .tab-btn:hover:not(.active) { background:rgba(11,94,215,0.05); color:#495057; }

    .sidebar-overlay { position:fixed; inset:0; background:rgba(33,37,41,0.35); z-index:199; backdrop-filter:blur(4px); }
    .progress-bar { height:6px; background:#e9ecef; border-radius:100px; overflow:hidden; }
    .progress-fill { height:100%; border-radius:100px; animation:progressFill 1.4s cubic-bezier(0.4,0,0.2,1) both; }
    .glow-ring { position:absolute; border-radius:50%; border:2px solid rgba(11,94,215,0.2); animation:ringExpand 2.5s ease-out infinite; }
    .gradient-text { background:linear-gradient(135deg,#0B5ED7,#20C997); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
    .count-anim { animation:countUp 0.7s cubic-bezier(0.34,1.56,0.64,1) both; }

    @media(max-width:768px) { .hide-mobile{display:none!important;} .pg-card{padding:16px;} .feature-card{padding:20px 18px;} }
    @media(min-width:769px) { .hide-desktop{display:none!important;} }
  `;
  document.head.appendChild(s);
};

// ─── MINI PROGRESS BAR ───────────────────────────────────────────────────────
function MiniBar({ label, value, color }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ fontSize:12, color:"#495057", fontWeight:500 }}>{label}</span>
        <span className="mono" style={{ fontSize:11, color, fontWeight:600 }}>{value}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width:`${value}%`, background:color, "--w":`${value}%` }} />
      </div>
    </div>
  );
}

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────
function AnimatedStat({ value, suffix="", label, icon, color="#0B5ED7" }) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const target = parseInt(value), steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current = Math.min(current + increment, target);
          setDisplayed(Math.round(current));
          if (current >= target) clearInterval(timer);
        }, 1400 / steps);
      }
    }, { threshold:0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);
  return (
    <div ref={ref} className="stat-card">
      <div style={{ fontSize:28, marginBottom:8 }}>{icon}</div>
      <div className="syne count-anim" style={{ fontSize:32, fontWeight:800, color, marginBottom:4 }}>
        {displayed.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize:12, color:"#6c757d", fontWeight:500, lineHeight:1.4 }}>{label}</div>
    </div>
  );
}

// ─── FEATURE CARD ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, badge, accentColor="#0B5ED7", delay=0 }) {
  return (
    <div className="feature-card fade-up" style={{ "--accent":`linear-gradient(90deg,${accentColor},${accentColor}80)`, animationDelay:`${delay}s` }}>
      <div style={{ fontSize:32, marginBottom:14 }}>{icon}</div>
      {badge && <span className="pg-badge mono" style={{ background:`${accentColor}12`, color:accentColor, border:`1px solid ${accentColor}30`, fontSize:10, marginBottom:10, display:"inline-flex" }}>{badge}</span>}
      <div className="syne" style={{ fontSize:15, fontWeight:700, color:"#212529", marginBottom:8 }}>{title}</div>
      <div style={{ fontSize:13, color:"#6c757d", lineHeight:1.7 }}>{desc}</div>
    </div>
  );
}

// ─── WORKFLOW STEP ────────────────────────────────────────────────────────────
function WorkflowStep({ num, icon, title, desc, color, delay=0 }) {
  return (
    <div className="step-card fade-up" style={{ animationDelay:`${delay}s` }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:`linear-gradient(135deg,${color}18,${color}0a)`, border:`1.5px solid ${color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{icon}</div>
        <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${color},${color}cc)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#fff", flexShrink:0 }}>{num}</div>
      </div>
      <div className="syne" style={{ fontSize:15, fontWeight:700, color:"#212529", marginBottom:7 }}>{title}</div>
      <div style={{ fontSize:13, color:"#6c757d", lineHeight:1.7 }}>{desc}</div>
    </div>
  );
}

// ─── GENE BADGE ──────────────────────────────────────────────────────────────
function GeneBadge({ gene, delay=0 }) {
  return (
    <span className="pg-badge mono fade-up" style={{ background:"rgba(11,94,215,0.07)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.2)", fontSize:11, animationDelay:`${delay}s`, padding:"5px 12px" }}>
      {gene}
    </span>
  );
}

// ─── RISK PILL ────────────────────────────────────────────────────────────────
function RiskPill({ label, color, bg, border, icon }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", background:bg, border:`1.5px solid ${border}`, borderRadius:12 }}>
      <span style={{ fontSize:20 }}>{icon}</span>
      <div>
        <div style={{ fontSize:12, fontWeight:700, color }}>{label}</div>
        <div style={{ fontSize:10, color:"#6c757d", marginTop:1 }}>Risk category</div>
      </div>
    </div>
  );
}

// ─── HISTORY PAGE (from analysis) ────────────────────────────────────────────
function HistoryPage() {
  return (
    <div style={{ padding:"30px 22px", maxWidth:900, margin:"0 auto" }}>
      <div style={{ marginBottom:28 }}>
        <div className="fraunces" style={{ fontSize:30, fontWeight:800, marginBottom:6, color:"#212529" }}>Analysis History</div>
        <div style={{ color:"#6c757d", fontSize:13 }}>Past pharmacogenomic analysis records for your practice</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {HISTORY.map(h => (
          <div key={h.id} className="pg-card pg-fadeUp">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
                  <span className="mono" style={{ color:"#0B5ED7", fontSize:13 }}>{h.sampleId}</span>
                  <span className="pg-badge" style={{ background:"rgba(32,201,151,0.1)", color:"#20C997", border:"1px solid rgba(32,201,151,0.25)", fontSize:10 }}>{h.status}</span>
                </div>
                <div style={{ color:"#495057", fontSize:12 }}>Drugs: {h.drugs.join(" · ")}</div>
                <div style={{ fontSize:11, color:"#6c757d", marginTop:4 }}>📅 {h.date} · {h.sampleCount} variants analyzed</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <span className="pg-badge" style={{ background:"rgba(239,68,68,0.1)", color:"#ef4444", border:"1px solid rgba(239,68,68,0.25)", fontSize:11 }}>
                  ☠️ {h.highRiskCount} Toxic Risk
                </span>
                <button className="pg-btn pg-btn-primary" style={{ fontSize:12 }}>📊 View Report</button>
                <button className="pg-btn pg-btn-ghost" style={{ fontSize:12 }}>⬇ Download</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ABOUT PAGE (from analysis) ───────────────────────────────────────────────
function AboutPage() {
  return (
    <div style={{ padding:"30px 22px", maxWidth:820, margin:"0 auto" }}>
      <div className="pg-card" style={{ textAlign:"center", padding:44, marginBottom:22 }}>
        <div style={{ fontSize:56, marginBottom:14 }}>🧬</div>
        <div className="fraunces" style={{ fontSize:34, fontWeight:900, marginBottom:10, color:"#212529" }}>PharmaGuard</div>
        <div style={{ color:"#6c757d", fontSize:14, lineHeight:1.8, maxWidth:540, margin:"0 auto" }}>
          Clinical-grade pharmacogenomic analysis platform powered by CPIC guidelines. Upload patient VCF files to predict drug response, detect toxicity risks, and optimize therapeutic decisions with evidence-based precision.
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14, marginBottom:22 }}>
        {[
          { icon:"🧬", title:"PGx Analysis", desc:"CPIC Level A pharmacogenomic variant detection across 50+ drugs" },
          { icon:"🛡️", title:"Risk Detection", desc:"Real-time toxicity and efficacy risk scoring with confidence intervals" },
          { icon:"💊", title:"Drug Guidance", desc:"Evidence-based dosage & clinically validated alternatives" },
          { icon:"📋", title:"Clinical Reports", desc:"Export-ready JSON, CSV, and printable PDF clinical summaries" },
          { icon:"🔒", title:"HIPAA Ready", desc:"Local processing — your genomic data never leaves your browser" },
          { icon:"⚡", title:"Real-time", desc:"Sub-3 second pharmacogenomic analysis with CPIC pipeline" },
        ].map(f => (
          <div key={f.title} className="pg-card">
            <div style={{ fontSize:26, marginBottom:8 }}>{f.icon}</div>
            <div style={{ fontWeight:700, marginBottom:5, fontSize:13, color:"#212529" }}>{f.title}</div>
            <div style={{ fontSize:12, color:"#6c757d", lineHeight:1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
      <div className="pg-card" style={{ marginBottom:14 }}>
        <div style={{ fontWeight:700, marginBottom:10, fontSize:13, color:"#212529" }}>Supported Pharmacogenes</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
          {["CYP2D6","CYP2C19","CYP2C9","VKORC1","TPMT","DPYD","SLCO1B1","ABCB1","UGT1A1","HLA-A","HLA-B","NUDT15","CYP3A5","CYP1A2","CYP2B6"].map(g => (
            <span key={g} className="pg-badge mono" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.18)", fontSize:11 }}>{g}</span>
          ))}
        </div>
      </div>
      <div className="pg-card">
        <div style={{ fontWeight:700, marginBottom:10, fontSize:13, color:"#212529" }}>Drug Coverage ({ALL_DRUGS.length}+ medications)</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {ALL_DRUGS.slice(0,20).map(d => (
            <span key={d} className="pg-badge" style={{ background:"rgba(11,94,215,0.06)", color:"#495057", border:"1px solid rgba(11,94,215,0.12)", fontSize:10 }}>{d}</span>
          ))}
          <span className="pg-badge" style={{ background:"rgba(11,94,215,0.1)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.2)", fontSize:10 }}>+{ALL_DRUGS.length-20} more</span>
        </div>
      </div>
    </div>
  );
}

// ─── SHARED NAVBAR ────────────────────────────────────────────────────────────
function SharedNavbar({ currentPage, onNavigate, onSidebarOpen }) {
  const [mobileMenu, setMobileMenu] = useState(false);

  const isActive = (item) => {
    // Match internal page state keys
    if (item.key === currentPage) return true;
    return false;
  };

  const handleNavClick = (item) => {
    setMobileMenu(false);
    // History, About, Profile are handled internally via page state
    if (item.key === "history" || item.key === "about" || item.key === "profile") {
      onNavigate(item.key, null); // internal page change
    } else {
      onNavigate(null, item.path); // route navigation
    }
  };

  return (
    <nav style={{
      position:"sticky", top:0, zIndex:100,
      background:"rgba(255,255,255,0.95)", backdropFilter:"blur(20px)",
      borderBottom:"1.5px solid rgba(11,94,215,0.1)",
      padding:"0 24px", display:"flex", alignItems:"center",
      justifyContent:"space-between", height:62,
      boxShadow:"0 2px 12px rgba(11,94,215,0.06)"
    }}>
      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer" }} onClick={() => onNavigate(null, "/analysis")}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#0B5ED7,#094bb3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, boxShadow:"0 4px 12px rgba(11,94,215,0.25)" }}>🧬</div>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:"#0B5ED7", letterSpacing:0.3 }}>PharmaGuard</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#20C997", letterSpacing:3 }}>PRECISION MEDICINE</div>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hide-mobile" style={{ display:"flex", gap:2, marginLeft:16 }}>
          {NAV_ITEMS.map(item => (
            <button key={item.key}
              className={`nav-link tab-btn ${isActive(item) ? "active" : ""}`}
              onClick={() => handleNavClick(item)}
              style={{ position:"relative", color:isActive(item)?"#0B5ED7":"#495057" }}
            >
              {item.label}
              {item.dot && <span style={{ position:"absolute", top:-6, right:-6, width:8, height:8, borderRadius:"50%", background:"#0B5ED7", boxShadow:"0 0 6px rgba(11,94,215,0.5)" }} />}
            </button>
          ))}
        </div>
      </div>

      {/* Right side */}
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <button onClick={onSidebarOpen} style={{
          display:"flex", alignItems:"center", gap:8,
          background:"rgba(11,94,215,0.06)", border:"1.5px solid rgba(11,94,215,0.14)",
          borderRadius:10, padding:"6px 12px", cursor:"pointer", transition:"all 0.18s"
        }}
          onMouseEnter={e => { e.currentTarget.style.background="rgba(11,94,215,0.1)"; e.currentTarget.style.borderColor="#0B5ED7"; }}
          onMouseLeave={e => { e.currentTarget.style.background="rgba(11,94,215,0.06)"; e.currentTarget.style.borderColor="rgba(11,94,215,0.14)"; }}
        >
          <div style={{ width:26, height:26, borderRadius:"50%", background:"linear-gradient(135deg,#0B5ED7,#20C997)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff" }}>DR</div>
          <span className="hide-mobile" style={{ fontSize:12, fontWeight:600, color:"#212529" }}>Dr. Roberts</span>
        </button>
        <button className="hide-desktop pg-btn pg-btn-ghost" style={{ padding:"7px 11px" }} onClick={() => setMobileMenu(!mobileMenu)}>
          {mobileMenu ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenu && (
        <div style={{ position:"absolute", top:62, left:0, right:0, background:"#fff", borderBottom:"1.5px solid rgba(11,94,215,0.1)", padding:14, display:"flex", flexDirection:"column", gap:6, boxShadow:"0 8px 20px rgba(11,94,215,0.08)", zIndex:200 }}>
          {NAV_ITEMS.map(item => (
            <button key={item.key} className={`tab-btn ${isActive(item)?"active":""}`}
              onClick={() => handleNavClick(item)}
              style={{ textAlign:"left", padding:"9px 12px" }}>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
function Sidebar({ open, onClose, onNavigate }) {
  if (!open) return null;
  return (
    <>
      <div className="sidebar-overlay" onClick={onClose} />
      <div style={{
        position:"fixed", top:0, right:0, height:"100vh", width:360,
        background:"#fff", borderLeft:"1.5px solid rgba(11,94,215,0.1)",
        zIndex:200, overflowY:"auto", padding:22,
        boxShadow:"-8px 0 40px rgba(11,94,215,0.08)",
        animation:"slideInRight 0.32s cubic-bezier(0.4,0,0.2,1)"
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <span className="syne" style={{ fontWeight:700, fontSize:15, color:"#212529" }}>User Profile</span>
          <button className="pg-btn pg-btn-ghost" onClick={onClose} style={{ padding:"5px 9px" }}>✕</button>
        </div>
        <div style={{ textAlign:"center", marginBottom:22 }}>
          <div style={{ width:76, height:76, borderRadius:"50%", background:"linear-gradient(135deg,#0B5ED7,#20C997)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:800, color:"#fff", margin:"0 auto 10px" }}>DR</div>
          <div className="syne" style={{ fontSize:16, fontWeight:700, color:"#212529" }}>Dr. Emily Roberts</div>
          <div style={{ fontSize:12, color:"#8fa3b8" }}>Clinical Pharmacogenomics</div>
          <div className="pg-badge" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.2)", marginTop:7 }}>🏥 Mount Sinai Hospital</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[{icon:"📊",l:"Analyses Completed",v:"247"},{icon:"🧬",l:"PGx Reports",v:"184"},{icon:"👨‍👩‍👧‍👦",l:"Family Members",v:"6"},{icon:"⭐",l:"Accuracy Score",v:"98.2%"}].map(s => (
            <div key={s.l} className="pg-card" style={{ padding:"11px 14px", display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:12, color:"#495057" }}>{s.icon} {s.l}</span>
              <span style={{ fontSize:12, fontWeight:700, color:"#212529" }}>{s.v}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop:16 }}>
          <button className="pg-btn pg-btn-family" style={{ width:"100%", justifyContent:"center", marginBottom:8 }}
            onClick={() => { onClose(); onNavigate(null, "/family-section"); }}>
            👨‍👩‍👧‍👦 Go to Family Dashboard
          </button>
          <button className="pg-btn pg-btn-ghost" style={{ width:"100%", justifyContent:"center" }}>⚙️ Settings</button>
        </div>
      </div>
    </>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ProfilePage() {
  useEffect(() => { injectStyles(); }, []);
  const navigate = useNavigate();

  // ─── PAGE STATE — mirrors analysis page routing ───────────────────────────
  const [page, setPage] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("features");

  // Unified navigation handler:
  // - pageKey (string): switch internal page state
  // - path (string): use react-router navigate
  const handleNavigation = (pageKey, path) => {
    if (pageKey) {
      setPage(pageKey);
    } else if (path) {
      navigate(path);
    }
  };

  const GENES = ["CYP2D6","CYP2C19","CYP2C9","VKORC1","TPMT","DPYD","SLCO1B1","ABCB1","UGT1A1","HLA-A","HLA-B","NUDT15","CYP3A5","CYP1A2","CYP2B6"];

  const WORKFLOW = [
    { num:1, icon:"📁", title:"Upload Patient VCF", color:"#0B5ED7", desc:"Drag and drop a .vcf genome file. Our real-time VCF parser instantly extracts variants, PGx genes, and quality metrics — no manual preprocessing needed." },
    { num:2, icon:"💊", title:"Select Drugs to Analyse", color:"#6EA8FE", desc:"Choose from 65+ medications across oncology, cardiology, psychiatry, pain management, and immunology. Search by name or browse by category." },
    { num:3, icon:"🔬", title:"Run PGx Analysis", color:"#20C997", desc:"Our CPIC-guided pipeline maps allele variants to diplotypes, predicts metaboliser phenotype, and generates evidence-based risk predictions in seconds." },
    { num:4, icon:"📋", title:"Review Clinical Report", color:"#f59e0b", desc:"View drug-specific risk cards with confidence scores, gene impact, and dosage guidance. Drill into mechanism, detected variants, and references." },
    { num:5, icon:"⬇️", title:"Export & Integrate", color:"#EB3434", desc:"Download structured JSON, CSV, or print a full clinical PDF ready for EHR integration, prescription review, or patient counselling." },
  ];

  const FEATURES = [
    { icon:"🧬", title:"Real VCF Parsing", badge:"Core Feature", accentColor:"#0B5ED7", desc:"Genuine VCF file parsing — not mocked data. Reads chromosomal positions, rsIDs, quality scores, FORMAT fields, and sample genotypes directly from your uploaded file." },
    { icon:"🛡️", title:"CPIC Level A Guidelines", badge:"Evidence-Based", accentColor:"#20C997", desc:"All recommendations are anchored to CPIC 2024 guidelines — the gold standard for PGx clinical decision support." },
    { icon:"👨‍👩‍👧‍👦", title:"Family Mode", badge:"Multi-Member", accentColor:"#6EA8FE", desc:"Upload and analyse VCF files for multiple family members in a single session. Compare risk profiles and identify hereditary pharmacogenomic patterns." },
    { icon:"🏥", title:"Lab Booking", badge:"Home Visit", accentColor:"#f59e0b", desc:"Book a certified lab technician for at-home sample collection with real calendar scheduling and order tracking." },
    { icon:"📊", title:"Quality Metrics", badge:"Transparency", accentColor:"#8B2F2F", desc:"Every report includes VCF quality score, variant confidence, annotation coverage, and per-gene impact scores." },
    { icon:"🔒", title:"HIPAA-Ready & Local", badge:"Privacy First", accentColor:"#495057", desc:"All VCF parsing runs entirely in the browser. Your genomic data never leaves your device. No server upload, no data retention." },
  ];

  const TEAM = [
    { avatar:"👩‍⚕️", name:"Dr. Riya Sharma", role:"Senior PGx Specialist", exp:"8 yrs", rating:4.9, badge:"Top Rated", color:"#0B5ED7" },
    { avatar:"👨‍⚕️", name:"Rahul Mehta", role:"Phlebotomy Expert", exp:"5 yrs", rating:4.7, badge:"Verified", color:"#20C997" },
    { avatar:"👩‍🔬", name:"Priya Nair", role:"Lab Scientist · PGx", exp:"10 yrs", rating:4.9, badge:"PGx Expert", color:"#6EA8FE" },
    { avatar:"🧑‍⚕️", name:"Arjun Kapoor", role:"Lab Scientist", exp:"6 yrs", rating:4.6, badge:"Verified", color:"#f59e0b" },
  ];

  // ─── SHARED FOOTER ────────────────────────────────────────────────────────
  const Footer = () => (
    <footer style={{ borderTop:"1.5px solid rgba(11,94,215,0.1)", padding:"40px 24px 28px", maxWidth:1100, margin:"0 auto" }}>
      <div style={{ background:"rgba(11,94,215,0.04)", border:"1.5px solid rgba(11,94,215,0.12)", borderRadius:12, padding:"14px 18px", marginBottom:16, textAlign:"center" }}>
        <div style={{ fontSize:12, color:"#6c757d", lineHeight:1.7 }}>
          <strong style={{ color:"#0B5ED7" }}>Confidence Scores</strong> reflect concordance between detected variants and CPIC guideline evidence tiers. Scores ≥90% indicate Level A evidence.
        </div>
      </div>
      <div style={{ background:"rgba(245,158,11,0.05)", border:"1.5px solid rgba(245,158,11,0.2)", borderRadius:12, padding:"16px 18px", marginBottom:24 }}>
        <div style={{ fontSize:12, color:"#b45309", fontWeight:700, marginBottom:6 }}>⚕️ Medical Use Limitation Notice</div>
        <div style={{ fontSize:11, color:"#6c757d", lineHeight:1.8 }}>
          This tool is intended for clinical decision support and research use only. All pharmacogenomic findings should be interpreted by a qualified healthcare professional.{" "}
          <strong style={{ color:"#212529" }}>Prescribing decisions must always be made by a licensed clinician.</strong>
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:"linear-gradient(135deg,#0B5ED7,#094bb3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🧬</div>
          <div>
            <div className="fraunces" style={{ fontSize:13, fontWeight:800, color:"#212529" }}>PharmaGuard v3.0</div>
            <div className="mono" style={{ fontSize:9, color:"#6c757d" }}>CPIC Guidelines 2024 · Clinical Decision Support</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {["Privacy Policy","Terms of Use","Contact","Documentation"].map(l => (
            <button key={l} className="pg-btn pg-btn-ghost" style={{ fontSize:11, padding:"5px 12px" }}>{l}</button>
          ))}
        </div>
      </div>
    </footer>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#F8F9FA", color:"#212529" }}>
      {/* Background */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", backgroundImage:"linear-gradient(rgba(11,94,215,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(11,94,215,0.025) 1px,transparent 1px)", backgroundSize:"44px 44px" }} />
      <div style={{ position:"fixed", top:"-15%", right:"-5%", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(11,94,215,0.06),transparent 70%)", zIndex:0, pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:"-10%", left:"-5%", width:420, height:420, borderRadius:"50%", background:"radial-gradient(circle,rgba(32,201,151,0.05),transparent 70%)", zIndex:0, pointerEvents:"none" }} />

      <div style={{ position:"relative", zIndex:1 }}>

        {/* ─── NAVBAR ──────────────────────────────────────────────────────── */}
        <SharedNavbar
          currentPage={page}
          onNavigate={handleNavigation}
          onSidebarOpen={() => setSidebarOpen(true)}
        />

        {/* ─── SIDEBAR ─────────────────────────────────────────────────────── */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigate={handleNavigation}
        />

        {/* ─── PAGE ROUTING ─────────────────────────────────────────────────── */}
        {page === "history" && <HistoryPage />}
        {page === "about"   && <AboutPage />}

        {/* ─── PROFILE PAGE (default) ──────────────────────────────────────── */}
        {page === "profile" && (
          <>
            {/* ─── HERO ──────────────────────────────────────────────────── */}
            <section style={{ padding:"80px 24px 64px", maxWidth:1100, margin:"0 auto" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:40, alignItems:"center" }}>
                <div>
                  <div style={{ marginBottom:18 }}>
                    <span className="pg-badge mono fade-up" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1.5px solid rgba(11,94,215,0.2)", padding:"5px 14px" }}>
                      🧬 CPIC Level A · 2024 Guidelines · 15 Pharmacogenes
                    </span>
                  </div>
                  <h1 className="fraunces fade-up" style={{ fontSize:"clamp(32px,5vw,58px)", fontWeight:900, lineHeight:1.05, color:"#212529", marginBottom:18, animationDelay:"0.05s" }}>
                    Precision Medicine<br /><span className="gradient-text">Starts With Genetics</span>
                  </h1>
                  <p className="fade-up" style={{ fontSize:16, color:"#495057", lineHeight:1.8, maxWidth:520, marginBottom:32, animationDelay:"0.12s" }}>
                    PharmaGuard is a clinical-grade pharmacogenomics platform that analyses patient VCF files, predicts drug toxicity and efficacy risks, and generates CPIC-compliant clinical reports — entirely in the browser.
                  </p>
                  <div className="fade-up" style={{ display:"flex", gap:12, flexWrap:"wrap", animationDelay:"0.18s" }}>
                    <button className="pg-btn pg-btn-primary" style={{ fontSize:14, padding:"12px 26px" }} onClick={() => navigate("/analysis")}>🔬 Run Analysis</button>
                    <button className="pg-btn pg-btn-ghost" style={{ fontSize:14, padding:"12px 26px" }}>📋 View Sample Report</button>
                  </div>
                  <div className="fade-up" style={{ display:"flex", gap:28, marginTop:36, flexWrap:"wrap", animationDelay:"0.24s" }}>
                    {[{value:"65+",label:"Drugs Covered"},{value:"15",label:"Pharmacogenes"},{value:"CPIC A",label:"Evidence Tier"},{value:"100%",label:"Browser-Local"}].map(s => (
                      <div key={s.label}>
                        <div className="syne" style={{ fontSize:20, fontWeight:800, color:"#0B5ED7" }}>{s.value}</div>
                        <div style={{ fontSize:11, color:"#6c757d", fontWeight:500 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hero visual */}
                <div className="hide-mobile" style={{ position:"relative", width:280, height:300, flexShrink:0 }}>
                  <div className="glow-ring" style={{ width:120, height:120, top:"50%", left:"50%", marginTop:-60, marginLeft:-60 }} />
                  <div className="glow-ring" style={{ width:120, height:120, top:"50%", left:"50%", marginTop:-60, marginLeft:-60, animationDelay:"0.8s" }} />
                  <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:"#fff", border:"1.5px solid rgba(11,94,215,0.15)", borderRadius:20, padding:"20px 18px", width:200, textAlign:"center", boxShadow:"0 8px 32px rgba(11,94,215,0.14)" }}>
                    <div style={{ fontSize:36, marginBottom:8 }}>🧬</div>
                    <div className="fraunces" style={{ fontSize:16, fontWeight:800, color:"#212529", marginBottom:4 }}>PharmaGuard</div>
                    <span className="pg-badge mono" style={{ background:"rgba(32,201,151,0.1)", color:"#20C997", border:"1px solid rgba(32,201,151,0.25)", fontSize:10 }}>✓ Analysis Ready</span>
                    <div style={{ marginTop:14 }}>
                      <MiniBar label="CYP2D6" value={94} color="#0B5ED7" />
                      <MiniBar label="TPMT" value={99} color="#EB3434" />
                      <MiniBar label="DPYD" value={77} color="#f59e0b" />
                    </div>
                  </div>
                  <div className="float" style={{ position:"absolute", top:20, right:0, background:"#fff", border:"1.5px solid rgba(11,94,215,0.15)", borderRadius:12, padding:"8px 12px", boxShadow:"0 4px 16px rgba(11,94,215,0.1)", animationDelay:"0.3s" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:14 }}>☠️</span>
                      <div><div style={{ fontWeight:700, color:"#8B2F2F", fontSize:11 }}>CODEINE</div><div style={{ color:"#6c757d", fontSize:10 }}>Toxic Risk</div></div>
                    </div>
                  </div>
                  <div className="float" style={{ position:"absolute", bottom:30, left:0, background:"#fff", border:"1.5px solid rgba(32,201,151,0.2)", borderRadius:12, padding:"8px 12px", boxShadow:"0 4px 16px rgba(32,201,151,0.1)", animationDelay:"0.7s" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:14 }}>🛡️</span>
                      <div><div style={{ fontWeight:700, color:"#20C997", fontSize:11 }}>SERTRALINE</div><div style={{ color:"#6c757d", fontSize:10 }}>Safe · CPIC A</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ─── STATS ─────────────────────────────────────────────────── */}
            <section style={{ padding:"0 24px 72px", maxWidth:1100, margin:"0 auto" }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14 }}>
                <AnimatedStat value="247" icon="📊" label="Analyses Completed" color="#0B5ED7" />
                <AnimatedStat value="184" icon="🧬" label="PGx Reports Generated" color="#20C997" />
                <AnimatedStat value="65" icon="💊" suffix="+" label="Drugs in Database" color="#6EA8FE" />
                <AnimatedStat value="98" icon="⭐" suffix="%" label="Report Accuracy Score" color="#f59e0b" />
                <AnimatedStat value="15" icon="🔬" label="Pharmacogenes Covered" color="#EB3434" />
              </div>
            </section>

            {/* ─── TABS ──────────────────────────────────────────────────── */}
            <section style={{ padding:"0 24px 80px", maxWidth:1100, margin:"0 auto" }}>
              <div style={{ textAlign:"center", marginBottom:40 }}>
                <div className="pg-badge mono fade-up" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.2)", marginBottom:14, display:"inline-flex" }}>PLATFORM OVERVIEW</div>
                <h2 className="fraunces fade-up" style={{ fontSize:"clamp(24px,4vw,38px)", fontWeight:900, color:"#212529", marginBottom:12, animationDelay:"0.05s" }}>
                  Everything You Need for<br /><span className="gradient-text">Clinical PGx Decision Support</span>
                </h2>
                <p className="fade-up" style={{ fontSize:14, color:"#6c757d", maxWidth:520, margin:"0 auto", lineHeight:1.8, animationDelay:"0.1s" }}>
                  From raw genomic data to actionable clinical guidance — PharmaGuard handles the full pipeline.
                </p>
              </div>

              <div style={{ display:"flex", justifyContent:"center", gap:4, marginBottom:36, background:"rgba(11,94,215,0.04)", borderRadius:11, padding:5, width:"fit-content", margin:"0 auto 36px" }}>
                {[{id:"features",label:"✨ Features"},{id:"workflow",label:"⚡ How It Works"},{id:"genes",label:"🧬 Pharmacogenes"},{id:"team",label:"👥 Our Team"}].map(t => (
                  <button key={t.id} className={`tab-btn ${activeTab===t.id?"active":""}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
                ))}
              </div>

              {activeTab==="features" && (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16 }}>
                  {FEATURES.map((f,i) => <FeatureCard key={f.title} {...f} delay={i*0.06} />)}
                </div>
              )}

              {activeTab==="workflow" && (
                <div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:14, marginBottom:32 }}>
                    {WORKFLOW.map((s,i) => <WorkflowStep key={s.num} {...s} delay={i*0.07} />)}
                  </div>
                  <div className="pg-card fade-up" style={{ background:"rgba(11,94,215,0.03)", border:"1.5px solid rgba(11,94,215,0.14)", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap", animationDelay:"0.4s" }}>
                    <div style={{ fontSize:32 }}>⚠️</div>
                    <div style={{ flex:1 }}>
                      <div className="syne" style={{ fontSize:14, fontWeight:700, color:"#212529", marginBottom:4 }}>Clinical Alert System</div>
                      <div style={{ fontSize:13, color:"#6c757d", lineHeight:1.6 }}>When toxic risk drugs are detected, PharmaGuard automatically surfaces a critical alert banner. e.g. <strong style={{ color:"#8B2F2F" }}>CODEINE + CYP2D6 URM → Toxic Risk</strong>.</div>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginTop:20 }}>
                    <RiskPill label="Toxic" color="#8B2F2F" bg="rgba(139,47,47,0.08)" border="rgba(139,47,47,0.25)" icon="☠️" />
                    <RiskPill label="Adjust Dosage" color="#b45309" bg="rgba(245,158,11,0.08)" border="rgba(245,158,11,0.28)" icon="⚖️" />
                    <RiskPill label="Ineffective" color="#c0392b" bg="rgba(240,84,68,0.08)" border="rgba(240,84,68,0.28)" icon="🚫" />
                    <RiskPill label="Safe" color="#17a880" bg="rgba(32,201,151,0.08)" border="rgba(32,201,151,0.25)" icon="🛡️" />
                  </div>
                </div>
              )}

              {activeTab==="genes" && (
                <div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginBottom:32 }}>
                    {GENES.map((g,i) => <GeneBadge key={g} gene={g} delay={i*0.04} />)}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14 }}>
                    {[
                      {gene:"CYP2D6",drugs:"Codeine, Tramadol, Tamoxifen, Metoprolol",icon:"💊",color:"#0B5ED7",desc:"The most clinically significant pharmacogene. Metabolises ~25% of all prescribed drugs. URM status creates opioid toxicity risk."},
                      {gene:"CYP2C19",drugs:"Clopidogrel, Voriconazole, Citalopram",icon:"🫀",color:"#20C997",desc:"Critical for antiplatelet therapy. PM status renders clopidogrel ineffective — alternative antiplatelet agents must be prescribed."},
                      {gene:"TPMT + NUDT15",drugs:"Azathioprine, Mercaptopurine",icon:"🧬",color:"#EB3434",desc:"Deficiency causes life-threatening myelosuppression with standard thiopurine doses. Dose reduction of 85-90% mandatory in PM."},
                      {gene:"DPYD",drugs:"Fluorouracil, Capecitabine",icon:"🔬",color:"#f59e0b",desc:"Intermediate or poor DPYD metabolisers face severe toxicity from fluoropyrimidines. FDA recommends DPYD screening before initiating therapy."},
                      {gene:"SLCO1B1",drugs:"Simvastatin, Lovastatin, Atorvastatin",icon:"📊",color:"#6EA8FE",desc:"Impaired hepatic uptake transporter causes statin accumulation in plasma, dramatically increasing myopathy and rhabdomyolysis risk."},
                      {gene:"VKORC1 + CYP2C9",drugs:"Warfarin, Phenytoin",icon:"⚖️",color:"#8B2F2F",desc:"Combined variation requires warfarin dose reductions of 25-50%. Without adjustment, severe over-anticoagulation and bleeding risk."},
                    ].map((g,i) => (
                      <div key={g.gene} className="feature-card fade-up" style={{ "--accent":`linear-gradient(90deg,${g.color},${g.color}60)`, animationDelay:`${i*0.07}s` }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                          <span style={{ fontSize:24 }}>{g.icon}</span>
                          <div className="syne mono" style={{ fontSize:14, fontWeight:700, color:g.color }}>{g.gene}</div>
                        </div>
                        <div style={{ fontSize:11, color:"#6c757d", marginBottom:10, fontFamily:"DM Mono,monospace" }}>Drugs: {g.drugs}</div>
                        <div style={{ fontSize:13, color:"#495057", lineHeight:1.7 }}>{g.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab==="team" && (
                <div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:16, marginBottom:32 }}>
                    {TEAM.map((m,i) => (
                      <div key={m.name} className="pg-card fade-up" style={{ textAlign:"center", animationDelay:`${i*0.07}s` }}>
                        <div style={{ width:68, height:68, borderRadius:"50%", margin:"0 auto 14px", background:`linear-gradient(135deg,${m.color}20,${m.color}10)`, border:`2px solid ${m.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30 }}>{m.avatar}</div>
                        <div className="syne" style={{ fontSize:15, fontWeight:700, color:"#212529", marginBottom:4 }}>{m.name}</div>
                        <div style={{ fontSize:12, color:"#6c757d", marginBottom:10 }}>{m.role} · {m.exp} exp</div>
                        <span className="pg-badge" style={{ background:`${m.color}12`, color:m.color, border:`1px solid ${m.color}30`, fontSize:10, marginBottom:10 }}>{m.badge}</span>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:3, marginTop:8 }}>
                          {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize:12, color:s<=Math.round(m.rating)?"#f59e0b":"#dee2e6" }}>★</span>)}
                          <span style={{ fontSize:11, color:"#6c757d", marginLeft:4 }}>{m.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pg-card fade-up" style={{ background:"linear-gradient(135deg,rgba(11,94,215,0.04),rgba(32,201,151,0.03))", border:"1.5px solid rgba(11,94,215,0.14)", textAlign:"center", padding:"36px 24px", animationDelay:"0.3s" }}>
                    <div style={{ fontSize:36, marginBottom:14 }}>🏥</div>
                    <div className="fraunces" style={{ fontSize:22, fontWeight:800, color:"#212529", marginBottom:10 }}>Join Our Clinical Network</div>
                    <div style={{ fontSize:14, color:"#6c757d", maxWidth:440, margin:"0 auto 22px", lineHeight:1.7 }}>Are you a lab technician, clinical pharmacologist, or PGx specialist? Join PharmaGuard's verified clinician network.</div>
                    <button className="pg-btn pg-btn-primary" style={{ fontSize:14, padding:"12px 28px" }}>Apply to Join Network</button>
                  </div>
                </div>
              )}
            </section>

            {/* ─── DOCTOR PROFILE ────────────────────────────────────────── */}
            <section style={{ padding:"0 24px 80px", maxWidth:1100, margin:"0 auto" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, alignItems:"start" }}>
                <div className="pg-card fade-up" style={{ position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:"linear-gradient(90deg,#0B5ED7,#20C997,#6EA8FE)" }} />
                  <div style={{ display:"flex", gap:18, alignItems:"flex-start", marginBottom:22 }}>
                    <div style={{ width:76, height:76, borderRadius:"50%", flexShrink:0, background:"linear-gradient(135deg,#0B5ED7,#6EA8FE)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:800, color:"#fff", boxShadow:"0 6px 24px rgba(11,94,215,0.25)" }}>DR</div>
                    <div>
                      <div className="fraunces" style={{ fontSize:20, fontWeight:800, color:"#212529" }}>Dr. Emily Roberts</div>
                      <div style={{ fontSize:12, color:"#6c757d", marginBottom:8 }}>Clinical Pharmacogenomics · Mount Sinai Hospital</div>
                      <span className="pg-badge" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.2)", fontSize:10 }}>🏥 CPIC Certified Clinician</span>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
                    {[{icon:"📊",label:"Analyses Done",value:"247"},{icon:"🧬",label:"PGx Reports",value:"184"},{icon:"⭐",label:"Accuracy Score",value:"98.2%"},{icon:"📅",label:"Member Since",value:"Jan 2024"}].map(s => (
                      <div key={s.label} style={{ background:"rgba(11,94,215,0.03)", border:"1.5px solid rgba(11,94,215,0.1)", borderRadius:10, padding:"12px 14px" }}>
                        <div style={{ fontSize:16, marginBottom:4 }}>{s.icon}</div>
                        <div className="syne" style={{ fontSize:16, fontWeight:700, color:"#212529" }}>{s.value}</div>
                        <div style={{ fontSize:10, color:"#6c757d", fontWeight:500 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button className="pg-btn pg-btn-primary" style={{ flex:1, justifyContent:"center", fontSize:12 }}>⚙️ Edit Profile</button>
                    <button className="pg-btn pg-btn-ghost" style={{ fontSize:12 }}>📋 My Reports</button>
                  </div>
                </div>

                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <div className="pg-card fade-up" style={{ animationDelay:"0.1s" }}>
                    <div className="syne" style={{ fontSize:14, fontWeight:700, color:"#212529", marginBottom:14 }}>📂 Recent Analyses</div>
                    {[{id:"H001",sample:"SAMPLE_AB12CD",drugs:"WARFARIN · CLOPIDOGREL",risk:1,date:"Feb 15"},{id:"H002",sample:"SAMPLE_XY99ZW",drugs:"CODEINE · SIMVASTATIN",risk:2,date:"Feb 10"},{id:"H003",sample:"SAMPLE_GH34MN",drugs:"AZATHIOPRINE · IRINOTECAN",risk:2,date:"Jan 28"}].map((h,i) => (
                      <div key={h.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:i<2?"1px solid rgba(11,94,215,0.07)":"none" }}>
                        <div style={{ width:36, height:36, borderRadius:9, background:"rgba(11,94,215,0.07)", border:"1.5px solid rgba(11,94,215,0.14)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>🧬</div>
                        <div style={{ flex:1 }}>
                          <div className="mono" style={{ fontSize:11, color:"#0B5ED7", fontWeight:600 }}>{h.sample}</div>
                          <div style={{ fontSize:11, color:"#6c757d", marginTop:2 }}>{h.drugs}</div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <span className="pg-badge" style={{ background:"rgba(139,47,47,0.08)", color:"#8B2F2F", border:"1px solid rgba(139,47,47,0.2)", fontSize:9 }}>{h.risk} Toxic</span>
                          <div style={{ fontSize:10, color:"#adb5bd", marginTop:3 }}>{h.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pg-card fade-up" style={{ animationDelay:"0.18s" }}>
                    <div className="syne" style={{ fontSize:14, fontWeight:700, color:"#212529", marginBottom:14 }}>🚀 Platform Capabilities</div>
                    <MiniBar label="PGx Coverage" value={94} color="#0B5ED7" />
                    <MiniBar label="Annotation Accuracy" value={98} color="#20C997" />
                    <MiniBar label="CPIC Compliance" value={100} color="#6EA8FE" />
                    <MiniBar label="Family Mode Depth" value={87} color="#f59e0b" />
                    <MiniBar label="Export Completeness" value={92} color="#EB3434" />
                  </div>
                </div>
              </div>
            </section>

            {/* ─── FAMILY MODE ─────────────────────────────────────────────── */}
            <section style={{ background:"rgba(11,94,215,0.03)", borderTop:"1.5px solid rgba(11,94,215,0.09)", borderBottom:"1.5px solid rgba(11,94,215,0.09)", padding:"64px 24px" }}>
              <div style={{ maxWidth:1100, margin:"0 auto" }}>
                <div style={{ textAlign:"center", marginBottom:44 }}>
                  <div className="pg-badge mono fade-up" style={{ background:"rgba(110,168,254,0.12)", color:"#6EA8FE", border:"1px solid rgba(110,168,254,0.3)", marginBottom:14, display:"inline-flex" }}>FAMILY MODE</div>
                  <h2 className="fraunces fade-up" style={{ fontSize:"clamp(22px,3.5vw,34px)", fontWeight:900, color:"#212529", marginBottom:10, animationDelay:"0.05s" }}>Whole-Family Pharmacogenomics</h2>
                  <p className="fade-up" style={{ fontSize:14, color:"#6c757d", maxWidth:480, margin:"0 auto", lineHeight:1.8, animationDelay:"0.1s" }}>Analyse genomic data for every family member in a single unified session.</p>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 }}>
                  {[
                    {icon:"➕",title:"Add Family Members",color:"#0B5ED7",desc:"Create profiles for each family member with name, relation, age, and health conditions."},
                    {icon:"📁",title:"Upload Per-Member VCF",color:"#6EA8FE",desc:"Each member gets their own VCF upload zone with individual quality metrics."},
                    {icon:"💊",title:"Select Drugs Per Member",color:"#20C997",desc:"Customise drug lists per member based on their prescription history."},
                    {icon:"🔬",title:"Run Batch Analysis",color:"#f59e0b",desc:"All members analysed simultaneously with results displayed side-by-side."},
                    {icon:"📋",title:"Comparative Reports",color:"#EB3434",desc:"Export family-wide reports with shared risk patterns highlighted."},
                  ].map((s,i) => (
                    <div key={s.title} className="step-card fade-up" style={{ animationDelay:`${i*0.07}s` }}>
                      <div style={{ width:40, height:40, borderRadius:10, marginBottom:12, background:`${s.color}12`, border:`1.5px solid ${s.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{s.icon}</div>
                      <div className="syne" style={{ fontSize:13, fontWeight:700, color:"#212529", marginBottom:7 }}>{s.title}</div>
                      <div style={{ fontSize:12, color:"#6c757d", lineHeight:1.7 }}>{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ─── LAB BOOKING ─────────────────────────────────────────────── */}
            <section style={{ padding:"64px 24px 80px", maxWidth:1100, margin:"0 auto" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, alignItems:"center" }}>
                <div>
                  <div className="pg-badge mono fade-up" style={{ background:"rgba(32,201,151,0.1)", color:"#20C997", border:"1px solid rgba(32,201,151,0.25)", marginBottom:16, display:"inline-flex" }}>HOME LAB BOOKING</div>
                  <h2 className="fraunces fade-up" style={{ fontSize:"clamp(22px,3.5vw,34px)", fontWeight:900, color:"#212529", marginBottom:14, animationDelay:"0.05s" }}>
                    Certified Technician<br />At Your Doorstep
                  </h2>
                  <p className="fade-up" style={{ fontSize:14, color:"#6c757d", lineHeight:1.8, marginBottom:24, animationDelay:"0.1s" }}>
                    Book a certified lab technician for home sample collection. Schedule via real-time calendar, choose from verified specialists, and track your technician's arrival live.
                  </p>
                  <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:12, animationDelay:"0.15s" }}>
                    {[
                      {icon:"📅",text:"Real-time calendar with available time slots"},
                      {icon:"👨‍⚕️",text:"Verified, rated lab technicians and PGx specialists"},
                      {icon:"🚨",text:"24/7 urgent booking with 45-minute ETA"},
                      {icon:"💳",text:"Card, UPI, net banking, or cash on visit"},
                      {icon:"📍",text:"Live technician tracking on order confirmation"},
                    ].map(f => (
                      <div key={f.text} style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ width:32, height:32, borderRadius:8, flexShrink:0, background:"rgba(32,201,151,0.1)", border:"1.5px solid rgba(32,201,151,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{f.icon}</div>
                        <span style={{ fontSize:13, color:"#495057" }}>{f.text}</span>
                      </div>
                    ))}
                  </div>
                  <button className="pg-btn pg-btn-teal fade-up" style={{ marginTop:24, fontSize:14, animationDelay:"0.2s" }} onClick={() => navigate("/technician")}>
                    📅 Book a Technician
                  </button>
                </div>

                {/* Lab tests grid */}
                <div className="fade-up" style={{ animationDelay:"0.12s" }}>
                  <div className="pg-card" style={{ padding:0, overflow:"hidden" }}>
                    <div style={{ padding:"16px 18px", borderBottom:"1.5px solid rgba(11,94,215,0.08)", display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:16 }}>🧪</span>
                      <div className="syne" style={{ fontSize:14, fontWeight:700, color:"#212529" }}>Available Tests</div>
                    </div>
                    <div style={{ padding:"10px 0" }}>
                      {[
                        {icon:"🩸",name:"Complete Blood Count (CBC)",price:"₹299",tag:"Popular",tagColor:"#0B5ED7"},
                        {icon:"🫀",name:"Liver Function Test (LFT)",price:"₹499",tag:"",tagColor:""},
                        {icon:"🧬",name:"Thyroid Panel T3/T4/TSH",price:"₹599",tag:"",tagColor:""},
                        {icon:"🔬",name:"HbA1c — Diabetes Control",price:"₹349",tag:"Fast",tagColor:"#20C997"},
                        {icon:"🧬",name:"PGx Pharmacogenomics Panel",price:"₹3,499",tag:"Featured",tagColor:"#6EA8FE"},
                        {icon:"🦠",name:"COVID-19 RT-PCR",price:"₹799",tag:"",tagColor:""},
                      ].map((t,i) => (
                        <div key={t.name} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 18px", borderBottom:i<5?"1px solid rgba(11,94,215,0.06)":"none" }}>
                          <span style={{ fontSize:18 }}>{t.icon}</span>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:12, fontWeight:600, color:"#212529" }}>{t.name}</div>
                          </div>
                          {t.tag && <span className="pg-badge" style={{ background:`${t.tagColor}12`, color:t.tagColor, border:`1px solid ${t.tagColor}25`, fontSize:9 }}>{t.tag}</span>}
                          <div className="mono" style={{ fontSize:12, fontWeight:700, color:"#0B5ED7" }}>{t.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ─── EXPORT SECTION ──────────────────────────────────────────── */}
            <section style={{ background:"rgba(11,94,215,0.03)", borderTop:"1.5px solid rgba(11,94,215,0.09)", padding:"64px 24px" }}>
              <div style={{ maxWidth:1100, margin:"0 auto", textAlign:"center" }}>
                <h2 className="fraunces fade-up" style={{ fontSize:"clamp(22px,3.5vw,34px)", fontWeight:900, color:"#212529", marginBottom:12 }}>Export-Ready Clinical Reports</h2>
                <p className="fade-up" style={{ fontSize:14, color:"#6c757d", maxWidth:480, margin:"0 auto 36px", lineHeight:1.8, animationDelay:"0.05s" }}>
                  Download structured data in multiple formats — ready for EHR integration, prescriber review, or patient records.
                </p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 }}>
                  {[
                    {icon:"📄",format:"Clinical PDF",desc:"Print-ready pharmacogenomic report with all drug analyses, mechanisms, and references",color:"#EB3434"},
                    {icon:"{ }",format:"JSON Report",desc:"CPIC-compliant structured JSON for EHR and API integration with full metadata",color:"#0B5ED7"},
                    {icon:"📊",format:"CSV Export",desc:"Flat table with all drug results, confidence scores, and recommendations",color:"#20C997"},
                    {icon:"📋",format:"Clipboard Copy",desc:"One-click copy of full JSON report to clipboard for quick sharing",color:"#6EA8FE"},
                  ].map((f,i) => (
                    <div key={f.format} className="pg-card fade-up" style={{ textAlign:"left", animationDelay:`${i*0.07}s` }}>
                      <div style={{ width:44, height:44, borderRadius:11, marginBottom:14, background:`${f.color}10`, border:`1.5px solid ${f.color}25`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{f.icon}</div>
                      <div className="syne" style={{ fontSize:14, fontWeight:700, color:"#212529", marginBottom:7 }}>{f.format}</div>
                      <div style={{ fontSize:12, color:"#6c757d", lineHeight:1.7 }}>{f.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* ─── FOOTER (shown on all pages) ─────────────────────────────────── */}
        <Footer />

      </div>
    </div>
  );
}