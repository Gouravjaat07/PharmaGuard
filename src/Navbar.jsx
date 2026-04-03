import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Analysis",        key: "main",       path: "/analysis",       dot: false, internal: false },
  { label: "👨‍👩‍👧‍👦 Family",    key: "family",     path: "/family-section", dot: true,  internal: false },
  { label: "Book Technician",  key: "technician", path: "/technician",     dot: false, internal: false },
  { label: "History",          key: "history",    path: "/history",        dot: false, internal: true  },
  { label: "About",            key: "about",      path: "/about",          dot: false, internal: true  },
  { label: "Profile",          key: "profile",    path: "/profile",        dot: false, internal: false },
];

/**
 * Navbar component for PharmaGuard Lab Technician page.
 *
 * Props:
 *  - page         {string}   current internal page key (e.g. "booking", "history", "about")
 *  - step         {number}   current booking step (0-4)
 *  - totalPrice   {number}   cart total to show in the navbar
 *  - onNavClick   {function} (item) => void  — called when an internal nav item is clicked
 *  - onSidebarOpen {function} () => void     — called to open the profile sidebar
 */
export default function Navbar({ page, step, totalPrice, onNavClick, onSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);

  const isActive = (item) => {
    if (item.internal) {
      if (item.key === "history") return page === "history";
      if (item.key === "about")   return page === "about";
    }
    if (item.key === "technician") return page === "booking";
    return location.pathname === item.path;
  };

  const handleNavClick = (item) => {
    setMobileMenu(false);
    if (item.internal) {
      onNavClick?.(item);
    } else if (item.key === "technician") {
      onNavClick?.(item);
    } else {
      navigate(item.path);
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
      {/* ── Logo ── */}
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <div
          style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer" }}
          onClick={() => navigate("/analysis")}
        >
          <div style={{
            width:36, height:36, borderRadius:10,
            background:"linear-gradient(135deg,#0B5ED7,#094bb3)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:18, boxShadow:"0 4px 12px rgba(11,94,215,0.25)"
          }}>🧬</div>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:"#0B5ED7", letterSpacing:0.3 }}>PharmaGuard</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#20C997", letterSpacing:3 }}>PRECISION MEDICINE</div>
          </div>
        </div>

        {/* ── Desktop nav links ── */}
        <div className="hide-mobile" style={{ display:"flex", gap:2, marginLeft:16 }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={`nav-link tab-btn ${isActive(item) ? "active" : ""}`}
              onClick={() => handleNavClick(item)}
              style={{ position:"relative", color:isActive(item) ? "#0B5ED7" : "#495057" }}
            >
              {item.label}
              {item.dot && (
                <span style={{
                  position:"absolute", top:-6, right:-6,
                  width:8, height:8, borderRadius:"50%",
                  background:"#0B5ED7", boxShadow:"0 0 6px rgba(11,94,215,0.5)"
                }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Right-side actions ── */}
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {page === "booking" && step >= 1 && step < 4 && totalPrice > 0 && (
          <div className="hide-mobile" style={{
            background:"rgba(11,94,215,0.07)", border:"1.5px solid rgba(11,94,215,0.15)",
            borderRadius:9, padding:"5px 12px", display:"flex", alignItems:"center", gap:6
          }}>
            <span style={{ fontSize:11, color:"#6c757d" }}>Cart:</span>
            <span className="fraunces" style={{ fontSize:14, fontWeight:800, color:"#0B5ED7" }}>
              ₹{totalPrice.toLocaleString("en-IN")}
            </span>
          </div>
        )}

        {/* Profile button */}
        <button
          onClick={() => onSidebarOpen?.()}
          style={{
            display:"flex", alignItems:"center", gap:8,
            background:"rgba(11,94,215,0.06)", border:"1.5px solid rgba(11,94,215,0.14)",
            borderRadius:10, padding:"6px 12px", cursor:"pointer", transition:"all 0.18s"
          }}
          onMouseEnter={e => { e.currentTarget.style.background="rgba(11,94,215,0.1)"; e.currentTarget.style.borderColor="#0B5ED7"; }}
          onMouseLeave={e => { e.currentTarget.style.background="rgba(11,94,215,0.06)"; e.currentTarget.style.borderColor="rgba(11,94,215,0.14)"; }}
        >
          <div style={{
            width:26, height:26, borderRadius:"50%",
            background:"linear-gradient(135deg,#0B5ED7,#20C997)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:11, fontWeight:800, color:"#fff"
          }}>AS</div>
          <span className="hide-mobile" style={{ fontSize:12, fontWeight:600, color:"#212529" }}>Aditya Sharma</span>
        </button>

        {/* Mobile hamburger */}
        <button
          className="hide-desktop pg-btn pg-btn-ghost"
          style={{ padding:"7px 11px" }}
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          {mobileMenu ? "✕" : "☰"}
        </button>
      </div>

      {/* ── Mobile dropdown menu ── */}
      {mobileMenu && (
        <div style={{
          position:"absolute", top:62, left:0, right:0,
          background:"#fff", borderBottom:"1.5px solid rgba(11,94,215,0.1)",
          padding:14, display:"flex", flexDirection:"column", gap:6,
          boxShadow:"0 8px 20px rgba(11,94,215,0.08)", zIndex:200
        }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={`tab-btn ${isActive(item) ? "active" : ""}`}
              onClick={() => handleNavClick(item)}
              style={{ textAlign:"left", padding:"9px 12px" }}
            >
              {item.label}
            </button>
          ))}
          {page === "booking" && step >= 1 && step < 4 && totalPrice > 0 && (
            <div style={{
              borderTop:"1px solid rgba(11,94,215,0.08)", paddingTop:10, marginTop:4,
              display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px 0"
            }}>
              <span style={{ fontSize:12, color:"#6c757d" }}>Cart Total:</span>
              <span className="fraunces" style={{ fontSize:16, fontWeight:800, color:"#0B5ED7" }}>
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
