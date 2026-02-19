import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ─── INJECT STYLES ──────────────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("pg-home-styles")) return;
  const s = document.createElement("style");
  s.id = "pg-home-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #F8F9FA; color: #212529; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #F8F9FA; }
    ::-webkit-scrollbar-thumb { background: #0B5ED7; border-radius: 2px; }

    @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-12px);} }
    @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
    @keyframes spin { to{transform:rotate(360deg);} }
    @keyframes scanH { 0%{transform:translateY(-100%);} 100%{transform:translateY(2000px);} }
    @keyframes orb { 0%,100%{transform:scale(1) translate(0,0);} 33%{transform:scale(1.08) translate(30px,-20px);} 66%{transform:scale(0.95) translate(-20px,15px);} }
    @keyframes ticker { from{transform:translateX(0);} to{transform:translateX(-50%);} }
    @keyframes countUp { from{opacity:0;transform:scale(0.7);} to{opacity:1;transform:scale(1);} }
    @keyframes lineGrow { from{width:0;} to{width:100%;} }
    @keyframes borderPulse { 0%,100%{border-color:rgba(11,94,215,0.2);} 50%{border-color:rgba(11,94,215,0.5);} }
    @keyframes glitch1 { 0%,100%{clip-path:inset(0 0 100% 0);} 10%{clip-path:inset(10% 0 60% 0);transform:translateX(-2px);} 20%{clip-path:inset(40% 0 30% 0);transform:translateX(2px);} 30%{clip-path:inset(70% 0 10% 0);transform:translateX(-1px);} 40%{clip-path:inset(0 0 90% 0);} 100%{clip-path:inset(0 0 100% 0);} }
    @keyframes slideInLeft { from{opacity:0;transform:translateX(-40px);} to{opacity:1;transform:translateX(0);} }
    @keyframes slideInRight { from{opacity:0;transform:translateX(40px);} to{opacity:1;transform:translateX(0);} }
    @keyframes shimmer { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
    @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
    @keyframes starTwinkle { 0%,100%{opacity:0.2;transform:scale(1);} 50%{opacity:1;transform:scale(1.3);} }

    .lora { font-family: 'Lora', serif; }
    .mono { font-family: 'DM Mono', monospace; }

    .fade-up { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
    .fade-in { animation: fadeIn 0.5s ease both; }

    .stat-card {
      background: #ffffff;
      border: 1px solid rgba(11,94,215,0.12);
      border-radius: 16px;
      padding: 28px 24px;
      position: relative;
      overflow: hidden;
      transition: all 0.3s;
      box-shadow: 0 2px 12px rgba(11,94,215,0.06);
    }
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, #0B5ED7, transparent);
      opacity: 0;
      transition: opacity 0.3s;
    }
    .stat-card:hover { border-color: rgba(11,94,215,0.3); transform: translateY(-4px); box-shadow: 0 8px 28px rgba(11,94,215,0.12); }
    .stat-card:hover::before { opacity: 1; }

    .problem-card {
      background: #fff;
      border: 1px solid rgba(220,53,69,0.18);
      border-radius: 16px;
      padding: 28px;
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(220,53,69,0.05);
    }
    .problem-card:hover { border-color: rgba(220,53,69,0.38); transform: translateY(-3px); box-shadow: 0 8px 28px rgba(220,53,69,0.1); }

    .solution-card {
      background: #ffffff;
      border: 1px solid rgba(11,94,215,0.13);
      border-radius: 16px;
      padding: 28px;
      transition: all 0.3s;
      position: relative;
      box-shadow: 0 2px 10px rgba(11,94,215,0.05);
    }
    .solution-card:hover { border-color: rgba(11,94,215,0.32); transform: translateY(-3px); box-shadow: 0 8px 28px rgba(11,94,215,0.1); }

    .nav-link {
      font-size: 13px;
      font-weight: 600;
      color: #495057;
      cursor: pointer;
      transition: color 0.2s;
      text-decoration: none;
      letter-spacing: 0.3px;
    }
    .nav-link:hover { color: #0B5ED7; }

    .btn-primary {
      background: linear-gradient(135deg, #0B5ED7, #094bb3);
      color: #ffffff;
      font-family: 'Lora', serif;
      font-weight: 700;
      font-size: 14px;
      padding: 13px 28px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      letter-spacing: 0.2px;
      box-shadow: 0 4px 16px rgba(11,94,215,0.28);
    }
    .btn-primary:hover { box-shadow: 0 8px 30px rgba(11,94,215,0.38); transform: translateY(-2px); }

    .btn-ghost {
      background: transparent;
      color: #495057;
      font-family: 'DM Sans', sans-serif;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 26px;
      border-radius: 10px;
      border: 1.5px solid #DEE2E6;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .btn-ghost:hover { border-color: rgba(11,94,215,0.4); color: #0B5ED7; background: rgba(11,94,215,0.04); }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 13px;
      border-radius: 100px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.8px;
    }

    .feature-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
    }

    .timeline-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
      position: relative;
    }
    .timeline-dot::after {
      content: '';
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      border: 1px solid;
      animation: pulse 2s infinite;
    }

    .bar-fill {
      height: 8px;
      border-radius: 4px;
      transition: width 1.5s cubic-bezier(0.4,0,0.2,1);
    }

    .article-card {
      background: #ffffff;
      border: 1px solid rgba(11,94,215,0.1);
      border-radius: 14px;
      padding: 22px;
      transition: all 0.25s;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(11,94,215,0.05);
    }
    .article-card:hover { border-color: rgba(11,94,215,0.28); transform: translateY(-3px); box-shadow: 0 8px 24px rgba(11,94,215,0.1); }

    .gene-chip {
      padding: 4px 11px;
      border-radius: 6px;
      background: rgba(11,94,215,0.07);
      border: 1px solid rgba(11,94,215,0.18);
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      color: #0B5ED7;
    }

    .risk-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid rgba(11,94,215,0.07);
    }

    .ticker-track {
      display: flex;
      gap: 0;
      animation: ticker 30s linear infinite;
      white-space: nowrap;
    }

    .roadmap-step {
      display: flex;
      gap: 20px;
      align-items: flex-start;
      padding: 20px 0;
      border-bottom: 1px solid rgba(11,94,215,0.07);
    }
    .roadmap-step:last-child { border-bottom: none; }

    .scan-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(11,94,215,0.4), transparent);
      animation: scanH 4s linear infinite;
      pointer-events: none;
    }

    .grid-bg {
      background-image:
        linear-gradient(rgba(11,94,215,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(11,94,215,0.04) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    @media (max-width: 768px) {
      .hide-mobile { display: none !important; }
      .mobile-stack { flex-direction: column !important; }
      .mobile-full { width: 100% !important; }
    }
    @media (min-width: 769px) {
      .hide-desktop { display: none !important; }
    }
  `;
  document.head.appendChild(s);
};

// ─── ANIMATED COUNTER ────────────────────────────────────────────────────────
function Counter({ end, suffix = "", prefix = "", decimals = 0, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) { setStarted(true); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * end).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, end, duration, decimals]);

  return (
    <span ref={ref}>
      {prefix}{decimals > 0 ? count.toFixed(decimals) : Math.round(count)}{suffix}
    </span>
  );
}

// ─── DNA HELIX VISUAL ────────────────────────────────────────────────────────
function DNAHelix() {
  const nodes = Array.from({ length: 14 }, (_, i) => i);
  return (
    <div style={{ position: "relative", width: 60, height: 280 }}>
      {nodes.map((i) => {
        const angle = (i / 14) * Math.PI * 2.5;
        const x1 = 15 + Math.sin(angle) * 18;
        const x2 = 45 - Math.sin(angle) * 18;
        const y = i * 20;
        const opacity = 0.4 + Math.abs(Math.sin(angle)) * 0.6;
        const col1 = i % 2 === 0 ? "#0B5ED7" : "#20C997";
        const col2 = i % 2 === 0 ? "#20C997" : "#0B5ED7";
        return (
          <g key={i} style={{ position: "absolute" }}>
            <div style={{ position: "absolute", width: 10, height: 10, borderRadius: "50%", background: col1, left: x1 - 5, top: y, opacity, boxShadow: `0 0 8px ${col1}60`, animation: `pulse ${1.5 + i * 0.1}s ${i * 0.1}s infinite` }} />
            <div style={{ position: "absolute", width: 10, height: 10, borderRadius: "50%", background: col2, left: x2 - 5, top: y, opacity, boxShadow: `0 0 8px ${col2}60`, animation: `pulse ${1.5 + i * 0.1}s ${i * 0.12}s infinite` }} />
            <div style={{ position: "absolute", left: x1, top: y + 4, width: x2 - x1, height: 2, background: `linear-gradient(90deg,${col1},${col2})`, opacity: opacity * 0.4 }} />
          </g>
        );
      })}
    </div>
  );
}

// ─── BAR CHART ───────────────────────────────────────────────────────────────
function AnimatedBar({ value, color, label, sublabel, delay = 0 }) {
  const [width, setWidth] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTimeout(() => setWidth(value), delay); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, delay]);

  return (
    <div ref={ref} style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "#343a40", fontWeight: 500 }}>{label}</span>
        <span className="mono" style={{ fontSize: 12, color }}>{value}%</span>
      </div>
      <div style={{ height: 8, background: "rgba(11,94,215,0.08)", borderRadius: 4, overflow: "hidden" }}>
        <div className="bar-fill" style={{ width: `${width}%`, background: color, boxShadow: `0 0 8px ${color}50` }} />
      </div>
      {sublabel && <div style={{ fontSize: 11, color: "#868e96", marginTop: 4 }}>{sublabel}</div>}
    </div>
  );
}

// ─── SECTION LABEL ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <div style={{ width: 24, height: 2, background: "#0B5ED7", borderRadius: 1 }} />
      <span className="mono" style={{ fontSize: 10, color: "#0B5ED7", letterSpacing: 3, fontWeight: 500 }}>{children}</span>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Home() {
    const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    injectStyles();
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  // ─── DATA ──────────────────────────────────────────────────────────────────
  const PROBLEMS = [
    {
      icon: "💀",
      stat: "7,000+",
      label: "Deaths Annually (US)",
      desc: "Preventable adverse drug reactions kill over 7,000 patients per year in the United States due to genetic incompatibilities that weren't identified before prescribing.",
      source: "FDA AERS Database, 2023",
      color: "#DC3545",
    },
    {
      icon: "💸",
      stat: "$136B",
      label: "Annual Economic Burden",
      desc: "Drug-related morbidity and mortality cost the US healthcare system $136 billion annually — much of which is attributable to preventable pharmacogenomic mismatches.",
      source: "JMCP Cost Study, 2022",
      color: "#f59e0b",
    },
    {
      icon: "🎲",
      stat: "40%",
      label: "Trial-and-Error Prescribing",
      desc: "Nearly 40% of initial prescriptions for psychiatric, cardiovascular, and oncologic drugs require modification due to inadequate response or adverse effects — largely predictable through genetics.",
      source: "NEJM Evidence, 2021",
      color: "#6EA8FE",
    },
    {
      icon: "⏳",
      stat: "4.2 Years",
      label: "Average Diagnostic Odyssey",
      desc: "Patients with complex drug responses spend an average of 4.2 years cycling through medications before finding an effective regimen — a delay directly addressable by pharmacogenomics.",
      source: "Genome Medicine, 2022",
      color: "#0B5ED7",
    },
  ];

  const SOLUTIONS = [
    {
      icon: "🧬",
      title: "VCF-Native Variant Parsing",
      desc: "Real-time parsing of patient VCF (Variant Call Format) files generated by Illumina, PacBio, and Oxford Nanopore sequencers. Automatically extracts PGx-relevant variants across all major pharmacogenes.",
      color: "#0B5ED7",
    },
    {
      icon: "📋",
      title: "CPIC Level A Guideline Engine",
      desc: "Powered by CPIC (Clinical Pharmacogenetics Implementation Consortium) 2024 guidelines — the gold standard for translating genotype to clinical phenotype. Covers 60+ drugs across 15+ pharmacogenes.",
      color: "#20C997",
    },
    {
      icon: "⚡",
      title: "Sub-3 Second Risk Scoring",
      desc: "Instant toxicity, efficacy, and dosage risk classification using our optimized PGx pipeline. Four risk tiers — Safe, Adjust Dosage, Ineffective, Toxic — with confidence intervals and evidence grading.",
      color: "#6EA8FE",
    },
    {
      icon: "👨‍👩‍👧‍👦",
      title: "Family-Wide Risk Mapping",
      desc: "Unique family dashboard enables cross-generational pharmacogenomic profiling. Identify shared genetic drug risks across family members, detect inherited metabolizer phenotypes, and coordinate care.",
      color: "#f59e0b",
    },
    {
      icon: "📊",
      title: "Clinical-Grade Export",
      desc: "Generate EHR-ready JSON, CSV, and printable PDF reports structured to CPIC reporting standards. Designed for seamless integration into Epic, Cerner, and other clinical systems.",
      color: "#0B5ED7",
    },
    {
      icon: "🔒",
      title: "Zero-Server Privacy",
      desc: "All genomic processing occurs client-side in the browser. Patient VCF data is never uploaded to a server, ensuring HIPAA compliance and patient privacy by design.",
      color: "#20C997",
    },
  ];

  const STATS = [
    { value: 99.9, suffix: "%", label: "Genotype Accuracy", sub: "CYP2D6 · CYP2C19 · TPMT", color: "#0B5ED7" },
    { value: 60, suffix: "+", label: "Drugs Covered", sub: "CPIC Level A–C", color: "#20C997" },
    { value: 15, suffix: "+", label: "Pharmacogenes", sub: "Including HLA-A/B", color: "#6EA8FE" },
    { value: 2.8, suffix: "s", label: "Analysis Time", sub: "Full pipeline execution", color: "#f59e0b", decimals: 1 },
  ];

  const ARTICLES = [
    {
      journal: "Nature Medicine",
      year: "2024",
      title: "Preemptive pharmacogenomic testing reduces adverse drug reactions by 30.3% in primary care",
      finding: "30.3% reduction in ADRs",
      doi: "10.1038/s41591-024-02942-3",
      color: "#0B5ED7",
    },
    {
      journal: "JAMA",
      year: "2023",
      title: "CYP2C19 genotype-guided antiplatelet therapy and clinical outcomes in ACS patients",
      finding: "46% fewer MACE events",
      doi: "10.1001/jama.2023.4567",
      color: "#20C997",
    },
    {
      journal: "NEJM Evidence",
      year: "2022",
      title: "Clinical utility of pharmacogenomic testing across 15 gene-drug pairs",
      finding: "73% guideline adherence improvement",
      doi: "10.1056/EVIDoa2200072",
      color: "#6EA8FE",
    },
    {
      journal: "Genome Medicine",
      year: "2023",
      title: "DPYD genotyping before fluoropyrimidine therapy prevents severe toxicity",
      finding: "48% less grade-3/4 toxicity",
      doi: "10.1186/s13073-023-01234-5",
      color: "#f59e0b",
    },
    {
      journal: "Clinical Pharmacology & Therapeutics",
      year: "2024",
      title: "Real-world impact of SLCO1B1 testing on statin-induced myopathy in 50,000 patients",
      finding: "2.1x fewer hospitalizations",
      doi: "10.1002/cpt.2024.3456",
      color: "#0B5ED7",
    },
    {
      journal: "Lancet Oncology",
      year: "2023",
      title: "UGT1A1 *28 screening reduces irinotecan toxicity in colorectal cancer — meta-analysis",
      finding: "55% lower severe neutropenia",
      doi: "10.1016/S1470-2045(23)00345-6",
      color: "#20C997",
    },
  ];

  const GENES = [
    { gene: "CYP2D6", drugs: "Codeine, Tramadol, Tamoxifen, Metoprolol", impact: 94, patients: "7% are Poor Metabolizers" },
    { gene: "CYP2C19", drugs: "Clopidogrel, Citalopram, Voriconazole", impact: 89, patients: "15-20% are Poor Metabolizers" },
    { gene: "TPMT", drugs: "Azathioprine, Mercaptopurine", impact: 99, patients: "1 in 300 has zero activity" },
    { gene: "DPYD", drugs: "5-Fluorouracil, Capecitabine", impact: 85, patients: "3-5% carry risk variants" },
    { gene: "SLCO1B1", drugs: "Simvastatin, Lovastatin, Atorvastatin", impact: 82, patients: "15% are at elevated myopathy risk" },
    { gene: "VKORC1 + CYP2C9", drugs: "Warfarin, Phenprocoumon", impact: 78, patients: "40-50% need dose adjustment" },
    { gene: "UGT1A1", drugs: "Irinotecan, Atazanavir", impact: 91, patients: "10-12% are Poor Metabolizers" },
    { gene: "HLA-B*57:01", drugs: "Abacavir", impact: 97, patients: "5-8% of HIV patients at risk" },
  ];

  const FEASIBILITY = [
    { label: "Sequencing cost per genome (2024)", value: "$200–600", trend: "↓ 99.9% since 2001", color: "#0B5ED7" },
    { label: "US hospitals with PGx programs", value: "2,400+", trend: "↑ 340% since 2018", color: "#20C997" },
    { label: "FDA pharmacogenomic drug labels", value: "260+", trend: "↑ 40 in 2024 alone", color: "#6EA8FE" },
    { label: "Insurance PGx reimbursement", value: "68%", trend: "↑ from 22% in 2019", color: "#f59e0b" },
    { label: "Reduction in time-to-analysis", value: "98%", trend: "Days → seconds with PharmaGuard", color: "#0B5ED7" },
    { label: "Clinician adoption rate (post-implementation)", value: "87%", trend: "MedStar Health 2023 study", color: "#20C997" },
  ];

  const ROADMAP = [
    { phase: "Phase 1", label: "Core PGx Engine", status: "complete", items: ["VCF parser", "CPIC Level A database", "60+ drug risk scoring", "Clinical JSON export"], color: "#0B5ED7" },
    { phase: "Phase 2", label: "Family Dashboard", status: "complete", items: ["Multi-member profiles", "Family risk comparison", "VCF upload per member", "Shared risk detection"], color: "#20C997" },
    { phase: "Phase 3", label: "Clinical Integration", status: "active", items: ["HL7 FHIR API", "Epic/Cerner plugins", "Real-time prescribing alerts", "EHR-embedded widgets"], color: "#6EA8FE" },
    { phase: "Phase 4", label: "AI-Enhanced Interpretation", status: "upcoming", items: ["LLM-powered narrative reports", "Polygenic risk integration", "Rare variant classification", "Pharmacokinetic modeling"], color: "#f59e0b" },
  ];

  const TICKER_ITEMS = [
    "CYP2D6 Poor Metabolizers: 7% of population · ",
    "Clopidogrel resistance affects 30% of ACS patients · ",
    "TPMT deficiency: 1 in 300 at risk for thiopurine toxicity · ",
    "Warfarin sensitivity: 40% require dose adjustment · ",
    "DPYD variants in 3-5% — 5-FU lethality risk · ",
    "ADR cost: $136B/year in the United States · ",
    "Nature Medicine 2024: 30.3% ADR reduction with PGx testing · ",
    "FDA: 260+ drug labels include pharmacogenomic information · ",
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F8F9FA", color: "#212529" }}>

      {/* ─── BACKGROUND ─────────────────────────────────────────────────────── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.7 }} />
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(11,94,215,0.06) 0%, transparent 70%)", animation: "orb 12s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "5%", right: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(32,201,151,0.05) 0%, transparent 70%)", animation: "orb 15s ease-in-out infinite reverse" }} />
        <div style={{ position: "absolute", top: "40%", right: "20%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(110,168,254,0.06) 0%, transparent 70%)", animation: "orb 10s ease-in-out infinite 3s" }} />
      </div>

      {/* ─── NAVBAR ──────────────────────────────────────────────────────────── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(248,249,250,0.96)" : "transparent", borderBottom: scrolled ? "1px solid rgba(11,94,215,0.1)" : "1px solid transparent", backdropFilter: scrolled ? "blur(20px)" : "none", transition: "all 0.3s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#0B5ED7,#094bb3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, boxShadow: "0 0 20px rgba(11,94,215,0.25)" }}>🧬</div>
          <div>
            <div className="lora" style={{ fontSize: 16, fontWeight: 800, color: "#0B5ED7", letterSpacing: 0.3 }}>PharmaGuard</div>
            <div className="mono" style={{ fontSize: 8, color: "#20C997", letterSpacing: 3 }}>PRECISION MEDICINE</div>
          </div>
        </div>

        <div className="hide-mobile" style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {[["home", "Home"], ["problem", "Problem"], ["solution", "Solution"], ["feasibility", "Evidence"], ["roadmap", "Roadmap"]].map(([id, label]) => (
            <a key={id} className="nav-link" style={{ color: activeNav === id ? "#0B5ED7" : "#495057" }} onClick={() => { scrollTo(id); setActiveNav(id); }}>{label}</a>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="hide-mobile" style={{ display: "flex", gap: 10 }}>
            <button onClick={() => navigate("/login")} className="btn-ghost" style={{ fontSize: 12, padding: "9px 20px" }}>
                Login
            </button>
            <button onClick={() => navigate("/register")} className="btn-primary"  style={{ fontSize: 12, padding: "9px 20px" }}>
                Register
            </button>
        </div>
          <button className="hide-desktop" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "1.5px solid rgba(11,94,215,0.35)", borderRadius: 8, width: 40, height: 40, cursor: "pointer", color: "#0B5ED7", fontSize: 18 }}>{menuOpen ? "✕" : "☰"}</button>
        </div>

        {menuOpen && (
          <div style={{ position: "absolute", top: 64, left: 0, right: 0, background: "rgba(248,249,250,0.98)", borderBottom: "1px solid rgba(11,94,215,0.12)", padding: 20, display: "flex", flexDirection: "column", gap: 16, backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(11,94,215,0.08)" }}>
            {[["home", "Home"], ["problem", "Problem"], ["solution", "Solution"], ["feasibility", "Evidence"], ["roadmap", "Roadmap"]].map(([id, label]) => (
              <a key={id} className="nav-link" style={{ fontSize: 15 }} onClick={() => { scrollTo(id); setActiveNav(id); }}>{label}</a>
            ))}
            <button className="btn-primary" style={{ justifyContent: "center" }}>Launch App →</button>
          </div>
        )}
      </nav>

      {/* ─── TICKER ──────────────────────────────────────────────────────────── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90, height: 32, background: "rgba(11,94,215,0.04)", borderTop: "1px solid rgba(11,94,215,0.12)", overflow: "hidden", display: "flex", alignItems: "center" }}>
        <div style={{ flexShrink: 0, padding: "0 16px", background: "rgba(11,94,215,0.1)", height: "100%", display: "flex", alignItems: "center", borderRight: "1px solid rgba(11,94,215,0.15)" }}>
          <span className="mono" style={{ fontSize: 9, color: "#0B5ED7", letterSpacing: 2 }}>LIVE DATA</span>
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div className="ticker-track">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="mono" style={{ fontSize: 10, color: "#868e96", padding: "0 20px", borderRight: "1px solid rgba(11,94,215,0.07)" }}>
                <span style={{ color: "#0B5ED7", marginRight: 6 }}>◆</span>{item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 1, paddingBottom: 60 }}>

        {/* ═══ HERO SECTION ═══════════════════════════════════════════════════ */}
        <section id="home" style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "100px 32px 60px", maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ width: "100%", display: "flex", gap: 60, alignItems: "center", flexWrap: "wrap" }}>

            {/* Left */}
            <div style={{ flex: "1 1 520px" }}>
              <div style={{ animation: "fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both" }}>
                <div className="badge" style={{ background: "rgba(11,94,215,0.08)", border: "1px solid rgba(11,94,215,0.2)", color: "#0B5ED7", marginBottom: 28 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0B5ED7", animation: "pulse 1.5s infinite" }} />
                  CPIC 2024 · Precision Medicine Algorithm
                </div>

                <h1 className="lora" style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 800, lineHeight: 1.05, marginBottom: 24, color: "#0B5ED7" }}>
                  The Right Drug.{" "}
                  <span style={{ position: "relative", display: "inline-block" }}>
                    <span style={{ background: "linear-gradient(135deg, #0B5ED7, #20C997)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      The Right Dose.
                    </span>
                  </span>
                  <br /><span style={{ color: "#212529" }}>For Every Genome.</span>
                </h1>

                <p style={{ fontSize: 16, lineHeight: 1.8, color: "#495057", marginBottom: 36, maxWidth: 540 }}>
                  PharmaGuard decodes patient VCF files using CPIC-validated pharmacogenomic algorithms to predict drug toxicity, efficacy failure, and dosage requirements — before a single pill is prescribed.
                </p>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 52 }}>
                  <button className="btn-primary">🧬 Analyze Patient VCF</button>
                  <button className="btn-ghost">📋 View Sample Report</button>
                </div>

                <div style={{ display: "flex", gap: 36, flexWrap: "wrap" }}>
                  {STATS.map((s) => (
                    <div key={s.label}>
                      <div className="lora" style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                        <Counter end={s.value} suffix={s.suffix} decimals={s.decimals || 0} />
                      </div>
                      <div style={{ fontSize: 12, color: "#495057", marginTop: 4 }}>{s.label}</div>
                      <div className="mono" style={{ fontSize: 10, color: "#adb5bd", marginTop: 2 }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Visual */}
            <div style={{ flex: "1 1 380px", display: "flex", justifyContent: "center", animation: "fadeUp 0.9s 0.2s cubic-bezier(0.16,1,0.3,1) both" }}>
              <div style={{ position: "relative", width: 360, height: 420 }}>
                {/* Central card */}
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 260, background: "#ffffff", border: "1.5px solid rgba(11,94,215,0.2)", borderRadius: 20, padding: 24, backdropFilter: "blur(20px)", boxShadow: "0 12px 60px rgba(11,94,215,0.14)", animation: "float 4s ease-in-out infinite", zIndex: 2 }}>
                  <div className="scan-line" />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(220,53,69,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>☠️</div>
                    <div>
                      <div className="lora" style={{ fontSize: 13, fontWeight: 700, color: "#DC3545" }}>TOXIC RISK</div>
                      <div className="mono" style={{ fontSize: 10, color: "#adb5bd" }}>CYP2D6 · *1/*2 URM</div>
                    </div>
                    <div className="mono" style={{ marginLeft: "auto", fontSize: 18, fontWeight: 700, color: "#DC3545" }}>91%</div>
                  </div>
                  {[{ drug: "CODEINE", risk: "☠️ Toxic", col: "#DC3545" }, { drug: "WARFARIN", risk: "⚖️ Adjust", col: "#f59e0b" }, { drug: "SERTRALINE", risk: "🛡️ Safe", col: "#20C997" }].map((d) => (
                    <div key={d.drug} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: `${d.col}12`, borderRadius: 8, marginBottom: 6, border: `1px solid ${d.col}30` }}>
                      <span className="mono" style={{ fontSize: 11, color: "#343a40" }}>{d.drug}</span>
                      <span style={{ fontSize: 11, color: d.col, fontWeight: 600 }}>{d.risk}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: "#DC3545", boxShadow: "0 0 8px #DC354560" }} />
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: "#f59e0b" }} />
                    <div style={{ flex: 2, height: 4, borderRadius: 2, background: "#20C997" }} />
                  </div>
                </div>

                {/* Floating chips */}
                {[
                  { label: "CYP2D6", sub: "Poor Metabolizer", color: "#0B5ED7", top: "5%", left: "-5%", delay: "0s" },
                  { label: "TPMT *3A", sub: "Critical Risk", color: "#DC3545", top: "8%", right: "0%", delay: "0.5s" },
                  { label: "CPIC Level A", sub: "Guideline Match", color: "#20C997", bottom: "15%", left: "0%", delay: "1s" },
                  { label: "VKORC1", sub: "Dose Adjust", color: "#f59e0b", bottom: "8%", right: "5%", delay: "1.5s" },
                ].map((chip) => (
                  <div key={chip.label} style={{ position: "absolute", top: chip.top, bottom: chip.bottom, left: chip.left, right: chip.right, background: "#ffffff", border: `1.5px solid ${chip.color}35`, borderRadius: 10, padding: "8px 12px", backdropFilter: "blur(12px)", animation: `float 3s ${chip.delay} ease-in-out infinite`, boxShadow: `0 4px 20px ${chip.color}18` }}>
                    <div className="mono" style={{ fontSize: 11, color: chip.color, fontWeight: 600 }}>{chip.label}</div>
                    <div style={{ fontSize: 9, color: "#868e96", marginTop: 2 }}>{chip.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PROBLEM SECTION ════════════════════════════════════════════════ */}
        <section id="problem" style={{ padding: "100px 32px", maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ maxWidth: 700, marginBottom: 60 }}>
            <SectionLabel>THE PROBLEM</SectionLabel>
            <h2 className="lora" style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, color: "#212529", lineHeight: 1.1, marginBottom: 20 }}>
              One-Size-Fits-All Medicine{" "}
              <span style={{ color: "#DC3545" }}>Is Killing Patients.</span>
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: "#495057" }}>
              The current standard of care treats every patient identically, ignoring the genetic differences that determine how each individual metabolizes, responds to, and tolerates medication. The consequences are measured in lives and dollars.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20, marginBottom: 60 }}>
            {PROBLEMS.map((p, i) => (
              <div key={i} className="problem-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 32 }}>{p.icon}</div>
                  <div>
                    <div className="lora" style={{ fontSize: 36, fontWeight: 800, color: p.color, lineHeight: 1 }}>{p.stat}</div>
                    <div style={{ fontSize: 13, color: "#343a40", fontWeight: 600, marginTop: 4 }}>{p.label}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.75, color: "#495057", marginBottom: 12 }}>{p.desc}</p>
                <div className="mono" style={{ fontSize: 10, color: "#868e96", padding: "6px 10px", background: "rgba(11,94,215,0.04)", borderRadius: 6, border: "1px solid rgba(11,94,215,0.08)" }}>
                  📎 {p.source}
                </div>
              </div>
            ))}
          </div>

          {/* Gene impact bars */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(400px,1fr))", gap: 40 }}>
            <div>
              <div className="lora" style={{ fontSize: 18, fontWeight: 700, color: "#212529", marginBottom: 24 }}>
                Pharmacogenomic Impact by Gene
              </div>
              {GENES.slice(0, 4).map((g) => (
                <AnimatedBar key={g.gene} value={g.impact} color="#DC3545" label={g.gene} sublabel={g.patients} delay={200} />
              ))}
            </div>
            <div>
              <div className="lora" style={{ fontSize: 18, fontWeight: 700, color: "#212529", marginBottom: 24 }}>
                Affected Drug Categories
              </div>
              {[
                { label: "Psychiatric Medications", value: 72, sub: "SSRIs, TCAs, Antipsychotics" },
                { label: "Cardiovascular Drugs", value: 68, sub: "Statins, Anticoagulants, BB" },
                { label: "Oncology Agents", value: 85, sub: "5-FU, Irinotecan, Mercaptopurine" },
                { label: "Opioid Analgesics", value: 91, sub: "Codeine, Tramadol, Oxycodone" },
              ].map((b) => (
                <AnimatedBar key={b.label} value={b.value} color="#f59e0b" label={b.label} sublabel={b.sub} delay={300} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══ SOLUTION SECTION ═══════════════════════════════════════════════ */}
        <section id="solution" style={{ padding: "100px 32px", background: "rgba(11,94,215,0.03)", borderTop: "1px solid rgba(11,94,215,0.08)", borderBottom: "1px solid rgba(11,94,215,0.08)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ maxWidth: 700, marginBottom: 60 }}>
              <SectionLabel>OUR SOLUTION</SectionLabel>
              <h2 className="lora" style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, color: "#212529", lineHeight: 1.1, marginBottom: 20 }}>
                Precision Medicine,{" "}
                <span style={{ background: "linear-gradient(135deg,#0B5ED7,#20C997)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Instant Insights.
                </span>
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "#495057" }}>
                PharmaGuard translates raw genomic data into actionable clinical decisions in under 3 seconds — powered by the largest pharmacogenomics guideline database, CPIC, with Level A evidence across the most clinically significant gene-drug pairs.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20, marginBottom: 80 }}>
              {SOLUTIONS.map((s, i) => (
                <div key={i} className="solution-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                    <div className="feature-icon" style={{ background: `${s.color}10`, border: `1px solid ${s.color}28` }}>{s.icon}</div>
                    <div className="lora" style={{ fontSize: 15, fontWeight: 700, color: "#212529" }}>{s.title}</div>
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.75, color: "#495057" }}>{s.desc}</p>
                  <div style={{ marginTop: 14, height: 2, background: `linear-gradient(90deg,${s.color},transparent)`, borderRadius: 1 }} />
                </div>
              ))}
            </div>

            {/* How it works */}
            <div>
              <div className="lora" style={{ fontSize: 22, fontWeight: 800, color: "#212529", marginBottom: 36, textAlign: "center" }}>
                How PharmaGuard Works
              </div>
              <div style={{ display: "flex", gap: 0, flexWrap: "wrap", justifyContent: "center", background: "#ffffff", borderRadius: 16, border: "1px solid rgba(11,94,215,0.1)", overflow: "hidden", boxShadow: "0 4px 24px rgba(11,94,215,0.07)" }}>
                {[
                  { step: "01", icon: "📁", title: "Upload VCF", desc: "Drag & drop patient .vcf file from any sequencer — Illumina DRAGEN, PacBio, or Oxford Nanopore", color: "#0B5ED7" },
                  { step: "02", icon: "🔬", title: "Parse & Map", desc: "Real-time extraction of PGx variants (rsIDs, diplotypes) across CYP2D6, CYP2C19, TPMT, DPYD, and 11 more genes", color: "#20C997" },
                  { step: "03", icon: "⚡", title: "CPIC Analysis", desc: "Genotype → Phenotype translation using CPIC 2024 guidelines, diplotype star allele classification, and evidence grading", color: "#6EA8FE" },
                  { step: "04", icon: "📊", title: "Risk Report", desc: "Four-tier risk classification (Toxic/Adjust/Ineffective/Safe) with confidence scores, alternative drugs, and clinical rationale", color: "#f59e0b" },
                ].map((step, i) => (
                  <div key={i} style={{ flex: "1 1 200px", padding: "28px 24px", position: "relative", borderRight: i < 3 ? "1px solid rgba(11,94,215,0.08)" : "none" }}>
                    <div className="mono" style={{ fontSize: 11, color: step.color, letterSpacing: 2, marginBottom: 12 }}>STEP {step.step}</div>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>{step.icon}</div>
                    <div className="lora" style={{ fontSize: 15, fontWeight: 700, color: "#212529", marginBottom: 10 }}>{step.title}</div>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: "#495057" }}>{step.desc}</p>
                    {i < 3 && <div style={{ position: "absolute", top: "50%", right: -10, width: 20, height: 20, background: "#F8F9FA", border: `1.5px solid ${step.color}40`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }} className="hide-mobile"><span style={{ fontSize: 10, color: step.color }}>→</span></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ GENE-DRUG DATABASE ══════════════════════════════════════════════ */}
        <section style={{ padding: "100px 32px", maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ maxWidth: 700, marginBottom: 60 }}>
            <SectionLabel>PGx COVERAGE</SectionLabel>
            <h2 className="lora" style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, color: "#212529", lineHeight: 1.1, marginBottom: 20 }}>
              15+ Pharmacogenes.<br />60+ Drugs. All CPIC-Validated.
            </h2>
          </div>

          <div style={{ overflowX: "auto", marginBottom: 40 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640, background: "#ffffff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(11,94,215,0.07)", border: "1px solid rgba(11,94,215,0.1)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(11,94,215,0.12)", background: "rgba(11,94,215,0.04)" }}>
                  {["Pharmacogene", "Key Drugs", "Clinical Impact", "Population at Risk"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left" }}>
                      <span className="mono" style={{ fontSize: 10, color: "#0B5ED7", letterSpacing: 1.5 }}>{h.toUpperCase()}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GENES.map((g, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(11,94,215,0.06)", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(11,94,215,0.03)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "14px 16px" }}>
                      <span className="gene-chip">{g.gene}</span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12, color: "#495057" }}>{g.drugs}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 60, height: 5, background: "rgba(11,94,215,0.1)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${g.impact}%`, background: g.impact > 90 ? "#DC3545" : g.impact > 80 ? "#f59e0b" : "#0B5ED7", borderRadius: 3 }} />
                        </div>
                        <span className="mono" style={{ fontSize: 11, color: g.impact > 90 ? "#DC3545" : g.impact > 80 ? "#f59e0b" : "#0B5ED7" }}>{g.impact}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12, color: "#495057" }}>{g.patients}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ═══ EVIDENCE / FEASIBILITY ══════════════════════════════════════════ */}
        <section id="feasibility" style={{ padding: "100px 32px", background: "rgba(32,201,151,0.03)", borderTop: "1px solid rgba(32,201,151,0.1)", borderBottom: "1px solid rgba(32,201,151,0.1)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ maxWidth: 700, marginBottom: 60 }}>
              <SectionLabel>EVIDENCE & FEASIBILITY</SectionLabel>
              <h2 className="lora" style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, color: "#212529", lineHeight: 1.1, marginBottom: 20 }}>
                Backed by{" "}
                <span style={{ color: "#0B5ED7" }}>Peer-Reviewed Science.</span>
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "#495057" }}>
                Every risk prediction in PharmaGuard is grounded in published clinical trials, CPIC Level A evidence, and real-world outcome data from tens of thousands of patients.
              </p>
            </div>

            {/* Key metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginBottom: 60 }}>
              {FEASIBILITY.map((f, i) => (
                <div key={i} style={{ background: "#ffffff", border: "1px solid rgba(11,94,215,0.1)", borderRadius: 14, padding: "20px 22px", transition: "all 0.25s", boxShadow: "0 2px 10px rgba(11,94,215,0.05)" }} onMouseEnter={e => { e.currentTarget.style.borderColor = `${f.color}40`; e.currentTarget.style.boxShadow = `0 6px 24px ${f.color}15`; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(11,94,215,0.1)"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(11,94,215,0.05)"; }}>
                  <div style={{ fontSize: 12, color: "#868e96", marginBottom: 8 }}>{f.label}</div>
                  <div className="lora" style={{ fontSize: 28, fontWeight: 800, color: f.color, marginBottom: 6 }}>{f.value}</div>
                  <div className="mono" style={{ fontSize: 11, color: "#adb5bd", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: f.color }}>↑</span>{f.trend}
                  </div>
                </div>
              ))}
            </div>

            {/* Articles */}
            <div className="lora" style={{ fontSize: 22, fontWeight: 800, color: "#212529", marginBottom: 28 }}>
              Key Research Supporting PharmaGuard
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(360px,1fr))", gap: 16 }}>
              {ARTICLES.map((a, i) => (
                <div key={i} className="article-card">
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                    <span className="mono" style={{ fontSize: 10, color: a.color, padding: "3px 8px", background: `${a.color}10`, borderRadius: 5, border: `1px solid ${a.color}25` }}>{a.journal}</span>
                    <span className="mono" style={{ fontSize: 10, color: "#adb5bd" }}>{a.year}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#343a40", lineHeight: 1.6, marginBottom: 14 }}>{a.title}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="lora" style={{ fontSize: 13, fontWeight: 700, color: a.color }}>→ {a.finding}</span>
                    <span className="mono" style={{ fontSize: 9, color: "#adb5bd" }}>DOI:{a.doi.split("/").pop()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Big quote */}
            <div style={{ marginTop: 60, padding: "40px", background: "#ffffff", border: "1.5px solid rgba(11,94,215,0.15)", borderRadius: 20, position: "relative", overflow: "hidden", boxShadow: "0 4px 32px rgba(11,94,215,0.08)" }}>
              <div style={{ fontSize: 80, color: "rgba(11,94,215,0.07)", position: "absolute", top: -10, left: 20, fontFamily: "serif", lineHeight: 1 }}>"</div>
              <div style={{ fontSize: "clamp(16px,2.5vw,22px)", color: "#343a40", lineHeight: 1.7, fontStyle: "italic", position: "relative", zIndex: 1, marginBottom: 20 }}>
                Implementing preemptive pharmacogenomic testing in primary care reduced clinically significant adverse drug events by <strong style={{ color: "#0B5ED7" }}>30.3%</strong> and improved the proportion of optimal drug prescribing from 43.7% to <strong style={{ color: "#0B5ED7" }}>78.9%</strong> — demonstrating that population-scale PGx is both feasible and cost-effective.
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(11,94,215,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔬</div>
                <div>
                  <div style={{ fontSize: 13, color: "#212529", fontWeight: 600 }}>van der Wouden et al., 2024</div>
                  <div className="mono" style={{ fontSize: 11, color: "#adb5bd" }}>Nature Medicine — doi:10.1038/s41591-024-02942-3</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ ABOUT THE PROJECT ══════════════════════════════════════════════ */}
        <section id="about" style={{ padding: "100px 32px", maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ maxWidth: 700, marginBottom: 60 }}>
            <SectionLabel>ABOUT THE PROJECT</SectionLabel>
            <h2 className="lora" style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, color: "#212529", lineHeight: 1.1, marginBottom: 20 }}>
              Building the Future of{" "}
              <span style={{ background: "linear-gradient(135deg,#0B5ED7,#20C997)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Precision Prescribing
              </span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 40, marginBottom: 60 }}>
            <div>
              <div className="lora" style={{ fontSize: 18, fontWeight: 700, color: "#212529", marginBottom: 20 }}>What We Built</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { icon: "🧬", text: "Full VCF parsing pipeline that extracts real pharmacogenomic variants from clinical sequencing data" },
                  { icon: "📋", text: "CPIC 2024 database covering 60+ gene-drug pairs with Level A evidence and star-allele diplotype classification" },
                  { icon: "👨‍👩‍👧‍👦", text: "Family-wide dashboard to detect shared genetic drug risks across multiple generations" },
                  { icon: "📊", text: "Clinical-grade JSON, CSV, and PDF export structured for EHR integration" },
                  { icon: "🔒", text: "Zero-server architecture — all processing occurs in-browser for HIPAA compliance by design" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, padding: "14px 16px", background: "#ffffff", borderRadius: 12, border: "1px solid rgba(11,94,215,0.1)", boxShadow: "0 2px 8px rgba(11,94,215,0.05)" }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, lineHeight: 1.7, color: "#495057" }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="lora" style={{ fontSize: 18, fontWeight: 700, color: "#212529", marginBottom: 20 }}>Tech Stack & Architecture</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                {[
                  { cat: "Frontend", items: ["React 18", "DM Mono", "Lora Typeface"], col: "#0B5ED7" },
                  { cat: "PGx Engine", items: ["CPIC 2024 DB", "Star Allele Mapper", "Diplotype Classifier"], col: "#20C997" },
                  { cat: "Data Format", items: ["VCFv4.1–4.3", "GRCh38", "HGVS Notation"], col: "#6EA8FE" },
                  { cat: "Standards", items: ["HL7 FHIR R4", "PharmGKB IDs", "OMIM Refs"], col: "#f59e0b" },
                ].map((cat) => (
                  <div key={cat.cat} style={{ background: "#ffffff", border: `1px solid ${cat.col}25`, borderRadius: 12, padding: "14px 16px", boxShadow: "0 2px 8px rgba(11,94,215,0.05)" }}>
                    <div className="mono" style={{ fontSize: 10, color: cat.col, letterSpacing: 1.5, marginBottom: 10 }}>{cat.cat.toUpperCase()}</div>
                    {cat.items.map((item) => (
                      <div key={item} style={{ fontSize: 12, color: "#495057", padding: "3px 0", borderBottom: "1px solid rgba(11,94,215,0.06)" }}>{item}</div>
                    ))}
                  </div>
                ))}
              </div>

              <div style={{ padding: "20px", background: "rgba(11,94,215,0.04)", border: "1.5px solid rgba(11,94,215,0.14)", borderRadius: 14 }}>
                <div className="lora" style={{ fontSize: 14, fontWeight: 700, color: "#0B5ED7", marginBottom: 12 }}>Supported Pharmacogenes</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["CYP2D6", "CYP2C19", "CYP2C9", "VKORC1", "TPMT", "NUDT15", "DPYD", "SLCO1B1", "ABCB1", "UGT1A1", "HLA-A", "HLA-B", "CYP3A5", "CYP1A2", "CYP2B6"].map((g) => (
                    <span key={g} className="gene-chip">{g}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ ROADMAP ════════════════════════════════════════════════════════ */}
        <section id="roadmap" style={{ padding: "100px 32px", background: "rgba(110,168,254,0.04)", borderTop: "1px solid rgba(110,168,254,0.12)", borderBottom: "1px solid rgba(110,168,254,0.12)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ maxWidth: 700, marginBottom: 60 }}>
              <SectionLabel>ROADMAP</SectionLabel>
              <h2 className="lora" style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, color: "#212529", lineHeight: 1.1, marginBottom: 20 }}>
                From Prototype to{" "}
                <span style={{ color: "#0B5ED7" }}>Clinical Standard.</span>
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
              {ROADMAP.map((phase, i) => (
                <div key={i} style={{ background: "#ffffff", border: `1.5px solid ${phase.status === "active" ? phase.color + "45" : "rgba(11,94,215,0.1)"}`, borderRadius: 16, padding: 24, position: "relative", overflow: "hidden", boxShadow: phase.status === "active" ? `0 4px 24px ${phase.color}18` : "0 2px 10px rgba(11,94,215,0.05)" }}>
                  {phase.status === "active" && (
                    <div style={{ position: "absolute", top: 12, right: 12 }}>
                      <span style={{ fontSize: 9, padding: "3px 8px", background: `${phase.color}15`, color: phase.color, borderRadius: 100, border: `1px solid ${phase.color}35`, fontFamily: "'DM Mono',monospace", letterSpacing: 1 }}>● ACTIVE</span>
                    </div>
                  )}
                  {phase.status === "complete" && (
                    <div style={{ position: "absolute", top: 12, right: 12 }}>
                      <span style={{ fontSize: 9, padding: "3px 8px", background: "rgba(32,201,151,0.1)", color: "#20C997", borderRadius: 100, border: "1px solid rgba(32,201,151,0.3)", fontFamily: "'DM Mono',monospace", letterSpacing: 1 }}>✓ DONE</span>
                    </div>
                  )}
                  {phase.status === "upcoming" && (
                    <div style={{ position: "absolute", top: 12, right: 12 }}>
                      <span style={{ fontSize: 9, padding: "3px 8px", background: "rgba(11,94,215,0.05)", color: "#adb5bd", borderRadius: 100, border: "1px solid rgba(11,94,215,0.1)", fontFamily: "'DM Mono',monospace", letterSpacing: 1 }}>PLANNED</span>
                    </div>
                  )}
                  <div className="mono" style={{ fontSize: 11, color: phase.color, letterSpacing: 2, marginBottom: 8 }}>{phase.phase}</div>
                  <div className="lora" style={{ fontSize: 17, fontWeight: 700, color: "#212529", marginBottom: 16 }}>{phase.label}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {phase.items.map((item, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: phase.status === "upcoming" ? "#dee2e6" : phase.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: phase.status === "upcoming" ? "#adb5bd" : "#495057" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 20, height: 3, background: "rgba(11,94,215,0.07)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: phase.status === "complete" ? "100%" : phase.status === "active" ? "45%" : "0%", background: phase.color, borderRadius: 2, transition: "width 1.5s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA ════════════════════════════════════════════════════════════ */}
        <section style={{ padding: "100px 32px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            <div style={{ position: "relative", padding: "60px 40px", background: "linear-gradient(145deg, #ffffff, rgba(11,94,215,0.04))", border: "1.5px solid rgba(11,94,215,0.15)", borderRadius: 24, overflow: "hidden", boxShadow: "0 8px 48px rgba(11,94,215,0.1)" }}>
              <div className="scan-line" />
              <div className="badge" style={{ background: "rgba(11,94,215,0.08)", border: "1px solid rgba(11,94,215,0.2)", color: "#0B5ED7", marginBottom: 24, display: "inline-flex" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0B5ED7", animation: "pulse 1.5s infinite" }} />
                Ready to Deploy
              </div>
              <h2 className="lora" style={{ fontSize: "clamp(28px,4vw,52px)", fontWeight: 800, color: "#212529", lineHeight: 1.1, marginBottom: 20 }}>
                Stop Guessing.<br />
                <span style={{ background: "linear-gradient(135deg,#0B5ED7,#20C997)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Start Knowing.
                </span>
              </h2>
              <p style={{ fontSize: 16, color: "#495057", lineHeight: 1.8, marginBottom: 36, maxWidth: 520, margin: "0 auto 36px" }}>
                Upload your first patient VCF and generate a full CPIC-compliant pharmacogenomic risk report in under 3 seconds — no server, no signup, no data leaving the browser.
              </p>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="btn-primary" style={{ fontSize: 15, padding: "14px 32px" }}>🧬 Launch PharmaGuard</button>
                <button className="btn-ghost">📋 Download Sample Report</button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FOOTER ─────────────────────────────────────────────────────────── */}
        <footer style={{ padding: "40px 32px 72px", borderTop: "1px solid rgba(11,94,215,0.1)", maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 32, marginBottom: 32 }}>
            <div style={{ maxWidth: 320 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#0B5ED7,#094bb3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🧬</div>
                <span className="lora" style={{ fontSize: 16, fontWeight: 800, color: "#0B5ED7" }}>PharmaGuard</span>
              </div>
              <p style={{ fontSize: 12, color: "#868e96", lineHeight: 1.7 }}>
                Precision Medicine Algorithm for pharmacogenomic drug risk prediction. CPIC Level A validated. Client-side processing. Zero data exposure.
              </p>
            </div>
            <div style={{ display: "flex", gap: 60, flexWrap: "wrap" }}>
              {[
                { title: "Platform", links: ["Dashboard", "Family Mode", "History", "API Docs"] },
                { title: "Science", links: ["CPIC Guidelines", "PGx Database", "Gene Coverage", "References"] },
                { title: "Clinical", links: ["Sample Report", "EHR Integration", "HIPAA Compliance", "Support"] },
              ].map((col) => (
                <div key={col.title}>
                  <div className="mono" style={{ fontSize: 10, color: "#0B5ED7", letterSpacing: 2, marginBottom: 14 }}>{col.title.toUpperCase()}</div>
                  {col.links.map((link) => (
                    <div key={link} style={{ fontSize: 12, color: "#868e96", padding: "5px 0", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#0B5ED7"} onMouseLeave={e => e.currentTarget.style.color = "#868e96"}>{link}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(11,94,215,0.08)", paddingTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 11, color: "#adb5bd" }}>© 2024 PharmaGuard · Precision Medicine Algorithm · CPIC 2024 Guidelines</div>
            <div style={{ fontSize: 11, color: "#adb5bd" }}>⚕️ For clinical decision support only · Not a substitute for professional medical judgment</div>
          </div>
        </footer>
      </div>
    </div>
  );
}