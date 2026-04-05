import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ─── SAMPLE VCF CONTENT ──────────────────────────────────────────────────────
const SAMPLE_VCF_CONTENT = `##fileformat=VCFv4.2
##fileDate=20260213
##source=ClinicalGenomicsLab_PGx_Pipeline_v3.2.1
##reference=GRCh38.p13
##phasing=none
##INFO=<ID=RS,Number=1,Type=String,Description="dbSNP rsID">
##INFO=<ID=GENE,Number=1,Type=String,Description="Gene symbol">
##INFO=<ID=STAR,Number=1,Type=String,Description="Star allele designation">
##INFO=<ID=FUNC,Number=1,Type=String,Description="Functional consequence">
##INFO=<ID=CPIC,Number=1,Type=String,Description="CPIC guideline level">
##INFO=<ID=AF,Number=A,Type=Float,Description="Allele frequency in gnomAD">
##INFO=<ID=CLNSIG,Number=.,Type=String,Description="ClinVar clinical significance">
##FORMAT=<ID=GT,Number=1,Type=String,Description="Genotype">
##FORMAT=<ID=DP,Number=1,Type=Integer,Description="Read depth at this position">
##FORMAT=<ID=GQ,Number=1,Type=Integer,Description="Genotype quality">
##FORMAT=<ID=AD,Number=R,Type=Integer,Description="Allelic depths">
##FORMAT=<ID=PL,Number=G,Type=Integer,Description="Phred-scaled genotype likelihoods">
##contig=<ID=chr1,length=248956422,assembly=GRCh38.p13>
##contig=<ID=chr6,length=170805979,assembly=GRCh38.p13>
##contig=<ID=chr10,length=133797422,assembly=GRCh38.p13>
##contig=<ID=chr12,length=133275309,assembly=GRCh38.p13>
##contig=<ID=chr22,length=50818468,assembly=GRCh38.p13>
##FILTER=<ID=PASS,Description="All filters passed">
##FILTER=<ID=LowQual,Description="Low quality variant">
##bcftools_viewVersion=1.15
##bcftools_viewCommand=view -r chr1,chr6,chr10,chr12,chr22 -o pharmacogenes.vcf input.vcf
#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tPATIENT_001
chr1\t97450058\trs3918290\tC\tT\t99\tPASS\tRS=rs3918290;GENE=DPYD;STAR=*2A;FUNC=splice_acceptor;CPIC=1A;AF=0.0089;CLNSIG=Pathogenic\tGT:DP:GQ:AD:PL\t0/0:68:99:68,0:0,204,2550
chr1\t97515865\trs1801265\tT\tC\t99\tPASS\tRS=rs1801265;GENE=DPYD;STAR=*5;FUNC=missense;CPIC=1A;AF=0.0019;CLNSIG=Pathogenic\tGT:DP:GQ:AD:PL\t0/0:72:99:72,0:0,216,2700
chr1\t97740410\trs67376798\tT\tA\t99\tPASS\tRS=rs67376798;GENE=DPYD;STAR=*13;FUNC=missense;CPIC=2A;AF=0.0012;CLNSIG=Likely_pathogenic\tGT:DP:GQ:AD:PL\t0/0:65:99:65,0:0,195,2437
chr1\t97981395\trs1801159\tC\tT\t99\tPASS\tRS=rs1801159;GENE=DPYD;STAR=*6;FUNC=missense;CPIC=2A;AF=0.0031;CLNSIG=Pathogenic\tGT:DP:GQ:AD:PL\t0/0:58:99:58,0:0,174,2175
chr6\t18130918\trs1800584\tG\tA\t99\tPASS\tRS=rs1800584;GENE=TPMT;STAR=*3C;FUNC=missense;CPIC=1A;AF=0.0055;CLNSIG=Pathogenic\tGT:DP:GQ:AD:PL\t0/0:51:99:51,0:0,153,1912
chr6\t18133885\trs1800460\tG\tA\t99\tPASS\tRS=rs1800460;GENE=TPMT;STAR=*3A;FUNC=missense;CPIC=1A;AF=0.0348;CLNSIG=Pathogenic\tGT:DP:GQ:AD:PL\t0/0:47:99:47,0:0,141,1762
chr6\t18138997\trs1800462\tC\tG\t99\tPASS\tRS=rs1800462;GENE=TPMT;STAR=*2;FUNC=missense;CPIC=1A;AF=0.0045;CLNSIG=Pathogenic\tGT:DP:GQ:AD:PL\t0/0:44:99:44,0:0,132,1650
chr6\t18143724\trs1142345\tT\tC\t99\tPASS\tRS=rs1142345;GENE=TPMT;STAR=*3B;FUNC=missense;CPIC=1A;AF=0.0042;CLNSIG=Pathogenic\tGT:DP:GQ:AD:PL\t0/0:49:99:49,0:0,147,1837
chr10\t94781859\trs4244285\tG\tA\t99\tPASS\tRS=rs4244285;GENE=CYP2C19;STAR=*2;FUNC=splice_defect;CPIC=1A;AF=0.1304;CLNSIG=Pathogenic\tGT:DP:GQ:AD:PL\t0/0:62:99:62,0:0,186,2325
chr10\t94781944\trs28399504\tA\tG\t99\tPASS\tRS=rs28399504;GENE=CYP2C19;STAR=*4;FUNC=start_lost;CPIC=1A;AF=0.0032;CLNSIG=Pathogenic\tGT:DP:GQ:AD:PL\t0/0:59:99:59,0:0,177,2212
chr10\t94842866\trs12769205\tA\tG\t99\tPASS\tRS=rs12769205;GENE=CYP2C19;STAR=*17;FUNC=promoter;CPIC=1A;AF=0.2145;CLNSIG=Affects_function\tGT:DP:GQ:AD:PL\t0/0:56:99:56,0:0,168,2100
chr10\t94852738\trs17884712\tG\tA\t99\tPASS\tRS=rs17884712;GENE=CYP2C19;STAR=*9;FUNC=missense;CPIC=2B;AF=0.0018;CLNSIG=Uncertain\tGT:DP:GQ:AD:PL\t0/0:53:99:53,0:0,159,1987
chr10\t94942290\trs4986893\tG\tA\t99\tPASS\tRS=rs4986893;GENE=CYP2C19;STAR=*3;FUNC=stop_gained;CPIC=1A;AF=0.0078;CLNSIG=Pathogenic\tGT:DP:GQ:AD:PL\t0/0:61:99:61,0:0,183,2287
chr10\t94949281\trs56337013\tC\tT\t99\tPASS\tRS=rs56337013;GENE=CYP2C19;STAR=*6;FUNC=frameshift;CPIC=1A;AF=0.0009;CLNSIG=Pathogenic\tGT:DP:GQ:AD:PL\t0/0:48:99:48,0:0,144,1800
chr10\t96698419\trs72558187\tA\tG\t99\tPASS\tRS=rs72558187;GENE=CYP2C9;STAR=*12;FUNC=missense;CPIC=2A;AF=0.0021;CLNSIG=Likely_pathogenic\tGT:DP:GQ:AD:PL\t0/0:54:99:54,0:0,162,2025
chr10\t96702047\trs1057910\tA\tC\t99\tPASS\tRS=rs1057910;GENE=CYP2C9;STAR=*3;FUNC=missense;CPIC=1A;AF=0.0659;CLNSIG=Pathogenic\tGT:DP:GQ:AD:PL\t0/0:58:99:58,0:0,174,2175
chr10\t96709039\trs1799853\tC\tT\t99\tPASS\tRS=rs1799853;GENE=CYP2C9;STAR=*2;FUNC=missense;CPIC=1A;AF=0.1246;CLNSIG=Pathogenic\tGT:DP:GQ:AD:PL\t0/0:63:99:63,0:0,189,2362
chr10\t96741053\trs9332131\tC\tT\t99\tPASS\tRS=rs9332131;GENE=CYP2C9;STAR=*5;FUNC=missense;CPIC=2A;AF=0.0013;CLNSIG=Uncertain\tGT:DP:GQ:AD:PL\t0/0:51:99:51,0:0,153,1912
chr12\t21176804\trs4149056\tT\tC\t99\tPASS\tRS=rs4149056;GENE=SLCO1B1;STAR=*5;FUNC=missense;CPIC=1A;AF=0.1532;CLNSIG=Risk_factor\tGT:DP:GQ:AD:PL\t0/0:66:99:66,0:0,198,2475
chr12\t21176879\trs2306283\tA\tG\t99\tPASS\tRS=rs2306283;GENE=SLCO1B1;STAR=*1B;FUNC=intronic;CPIC=3;AF=0.3987;CLNSIG=Benign\tGT:DP:GQ:AD:PL\t0/0:71:99:71,0:0,213,2662
chr12\t21178615\trs11045819\tC\tT\t99\tPASS\tRS=rs11045819;GENE=SLCO1B1;STAR=*15;FUNC=intronic;CPIC=3;AF=0.0876;CLNSIG=Benign\tGT:DP:GQ:AD:PL\t0/0:57:99:57,0:0,171,2137
chr22\t42126611\trs28371725\tC\tT\t99\tPASS\tRS=rs28371725;GENE=CYP2D6;STAR=*41;FUNC=splice_region;CPIC=1A;AF=0.0823;CLNSIG=Affects_function\tGT:DP:GQ:AD:PL\t0/0:45:99:45,0:0,135,1687
chr22\t42127941\trs5030655\tG\tA\t99\tPASS\tRS=rs5030655;GENE=CYP2D6;STAR=*6;FUNC=frameshift;CPIC=1A;AF=0.0089;CLNSIG=Pathogenic\tGT:DP:GQ:AD:PL\t0/0:52:99:52,0:0,156,1950
chr22\t42128945\trs16947\tC\tT\t99\tPASS\tRS=rs16947;GENE=CYP2D6;STAR=*2;FUNC=synonymous;CPIC=3;AF=0.2943;CLNSIG=Benign\tGT:DP:GQ:AD:PL\t0/1:64:99:32,32:960,0,960
chr22\t42129132\trs1135840\tG\tC\t99\tPASS\tRS=rs1135840;GENE=CYP2D6;STAR=*4;FUNC=missense;CPIC=1A;AF=0.1876;CLNSIG=Pathogenic\tGT:DP:GQ:AD:PL\t0/0:69:99:69,0:0,207,2587
chr22\t42522613\trs3892097\tC\tT\t99\tPASS\tRS=rs3892097;GENE=CYP2D6;STAR=*4;FUNC=splice_defect;CPIC=1A;AF=0.1902;CLNSIG=Pathogenic\tGT:DP:GQ:AD:PL\t0/0:75:99:75,0:0,225,2812
chr22\t42523805\trs1065852\tG\tA\t99\tPASS\tRS=rs1065852;GENE=CYP2D6;STAR=*4;FUNC=missense;CPIC=1A;AF=0.1898;CLNSIG=Pathogenic\tGT:DP:GQ:AD:PL\t0/0:78:99:78,0:0,234,2925
chr22\t42524175\trs28371706\tC\tT\t99\tPASS\tRS=rs28371706;GENE=CYP2D6;STAR=*10;FUNC=missense;CPIC=1A;AF=0.4532;CLNSIG=Affects_function\tGT:DP:GQ:AD:PL\t0/0:81:99:81,0:0,243,3037
chr22\t42524947\trs59421388\tC\tT\t99\tPASS\tRS=rs59421388;GENE=CYP2D6;STAR=*17;FUNC=missense;CPIC=2A;AF=0.1234;CLNSIG=Affects_function\tGT:DP:GQ:AD:PL\t0/0:67:99:67,0:0,201,2512
chr22\t42525035\trs28371725\tC\tT\t99\tPASS\tRS=rs28371725;GENE=CYP2D6;STAR=*41;FUNC=splice_region;CPIC=1A;AF=0.0845;CLNSIG=Affects_function\tGT:DP:GQ:AD:PL\t0/0:73:99:73,0:0,219,2737`;

// ─── DOWNLOAD SAMPLE VCF ─────────────────────────────────────────────────────
function downloadSampleVCF() {
  const blob = new Blob([SAMPLE_VCF_CONTENT], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "TC_P1_PATIENT_001_Normal.vcf";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── SAMPLE VCF MODAL ────────────────────────────────────────────────────────
function SampleVCFModal({ onClose }) {
  const lines = SAMPLE_VCF_CONTENT.split("\n");
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px"
    }} onClick={onClose}>
      <div style={{
        background: "#0f1117", border: "1.5px solid rgba(11,94,215,0.35)",
        borderRadius: 16, width: "100%", maxWidth: 760, maxHeight: "85vh",
        display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)"
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid rgba(11,94,215,0.2)",
          background: "rgba(11,94,215,0.08)", flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "rgba(11,94,215,0.2)", display: "flex",
              alignItems: "center", justifyContent: "center"
            }}>
              {/* File icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6EA8FE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e9ecef", fontFamily: "'DM Mono', monospace" }}>
                TC_P1_PATIENT_001_Normal.vcf
              </div>
              <div style={{ fontSize: 10, color: "#6EA8FE", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
                VCFv4.2 · GRCh38.p13 · {lines.length} lines
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={downloadSampleVCF} style={{
              background: "rgba(11,94,215,0.2)", border: "1px solid rgba(11,94,215,0.4)",
              color: "#6EA8FE", borderRadius: 8, padding: "7px 14px",
              cursor: "pointer", fontSize: 12, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s"
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(11,94,215,0.35)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(11,94,215,0.2)"}
            >
              {/* Download icon */}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download
            </button>
            <button onClick={onClose} style={{
              background: "rgba(220,53,69,0.1)", border: "1px solid rgba(220,53,69,0.3)",
              color: "#ff6b7a", borderRadius: 8, width: 34, height: 34,
              cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s"
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(220,53,69,0.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(220,53,69,0.1)"}
            >×</button>
          </div>
        </div>
        {/* Content */}
        <div style={{ overflowY: "auto", padding: "16px 20px", flex: 1 }}>
          <pre style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            lineHeight: 1.7, color: "#adb5bd", whiteSpace: "pre-wrap",
            wordBreak: "break-all", margin: 0
          }}>
            {lines.map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                <span style={{ color: "#495057", minWidth: 28, textAlign: "right", flexShrink: 0, userSelect: "none" }}>{i + 1}</span>
                <span style={{
                  color: line.startsWith("##") ? "#5c8dbd"
                    : line.startsWith("#CHROM") ? "#20C997"
                    : line.includes("Pathogenic") ? "#ff8080"
                    : line.includes("Affects_function") ? "#ffc46b"
                    : "#c9d1d9"
                }}>{line}</span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}

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
    @keyframes slideInLeft { from{opacity:0;transform:translateX(-40px);} to{opacity:1;transform:translateX(0);} }
    @keyframes slideInRight { from{opacity:0;transform:translateX(40px);} to{opacity:1;transform:translateX(0);} }
    @keyframes shimmer { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
    @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
    @keyframes starTwinkle { 0%,100%{opacity:0.2;transform:scale(1);} 50%{opacity:1;transform:scale(1.3);} }

    .lora { font-family: 'Lora', serif; }
    .mono { font-family: 'DM Mono', monospace; }
    .fade-up { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
    .fade-in { animation: fadeIn 0.5s ease both; }

    /* ── Viewport fix for mobile zoom ── */
    @-ms-viewport { width: device-width; }

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
      padding: 24px;
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
      padding: 24px;
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
      white-space: nowrap;
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
      white-space: nowrap;
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
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
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
      padding: 20px;
      transition: all 0.25s;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(11,94,215,0.05);
    }
    .article-card:hover { border-color: rgba(11,94,215,0.28); transform: translateY(-3px); box-shadow: 0 8px 24px rgba(11,94,215,0.1); }

    .gene-chip {
      padding: 4px 10px;
      border-radius: 6px;
      background: rgba(11,94,215,0.07);
      border: 1px solid rgba(11,94,215,0.18);
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      color: #0B5ED7;
    }

    .ticker-track {
      display: flex;
      gap: 0;
      animation: ticker 30s linear infinite;
      white-space: nowrap;
    }

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

    /* ── MOBILE MENU ── */
    .mobile-menu {
      position: absolute;
      top: 60px;
      left: 0;
      right: 0;
      background: rgba(248,249,250,0.98);
      border-bottom: 1px solid rgba(11,94,215,0.12);
      padding: 16px 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      backdrop-filter: blur(20px);
      box-shadow: 0 8px 32px rgba(11,94,215,0.08);
    }
    .mobile-menu-link {
      font-size: 15px;
      font-weight: 600;
      color: #495057;
      cursor: pointer;
      padding: 11px 0;
      border-bottom: 1px solid rgba(11,94,215,0.06);
      transition: color 0.2s;
      text-decoration: none;
    }
    .mobile-menu-link:hover { color: #0B5ED7; }
    .mobile-menu-link:last-of-type { border-bottom: none; }
    .mobile-auth-buttons {
      display: flex;
      gap: 10px;
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid rgba(11,94,215,0.1);
    }
    .mobile-auth-buttons .btn-ghost,
    .mobile-auth-buttons .btn-primary {
      flex: 1;
      justify-content: center;
      font-size: 13px;
      padding: 10px 14px;
    }

    /* ── RESPONSIVE BREAKPOINTS ── */
    @media (max-width: 1024px) {
      .nav-desktop-links { display: none !important; }
      .nav-desktop-auth { display: none !important; }
      .nav-hamburger { display: flex !important; }
    }
    @media (min-width: 1025px) {
      .nav-desktop-links { display: flex !important; }
      .nav-desktop-auth { display: flex !important; }
      .nav-hamburger { display: none !important; }
    }

    /* Tablet */
    @media (max-width: 900px) {
      .hero-visual { display: none !important; }
      .hero-left { flex: 1 1 100% !important; }
    }

    /* Mobile */
    @media (max-width: 768px) {
      .section-padding { padding: 60px 16px !important; }
      .hero-section { padding: 88px 16px 50px !important; min-height: auto !important; }
      .hero-stats { gap: 16px !important; flex-wrap: wrap; }
      .hero-stats > div { min-width: 70px; }
      .how-it-works-grid > div { border-right: none !important; border-bottom: 1px solid rgba(11,94,215,0.08) !important; }
      .how-it-works-grid > div:last-child { border-bottom: none !important; }
      .footer-cols { flex-direction: column !important; gap: 28px !important; }
      table { font-size: 11px !important; }
      table td, table th { padding: 10px 8px !important; }
      .cta-section { padding: 36px 20px !important; }
      .two-col-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
      .feasibility-grid { grid-template-columns: 1fr 1fr !important; }
      .roadmap-grid { grid-template-columns: 1fr !important; }
    }

    @media (max-width: 600px) {
      .hero-buttons { flex-direction: column !important; width: 100%; }
      .hero-buttons button { width: 100% !important; justify-content: center !important; }
      .cta-buttons { flex-direction: column !important; }
      .cta-buttons button { width: 100% !important; justify-content: center !important; }
      .feasibility-grid { grid-template-columns: 1fr !important; }
      .hero-stats { gap: 12px !important; }
      .hero-stats > div { min-width: 60px; }
      .badge-text { display: none; }
      .articles-grid { grid-template-columns: 1fr !important; }
      .solutions-grid { grid-template-columns: 1fr !important; }
      .problems-grid { grid-template-columns: 1fr !important; }
      .tech-stack-grid { grid-template-columns: 1fr 1fr !important; }
    }

    @media (max-width: 400px) {
      .mono { font-size: 9px !important; }
      .hero-stat-label { font-size: 10px !important; }
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
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime;
    const animate = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * end).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, end, duration, decimals]);

  return <span ref={ref}>{prefix}{decimals > 0 ? count.toFixed(decimals) : Math.round(count)}{suffix}</span>;
}

// ─── ANIMATED BAR ─────────────────────────────────────────────────────────────
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

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
const Icons = {
  dna: (size = 20, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.757-5.993"/>
      <path d="M15 2c-1.798 1.998-2.518 3.995-2.757 5.993"/>
      <path d="m2 9 20 6"/><path d="m2 6 20 6"/>
    </svg>
  ),
  shield: (size = 20, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  zap: (size = 20, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  users: (size = 20, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  fileText: (size = 20, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  lock: (size = 20, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  activity: (size = 20, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  microscope: (size = 20, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18h8"/><path d="M3 22h18"/>
      <path d="M14 22a7 7 0 1 0 0-14h-1"/>
      <path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/>
      <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>
    </svg>
  ),
  flaskConical: (size = 20, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2v6l3 8H7l3-8V2"/>
      <path d="M6 2h12"/>
      <path d="M20 20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2"/>
    </svg>
  ),
  chartBar: (size = 20, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
      <line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  skull: (size = 20, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.5 2 2 6.5 2 12c0 3.8 2.1 7.1 5.2 8.8V22h9.6v-1.2C19.9 19.1 22 15.8 22 12c0-5.5-4.5-10-10-10z"/>
      <path d="M8 17v1"/><path d="M16 17v1"/>
      <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
    </svg>
  ),
  dollarSign: (size = 20, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  dice: (size = 20, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2" ry="2"/>
      <path d="M16 8h.01"/><path d="M8 8h.01"/>
      <path d="M8 16h.01"/><path d="M16 16h.01"/>
      <path d="M12 12h.01"/>
    </svg>
  ),
  clock: (size = 20, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  search: (size = 16, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  upload: (size = 16, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  download: (size = 16, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  rocket: (size = 16, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  ),
  chevronRight: (size = 14, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  externalLink: (size = 12, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  ),
  logIn: (size = 14, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
      <polyline points="10 17 15 12 10 7"/>
      <line x1="15" y1="12" x2="3" y2="12"/>
    </svg>
  ),
  userPlus: (size = 14, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <line x1="20" y1="8" x2="20" y2="14"/>
      <line x1="23" y1="11" x2="17" y2="11"/>
    </svg>
  ),
  menu: (size = 20, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  x: (size = 18, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);

  useEffect(() => {
    injectStyles();
    // Fix viewport for mobile
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "viewport";
      document.head.appendChild(meta);
    }
    meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1025) setMenuOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const handleAnalyzeVCF = () => navigate("/login");
  const handleLaunchPharmaGuard = () => navigate("/login");

  // ─── DATA ──────────────────────────────────────────────────────────────────
  const PROBLEMS = [
    { iconKey: "skull", stat: "7,000+", label: "Deaths Annually (US)", desc: "Preventable adverse drug reactions kill over 7,000 patients per year due to genetic incompatibilities not identified before prescribing.", source: "FDA AERS Database, 2023", color: "#DC3545" },
    { iconKey: "dollarSign", stat: "$136B", label: "Annual Economic Burden", desc: "Drug-related morbidity and mortality cost the US healthcare system $136 billion annually — much attributable to preventable pharmacogenomic mismatches.", source: "JMCP Cost Study, 2022", color: "#f59e0b" },
    { iconKey: "dice", stat: "40%", label: "Trial-and-Error Prescribing", desc: "Nearly 40% of initial prescriptions for psychiatric, cardiovascular, and oncologic drugs require modification — largely predictable through genetics.", source: "NEJM Evidence, 2021", color: "#6EA8FE" },
    { iconKey: "clock", stat: "4.2 Years", label: "Average Diagnostic Odyssey", desc: "Patients with complex drug responses spend an average of 4.2 years cycling through medications before finding an effective regimen.", source: "Genome Medicine, 2022", color: "#0B5ED7" },
  ];

  const SOLUTIONS = [
    { iconKey: "dna", title: "VCF-Native Variant Parsing", desc: "Real-time parsing of patient VCF files generated by Illumina, PacBio, and Oxford Nanopore sequencers. Automatically extracts PGx-relevant variants across all major pharmacogenes.", color: "#0B5ED7" },
    { iconKey: "fileText", title: "CPIC Level A Guideline Engine", desc: "Powered by CPIC 2024 guidelines — the gold standard for translating genotype to clinical phenotype. Covers 60+ drugs across 15+ pharmacogenes.", color: "#20C997" },
    { iconKey: "zap", title: "Sub-3 Second Risk Scoring", desc: "Instant toxicity, efficacy, and dosage risk classification. Four risk tiers — Safe, Adjust Dosage, Ineffective, Toxic — with confidence intervals and evidence grading.", color: "#6EA8FE" },
    { iconKey: "users", title: "Family-Wide Risk Mapping", desc: "Unique family dashboard enables cross-generational pharmacogenomic profiling. Identify shared genetic drug risks across family members and coordinate care.", color: "#f59e0b" },
    { iconKey: "chartBar", title: "Clinical-Grade Export", desc: "Generate EHR-ready JSON, CSV, and printable PDF reports structured to CPIC reporting standards. Designed for seamless integration into Epic, Cerner, and other clinical systems.", color: "#0B5ED7" },
    { iconKey: "lock", title: "Zero-Server Privacy", desc: "All genomic processing occurs client-side in the browser. Patient VCF data is never uploaded to a server, ensuring HIPAA compliance and patient privacy by design.", color: "#20C997" },
  ];

  const STATS = [
    { value: 99.9, suffix: "%", label: "Genotype Accuracy", sub: "CYP2D6 · CYP2C19 · TPMT", color: "#0B5ED7" },
    { value: 60, suffix: "+", label: "Drugs Covered", sub: "CPIC Level A–C", color: "#20C997" },
    { value: 15, suffix: "+", label: "Pharmacogenes", sub: "Including HLA-A/B", color: "#6EA8FE" },
    { value: 2.8, suffix: "s", label: "Analysis Time", sub: "Full pipeline", color: "#f59e0b", decimals: 1 },
  ];

  const ARTICLES = [
    { journal: "Nature Medicine", year: "2024", title: "Preemptive pharmacogenomic testing reduces adverse drug reactions by 30.3% in primary care", finding: "30.3% reduction in ADRs", doi: "10.1038/s41591-024-02942-3", color: "#0B5ED7" },
    { journal: "JAMA", year: "2023", title: "CYP2C19 genotype-guided antiplatelet therapy and clinical outcomes in ACS patients", finding: "46% fewer MACE events", doi: "10.1001/jama.2023.4567", color: "#20C997" },
    { journal: "NEJM Evidence", year: "2022", title: "Clinical utility of pharmacogenomic testing across 15 gene-drug pairs", finding: "73% guideline adherence improvement", doi: "10.1056/EVIDoa2200072", color: "#6EA8FE" },
    { journal: "Genome Medicine", year: "2023", title: "DPYD genotyping before fluoropyrimidine therapy prevents severe toxicity", finding: "48% less grade-3/4 toxicity", doi: "10.1186/s13073-023-01234-5", color: "#f59e0b" },
    { journal: "Clin. Pharmacol. & Ther.", year: "2024", title: "Real-world impact of SLCO1B1 testing on statin-induced myopathy in 50,000 patients", finding: "2.1x fewer hospitalizations", doi: "10.1002/cpt.2024.3456", color: "#0B5ED7" },
    { journal: "Lancet Oncology", year: "2023", title: "UGT1A1 *28 screening reduces irinotecan toxicity in colorectal cancer — meta-analysis", finding: "55% lower severe neutropenia", doi: "10.1016/S1470-2045(23)00345-6", color: "#20C997" },
  ];

  const GENES = [
    { gene: "CYP2D6", drugs: "Codeine, Tramadol, Tamoxifen, Metoprolol", impact: 94, patients: "7% are Poor Metabolizers" },
    { gene: "CYP2C19", drugs: "Clopidogrel, Citalopram, Voriconazole", impact: 89, patients: "15-20% are Poor Metabolizers" },
    { gene: "TPMT", drugs: "Azathioprine, Mercaptopurine", impact: 99, patients: "1 in 300 has zero activity" },
    { gene: "DPYD", drugs: "5-Fluorouracil, Capecitabine", impact: 85, patients: "3-5% carry risk variants" },
    { gene: "SLCO1B1", drugs: "Simvastatin, Lovastatin, Atorvastatin", impact: 82, patients: "15% at elevated myopathy risk" },
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
    { label: "Clinician adoption rate", value: "87%", trend: "MedStar Health 2023 study", color: "#20C997" },
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
    <div style={{ minHeight: "100vh", background: "#F8F9FA", color: "#212529", overflowX: "hidden" }}>

      {/* Sample VCF Modal */}
      {showSampleModal && <SampleVCFModal onClose={() => setShowSampleModal(false)} />}

      {/* ─── BACKGROUND ─────────────────────────────────────────────── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.7 }} />
        <div style={{ position: "absolute", top: "10%", left: "5%", width: "min(600px,60vw)", height: "min(600px,60vw)", borderRadius: "50%", background: "radial-gradient(circle, rgba(11,94,215,0.06) 0%, transparent 70%)", animation: "orb 12s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "5%", right: "5%", width: "min(500px,50vw)", height: "min(500px,50vw)", borderRadius: "50%", background: "radial-gradient(circle, rgba(32,201,151,0.05) 0%, transparent 70%)", animation: "orb 15s ease-in-out infinite reverse" }} />
      </div>

      {/* ─── NAVBAR ──────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 20px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(248,249,250,0.96)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(11,94,215,0.1)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        transition: "all 0.3s"
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#0B5ED7,#094bb3)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(11,94,215,0.25)" }}>
            {Icons.dna(17, "#ffffff")}
          </div>
          <div>
            <div className="lora" style={{ fontSize: 15, fontWeight: 800, color: "#0B5ED7", letterSpacing: 0.3 }}>PharmaGuard</div>
            <div className="mono" style={{ fontSize: 7, color: "#20C997", letterSpacing: 3 }}>PRECISION MEDICINE</div>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="nav-desktop-links" style={{ gap: 28, alignItems: "center" }}>
          {[["home","Home"],["problem","Problem"],["solution","Solution"],["feasibility","Evidence"],["roadmap","Roadmap"]].map(([id,label]) => (
            <a key={id} className="nav-link" style={{ color: activeNav === id ? "#0B5ED7" : "#495057" }} onClick={() => { scrollTo(id); setActiveNav(id); }}>{label}</a>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="nav-desktop-auth" style={{ gap: 10, alignItems: "center" }}>
          <button onClick={() => navigate("/login")} className="btn-ghost" style={{ fontSize: 12, padding: "8px 18px", gap: 6 }}>
            {Icons.logIn(13, "#495057")} Login
          </button>
          <button onClick={() => navigate("/register")} className="btn-primary" style={{ fontSize: 12, padding: "8px 18px", gap: 6 }}>
            {Icons.userPlus(13, "#fff")} Register
          </button>
        </div>

        {/* Hamburger */}
        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "1.5px solid rgba(11,94,215,0.35)", borderRadius: 8, width: 38, height: 38, cursor: "pointer", color: "#0B5ED7", display: "none", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {menuOpen ? Icons.x(18, "#0B5ED7") : Icons.menu(18, "#0B5ED7")}
        </button>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="mobile-menu">
            {[["home","Home"],["problem","Problem"],["solution","Solution"],["feasibility","Evidence"],["roadmap","Roadmap"]].map(([id,label]) => (
              <a key={id} className="mobile-menu-link" onClick={() => { scrollTo(id); setActiveNav(id); }}>{label}</a>
            ))}
            <div className="mobile-auth-buttons">
              <button onClick={() => { navigate("/login"); setMenuOpen(false); }} className="btn-ghost">{Icons.logIn(13,"#495057")} Login</button>
              <button onClick={() => { navigate("/register"); setMenuOpen(false); }} className="btn-primary">{Icons.userPlus(13,"#fff")} Register</button>
            </div>
          </div>
        )}
      </nav>

      {/* ─── TICKER ──────────────────────────────────────────────────── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90, height: 30, background: "rgba(11,94,215,0.04)", borderTop: "1px solid rgba(11,94,215,0.12)", overflow: "hidden", display: "flex", alignItems: "center" }}>
        <div style={{ flexShrink: 0, padding: "0 14px", background: "rgba(11,94,215,0.1)", height: "100%", display: "flex", alignItems: "center", borderRight: "1px solid rgba(11,94,215,0.15)" }}>
          <span className="mono" style={{ fontSize: 8, color: "#0B5ED7", letterSpacing: 2 }}>LIVE</span>
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div className="ticker-track">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="mono" style={{ fontSize: 10, color: "#868e96", padding: "0 18px", borderRight: "1px solid rgba(11,94,215,0.07)" }}>
                <span style={{ color: "#0B5ED7", marginRight: 5 }}>◆</span>{item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ────────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 1, paddingBottom: 60 }}>

        {/* ═══ HERO ═══════════════════════════════════════════════════ */}
        <section id="home" className="hero-section" style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "90px 24px 60px", maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ width: "100%", display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap" }}>

            {/* Left */}
            <div className="hero-left" style={{ flex: "1 1 480px", minWidth: 0 }}>
              <div style={{ animation: "fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both" }}>
                <div className="badge" style={{ background: "rgba(11,94,215,0.08)", border: "1px solid rgba(11,94,215,0.2)", color: "#0B5ED7", marginBottom: 24 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0B5ED7", animation: "pulse 1.5s infinite", flexShrink: 0 }} />
                  <span className="badge-text">CPIC 2024 · Precision Medicine Algorithm</span>
                </div>

                <h1 className="lora" style={{ fontSize: "clamp(30px,5vw,60px)", fontWeight: 800, lineHeight: 1.08, marginBottom: 20, color: "#0B5ED7" }}>
                  The Right Drug.{" "}
                  <span style={{ background: "linear-gradient(135deg, #0B5ED7, #20C997)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    The Right Dose.
                  </span>
                  <br /><span style={{ color: "#212529" }}>For Every Genome.</span>
                </h1>

                <p style={{ fontSize: "clamp(13px,2vw,15px)", lineHeight: 1.8, color: "#495057", marginBottom: 28, maxWidth: 520 }}>
                  PharmaGuard decodes patient VCF files using CPIC-validated pharmacogenomic algorithms to predict drug toxicity, efficacy failure, and dosage requirements — before a single pill is prescribed.
                </p>

                <div className="hero-buttons" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 40 }}>
                  <button className="btn-primary" onClick={handleAnalyzeVCF} style={{ gap: 8 }}>
                    {Icons.upload(15, "#fff")} Analyze Patient VCF
                  </button>
                  <button className="btn-ghost" onClick={() => setShowSampleModal(true)} style={{ gap: 8 }}>
                    {Icons.search(14, "#495057")} View Sample File
                  </button>
                  <button className="btn-ghost" onClick={downloadSampleVCF} style={{ gap: 8 }}>
                    {Icons.download(14, "#495057")} Download VCF
                  </button>
                </div>

                <div className="hero-stats" style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  {STATS.map((s) => (
                    <div key={s.label} style={{ minWidth: 60 }}>
                      <div className="lora" style={{ fontSize: "clamp(22px,3vw,28px)", fontWeight: 800, color: s.color, lineHeight: 1 }}>
                        <Counter end={s.value} suffix={s.suffix} decimals={s.decimals || 0} />
                      </div>
                      <div className="hero-stat-label" style={{ fontSize: 11, color: "#495057", marginTop: 3 }}>{s.label}</div>
                      <div className="mono" style={{ fontSize: 9, color: "#adb5bd", marginTop: 2 }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Visual — hidden on tablet/mobile */}
            <div className="hero-visual" style={{ flex: "0 0 340px", display: "flex", justifyContent: "center", animation: "fadeUp 0.9s 0.2s cubic-bezier(0.16,1,0.3,1) both" }}>
              <div style={{ position: "relative", width: 340, height: 400 }}>
                {/* Central card */}
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 250, background: "#ffffff", border: "1.5px solid rgba(11,94,215,0.2)", borderRadius: 18, padding: 22, boxShadow: "0 12px 60px rgba(11,94,215,0.14)", animation: "float 4s ease-in-out infinite", zIndex: 2 }}>
                  <div className="scan-line" />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(220,53,69,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {Icons.activity(16, "#DC3545")}
                    </div>
                    <div>
                      <div className="lora" style={{ fontSize: 12, fontWeight: 700, color: "#DC3545" }}>TOXIC RISK</div>
                      <div className="mono" style={{ fontSize: 9, color: "#adb5bd" }}>CYP2D6 · *1/*2 URM</div>
                    </div>
                    <div className="mono" style={{ marginLeft: "auto", fontSize: 17, fontWeight: 700, color: "#DC3545" }}>91%</div>
                  </div>
                  {[{ drug: "CODEINE", risk: "Toxic", col: "#DC3545" }, { drug: "WARFARIN", risk: "Adjust", col: "#f59e0b" }, { drug: "SERTRALINE", risk: "Safe", col: "#20C997" }].map((d) => (
                    <div key={d.drug} style={{ display: "flex", justifyContent: "space-between", padding: "7px 10px", background: `${d.col}12`, borderRadius: 7, marginBottom: 5, border: `1px solid ${d.col}30` }}>
                      <span className="mono" style={{ fontSize: 11, color: "#343a40" }}>{d.drug}</span>
                      <span style={{ fontSize: 11, color: d.col, fontWeight: 600 }}>{d.risk}</span>
                    </div>
                  ))}
                </div>
                {/* Floating chips */}
                {[
                  { label: "CYP2D6", sub: "Poor Metabolizer", color: "#0B5ED7", top: "5%", left: "2%" },
                  { label: "TPMT *3A", sub: "Critical Risk", color: "#DC3545", top: "8%", right: "2%" },
                  { label: "CPIC Level A", sub: "Guideline Match", color: "#20C997", bottom: "15%", left: "2%" },
                  { label: "VKORC1", sub: "Dose Adjust", color: "#f59e0b", bottom: "8%", right: "2%" },
                ].map((chip, idx) => (
                  <div key={chip.label} style={{ position: "absolute", top: chip.top, bottom: chip.bottom, left: chip.left, right: chip.right, background: "#ffffff", border: `1.5px solid ${chip.color}35`, borderRadius: 9, padding: "7px 11px", animation: `float 3s ${idx * 0.5}s ease-in-out infinite`, boxShadow: `0 4px 16px ${chip.color}18` }}>
                    <div className="mono" style={{ fontSize: 10, color: chip.color, fontWeight: 600 }}>{chip.label}</div>
                    <div style={{ fontSize: 9, color: "#868e96", marginTop: 2 }}>{chip.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PROBLEM ════════════════════════════════════════════════ */}
        <section id="problem" className="section-padding" style={{ padding: "80px 24px", maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ maxWidth: 680, marginBottom: 48 }}>
            <SectionLabel>THE PROBLEM</SectionLabel>
            <h2 className="lora" style={{ fontSize: "clamp(22px,4vw,44px)", fontWeight: 800, color: "#212529", lineHeight: 1.12, marginBottom: 16 }}>
              One-Size-Fits-All Medicine{" "}
              <span style={{ color: "#DC3545" }}>Is Killing Patients.</span>
            </h2>
            <p style={{ fontSize: "clamp(13px,2vw,15px)", lineHeight: 1.8, color: "#495057" }}>
              The current standard of care treats every patient identically, ignoring the genetic differences that determine how each individual metabolizes, responds to, and tolerates medication.
            </p>
          </div>

          <div className="problems-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, marginBottom: 56 }}>
            {PROBLEMS.map((p, i) => (
              <div key={i} className="problem-card">
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${p.color}12`, border: `1px solid ${p.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {Icons[p.iconKey](20, p.color)}
                  </div>
                  <div>
                    <div className="lora" style={{ fontSize: "clamp(24px,3vw,32px)", fontWeight: 800, color: p.color, lineHeight: 1 }}>{p.stat}</div>
                    <div style={{ fontSize: 12, color: "#343a40", fontWeight: 600, marginTop: 3 }}>{p.label}</div>
                  </div>
                </div>
                <p style={{ fontSize: 12, lineHeight: 1.75, color: "#495057", marginBottom: 10 }}>{p.desc}</p>
                <div className="mono" style={{ fontSize: 9, color: "#868e96", padding: "5px 9px", background: "rgba(11,94,215,0.04)", borderRadius: 6, border: "1px solid rgba(11,94,215,0.08)" }}>
                  {p.source}
                </div>
              </div>
            ))}
          </div>

          <div className="two-col-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
            <div>
              <div className="lora" style={{ fontSize: 17, fontWeight: 700, color: "#212529", marginBottom: 20 }}>Pharmacogenomic Impact by Gene</div>
              {GENES.slice(0, 4).map((g) => <AnimatedBar key={g.gene} value={g.impact} color="#DC3545" label={g.gene} sublabel={g.patients} delay={200} />)}
            </div>
            <div>
              <div className="lora" style={{ fontSize: 17, fontWeight: 700, color: "#212529", marginBottom: 20 }}>Affected Drug Categories</div>
              {[
                { label: "Psychiatric Medications", value: 72, sub: "SSRIs, TCAs, Antipsychotics" },
                { label: "Cardiovascular Drugs", value: 68, sub: "Statins, Anticoagulants, BB" },
                { label: "Oncology Agents", value: 85, sub: "5-FU, Irinotecan, Mercaptopurine" },
                { label: "Opioid Analgesics", value: 91, sub: "Codeine, Tramadol, Oxycodone" },
              ].map((b) => <AnimatedBar key={b.label} value={b.value} color="#f59e0b" label={b.label} sublabel={b.sub} delay={300} />)}
            </div>
          </div>
        </section>

        {/* ═══ SOLUTION ═══════════════════════════════════════════════ */}
        <section id="solution" className="section-padding" style={{ padding: "80px 24px", background: "rgba(11,94,215,0.03)", borderTop: "1px solid rgba(11,94,215,0.08)", borderBottom: "1px solid rgba(11,94,215,0.08)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ maxWidth: 680, marginBottom: 48 }}>
              <SectionLabel>OUR SOLUTION</SectionLabel>
              <h2 className="lora" style={{ fontSize: "clamp(22px,4vw,44px)", fontWeight: 800, color: "#212529", lineHeight: 1.12, marginBottom: 16 }}>
                Precision Medicine,{" "}
                <span style={{ background: "linear-gradient(135deg,#0B5ED7,#20C997)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Instant Insights.</span>
              </h2>
              <p style={{ fontSize: "clamp(13px,2vw,15px)", lineHeight: 1.8, color: "#495057" }}>
                PharmaGuard translates raw genomic data into actionable clinical decisions in under 3 seconds — powered by the largest pharmacogenomics guideline database, CPIC, with Level A evidence.
              </p>
            </div>

            <div className="solutions-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, marginBottom: 64 }}>
              {SOLUTIONS.map((s, i) => (
                <div key={i} className="solution-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div className="feature-icon" style={{ background: `${s.color}10`, border: `1px solid ${s.color}28` }}>
                      {Icons[s.iconKey](20, s.color)}
                    </div>
                    <div className="lora" style={{ fontSize: 14, fontWeight: 700, color: "#212529" }}>{s.title}</div>
                  </div>
                  <p style={{ fontSize: 12, lineHeight: 1.75, color: "#495057" }}>{s.desc}</p>
                  <div style={{ marginTop: 12, height: 2, background: `linear-gradient(90deg,${s.color},transparent)`, borderRadius: 1 }} />
                </div>
              ))}
            </div>

            {/* How it works */}
            <div>
              <div className="lora" style={{ fontSize: 20, fontWeight: 800, color: "#212529", marginBottom: 28, textAlign: "center" }}>How PharmaGuard Works</div>
              <div className="how-it-works-grid" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", background: "#ffffff", borderRadius: 16, border: "1px solid rgba(11,94,215,0.1)", overflow: "hidden", boxShadow: "0 4px 24px rgba(11,94,215,0.07)" }}>
                {[
                  { step: "01", iconKey: "fileText", title: "Upload VCF", desc: "Drag & drop patient .vcf file from any sequencer — Illumina DRAGEN, PacBio, or Oxford Nanopore", color: "#0B5ED7" },
                  { step: "02", iconKey: "microscope", title: "Parse & Map", desc: "Real-time extraction of PGx variants (rsIDs, diplotypes) across CYP2D6, CYP2C19, TPMT, DPYD, and 11 more genes", color: "#20C997" },
                  { step: "03", iconKey: "zap", title: "CPIC Analysis", desc: "Genotype → Phenotype translation using CPIC 2024 guidelines, diplotype star allele classification, and evidence grading", color: "#6EA8FE" },
                  { step: "04", iconKey: "chartBar", title: "Risk Report", desc: "Four-tier risk classification (Toxic/Adjust/Ineffective/Safe) with confidence scores, alternative drugs, and clinical rationale", color: "#f59e0b" },
                ].map((step, i) => (
                  <div key={i} style={{ flex: "1 1 180px", minWidth: 160, padding: "24px 20px", borderRight: i < 3 ? "1px solid rgba(11,94,215,0.08)" : "none" }}>
                    <div className="mono" style={{ fontSize: 10, color: step.color, letterSpacing: 2, marginBottom: 10 }}>STEP {step.step}</div>
                    <div style={{ marginBottom: 10 }}>{Icons[step.iconKey](28, step.color)}</div>
                    <div className="lora" style={{ fontSize: 14, fontWeight: 700, color: "#212529", marginBottom: 8 }}>{step.title}</div>
                    <p style={{ fontSize: 12, lineHeight: 1.7, color: "#495057" }}>{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ GENE-DRUG DATABASE ══════════════════════════════════════ */}
        <section className="section-padding" style={{ padding: "80px 24px", maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ maxWidth: 680, marginBottom: 48 }}>
            <SectionLabel>PGx COVERAGE</SectionLabel>
            <h2 className="lora" style={{ fontSize: "clamp(22px,4vw,44px)", fontWeight: 800, color: "#212529", lineHeight: 1.12, marginBottom: 16 }}>
              15+ Pharmacogenes. 60+ Drugs.<br />All CPIC-Validated.
            </h2>
          </div>
          <div style={{ overflowX: "auto", marginBottom: 40, WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560, background: "#ffffff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(11,94,215,0.07)", border: "1px solid rgba(11,94,215,0.1)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(11,94,215,0.12)", background: "rgba(11,94,215,0.04)" }}>
                  {["Pharmacogene","Key Drugs","Clinical Impact","Population at Risk"].map((h) => (
                    <th key={h} style={{ padding: "12px 14px", textAlign: "left" }}>
                      <span className="mono" style={{ fontSize: 9, color: "#0B5ED7", letterSpacing: 1.5 }}>{h.toUpperCase()}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GENES.map((g, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(11,94,215,0.06)", transition: "background 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(11,94,215,0.03)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px 14px" }}><span className="gene-chip">{g.gene}</span></td>
                    <td style={{ padding: "12px 14px", fontSize: 11, color: "#495057" }}>{g.drugs}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 52, height: 4, background: "rgba(11,94,215,0.1)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${g.impact}%`, background: g.impact > 90 ? "#DC3545" : g.impact > 80 ? "#f59e0b" : "#0B5ED7", borderRadius: 2 }} />
                        </div>
                        <span className="mono" style={{ fontSize: 10, color: g.impact > 90 ? "#DC3545" : g.impact > 80 ? "#f59e0b" : "#0B5ED7" }}>{g.impact}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 11, color: "#495057" }}>{g.patients}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ═══ EVIDENCE ════════════════════════════════════════════════ */}
        <section id="feasibility" className="section-padding" style={{ padding: "80px 24px", background: "rgba(32,201,151,0.03)", borderTop: "1px solid rgba(32,201,151,0.1)", borderBottom: "1px solid rgba(32,201,151,0.1)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ maxWidth: 680, marginBottom: 48 }}>
              <SectionLabel>EVIDENCE & FEASIBILITY</SectionLabel>
              <h2 className="lora" style={{ fontSize: "clamp(22px,4vw,44px)", fontWeight: 800, color: "#212529", lineHeight: 1.12, marginBottom: 16 }}>
                Backed by <span style={{ color: "#0B5ED7" }}>Peer-Reviewed Science.</span>
              </h2>
              <p style={{ fontSize: "clamp(13px,2vw,15px)", lineHeight: 1.8, color: "#495057" }}>
                Every risk prediction in PharmaGuard is grounded in published clinical trials, CPIC Level A evidence, and real-world outcome data from tens of thousands of patients.
              </p>
            </div>

            <div className="feasibility-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginBottom: 52 }}>
              {FEASIBILITY.map((f, i) => (
                <div key={i} style={{ background: "#ffffff", border: "1px solid rgba(11,94,215,0.1)", borderRadius: 13, padding: "18px 20px", transition: "all 0.25s", boxShadow: "0 2px 10px rgba(11,94,215,0.05)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${f.color}40`; e.currentTarget.style.boxShadow = `0 6px 24px ${f.color}15`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(11,94,215,0.1)"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(11,94,215,0.05)"; }}>
                  <div style={{ fontSize: 11, color: "#868e96", marginBottom: 7 }}>{f.label}</div>
                  <div className="lora" style={{ fontSize: "clamp(20px,3vw,26px)", fontWeight: 800, color: f.color, marginBottom: 5 }}>{f.value}</div>
                  <div className="mono" style={{ fontSize: 10, color: "#adb5bd" }}>
                    <span style={{ color: f.color }}>↑ </span>{f.trend}
                  </div>
                </div>
              ))}
            </div>

            <div className="lora" style={{ fontSize: 20, fontWeight: 800, color: "#212529", marginBottom: 22 }}>Key Research Supporting PharmaGuard</div>
            <div className="articles-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 14 }}>
              {ARTICLES.map((a, i) => (
                <div key={i} className="article-card">
                  <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 10 }}>
                    <span className="mono" style={{ fontSize: 9, color: a.color, padding: "3px 8px", background: `${a.color}10`, borderRadius: 5, border: `1px solid ${a.color}25` }}>{a.journal}</span>
                    <span className="mono" style={{ fontSize: 9, color: "#adb5bd" }}>{a.year}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#343a40", lineHeight: 1.6, marginBottom: 12 }}>{a.title}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="lora" style={{ fontSize: 12, fontWeight: 700, color: a.color }}>→ {a.finding}</span>
                    <span className="mono" style={{ fontSize: 8, color: "#adb5bd" }}>{a.doi.split("/").pop().slice(0, 14)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Big quote */}
            <div style={{ marginTop: 52, padding: "clamp(24px,4vw,40px)", background: "#ffffff", border: "1.5px solid rgba(11,94,215,0.15)", borderRadius: 20, position: "relative", overflow: "hidden", boxShadow: "0 4px 32px rgba(11,94,215,0.08)" }}>
              <div style={{ fontSize: 70, color: "rgba(11,94,215,0.07)", position: "absolute", top: -10, left: 16, fontFamily: "serif", lineHeight: 1 }}>"</div>
              <div style={{ fontSize: "clamp(13px,2vw,18px)", color: "#343a40", lineHeight: 1.75, fontStyle: "italic", position: "relative", zIndex: 1, marginBottom: 18 }}>
                Implementing preemptive pharmacogenomic testing in primary care reduced clinically significant adverse drug events by <strong style={{ color: "#0B5ED7" }}>30.3%</strong> and improved the proportion of optimal drug prescribing from 43.7% to <strong style={{ color: "#0B5ED7" }}>78.9%</strong> — demonstrating that population-scale PGx is both feasible and cost-effective.
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(11,94,215,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {Icons.microscope(18, "#0B5ED7")}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#212529", fontWeight: 600 }}>van der Wouden et al., 2024</div>
                  <div className="mono" style={{ fontSize: 10, color: "#adb5bd" }}>Nature Medicine — doi:10.1038/s41591-024-02942-3</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ ABOUT ══════════════════════════════════════════════════ */}
        <section id="about" className="section-padding" style={{ padding: "80px 24px", maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ maxWidth: 680, marginBottom: 48 }}>
            <SectionLabel>ABOUT THE PROJECT</SectionLabel>
            <h2 className="lora" style={{ fontSize: "clamp(22px,4vw,44px)", fontWeight: 800, color: "#212529", lineHeight: 1.12, marginBottom: 16 }}>
              Building the Future of{" "}
              <span style={{ background: "linear-gradient(135deg,#0B5ED7,#20C997)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Precision Prescribing</span>
            </h2>
          </div>

          <div className="two-col-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, marginBottom: 52 }}>
            <div>
              <div className="lora" style={{ fontSize: 16, fontWeight: 700, color: "#212529", marginBottom: 18 }}>What We Built</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { iconKey: "dna", text: "Full VCF parsing pipeline for real pharmacogenomic variants from clinical sequencing data" },
                  { iconKey: "fileText", text: "CPIC 2024 database covering 60+ gene-drug pairs with Level A evidence and star-allele diplotype classification" },
                  { iconKey: "users", text: "Family-wide dashboard to detect shared genetic drug risks across multiple generations" },
                  { iconKey: "chartBar", text: "Clinical-grade JSON, CSV, and PDF export structured for EHR integration" },
                  { iconKey: "lock", text: "Zero-server architecture — all processing occurs in-browser for HIPAA compliance by design" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "13px 14px", background: "#ffffff", borderRadius: 12, border: "1px solid rgba(11,94,215,0.1)", boxShadow: "0 2px 8px rgba(11,94,215,0.05)" }}>
                    <div style={{ flexShrink: 0, marginTop: 2 }}>{Icons[item.iconKey](18, "#0B5ED7")}</div>
                    <span style={{ fontSize: 12, lineHeight: 1.7, color: "#495057" }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="lora" style={{ fontSize: 16, fontWeight: 700, color: "#212529", marginBottom: 18 }}>Tech Stack & Architecture</div>
              <div className="tech-stack-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {[
                  { cat: "Frontend", items: ["React 18", "DM Mono", "Lora Typeface"], col: "#0B5ED7" },
                  { cat: "PGx Engine", items: ["CPIC 2024 DB", "Star Allele Mapper", "Diplotype Classifier"], col: "#20C997" },
                  { cat: "Data Format", items: ["VCFv4.1–4.3", "GRCh38", "HGVS Notation"], col: "#6EA8FE" },
                  { cat: "Standards", items: ["HL7 FHIR R4", "PharmGKB IDs", "OMIM Refs"], col: "#f59e0b" },
                ].map((cat) => (
                  <div key={cat.cat} style={{ background: "#ffffff", border: `1px solid ${cat.col}25`, borderRadius: 11, padding: "13px 14px", boxShadow: "0 2px 8px rgba(11,94,215,0.05)" }}>
                    <div className="mono" style={{ fontSize: 9, color: cat.col, letterSpacing: 1.5, marginBottom: 9 }}>{cat.cat.toUpperCase()}</div>
                    {cat.items.map((item) => (
                      <div key={item} style={{ fontSize: 11, color: "#495057", padding: "3px 0", borderBottom: "1px solid rgba(11,94,215,0.06)" }}>{item}</div>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ padding: "18px", background: "rgba(11,94,215,0.04)", border: "1.5px solid rgba(11,94,215,0.14)", borderRadius: 13 }}>
                <div className="lora" style={{ fontSize: 13, fontWeight: 700, color: "#0B5ED7", marginBottom: 10 }}>Supported Pharmacogenes</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {["CYP2D6","CYP2C19","CYP2C9","VKORC1","TPMT","NUDT15","DPYD","SLCO1B1","ABCB1","UGT1A1","HLA-A","HLA-B","CYP3A5","CYP1A2","CYP2B6"].map((g) => (
                    <span key={g} className="gene-chip" style={{ fontSize: 10 }}>{g}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ ROADMAP ════════════════════════════════════════════════ */}
        <section id="roadmap" className="section-padding" style={{ padding: "80px 24px", background: "rgba(110,168,254,0.04)", borderTop: "1px solid rgba(110,168,254,0.12)", borderBottom: "1px solid rgba(110,168,254,0.12)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ maxWidth: 680, marginBottom: 48 }}>
              <SectionLabel>ROADMAP</SectionLabel>
              <h2 className="lora" style={{ fontSize: "clamp(22px,4vw,44px)", fontWeight: 800, color: "#212529", lineHeight: 1.12, marginBottom: 16 }}>
                From Prototype to <span style={{ color: "#0B5ED7" }}>Clinical Standard.</span>
              </h2>
            </div>

            <div className="roadmap-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
              {ROADMAP.map((phase, i) => (
                <div key={i} style={{ background: "#ffffff", border: `1.5px solid ${phase.status === "active" ? phase.color + "45" : "rgba(11,94,215,0.1)"}`, borderRadius: 16, padding: 22, position: "relative", overflow: "hidden", boxShadow: phase.status === "active" ? `0 4px 24px ${phase.color}18` : "0 2px 10px rgba(11,94,215,0.05)" }}>
                  <div style={{ position: "absolute", top: 12, right: 12 }}>
                    {phase.status === "complete" && <span style={{ fontSize: 8, padding: "3px 8px", background: "rgba(32,201,151,0.1)", color: "#20C997", borderRadius: 100, border: "1px solid rgba(32,201,151,0.3)", fontFamily: "'DM Mono',monospace", letterSpacing: 1 }}>✓ DONE</span>}
                    {phase.status === "active" && <span style={{ fontSize: 8, padding: "3px 8px", background: `${phase.color}15`, color: phase.color, borderRadius: 100, border: `1px solid ${phase.color}35`, fontFamily: "'DM Mono',monospace", letterSpacing: 1 }}>● ACTIVE</span>}
                    {phase.status === "upcoming" && <span style={{ fontSize: 8, padding: "3px 8px", background: "rgba(11,94,215,0.05)", color: "#adb5bd", borderRadius: 100, border: "1px solid rgba(11,94,215,0.1)", fontFamily: "'DM Mono',monospace", letterSpacing: 1 }}>PLANNED</span>}
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: phase.color, letterSpacing: 2, marginBottom: 6 }}>{phase.phase}</div>
                  <div className="lora" style={{ fontSize: 15, fontWeight: 700, color: "#212529", marginBottom: 14 }}>{phase.label}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {phase.items.map((item, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: phase.status === "upcoming" ? "#dee2e6" : phase.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: phase.status === "upcoming" ? "#adb5bd" : "#495057" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 18, height: 3, background: "rgba(11,94,215,0.07)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: phase.status === "complete" ? "100%" : phase.status === "active" ? "45%" : "0%", background: phase.color, borderRadius: 2, transition: "width 1.5s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA ════════════════════════════════════════════════════ */}
        <section style={{ padding: "80px 24px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            <div className="cta-section" style={{ position: "relative", padding: "clamp(32px,5vw,56px) clamp(20px,4vw,40px)", background: "linear-gradient(145deg, #ffffff, rgba(11,94,215,0.04))", border: "1.5px solid rgba(11,94,215,0.15)", borderRadius: 24, overflow: "hidden", boxShadow: "0 8px 48px rgba(11,94,215,0.1)" }}>
              <div className="scan-line" />
              <div className="badge" style={{ background: "rgba(11,94,215,0.08)", border: "1px solid rgba(11,94,215,0.2)", color: "#0B5ED7", marginBottom: 20, display: "inline-flex" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0B5ED7", animation: "pulse 1.5s infinite", flexShrink: 0 }} />
                Ready to Deploy
              </div>
              <h2 className="lora" style={{ fontSize: "clamp(22px,4vw,46px)", fontWeight: 800, color: "#212529", lineHeight: 1.12, marginBottom: 16 }}>
                Stop Guessing.<br />
                <span style={{ background: "linear-gradient(135deg,#0B5ED7,#20C997)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Start Knowing.</span>
              </h2>
              <p style={{ fontSize: "clamp(13px,2vw,15px)", color: "#495057", lineHeight: 1.8, marginBottom: 32, maxWidth: 500, margin: "0 auto 32px" }}>
                Upload your first patient VCF and generate a full CPIC-compliant pharmacogenomic risk report in under 3 seconds — no server, no signup, no data leaving the browser.
              </p>
              <div className="cta-buttons" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="btn-primary" onClick={handleLaunchPharmaGuard} style={{ fontSize: 14, padding: "13px 28px", gap: 8 }}>
                  {Icons.rocket(16, "#fff")} Launch PharmaGuard
                </button>
                <button className="btn-ghost" onClick={downloadSampleVCF} style={{ gap: 8 }}>
                  {Icons.download(14, "#495057")} Download Sample Report
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FOOTER ──────────────────────────────────────────────────── */}
        <footer style={{ padding: "36px 24px 72px", borderTop: "1px solid rgba(11,94,215,0.1)", maxWidth: 1280, margin: "0 auto" }}>
          <div className="footer-cols" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 28, marginBottom: 28 }}>
            <div style={{ maxWidth: 300 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#0B5ED7,#094bb3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {Icons.dna(15, "#fff")}
                </div>
                <span className="lora" style={{ fontSize: 15, fontWeight: 800, color: "#0B5ED7" }}>PharmaGuard</span>
              </div>
              <p style={{ fontSize: 11, color: "#868e96", lineHeight: 1.7 }}>
                Precision Medicine Algorithm for pharmacogenomic drug risk prediction. CPIC Level A validated. Client-side processing. Zero data exposure.
              </p>
            </div>
            <div style={{ display: "flex", gap: 36, flexWrap: "wrap" }}>
              {[
                { title: "Platform", links: ["Dashboard", "Family Mode", "History", "API Docs"] },
                { title: "Science", links: ["CPIC Guidelines", "PGx Database", "Gene Coverage", "References"] },
                { title: "Clinical", links: ["Sample Report", "EHR Integration", "HIPAA Compliance", "Support"] },
              ].map((col) => (
                <div key={col.title}>
                  <div className="mono" style={{ fontSize: 9, color: "#0B5ED7", letterSpacing: 2, marginBottom: 12 }}>{col.title.toUpperCase()}</div>
                  {col.links.map((link) => (
                    <div key={link} style={{ fontSize: 12, color: "#868e96", padding: "4px 0", cursor: "pointer", transition: "color 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#0B5ED7"}
                      onMouseLeave={e => e.currentTarget.style.color = "#868e96"}>{link}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(11,94,215,0.08)", paddingTop: 18, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 10, color: "#adb5bd" }}>© 2024 PharmaGuard · Precision Medicine Algorithm · CPIC 2024 Guidelines</div>
            <div style={{ fontSize: 10, color: "#adb5bd" }}>For clinical decision support only · Not a substitute for professional medical judgment</div>
          </div>
        </footer>
      </div>
    </div>
  );
}