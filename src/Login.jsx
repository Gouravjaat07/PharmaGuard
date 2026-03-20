import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  authenticateUser,
  emailExists,
  saveSession,
  loadSession,
} from "./authConfig";

/* ─── STYLES ──────────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Epilogue:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; background: #F8F9FA; overflow-x: hidden; }

  :root {
    --primary:   #0B5ED7;
    --primary-d: #094bb3;
    --primary-l: #6EA8FE;
    --accent:    #20C997;
    --accent-d:  #17a680;
    --danger:    #EB3434;
    --danger-l:  rgba(235,52,52,0.08);
    --warn:      #f59e0b;
    --bg:        #F8F9FA;
    --bg-2:      #ffffff;
    --text:      #212529;
    --text-m:    #495057;
    --text-s:    #8fa3b8;
    --border:    rgba(11,94,215,0.12);
    --border-s:  rgba(11,94,215,0.06);
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #F8F9FA; }
  ::-webkit-scrollbar-thumb { background: var(--primary-l); border-radius: 2px; }

  @keyframes mc-fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes mc-float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes mc-pulse     { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes mc-spin      { to{transform:rotate(360deg)} }
  @keyframes mc-shake     { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
  @keyframes mc-scanX     { 0%{top:-2px} 100%{top:calc(100% + 2px)} }
  @keyframes mc-orb       { 0%,100%{transform:scale(1) translate(0,0)} 50%{transform:scale(1.08) translate(14px,-10px)} }
  @keyframes mc-ripple    { from{transform:scale(0);opacity:0.5} to{transform:scale(5);opacity:0} }
  @keyframes mc-checkIn   { 0%{transform:scale(0) rotate(-15deg);opacity:0} 70%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
  @keyframes mc-dnaNode   { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.3);opacity:1} }
  @keyframes mc-slideR    { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
  @keyframes mc-heartbeat { 0%,100%{transform:scale(1)}14%{transform:scale(1.12)}28%{transform:scale(1)}42%{transform:scale(1.08)}70%{transform:scale(1)} }
  @keyframes mc-successIn { 0%{transform:scale(0.7);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }

  .mc-syne     { font-family:'Syne',sans-serif; }
  .mc-epilogue { font-family:'Epilogue',sans-serif; }
  .mc-mono     { font-family:'DM Mono',monospace; }

  .mc-root {
    min-height:100vh; background:var(--bg); color:var(--text);
    font-family:'Epilogue',sans-serif; display:flex;
    position:relative; overflow:hidden;
  }
  .mc-grid-bg {
    position:fixed; inset:0; z-index:0; pointer-events:none;
    background-image:
      linear-gradient(rgba(11,94,215,0.025) 1px,transparent 1px),
      linear-gradient(90deg,rgba(11,94,215,0.025) 1px,transparent 1px);
    background-size:44px 44px;
  }
  .mc-orb { position:fixed; border-radius:50%; pointer-events:none; z-index:0; animation:mc-orb 14s ease-in-out infinite; }

  /* ── LEFT PANEL ── */
  .mc-left {
    flex:0 0 44%; display:flex; flex-direction:column; justify-content:space-between;
    padding:48px 52px; border-right:1px solid var(--border-s);
    background:linear-gradient(155deg,rgba(11,94,215,0.04) 0%,rgba(32,201,151,0.03) 55%,transparent 100%);
    position:relative; overflow:hidden; z-index:1;
  }
  .mc-right {
    flex:1; display:flex; align-items:center; justify-content:center;
    padding:48px 40px; position:relative; z-index:1; background:#fff;
  }
  .mc-card { width:100%; max-width:440px; animation:mc-fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }

  /* ── INPUT SYSTEM ── */
  .mc-field { position:relative; margin-bottom:16px; }
  .mc-field-icon {
    position:absolute; left:16px; top:50%; transform:translateY(-50%);
    font-size:15px; pointer-events:none; color:#bec8d2; transition:color 0.2s; z-index:1;
  }
  .mc-field:focus-within .mc-field-icon { color:var(--primary); }

  .mc-input {
    width:100%; background:var(--bg); border:1.5px solid rgba(11,94,215,0.14);
    border-radius:10px; padding:13px 46px 13px 48px; color:var(--text);
    font-family:'Epilogue',sans-serif; font-size:14px;
    outline:none; transition:all 0.22s; caret-color:var(--primary);
  }
  .mc-input::placeholder { color:#bec8d2; }
  .mc-input:focus { border-color:var(--primary); background:#fff; box-shadow:0 0 0 3px rgba(11,94,215,0.08); }
  .mc-input.err { border-color:var(--danger); background:var(--danger-l); animation:mc-shake 0.36s ease; }
  .mc-input.err:focus { box-shadow:0 0 0 3px rgba(235,52,52,0.1); }
  .mc-input.ok  { border-color:var(--accent); background:rgba(32,201,151,0.03); }
  .mc-input.ok:focus { box-shadow:0 0 0 3px rgba(32,201,151,0.1); }

  .mc-trail {
    position:absolute; right:14px; top:50%; transform:translateY(-50%);
    background:none; border:none; cursor:pointer; font-size:15px;
    color:#bec8d2; transition:color 0.2s; padding:0; line-height:1;
  }
  .mc-trail:hover { color:var(--primary); }

  .mc-err-msg {
    font-size:12px; color:var(--danger); margin-top:6px; padding-left:4px;
    animation:mc-slideR 0.25s ease both; display:flex; align-items:center; gap:4px;
  }
  .mc-hint-msg {
    font-size:11px; color:var(--text-s); margin-top:5px; padding-left:4px;
    display:flex; align-items:center; gap:4px;
  }

  /* ── PRIMARY BUTTON ── */
  .mc-btn {
    width:100%; padding:14px; border-radius:10px; border:none; cursor:pointer;
    font-family:'Syne',sans-serif; font-weight:700; font-size:15px; letter-spacing:0.3px;
    background:linear-gradient(135deg,var(--primary) 0%,#1a6ee8 50%,var(--primary-d) 100%);
    color:#fff; transition:all 0.22s; position:relative; overflow:hidden;
    box-shadow:0 4px 16px rgba(11,94,215,0.2);
  }
  .mc-btn:hover:not(:disabled) { box-shadow:0 8px 28px rgba(11,94,215,0.32); transform:translateY(-2px); }
  .mc-btn:active:not(:disabled) { transform:translateY(0); }
  .mc-btn:disabled { opacity:0.55; cursor:not-allowed; }
  .mc-btn .rpl {
    position:absolute; border-radius:50%; background:rgba(255,255,255,0.3);
    width:8px; height:8px; animation:mc-ripple 0.6s ease-out forwards;
    pointer-events:none; transform-origin:center;
  }

  /* ── SOCIAL BUTTONS ── */
  .mc-social-row { display:flex; gap:10px; margin-bottom:4px; }
  .mc-social-btn {
    flex:1; padding:11px; background:var(--bg); border:1.5px solid rgba(11,94,215,0.1);
    border-radius:10px; cursor:pointer; font-family:'Epilogue',sans-serif;
    font-size:13px; font-weight:500; color:var(--text-m); transition:all 0.2s;
    display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .mc-social-btn:hover { border-color:var(--primary); color:var(--primary); background:rgba(11,94,215,0.04); }

  /* ── DIVIDER ── */
  .mc-divider { display:flex; align-items:center; gap:14px; margin:18px 0; }
  .mc-divider::before,.mc-divider::after { content:''; flex:1; height:1px; background:rgba(11,94,215,0.08); }

  /* ── MISC ── */
  .mc-badge {
    display:inline-flex; align-items:center; gap:6px; padding:5px 12px;
    border-radius:100px; font-family:'DM Mono',monospace; font-size:10px;
    font-weight:600; letter-spacing:1px;
  }
  .mc-scan-line {
    position:absolute; left:0; right:0; height:1px;
    background:linear-gradient(90deg,transparent,rgba(11,94,215,0.25),rgba(32,201,151,0.2),transparent);
    animation:mc-scanX 6s linear infinite; pointer-events:none;
  }
  .mc-float-card {
    background:rgba(255,255,255,0.97); border:1px solid rgba(11,94,215,0.12);
    border-radius:14px; padding:16px 20px; backdrop-filter:blur(20px);
    box-shadow:0 12px 40px rgba(11,94,215,0.1); animation:mc-float 4s ease-in-out infinite;
  }
  .mc-checkbox {
    appearance:none; width:17px; height:17px; border-radius:5px;
    border:1.5px solid rgba(11,94,215,0.25); background:#fff; cursor:pointer;
    transition:all 0.2s; flex-shrink:0; position:relative;
  }
  .mc-checkbox:checked { background:var(--primary); border-color:var(--primary); }
  .mc-checkbox:checked::after {
    content:'✓'; position:absolute; color:white; font-size:11px; font-weight:800;
    top:50%; left:50%; transform:translate(-50%,-50%); font-family:'Syne',sans-serif;
  }
  .mc-link { color:var(--primary); cursor:pointer; font-weight:600; transition:opacity 0.2s; }
  .mc-link:hover { opacity:0.72; }
  .mc-link.danger { color:var(--danger); }
  .mc-chip { font-family:'DM Mono',monospace; font-size:10px; padding:4px 10px; border-radius:6px; background:rgba(11,94,215,0.06); border:1px solid rgba(11,94,215,0.12); color:var(--primary); }

  /* ── ALERT BANNER ── */
  .mc-alert {
    padding:12px 16px; border-radius:10px; margin-bottom:16px;
    display:flex; align-items:flex-start; gap:10px;
    font-size:13px; animation:mc-slideR 0.25s ease;
  }
  .mc-alert.error { background:var(--danger-l); border:1px solid rgba(235,52,52,0.22); color:var(--danger); }
  .mc-alert.warn  { background:rgba(245,158,11,0.07); border:1px solid rgba(245,158,11,0.25); color:#b45309; }
  .mc-alert.info  { background:rgba(11,94,215,0.05); border:1px solid rgba(11,94,215,0.18); color:var(--primary); }

  /* ── SECURITY BOX ── */
  .mc-security {
    margin-top:22px; padding:13px 15px;
    background:rgba(32,201,151,0.05); border:1px solid rgba(32,201,151,0.18);
    border-radius:10px; display:flex; align-items:flex-start; gap:10px;
  }

  /* ── SUCCESS STATE ── */
  .mc-success-ring {
    width:76px; height:76px; border-radius:50%;
    background:rgba(11,94,215,0.06); border:2px solid var(--primary);
    display:flex; align-items:center; justify-content:center;
    font-size:32px; margin:0 auto 20px; animation:mc-successIn 0.4s ease;
  }

  /* ── LOCKED BADGE ── */
  .mc-lock-badge {
    display:inline-flex; align-items:center; gap:6px;
    padding:6px 14px; border-radius:8px; font-size:11px;
    background:rgba(235,52,52,0.07); border:1px solid rgba(235,52,52,0.2);
    color:var(--danger); font-weight:600; margin-bottom:14px;
  }

  /* ── ATTEMPT COUNTER ── */
  .mc-attempts {
    display:flex; gap:5px; justify-content:center; margin-top:8px;
  }
  .mc-attempt-dot {
    width:8px; height:8px; border-radius:50%;
    transition:background 0.3s;
  }

  @media(max-width:860px) { .mc-left{display:none!important;} .mc-right{padding:32px 20px;} }
  @media(max-width:480px) { .mc-right{padding:24px 16px;} }
`;

/* ── CONSTANTS ─────────────────────────────────────────────────────────────── */
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS   = 30 * 1000; // 30 seconds demo lockout (use 15 min in prod)

const GENES = ["CYP2D6","CYP2C19","TPMT","DPYD","SLCO1B1","VKORC1"];

/* ── DNA HELIX ──────────────────────────────────────────────────────────────── */
function DNAHelix() {
  return (
    <div style={{ position:"relative", width:56, height:280, margin:"0 auto" }}>
      {Array.from({ length:14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 3;
        const x1 = 10 + Math.sin(a) * 16, x2 = 46 - Math.sin(a) * 16, y = i * 20;
        const op = 0.25 + Math.abs(Math.sin(a)) * 0.75;
        const c1 = i === 4 || i === 10 ? "#EB3434" : i % 2 === 0 ? "#0B5ED7" : "#20C997";
        const c2 = i === 4 || i === 10 ? "#EB3434" : i % 2 === 0 ? "#20C997" : "#6EA8FE";
        return (
          <div key={i}>
            <div style={{ position:"absolute", width:10, height:10, borderRadius:"50%", background:c1,
              left:x1-5, top:y, opacity:op, boxShadow:`0 0 7px ${c1}88`,
              animation:`mc-dnaNode ${1.4+i*0.1}s ${i*0.1}s ease-in-out infinite` }}/>
            <div style={{ position:"absolute", width:10, height:10, borderRadius:"50%", background:c2,
              left:x2-5, top:y, opacity:op, boxShadow:`0 0 7px ${c2}88`,
              animation:`mc-dnaNode ${1.4+i*0.1}s ${i*0.13}s ease-in-out infinite` }}/>
            <div style={{ position:"absolute", left:Math.min(x1,x2), top:y+4,
              width:Math.abs(x2-x1), height:1.5,
              background:`linear-gradient(90deg,${c1},${c2})`, opacity:op*0.35 }}/>
          </div>
        );
      })}
    </div>
  );
}

/* ── PULSE INDICATOR ────────────────────────────────────────────────────────── */
function PulseIndicator({ color = "#20C997" }) {
  return (
    <span style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center", width:10, height:10 }}>
      <span style={{ position:"absolute", width:10, height:10, borderRadius:"50%", background:color, opacity:0.3, animation:"mc-ripple 1.6s ease-out infinite" }}/>
      <span style={{ width:6, height:6, borderRadius:"50%", background:color, display:"block" }}/>
    </span>
  );
}

/* ── ATTEMPT DOTS ───────────────────────────────────────────────────────────── */
function AttemptDots({ used, max }) {
  return (
    <div className="mc-attempts">
      {Array.from({ length: max }, (_, i) => (
        <div key={i} className="mc-attempt-dot"
          style={{ background: i < used ? "#EB3434" : "rgba(11,94,215,0.15)" }}/>
      ))}
    </div>
  );
}

/* ── LOCKOUT TIMER ──────────────────────────────────────────────────────────── */
function useLockout() {
  const LOCK_KEY = "pg_lockout";
  const COUNT_KEY = "pg_attempts";

  const getAttempts = () => parseInt(localStorage.getItem(COUNT_KEY) || "0", 10);
  const getLockUntil = () => parseInt(localStorage.getItem(LOCK_KEY) || "0", 10);

  const [attempts, setAttempts]     = useState(getAttempts);
  const [lockUntil, setLockUntil]   = useState(getLockUntil);
  const [countdown, setCountdown]   = useState(0);

  useEffect(() => {
    if (lockUntil <= Date.now()) { setCountdown(0); return; }
    const tick = () => {
      const remaining = Math.max(0, lockUntil - Date.now());
      setCountdown(Math.ceil(remaining / 1000));
      if (remaining <= 0) { localStorage.removeItem(LOCK_KEY); localStorage.removeItem(COUNT_KEY); setAttempts(0); setLockUntil(0); }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [lockUntil]);

  const isLocked = () => getLockUntil() > Date.now();

  const recordFail = () => {
    const next = getAttempts() + 1;
    localStorage.setItem(COUNT_KEY, String(next));
    setAttempts(next);
    if (next >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_MS;
      localStorage.setItem(LOCK_KEY, String(until));
      setLockUntil(until);
    }
  };

  const resetAttempts = () => {
    localStorage.removeItem(COUNT_KEY);
    localStorage.removeItem(LOCK_KEY);
    setAttempts(0);
    setLockUntil(0);
  };

  return { attempts, isLocked, countdown, recordFail, resetAttempts };
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN LOGIN COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
export default function LoginPage({ onNavigateToRegister }) {
  const navigate = useNavigate();

  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [showPw,     setShowPw]     = useState(false);
  const [remember,   setRemember]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [errors,     setErrors]     = useState({});
  const [authError,  setAuthError]  = useState(null); // null | "wrong_password" | "email_not_found"
  const [success,    setSuccess]    = useState(false);
  const [successUser, setSuccessUser] = useState(null);
  const [ripples,    setRipples]    = useState([]);
  const btnRef = useRef(null);

  const lock = useLockout();

  // Inject styles
  useEffect(() => {
    if (!document.getElementById("mc-login-styles")) {
      const el = document.createElement("style");
      el.id = "mc-login-styles";
      el.textContent = css;
      document.head.appendChild(el);
    }
    // If already logged in, redirect
    const session = loadSession();
    if (session) navigate("/profile");
  }, []);

  // ── VALIDATION ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!email.trim())
      e.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email address";
    if (!password)
      e.password = "Password is required";
    else if (password.length < 6)
      e.password = "Password must be at least 6 characters";
    return e;
  };

  // ── RIPPLE ──────────────────────────────────────────────────────────────────
  const addRipple = (ev) => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const id = Date.now();
    setRipples(p => [...p, { id, x: ev.clientX - r.left, y: ev.clientY - r.top }]);
    setTimeout(() => setRipples(p => p.filter(x => x.id !== id)), 700);
  };

  // ── SUBMIT ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setAuthError(null);

    // Lockout check
    if (lock.isLocked()) return;

    // Field validation
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});

    setLoading(true);
    // Simulate network delay (remove in production, replace with real API call)
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);

    // ── AUTHENTICATION ────────────────────────────────────────────────────────
    const user = authenticateUser(email, password);

    if (user) {
      // ✅ SUCCESS
      lock.resetAttempts();
      const session = saveSession(user);
      setSuccessUser(user);
      setSuccess(true);
      setTimeout(() => navigate("/profile"), 1600);
    } else {
      // ❌ FAILED — distinguish "email not found" vs "wrong password"
      lock.recordFail();
      if (!emailExists(email)) {
        setAuthError("email_not_found");
      } else {
        setAuthError("wrong_password");
      }
    }
  };

  const remainingAttempts = MAX_ATTEMPTS - lock.attempts;

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="mc-root">
      <div className="mc-grid-bg"/>

      {/* Background orbs */}
      <div className="mc-orb" style={{ width:560, height:560, top:"-18%", left:"-8%", background:"radial-gradient(circle,rgba(11,94,215,0.07) 0%,transparent 68%)", animationDuration:"16s" }}/>
      <div className="mc-orb" style={{ width:340, height:340, bottom:"-14%", left:"18%", background:"radial-gradient(circle,rgba(32,201,151,0.07) 0%,transparent 68%)", animationDuration:"12s", animationDelay:"3s" }}/>
      <div className="mc-orb" style={{ width:220, height:220, top:"10%", right:"6%", background:"radial-gradient(circle,rgba(235,52,52,0.04) 0%,transparent 68%)", animationDuration:"9s", animationDelay:"6s" }}/>

      {/* ── LEFT BRAND PANEL ──────────────────────────────────────────────────── */}
      <aside className="mc-left">
        <div className="mc-scan-line"/>

        <div>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:13, marginBottom:40 }}>
            <div style={{ width:46, height:46, borderRadius:12, background:"linear-gradient(135deg,#0B5ED7,#094bb3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:"0 6px 22px rgba(11,94,215,0.3)" }}>🧬</div>
            <div>
              <div className="mc-syne" style={{ fontSize:20, fontWeight:800, color:"#0B5ED7", letterSpacing:0.3 }}>PharmaGuard</div>
              <div className="mc-mono" style={{ fontSize:9, color:"#20C997", letterSpacing:3 }}>PRECISION MEDICINE</div>
            </div>
          </div>

          {/* Status badge */}
          <div className="mc-badge" style={{ background:"rgba(11,94,215,0.07)", border:"1px solid rgba(11,94,215,0.18)", color:"#0B5ED7", marginBottom:24 }}>
            <PulseIndicator color="#20C997" />
            CPIC 2024 · Level A Validated
          </div>

          <h2 className="mc-syne" style={{ fontSize:"clamp(26px,3vw,38px)", fontWeight:800, color:"#212529", lineHeight:1.12, marginBottom:14 }}>
            Decode Every Genome.<br/>
            <span style={{ background:"linear-gradient(135deg,#0B5ED7,#20C997)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Every Drug. Every Risk.
            </span>
          </h2>
          <p className="mc-epilogue" style={{ fontSize:14, lineHeight:1.85, color:"#8fa3b8", maxWidth:330 }}>
            Sign in to access your pharmacogenomic dashboard — predict drug toxicity, efficacy, and optimal dosing with clinical-grade accuracy.
          </p>
        </div>

        {/* DNA + floating cards */}
        <div style={{ position:"relative", flex:1, display:"flex", alignItems:"center", justifyContent:"center", minHeight:240 }}>
          <DNAHelix/>

          {/* Risk preview card */}
          <div className="mc-float-card" style={{ position:"absolute", top:"2%", right:"-10%", minWidth:188, animationDelay:"0s" }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:11 }}>
              <span style={{ fontSize:13 }}>📊</span>
              <span className="mc-mono" style={{ fontSize:9, color:"#0B5ED7", letterSpacing:2 }}>RISK ANALYSIS</span>
              <PulseIndicator color="#20C997"/>
            </div>
            {[
              { d:"CODEINE",    r:"☠️ Toxic",   c:"#EB3434" },
              { d:"WARFARIN",   r:"⚖️ Adjust",  c:"#f59e0b" },
              { d:"SERTRALINE", r:"🛡️ Safe",    c:"#20C997" },
            ].map(x => (
              <div key={x.d} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:"1px solid rgba(11,94,215,0.06)" }}>
                <span className="mc-mono" style={{ fontSize:10, color:"#8fa3b8" }}>{x.d}</span>
                <span style={{ fontSize:10, color:x.c, fontWeight:700 }}>{x.r}</span>
              </div>
            ))}
          </div>

          {/* Analysis complete card */}
          <div className="mc-float-card" style={{ position:"absolute", bottom:"4%", left:"-8%", animationDelay:"1.8s", animationDuration:"3.5s" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(32,201,151,0.1)", border:"1.5px solid rgba(32,201,151,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:"#20C997" }}>✓</div>
              <div>
                <div className="mc-syne" style={{ fontSize:13, fontWeight:700, color:"#212529" }}>Analysis Complete</div>
                <div style={{ fontSize:11, color:"#8fa3b8" }}>7 drugs · 2.4s</div>
              </div>
            </div>
          </div>

          {/* Alert card */}
          <div className="mc-float-card" style={{ position:"absolute", top:"42%", left:"-12%", animationDelay:"0.9s", animationDuration:"5s", borderColor:"rgba(235,52,52,0.18)", minWidth:160 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#EB3434", animation:"mc-pulse 1.2s infinite", flexShrink:0 }}/>
              <div>
                <div className="mc-mono" style={{ fontSize:9, color:"#EB3434", letterSpacing:1 }}>CRITICAL ALERT</div>
                <div style={{ fontSize:11, color:"#495057", marginTop:2 }}>TPMT *3A/*3A detected</div>
              </div>
            </div>
          </div>
        </div>

        {/* Gene chips */}
        <div>
          <div className="mc-mono" style={{ fontSize:9, color:"#bec8d2", letterSpacing:2, marginBottom:10 }}>SUPPORTED PHARMACOGENES</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {GENES.map(g => <span key={g} className="mc-chip">{g}</span>)}
          </div>
          <div className="mc-mono" style={{ fontSize:10, color:"#d0dce8", marginTop:10 }}>+ 9 more pharmacogenes covered</div>
        </div>
      </aside>

      {/* ── RIGHT FORM PANEL ──────────────────────────────────────────────────── */}
      <main className="mc-right">
        <div className="mc-card">

          {/* Header */}
          <div style={{ marginBottom:28 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <span className="mc-mono" style={{ fontSize:10, color:"#0B5ED7", letterSpacing:2 }}>SECURE ACCESS</span>
              <PulseIndicator color="#20C997"/>
              <span className="mc-mono" style={{ fontSize:10, color:"#bec8d2" }}>AES-256 ENCRYPTED</span>
            </div>
            <h1 className="mc-syne" style={{ fontSize:32, fontWeight:800, color:"#212529", marginBottom:6 }}>Welcome back</h1>
            <p className="mc-epilogue" style={{ fontSize:14, color:"#8fa3b8" }}>Sign in to your PharmaGuard account</p>
          </div>

          {/* ── SUCCESS STATE ── */}
          {success ? (
            <div style={{ textAlign:"center", padding:"36px 0", animation:"mc-fadeUp 0.45s ease" }}>
              <div className="mc-success-ring">✓</div>
              <div className="mc-syne" style={{ fontSize:22, fontWeight:800, color:"#212529", marginBottom:4 }}>
                Welcome, {successUser?.name?.split(" ")[0]}!
              </div>
              <div style={{ fontSize:13, color:"#8fa3b8", marginBottom:6 }}>{successUser?.title} · {successUser?.institution}</div>
              <div style={{ fontSize:14, color:"#8fa3b8", marginBottom:24 }}>Redirecting to your dashboard...</div>
              <div style={{ width:36, height:36, borderRadius:"50%", border:"3px solid rgba(11,94,215,0.15)", borderTopColor:"#0B5ED7", animation:"mc-spin 0.8s linear infinite", margin:"0 auto" }}/>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>

              {/* ── LOCKOUT BANNER ── */}
              {lock.isLocked() && (
                <div className="mc-alert error">
                  <span style={{ fontSize:18, flexShrink:0, animation:"mc-heartbeat 1.4s infinite" }}>🔒</span>
                  <div>
                    <div style={{ fontWeight:700, marginBottom:3 }}>Account temporarily locked</div>
                    <div style={{ fontSize:12 }}>Too many failed attempts. Try again in <strong>{lock.countdown}s</strong>.</div>
                    <AttemptDots used={MAX_ATTEMPTS} max={MAX_ATTEMPTS}/>
                  </div>
                </div>
              )}

              {/* ── AUTH ERROR BANNERS ── */}
              {!lock.isLocked() && authError === "email_not_found" && (
                <div className="mc-alert error">
                  <span style={{ fontSize:16, flexShrink:0, animation:"mc-heartbeat 1.5s infinite" }}>⚠️</span>
                  <div>
                    <div style={{ fontWeight:700, marginBottom:2 }}>Account not found</div>
                    <div style={{ fontSize:12 }}>No account exists for <strong>{email}</strong>. Check your email or <span style={{ cursor:"pointer", textDecoration:"underline" }} onClick={onNavigateToRegister}>create an account</span>.</div>
                  </div>
                </div>
              )}

              {!lock.isLocked() && authError === "wrong_password" && (
                <div className="mc-alert error">
                  <span style={{ fontSize:16, flexShrink:0, animation:"mc-heartbeat 1.5s infinite" }}>⚠️</span>
                  <div>
                    <div style={{ fontWeight:700, marginBottom:2 }}>Incorrect password</div>
                    <div style={{ fontSize:12 }}>
                      {remainingAttempts > 0
                        ? <>{remainingAttempts} attempt{remainingAttempts !== 1 ? "s" : ""} remaining before lockout.</>
                        : "Last attempt — account will lock on next failure."
                      }
                    </div>
                    <AttemptDots used={lock.attempts} max={MAX_ATTEMPTS}/>
                  </div>
                </div>
              )}

              {/* ── SOCIAL BUTTONS ── */}
              <div className="mc-social-row">
                {[
                  { icon:"G", label:"Continue with Google" },
                  { icon:"🏥", label:"Hospital SSO" },
                ].map(s => (
                  <button key={s.label} type="button" className="mc-social-btn">
                    <span style={{ fontWeight:700 }}>{s.icon}</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>

              <div className="mc-divider">
                <span className="mc-mono" style={{ fontSize:10, color:"#bec8d2", letterSpacing:1, whiteSpace:"nowrap" }}>OR SIGN IN WITH EMAIL</span>
              </div>

              {/* ── EMAIL FIELD ── */}
              <div className="mc-field">
                <span className="mc-field-icon">✉</span>
                <input
                  className={`mc-input${errors.email || authError === "email_not_found" ? " err" : email && !errors.email ? " ok" : ""}`}
                  type="email"
                  placeholder="clinician@pharmaguard.com"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setErrors(p => ({ ...p, email:"" }));
                    setAuthError(null);
                  }}
                  autoComplete="email"
                  disabled={lock.isLocked()}
                />
                {email && !errors.email && authError !== "email_not_found" && (
                  <span className="mc-trail" style={{ color:"#20C997", pointerEvents:"none", animation:"mc-checkIn 0.2s ease" }}>✓</span>
                )}
                {errors.email && <div className="mc-err-msg"><span>⚠</span>{errors.email}</div>}
              </div>

              {/* ── PASSWORD FIELD ── */}
              <div className="mc-field">
                <span className="mc-field-icon">🔐</span>
                <input
                  className={`mc-input${errors.password || authError === "wrong_password" ? " err" : ""}`}
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setErrors(p => ({ ...p, password:"" }));
                    setAuthError(null);
                  }}
                  autoComplete="current-password"
                  disabled={lock.isLocked()}
                />
                <button type="button" className="mc-trail" onClick={() => setShowPw(v => !v)}>
                  {showPw ? "🙈" : "👁"}
                </button>
                {errors.password && <div className="mc-err-msg"><span>⚠</span>{errors.password}</div>}
              </div>

              {/* ── REMEMBER & FORGOT ── */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <label style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer" }}>
                  <input type="checkbox" className="mc-checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}/>
                  <span style={{ fontSize:13, color:"#8fa3b8" }}>Remember me</span>
                </label>
                <span className="mc-link" style={{ fontSize:13 }}>Forgot password?</span>
              </div>

              {/* ── SUBMIT BUTTON ── */}
              <button
                type="submit"
                ref={btnRef}
                className="mc-btn"
                disabled={loading || lock.isLocked()}
                onClick={addRipple}
              >
                {ripples.map(r => <span key={r.id} className="rpl" style={{ left:r.x-4, top:r.y-4 }}/>)}
                {loading ? (
                  <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                    <span style={{ width:17, height:17, borderRadius:"50%", border:"2.5px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", animation:"mc-spin 0.75s linear infinite", display:"inline-block" }}/>
                    Verifying credentials...
                  </span>
                ) : lock.isLocked() ? `🔒 Locked — ${lock.countdown}s` : "Sign In to PharmaGuard →"}
              </button>

              {/* ── SECONDARY CTAs ── */}
              <div style={{ display:"flex", gap:8, marginTop:10 }}>
                <button type="button" style={{ flex:1, padding:"11px", borderRadius:10, border:"1.5px solid rgba(32,201,151,0.3)", background:"rgba(32,201,151,0.05)", cursor:"pointer", fontFamily:"'Epilogue',sans-serif", fontSize:12, fontWeight:600, color:"#20C997", transition:"all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(32,201,151,0.1)"; e.currentTarget.style.borderColor="rgba(32,201,151,0.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(32,201,151,0.05)"; e.currentTarget.style.borderColor="rgba(32,201,151,0.3)"; }}>
                  📋 Book Appointment
                </button>
                <button type="button" style={{ flex:1, padding:"11px", borderRadius:10, border:"1.5px solid rgba(235,52,52,0.2)", background:"rgba(235,52,52,0.04)", cursor:"pointer", fontFamily:"'Epilogue',sans-serif", fontSize:12, fontWeight:600, color:"#EB3434", transition:"all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(235,52,52,0.08)"; e.currentTarget.style.borderColor="rgba(235,52,52,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(235,52,52,0.04)"; e.currentTarget.style.borderColor="rgba(235,52,52,0.2)"; }}>
                  🚨 Emergency Care
                </button>
              </div>

              {/* ── REGISTER LINK ── */}
              <p style={{ textAlign:"center", marginTop:20, fontSize:14, color:"#8fa3b8" }}>
                Don't have an account?{" "}
                <span className="mc-link" onClick={onNavigateToRegister}>Create account</span>
              </p>

              {/* ── DEMO HINT (remove in production) ── */}
              <div style={{ marginTop:16, padding:"12px 16px", background:"rgba(11,94,215,0.04)", border:"1.5px dashed rgba(11,94,215,0.2)", borderRadius:10 }}>
                <div className="mc-mono" style={{ fontSize:9, color:"#0B5ED7", letterSpacing:2, marginBottom:8 }}>DEMO CREDENTIALS</div>
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  {[
                    { name:"Gourav Sharma",  email:"gourav@pharmaguard.com",   pw:"Gourav@123"   },
                    { name:"Aditya Kumar",   email:"aditya@pharmaguard.com",    pw:"Aditya@456"   },
                    { name:"Kanishka Verma", email:"kanishka@pharmaguard.com",  pw:"Kanishka@789" },
                  ].map(u => (
                    <div key={u.email} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom:"1px solid rgba(11,94,215,0.07)" }}>
                      <span style={{ fontSize:11, color:"#495057", fontWeight:500 }}>{u.name}</span>
                      <button type="button" style={{ fontSize:10, padding:"3px 10px", borderRadius:6, background:"rgba(11,94,215,0.08)", border:"1px solid rgba(11,94,215,0.18)", color:"#0B5ED7", cursor:"pointer", fontFamily:"'DM Mono',monospace" }}
                        onClick={() => { setEmail(u.email); setPassword(u.pw); setErrors({}); setAuthError(null); }}>
                        Use →
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── SECURITY NOTE ── */}
              <div className="mc-security">
                <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>🔒</span>
                <div>
                  <div className="mc-mono" style={{ fontSize:10, color:"#20C997", letterSpacing:1, marginBottom:4 }}>HIPAA COMPLIANT · IN-BROWSER PROCESSING</div>
                  <div style={{ fontSize:11, color:"#8fa3b8", lineHeight:1.65 }}>
                    Your genomic data is processed entirely in-browser. No patient data is ever sent to our servers. Fully compliant with HIPAA & GDPR.
                  </div>
                </div>
              </div>

              {/* ── FOOTER ── */}
              <div style={{ textAlign:"center", marginTop:18, paddingTop:14, borderTop:"1px solid rgba(11,94,215,0.07)" }}>
                <span style={{ fontSize:11, color:"#bec8d2" }}>© 2026 PharmaGuard · </span>
                <span className="mc-link" style={{ fontSize:11 }}>Privacy</span>
                <span style={{ fontSize:11, color:"#bec8d2" }}> · </span>
                <span className="mc-link" style={{ fontSize:11 }}>Terms</span>
                <span style={{ fontSize:11, color:"#bec8d2" }}> · </span>
                <span className="mc-link danger" style={{ fontSize:11 }}>Report Issue</span>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}