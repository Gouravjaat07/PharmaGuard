import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  AUTH_CONFIG,
  emailExists,
  saveSession,
  loadSession,
} from "./authConfig";

/* ─── STYLES ──────────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Epilogue:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html, body { height:100%; background:#F8F9FA; overflow-x:hidden; }

  :root {
    --primary:#0B5ED7; --primary-d:#094bb3; --primary-l:#6EA8FE;
    --accent:#20C997;  --accent-d:#17a680;
    --danger:#EB3434;  --danger-l:rgba(235,52,52,0.07);
    --warn:#f59e0b;
    --bg:#F8F9FA; --bg-2:#ffffff;
    --text:#212529; --text-m:#495057; --text-s:#8fa3b8;
    --border:rgba(11,94,215,0.12); --border-s:rgba(11,94,215,0.06);
  }

  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:#F8F9FA; }
  ::-webkit-scrollbar-thumb { background:#6EA8FE; border-radius:2px; }

  @keyframes pg-fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pg-float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
  @keyframes pg-spin     { to{transform:rotate(360deg)} }
  @keyframes pg-shake    { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
  @keyframes pg-scanX    { 0%{top:-2px} 100%{top:calc(100% + 2px)} }
  @keyframes pg-orb      { 0%,100%{transform:scale(1) translate(0,0)} 50%{transform:scale(1.1) translate(20px,-15px)} }
  @keyframes pg-ripple   { from{transform:scale(0);opacity:0.55} to{transform:scale(5);opacity:0} }
  @keyframes pg-slideR   { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
  @keyframes pg-stepIn   { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
  @keyframes pg-successP { 0%{transform:scale(0.7);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
  @keyframes pg-dnaNode  { 0%,100%{transform:scale(1);opacity:0.65} 50%{transform:scale(1.35);opacity:1} }
  @keyframes pg-roleIn   { from{opacity:0;transform:scale(0.94) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes pg-tagPop   { 0%{transform:scale(0.6);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }

  .pg-syne     { font-family:'Syne',sans-serif; }
  .pg-epilogue { font-family:'Epilogue',sans-serif; }
  .pg-mono     { font-family:'DM Mono',monospace; }

  .pg-root { min-height:100vh; background:#F8F9FA; color:#212529; font-family:'Epilogue',sans-serif; display:flex; position:relative; overflow:hidden; }
  .pg-grid-bg { position:fixed; inset:0; z-index:0; pointer-events:none; background-image:linear-gradient(rgba(11,94,215,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(11,94,215,.025) 1px,transparent 1px); background-size:44px 44px; }
  .pg-orb { position:fixed; border-radius:50%; pointer-events:none; z-index:0; animation:pg-orb 14s ease-in-out infinite; }

  .pg-left { flex:0 0 44%; display:flex; flex-direction:column; justify-content:space-between; padding:48px 52px; border-right:1px solid rgba(11,94,215,.1); background:linear-gradient(155deg,rgba(11,94,215,.04) 0%,rgba(32,201,151,.03) 55%,transparent 100%); position:relative; overflow:hidden; z-index:1; }
  .pg-right { flex:1; display:flex; align-items:flex-start; justify-content:center; padding:40px 40px; position:relative; z-index:1; overflow-y:auto; background:#fff; }
  .pg-card { width:100%; max-width:490px; animation:pg-fadeUp .65s cubic-bezier(.16,1,.3,1) both; padding:4px 0; }
  .pg-scan-line { position:absolute; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(11,94,215,.25),rgba(32,201,151,.2),transparent); animation:pg-scanX 6s linear infinite; pointer-events:none; }

  /* ── ROLE SELECTOR ── */
  .pg-role-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin:20px 0 24px; }
  .pg-role-card { position:relative; padding:22px 16px; border-radius:14px; border:2px solid rgba(11,94,215,.12); background:#F8F9FA; cursor:pointer; text-align:center; transition:all .28s cubic-bezier(.16,1,.3,1); animation:pg-roleIn .4s ease both; overflow:hidden; }
  .pg-role-card:hover { border-color:rgba(11,94,215,.35); background:rgba(11,94,215,.03); transform:translateY(-3px); box-shadow:0 8px 28px rgba(11,94,215,.1); }
  .pg-role-card.sel-user { border-color:#0B5ED7; background:rgba(11,94,215,.05); box-shadow:0 0 0 3px rgba(11,94,215,.1),0 8px 28px rgba(11,94,215,.12); transform:translateY(-2px); }
  .pg-role-card.sel-tech { border-color:#20C997; background:rgba(32,201,151,.05); box-shadow:0 0 0 3px rgba(32,201,151,.12),0 8px 28px rgba(32,201,151,.1); transform:translateY(-2px); }
  .pg-role-chk { position:absolute; top:10px; right:10px; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; opacity:0; transform:scale(0); transition:all .22s; }
  .sel-user .pg-role-chk { background:#0B5ED7; color:#fff; opacity:1; transform:scale(1); }
  .sel-tech .pg-role-chk { background:#20C997; color:#fff; opacity:1; transform:scale(1); }
  .pg-role-icon { font-size:36px; margin-bottom:10px; display:block; transition:transform .28s; }
  .pg-role-card:hover .pg-role-icon, .sel-user .pg-role-icon, .sel-tech .pg-role-icon { transform:scale(1.1); }

  /* ── INPUTS ── */
  .pg-field { position:relative; margin-bottom:14px; }
  .pg-field-icon { position:absolute; left:16px; top:50%; transform:translateY(-50%); font-size:15px; pointer-events:none; color:#bec8d2; transition:color .2s; z-index:1; }
  .pg-field:focus-within .pg-field-icon { color:#0B5ED7; }
  .pg-field.tf:focus-within .pg-field-icon { color:#20C997; }
  .pg-field-top { position:absolute; left:16px; top:15px; font-size:15px; pointer-events:none; color:#bec8d2; z-index:1; }

  .pg-input { width:100%; background:#F8F9FA; border:1.5px solid rgba(11,94,215,.14); border-radius:10px; padding:13px 46px 13px 48px; color:#212529; font-family:'Epilogue',sans-serif; font-size:14px; outline:none; transition:all .25s; caret-color:#0B5ED7; }
  .pg-input::placeholder { color:#bec8d2; }
  .pg-input:focus { border-color:#0B5ED7; background:#fff; box-shadow:0 0 0 3px rgba(11,94,215,.08); }
  .pg-input.err { border-color:#EB3434; background:rgba(235,52,52,.04); animation:pg-shake .38s ease; }
  .pg-input.ok  { border-color:#20C997; background:rgba(32,201,151,.03); }
  .pg-input.tf:focus  { border-color:#20C997; box-shadow:0 0 0 3px rgba(32,201,151,.1); caret-color:#20C997; }

  .pg-textarea { width:100%; background:#F8F9FA; border:1.5px solid rgba(11,94,215,.14); border-radius:10px; padding:13px 16px 13px 48px; color:#212529; font-family:'Epilogue',sans-serif; font-size:14px; outline:none; resize:vertical; min-height:90px; transition:all .25s; }
  .pg-textarea::placeholder { color:#bec8d2; }
  .pg-textarea:focus { border-color:#0B5ED7; background:#fff; box-shadow:0 0 0 3px rgba(11,94,215,.08); }
  .pg-textarea.tf:focus { border-color:#20C997; box-shadow:0 0 0 3px rgba(32,201,151,.1); }
  .pg-textarea.err { border-color:#EB3434; background:rgba(235,52,52,.04); }

  .pg-select { width:100%; background:#F8F9FA; border:1.5px solid rgba(11,94,215,.14); border-radius:10px; padding:13px 46px 13px 48px; color:#212529; font-family:'Epilogue',sans-serif; font-size:14px; outline:none; cursor:pointer; appearance:none; transition:all .25s; }
  .pg-select:focus { border-color:#0B5ED7; background:#fff; box-shadow:0 0 0 3px rgba(11,94,215,.08); }
  .pg-select.tf:focus { border-color:#20C997; box-shadow:0 0 0 3px rgba(32,201,151,.1); }
  .pg-select option { background:#fff; color:#212529; }
  .pg-select.err { border-color:#EB3434; }

  .pg-trail { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:15px; color:#bec8d2; transition:color .2s; padding:0; line-height:1; }
  .pg-trail:hover { color:#0B5ED7; }
  .pg-err-msg { font-size:12px; color:#EB3434; margin-top:6px; padding-left:4px; animation:pg-slideR .28s ease both; display:flex; align-items:center; gap:4px; }

  /* ── TAGS ── */
  .pg-tags-wrap { width:100%; background:#F8F9FA; border:1.5px solid rgba(11,94,215,.14); border-radius:10px; padding:10px 14px 10px 48px; min-height:50px; display:flex; flex-wrap:wrap; gap:7px; align-items:center; transition:all .25s; cursor:text; }
  .pg-tags-wrap:focus-within { border-color:#20C997; background:#fff; box-shadow:0 0 0 3px rgba(32,201,151,.1); }
  .pg-tag { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px; background:rgba(32,201,151,.1); border:1px solid rgba(32,201,151,.3); color:#17a680; font-size:12px; font-weight:500; animation:pg-tagPop .25s ease both; }
  .pg-tag-del { background:none; border:none; cursor:pointer; color:#17a680; font-size:14px; line-height:1; padding:0; opacity:.6; transition:opacity .15s; }
  .pg-tag-del:hover { opacity:1; }
  .pg-tags-input { border:none; outline:none; background:transparent; font-family:'Epilogue',sans-serif; font-size:13px; color:#212529; flex:1; min-width:120px; }
  .pg-tags-input::placeholder { color:#bec8d2; }

  /* ── BUTTONS ── */
  .pg-btn { width:100%; padding:14px; border-radius:10px; border:none; cursor:pointer; font-family:'Syne',sans-serif; font-weight:700; font-size:15px; letter-spacing:.3px; background:linear-gradient(135deg,#0B5ED7 0%,#1a6ee8 50%,#094bb3 100%); color:#fff; transition:all .22s; position:relative; overflow:hidden; box-shadow:0 4px 16px rgba(11,94,215,.2); }
  .pg-btn:hover:not(:disabled) { box-shadow:0 8px 28px rgba(11,94,215,.32); transform:translateY(-2px); }
  .pg-btn:active:not(:disabled) { transform:translateY(0); }
  .pg-btn:disabled { opacity:.55; cursor:not-allowed; }
  .pg-btn.tb { background:linear-gradient(135deg,#20C997 0%,#25dba6 50%,#17a680 100%); box-shadow:0 4px 16px rgba(32,201,151,.25); }
  .pg-btn.tb:hover:not(:disabled) { box-shadow:0 8px 28px rgba(32,201,151,.38); }
  .pg-btn .rpl { position:absolute; border-radius:50%; background:rgba(255,255,255,.3); width:8px; height:8px; animation:pg-ripple .6s ease-out forwards; pointer-events:none; }

  .pg-back-btn { padding:13px 20px; background:#F8F9FA; border:1.5px solid rgba(11,94,215,.14); border-radius:10px; cursor:pointer; font-family:'Epilogue',sans-serif; font-size:14px; color:#8fa3b8; transition:all .2s; white-space:nowrap; }
  .pg-back-btn:hover { border-color:#0B5ED7; color:#0B5ED7; background:rgba(11,94,215,.04); }

  .pg-social-row { display:flex; gap:10px; margin-bottom:4px; }
  .pg-social-btn { flex:1; padding:11px; background:#F8F9FA; border:1.5px solid rgba(11,94,215,.1); border-radius:10px; cursor:pointer; font-family:'Epilogue',sans-serif; font-size:13px; font-weight:500; color:#495057; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:8px; }
  .pg-social-btn:hover { border-color:#0B5ED7; color:#0B5ED7; background:rgba(11,94,215,.04); }

  .pg-divider { display:flex; align-items:center; gap:14px; margin:16px 0; }
  .pg-divider::before,.pg-divider::after { content:''; flex:1; height:1px; background:rgba(11,94,215,.08); }

  /* ── STEP DOTS ── */
  .pg-step-dot { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-size:12px; font-weight:700; flex-shrink:0; transition:all .32s; border:2px solid rgba(11,94,215,.15); background:#F8F9FA; color:#bec8d2; }
  .pg-step-dot.act-u { border-color:#0B5ED7; background:rgba(11,94,215,.08); color:#0B5ED7; box-shadow:0 0 14px rgba(11,94,215,.18); }
  .pg-step-dot.act-t { border-color:#20C997; background:rgba(32,201,151,.08); color:#20C997; box-shadow:0 0 14px rgba(32,201,151,.18); }
  .pg-step-dot.done  { border-color:#20C997; background:linear-gradient(135deg,#20C997,#17a680); color:#fff; }
  .pg-step-panel { animation:pg-stepIn .35s cubic-bezier(.16,1,.3,1) both; }

  /* ── PASSWORD STRENGTH ── */
  .pg-str-bar { display:flex; gap:4px; margin-top:8px; }
  .pg-str-seg { flex:1; height:4px; border-radius:2px; background:rgba(11,94,215,.07); transition:background .4s; }

  /* ── ALERT ── */
  .pg-alert { padding:12px 16px; border-radius:10px; margin-bottom:14px; display:flex; align-items:flex-start; gap:10px; font-size:13px; animation:pg-slideR .25s ease; }
  .pg-alert.error { background:rgba(235,52,52,.07); border:1px solid rgba(235,52,52,.22); color:#EB3434; }
  .pg-alert.warn  { background:rgba(245,158,11,.07); border:1px solid rgba(245,158,11,.22); color:#b45309; }

  /* ── MISC ── */
  .pg-badge { display:inline-flex; align-items:center; gap:6px; padding:5px 12px; border-radius:100px; font-family:'DM Mono',monospace; font-size:10px; font-weight:600; letter-spacing:1px; }
  .pg-chip { font-family:'DM Mono',monospace; font-size:10px; padding:4px 10px; border-radius:6px; background:rgba(11,94,215,.06); border:1px solid rgba(11,94,215,.14); color:#0B5ED7; }
  .pg-sec { margin-top:20px; padding:13px 16px; background:rgba(32,201,151,.05); border:1px solid rgba(32,201,151,.18); border-radius:10px; display:flex; align-items:flex-start; gap:10px; }
  .pg-link { color:#0B5ED7; cursor:pointer; font-weight:600; transition:opacity .2s; }
  .pg-link:hover { opacity:.72; }
  .pg-checkbox { appearance:none; width:17px; height:17px; border-radius:5px; border:1.5px solid rgba(11,94,215,.25); background:#fff; cursor:pointer; transition:all .2s; flex-shrink:0; position:relative; }
  .pg-checkbox:checked { background:#0B5ED7; border-color:#0B5ED7; }
  .pg-checkbox:checked::after { content:'✓'; position:absolute; color:white; font-size:11px; font-weight:800; top:50%; left:50%; transform:translate(-50%,-50%); font-family:'Syne',sans-serif; }
  .pg-slabel { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:2px; color:#bec8d2; margin:16px 0 10px; text-transform:uppercase; display:flex; align-items:center; gap:10px; }
  .pg-slabel::after { content:''; flex:1; height:1px; background:rgba(11,94,215,.07); }
  .pg-avail-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:6px; }
  .pg-avail-chip { padding:8px 4px; text-align:center; border-radius:8px; cursor:pointer; border:1.5px solid rgba(11,94,215,.1); background:#F8F9FA; font-size:12px; color:#8fa3b8; transition:all .2s; }
  .pg-avail-chip:hover { border-color:rgba(32,201,151,.4); color:#20C997; }
  .pg-avail-chip.sel { border-color:#20C997; background:rgba(32,201,151,.08); color:#17a680; font-weight:600; }

  @media(max-width:860px){ .pg-left{display:none!important;} .pg-right{padding:32px 20px;} }
  @media(max-width:480px){ .pg-right{padding:24px 16px;} .pg-role-grid{grid-template-columns:1fr;} }
`;

/* ── HELPERS ────────────────────────────────────────────────────────────────── */
function getStrength(pw) {
  if (!pw) return { score:0, label:"", color:"" };
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return [
    {},
    { score:1, label:"Weak",        color:"#EB3434" },
    { score:2, label:"Fair",        color:"#f59e0b" },
    { score:3, label:"Good",        color:"#6EA8FE" },
    { score:4, label:"Strong",      color:"#0B5ED7" },
    { score:5, label:"Very Strong", color:"#20C997" },
  ][s] || { score:s, label:"", color:"" };
}

function Pulse({ color = "#20C997" }) {
  return (
    <span style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center", width:10, height:10 }}>
      <span style={{ position:"absolute", width:10, height:10, borderRadius:"50%", background:color, opacity:.3, animation:"pg-ripple 1.6s ease-out infinite" }}/>
      <span style={{ width:6, height:6, borderRadius:"50%", background:color, display:"block" }}/>
    </span>
  );
}

function StepBar({ step, total, isTech }) {
  return (
    <div style={{ display:"flex", alignItems:"center", marginBottom:22 }}>
      {Array.from({ length:total }, (_, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", flex:i < total-1 ? 1 : 0 }}>
          <div className={`pg-step-dot ${i < step ? "done" : i === step ? (isTech ? "act-t" : "act-u") : ""}`}>
            {i < step ? "✓" : i+1}
          </div>
          {i < total-1 && (
            <div style={{ flex:1, height:2, margin:"0 4px", background:i < step ? "linear-gradient(90deg,#20C997,#0B5ED7)" : "rgba(11,94,215,.08)", transition:"background .4s" }}/>
          )}
        </div>
      ))}
    </div>
  );
}

function DNAHelix() {
  return (
    <div style={{ position:"relative", width:56, height:260, margin:"0 auto" }}>
      {Array.from({ length:13 }, (_, i) => {
        const a = (i/13)*Math.PI*3, x1 = 10+Math.sin(a)*16, x2 = 46-Math.sin(a)*16, y = i*20;
        const op = 0.3 + Math.abs(Math.sin(a))*0.7;
        const c1 = i===4||i===10 ? "#EB3434" : i%2===0 ? "#0B5ED7" : "#20C997";
        const c2 = i===4||i===10 ? "#EB3434" : i%2===0 ? "#20C997" : "#6EA8FE";
        return (
          <div key={i}>
            <div style={{ position:"absolute", width:10, height:10, borderRadius:"50%", background:c1, left:x1-5, top:y, opacity:op, boxShadow:`0 0 7px ${c1}88`, animation:`pg-dnaNode ${1.4+i*.1}s ${i*.1}s ease-in-out infinite` }}/>
            <div style={{ position:"absolute", width:10, height:10, borderRadius:"50%", background:c2, left:x2-5, top:y, opacity:op, boxShadow:`0 0 7px ${c2}88`, animation:`pg-dnaNode ${1.4+i*.1}s ${i*.13}s ease-in-out infinite` }}/>
            <div style={{ position:"absolute", left:Math.min(x1,x2), top:y+4, width:Math.abs(x2-x1), height:1.5, background:`linear-gradient(90deg,${c1},${c2})`, opacity:op*.35 }}/>
          </div>
        );
      })}
    </div>
  );
}

function TagsInput({ value, onChange, placeholder, icon }) {
  const [input, setInput] = useState("");
  const add = () => { const t = input.trim(); if (t && !value.includes(t)) onChange([...value, t]); setInput(""); };
  const del = (i) => onChange(value.filter((_, j) => j !== i));
  return (
    <div className="pg-field">
      <span className="pg-field-icon">{icon || "🏷"}</span>
      <div className="pg-tags-wrap" onClick={e => e.currentTarget.querySelector("input").focus()}>
        {value.map((t, i) => (
          <span key={i} className="pg-tag">{t}<button className="pg-tag-del" onClick={() => del(i)}>×</button></span>
        ))}
        <input className="pg-tags-input" value={input}
          placeholder={value.length === 0 ? placeholder : "Add more..."}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
            if (e.key === "Backspace" && !input && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={add}/>
      </div>
      {value.length > 0 && <div style={{ fontSize:11, color:"#bec8d2", marginTop:3, paddingLeft:4 }}>Enter or comma to add · Backspace to remove</div>}
    </div>
  );
}

const SPECS  = ["Pharmacogenomics","Hematology","Oncology","Cardiology","Neurology","Endocrinology","Immunology","Pathology","Microbiology","General Lab"];
const RADIUS = ["5 km","10 km","15 km","20 km","25 km","30 km+"];
const GENES  = ["CYP2D6","CYP2C19","TPMT","DPYD","SLCO1B1","VKORC1"];
const DAYS   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN REGISTER COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
export default function RegisterPage({ onNavigateToLogin }) {
  const navigate = useNavigate();

  const [role,    setRole]    = useState(null); // null | "user" | "tech"
  const [step,    setStep]    = useState(0);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [done,    setDone]    = useState(false); // registration complete
  const btnRef = useRef(null);
  const isTech = role === "tech";

  // User form state
  const [uF, setUF] = useState({ firstName:"", lastName:"", email:"", phone:"", password:"", confirmPw:"", address:"", agree:false });
  const setU = (k, v) => setUF(f => ({ ...f, [k]:v }));

  // Tech form state
  const [tF, setTF] = useState({
    firstName:"", lastName:"", email:"", phone:"", password:"", confirmPw:"",
    specialization:"", certNumber:"", experience:"",
    institution:"", degree:"", gradYear:"", bio:"",
    achievements:[], certifications:[], languages:[],
    availability:[], serviceRadius:"", agree:false,
  });
  const setT = (k, v) => setTF(f => ({ ...f, [k]:v }));

  const pw       = isTech ? tF.password   : uF.password;
  const cpw      = isTech ? tF.confirmPw  : uF.confirmPw;
  const strength = getStrength(pw);

  useEffect(() => {
    if (!document.getElementById("pg-r-css")) {
      const el = document.createElement("style"); el.id = "pg-r-css"; el.textContent = css; document.head.appendChild(el);
    }
    const session = loadSession();
    if (session) navigate("/profile");
  }, []);

  const addRipple = (ev) => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect(), id = Date.now();
    setRipples(p => [...p, { id, x: ev.clientX-r.left, y: ev.clientY-r.top }]);
    setTimeout(() => setRipples(p => p.filter(x => x.id !== id)), 700);
  };

  const clr = (k) => setErrors(p => ({ ...p, [k]:"" }));
  const err = (k) => errors[k] && <div className="pg-err-msg"><span>⚠</span>{errors[k]}</div>;

  // ── VALIDATORS ──────────────────────────────────────────────────────────────
  const vU0 = () => {
    const e = {};
    if (!uF.firstName.trim())  e.firstName = "First name required";
    if (!uF.lastName.trim())   e.lastName  = "Last name required";
    if (!uF.email.trim())      e.email = "Email required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(uF.email)) e.email = "Enter a valid email";
    else if (emailExists(uF.email)) e.email = "An account with this email already exists";
    if (!uF.phone.trim())      e.phone = "Phone number required";
    if (!uF.password)          e.password = "Password required";
    else if (uF.password.length < 8) e.password = "Min 8 characters";
    else if (strength.score < 2)     e.password = "Choose a stronger password";
    if (!uF.confirmPw)         e.confirmPw = "Please confirm password";
    else if (uF.password !== uF.confirmPw) e.confirmPw = "Passwords do not match";
    return e;
  };
  const vU1 = () => {
    const e = {};
    if (!uF.address.trim()) e.address = "Home address required for booking";
    if (!uF.agree)          e.agree   = "You must accept the terms";
    return e;
  };
  const vT0 = () => {
    const e = {};
    if (!tF.firstName.trim())  e.firstName = "First name required";
    if (!tF.lastName.trim())   e.lastName  = "Last name required";
    if (!tF.email.trim())      e.email = "Email required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tF.email)) e.email = "Enter a valid email";
    else if (emailExists(tF.email)) e.email = "An account with this email already exists";
    if (!tF.phone.trim())      e.phone = "Phone required";
    if (!tF.password)          e.password = "Password required";
    else if (tF.password.length < 8) e.password = "Min 8 characters";
    else if (strength.score < 2)     e.password = "Choose a stronger password";
    if (!tF.confirmPw)         e.confirmPw = "Please confirm password";
    else if (tF.password !== tF.confirmPw) e.confirmPw = "Passwords do not match";
    return e;
  };
  const vT1 = () => {
    const e = {};
    if (!tF.specialization) e.specialization = "Select your specialization";
    if (!tF.certNumber.trim()) e.certNumber = "License/Cert number required";
    if (!tF.institution.trim()) e.institution = "Institution required";
    if (!tF.degree.trim()) e.degree = "Degree/qualification required";
    if (!tF.bio.trim()) e.bio = "Brief bio required";
    return e;
  };
  const vT2 = () => {
    const e = {};
    if (tF.availability.length === 0) e.availability = "Select at least one available day";
    if (!tF.agree) e.agree = "You must accept the terms";
    return e;
  };

  // ── NEXT / SUBMIT ────────────────────────────────────────────────────────────
  const handleNext = async () => {
    let e = {};
    if (!isTech) {
      if (step === 0) e = vU0(); else e = vU1();
    } else {
      if (step === 0) e = vT0(); else if (step === 1) e = vT1(); else e = vT2();
    }
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});

    const total = isTech ? 3 : 2;
    if (step < total - 1) {
      setStep(s => s + 1);
    } else {
      // ── FINAL STEP: CREATE ACCOUNT ──────────────────────────────────────────
      setLoading(true);
      await new Promise(r => setTimeout(r, 2000));
      setLoading(false);

      // Build new user object (mirrors AUTH_CONFIG.USERS shape)
      const newUser = isTech
        ? {
            id: `usr_t_${Date.now()}`,
            email: tF.email,
            password: tF.password,
            name: `${tF.firstName} ${tF.lastName}`,
            role: "technician",
            title: tF.degree ? tF.specialization : "Technician",
            institution: tF.institution,
            avatar: `${tF.firstName[0]}${tF.lastName[0]}`.toUpperCase(),
            avatarGradient: "linear-gradient(135deg,#20C997,#0B5ED7)",
            joinedDate: new Date().toLocaleDateString("en-US", { month:"short", year:"numeric" }),
            stats: { analyses:0, reports:0, accuracy:"N/A" },
          }
        : {
            id: `usr_u_${Date.now()}`,
            email: uF.email,
            password: uF.password,
            name: `${uF.firstName} ${uF.lastName}`,
            role: "user",
            title: "",
            institution: uF.address || "Home",
            avatar: `${uF.firstName[0]}${uF.lastName[0]}`.toUpperCase(),
            avatarGradient: "linear-gradient(135deg,#0B5ED7,#6EA8FE)",
            joinedDate: new Date().toLocaleDateString("en-US", { month:"short", year:"numeric" }),
            stats: { analyses:0, reports:0, accuracy:"N/A" },
          };

      // Persist new user in USERS array (runtime only — in production, call backend API)
      AUTH_CONFIG.USERS.push(newUser);

      // Auto-login: save session
      saveSession(newUser);

      // Show success, then redirect
      setDone(true);
      setTimeout(() => navigate("/profile"), 2200);
    }
  };

  const switchRole = () => { setRole(null); setStep(0); setErrors({}); };

  // ── LEFT PANEL DATA ─────────────────────────────────────────────────────────
  const leftData = {
    user: {
      badge:"BOOK A HOME VISIT", badgeColor:"rgba(11,94,215,.07)", badgeBorder:"rgba(11,94,215,.18)", badgeText:"#0B5ED7",
      headline: <> Get Tested<br/><span style={{ background:"linear-gradient(135deg,#0B5ED7,#20C997)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>At Home.</span></>,
      desc: "Register as a User to book certified pharmacogenomics technicians for comfortable at-home genetic testing.",
      benefits: [{i:"🏠",t:"Technician comes to your home"},{i:"⚡",t:"Results within 48 hours"},{i:"🧬",t:"Full pharmacogenomic panel"},{i:"📋",t:"Digital report for your doctor"},{i:"🔒",t:"100% private & secure"}],
      stat: { n:"98%", d:"Patient satisfaction rate", s:"PharmaGuard Reports, 2025" }, statColor:"#0B5ED7",
    },
    tech: {
      badge:"JOIN AS TECHNICIAN", badgeColor:"rgba(32,201,151,.07)", badgeBorder:"rgba(32,201,151,.2)", badgeText:"#17a680",
      headline: <>Grow Your<br/><span style={{ background:"linear-gradient(135deg,#20C997,#0B5ED7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Career.</span></>,
      desc: "Build your professional profile, showcase credentials and achievements, and accept at-home visit bookings from patients.",
      benefits: [{i:"👤",t:"Verified professional profile"},{i:"📅",t:"Set your own schedule & radius"},{i:"🏅",t:"Showcase certifications"},{i:"💼",t:"Grow your client base"},{i:"💳",t:"Secure payment system"}],
      stat: { n:"1,800+", d:"Active technicians on platform", s:"Platform data, 2025" }, statColor:"#20C997",
    },
  };
  const lc = leftData[role || "user"];

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div className="pg-root">
      <div className="pg-grid-bg"/>
      <div className="pg-orb" style={{ width:560, height:560, top:"-18%", left:"-8%", background:"radial-gradient(circle,rgba(11,94,215,.07) 0%,transparent 68%)", animationDuration:"16s" }}/>
      <div className="pg-orb" style={{ width:340, height:340, bottom:"-14%", right:"10%", background:"radial-gradient(circle,rgba(32,201,151,.07) 0%,transparent 68%)", animationDuration:"12s", animationDelay:"4s" }}/>
      <div className="pg-orb" style={{ width:200, height:200, top:"15%", right:"6%", background:"radial-gradient(circle,rgba(235,52,52,.04) 0%,transparent 68%)", animationDuration:"9s", animationDelay:"7s" }}/>

      {/* ── LEFT PANEL ────────────────────────────────────────────────────────── */}
      <aside className="pg-left">
        <div className="pg-scan-line"/>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:13, marginBottom:40 }}>
            <div style={{ width:46, height:46, borderRadius:12, background:"linear-gradient(135deg,#0B5ED7,#094bb3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:"0 6px 22px rgba(11,94,215,.3)" }}>🧬</div>
            <div>
              <div className="pg-syne" style={{ fontSize:20, fontWeight:800, color:"#0B5ED7" }}>PharmaGuard</div>
              <div className="pg-mono" style={{ fontSize:9, color:"#20C997", letterSpacing:3 }}>PRECISION MEDICINE</div>
            </div>
          </div>
          <div className="pg-badge" style={{ background:lc.badgeColor, border:`1px solid ${lc.badgeBorder}`, color:lc.badgeText, marginBottom:22 }}>
            <Pulse color={lc.badgeText}/> {lc.badge}
          </div>
          <h2 className="pg-syne" style={{ fontSize:"clamp(28px,3vw,42px)", fontWeight:800, color:"#212529", lineHeight:1.1, marginBottom:14 }}>{lc.headline}</h2>
          <p style={{ fontSize:14, lineHeight:1.85, color:"#8fa3b8", maxWidth:330, marginBottom:26 }}>{lc.desc}</p>
          {lc.benefits.map((b, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:11, animation:`pg-slideR .4s ${i*.07}s ease both` }}>
              <div style={{ width:32, height:32, borderRadius:8, background:isTech?"rgba(32,201,151,.07)":"rgba(11,94,215,.07)", border:`1px solid ${isTech?"rgba(32,201,151,.15)":"rgba(11,94,215,.15)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{b.i}</div>
              <span style={{ fontSize:13, color:"#495057" }}>{b.t}</span>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
          <DNAHelix/>
          <div style={{ padding:"14px 20px", background:"rgba(255,255,255,.97)", border:`1px solid ${isTech?"rgba(32,201,151,.18)":"rgba(11,94,215,.14)"}`, borderRadius:12, textAlign:"center", boxShadow:"0 8px 28px rgba(11,94,215,.08)" }}>
            <div className="pg-syne" style={{ fontSize:24, fontWeight:800, color:lc.stat.n.includes("+")?"#20C997":"#0B5ED7" }}>{lc.stat.n}</div>
            <div style={{ fontSize:11, color:"#8fa3b8", marginTop:2 }}>{lc.stat.d}</div>
            <div className="pg-mono" style={{ fontSize:9, color:"#bec8d2", marginTop:4 }}>{lc.stat.s}</div>
          </div>
        </div>

        <div>
          <div className="pg-mono" style={{ fontSize:9, color:"#bec8d2", letterSpacing:2, marginBottom:10 }}>COVERED PHARMACOGENES</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{GENES.map(g => <span key={g} className="pg-chip">{g}</span>)}</div>
          <div className="pg-mono" style={{ fontSize:10, color:"#d0dce8", marginTop:8 }}>+ 9 more covered</div>
        </div>
      </aside>

      {/* ── RIGHT PANEL ───────────────────────────────────────────────────────── */}
      <main className="pg-right">
        <div className="pg-card">

          {/* ══ REGISTRATION COMPLETE ══ */}
          {done && (
            <div style={{ textAlign:"center", padding:"50px 0", animation:"pg-fadeUp 0.5s ease" }}>
              <div style={{ width:88, height:88, borderRadius:"50%", background:isTech?"rgba(32,201,151,.08)":"rgba(11,94,215,.06)", border:`2px solid ${isTech?"#20C997":"#0B5ED7"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, margin:"0 auto 20px", animation:"pg-successP .5s ease", color:isTech?"#20C997":"#0B5ED7" }}>✓</div>
              <div className="pg-syne" style={{ fontSize:24, fontWeight:800, color:"#212529", marginBottom:6 }}>
                Account Created!
              </div>
              <div style={{ fontSize:14, color:"#8fa3b8", marginBottom:24 }}>Signing you in and redirecting...</div>
              <div style={{ width:36, height:36, borderRadius:"50%", border:`3px solid ${isTech?"rgba(32,201,151,.15)":"rgba(11,94,215,.15)"}`, borderTopColor:isTech?"#20C997":"#0B5ED7", animation:"pg-spin .8s linear infinite", margin:"0 auto" }}/>
            </div>
          )}

          {/* ══ ROLE PICKER ══ */}
          {!role && !done && (
            <div style={{ animation:"pg-fadeUp .5s ease both" }}>
              <div style={{ marginBottom:4 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <span className="pg-mono" style={{ fontSize:10, color:"#0B5ED7", letterSpacing:2 }}>CREATE ACCOUNT</span>
                  <Pulse/><span className="pg-mono" style={{ fontSize:10, color:"#bec8d2" }}>FREE FOREVER</span>
                </div>
                <h1 className="pg-syne" style={{ fontSize:30, fontWeight:800, color:"#212529", marginBottom:4 }}>Join PharmaGuard</h1>
                <p style={{ fontSize:14, color:"#8fa3b8" }}>Choose how you'd like to use the platform</p>
              </div>

              <div className="pg-role-grid">
                <div className="pg-role-card" onClick={() => setRole("user")}>
                  <div className="pg-role-chk">✓</div>
                  <span className="pg-role-icon">🙋</span>
                  <div className="pg-syne" style={{ fontSize:16, fontWeight:800, color:"#212529", marginBottom:6 }}>User</div>
                  <div style={{ fontSize:12, color:"#8fa3b8", lineHeight:1.55 }}>Book a certified technician for at-home genetic testing</div>
                  <div style={{ marginTop:12, display:"flex", flexWrap:"wrap", gap:5, justifyContent:"center" }}>
                    {["🏠 Home Visit","📋 Reports","💊 Drug Safety"].map(t => (
                      <span key={t} style={{ fontSize:10, padding:"3px 8px", borderRadius:20, background:"rgba(11,94,215,.07)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,.14)" }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div className="pg-role-card" onClick={() => setRole("tech")}>
                  <div className="pg-role-chk">✓</div>
                  <span className="pg-role-icon">🔬</span>
                  <div className="pg-syne" style={{ fontSize:16, fontWeight:800, color:"#212529", marginBottom:6 }}>Technician</div>
                  <div style={{ fontSize:12, color:"#8fa3b8", lineHeight:1.55 }}>Build your profile, list credentials & accept home-visit bookings</div>
                  <div style={{ marginTop:12, display:"flex", flexWrap:"wrap", gap:5, justifyContent:"center" }}>
                    {["🏅 Portfolio","📅 Bookings","💳 Earnings"].map(t => (
                      <span key={t} style={{ fontSize:10, padding:"3px 8px", borderRadius:20, background:"rgba(32,201,151,.08)", color:"#17a680", border:"1px solid rgba(32,201,151,.2)" }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              <p style={{ textAlign:"center", fontSize:14, color:"#8fa3b8", marginTop:4 }}>
                Already have an account? <span className="pg-link" onClick={onNavigateToLogin}>Sign in</span>
              </p>
            </div>
          )}

          {/* ══ USER FLOW ══ */}
          {role === "user" && !done && (
            <>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                    <span className="pg-mono" style={{ fontSize:10, color:"#0B5ED7", letterSpacing:2 }}>USER REGISTRATION</span>
                    <Pulse color="#0B5ED7"/>
                  </div>
                  <h1 className="pg-syne" style={{ fontSize:26, fontWeight:800, color:"#212529" }}>
                    {step === 0 ? "Create Account" : "Home Details"}
                  </h1>
                  <p style={{ fontSize:13, color:"#8fa3b8", marginTop:2 }}>{step === 0 ? "Login credentials & contact info" : "Address for booking technicians"}</p>
                </div>
                <button onClick={switchRole} style={{ background:"rgba(11,94,215,.06)", border:"1.5px solid rgba(11,94,215,.14)", borderRadius:8, padding:"6px 12px", fontSize:12, color:"#0B5ED7", cursor:"pointer", fontFamily:"'Epilogue',sans-serif", whiteSpace:"nowrap" }}>← Switch</button>
              </div>
              <StepBar step={step} total={2} isTech={false}/>

              {/* User Step 0 */}
              {step === 0 && (
                <div className="pg-step-panel">
                  <div className="pg-social-row">
                    {[{ icon:"G", label:"Google" },{ icon:"🏥", label:"Hospital SSO" }].map(s => (
                      <button key={s.label} type="button" className="pg-social-btn"><span style={{ fontWeight:700 }}>{s.icon}</span>{s.label}</button>
                    ))}
                  </div>
                  <div className="pg-divider"><span className="pg-mono" style={{ fontSize:10, color:"#bec8d2", letterSpacing:1 }}>OR REGISTER WITH EMAIL</span></div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <div className="pg-field"><span className="pg-field-icon">👤</span>
                      <input className={`pg-input${errors.firstName?" err":""}`} placeholder="First name" value={uF.firstName} onChange={e=>{setU("firstName",e.target.value);clr("firstName");}}/>{err("firstName")}
                    </div>
                    <div className="pg-field"><span className="pg-field-icon">👤</span>
                      <input className={`pg-input${errors.lastName?" err":""}`} placeholder="Last name" value={uF.lastName} onChange={e=>{setU("lastName",e.target.value);clr("lastName");}}/>{err("lastName")}
                    </div>
                  </div>

                  <div className="pg-field"><span className="pg-field-icon">✉</span>
                    <input className={`pg-input${errors.email?" err":uF.email&&!errors.email?" ok":""}`} type="email" placeholder="your@email.com" value={uF.email} onChange={e=>{setU("email",e.target.value);clr("email");}} autoComplete="email"/>
                    {uF.email&&!errors.email&&<span className="pg-trail" style={{color:"#20C997",pointerEvents:"none"}}>✓</span>}
                    {err("email")}
                  </div>

                  <div className="pg-field"><span className="pg-field-icon">📱</span>
                    <input className={`pg-input${errors.phone?" err":""}`} type="tel" placeholder="Phone number" value={uF.phone} onChange={e=>{setU("phone",e.target.value);clr("phone");}}/>{err("phone")}
                  </div>

                  <div className="pg-field"><span className="pg-field-icon">🔐</span>
                    <input className={`pg-input${errors.password?" err":""}`} type={showPw?"text":"password"} placeholder="Create a strong password" value={uF.password} onChange={e=>{setU("password",e.target.value);clr("password");}} autoComplete="new-password"/>
                    <button type="button" className="pg-trail" onClick={()=>setShowPw(v=>!v)}>{showPw?"🙈":"👁"}</button>
                    {uF.password && (<><div className="pg-str-bar">{[1,2,3,4,5].map(i=><div key={i} className="pg-str-seg" style={{background:i<=strength.score?strength.color:"rgba(11,94,215,.07)"}}/>)}</div><div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span style={{fontSize:11,color:"#bec8d2"}}>Strength</span><span style={{fontSize:11,color:strength.color,fontWeight:600}}>{strength.label}</span></div></>)}
                    {err("password")}
                  </div>

                  <div className="pg-field"><span className="pg-field-icon">🔑</span>
                    <input className={`pg-input${errors.confirmPw?" err":cpw&&uF.password===cpw?" ok":""}`} type={showCpw?"text":"password"} placeholder="Confirm your password" value={uF.confirmPw} onChange={e=>{setU("confirmPw",e.target.value);clr("confirmPw");}} autoComplete="new-password"/>
                    <button type="button" className="pg-trail" onClick={()=>setShowCpw(v=>!v)}>{showCpw?"🙈":"👁"}</button>
                    {err("confirmPw")}
                  </div>

                  <button className="pg-btn" ref={btnRef} style={{marginTop:6}} onClick={ev=>{addRipple(ev);handleNext();}}>
                    {ripples.map(r=><span key={r.id} className="rpl" style={{left:r.x-4,top:r.y-4}}/>)}Continue →
                  </button>
                  <p style={{textAlign:"center",marginTop:18,fontSize:14,color:"#8fa3b8"}}>Already have an account? <span className="pg-link" onClick={onNavigateToLogin}>Sign in</span></p>
                </div>
              )}

              {/* User Step 1 */}
              {step === 1 && (
                <div className="pg-step-panel">
                  <div style={{padding:"12px 15px",background:"rgba(11,94,215,.04)",border:"1.5px solid rgba(11,94,215,.12)",borderRadius:10,marginBottom:18,display:"flex",gap:10,alignItems:"flex-start"}}>
                    <span style={{fontSize:18,flexShrink:0}}>🏠</span>
                    <div style={{fontSize:13,color:"#495057",lineHeight:1.6}}>Your home address is used <strong>only</strong> to match you with nearby technicians. It's never shared publicly.</div>
                  </div>
                  <div className="pg-field">
                    <span className="pg-field-top">📍</span>
                    <textarea className={`pg-textarea${errors.address?" err":""}`} placeholder="Full home address (street, city, postal code, state)" value={uF.address} onChange={e=>{setU("address",e.target.value);clr("address");}} style={{paddingLeft:48}}/>
                    {err("address")}
                  </div>
                  <div style={{marginBottom:20}}>
                    <label style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer"}}>
                      <input type="checkbox" className="pg-checkbox" style={{marginTop:2}} checked={uF.agree} onChange={e=>{setU("agree",e.target.checked);clr("agree");}}/>
                      <span style={{fontSize:13,color:"#8fa3b8",lineHeight:1.75}}>I agree to PharmaGuard's <span className="pg-link">Terms of Service</span> and <span className="pg-link">Privacy Policy</span>. I understand home-visit bookings are confirmed by the technician.</span>
                    </label>{err("agree")}
                  </div>
                  <div style={{display:"flex",gap:10}}>
                    <button className="pg-back-btn" onClick={()=>{setStep(0);setErrors({});}}>← Back</button>
                    <button className="pg-btn" ref={btnRef} disabled={loading} onClick={ev=>{addRipple(ev);handleNext();}}>
                      {ripples.map(r=><span key={r.id} className="rpl" style={{left:r.x-4,top:r.y-4}}/>)}
                      {loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10}}><span style={{width:16,height:16,borderRadius:"50%",border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",animation:"pg-spin .75s linear infinite",display:"inline-block"}}/>Creating account...</span>:"Create Account →"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ══ TECH FLOW ══ */}
          {role === "tech" && !done && (
            <>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                    <span className="pg-mono" style={{fontSize:10,color:"#20C997",letterSpacing:2}}>TECHNICIAN REGISTRATION</span>
                    <Pulse color="#20C997"/>
                  </div>
                  <h1 className="pg-syne" style={{fontSize:25,fontWeight:800,color:"#212529"}}>
                    {step===0?"Account Setup":step===1?"Profile & Credentials":"Availability & Terms"}
                  </h1>
                  <p style={{fontSize:13,color:"#8fa3b8",marginTop:2}}>
                    {step===0?"Secure login credentials":step===1?"Education, achievements & bio":"Schedule, area & confirmation"}
                  </p>
                </div>
                <button onClick={switchRole} style={{background:"rgba(32,201,151,.06)",border:"1.5px solid rgba(32,201,151,.18)",borderRadius:8,padding:"6px 12px",fontSize:12,color:"#17a680",cursor:"pointer",fontFamily:"'Epilogue',sans-serif",whiteSpace:"nowrap"}}>← Switch</button>
              </div>
              <StepBar step={step} total={3} isTech={true}/>

              {/* Tech Step 0 */}
              {step === 0 && (
                <div className="pg-step-panel">
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    <div className="pg-field tf"><span className="pg-field-icon">👤</span>
                      <input className={`pg-input tf${errors.firstName?" err":""}`} placeholder="First name" value={tF.firstName} onChange={e=>{setT("firstName",e.target.value);clr("firstName");}}/>{err("firstName")}
                    </div>
                    <div className="pg-field tf"><span className="pg-field-icon">👤</span>
                      <input className={`pg-input tf${errors.lastName?" err":""}`} placeholder="Last name" value={tF.lastName} onChange={e=>{setT("lastName",e.target.value);clr("lastName");}}/>{err("lastName")}
                    </div>
                  </div>
                  <div className="pg-field tf"><span className="pg-field-icon">✉</span>
                    <input className={`pg-input tf${errors.email?" err":tF.email&&!errors.email?" ok":""}`} type="email" placeholder="professional@email.com" value={tF.email} onChange={e=>{setT("email",e.target.value);clr("email");}} autoComplete="email"/>
                    {tF.email&&!errors.email&&<span className="pg-trail" style={{color:"#20C997",pointerEvents:"none"}}>✓</span>}
                    {err("email")}
                  </div>
                  <div className="pg-field tf"><span className="pg-field-icon">📱</span>
                    <input className={`pg-input tf${errors.phone?" err":""}`} type="tel" placeholder="Professional phone number" value={tF.phone} onChange={e=>{setT("phone",e.target.value);clr("phone");}}/>{err("phone")}
                  </div>
                  <div className="pg-field tf"><span className="pg-field-icon">🔐</span>
                    <input className={`pg-input tf${errors.password?" err":""}`} type={showPw?"text":"password"} placeholder="Create a strong password" value={tF.password} onChange={e=>{setT("password",e.target.value);clr("password");}} autoComplete="new-password"/>
                    <button type="button" className="pg-trail" onClick={()=>setShowPw(v=>!v)}>{showPw?"🙈":"👁"}</button>
                    {tF.password&&(<><div className="pg-str-bar">{[1,2,3,4,5].map(i=><div key={i} className="pg-str-seg" style={{background:i<=strength.score?strength.color:"rgba(32,201,151,.08)"}}/>)}</div><div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span style={{fontSize:11,color:"#bec8d2"}}>Strength</span><span style={{fontSize:11,color:strength.color,fontWeight:600}}>{strength.label}</span></div></>)}
                    {err("password")}
                  </div>
                  <div className="pg-field tf"><span className="pg-field-icon">🔑</span>
                    <input className={`pg-input tf${errors.confirmPw?" err":cpw&&tF.password===cpw?" ok":""}`} type={showCpw?"text":"password"} placeholder="Confirm your password" value={tF.confirmPw} onChange={e=>{setT("confirmPw",e.target.value);clr("confirmPw");}} autoComplete="new-password"/>
                    <button type="button" className="pg-trail" onClick={()=>setShowCpw(v=>!v)}>{showCpw?"🙈":"👁"}</button>
                    {err("confirmPw")}
                  </div>
                  <button className="pg-btn tb" ref={btnRef} style={{marginTop:6}} onClick={ev=>{addRipple(ev);handleNext();}}>
                    {ripples.map(r=><span key={r.id} className="rpl" style={{left:r.x-4,top:r.y-4}}/>)}Continue to Profile →
                  </button>
                  <p style={{textAlign:"center",marginTop:18,fontSize:14,color:"#8fa3b8"}}>Already have an account? <span className="pg-link" style={{color:"#20C997"}} onClick={onNavigateToLogin}>Sign in</span></p>
                </div>
              )}

              {/* Tech Step 1 */}
              {step === 1 && (
                <div className="pg-step-panel">
                  <div className="pg-slabel">Professional Info</div>
                  <div className="pg-field tf"><span className="pg-field-icon">🔬</span>
                    <select className={`pg-select tf${errors.specialization?" err":""}`} value={tF.specialization} onChange={e=>{setT("specialization",e.target.value);clr("specialization");}} style={{color:tF.specialization?"#212529":"#bec8d2"}}>
                      <option value="" disabled>Select your specialization</option>
                      {SPECS.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className="pg-trail" style={{pointerEvents:"none",color:"#bec8d2"}}>▾</span>{err("specialization")}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    <div className="pg-field tf"><span className="pg-field-icon">🪪</span>
                      <input className={`pg-input tf${errors.certNumber?" err":""}`} placeholder="License / Cert No." value={tF.certNumber} onChange={e=>{setT("certNumber",e.target.value);clr("certNumber");}}/>{err("certNumber")}
                    </div>
                    <div className="pg-field tf"><span className="pg-field-icon">📊</span>
                      <input className="pg-input tf" type="number" min="0" max="50" placeholder="Years of experience" value={tF.experience} onChange={e=>setT("experience",e.target.value)}/>
                    </div>
                  </div>
                  <div className="pg-slabel">Education</div>
                  <div className="pg-field tf"><span className="pg-field-icon">🏛</span>
                    <input className={`pg-input tf${errors.institution?" err":""}`} placeholder="University / College / Institution" value={tF.institution} onChange={e=>{setT("institution",e.target.value);clr("institution");}}/>{err("institution")}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    <div className="pg-field tf"><span className="pg-field-icon">🎓</span>
                      <input className={`pg-input tf${errors.degree?" err":""}`} placeholder="Degree / Qualification" value={tF.degree} onChange={e=>{setT("degree",e.target.value);clr("degree");}}/>{err("degree")}
                    </div>
                    <div className="pg-field tf"><span className="pg-field-icon">📅</span>
                      <input className="pg-input tf" type="number" min="1970" max="2026" placeholder="Graduation year" value={tF.gradYear} onChange={e=>setT("gradYear",e.target.value)}/>
                    </div>
                  </div>
                  <div className="pg-slabel">Achievements & Certifications</div>
                  <TagsInput value={tF.achievements} onChange={v=>setT("achievements",v)} placeholder="Add achievement (e.g. CPIC Certified 2023)…" icon="🏅"/>
                  <TagsInput value={tF.certifications} onChange={v=>setT("certifications",v)} placeholder="Add certification (e.g. ASCP, AMT, NCA)…" icon="📜"/>
                  <TagsInput value={tF.languages} onChange={v=>setT("languages",v)} placeholder="Languages you speak (e.g. English, Hindi)…" icon="🌐"/>
                  <div className="pg-slabel">Professional Bio</div>
                  <div className="pg-field tf">
                    <span className="pg-field-top">📝</span>
                    <textarea className={`pg-textarea tf${errors.bio?" err":""}`} placeholder="Write a short bio for your public profile..." value={tF.bio} onChange={e=>{setT("bio",e.target.value.slice(0,300));clr("bio");}} style={{paddingLeft:48,minHeight:100}}/>
                    <div style={{fontSize:11,color:tF.bio.length>270?"#EB3434":"#bec8d2",textAlign:"right",marginTop:3}}>{tF.bio.length}/300</div>
                    {err("bio")}
                  </div>
                  <div style={{display:"flex",gap:10}}>
                    <button className="pg-back-btn" onClick={()=>{setStep(0);setErrors({});}}>← Back</button>
                    <button className="pg-btn tb" ref={btnRef} onClick={ev=>{addRipple(ev);handleNext();}}>
                      {ripples.map(r=><span key={r.id} className="rpl" style={{left:r.x-4,top:r.y-4}}/>)}Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* Tech Step 2 */}
              {step === 2 && (
                <div className="pg-step-panel">
                  <div className="pg-slabel">Availability — Which days can you visit?</div>
                  <div className="pg-avail-grid">
                    {DAYS.map(d => (
                      <div key={d} className={`pg-avail-chip${tF.availability.includes(d)?" sel":""}`}
                        onClick={()=>{setT("availability",tF.availability.includes(d)?tF.availability.filter(x=>x!==d):[...tF.availability,d]);clr("availability");}}>
                        {d}
                      </div>
                    ))}
                  </div>
                  {err("availability")}
                  <div className="pg-slabel">Service Area</div>
                  <div className="pg-field tf"><span className="pg-field-icon">📍</span>
                    <select className="pg-select tf" value={tF.serviceRadius} onChange={e=>setT("serviceRadius",e.target.value)} style={{color:tF.serviceRadius?"#212529":"#bec8d2"}}>
                      <option value="" disabled>How far will you travel?</option>
                      {RADIUS.map(r=><option key={r} value={r}>{r}</option>)}
                    </select>
                    <span className="pg-trail" style={{pointerEvents:"none",color:"#bec8d2"}}>▾</span>
                  </div>

                  {/* Live profile preview */}
                  <div className="pg-slabel">Profile Preview</div>
                  <div style={{background:"rgba(32,201,151,.04)",border:"1.5px solid rgba(32,201,151,.16)",borderRadius:12,padding:"16px 18px",marginBottom:16}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                      <div style={{width:46,height:46,borderRadius:"50%",background:"linear-gradient(135deg,#20C997,#0B5ED7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"#fff",fontWeight:700,flexShrink:0}}>
                        {tF.firstName?tF.firstName[0].toUpperCase():"T"}
                      </div>
                      <div>
                        <div className="pg-syne" style={{fontWeight:800,color:"#212529",fontSize:15}}>{tF.firstName||"First"} {tF.lastName||"Last"}</div>
                        <div style={{fontSize:12,color:"#8fa3b8"}}>{tF.specialization||"Specialization"} · {tF.experience||"0"} yrs</div>
                      </div>
                      <span style={{marginLeft:"auto",fontSize:10,padding:"3px 10px",borderRadius:20,background:"rgba(32,201,151,.1)",color:"#17a680",border:"1px solid rgba(32,201,151,.25)",fontWeight:600}}>🟢 Active</span>
                    </div>
                    {tF.bio && <p style={{fontSize:12,color:"#495057",lineHeight:1.55,marginBottom:10,borderTop:"1px solid rgba(32,201,151,.1)",paddingTop:10}}>{tF.bio.slice(0,100)}{tF.bio.length>100?"…":""}</p>}
                    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                      {tF.achievements.slice(0,2).map((a,i)=><span key={i} style={{fontSize:10,padding:"3px 9px",borderRadius:20,background:"rgba(11,94,215,.07)",color:"#0B5ED7",border:"1px solid rgba(11,94,215,.14)"}}>🏅 {a}</span>)}
                      {tF.certifications.slice(0,2).map((c,i)=><span key={i} style={{fontSize:10,padding:"3px 9px",borderRadius:20,background:"rgba(32,201,151,.08)",color:"#17a680",border:"1px solid rgba(32,201,151,.2)"}}>📜 {c}</span>)}
                      {tF.availability.length>0 && <span style={{fontSize:10,padding:"3px 9px",borderRadius:20,background:"rgba(32,201,151,.08)",color:"#17a680",border:"1px solid rgba(32,201,151,.2)"}}>📅 {tF.availability.join(", ")}</span>}
                      {tF.serviceRadius && <span style={{fontSize:10,padding:"3px 9px",borderRadius:20,background:"rgba(11,94,215,.06)",color:"#0B5ED7",border:"1px solid rgba(11,94,215,.14)"}}>📍 {tF.serviceRadius}</span>}
                    </div>
                  </div>

                  <div style={{marginBottom:18}}>
                    <label style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer"}}>
                      <input type="checkbox" className="pg-checkbox" style={{marginTop:2}} checked={tF.agree} onChange={e=>{setT("agree",e.target.checked);clr("agree");}}/>
                      <span style={{fontSize:13,color:"#8fa3b8",lineHeight:1.75}}>I agree to PharmaGuard's <span className="pg-link" style={{color:"#20C997"}}>Technician Terms</span> and <span className="pg-link" style={{color:"#20C997"}}>Privacy Policy</span>. I confirm all listed credentials are accurate and verifiable.</span>
                    </label>{err("agree")}
                  </div>
                  <div style={{display:"flex",gap:10}}>
                    <button className="pg-back-btn" onClick={()=>{setStep(1);setErrors({});}}>← Back</button>
                    <button className="pg-btn tb" ref={btnRef} disabled={loading} onClick={ev=>{addRipple(ev);handleNext();}}>
                      {ripples.map(r=><span key={r.id} className="rpl" style={{left:r.x-4,top:r.y-4}}/>)}
                      {loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10}}><span style={{width:16,height:16,borderRadius:"50%",border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",animation:"pg-spin .75s linear infinite",display:"inline-block"}}/>Creating profile...</span>:"Launch My Profile →"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Security footer */}
          {role && !done && (
            <div className="pg-sec">
              <span style={{fontSize:15,flexShrink:0,marginTop:1}}>🔒</span>
              <div>
                <div className="pg-mono" style={{fontSize:10,color:"#20C997",letterSpacing:1,marginBottom:4}}>HIPAA COMPLIANT · ZERO DATA EXPOSURE</div>
                <div style={{fontSize:11,color:"#8fa3b8",lineHeight:1.65}}>Genomic data is processed entirely in-browser. No patient VCF data is ever transmitted to our servers.</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}