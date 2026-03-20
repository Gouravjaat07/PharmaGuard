/**
 * Footer component for PharmaGuard Lab Technician page.
 * No props required — purely static branding content.
 */
export default function Footer() {
  return (
    <footer style={{ borderTop:"1px solid rgba(11,94,215,0.05)", marginTop:40, padding:"22px 24px" }}>
      <div style={{
        maxWidth:900, margin:"0 auto",
        display:"flex", alignItems:"center", justifyContent:"center", gap:8
      }}>
        <span>🧬</span>
        <span className="fraunces" style={{ fontWeight:700, color:"#212529" }}>PharmaGuard v3.0</span>
        <span style={{ color:"#6c757d", fontSize:12 }}>· Home Lab · NABL Accredited · HIPAA Compliant</span>
      </div>
    </footer>
  );
}
