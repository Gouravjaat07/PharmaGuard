import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ─── STYLES ──────────────────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("pg-lab-styles")) return;
  const s = document.createElement("style");
  s.id = "pg-lab-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Fraunces:wght@700;800;900&family=Syne:wght@600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    html{scroll-behavior:smooth;}
    body{background:#F8F9FA;color:#212529;font-family:'DM Sans',sans-serif;}
    ::-webkit-scrollbar{width:5px;height:5px;}
    ::-webkit-scrollbar-track{background:#e8ecf0;}
    ::-webkit-scrollbar-thumb{background:#6EA8FE;border-radius:3px;}

    @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.45;}}
    @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
    @keyframes slideInRight{from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);}}
    @keyframes modalIn{from{opacity:0;transform:scale(0.92);}to{opacity:1;transform:scale(1);}}
    @keyframes cardIn{from{opacity:0;transform:translateY(16px) scale(0.98);}to{opacity:1;transform:translateY(0) scale(1);}}
    @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
    @keyframes techMove{0%{transform:translateY(0);}50%{transform:translateY(-6px);}100%{transform:translateY(0);}}
    @keyframes tick{0%{transform:scale(0);}60%{transform:scale(1.2);}100%{transform:scale(1);}}
    @keyframes progressBar{from{width:0;}to{width:var(--pw);}}
    @keyframes scanLine{0%{top:-2px;}100%{top:100%;}}
    @keyframes ringPulse{0%{box-shadow:0 0 0 0 rgba(11,94,215,0.4);}70%{box-shadow:0 0 0 12px rgba(11,94,215,0);}100%{box-shadow:0 0 0 0 rgba(11,94,215,0);}}

    .lab-fadeUp{animation:fadeUp 0.5s ease both;}
    .lab-pulse{animation:pulse 1.8s infinite;}
    .lab-float{animation:float 3s ease-in-out infinite;}
    .ring-pulse{animation:ringPulse 2s infinite;}

    .pg-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:9px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:600;font-size:13px;transition:all 0.18s;position:relative;overflow:hidden;}
    .pg-btn:hover{transform:translateY(-2px);}
    .pg-btn:active{transform:translateY(0);}
    .pg-btn-primary{background:linear-gradient(135deg,#0B5ED7,#0a4fc4);color:#fff;box-shadow:0 4px 18px rgba(11,94,215,0.3);}
    .pg-btn-primary:hover{box-shadow:0 6px 26px rgba(11,94,215,0.5);}
    .pg-btn-success{background:linear-gradient(135deg,#20C997,#17a880);color:#fff;box-shadow:0 4px 18px rgba(32,201,151,0.28);}
    .pg-btn-danger{background:linear-gradient(135deg,#ef4444,#b91c1c);color:#fff;}
    .pg-btn-ghost{background:rgba(11,94,215,0.07);color:#495057;border:1px solid rgba(11,94,215,0.18);}
    .pg-btn-ghost:hover{background:rgba(11,94,215,0.13);color:#212529;}
    .pg-btn-lab{background:linear-gradient(135deg,#0B5ED7,#0a4fc4);color:#fff;box-shadow:0 4px 18px rgba(11,94,215,0.3);}
    .pg-btn-lab:hover{box-shadow:0 6px 26px rgba(11,94,215,0.5);}
    .pg-btn-urgent{background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;box-shadow:0 4px 18px rgba(239,68,68,0.35);}
    .pg-btn-urgent:hover{box-shadow:0 6px 26px rgba(239,68,68,0.5);}

    .pg-card{background:#ffffff;border:1px solid rgba(11,94,215,0.12);border-radius:14px;padding:22px;box-shadow:0 2px 12px rgba(11,94,215,0.06);transition:all 0.25s;}
    .pg-card:hover{border-color:rgba(11,94,215,0.22);box-shadow:0 4px 20px rgba(11,94,215,0.1);}

    .lab-card{background:#ffffff;border:1px solid rgba(11,94,215,0.13);border-radius:16px;padding:20px;box-shadow:0 2px 12px rgba(11,94,215,0.07);transition:all 0.25s;position:relative;overflow:hidden;}
    .lab-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--accent,linear-gradient(90deg,#0B5ED7,#6EA8FE));opacity:0.9;}

    .pg-input{background:#ffffff;border:1.5px solid #dee2e6;border-radius:9px;padding:10px 14px;color:#212529;font-family:'DM Sans',sans-serif;font-size:13px;width:100%;outline:none;transition:all 0.2s;}
    .pg-input:focus{border-color:#0B5ED7;box-shadow:0 0 0 3px rgba(11,94,215,0.12);}
    .pg-input::placeholder{color:#adb5bd;}
    .pg-select{background:#ffffff;border:1.5px solid #dee2e6;border-radius:9px;padding:10px 14px;color:#212529;font-family:'DM Sans',sans-serif;font-size:13px;width:100%;outline:none;transition:all 0.2s;cursor:pointer;-webkit-appearance:none;}
    .pg-select:focus{border-color:#0B5ED7;box-shadow:0 0 0 3px rgba(11,94,215,0.12);}
    .pg-select option{background:#ffffff;color:#212529;}
    .pg-textarea{background:#ffffff;border:1.5px solid #dee2e6;border-radius:9px;padding:10px 14px;color:#212529;font-family:'DM Sans',sans-serif;font-size:13px;width:100%;outline:none;transition:all 0.2s;resize:vertical;min-height:80px;}
    .pg-textarea:focus{border-color:#0B5ED7;box-shadow:0 0 0 3px rgba(11,94,215,0.12);}
    .pg-textarea::placeholder{color:#adb5bd;}

    .pg-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:0.3px;}

    .time-slot{border:1.5px solid #dee2e6;border-radius:10px;padding:10px 14px;cursor:pointer;transition:all 0.18s;background:#ffffff;text-align:center;}
    .time-slot:hover{border-color:rgba(11,94,215,0.5);background:rgba(11,94,215,0.05);}
    .time-slot.selected{border-color:#0B5ED7;background:rgba(11,94,215,0.1);box-shadow:0 0 0 1px rgba(11,94,215,0.25);}
    .time-slot.urgent{border-color:rgba(239,68,68,0.4);background:rgba(239,68,68,0.04);}
    .time-slot.urgent:hover{border-color:#ef4444;background:rgba(239,68,68,0.09);}
    .time-slot.urgent.selected{border-color:#ef4444;background:rgba(239,68,68,0.12);box-shadow:0 0 0 1px rgba(239,68,68,0.3);}
    .time-slot.disabled{opacity:0.35;cursor:not-allowed;pointer-events:none;}

    .tech-avatar{width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;border:2px solid rgba(11,94,215,0.4);background:linear-gradient(135deg,rgba(110,168,254,0.2),rgba(11,94,215,0.15));flex-shrink:0;}

    .step-indicator{display:flex;align-items:center;gap:8px;}
    .step-circle{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;transition:all 0.3s;flex-shrink:0;}
    .step-line{height:2px;flex:1;background:#dee2e6;transition:background 0.3s;}
    .step-line.done{background:linear-gradient(90deg,#0B5ED7,#6EA8FE);}

    .payment-card{border:1.5px solid #dee2e6;border-radius:12px;padding:16px;cursor:pointer;transition:all 0.2s;background:#ffffff;display:flex;align-items:center;gap:12px;}
    .payment-card:hover{border-color:rgba(11,94,215,0.4);}
    .payment-card.selected{border-color:#0B5ED7;background:rgba(11,94,215,0.06);}

    .notification-bar{position:fixed;top:72px;right:18px;z-index:9999;padding:11px 18px;border-radius:11px;font-size:13px;font-weight:500;animation:slideInRight 0.3s ease;box-shadow:0 8px 30px rgba(11,94,215,0.18);max-width:340px;}

    .modal-overlay{position:fixed;inset:0;background:rgba(33,37,41,0.6);z-index:300;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);padding:20px;}
    .modal-box{background:#ffffff;border:1px solid rgba(11,94,215,0.18);border-radius:20px;max-width:580px;width:100%;max-height:90vh;overflow-y:auto;animation:modalIn 0.25s ease;box-shadow:0 25px 60px rgba(11,94,215,0.18);}

    .scan-effect{position:relative;overflow:hidden;}
    .scan-effect::after{content:'';position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(11,94,215,0.5),transparent);animation:scanLine 2.5s linear infinite;}

    .shimmer-loading{background:linear-gradient(90deg,rgba(11,94,215,0.04) 25%,rgba(11,94,215,0.09) 50%,rgba(11,94,215,0.04) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px;}

    .tab-btn{padding:7px 14px;border-radius:8px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;transition:all 0.18s;background:transparent;color:#6c757d;letter-spacing:0.3px;}
    .tab-btn.active{background:rgba(11,94,215,0.12);color:#0B5ED7;}
    .tab-btn:hover:not(.active){background:rgba(11,94,215,0.06);color:#495057;}
    .nav-link{transition:all 0.2s;position:relative;cursor:pointer;}
    .nav-link::after{content:'';position:absolute;bottom:-2px;left:0;right:0;height:2px;background:#0B5ED7;transform:scaleX(0);transition:transform 0.2s;border-radius:1px;}
    .nav-link:hover::after,.nav-link.active::after{transform:scaleX(1);}

    .urgency-ring{width:12px;height:12px;border-radius:50%;background:#ef4444;box-shadow:0 0 6px #ef4444;animation:pulse 1s infinite;}

    .calendar-day{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s;border:1.5px solid transparent;}
    .calendar-day:hover:not(.disabled):not(.selected){background:rgba(11,94,215,0.08);border-color:rgba(11,94,215,0.3);}
    .calendar-day.selected{background:rgba(11,94,215,0.15);border-color:#0B5ED7;color:#0B5ED7;}
    .calendar-day.today{border-color:rgba(32,201,151,0.5);color:#20C997;}
    .calendar-day.disabled{opacity:0.3;cursor:not-allowed;}
    .calendar-day.has-slots{position:relative;}
    .calendar-day.has-slots::after{content:'';position:absolute;bottom:3px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:#20C997;}

    .tracking-step{display:flex;gap:12px;padding:12px 0;position:relative;}
    .tracking-step:not(:last-child)::after{content:'';position:absolute;left:18px;top:44px;bottom:-12px;width:2px;background:#dee2e6;}
    .tracking-step.done:not(:last-child)::after{background:linear-gradient(to bottom,#0B5ED7,rgba(110,168,254,0.3));}

    .fraunces{font-family:'Fraunces',serif;}
    .mono{font-family:'DM Mono',monospace;}

    @media(max-width:768px){.pg-card{padding:14px;}.hide-mobile{display:none!important;}.grid-resp{grid-template-columns:1fr!important;}}
    @media(min-width:769px){.hide-desktop{display:none!important;}}
  `;
  document.head.appendChild(s);
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
let notifTimer;
const showNotif = (msg, type = "info") => {
  const existing = document.getElementById("lab-notif");
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.id = "lab-notif";
  el.className = "notification-bar";
  const c = { success:"#20C997", error:"#ef4444", info:"#0B5ED7", warning:"#f59e0b" };
  el.style.cssText = `background:#ffffff;border:1px solid ${c[type]}50;color:#212529;box-shadow:0 8px 30px rgba(11,94,215,0.15);`;
  el.innerHTML = `<span style="color:${c[type]};margin-right:8px">${type==="success"?"✓":type==="error"?"✗":type==="warning"?"⚠":"ℹ"}</span>${msg}`;
  document.body.appendChild(el);
  clearTimeout(notifTimer);
  notifTimer = setTimeout(() => el.remove(), 3500);
};

const LAB_TESTS = [
  { id:"cbc", name:"Complete Blood Count (CBC)", desc:"RBC, WBC, Platelets, Hemoglobin", price:299, duration:"30 min", icon:"🩸", category:"Hematology", report:"4 hrs" },
  { id:"lft", name:"Liver Function Test (LFT)", desc:"ALT, AST, Bilirubin, Albumin, ALP", price:499, duration:"45 min", icon:"🫀", category:"Biochemistry", report:"6 hrs" },
  { id:"kft", name:"Kidney Function Test (KFT)", desc:"Creatinine, Urea, Uric Acid, eGFR", price:449, duration:"45 min", icon:"💊", category:"Biochemistry", report:"6 hrs" },
  { id:"thyroid", name:"Thyroid Panel (T3/T4/TSH)", desc:"Comprehensive thyroid function", price:599, duration:"30 min", icon:"🧬", category:"Endocrinology", report:"8 hrs" },
  { id:"lipid", name:"Lipid Profile", desc:"Total Cholesterol, HDL, LDL, VLDL, TG", price:399, duration:"30 min", icon:"📊", category:"Biochemistry", report:"4 hrs" },
  { id:"hba1c", name:"HbA1c (Diabetes Control)", desc:"3-month average blood glucose", price:349, duration:"20 min", icon:"🔬", category:"Endocrinology", report:"4 hrs" },
  { id:"vitamin", name:"Vitamin D & B12", desc:"Essential vitamin deficiency screen", price:699, duration:"20 min", icon:"⚡", category:"Nutrition", report:"12 hrs" },
  { id:"urine", name:"Urine Routine Analysis", desc:"Physical, chemical, microscopic exam", price:149, duration:"15 min", icon:"🧪", category:"Pathology", report:"2 hrs" },
  { id:"covid", name:"COVID-19 RT-PCR", desc:"Gold standard COVID detection test", price:799, duration:"15 min", icon:"🦠", category:"Virology", report:"6 hrs" },
  { id:"pg_test", name:"PGx Pharmacogenomics Panel", desc:"CYP2D6, CYP2C19, TPMT, DPYD, VKORC1", price:3499, duration:"60 min", icon:"🧬", category:"Pharmacogenomics", report:"48 hrs", featured:true },
];

const TIME_SLOTS = {
  morning: [
    { id:"07:00", label:"7:00 AM", available:true }, { id:"07:30", label:"7:30 AM", available:true },
    { id:"08:00", label:"8:00 AM", available:false }, { id:"08:30", label:"8:30 AM", available:true },
    { id:"09:00", label:"9:00 AM", available:true }, { id:"09:30", label:"9:30 AM", available:false },
    { id:"10:00", label:"10:00 AM", available:true }, { id:"10:30", label:"10:30 AM", available:true },
    { id:"11:00", label:"11:00 AM", available:true }, { id:"11:30", label:"11:30 AM", available:false },
  ],
  afternoon: [
    { id:"12:00", label:"12:00 PM", available:true }, { id:"12:30", label:"12:30 PM", available:true },
    { id:"13:00", label:"1:00 PM", available:false }, { id:"13:30", label:"1:30 PM", available:true },
    { id:"14:00", label:"2:00 PM", available:true }, { id:"14:30", label:"2:30 PM", available:true },
    { id:"15:00", label:"3:00 PM", available:false }, { id:"15:30", label:"3:30 PM", available:true },
  ],
  evening: [
    { id:"16:00", label:"4:00 PM", available:true }, { id:"16:30", label:"4:30 PM", available:true },
    { id:"17:00", label:"5:00 PM", available:false }, { id:"17:30", label:"5:30 PM", available:true },
    { id:"18:00", label:"6:00 PM", available:true }, { id:"18:30", label:"6:30 PM", available:true },
  ],
};

const TECHNICIANS = [
  { id:"t1", name:"Dr. Riya Sharma", spec:"Senior Lab Technician", exp:"8 yrs", rating:4.9, reviews:247, avatar:"👩‍⚕️", badge:"Top Rated", avail:true, eta:"25 min" },
  { id:"t2", name:"Rahul Mehta", spec:"Phlebotomy Expert", exp:"5 yrs", rating:4.7, reviews:183, avatar:"👨‍⚕️", badge:"Verified", avail:true, eta:"40 min" },
  { id:"t3", name:"Priya Nair", spec:"PGx Specialist", exp:"10 yrs", rating:4.9, reviews:312, avatar:"👩‍🔬", badge:"PGx Expert", avail:true, eta:"35 min" },
  { id:"t4", name:"Arjun Kapoor", spec:"Lab Scientist", exp:"6 yrs", rating:4.6, reviews:156, avatar:"🧑‍⚕️", badge:"Verified", avail:false, eta:"60 min" },
];

const PAYMENT_METHODS = [
  { id:"card", label:"Credit / Debit Card", icon:"💳", desc:"Visa, Mastercard, Rupay" },
  { id:"upi", label:"UPI", icon:"📱", desc:"GPay, PhonePe, Paytm" },
  { id:"netbanking", label:"Net Banking", icon:"🏦", desc:"All major banks" },
  { id:"cash", label:"Cash on Visit", icon:"💵", desc:"Pay when technician arrives" },
];

const INDIAN_STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"];

// ─── HISTORY DATA ──────────────────────────────────────────────────────────────
const BOOKING_HISTORY = [
  { id:"PG-AB12CD", date:"2025-02-15", tests:["CBC","Urine Routine Analysis"], tech:"Dr. Riya Sharma", techAvatar:"👩‍⚕️", paid:448, status:"Completed", reportReady:true, address:"123 Main St, Delhi" },
  { id:"PG-XY99ZW", date:"2025-02-10", tests:["Lipid Profile","HbA1c"], tech:"Rahul Mehta", techAvatar:"👨‍⚕️", paid:748, status:"Completed", reportReady:true, address:"45 Park Ave, Mumbai" },
  { id:"PG-GH34MN", date:"2025-01-28", tests:["Thyroid Panel (T3/T4/TSH)"], tech:"Priya Nair", techAvatar:"👩‍🔬", paid:599, status:"Completed", reportReady:true, address:"78 Green Lane, Bangalore" },
  { id:"PG-KL77PQ", date:"2025-01-14", tests:["PGx Pharmacogenomics Panel","LFT"], tech:"Dr. Riya Sharma", techAvatar:"👩‍⚕️", paid:3998, status:"Completed", reportReady:true, address:"12 Rose Garden, Hyderabad" },
];

// ─── MINI COMPONENTS ──────────────────────────────────────────────────────────

function StarRating({ rating }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:3 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize:11, color:i <= Math.round(rating) ? "#f59e0b" : "#dee2e6" }}>★</span>
      ))}
      <span style={{ fontSize:11, color:"#6c757d", marginLeft:2 }}>{rating}</span>
    </div>
  );
}

function ProgressSteps({ current }) {
  const steps = [
    { num:1, label:"Schedule" },
    { num:2, label:"Details" },
    { num:3, label:"Payment" },
    { num:4, label:"Confirmed" },
  ];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, width:"100%", marginBottom:32 }}>
      {steps.map((s, idx) => (
        <div key={s.num} style={{ display:"flex", alignItems:"center", flex:1 }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
            <div className="step-circle" style={{
              background: s.num < current ? "linear-gradient(135deg,#0B5ED7,#0a4fc4)" : s.num === current ? "rgba(11,94,215,0.12)" : "rgba(11,94,215,0.04)",
              border: s.num <= current ? "2px solid #0B5ED7" : "2px solid #dee2e6",
              color: s.num <= current ? (s.num < current ? "#fff" : "#0B5ED7") : "#adb5bd",
            }}>
              {s.num < current ? "✓" : s.num}
            </div>
            <span style={{ fontSize:9, color: s.num <= current ? "#0B5ED7" : "#adb5bd", fontWeight:600, letterSpacing:0.5, whiteSpace:"nowrap" }}>{s.label.toUpperCase()}</span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`step-line ${s.num < current ? "done" : ""}`} style={{ marginBottom:18 }} />
          )}
        </div>
      ))}
    </div>
  );
}

function UrgencyBanner({ onUrgent }) {
  return (
    <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:14, padding:"14px 18px", marginBottom:20, display:"flex", alignItems:"center", gap:14, animation:"cardIn 0.4s ease" }}>
      <div className="urgency-ring" />
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:700, color:"#ef4444", fontSize:13, marginBottom:2 }}>🚨 Urgent? Get a technician in 45 minutes</div>
        <div style={{ fontSize:11, color:"#6c757d" }}>Available 24/7 · Premium surcharge of ₹199 applies · For critical lab investigations</div>
      </div>
      <button className="pg-btn pg-btn-urgent" style={{ fontSize:12, flexShrink:0 }} onClick={onUrgent}>
        Book Now →
      </button>
    </div>
  );
}

function CalendarPicker({ selectedDate, onSelect }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const getDays = () => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const isDisabled = (day) => {
    if (!day) return true;
    const d = new Date(viewYear, viewMonth, day);
    return d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const isToday = (day) => {
    return day && viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();
  };

  const isSelected = (day) => {
    if (!day || !selectedDate) return false;
    const sd = new Date(selectedDate);
    return sd.getFullYear() === viewYear && sd.getMonth() === viewMonth && sd.getDate() === day;
  };

  const hasSlots = (day) => day && !isDisabled(day);

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  return (
    <div style={{ background:"#ffffff", borderRadius:13, padding:16, border:"1px solid rgba(11,94,215,0.12)", boxShadow:"0 2px 8px rgba(11,94,215,0.06)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <button className="pg-btn pg-btn-ghost" style={{ padding:"5px 10px", fontSize:13 }} onClick={() => {
          if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1);
        }}>‹</button>
        <div style={{ fontWeight:700, fontSize:14, color:"#212529" }}>{monthNames[viewMonth]} {viewYear}</div>
        <button className="pg-btn pg-btn-ghost" style={{ padding:"5px 10px", fontSize:13 }} onClick={() => {
          if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1);
        }}>›</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:8 }}>
        {dayNames.map(d => <div key={d} style={{ textAlign:"center", fontSize:10, color:"#6c757d", fontWeight:700, padding:"4px 0" }}>{d}</div>)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
        {getDays().map((day, idx) => (
          <div key={idx} className={`calendar-day ${!day?"":""}${isDisabled(day)?"disabled":""}${isToday(day)?"today":""}${isSelected(day)?"selected":""}${hasSlots(day)&&!isDisabled(day)?"has-slots":""}`}
            style={{ color:isSelected(day)?"#0B5ED7":isToday(day)?"#20C997":"#495057" }}
            onClick={() => { if (day && !isDisabled(day)) onSelect(new Date(viewYear, viewMonth, day).toISOString().split("T")[0]); }}>
            {day || ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function TimeSlotPicker({ selectedTime, onSelect, urgent }) {
  return (
    <div>
      {Object.entries(TIME_SLOTS).map(([period, slots]) => (
        <div key={period} style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, color:"#6c757d", fontWeight:700, letterSpacing:1.2, marginBottom:8, textTransform:"uppercase" }}>
            {period === "morning" ? "🌅 Morning" : period === "afternoon" ? "☀️ Afternoon" : "🌙 Evening"}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))", gap:7 }}>
            {slots.map(slot => (
              <div key={slot.id} className={`time-slot ${!slot.available?"disabled":""}${selectedTime===slot.id?" selected":""}${urgent?" urgent":""}`}
                onClick={() => slot.available && onSelect(slot.id)}>
                <div style={{ fontSize:12, fontWeight:600, color:selectedTime===slot.id?(urgent?"#ef4444":"#0B5ED7"):"#495057" }}>{slot.label}</div>
                {!slot.available && <div style={{ fontSize:9, color:"#adb5bd" }}>Booked</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TechnicianCard({ tech, selected, onSelect }) {
  return (
    <div className="lab-card" style={{ "--accent":`linear-gradient(90deg,${selected?"#0B5ED7":"rgba(11,94,215,0.15)"},transparent)`, border:`1.5px solid ${selected?"rgba(11,94,215,0.5)":"rgba(11,94,215,0.12)"}`, background:selected?"rgba(11,94,215,0.04)":"#ffffff", cursor:"pointer", transition:"all 0.2s" }} onClick={() => tech.avail && onSelect(tech.id)}>
      <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
        <div style={{ position:"relative" }}>
          <div className="tech-avatar" style={{ borderColor:selected?"#0B5ED7":"rgba(11,94,215,0.2)" }}>{tech.avatar}</div>
          {tech.avail && <div style={{ position:"absolute", bottom:2, right:2, width:10, height:10, borderRadius:"50%", background:"#20C997", border:"2px solid #F8F9FA" }} />}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:3 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#212529" }}>{tech.name}</div>
            <span className="pg-badge" style={{ background:tech.avail?"rgba(32,201,151,0.1)":"rgba(108,117,125,0.1)", color:tech.avail?"#20C997":"#6c757d", border:`1px solid ${tech.avail?"rgba(32,201,151,0.25)":"rgba(108,117,125,0.2)"}`, fontSize:9 }}>
              {tech.avail?"● Available":"Busy"}
            </span>
          </div>
          <div style={{ fontSize:11, color:"#6c757d", marginBottom:5 }}>{tech.spec} · {tech.exp} exp</div>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <StarRating rating={tech.rating} />
            <span style={{ fontSize:10, color:"#6c757d" }}>({tech.reviews} reviews)</span>
            <span className="pg-badge" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.18)", fontSize:9 }}>🏅 {tech.badge}</span>
          </div>
          {tech.avail && (
            <div style={{ marginTop:8, padding:"6px 10px", background:"rgba(32,201,151,0.08)", borderRadius:7, border:"1px solid rgba(32,201,151,0.2)", display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:16 }}>🛵</span>
              <span style={{ fontSize:11, color:"#20C997", fontWeight:600 }}>ETA: {tech.eta}</span>
            </div>
          )}
        </div>
      </div>
      {selected && (
        <div style={{ position:"absolute", top:12, right:12, width:22, height:22, borderRadius:"50%", background:"#0B5ED7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#fff", fontWeight:700 }}>✓</div>
      )}
    </div>
  );
}

function BookingConfirmation({ booking, onViewDashboard }) {
  const [tracking] = useState([
    { icon:"✅", label:"Booking Confirmed", desc:"Your booking is confirmed & payment received", done:true, time:"Just now" },
    { icon:"🔍", label:"Technician Assigned", desc:`${booking.technician?.name || "Dr. Riya Sharma"} assigned to your booking`, done:true, time:"Just now" },
    { icon:"🛵", label:"Technician En Route", desc:"Technician will depart from lab at scheduled time", done:false, time:booking.timeSlot ? `At ${booking.timeSlot}` : "Scheduled" },
    { icon:"🏠", label:"Sample Collection", desc:"Technician arrives & collects samples at your home", done:false, time:"At appointment" },
    { icon:"🔬", label:"Lab Processing", desc:"Samples sent to accredited lab for analysis", done:false, time:"After collection" },
    { icon:"📊", label:"Report Ready", desc:"Digital report sent to your email & app", done:false, time:booking.reportETA || "4-48 hrs" },
  ]);

  const totalPrice = booking.selectedTests?.reduce((acc, id) => {
    const test = LAB_TESTS.find(t => t.id === id);
    return acc + (test?.price || 0);
  }, 0);

  const tech = booking.technician || TECHNICIANS[0];

  return (
    <div style={{ maxWidth:640, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg,rgba(32,201,151,0.15),rgba(11,94,215,0.15))", border:"2px solid #20C997", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, margin:"0 auto 14px", animation:"tick 0.5s ease" }}>
          ✅
        </div>
        <div className="fraunces" style={{ fontSize:28, fontWeight:900, color:"#212529", marginBottom:6 }}>Booking Confirmed!</div>
        <div style={{ fontSize:13, color:"#6c757d", lineHeight:1.7 }}>Your lab technician is scheduled. A confirmation SMS & email has been sent.</div>
        <div className="mono" style={{ fontSize:16, color:"#20C997", fontWeight:700, marginTop:10, letterSpacing:1 }}>#{booking.bookingId}</div>
      </div>

      <div style={{ background:"rgba(11,94,215,0.05)", border:"1px solid rgba(11,94,215,0.2)", borderRadius:14, padding:"16px 20px", marginBottom:16, display:"flex", gap:14, alignItems:"center" }}>
        <div className="tech-avatar" style={{ width:50, height:50 }}>{tech.avatar}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, color:"#212529", fontSize:14, marginBottom:2 }}>{tech.name}</div>
          <div style={{ fontSize:11, color:"#6c757d", marginBottom:6 }}>{tech.spec} · ⭐ {tech.rating}</div>
          <div className="pg-badge" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.2)" }}>
            🛵 Arrives by {booking.timeSlot || "8:30 AM"} on {booking.date ? new Date(booking.date).toLocaleDateString("en-IN",{day:"numeric",month:"short"}) : "Tomorrow"}
          </div>
        </div>
        <button className="pg-btn pg-btn-ghost" style={{ fontSize:11 }}>📞 Call</button>
      </div>

      <div className="pg-card" style={{ marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:13, marginBottom:12, color:"#6c757d" }}>📋 BOOKING SUMMARY</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[
            { l:"📍 Address", v:booking.address || "123 Main St, Delhi" },
            { l:"📅 Date", v:booking.date ? new Date(booking.date).toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"}) : "Tomorrow" },
            { l:"⏰ Time", v:booking.timeSlot || "8:30 AM" },
            { l:"💳 Payment", v:booking.paymentMethod || "UPI" },
            { l:"💰 Total Paid", v:`₹${totalPrice?.toLocaleString("en-IN") || "0"}` },
          ].map(f => (
            <div key={f.l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid rgba(11,94,215,0.07)" }}>
              <span style={{ fontSize:12, color:"#6c757d" }}>{f.l}</span>
              <span style={{ fontSize:12, color:"#212529", fontWeight:600, textAlign:"right", maxWidth:"60%" }}>{f.v}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop:12, display:"flex", flexWrap:"wrap", gap:6 }}>
          {booking.selectedTests?.map(id => {
            const t = LAB_TESTS.find(x => x.id === id);
            return t ? <span key={id} className="pg-badge" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.18)", fontSize:10 }}>{t.icon} {t.name}</span> : null;
          })}
        </div>
      </div>

      <div className="pg-card" style={{ marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:13, marginBottom:16, color:"#6c757d" }}>🗺️ LIVE TRACKING</div>
        <div>
          {tracking.map((step, idx) => (
            <div key={idx} className={`tracking-step ${step.done?"done":""}`}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:step.done?"linear-gradient(135deg,#0B5ED7,#0a4fc4)":"rgba(11,94,215,0.07)", border:`2px solid ${step.done?"#0B5ED7":"#dee2e6"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0, boxShadow:step.done?"0 0 12px rgba(11,94,215,0.25)":"none" }}>
                {step.icon}
              </div>
              <div style={{ flex:1, paddingTop:6 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:step.done?"#212529":"#adb5bd" }}>{step.label}</div>
                  <div style={{ fontSize:10, color:"#6c757d" }}>{step.time}</div>
                </div>
                <div style={{ fontSize:11, color:"#6c757d", lineHeight:1.5 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"flex", gap:10 }}>
        <button className="pg-btn pg-btn-lab" style={{ flex:1, justifyContent:"center", fontSize:13 }} onClick={onViewDashboard}>
          📊 View Dashboard
        </button>
        <button className="pg-btn pg-btn-ghost" style={{ flex:1, justifyContent:"center", fontSize:13 }}>
          📄 Download Receipt
        </button>
      </div>
    </div>
  );
}

function PaymentModal({ booking, totalPrice, onClose, onSuccess }) {
  const [method, setMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState("method");

  const handlePay = async () => {
    if (method === "upi" && !upiId.trim()) return showNotif("Enter a valid UPI ID", "error");
    if (method === "card" && (!cardNum || !cardName || !cardExpiry || !cardCvv)) return showNotif("Fill all card details", "error");
    setProcessing(true);
    setStep("processing");
    await new Promise(r => setTimeout(r, 2500));
    setStep("done");
    await new Promise(r => setTimeout(r, 1000));
    onSuccess(method);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ padding:"24px 26px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
            <div>
              <div className="fraunces" style={{ fontSize:22, fontWeight:800, color:"#212529" }}>Secure Payment</div>
              <div style={{ fontSize:12, color:"#6c757d", marginTop:3 }}>256-bit encrypted · HIPAA compliant</div>
            </div>
            <button className="pg-btn pg-btn-ghost" onClick={onClose} style={{ padding:"5px 10px" }} disabled={processing}>✕</button>
          </div>

          <div style={{ background:"rgba(11,94,215,0.06)", border:"1px solid rgba(11,94,215,0.2)", borderRadius:12, padding:"14px 18px", marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:11, color:"#6c757d", marginBottom:4, fontWeight:600 }}>TOTAL AMOUNT</div>
              <div className="fraunces" style={{ fontSize:32, fontWeight:900, color:"#0B5ED7" }}>₹{(totalPrice + (booking.urgent ? 199 : 0)).toLocaleString("en-IN")}</div>
              {booking.urgent && <div style={{ fontSize:11, color:"#ef4444", marginTop:2 }}>Includes ₹199 urgent surcharge</div>}
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:10, color:"#6c757d" }}>Tests: {booking.selectedTests?.length}</div>
              <div style={{ fontSize:10, color:"#20C997", marginTop:3 }}>🔒 Secure</div>
            </div>
          </div>

          {step === "method" && (
            <>
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:11, color:"#6c757d", fontWeight:600, letterSpacing:1, marginBottom:10 }}>SELECT PAYMENT METHOD</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {PAYMENT_METHODS.map(pm => (
                    <div key={pm.id} className={`payment-card ${method===pm.id?"selected":""}`} onClick={() => setMethod(pm.id)}>
                      <div style={{ width:36, height:36, borderRadius:9, background:"rgba(11,94,215,0.07)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{pm.icon}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:"#212529" }}>{pm.label}</div>
                        <div style={{ fontSize:11, color:"#6c757d" }}>{pm.desc}</div>
                      </div>
                      <div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${method===pm.id?"#0B5ED7":"#dee2e6"}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {method===pm.id && <div style={{ width:8, height:8, borderRadius:"50%", background:"#0B5ED7" }} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {method === "upi" && (
                <div style={{ marginBottom:18 }}>
                  <label style={{ fontSize:11, color:"#6c757d", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6 }}>UPI ID</label>
                  <input className="pg-input" placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
                </div>
              )}
              {method === "card" && (
                <div style={{ marginBottom:18, display:"flex", flexDirection:"column", gap:10 }}>
                  <div>
                    <label style={{ fontSize:11, color:"#6c757d", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6 }}>CARD NUMBER</label>
                    <input className="pg-input" placeholder="0000 0000 0000 0000" value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim())} maxLength={19} />
                  </div>
                  <div>
                    <label style={{ fontSize:11, color:"#6c757d", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6 }}>CARDHOLDER NAME</label>
                    <input className="pg-input" placeholder="As on card" value={cardName} onChange={e => setCardName(e.target.value)} />
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    <div>
                      <label style={{ fontSize:11, color:"#6c757d", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6 }}>EXPIRY</label>
                      <input className="pg-input" placeholder="MM/YY" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} maxLength={5} />
                    </div>
                    <div>
                      <label style={{ fontSize:11, color:"#6c757d", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6 }}>CVV</label>
                      <input className="pg-input" type="password" placeholder="●●●" value={cardCvv} onChange={e => setCardCvv(e.target.value.slice(0,3))} maxLength={3} />
                    </div>
                  </div>
                </div>
              )}
              {method === "cash" && (
                <div style={{ padding:"12px 14px", background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:9, marginBottom:18 }}>
                  <div style={{ fontSize:12, color:"#f59e0b", fontWeight:600, marginBottom:4 }}>⚠ Cash on Visit Policy</div>
                  <div style={{ fontSize:11, color:"#6c757d", lineHeight:1.6 }}>Please keep exact change ready. Technician carries limited change. Payment must be made before sample collection begins.</div>
                </div>
              )}

              <button className="pg-btn pg-btn-lab" style={{ width:"100%", justifyContent:"center", fontSize:14, padding:"13px" }} onClick={handlePay}>
                🔒 Pay ₹{(totalPrice + (booking.urgent ? 199 : 0)).toLocaleString("en-IN")} Securely
              </button>
              <div style={{ textAlign:"center", marginTop:10, fontSize:10, color:"#6c757d" }}>
                🛡️ Secured by Razorpay · PCI DSS Compliant · 256-bit SSL
              </div>
            </>
          )}

          {step === "processing" && (
            <div style={{ textAlign:"center", padding:"30px 0" }}>
              <div style={{ width:60, height:60, borderRadius:"50%", border:"3px solid rgba(11,94,215,0.15)", borderTop:"3px solid #0B5ED7", margin:"0 auto 18px", animation:"spin 0.8s linear infinite" }} />
              <div style={{ fontSize:16, fontWeight:700, color:"#212529", marginBottom:6 }}>Processing Payment</div>
              <div style={{ fontSize:12, color:"#6c757d" }}>Please do not close this window...</div>
            </div>
          )}

          {step === "done" && (
            <div style={{ textAlign:"center", padding:"30px 0" }}>
              <div style={{ fontSize:56, marginBottom:10 }}>✅</div>
              <div style={{ fontSize:18, fontWeight:700, color:"#20C997" }}>Payment Successful!</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── USER DASHBOARD ───────────────────────────────────────────────────────────
function UserDashboard({ booking }) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const totalPrice = booking.selectedTests?.reduce((acc, id) => {
    const t = LAB_TESTS.find(x => x.id === id); return acc + (t?.price || 0);
  }, 0);
  const tech = booking.technician || TECHNICIANS[0];

  const SAMPLE_REPORTS = [
    { name:"CBC Report", date:"15 Feb 2025", status:"Ready", icon:"🩸", bId:"#PG-001" },
    { name:"Lipid Profile", date:"10 Feb 2025", status:"Ready", icon:"📊", bId:"#PG-002" },
    { name:"Thyroid Panel", date:"28 Jan 2025", status:"Ready", icon:"🧬", bId:"#PG-003" },
  ];

  return (
    <div style={{ maxWidth:900, margin:"0 auto" }}>
      <div className="lab-fadeUp" style={{ marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
          <span className="pg-badge" style={{ background:"rgba(32,201,151,0.1)", color:"#20C997", border:"1px solid rgba(32,201,151,0.2)" }}>👤 User Dashboard</span>
          <span className="pg-badge mono" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.15)" }}>#{booking.bookingId}</span>
        </div>
        <div className="fraunces" style={{ fontSize:32, fontWeight:900, marginBottom:6 }}>
          My Lab <span style={{ background:"linear-gradient(135deg,#0B5ED7,#6EA8FE)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Dashboard</span>
        </div>
        <div style={{ color:"#6c757d", fontSize:13 }}>Track your bookings, view reports, and manage your health profile</div>
      </div>

      <div style={{ background:"linear-gradient(135deg,rgba(11,94,215,0.08),rgba(32,201,151,0.06))", border:"1px solid rgba(11,94,215,0.22)", borderRadius:18, padding:"20px 22px", marginBottom:20, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-20, right:-20, width:100, height:100, borderRadius:"50%", background:"radial-gradient(rgba(11,94,215,0.15),transparent)" }} />
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
          <div style={{ position:"absolute", left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,rgba(11,94,215,0.45),transparent)", animation:"scanLine 3s linear infinite" }} />
        </div>
        <div style={{ display:"flex", gap:16, alignItems:"flex-start", flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:220 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <div className="urgency-ring" style={{ background:"#20C997", boxShadow:"0 0 6px #20C997" }} />
              <span style={{ fontSize:12, fontWeight:700, color:"#20C997" }}>ACTIVE BOOKING — TODAY</span>
            </div>
            <div className="fraunces" style={{ fontSize:20, fontWeight:800, color:"#212529", marginBottom:4 }}>
              {booking.date ? new Date(booking.date).toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"}) : "Tomorrow"} at {booking.timeSlot || "8:30 AM"}
            </div>
            <div style={{ fontSize:12, color:"#6c757d", marginBottom:10 }}>
              📍 {booking.address || "Your Home Address, Delhi"}
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {booking.selectedTests?.slice(0,3).map(id => {
                const t = LAB_TESTS.find(x => x.id === id);
                return t ? <span key={id} className="pg-badge" style={{ background:"rgba(11,94,215,0.05)", color:"#6c757d", border:"1px solid rgba(11,94,215,0.07)", fontSize:10 }}>{t.icon} {t.name}</span> : null;
              })}
              {(booking.selectedTests?.length || 0) > 3 && <span className="pg-badge" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.15)", fontSize:10 }}>+{(booking.selectedTests?.length || 0) - 3} more</span>}
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end" }}>
            <div style={{ display:"flex", gap:8 }}>
              <div className="tech-avatar" style={{ width:44, height:44, fontSize:18 }}>{tech.avatar}</div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:"#212529" }}>{tech.name}</div>
                <div style={{ fontSize:10, color:"#6c757d" }}>{tech.spec}</div>
                <StarRating rating={tech.rating} />
              </div>
            </div>
            <div style={{ padding:"8px 12px", background:"rgba(11,94,215,0.08)", borderRadius:9, border:"1px solid rgba(11,94,215,0.15)", textAlign:"center" }}>
              <div style={{ fontSize:10, color:"#6c757d" }}>ETA</div>
              <div style={{ fontSize:16, fontWeight:800, color:"#0B5ED7" }}>{tech.eta}</div>
            </div>
            <button className="pg-btn pg-btn-ghost" style={{ fontSize:11 }}>📞 Call Tech</button>
          </div>
        </div>
        <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid rgba(11,94,215,0.06)", display:"flex", gap:8, flexWrap:"wrap" }}>
          <button className="pg-btn pg-btn-ghost" style={{ fontSize:11 }}>🗓 Reschedule</button>
          <button className="pg-btn pg-btn-ghost" style={{ fontSize:11, color:"#ef4444" }}>✕ Cancel</button>
          <div style={{ marginLeft:"auto", textAlign:"right" }}>
            <div style={{ fontSize:11, color:"#6c757d" }}>Total Paid</div>
            <div className="fraunces" style={{ fontSize:20, fontWeight:800, color:"#20C997" }}>₹{totalPrice?.toLocaleString("en-IN")}</div>
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12, marginBottom:24 }}>
        {[
          { icon:"🧪", l:"Total Tests", v:booking.selectedTests?.length || 0, col:"#6EA8FE" },
          { icon:"📋", l:"Reports Ready", v:SAMPLE_REPORTS.length, col:"#20C997" },
          { icon:"💰", l:"Total Spent", v:`₹${totalPrice?.toLocaleString("en-IN")}`, col:"#0B5ED7" },
          { icon:"⭐", l:"Tech Rating", v:tech.rating, col:"#f59e0b" },
        ].map(s => (
          <div key={s.l} style={{ padding:"14px", background:"rgba(11,94,215,0.02)", borderRadius:13, border:"1px solid rgba(11,94,215,0.06)", textAlign:"center" }}>
            <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
            <div className="fraunces" style={{ fontSize:22, fontWeight:800, color:s.col }}>{s.v}</div>
            <div style={{ fontSize:10, color:"#6c757d" }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:3, background:"rgba(11,94,215,0.02)", borderRadius:10, padding:4, marginBottom:20 }}>
        {[{id:"upcoming",l:"📅 Upcoming"},{id:"reports",l:"📊 Reports"},{id:"history",l:"📁 History"},{id:"profile",l:"👤 Health Profile"}].map(t => (
          <button key={t.id} className={`tab-btn ${activeTab===t.id?"active":""}`} onClick={() => setActiveTab(t.id)} style={{ flex:1 }}>{t.l}</button>
        ))}
      </div>

      {activeTab === "upcoming" && (
        <div className="pg-card lab-fadeUp">
          <div style={{ fontWeight:700, fontSize:13, color:"#6c757d", marginBottom:12 }}>UPCOMING APPOINTMENT</div>
          <div style={{ display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ width:64, height:64, borderRadius:14, background:"linear-gradient(135deg,rgba(11,94,215,0.12),rgba(110,168,254,0.15))", border:"1px solid rgba(11,94,215,0.22)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <div style={{ fontSize:18, fontWeight:900, color:"#0B5ED7" }}>{booking.date ? new Date(booking.date).getDate() : new Date().getDate() + 1}</div>
              <div style={{ fontSize:9, color:"#0B5ED7", fontWeight:600 }}>{booking.date ? new Date(booking.date).toLocaleDateString("en-IN",{month:"short"}).toUpperCase() : "FEB"}</div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:700, color:"#212529", marginBottom:4 }}>Home Lab Visit</div>
              <div style={{ fontSize:12, color:"#6c757d", marginBottom:6 }}>⏰ {booking.timeSlot || "8:30 AM"} · {booking.selectedTests?.length || 0} tests</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {booking.selectedTests?.map(id => {
                  const t = LAB_TESTS.find(x => x.id === id);
                  return t ? <span key={id} className="pg-badge" style={{ background:"rgba(11,94,215,0.07)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.12)", fontSize:10 }}>{t.icon} {t.name}</span> : null;
                })}
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              <button className="pg-btn pg-btn-lab" style={{ fontSize:12 }}>📍 Track</button>
              <button className="pg-btn pg-btn-ghost" style={{ fontSize:11 }}>🗓 Reschedule</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "reports" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {SAMPLE_REPORTS.map((r,i) => (
            <div key={i} className="pg-card" style={{ display:"flex", alignItems:"center", gap:14, animation:`cardIn 0.3s ease ${i*0.07}s both` }}>
              <div style={{ width:44, height:44, borderRadius:11, background:"rgba(11,94,215,0.08)", border:"1px solid rgba(11,94,215,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{r.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#212529", marginBottom:2 }}>{r.name}</div>
                <div style={{ fontSize:11, color:"#6c757d" }}>{r.date} · {r.bId}</div>
              </div>
              <span className="pg-badge" style={{ background:"rgba(32,201,151,0.1)", color:"#20C997", border:"1px solid rgba(32,201,151,0.2)" }}>✓ {r.status}</span>
              <div style={{ display:"flex", gap:7 }}>
                <button className="pg-btn pg-btn-ghost" style={{ fontSize:11 }}>👁 View</button>
                <button className="pg-btn pg-btn-primary" style={{ fontSize:11 }}>⬇ PDF</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "history" && (
        <div className="pg-card lab-fadeUp">
          <div style={{ fontWeight:700, fontSize:13, color:"#6c757d", marginBottom:12 }}>BOOKING HISTORY</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[{date:"15 Feb 2025",tests:"CBC, Urine",tech:"Dr. Riya Sharma",paid:448,status:"Completed"},{date:"10 Feb 2025",tests:"Lipid Profile",tech:"Rahul Mehta",paid:399,status:"Completed"},{date:"28 Jan 2025",tests:"Thyroid Panel",tech:"Priya Nair",paid:599,status:"Completed"}].map((h,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid rgba(11,94,215,0.04)" }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:"#212529" }}>{h.tests}</div>
                  <div style={{ fontSize:11, color:"#6c757d", marginTop:2 }}>{h.date} · {h.tech}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#20C997" }}>₹{h.paid}</div>
                  <span className="pg-badge" style={{ background:"rgba(32,201,151,0.08)", color:"#20C997", border:"1px solid rgba(32,201,151,0.15)", fontSize:9 }}>✓ {h.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="pg-card lab-fadeUp">
          <div style={{ fontWeight:700, fontSize:13, color:"#6c757d", marginBottom:14 }}>🏥 HEALTH PROFILE</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:10 }}>
            {[
              { l:"Blood Group", v:booking.bloodGroup || "B+", icon:"🩸" },
              { l:"Age", v:`${booking.age || "—"} years`, icon:"👤" },
              { l:"Height", v:booking.height || "—", icon:"📏" },
              { l:"Weight", v:booking.weight || "—", icon:"⚖️" },
              { l:"Allergies", v:booking.allergies || "None reported", icon:"⚠️" },
              { l:"Conditions", v:booking.conditions || "None reported", icon:"🏥" },
            ].map(f => (
              <div key={f.l} style={{ padding:"12px 14px", background:"rgba(11,94,215,0.04)", borderRadius:10, border:"1px solid rgba(11,94,215,0.04)" }}>
                <div style={{ fontSize:16, marginBottom:6 }}>{f.icon}</div>
                <div style={{ fontSize:10, color:"#6c757d", marginBottom:3, fontWeight:600 }}>{f.l.toUpperCase()}</div>
                <div style={{ fontSize:12, color:"#212529", fontWeight:600 }}>{f.v}</div>
              </div>
            ))}
          </div>
          <button className="pg-btn pg-btn-lab" style={{ marginTop:16, fontSize:12 }}>✏️ Edit Health Profile</button>
        </div>
      )}
    </div>
  );
}

// ─── HISTORY PAGE ──────────────────────────────────────────────────────────────
function HistoryPage() {
  return (
    <div style={{ padding:"30px 22px", maxWidth:900, margin:"0 auto" }}>
      <div className="lab-fadeUp" style={{ marginBottom:28 }}>
        <div className="fraunces" style={{ fontSize:30, fontWeight:800, marginBottom:6, color:"#212529" }}>Booking History</div>
        <div style={{ color:"#6c757d", fontSize:13 }}>Your past lab visit records and test reports</div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12, marginBottom:28 }}>
        {[
          { icon:"📋", l:"Total Bookings", v:BOOKING_HISTORY.length, col:"#0B5ED7" },
          { icon:"✅", l:"Completed", v:BOOKING_HISTORY.filter(b=>b.status==="Completed").length, col:"#20C997" },
          { icon:"📊", l:"Reports Ready", v:BOOKING_HISTORY.filter(b=>b.reportReady).length, col:"#6EA8FE" },
          { icon:"💰", l:"Total Spent", v:`₹${BOOKING_HISTORY.reduce((acc,b)=>acc+b.paid,0).toLocaleString("en-IN")}`, col:"#f59e0b" },
        ].map(s => (
          <div key={s.l} style={{ padding:"14px", background:"rgba(11,94,215,0.02)", borderRadius:13, border:"1px solid rgba(11,94,215,0.06)", textAlign:"center" }}>
            <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
            <div className="fraunces" style={{ fontSize:20, fontWeight:800, color:s.col }}>{s.v}</div>
            <div style={{ fontSize:10, color:"#6c757d" }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {BOOKING_HISTORY.map((h, i) => (
          <div key={h.id} className="pg-card lab-fadeUp" style={{ animationDelay:`${i*0.08}s` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
              <div style={{ display:"flex", gap:14, alignItems:"flex-start", flex:1 }}>
                <div style={{ width:52, height:52, borderRadius:12, background:"linear-gradient(135deg,rgba(11,94,215,0.12),rgba(110,168,254,0.15))", border:"1px solid rgba(11,94,215,0.2)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <div style={{ fontSize:16, fontWeight:900, color:"#0B5ED7" }}>{new Date(h.date).getDate()}</div>
                  <div style={{ fontSize:8, color:"#0B5ED7", fontWeight:600 }}>{new Date(h.date).toLocaleDateString("en-IN",{month:"short"}).toUpperCase()}</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                    <span className="mono" style={{ color:"#0B5ED7", fontSize:12, fontWeight:700 }}>#{h.id}</span>
                    <span className="pg-badge" style={{ background:"rgba(32,201,151,0.1)", color:"#20C997", border:"1px solid rgba(32,201,151,0.25)", fontSize:9 }}>✓ {h.status}</span>
                  </div>
                  <div style={{ fontSize:13, fontWeight:600, color:"#212529", marginBottom:4 }}>
                    {h.tests.join(" · ")}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                    <span style={{ fontSize:11, color:"#6c757d" }}>👤 {h.tech}</span>
                    <span style={{ fontSize:11, color:"#6c757d" }}>📍 {h.address}</span>
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
                <div className="fraunces" style={{ fontSize:20, fontWeight:800, color:"#20C997" }}>₹{h.paid.toLocaleString("en-IN")}</div>
                <div style={{ display:"flex", gap:7 }}>
                  {h.reportReady && (
                    <button className="pg-btn pg-btn-ghost" style={{ fontSize:11 }}>📊 View Report</button>
                  )}
                  <button className="pg-btn pg-btn-primary" style={{ fontSize:11 }}>⬇ Receipt</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ABOUT PAGE ────────────────────────────────────────────────────────────────
function AboutPage() {
  return (
    <div style={{ padding:"30px 22px", maxWidth:820, margin:"0 auto" }}>
      <div className="pg-card lab-fadeUp" style={{ textAlign:"center", padding:44, marginBottom:22 }}>
        <div style={{ fontSize:56, marginBottom:14 }}>🏠</div>
        <div className="fraunces" style={{ fontSize:34, fontWeight:900, marginBottom:10, color:"#212529" }}>Lab at Your Doorstep</div>
        <div style={{ color:"#6c757d", fontSize:14, lineHeight:1.8, maxWidth:540, margin:"0 auto" }}>
          PharmaGuard's Home Lab service connects you with NABL-accredited lab technicians who visit your home for sample collection — delivering fast, accurate results with zero hassle.
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap:10, marginTop:18, flexWrap:"wrap" }}>
          {["NABL Accredited","HIPAA Compliant","24/7 Available","ISO 15189 Certified"].map(b => (
            <span key={b} className="pg-badge" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.2)", fontSize:11 }}>{b}</span>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14, marginBottom:22 }}>
        {[
          { icon:"🔬", title:"NABL Certified Labs", desc:"All tests processed at ISO 15189 accredited facilities with stringent quality controls" },
          { icon:"🛵", title:"Home Sample Collection", desc:"Trained phlebotomists arrive at your doorstep at your chosen time — no clinic visits needed" },
          { icon:"⚡", title:"Fast Digital Reports", desc:"Test results delivered digitally in 2-48 hours depending on the test type" },
          { icon:"🛡️", title:"HIPAA Compliant", desc:"Your health data is fully encrypted and protected under strict privacy standards" },
          { icon:"♻️", title:"Free Reschedule", desc:"Flexible rescheduling up to 2 hours before your appointment at no extra charge" },
          { icon:"🏅", title:"Verified Technicians", desc:"Every technician is background-verified, trained, and carries sterile sealed equipment" },
        ].map(f => (
          <div key={f.title} className="pg-card lab-fadeUp">
            <div style={{ fontSize:26, marginBottom:8 }}>{f.icon}</div>
            <div style={{ fontWeight:700, marginBottom:5, fontSize:13, color:"#212529" }}>{f.title}</div>
            <div style={{ fontSize:12, color:"#6c757d", lineHeight:1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div className="pg-card lab-fadeUp" style={{ marginBottom:14 }}>
        <div style={{ fontWeight:700, marginBottom:14, fontSize:14, color:"#212529" }}>🧪 Available Tests ({LAB_TESTS.length})</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {LAB_TESTS.map(t => (
            <span key={t.id} className="pg-badge" style={{ background:"rgba(11,94,215,0.05)", color:"#495057", border:"1px solid rgba(11,94,215,0.1)", fontSize:11, padding:"5px 12px" }}>
              {t.icon} {t.name}
            </span>
          ))}
        </div>
      </div>

      <div className="pg-card lab-fadeUp" style={{ marginBottom:14 }}>
        <div style={{ fontWeight:700, marginBottom:14, fontSize:14, color:"#212529" }}>👨‍⚕️ Our Technician Team</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12 }}>
          {TECHNICIANS.map(tech => (
            <div key={tech.id} style={{ padding:"14px", background:"rgba(11,94,215,0.03)", borderRadius:12, border:"1px solid rgba(11,94,215,0.08)", textAlign:"center" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>{tech.avatar}</div>
              <div style={{ fontSize:13, fontWeight:700, color:"#212529", marginBottom:3 }}>{tech.name}</div>
              <div style={{ fontSize:11, color:"#6c757d", marginBottom:6 }}>{tech.spec} · {tech.exp}</div>
              <StarRating rating={tech.rating} />
              <div style={{ marginTop:6 }}>
                <span className="pg-badge" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.15)", fontSize:9 }}>🏅 {tech.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pg-card lab-fadeUp">
        <div style={{ fontWeight:700, marginBottom:14, fontSize:14, color:"#212529" }}>❓ Frequently Asked Questions</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            { q:"How early can I book a technician?", a:"You can book same-day appointments up to 2 hours in advance. For urgent bookings, a technician can arrive within 45 minutes (surcharge applies)." },
            { q:"What equipment does the technician bring?", a:"All technicians carry sterile, sealed, single-use phlebotomy equipment including vacutainers, needles, swabs, and cold chain sample containers." },
            { q:"How are my samples processed?", a:"Samples are transported in temperature-controlled containers directly to our partner NABL-accredited labs. Chain of custody is maintained throughout." },
            { q:"When will I get my reports?", a:"Routine tests are available in 2-8 hours. Specialized tests like Thyroid or PGx panels may take 8-48 hours. All reports are delivered digitally." },
            { q:"What is your cancellation policy?", a:"Cancel up to 2 hours before your appointment for a full refund. Cancellations within 2 hours may incur a convenience fee of ₹99." },
          ].map((faq, i) => (
            <div key={i} style={{ padding:"14px 16px", background:"rgba(11,94,215,0.02)", borderRadius:10, border:"1px solid rgba(11,94,215,0.07)" }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#212529", marginBottom:6 }}>❓ {faq.q}</div>
              <div style={{ fontSize:12, color:"#6c757d", lineHeight:1.7 }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function LabTechnicianPage() {
  useEffect(() => { injectStyles(); }, []);

  // page: "booking" | "history" | "about"
  const [page, setPage] = useState("booking");

  // Steps: 0=landing, 1=schedule, 2=details, 3=review/payment, 4=confirmed, 5=dashboard
  const [step, setStep] = useState(0);
  const [selectedTests] = useState(LAB_TESTS.map(t => t.id));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedTech, setSelectedTech] = useState(null);
  const [urgent, setUrgent] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [form, setForm] = useState({ name:"", phone:"", email:"", age:"", gender:"Male", bloodGroup:"Unknown", address:"", landmark:"", city:"", state:"Uttar Pradesh", pincode:"", height:"", weight:"", allergies:"", conditions:"", instructions:"" });
  const [booking, setBooking] = useState({});
  const topRef = useRef(null);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const totalPrice = useMemo(() => {
    return selectedTests.reduce((acc, id) => {
      const t = LAB_TESTS.find(x => x.id === id);
      return acc + (t?.price || 0);
    }, 0);
  }, [selectedTests]);

  const scrollTop = () => { topRef.current?.scrollIntoView({ behavior:"smooth" }); };

  const handleBookNow = () => {
    setUrgent(false);
    setPage("booking");
    setStep(1);
    scrollTop();
  };

  const handleUrgent = () => {
    setUrgent(true);
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setSelectedTime("08:00");
    showNotif("Urgent booking activated — surcharge of ₹199 applies", "warning");
    setPage("booking");
    setStep(1);
    scrollTop();
  };

  const handleNext = () => {
    if (step === 1 && (!selectedDate || !selectedTime)) return showNotif("Please select a date and time slot", "error");
    if (step === 1 && !selectedTech) return showNotif("Please select a technician", "error");
    if (step === 2) {
      if (!form.name.trim()) return showNotif("Please enter your full name", "error");
      if (!form.phone.trim() || form.phone.length < 10) return showNotif("Please enter a valid 10-digit phone number", "error");
      if (!form.email.trim() || !form.email.includes("@")) return showNotif("Please enter a valid email address", "error");
      if (!form.address.trim()) return showNotif("Please enter your complete address", "error");
      if (!form.pincode.trim() || form.pincode.length !== 6) return showNotif("Please enter a valid 6-digit pincode", "error");
    }
    setStep(s => s + 1);
    scrollTop();
  };

  const handleBack = () => {
    if (step === 1) setStep(0);
    else setStep(s => s - 1);
    scrollTop();
  };

  const handlePaymentSuccess = (payMethod) => {
    const tech = TECHNICIANS.find(t => t.id === selectedTech) || TECHNICIANS[0];
    const bId = "PG-" + Math.random().toString(36).slice(2,8).toUpperCase();
    const bkg = {
      bookingId: bId,
      selectedTests,
      date: selectedDate,
      timeSlot: selectedTime,
      technician: tech,
      address: `${form.address}, ${form.landmark ? form.landmark + ", " : ""}${form.city}, ${form.state} - ${form.pincode}`,
      paymentMethod: payMethod,
      urgent,
      bloodGroup: form.bloodGroup,
      age: form.age,
      height: form.height,
      weight: form.weight,
      allergies: form.allergies,
      conditions: form.conditions,
      reportETA: selectedTests.includes("pg_test") ? "48 hrs" : "4-8 hrs",
      phone: form.phone,
      email: form.email,
      name: form.name,
    };
    setBooking(bkg);
    setShowPayment(false);
    setStep(4);
    showNotif(`Booking confirmed! ${tech.name} will arrive at ${selectedTime}`, "success");
    scrollTop();
  };

  // ─── NAVBAR ────────────────────────────────────────────────────────────────────
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NAV_ITEMS = [
    { label: "Dashboard",        key: "main",       path: "/analysis",       dot: false, internal: false },
    { label: "👨‍👩‍👧‍👦 Family",    key: "family",     path: "/family-section", dot: true,  internal: false },
    { label: "Book Technician",  key: "technician", path: "/technician",     dot: false, internal: false },
    { label: "History",          key: "history",    path: "/history",        dot: false, internal: true  },
    { label: "About",            key: "about",      path: "/about",          dot: false, internal: true  },
    { label: "Profile",          key: "profile",    path: "/profile",        dot: false, internal: false },
  ];

  const isActive = (item) => {
    if (item.internal) {
      if (item.key === "history") return page === "history";
      if (item.key === "about") return page === "about";
    }
    if (item.key === "technician") return page === "booking";
    return location.pathname === item.path;
  };

  const handleNavClick = (item) => {
    setMobileMenu(false);
    if (item.internal) {
      if (item.key === "history") { setPage("history"); scrollTop(); }
      if (item.key === "about") { setPage("about"); scrollTop(); }
    } else if (item.key === "technician") {
      setPage("booking");
      setStep(0);
      scrollTop();
    } else {
      navigate(item.path);
    }
  };

  const NavBar = () => (
    <nav style={{
      position:"sticky", top:0, zIndex:100,
      background:"rgba(255,255,255,0.95)", backdropFilter:"blur(20px)",
      borderBottom:"1.5px solid rgba(11,94,215,0.1)",
      padding:"0 24px", display:"flex", alignItems:"center",
      justifyContent:"space-between", height:62,
      boxShadow:"0 2px 12px rgba(11,94,215,0.06)"
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer" }} onClick={() => navigate("/analysis")}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#0B5ED7,#094bb3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, boxShadow:"0 4px 12px rgba(11,94,215,0.25)" }}>🧬</div>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:"#0B5ED7", letterSpacing:0.3 }}>PharmaGuard</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#20C997", letterSpacing:3 }}>PRECISION MEDICINE</div>
          </div>
        </div>

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

      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {page === "booking" && step >= 1 && step < 4 && totalPrice > 0 && (
          <div className="hide-mobile" style={{ background:"rgba(11,94,215,0.07)", border:"1.5px solid rgba(11,94,215,0.15)", borderRadius:9, padding:"5px 12px", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:11, color:"#6c757d" }}>Cart:</span>
            <span className="fraunces" style={{ fontSize:14, fontWeight:800, color:"#0B5ED7" }}>₹{totalPrice.toLocaleString("en-IN")}</span>
          </div>
        )}
        <button onClick={() => setSidebarOpen(true)} style={{
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

      {mobileMenu && (
        <div style={{ position:"absolute", top:62, left:0, right:0, background:"#fff", borderBottom:"1.5px solid rgba(11,94,215,0.1)", padding:14, display:"flex", flexDirection:"column", gap:6, boxShadow:"0 8px 20px rgba(11,94,215,0.08)", zIndex:200 }}>
          {NAV_ITEMS.map(item => (
            <button key={item.key} className={`tab-btn ${isActive(item)?"active":""}`}
              onClick={() => handleNavClick(item)}
              style={{ textAlign:"left", padding:"9px 12px" }}>
              {item.label}
            </button>
          ))}
          {page === "booking" && step >= 1 && step < 4 && totalPrice > 0 && (
            <div style={{ borderTop:"1px solid rgba(11,94,215,0.08)", paddingTop:10, marginTop:4, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px 0" }}>
              <span style={{ fontSize:12, color:"#6c757d" }}>Cart Total:</span>
              <span className="fraunces" style={{ fontSize:16, fontWeight:800, color:"#0B5ED7" }}>₹{totalPrice.toLocaleString("en-IN")}</span>
            </div>
          )}
        </div>
      )}
    </nav>
  );

  // ─── SIDEBAR ───────────────────────────────────────────────────────────────────
  const LabSidebar = () => {
    if (!sidebarOpen) return null;
    return (
      <>
        <div style={{ position:"fixed", inset:0, background:"rgba(33,37,41,0.35)", zIndex:199, backdropFilter:"blur(4px)" }} onClick={() => setSidebarOpen(false)} />
        <div style={{
          position:"fixed", top:0, right:0, height:"100vh", width:360,
          background:"#fff", borderLeft:"1.5px solid rgba(11,94,215,0.1)",
          zIndex:200, overflowY:"auto", padding:22,
          boxShadow:"-8px 0 40px rgba(11,94,215,0.08)",
          animation:"slideInRight 0.32s cubic-bezier(0.4,0,0.2,1)"
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:"#212529" }}>User Profile</span>
            <button className="pg-btn pg-btn-ghost" onClick={() => setSidebarOpen(false)} style={{ padding:"5px 9px" }}>✕</button>
          </div>
          <div style={{ textAlign:"center", marginBottom:22 }}>
            <div style={{ width:76, height:76, borderRadius:"50%", background:"linear-gradient(135deg,#0B5ED7,#20C997)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:800, color:"#fff", margin:"0 auto 10px" }}>DR</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, color:"#212529" }}>Dr. Emily Roberts</div>
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
            <button className="pg-btn pg-btn-lab" style={{ width:"100%", justifyContent:"center", marginBottom:8 }}
              onClick={() => { setSidebarOpen(false); navigate("/family-section"); }}>
              👨‍👩‍👧‍👦 Go to Family Dashboard
            </button>
            <button className="pg-btn pg-btn-ghost" style={{ width:"100%", justifyContent:"center" }}
              onClick={() => { setSidebarOpen(false); navigate("/profile"); }}>
              👤 View Full Profile
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div style={{ minHeight:"100vh", background:"#F8F9FA", color:"#212529" }}>
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", backgroundImage:"radial-gradient(rgba(11,94,215,0.06) 1px,transparent 1px)", backgroundSize:"30px 30px" }} />
      <div style={{ position:"fixed", top:-300, right:-200, width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle,rgba(11,94,215,0.05),transparent 70%)", zIndex:0, pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:-200, left:-100, width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(32,201,151,0.04),transparent 70%)", zIndex:0, pointerEvents:"none" }} />

      <div style={{ position:"relative", zIndex:1 }}>
        <NavBar />
        <LabSidebar />
        {showPayment && (
          <PaymentModal
            booking={{ selectedTests, urgent, ...form }}
            totalPrice={totalPrice}
            onClose={() => setShowPayment(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}

        <div ref={topRef} style={{ maxWidth:1180, margin:"0 auto", padding:"30px 22px" }}>

          {/* ── HISTORY PAGE ── */}
          {page === "history" && <HistoryPage />}

          {/* ── ABOUT PAGE ── */}
          {page === "about" && <AboutPage />}

          {/* ── BOOKING PAGES ── */}
          {page === "booking" && (
            <>
              {/* STEP 0: LANDING */}
              {step === 0 && (
                <div className="lab-fadeUp">
                  <div style={{ marginBottom:36 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                      <span className="pg-badge" style={{ background:"rgba(11,94,215,0.09)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.18)" }}>🏠 Lab at Home</span>
                      <span className="pg-badge" style={{ background:"rgba(32,201,151,0.1)", color:"#20C997", border:"1px solid rgba(32,201,151,0.18)" }}>NABL Accredited</span>
                      <span className="pg-badge" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.15)" }}>24/7 Available</span>
                    </div>
                    <div className="fraunces" style={{ fontSize:"clamp(26px,4vw,42px)", fontWeight:900, lineHeight:1.1, marginBottom:10 }}>
                      Book Lab Technician<br />
                      <span style={{ background:"linear-gradient(135deg,#0B5ED7,#6EA8FE)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>At Your Doorstep</span>
                    </div>
                    <div style={{ color:"#6c757d", fontSize:13, lineHeight:1.7, maxWidth:540, marginBottom:24 }}>
                      Professional lab technicians from NABL-accredited labs visit your home for sample collection. Fast reports, certified technicians, zero hassle.
                    </div>
                    <button className="pg-btn pg-btn-lab" style={{ fontSize:15, padding:"13px 32px", borderRadius:13 }} onClick={handleBookNow}>
                      🏠 Book Now →
                    </button>
                  </div>

                  <UrgencyBanner onUrgent={handleUrgent} />

                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginTop:28 }}>
                    {[
                      { icon:"🔬", l:"NABL Accredited", d:"ISO 15189 certified labs" },
                      { icon:"🛡️", l:"HIPAA Compliant", d:"Your data is always secure" },
                      { icon:"⚡", l:"Fast Reports", d:"Digital reports in 2-48 hrs" },
                      { icon:"♻️", l:"Free Reschedule", d:"Change up to 2 hrs before" },
                      { icon:"💰", l:"Full Refund", d:"Cancel anytime policy" },
                      { icon:"🏅", l:"Verified Techs", d:"Background & skill verified" },
                    ].map(f => (
                      <div key={f.l} style={{ padding:"14px 12px", background:"rgba(11,94,215,0.02)", borderRadius:12, border:"1px solid rgba(11,94,215,0.05)", textAlign:"center" }}>
                        <div style={{ fontSize:22, marginBottom:6 }}>{f.icon}</div>
                        <div style={{ fontSize:11, fontWeight:700, color:"#212529", marginBottom:3 }}>{f.l}</div>
                        <div style={{ fontSize:10, color:"#6c757d", lineHeight:1.4 }}>{f.d}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: CONFIRMED */}
              {step === 4 && (
                <div className="lab-fadeUp">
                  <BookingConfirmation booking={booking} onViewDashboard={() => { setStep(5); scrollTop(); }} />
                </div>
              )}

              {/* STEP 5: DASHBOARD */}
              {step === 5 && (
                <div className="lab-fadeUp">
                  <UserDashboard booking={booking} />
                </div>
              )}

              {/* BOOKING STEPS 1–3 */}
              {step >= 1 && step <= 3 && (
                <>
                  <div className="lab-fadeUp" style={{ marginBottom:28 }}>
                    {urgent && (
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                        <div className="urgency-ring" />
                        <span style={{ fontSize:12, fontWeight:700, color:"#ef4444", letterSpacing:1 }}>URGENT BOOKING ACTIVE</span>
                        <button onClick={() => setUrgent(false)} style={{ marginLeft:10, fontSize:10, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:5, padding:"2px 7px", color:"#ef4444", cursor:"pointer", fontFamily:"DM Sans" }}>✕ Cancel Urgent</button>
                      </div>
                    )}
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                      <span className="pg-badge" style={{ background:"rgba(11,94,215,0.09)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.18)" }}>🏠 Lab at Home</span>
                      <span className="pg-badge" style={{ background:"rgba(32,201,151,0.1)", color:"#20C997", border:"1px solid rgba(32,201,151,0.18)" }}>NABL Accredited</span>
                      <span className="pg-badge" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.15)" }}>24/7 Available</span>
                    </div>
                    <div className="fraunces" style={{ fontSize:"clamp(22px,3vw,34px)", fontWeight:900, lineHeight:1.1, marginBottom:6 }}>
                      Book Lab Technician<br />
                      <span style={{ background:"linear-gradient(135deg,#0B5ED7,#6EA8FE)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>At Your Doorstep</span>
                    </div>
                  </div>

                  <ProgressSteps current={step} />

                  <div>
                    {/* STEP 1 — Schedule */}
                    {step === 1 && (
                      <div className="lab-fadeUp" style={{ display:"flex", flexDirection:"column", gap:18 }}>
                        <div className="pg-card">
                          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                            <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#0B5ED7,#0a4fc4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#fff" }}>📅</div>
                            <div>
                              <div style={{ fontWeight:700, fontSize:15 }}>Pick a Date</div>
                              <div style={{ fontSize:11, color:"#6c757d" }}>Available 7 days a week</div>
                            </div>
                            {selectedDate && <span className="pg-badge" style={{ marginLeft:"auto", background:"rgba(11,94,215,0.09)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.18)" }}>
                              {new Date(selectedDate).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                            </span>}
                          </div>
                          <CalendarPicker selectedDate={selectedDate} onSelect={setSelectedDate} />
                        </div>

                        <div className="pg-card">
                          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                            <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#0B5ED7,#6EA8FE)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#fff" }}>⏰</div>
                            <div>
                              <div style={{ fontWeight:700, fontSize:15 }}>Select Time Slot</div>
                              <div style={{ fontSize:11, color:"#6c757d" }}>Slots available 7 AM – 7 PM</div>
                            </div>
                            {selectedTime && <span className="pg-badge" style={{ marginLeft:"auto", background:urgent?"rgba(239,68,68,0.12)":"rgba(32,201,151,0.1)", color:urgent?"#ef4444":"#20C997", border:`1px solid ${urgent?"rgba(239,68,68,0.3)":"rgba(32,201,151,0.2)"}` }}>{selectedTime}</span>}
                          </div>
                          <TimeSlotPicker selectedTime={selectedTime} onSelect={setSelectedTime} urgent={urgent} />
                        </div>

                        <div className="pg-card">
                          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                            <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#20C997,#17a880)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#fff" }}>👨‍⚕️</div>
                            <div>
                              <div style={{ fontWeight:700, fontSize:15 }}>Choose Technician</div>
                              <div style={{ fontSize:11, color:"#6c757d" }}>All NABL-certified & background verified</div>
                            </div>
                          </div>
                          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
                            {TECHNICIANS.map(tech => (
                              <TechnicianCard key={tech.id} tech={tech} selected={selectedTech===tech.id} onSelect={setSelectedTech} />
                            ))}
                          </div>
                          <div style={{ marginTop:14, padding:"10px 14px", background:"rgba(11,94,215,0.02)", borderRadius:10, border:"1px solid rgba(11,94,215,0.05)", display:"flex", gap:8 }}>
                            <span style={{ fontSize:14 }}>ℹ️</span>
                            <span style={{ fontSize:11, color:"#6c757d", lineHeight:1.6 }}>All technicians are verified, trained in phlebotomy, and carry sterile sealed equipment. Technician details are shared 2 hours before appointment.</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 2 — Personal Details */}
                    {step === 2 && (
                      <div className="pg-card lab-fadeUp">
                        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24 }}>
                          <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#0B5ED7,#0a4fc4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#fff" }}>2</div>
                          <div>
                            <div style={{ fontWeight:700, fontSize:15 }}>Your Details</div>
                            <div style={{ fontSize:11, color:"#6c757d" }}>Required for home visit & report delivery</div>
                          </div>
                        </div>

                        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                          <div>
                            <div style={{ fontSize:11, color:"#0B5ED7", fontWeight:700, letterSpacing:1.2, marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
                              <div style={{ height:1, flex:1, background:"rgba(11,94,215,0.15)" }} />
                              👤 PERSONAL INFORMATION
                              <div style={{ height:1, flex:1, background:"rgba(11,94,215,0.15)" }} />
                            </div>
                            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12 }}>
                              {[
                                { k:"name", label:"Full Name *", type:"text", placeholder:"As per government ID" },
                                { k:"phone", label:"Mobile Number *", type:"tel", placeholder:"+91 XXXXX XXXXX" },
                                { k:"email", label:"Email Address *", type:"email", placeholder:"For report delivery" },
                                { k:"age", label:"Age *", type:"number", placeholder:"In years" },
                              ].map(f => (
                                <div key={f.k}>
                                  <label style={{ fontSize:11, color:"#6c757d", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6 }}>{f.label.toUpperCase()}</label>
                                  <input className="pg-input" type={f.type} placeholder={f.placeholder} value={form[f.k]} onChange={e => setF(f.k, e.target.value)} />
                                </div>
                              ))}
                              <div>
                                <label style={{ fontSize:11, color:"#6c757d", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6 }}>GENDER</label>
                                <select className="pg-select" value={form.gender} onChange={e => setF("gender", e.target.value)}>
                                  {["Male","Female","Non-binary","Prefer not to say"].map(g => <option key={g}>{g}</option>)}
                                </select>
                              </div>
                              <div>
                                <label style={{ fontSize:11, color:"#6c757d", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6 }}>BLOOD GROUP</label>
                                <select className="pg-select" value={form.bloodGroup} onChange={e => setF("bloodGroup", e.target.value)}>
                                  {["A+","A-","B+","B-","AB+","AB-","O+","O-","Unknown"].map(b => <option key={b}>{b}</option>)}
                                </select>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize:11, color:"#0B5ED7", fontWeight:700, letterSpacing:1.2, marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
                              <div style={{ height:1, flex:1, background:"rgba(11,94,215,0.15)" }} />
                              📍 HOME ADDRESS
                              <div style={{ height:1, flex:1, background:"rgba(11,94,215,0.15)" }} />
                            </div>
                            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                              <div>
                                <label style={{ fontSize:11, color:"#6c757d", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6 }}>COMPLETE ADDRESS *</label>
                                <textarea className="pg-textarea" placeholder="House/Flat no, Building name, Street name, Area/Locality..." value={form.address} onChange={e => setF("address", e.target.value)} style={{ minHeight:70 }} />
                              </div>
                              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12 }}>
                                <div>
                                  <label style={{ fontSize:11, color:"#6c757d", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6 }}>LANDMARK</label>
                                  <input className="pg-input" placeholder="Near Metro/School..." value={form.landmark} onChange={e => setF("landmark", e.target.value)} />
                                </div>
                                <div>
                                  <label style={{ fontSize:11, color:"#6c757d", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6 }}>CITY *</label>
                                  <input className="pg-input" placeholder="City" value={form.city} onChange={e => setF("city", e.target.value)} />
                                </div>
                                <div>
                                  <label style={{ fontSize:11, color:"#6c757d", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6 }}>STATE</label>
                                  <select className="pg-select" value={form.state} onChange={e => setF("state", e.target.value)}>
                                    {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label style={{ fontSize:11, color:"#6c757d", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6 }}>PINCODE *</label>
                                  <input className="pg-input" placeholder="6-digit pincode" value={form.pincode} onChange={e => setF("pincode", e.target.value.replace(/\D/g,"").slice(0,6))} maxLength={6} />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize:11, color:"#20C997", fontWeight:700, letterSpacing:1.2, marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
                              <div style={{ height:1, flex:1, background:"rgba(32,201,151,0.18)" }} />
                              🏥 HEALTH INFORMATION (OPTIONAL)
                              <div style={{ height:1, flex:1, background:"rgba(32,201,151,0.18)" }} />
                            </div>
                            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12 }}>
                              {[
                                { k:"height", label:"Height", placeholder:"e.g. 5'8\" or 172 cm" },
                                { k:"weight", label:"Weight", placeholder:"e.g. 70 kg" },
                                { k:"allergies", label:"Known Allergies", placeholder:"e.g. Penicillin, Latex..." },
                                { k:"conditions", label:"Medical Conditions", placeholder:"e.g. Diabetes, BP..." },
                              ].map(f => (
                                <div key={f.k}>
                                  <label style={{ fontSize:11, color:"#6c757d", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6 }}>{f.label.toUpperCase()}</label>
                                  <input className="pg-input" placeholder={f.placeholder} value={form[f.k]} onChange={e => setF(f.k, e.target.value)} />
                                </div>
                              ))}
                            </div>
                            <div style={{ marginTop:12 }}>
                              <label style={{ fontSize:11, color:"#6c757d", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6 }}>SPECIAL INSTRUCTIONS FOR TECHNICIAN</label>
                              <textarea className="pg-textarea" placeholder="e.g. Ring doorbell twice, 3rd floor, lift available... any special requirements" value={form.instructions} onChange={e => setF("instructions", e.target.value)} />
                            </div>
                          </div>

                          <div style={{ padding:"12px 14px", background:"rgba(32,201,151,0.05)", border:"1px solid rgba(32,201,151,0.15)", borderRadius:10 }}>
                            <div style={{ fontSize:11, color:"#20C997", fontWeight:600, marginBottom:6 }}>✅ CONSENT & PRIVACY</div>
                            <div style={{ fontSize:11, color:"#6c757d", lineHeight:1.7 }}>
                              By proceeding, you consent to sample collection at the provided address and agree to PharmaGuard's
                              <span style={{ color:"#0B5ED7", cursor:"pointer" }}> Privacy Policy</span> and
                              <span style={{ color:"#0B5ED7", cursor:"pointer" }}> Terms of Service</span>.
                              Your health data is encrypted and HIPAA-compliant.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3 — Review & Pay */}
                    {step === 3 && (
                      <div className="lab-fadeUp" style={{ display:"flex", flexDirection:"column", gap:16 }}>
                        <div className="pg-card" style={{ border:"1px solid rgba(11,94,215,0.15)" }}>
                          <div style={{ fontWeight:700, fontSize:15, marginBottom:18 }}>📋 Review Your Booking</div>

                          <div style={{ marginBottom:18 }}>
                            <div style={{ fontSize:11, color:"#6c757d", fontWeight:600, letterSpacing:1, marginBottom:10 }}>SELECTED TESTS</div>
                            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                              {selectedTests.map(id => {
                                const t = LAB_TESTS.find(x => x.id === id);
                                return t ? (
                                  <div key={id} style={{ display:"flex", justifyContent:"space-between", padding:"10px 12px", background:"rgba(11,94,215,0.02)", borderRadius:9, border:"1px solid rgba(11,94,215,0.05)" }}>
                                    <div style={{ display:"flex", gap:8 }}>
                                      <span style={{ fontSize:16 }}>{t.icon}</span>
                                      <div>
                                        <div style={{ fontSize:12, fontWeight:600, color:"#212529" }}>{t.name}</div>
                                        <div style={{ fontSize:10, color:"#6c757d" }}>Report in {t.report} · {t.duration}</div>
                                      </div>
                                    </div>
                                    <span style={{ fontSize:13, fontWeight:700, color:"#20C997", alignSelf:"center" }}>₹{t.price}</span>
                                  </div>
                                ) : null;
                              })}
                              {urgent && (
                                <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 12px", background:"rgba(239,68,68,0.06)", borderRadius:9, border:"1px solid rgba(239,68,68,0.2)" }}>
                                  <div style={{ fontSize:12, fontWeight:600, color:"#ef4444" }}>🚨 Urgent Booking Surcharge</div>
                                  <span style={{ fontSize:13, fontWeight:700, color:"#ef4444" }}>₹199</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
                            {[
                              { l:"📍 Address", v:`${form.address}, ${form.city}` },
                              { l:"📅 Date & Time", v:`${selectedDate ? new Date(selectedDate).toLocaleDateString("en-IN",{day:"numeric",month:"short"}) : "—"} at ${selectedTime || "—"}` },
                              { l:"👨‍⚕️ Technician", v:TECHNICIANS.find(t=>t.id===selectedTech)?.name || "—" },
                              { l:"📞 Contact", v:form.phone },
                            ].map(f => (
                              <div key={f.l} style={{ padding:"10px 12px", background:"rgba(11,94,215,0.04)", borderRadius:9, border:"1px solid rgba(11,94,215,0.04)" }}>
                                <div style={{ fontSize:10, color:"#6c757d", marginBottom:3 }}>{f.l}</div>
                                <div style={{ fontSize:12, color:"#212529", fontWeight:600, lineHeight:1.4 }}>{f.v}</div>
                              </div>
                            ))}
                          </div>

                          <div style={{ display:"flex", justifyContent:"space-between", padding:"14px 16px", background:"rgba(11,94,215,0.07)", borderRadius:11, border:"1px solid rgba(11,94,215,0.15)" }}>
                            <div>
                              <div style={{ fontSize:12, color:"#6c757d", marginBottom:3 }}>{selectedTests.length} test{selectedTests.length!==1?"s":""} · {urgent?"Urgent booking":"Standard booking"}</div>
                              <div style={{ fontSize:11, color:"#6c757d" }}>Inclusive of all charges · NABL certified lab</div>
                            </div>
                            <div style={{ textAlign:"right" }}>
                              <div style={{ fontSize:11, color:"#6c757d", marginBottom:3 }}>TOTAL DUE</div>
                              <div className="fraunces" style={{ fontSize:28, fontWeight:900, color:"#0B5ED7" }}>₹{(totalPrice + (urgent?199:0)).toLocaleString("en-IN")}</div>
                            </div>
                          </div>
                        </div>

                        <button className="pg-btn pg-btn-lab" style={{ width:"100%", justifyContent:"center", fontSize:15, padding:"14px", borderRadius:13 }} onClick={() => setShowPayment(true)}>
                          🔒 Proceed to Secure Payment →
                        </button>

                        <div style={{ textAlign:"center" }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, flexWrap:"wrap" }}>
                            {["🔒 256-bit SSL","✅ NABL Certified","🔁 Free Reschedule","💰 Full Refund Policy"].map(t => (
                              <span key={t} style={{ fontSize:10, color:"#6c757d" }}>{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:24 }}>
                      <button className="pg-btn pg-btn-ghost" onClick={handleBack}>← Back</button>
                      {step < 3 && (
                        <button className="pg-btn pg-btn-lab" onClick={handleNext} style={{ fontSize:14, padding:"11px 28px" }}>
                          {step === 2 ? "Review Booking →" : "Continue →"}
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <footer style={{ borderTop:"1px solid rgba(11,94,215,0.05)", marginTop:40, padding:"22px 24px" }}>
          <div style={{ maxWidth:900, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <span>🧬</span>
            <span className="fraunces" style={{ fontWeight:700, color:"#212529" }}>PharmaGuard v3.0</span>
            <span style={{ color:"#6c757d", fontSize:12 }}>· Home Lab · NABL Accredited · HIPAA Compliant</span>
          </div>
        </footer>
      </div>
    </div>
  );
}