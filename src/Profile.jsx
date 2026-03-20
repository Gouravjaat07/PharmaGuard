import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

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

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
const Icon = {
  Dna: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/><path d="M2 9c6.667 6 13.333 0 20 6"/><path d="M2 12h.01"/><path d="M22 12h.01"/><path d="M12 2h.01"/><path d="M12 22h.01"/>
    </svg>
  ),
  Shield: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Users: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  FlaskConical: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2v7.527a2 2 0 01-.211.896L4.72 20.55a1 1 0 00.9 1.45h12.76a1 1 0 00.9-1.45l-5.069-10.127A2 2 0 0114 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>
    </svg>
  ),
  BarChart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  ),
  Download: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Lock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  ),
  Zap: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  FileText: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Pill: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 20H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v7"/><path d="M16 19h6"/><path d="M19 16v6"/>
    </svg>
  ),
  Settings: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  MapPin: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  CreditCard: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  UserCheck: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>
    </svg>
  ),
  Ambulance: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 10H6"/><path d="M14 18V6a2 2 0 00-2-2H4a2 2 0 00-2 2v11a1 1 0 001 1h2"/><path d="M19 18h2a1 1 0 001-1v-3.65a1 1 0 00-.22-.624l-3.48-4.35A1 1 0 0017.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>
    </svg>
  ),
  Microscope: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 100-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 010-4h2.5"/><path d="M12 10V4"/>
    </svg>
  ),
  Star: ({ filled }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Upload: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
    </svg>
  ),
  ClipboardList: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="15" y2="16"/>
    </svg>
  ),
  Activity: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Building: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="12"/><line x1="15" y1="22" x2="15" y2="12"/><line x1="4" y1="7" x2="20" y2="7"/>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Json: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7V4a2 2 0 012-2h8.5L20 7.5V20a2 2 0 01-2 2h-6"/><polyline points="14 2 14 8 20 8"/><path d="M4 12.5c1-.667 2-.667 3 0s2 .667 3 0"/><path d="M4 18.5c1-.667 2-.667 3 0s2 .667 3 0"/>
    </svg>
  ),
  Clipboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  ),
  Table: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
    </svg>
  ),
  Heart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  ),
  Scale: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Menu: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  X: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

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
    .icon-box { display:flex; align-items:center; justify-content:center; flex-shrink:0; }

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
function AnimatedStat({ value, suffix="", label, iconEl, color="#0B5ED7" }) {
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
      <div style={{ width:40, height:40, borderRadius:10, background:`${color}12`, border:`1.5px solid ${color}20`, display:"flex", alignItems:"center", justifyContent:"center", color, margin:"0 auto 12px" }}>
        {iconEl}
      </div>
      <div className="syne count-anim" style={{ fontSize:32, fontWeight:800, color, marginBottom:4 }}>
        {displayed.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize:12, color:"#6c757d", fontWeight:500, lineHeight:1.4 }}>{label}</div>
    </div>
  );
}

// ─── FEATURE CARD ─────────────────────────────────────────────────────────────
function FeatureCard({ iconEl, title, desc, badge, accentColor="#0B5ED7", delay=0 }) {
  return (
    <div className="feature-card fade-up" style={{ "--accent":`linear-gradient(90deg,${accentColor},${accentColor}80)`, animationDelay:`${delay}s` }}>
      <div style={{ width:42, height:42, borderRadius:11, background:`${accentColor}10`, border:`1.5px solid ${accentColor}22`, display:"flex", alignItems:"center", justifyContent:"center", color:accentColor, marginBottom:14 }}>
        {iconEl}
      </div>
      {badge && <span className="pg-badge mono" style={{ background:`${accentColor}12`, color:accentColor, border:`1px solid ${accentColor}30`, fontSize:10, marginBottom:10, display:"inline-flex" }}>{badge}</span>}
      <div className="syne" style={{ fontSize:15, fontWeight:700, color:"#212529", marginBottom:8 }}>{title}</div>
      <div style={{ fontSize:13, color:"#6c757d", lineHeight:1.7 }}>{desc}</div>
    </div>
  );
}

// ─── WORKFLOW STEP ────────────────────────────────────────────────────────────
function WorkflowStep({ num, iconEl, title, desc, color, delay=0 }) {
  return (
    <div className="step-card fade-up" style={{ animationDelay:`${delay}s` }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:`${color}10`, border:`1.5px solid ${color}25`, display:"flex", alignItems:"center", justifyContent:"center", color, flexShrink:0 }}>{iconEl}</div>
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
function RiskPill({ label, color, bg, border, iconEl }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", background:bg, border:`1.5px solid ${border}`, borderRadius:12 }}>
      <div style={{ color, flexShrink:0 }}>{iconEl}</div>
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
                <div style={{ fontSize:11, color:"#6c757d", marginTop:4, display:"flex", alignItems:"center", gap:5 }}>
                  <Icon.Calendar />{h.date} · {h.sampleCount} variants analyzed
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <span className="pg-badge" style={{ background:"rgba(139,47,47,0.1)", color:"#8B2F2F", border:"1px solid rgba(139,47,47,0.25)", fontSize:11, display:"flex", alignItems:"center", gap:5 }}>
                  <Icon.AlertTriangle /> {h.highRiskCount} Toxic Risk
                </span>
                <button className="pg-btn pg-btn-primary" style={{ fontSize:12, gap:6 }}><Icon.BarChart /> View Report</button>
                <button className="pg-btn pg-btn-ghost" style={{ fontSize:12, gap:6 }}><Icon.Download /> Download</button>
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
  const aboutFeatures = [
    { iconEl:<Icon.Dna />, color:"#0B5ED7", title:"PGx Analysis", desc:"CPIC Level A pharmacogenomic variant detection across 50+ drugs" },
    { iconEl:<Icon.Shield />, color:"#20C997", title:"Risk Detection", desc:"Real-time toxicity and efficacy risk scoring with confidence intervals" },
    { iconEl:<Icon.Pill />, color:"#6EA8FE", title:"Drug Guidance", desc:"Evidence-based dosage & clinically validated alternatives" },
    { iconEl:<Icon.ClipboardList />, color:"#f59e0b", title:"Clinical Reports", desc:"Export-ready JSON, CSV, and printable PDF clinical summaries" },
    { iconEl:<Icon.Lock />, color:"#495057", title:"HIPAA Ready", desc:"Local processing — your genomic data never leaves your browser" },
    { iconEl:<Icon.Zap />, color:"#EB3434", title:"Real-time", desc:"Sub-3 second pharmacogenomic analysis with CPIC pipeline" },
  ];
  return (
    <div style={{ padding:"30px 22px", maxWidth:820, margin:"0 auto" }}>
      <div className="pg-card" style={{ textAlign:"center", padding:44, marginBottom:22 }}>
        <div style={{ width:64, height:64, borderRadius:16, background:"linear-gradient(135deg,#0B5ED7,#094bb3)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", margin:"0 auto 16px", boxShadow:"0 8px 24px rgba(11,94,215,0.25)" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/><path d="M2 9c6.667 6 13.333 0 20 6"/>
          </svg>
        </div>
        <div className="fraunces" style={{ fontSize:34, fontWeight:900, marginBottom:10, color:"#212529" }}>PharmaGuard</div>
        <div style={{ color:"#6c757d", fontSize:14, lineHeight:1.8, maxWidth:540, margin:"0 auto" }}>
          Clinical-grade pharmacogenomic analysis platform powered by CPIC guidelines. Upload patient VCF files to predict drug response, detect toxicity risks, and optimize therapeutic decisions with evidence-based precision.
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14, marginBottom:22 }}>
        {aboutFeatures.map(f => (
          <div key={f.title} className="pg-card">
            <div style={{ width:36, height:36, borderRadius:9, background:`${f.color}10`, border:`1.5px solid ${f.color}22`, display:"flex", alignItems:"center", justifyContent:"center", color:f.color, marginBottom:10 }}>{f.iconEl}</div>
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

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
function Sidebar({ open, onClose, onNavigate }) {
  if (!open) return null;
  const sidebarStats = [
    { iconEl:<Icon.BarChart />, l:"Analyses Completed", v:"247" },
    { iconEl:<Icon.Dna />, l:"PGx Reports", v:"184" },
    { iconEl:<Icon.Users />, l:"Family Members", v:"6" },
    { iconEl:<Icon.TrendingUp />, l:"Accuracy Score", v:"98.2%" },
  ];
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
          <button className="pg-btn pg-btn-ghost" onClick={onClose} style={{ padding:"5px 9px" }}><Icon.X /></button>
        </div>
        <div style={{ textAlign:"center", marginBottom:22 }}>
          <div style={{ width:76, height:76, borderRadius:"50%", background:"linear-gradient(135deg,#0B5ED7,#20C997)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:800, color:"#fff", margin:"0 auto 10px" }}>DR</div>
          <div className="syne" style={{ fontSize:16, fontWeight:700, color:"#212529" }}>Dr. Emily Roberts</div>
          <div style={{ fontSize:12, color:"#8fa3b8", marginBottom:7 }}>Clinical Pharmacogenomics</div>
          <span className="pg-badge" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.2)", display:"inline-flex", alignItems:"center", gap:5 }}>
            <Icon.Building /> Mount Sinai Hospital
          </span>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {sidebarStats.map(s => (
            <div key={s.l} className="pg-card" style={{ padding:"11px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:12, color:"#495057", display:"flex", alignItems:"center", gap:7 }}><span style={{ color:"#0B5ED7" }}>{s.iconEl}</span>{s.l}</span>
              <span style={{ fontSize:12, fontWeight:700, color:"#212529" }}>{s.v}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop:16 }}>
          <button className="pg-btn pg-btn-family" style={{ width:"100%", justifyContent:"center", marginBottom:8, gap:8 }}
            onClick={() => { onClose(); onNavigate(null, "/family-section"); }}>
            <Icon.Users /> Go to Family Dashboard
          </button>
          <button className="pg-btn pg-btn-ghost" style={{ width:"100%", justifyContent:"center", gap:8 }}><Icon.Settings /> Settings</button>
        </div>
      </div>
    </>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ProfilePage() {
  useEffect(() => { injectStyles(); }, []);
  const navigate = useNavigate();

  const [page, setPage] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("features");

  const handleNavigation = (pageKey, path) => {
    if (pageKey) {
      setPage(pageKey);
    } else if (path) {
      navigate(path);
    }
  };

  const GENES = ["CYP2D6","CYP2C19","CYP2C9","VKORC1","TPMT","DPYD","SLCO1B1","ABCB1","UGT1A1","HLA-A","HLA-B","NUDT15","CYP3A5","CYP1A2","CYP2B6"];

  const WORKFLOW = [
    { num:1, iconEl:<Icon.Upload />, title:"Upload Patient VCF", color:"#0B5ED7", desc:"Drag and drop a .vcf genome file. Our real-time VCF parser instantly extracts variants, PGx genes, and quality metrics — no manual preprocessing needed." },
    { num:2, iconEl:<Icon.Pill />, title:"Select Drugs to Analyse", color:"#6EA8FE", desc:"Choose from 65+ medications across oncology, cardiology, psychiatry, pain management, and immunology. Search by name or browse by category." },
    { num:3, iconEl:<Icon.Microscope />, title:"Run PGx Analysis", color:"#20C997", desc:"Our CPIC-guided pipeline maps allele variants to diplotypes, predicts metaboliser phenotype, and generates evidence-based risk predictions in seconds." },
    { num:4, iconEl:<Icon.ClipboardList />, title:"Review Clinical Report", color:"#f59e0b", desc:"View drug-specific risk cards with confidence scores, gene impact, and dosage guidance. Drill into mechanism, detected variants, and references." },
    { num:5, iconEl:<Icon.Download />, title:"Export & Integrate", color:"#EB3434", desc:"Download structured JSON, CSV, or print a full clinical PDF ready for EHR integration, prescription review, or patient counselling." },
  ];

  const FEATURES = [
    { iconEl:<Icon.Dna />, title:"Real VCF Parsing", badge:"Core Feature", accentColor:"#0B5ED7", desc:"Genuine VCF file parsing — not mocked data. Reads chromosomal positions, rsIDs, quality scores, FORMAT fields, and sample genotypes directly from your uploaded file." },
    { iconEl:<Icon.Shield />, title:"CPIC Level A Guidelines", badge:"Evidence-Based", accentColor:"#20C997", desc:"All recommendations are anchored to CPIC 2024 guidelines — the gold standard for PGx clinical decision support." },
    { iconEl:<Icon.Users />, title:"Family Mode", badge:"Multi-Member", accentColor:"#6EA8FE", desc:"Upload and analyse VCF files for multiple family members in a single session. Compare risk profiles and identify hereditary pharmacogenomic patterns." },
    { iconEl:<Icon.Building />, title:"Lab Booking", badge:"Home Visit", accentColor:"#f59e0b", desc:"Book a certified lab technician for at-home sample collection with real calendar scheduling and order tracking." },
    { iconEl:<Icon.BarChart />, title:"Quality Metrics", badge:"Transparency", accentColor:"#8B2F2F", desc:"Every report includes VCF quality score, variant confidence, annotation coverage, and per-gene impact scores." },
    { iconEl:<Icon.Lock />, title:"HIPAA-Ready & Local", badge:"Privacy First", accentColor:"#495057", desc:"All VCF parsing runs entirely in the browser. Your genomic data never leaves your device. No server upload, no data retention." },
  ];

  const TEAM = [
    { initials:"RS", name:"Dr. Riya Sharma", role:"Senior PGx Specialist", exp:"8 yrs", rating:4.9, badge:"Top Rated", color:"#0B5ED7" },
    { initials:"RM", name:"Rahul Mehta", role:"Phlebotomy Expert", exp:"5 yrs", rating:4.7, badge:"Verified", color:"#20C997" },
    { initials:"PN", name:"Priya Nair", role:"Lab Scientist · PGx", exp:"10 yrs", rating:4.9, badge:"PGx Expert", color:"#6EA8FE" },
    { initials:"AK", name:"Arjun Kapoor", role:"Lab Scientist", exp:"6 yrs", rating:4.6, badge:"Verified", color:"#f59e0b" },
  ];

  // ─── (Footer removed — use shared Footer component) ──────────────────────

  return (
    <div style={{ minHeight:"100vh", background:"#F8F9FA", color:"#212529" }}>
      {/* Background */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", backgroundImage:"linear-gradient(rgba(11,94,215,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(11,94,215,0.025) 1px,transparent 1px)", backgroundSize:"44px 44px" }} />
      <div style={{ position:"fixed", top:"-15%", right:"-5%", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(11,94,215,0.06),transparent 70%)", zIndex:0, pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:"-10%", left:"-5%", width:420, height:420, borderRadius:"50%", background:"radial-gradient(circle,rgba(32,201,151,0.05),transparent 70%)", zIndex:0, pointerEvents:"none" }} />

      <div style={{ position:"relative", zIndex:1 }}>

        {/* ─── NAVBAR ──────────────────────────────────────────────────────── */}
        <Navbar
          page={page}
          step={0}
          totalPrice={0}
          onNavClick={(item) => {
            if (item.key === "history" || item.key === "about" || item.key === "profile") {
              setPage(item.key);
            } else {
              navigate(item.path);
            }
          }}
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
              <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:60, alignItems:"center" }}>
                {/* Left: text */}
                <div>
                  <div style={{ marginBottom:18 }}>
                    <span className="pg-badge mono fade-up" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1.5px solid rgba(11,94,215,0.2)", padding:"5px 14px" }}>
                      CPIC Level A · 2024 Guidelines · 15 Pharmacogenes
                    </span>
                  </div>
                  <h1 className="fraunces fade-up" style={{ fontSize:"clamp(32px,5vw,58px)", fontWeight:900, lineHeight:1.05, color:"#212529", marginBottom:18, animationDelay:"0.05s" }}>
                    Precision Medicine<br /><span className="gradient-text">Starts With Genetics</span>
                  </h1>
                  <p className="fade-up" style={{ fontSize:16, color:"#495057", lineHeight:1.8, maxWidth:520, marginBottom:32, animationDelay:"0.12s" }}>
                    PharmaGuard is a clinical-grade pharmacogenomics platform that analyses patient VCF files, predicts drug toxicity and efficacy risks, and generates CPIC-compliant clinical reports — entirely in the browser.
                  </p>
                  <div className="fade-up" style={{ display:"flex", gap:12, flexWrap:"wrap", animationDelay:"0.18s" }}>
                    <button className="pg-btn pg-btn-primary" style={{ fontSize:14, padding:"12px 26px", gap:8 }} onClick={() => navigate("/analysis")}>
                      <Icon.Microscope /> Run Analysis
                    </button>
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

                {/* Right: PharmaGuard card */}
                <div className="hide-mobile fade-up" style={{ animationDelay:"0.15s", flexShrink:0, width:220 }}>
                  <div style={{
                    background:"#fff",
                    border:"1.5px solid rgba(11,94,215,0.13)",
                    borderRadius:22,
                    padding:"28px 22px 24px",
                    textAlign:"center",
                    boxShadow:"0 12px 40px rgba(11,94,215,0.12)",
                  }}>
                    {/* Logo icon */}
                    <div style={{ width:56, height:56, borderRadius:14, background:"linear-gradient(135deg,#0B5ED7,#094bb3)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", margin:"0 auto 14px", boxShadow:"0 6px 18px rgba(11,94,215,0.28)" }}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/><path d="M2 9c6.667 6 13.333 0 20 6"/>
                      </svg>
                    </div>
                    <div className="fraunces" style={{ fontSize:17, fontWeight:800, color:"#212529", marginBottom:8 }}>PharmaGuard</div>
                    <span className="pg-badge mono" style={{ background:"rgba(32,201,151,0.1)", color:"#20C997", border:"1px solid rgba(32,201,151,0.28)", fontSize:10, marginBottom:18, display:"inline-flex" }}>
                      Analysis Ready
                    </span>
                    {/* Progress bars */}
                    <div style={{ marginTop:4 }}>
                      <MiniBar label="CYP2D6" value={94} color="#0B5ED7" />
                      <MiniBar label="TPMT" value={99} color="#EB3434" />
                      <MiniBar label="DPYD" value={77} color="#f59e0b" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ─── STATS ─────────────────────────────────────────────────── */}
            <section style={{ padding:"0 24px 40px", maxWidth:1100, margin:"0 auto" }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14 }}>
                <AnimatedStat value="247" iconEl={<Icon.BarChart />} label="Analyses Completed" color="#0B5ED7" />
                <AnimatedStat value="184" iconEl={<Icon.Dna />} label="PGx Reports Generated" color="#20C997" />
                <AnimatedStat value="65" iconEl={<Icon.Pill />} suffix="+" label="Drugs in Database" color="#6EA8FE" />
                <AnimatedStat value="98" iconEl={<Icon.TrendingUp />} suffix="%" label="Report Accuracy Score" color="#f59e0b" />
                <AnimatedStat value="15" iconEl={<Icon.Microscope />} label="Pharmacogenes Covered" color="#EB3434" />
              </div>
            </section>

            {/* ─── TABS ──────────────────────────────────────────────────── */}
            <section style={{ padding:"0 24px 48px", maxWidth:1100, margin:"0 auto" }}>
              <div style={{ textAlign:"center", marginBottom:28 }}>
                <div className="pg-badge mono fade-up" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.2)", marginBottom:14, display:"inline-flex" }}>PLATFORM OVERVIEW</div>
                <h2 className="fraunces fade-up" style={{ fontSize:"clamp(24px,4vw,38px)", fontWeight:900, color:"#212529", marginBottom:12, animationDelay:"0.05s" }}>
                  Everything You Need for<br /><span className="gradient-text">Clinical PGx Decision Support</span>
                </h2>
                <p className="fade-up" style={{ fontSize:14, color:"#6c757d", maxWidth:520, margin:"0 auto", lineHeight:1.8, animationDelay:"0.1s" }}>
                  From raw genomic data to actionable clinical guidance — PharmaGuard handles the full pipeline.
                </p>
              </div>

              <div style={{ display:"flex", justifyContent:"center", gap:4, marginBottom:36, background:"rgba(11,94,215,0.04)", borderRadius:11, padding:5, width:"fit-content", margin:"0 auto 36px" }}>
                {[{id:"features",label:"Features"},{id:"workflow",label:"How It Works"},{id:"genes",label:"Pharmacogenes"},{id:"team",label:"Our Team"}].map(t => (
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
                  <div className="pg-card fade-up" style={{ background:"rgba(245,158,11,0.03)", border:"1.5px solid rgba(245,158,11,0.18)", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap", animationDelay:"0.4s" }}>
                    <div style={{ width:44, height:44, borderRadius:11, background:"rgba(245,158,11,0.1)", border:"1.5px solid rgba(245,158,11,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:"#b45309", flexShrink:0 }}>
                      <Icon.AlertTriangle />
                    </div>
                    <div style={{ flex:1 }}>
                      <div className="syne" style={{ fontSize:14, fontWeight:700, color:"#212529", marginBottom:4 }}>Clinical Alert System</div>
                      <div style={{ fontSize:13, color:"#6c757d", lineHeight:1.6 }}>When toxic risk drugs are detected, PharmaGuard automatically surfaces a critical alert banner. e.g. <strong style={{ color:"#8B2F2F" }}>CODEINE + CYP2D6 URM → Toxic Risk</strong>.</div>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginTop:20 }}>
                    <RiskPill label="Toxic" color="#8B2F2F" bg="rgba(139,47,47,0.08)" border="rgba(139,47,47,0.25)" iconEl={<Icon.AlertTriangle />} />
                    <RiskPill label="Adjust Dosage" color="#b45309" bg="rgba(245,158,11,0.08)" border="rgba(245,158,11,0.28)" iconEl={<Icon.Scale />} />
                    <RiskPill label="Ineffective" color="#c0392b" bg="rgba(240,84,68,0.08)" border="rgba(240,84,68,0.28)" iconEl={<Icon.Shield />} />
                    <RiskPill label="Safe" color="#17a880" bg="rgba(32,201,151,0.08)" border="rgba(32,201,151,0.25)" iconEl={<Icon.CheckCircle />} />
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
                      {gene:"CYP2D6", iconEl:<Icon.Pill />, color:"#0B5ED7", drugs:"Codeine, Tramadol, Tamoxifen, Metoprolol", desc:"The most clinically significant pharmacogene. Metabolises ~25% of all prescribed drugs. URM status creates opioid toxicity risk."},
                      {gene:"CYP2C19", iconEl:<Icon.Heart />, color:"#20C997", drugs:"Clopidogrel, Voriconazole, Citalopram", desc:"Critical for antiplatelet therapy. PM status renders clopidogrel ineffective — alternative antiplatelet agents must be prescribed."},
                      {gene:"TPMT + NUDT15", iconEl:<Icon.Dna />, color:"#EB3434", drugs:"Azathioprine, Mercaptopurine", desc:"Deficiency causes life-threatening myelosuppression with standard thiopurine doses. Dose reduction of 85-90% mandatory in PM."},
                      {gene:"DPYD", iconEl:<Icon.Microscope />, color:"#f59e0b", drugs:"Fluorouracil, Capecitabine", desc:"Intermediate or poor DPYD metabolisers face severe toxicity from fluoropyrimidines. FDA recommends DPYD screening before initiating therapy."},
                      {gene:"SLCO1B1", iconEl:<Icon.BarChart />, color:"#6EA8FE", drugs:"Simvastatin, Lovastatin, Atorvastatin", desc:"Impaired hepatic uptake transporter causes statin accumulation in plasma, dramatically increasing myopathy and rhabdomyolysis risk."},
                      {gene:"VKORC1 + CYP2C9", iconEl:<Icon.Scale />, color:"#8B2F2F", drugs:"Warfarin, Phenytoin", desc:"Combined variation requires warfarin dose reductions of 25-50%. Without adjustment, severe over-anticoagulation and bleeding risk."},
                    ].map((g,i) => (
                      <div key={g.gene} className="feature-card fade-up" style={{ "--accent":`linear-gradient(90deg,${g.color},${g.color}60)`, animationDelay:`${i*0.07}s` }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                          <div style={{ width:36, height:36, borderRadius:9, background:`${g.color}12`, border:`1.5px solid ${g.color}25`, display:"flex", alignItems:"center", justifyContent:"center", color:g.color }}>{g.iconEl}</div>
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
                        <div style={{ width:68, height:68, borderRadius:"50%", margin:"0 auto 14px", background:`linear-gradient(135deg,${m.color},${m.color}aa)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700, color:"#fff", letterSpacing:0.5 }}>{m.initials}</div>
                        <div className="syne" style={{ fontSize:15, fontWeight:700, color:"#212529", marginBottom:4 }}>{m.name}</div>
                        <div style={{ fontSize:12, color:"#6c757d", marginBottom:10 }}>{m.role} · {m.exp} exp</div>
                        <span className="pg-badge" style={{ background:`${m.color}12`, color:m.color, border:`1px solid ${m.color}30`, fontSize:10, marginBottom:10 }}>{m.badge}</span>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:3, marginTop:8 }}>
                          {[1,2,3,4,5].map(s => (
                            <span key={s} style={{ color:s<=Math.round(m.rating)?"#f59e0b":"#dee2e6" }}>
                              <Icon.Star filled={s<=Math.round(m.rating)} />
                            </span>
                          ))}
                          <span style={{ fontSize:11, color:"#6c757d", marginLeft:4 }}>{m.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pg-card fade-up" style={{ background:"linear-gradient(135deg,rgba(11,94,215,0.04),rgba(32,201,151,0.03))", border:"1.5px solid rgba(11,94,215,0.14)", textAlign:"center", padding:"36px 24px", animationDelay:"0.3s" }}>
                    <div style={{ width:56, height:56, borderRadius:14, background:"rgba(11,94,215,0.08)", border:"1.5px solid rgba(11,94,215,0.18)", display:"flex", alignItems:"center", justifyContent:"center", color:"#0B5ED7", margin:"0 auto 14px" }}>
                      <Icon.Building />
                    </div>
                    <div className="fraunces" style={{ fontSize:22, fontWeight:800, color:"#212529", marginBottom:10 }}>Join Our Clinical Network</div>
                    <div style={{ fontSize:14, color:"#6c757d", maxWidth:440, margin:"0 auto 22px", lineHeight:1.7 }}>Are you a lab technician, clinical pharmacologist, or PGx specialist? Join PharmaGuard's verified clinician network.</div>
                    <button className="pg-btn pg-btn-primary" style={{ fontSize:14, padding:"12px 28px" }}>Apply to Join Network</button>
                  </div>
                </div>
              )}
            </section>


            {/* ─── FAMILY MODE ─────────────────────────────────────────────── */}
            <section style={{ background:"rgba(11,94,215,0.03)", borderTop:"1.5px solid rgba(11,94,215,0.09)", borderBottom:"1.5px solid rgba(11,94,215,0.09)", padding:"44px 24px" }}>
              <div style={{ maxWidth:1100, margin:"0 auto" }}>
                <div style={{ textAlign:"center", marginBottom:28 }}>
                  <div className="pg-badge mono fade-up" style={{ background:"rgba(110,168,254,0.12)", color:"#6EA8FE", border:"1px solid rgba(110,168,254,0.3)", marginBottom:14, display:"inline-flex" }}>FAMILY MODE</div>
                  <h2 className="fraunces fade-up" style={{ fontSize:"clamp(22px,3.5vw,34px)", fontWeight:900, color:"#212529", marginBottom:10, animationDelay:"0.05s" }}>Whole-Family Pharmacogenomics</h2>
                  <p className="fade-up" style={{ fontSize:14, color:"#6c757d", maxWidth:480, margin:"0 auto", lineHeight:1.8, animationDelay:"0.1s" }}>Analyse genomic data for every family member in a single unified session.</p>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 }}>
                  {[
                    {iconEl:<Icon.Plus />, color:"#0B5ED7", title:"Add Family Members", desc:"Create profiles for each family member with name, relation, age, and health conditions."},
                    {iconEl:<Icon.Upload />, color:"#6EA8FE", title:"Upload Per-Member VCF", desc:"Each member gets their own VCF upload zone with individual quality metrics."},
                    {iconEl:<Icon.Pill />, color:"#20C997", title:"Select Drugs Per Member", desc:"Customise drug lists per member based on their prescription history."},
                    {iconEl:<Icon.Microscope />, color:"#f59e0b", title:"Run Batch Analysis", desc:"All members analysed simultaneously with results displayed side-by-side."},
                    {iconEl:<Icon.ClipboardList />, color:"#EB3434", title:"Comparative Reports", desc:"Export family-wide reports with shared risk patterns highlighted."},
                  ].map((s,i) => (
                    <div key={s.title} className="step-card fade-up" style={{ animationDelay:`${i*0.07}s` }}>
                      <div style={{ width:40, height:40, borderRadius:10, marginBottom:12, background:`${s.color}10`, border:`1.5px solid ${s.color}25`, display:"flex", alignItems:"center", justifyContent:"center", color:s.color }}>{s.iconEl}</div>
                      <div className="syne" style={{ fontSize:13, fontWeight:700, color:"#212529", marginBottom:7 }}>{s.title}</div>
                      <div style={{ fontSize:12, color:"#6c757d", lineHeight:1.7 }}>{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ─── LAB BOOKING ─────────────────────────────────────────────── */}
            <section style={{ padding:"44px 24px 52px", maxWidth:1100, margin:"0 auto" }}>
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
                      {iconEl:<Icon.Calendar />, text:"Real-time calendar with available time slots"},
                      {iconEl:<Icon.UserCheck />, text:"Verified, rated lab technicians and PGx specialists"},
                      {iconEl:<Icon.Ambulance />, text:"24/7 urgent booking with 45-minute ETA"},
                      {iconEl:<Icon.CreditCard />, text:"Card, UPI, net banking, or cash on visit"},
                      {iconEl:<Icon.MapPin />, text:"Live technician tracking on order confirmation"},
                    ].map(f => (
                      <div key={f.text} style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ width:32, height:32, borderRadius:8, flexShrink:0, background:"rgba(32,201,151,0.1)", border:"1.5px solid rgba(32,201,151,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#20C997" }}>{f.iconEl}</div>
                        <span style={{ fontSize:13, color:"#495057" }}>{f.text}</span>
                      </div>
                    ))}
                  </div>
                  <button className="pg-btn pg-btn-teal fade-up" style={{ marginTop:24, fontSize:14, animationDelay:"0.2s", gap:8 }} onClick={() => navigate("/technician")}>
                    <Icon.Calendar /> Book a Technician
                  </button>
                </div>

                {/* Lab tests grid */}
                <div className="fade-up" style={{ animationDelay:"0.12s" }}>
                  <div className="pg-card" style={{ padding:0, overflow:"hidden" }}>
                    <div style={{ padding:"16px 18px", borderBottom:"1.5px solid rgba(11,94,215,0.08)", display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ color:"#0B5ED7" }}><Icon.FlaskConical /></div>
                      <div className="syne" style={{ fontSize:14, fontWeight:700, color:"#212529" }}>Available Tests</div>
                    </div>
                    <div style={{ padding:"10px 0" }}>
                      {[
                        {iconEl:<Icon.Activity />, name:"Complete Blood Count (CBC)", price:"₹299", tag:"Popular", tagColor:"#0B5ED7"},
                        {iconEl:<Icon.Heart />, name:"Liver Function Test (LFT)", price:"₹499", tag:"", tagColor:""},
                        {iconEl:<Icon.Dna />, name:"Thyroid Panel T3/T4/TSH", price:"₹599", tag:"", tagColor:""},
                        {iconEl:<Icon.Microscope />, name:"HbA1c — Diabetes Control", price:"₹349", tag:"Fast", tagColor:"#20C997"},
                        {iconEl:<Icon.Dna />, name:"PGx Pharmacogenomics Panel", price:"₹3,499", tag:"Featured", tagColor:"#6EA8FE"},
                        {iconEl:<Icon.Shield />, name:"COVID-19 RT-PCR", price:"₹799", tag:"", tagColor:""},
                      ].map((t,i) => (
                        <div key={t.name} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 18px", borderBottom:i<5?"1px solid rgba(11,94,215,0.06)":"none" }}>
                          <span style={{ color:"#6c757d" }}>{t.iconEl}</span>
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
            <section style={{ background:"rgba(11,94,215,0.03)", borderTop:"1.5px solid rgba(11,94,215,0.09)", padding:"44px 24px" }}>
              <div style={{ maxWidth:1100, margin:"0 auto", textAlign:"center" }}>
                <h2 className="fraunces fade-up" style={{ fontSize:"clamp(22px,3.5vw,34px)", fontWeight:900, color:"#212529", marginBottom:12 }}>Export-Ready Clinical Reports</h2>
                <p className="fade-up" style={{ fontSize:14, color:"#6c757d", maxWidth:480, margin:"0 auto 36px", lineHeight:1.8, animationDelay:"0.05s" }}>
                  Download structured data in multiple formats — ready for EHR integration, prescriber review, or patient records.
                </p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 }}>
                  {[
                    {iconEl:<Icon.FileText />, format:"Clinical PDF", desc:"Print-ready pharmacogenomic report with all drug analyses, mechanisms, and references", color:"#EB3434"},
                    {iconEl:<Icon.Json />, format:"JSON Report", desc:"CPIC-compliant structured JSON for EHR and API integration with full metadata", color:"#0B5ED7"},
                    {iconEl:<Icon.Table />, format:"CSV Export", desc:"Flat table with all drug results, confidence scores, and recommendations", color:"#20C997"},
                    {iconEl:<Icon.Clipboard />, format:"Clipboard Copy", desc:"One-click copy of full JSON report to clipboard for quick sharing", color:"#6EA8FE"},
                  ].map((f,i) => (
                    <div key={f.format} className="pg-card fade-up" style={{ textAlign:"left", animationDelay:`${i*0.07}s` }}>
                      <div style={{ width:44, height:44, borderRadius:11, marginBottom:14, background:`${f.color}10`, border:`1.5px solid ${f.color}25`, display:"flex", alignItems:"center", justifyContent:"center", color:f.color }}>{f.iconEl}</div>
                      <div className="syne" style={{ fontSize:14, fontWeight:700, color:"#212529", marginBottom:7 }}>{f.format}</div>
                      <div style={{ fontSize:12, color:"#6c757d", lineHeight:1.7 }}>{f.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
        <Footer />

      </div>
    </div>
  );
}
