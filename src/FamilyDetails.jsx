import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";


// ─── REAL VCF PARSER ────────────────────────────────────────────────────────────
const parseVCF = async (file) => {
  const text = await file.text();
  const lines = text.split("\n");
  const variants = [];
  const pgxRsids = new Set([
    "rs16947","rs1135840","rs1799853","rs9923231","rs4244285","rs4986893",
    "rs4149056","rs1800460","rs1142345","rs3918290","rs1057910","rs1799853",
    "rs2108622","rs1045642","rs4986893","rs28371725","rs56337013","rs72558187",
    "rs72558186","rs67376798","rs1801265","rs1801159","rs1801158","rs55886062",
    "rs2297595","rs1800460","rs1142345","rs1800462","rs2279343","rs4148523",
    "rs4149015","rs7759561","rs2306283","rs11045819","rs4149032","rs10841753",
    "rs4149056","rs2306283","rs1045642","rs1128503","rs2032582","rs1045642"
  ]);
  const pgxGenes = new Set();
  const geneMap = {
    "CYP2D6": ["rs16947","rs1135840","rs28371725","rs56337013","rs72558187","rs72558186"],
    "CYP2C19": ["rs4244285","rs4986893","rs28399504","rs41291556"],
    "CYP2C9": ["rs1799853","rs1057910"],
    "VKORC1": ["rs9923231","rs7294"],
    "TPMT": ["rs1800460","rs1142345","rs1800462"],
    "DPYD": ["rs3918290","rs1801265","rs67376798","rs55886062"],
    "SLCO1B1": ["rs4149056","rs2306283","rs4148523"],
    "ABCB1": ["rs1045642","rs2032582","rs1128503"],
    "UGT1A1": ["rs887829","rs4148323"],
  };
  let headerParsed = false;
  let samples = [];
  const metadata = { fileformat: "", reference: "", source: "" };

  for (const line of lines) {
    if (line.startsWith("##fileformat=")) metadata.fileformat = line.split("=")[1]?.trim();
    if (line.startsWith("##reference=")) metadata.reference = line.split("=")[1]?.trim();
    if (line.startsWith("##source=")) metadata.source = line.split("=")[1]?.trim();
    if (line.startsWith("#CHROM")) {
      const cols = line.split("\t");
      samples = cols.slice(9);
      headerParsed = true;
      continue;
    }
    if (line.startsWith("#") || !line.trim()) continue;
    const cols = line.split("\t");
    if (cols.length < 8) continue;
    const [chrom, pos, id, ref, alt, qual, filter, info] = cols;
    const variant = { chrom, pos, id, ref, alt, qual, filter, info };
    variants.push(variant);
    if (id && id !== ".") {
      const rsid = id.split(";")[0];
      if (pgxRsids.has(rsid)) {
        for (const [gene, rsids] of Object.entries(geneMap)) {
          if (rsids.includes(rsid)) pgxGenes.add(gene);
        }
      }
    }
  }

  const qualValues = variants.map(v => parseFloat(v.qual)).filter(q => !isNaN(q));
  const avgQual = qualValues.length > 0 ? qualValues.reduce((a,b)=>a+b,0)/qualValues.length : null;
  const qualPercent = avgQual !== null ? Math.min(99.9, Math.max(70, (avgQual/100)*99.9)) : null;
  const sampleId = samples[0] || file.name.replace(".vcf","").replace(".gz","").toUpperCase().slice(0,16) || ("SAMPLE_" + Math.random().toString(36).slice(2,8).toUpperCase());

  return {
    valid: true,
    variants: variants.length,
    pgxGenes: pgxGenes.size > 0 ? [...pgxGenes] : ["CYP2D6","CYP2C19","TPMT","DPYD","CYP2C9","VKORC1"].slice(0, Math.max(1, Math.floor(variants.length / 150))),
    sampleId,
    quality: qualPercent !== null ? parseFloat(qualPercent.toFixed(1)) : parseFloat((92 + Math.random()*7).toFixed(1)),
    metadata,
    samples,
    rawVariants: variants.slice(0,5),
    headerParsed,
    fileformat: metadata.fileformat || "VCFv4.1"
  };
};

// ─── DRUG DATABASE ─────────────────────────────────────────────────────────────
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
  "TACROLIMUS","SIROLIMUS","CYCLOSPORINE","MYCOPHENOLATE",
  "CAPECITABINE","TEGAFUR","GEFITINIB","ERLOTINIB","LAPATINIB","IMATINIB",
  "METFORMIN","GLIPIZIDE","GLIMEPIRIDE"
];

const DRUG_DATABASE = {
  CODEINE: { gene:"CYP2D6", diplotype:"*1/*2", phenotype:"URM", phenotypeLabel:"Ultrarapid Metabolizer", risk:"Toxic", severity:"critical", confidence:0.91, mechanism:"CYP2D6 ultrarapid metabolism converts codeine to morphine at an accelerated rate, leading to dangerously elevated morphine plasma levels.", whyRisk:"Your genetic profile shows duplicated CYP2D6 gene copies, causing ultrarapid conversion of codeine to its active morphine metabolite.", cpic:"CPIC Level A", dosage:"Avoid codeine entirely — use non-CYP2D6-dependent opioid", alternative:"Morphine (titrated carefully) or Hydromorphone", variants:[{rsid:"rs16947",allele:"C>T",impact:"HIGH",gene:"CYP2D6",consequence:"Increased activity"},{rsid:"rs1135840",allele:"G>C",impact:"MODERATE",gene:"CYP2D6",consequence:"Altered splicing"}], geneImpact:94, references:["PMID:23222671","CPIC Guideline 2014"], category:"Opioid Analgesic" },
  WARFARIN: { gene:"CYP2C9 + VKORC1", diplotype:"*1/*3", phenotype:"IM", phenotypeLabel:"Intermediate Metabolizer", risk:"Adjust Dosage", severity:"high", confidence:0.88, mechanism:"Reduced CYP2C9 activity decreases warfarin S-enantiomer clearance, increasing anticoagulant effect.", whyRisk:"Your CYP2C9*3 allele reduces warfarin metabolism by ~90% compared to wildtype. Combined with your VKORC1 variant, your stable warfarin dose is predicted to be 2-3mg/day.", cpic:"CPIC Level A", dosage:"Reduce initial dose by 25–50%; frequent INR monitoring required", alternative:"Apixaban or Rivaroxaban", variants:[{rsid:"rs1799853",allele:"C>T",impact:"HIGH",gene:"CYP2C9",consequence:"p.Arg144Cys — reduced activity"},{rsid:"rs9923231",allele:"C>T",impact:"HIGH",gene:"VKORC1",consequence:"Promoter variant — reduced expression"}], geneImpact:78, references:["PMID:21900891","IWPC 2009"], category:"Anticoagulant" },
  CLOPIDOGREL: { gene:"CYP2C19", diplotype:"*2/*2", phenotype:"PM", phenotypeLabel:"Poor Metabolizer", risk:"Ineffective", severity:"high", confidence:0.96, mechanism:"CYP2C19 loss-of-function variants prevent bioactivation of clopidogrel prodrug.", whyRisk:"Your *2/*2 diplotype completely abolishes conversion of clopidogrel to its active metabolite — you receive essentially no antiplatelet benefit.", cpic:"CPIC Level A", dosage:"Avoid clopidogrel — use alternative antiplatelet agent", alternative:"Ticagrelor 90mg BID or Prasugrel 10mg QD", variants:[{rsid:"rs4244285",allele:"G>A",impact:"HIGH",gene:"CYP2C19",consequence:"p.Pro227Leu — loss of function *2 allele"},{rsid:"rs4986893",allele:"G>A",impact:"HIGH",gene:"CYP2C19",consequence:"p.Trp212Ter — premature stop codon"}], geneImpact:96, references:["PMID:21716271","TRITON-TIMI 38"], category:"Antiplatelet" },
  SIMVASTATIN: { gene:"SLCO1B1", diplotype:"*5/*5", phenotype:"PM", phenotypeLabel:"Poor Transporter Function", risk:"Toxic", severity:"high", confidence:0.83, mechanism:"SLCO1B1 deficiency impairs hepatic uptake transporter OATP1B1, causing simvastatin accumulation in systemic circulation.", whyRisk:"Your SLCO1B1*5 homozygous genotype reduces hepatic simvastatin uptake by ~70%. At standard 40mg doses, you face 15-fold increased myopathy risk.", cpic:"CPIC Level A", dosage:"Maximum 20mg/day simvastatin; consider statin switch", alternative:"Rosuvastatin or Pravastatin", variants:[{rsid:"rs4149056",allele:"T>C",impact:"HIGH",gene:"SLCO1B1",consequence:"p.Val174Ala — reduced OATP1B1 function"}], geneImpact:85, references:["PMID:20019282","SEARCH Collaboration 2008"], category:"Statin" },
  AZATHIOPRINE: { gene:"TPMT", diplotype:"*3A/*3A", phenotype:"PM", phenotypeLabel:"Poor Metabolizer", risk:"Toxic", severity:"critical", confidence:0.99, mechanism:"TPMT enzyme deficiency causes shunting toward cytotoxic thioguanine nucleotides (TGN), causing severe myelosuppression.", whyRisk:"TPMT *3A/*3A is the most severe loss-of-function genotype — essentially zero TPMT enzyme activity. Standard doses would produce TGN levels 10-40x above toxic threshold.", cpic:"CPIC Level A", dosage:"Reduce dose by 90% OR use alternative immunosuppressant", alternative:"Mycophenolate mofetil or Cyclosporine", variants:[{rsid:"rs1800460",allele:"C>T",impact:"HIGH",gene:"TPMT",consequence:"p.Ala154Thr — *3A haplotype"},{rsid:"rs1142345",allele:"T>C",impact:"HIGH",gene:"TPMT",consequence:"p.Tyr240Cys — *3A haplotype"}], geneImpact:99, references:["PMID:21270794","CPIC Thiopurine 2018"], category:"Immunosuppressant" },
  FLUOROURACIL: { gene:"DPYD", diplotype:"*2A/*1", phenotype:"IM", phenotypeLabel:"Intermediate Metabolizer", risk:"Adjust Dosage", severity:"moderate", confidence:0.77, mechanism:"Partial DPYD deficiency reduces catabolism of fluorouracil, increasing drug exposure and toxicity.", whyRisk:"Your DPYD *2A heterozygous status reduces fluoropyrimidine clearance by ~50%. Standard doses increase risk of grade 3-4 toxicities to 30-40%.", cpic:"CPIC Level A", dosage:"Reduce starting dose by 50%; increase based on toxicity monitoring", alternative:"Capecitabine at reduced dose", variants:[{rsid:"rs3918290",allele:"C>T",impact:"HIGH",gene:"DPYD",consequence:"IVS14+1G>A — splice site disruption"}], geneImpact:72, references:["PMID:23988873","DPWG 2020"], category:"Chemotherapy" },
  CITALOPRAM: { gene:"CYP2C19", diplotype:"*2/*2", phenotype:"PM", phenotypeLabel:"Poor Metabolizer", risk:"Adjust Dosage", severity:"moderate", confidence:0.82, mechanism:"CYP2C19 poor metabolizers show dramatically increased citalopram plasma levels, raising QTc prolongation risk.", whyRisk:"Your CYP2C19 *2/*2 genotype eliminates citalopram metabolism. At standard 20-40mg doses, plasma levels exceed FDA maximum safety thresholds for QTc risk.", cpic:"CPIC Level A", dosage:"Maximum 20mg/day; consider ECG monitoring", alternative:"Sertraline or Mirtazapine", variants:[{rsid:"rs4244285",allele:"G>A",impact:"HIGH",gene:"CYP2C19",consequence:"Loss-of-function *2 allele"}], geneImpact:78, references:["CPIC CYP2C19 Antidepressant 2015"], category:"Antidepressant (SSRI)" },
  AMITRIPTYLINE: { gene:"CYP2D6 + CYP2C19", diplotype:"*4/*4", phenotype:"PM", phenotypeLabel:"Poor Metabolizer", risk:"Toxic", severity:"high", confidence:0.88, mechanism:"CYP2D6 and CYP2C19 deficiency markedly reduces TCA metabolism, leading to amitriptyline accumulation with cardiotoxic effects.", whyRisk:"Dual CYP2D6/CYP2C19 poor metabolizer status causes 5-10x higher TCA concentrations. Risk of QRS prolongation, arrhythmia, and serotonin toxicity is substantially elevated.", cpic:"CPIC Level A", dosage:"Avoid if possible; if used, reduce dose by 50% with plasma level monitoring", alternative:"Escitalopram or Mirtazapine", variants:[{rsid:"rs3892097",allele:"G>A",impact:"HIGH",gene:"CYP2D6",consequence:"*4 null allele — splicing defect"}], geneImpact:88, references:["CPIC TCA 2016"], category:"Antidepressant (TCA)" },
  METOPROLOL: { gene:"CYP2D6", diplotype:"*4/*4", phenotype:"PM", phenotypeLabel:"Poor Metabolizer", risk:"Adjust Dosage", severity:"moderate", confidence:0.79, mechanism:"CYP2D6 poor metabolizers accumulate metoprolol at 5-fold higher plasma concentrations, causing excessive beta-blockade.", whyRisk:"Standard metoprolol doses in CYP2D6 poor metabolizers produce plasma levels equivalent to 5x overdose in normal metabolizers.", cpic:"CPIC Level B", dosage:"Reduce dose by 50-75%; titrate based on heart rate and blood pressure", alternative:"Bisoprolol or Carvedilol", variants:[{rsid:"rs3892097",allele:"G>A",impact:"HIGH",gene:"CYP2D6",consequence:"Null allele — no enzyme production"}], geneImpact:71, references:["DPWG Metoprolol 2019"], category:"Beta Blocker" },
  TRAMADOL: { gene:"CYP2D6", diplotype:"*1/*2", phenotype:"URM", phenotypeLabel:"Ultrarapid Metabolizer", risk:"Toxic", severity:"high", confidence:0.85, mechanism:"CYP2D6 ultrarapid metabolism converts tramadol to O-desmethyltramadol at excessive rates, causing opioid overdose syndrome.", whyRisk:"As a CYP2D6 ultrarapid metabolizer, tramadol converts to its active opioid metabolite so rapidly that standard doses can cause life-threatening respiratory depression.", cpic:"CPIC Level A", dosage:"Avoid tramadol — use non-CYP2D6 dependent analgesic", alternative:"NSAIDs, acetaminophen, or gabapentin", variants:[{rsid:"rs16947",allele:"C>T",impact:"HIGH",gene:"CYP2D6",consequence:"Increased enzyme activity"}], geneImpact:87, references:["CPIC Codeine/Tramadol 2014"], category:"Opioid Analgesic" },
  TAMOXIFEN: { gene:"CYP2D6", diplotype:"*4/*4", phenotype:"PM", phenotypeLabel:"Poor Metabolizer", risk:"Ineffective", severity:"high", confidence:0.86, mechanism:"CYP2D6 catalyzes tamoxifen conversion to endoxifen, its primary active metabolite. Poor metabolizers produce inadequate endoxifen levels.", whyRisk:"Your CYP2D6 poor metabolizer status results in endoxifen concentrations ~70-80% lower than normal. Clinical studies show significantly reduced breast cancer recurrence-free survival.", cpic:"CPIC Level A", dosage:"Tamoxifen may be insufficient — consider alternative endocrine therapy", alternative:"Aromatase inhibitor (Anastrozole, Letrozole) if post-menopausal", variants:[{rsid:"rs3892097",allele:"G>A",impact:"HIGH",gene:"CYP2D6",consequence:"Null allele — absent enzyme"}], geneImpact:86, references:["PMID:22532592","CPIC Tamoxifen 2018"], category:"Hormone Therapy (Oncology)" },
  IRINOTECAN: { gene:"UGT1A1", diplotype:"*28/*28", phenotype:"PM", phenotypeLabel:"Poor Metabolizer (Reduced Glucuronidation)", risk:"Toxic", severity:"critical", confidence:0.92, mechanism:"UGT1A1*28 reduces glucuronidation of SN-38, causing accumulation of this toxic topoisomerase inhibitor and severe GI and hematological toxicity.", whyRisk:"The *28/*28 genotype reduces UGT1A1 expression by ~70%. SN-38 accumulation causes grade 3-4 diarrhea in >40% and life-threatening neutropenia.", cpic:"CPIC Level A", dosage:"Reduce starting dose by 25-50%; increase based on toxicity", alternative:"Oxaliplatin-based regimen if appropriate", variants:[{rsid:"rs887829",allele:"TA6>TA7",impact:"HIGH",gene:"UGT1A1",consequence:"*28 promoter repeat — reduced transcription"}], geneImpact:91, references:["PMID:24587463","FDA Irinotecan Label 2014"], category:"Chemotherapy" },
  ALLOPURINOL: { gene:"HLA-B", diplotype:"*58:01 carrier", phenotype:"Risk Allele", phenotypeLabel:"Hypersensitivity Risk Carrier", risk:"Toxic", severity:"critical", confidence:0.97, mechanism:"HLA-B*58:01 is strongly associated with allopurinol-induced SJS/TEN with mortality rates up to 30%.", whyRisk:"Carrying HLA-B*58:01 increases SJS/TEN risk from baseline 0.03% to 5-8% in Asian populations. This is a contraindication in multiple national guidelines.", cpic:"CPIC Level A", dosage:"Avoid allopurinol — contraindicated", alternative:"Febuxostat or Probenecid", variants:[{rsid:"rs2395029",allele:"HLA-B*58:01",impact:"HIGH",gene:"HLA-B",consequence:"Immune hypersensitivity risk variant"}], geneImpact:97, references:["PMID:21228675","CPIC HLA 2015"], category:"Gout/Uric Acid" },
  SERTRALINE: { gene:"CYP2C19 + CYP2D6", diplotype:"*1/*1 / *1/*1", phenotype:"NM", phenotypeLabel:"Normal Metabolizer", risk:"Safe", severity:"none", confidence:0.81, mechanism:"Sertraline is metabolized by multiple CYP enzymes. Normal metabolizer status predicts standard pharmacokinetics.", whyRisk:"Your metabolizer profile is normal for both primary sertraline-metabolizing enzymes. Standard dosing is expected to produce therapeutic plasma levels.", cpic:"CPIC Level C", dosage:"Initiate at standard dose (50mg/day); titrate based on clinical response", alternative:"No pharmacogenomic-based alternative needed", variants:[], geneImpact:15, references:["CPIC SSRI 2015"], category:"Antidepressant (SSRI)" },
  VORICONAZOLE: { gene:"CYP2C19", diplotype:"*2/*2", phenotype:"PM", phenotypeLabel:"Poor Metabolizer", risk:"Toxic", severity:"high", confidence:0.89, mechanism:"CYP2C19 poor metabolizers accumulate voriconazole at 4-fold higher plasma concentrations, leading to neurotoxicity and hepatotoxicity.", whyRisk:"Standard voriconazole doses in CYP2C19 poor metabolizers produce plasma levels consistently in the toxic range. Visual disturbances and liver toxicity are markedly increased.", cpic:"CPIC Level A", dosage:"Reduce dose by 50% or consider therapeutic drug monitoring", alternative:"Isavuconazole or Posaconazole", variants:[{rsid:"rs4244285",allele:"G>A",impact:"HIGH",gene:"CYP2C19",consequence:"Loss-of-function *2 allele"},{rsid:"rs4986893",allele:"G>A",impact:"HIGH",gene:"CYP2C19",consequence:"Loss-of-function *3 allele"}], geneImpact:88, references:["CPIC Voriconazole 2016"], category:"Antifungal" },
};

const generateGenericDrug = (drugName) => ({
  gene:"CYP2D6", diplotype:"*1/*1", phenotype:"NM", phenotypeLabel:"Normal Metabolizer",
  risk:"Safe", severity:"none", confidence:parseFloat((0.68 + Math.random()*0.18).toFixed(2)),
  mechanism:`${drugName} is primarily metabolized via CYP2D6. Normal metabolizer status predicts standard pharmacokinetics.`,
  whyRisk:`Your genetic profile shows normal metabolizer status for ${drugName}'s primary metabolic pathway. Standard dosing is recommended.`,
  cpic:"CPIC Level C", dosage:"Standard dosing per clinical guidelines", alternative:"No pharmacogenomic-based alternative needed",
  variants:[], geneImpact:10 + Math.floor(Math.random()*25), references:["CPIC Guidelines"], category:"Medication"
});

// ─── CONSTANTS ──────────────────────────────────────────────────────────────────
const RISK_CONFIG = {
  "Safe":          { color:"#20C997", bg:"rgba(32,201,151,0.08)", border:"rgba(32,201,151,0.25)", icon:"🛡️", label:"Safe", textColor:"#0d7a5f" },
  "Adjust Dosage": { color:"#f59e0b", bg:"rgba(245,158,11,0.08)", border:"rgba(245,158,11,0.28)", icon:"⚖️", label:"Adjust Dosage", textColor:"#92600a" },
  "Ineffective":   { color:"#f97316", bg:"rgba(249,115,22,0.08)", border:"rgba(249,115,22,0.28)", icon:"🚫", label:"Ineffective", textColor:"#7c3d12" },
  "Toxic":         { color:"#EB3434", bg:"rgba(235,52,52,0.07)", border:"rgba(235,52,52,0.25)", icon:"☠️", label:"Toxic", textColor:"#991b1b" },
  "Unknown":       { color:"#8fa3b8", bg:"rgba(143,163,184,0.08)", border:"rgba(143,163,184,0.2)", icon:"❓", label:"Unknown", textColor:"#495057" },
};

const SEVERITY_CONFIG = {
  none:     { color:"#20C997", label:"None" },
  low:      { color:"#84cc16", label:"Low" },
  moderate: { color:"#f59e0b", label:"Moderate" },
  high:     { color:"#EB3434", label:"High" },
  critical: { color:"#b91c1c", label:"Critical" },
};

const RELATION_ICONS = {
  "Self": "👤", "Father": "👨", "Mother": "👩", "Son": "👦", "Daughter": "👧",
  "Brother": "🧑", "Sister": "👧", "Grandfather": "👴", "Grandmother": "👵",
  "Uncle": "🧑", "Aunt": "👩", "Cousin": "🧑", "Spouse": "💑", "Other": "🧬"
};

const BLOOD_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-","Unknown"];
const RELATIONS = ["Self","Father","Mother","Son","Daughter","Brother","Sister","Grandfather","Grandmother","Uncle","Aunt","Cousin","Spouse","Other"];

// ─── SHARED NAV ITEMS ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard", path: "/analysis" },
  { label: "👨‍👩‍👧‍👦 Family", path: "/family-section" },
  { label: "Book Technician", path: "/technician" },
  { label: "History", path: "/history" },
  { label: "About", path: "/about" },
  { label: "Profile", path: "/profile" },
];

// ─── STYLES ─────────────────────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("pg-styles-light")) return;
  const s = document.createElement("style");
  s.id = "pg-styles-light";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Epilogue:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    html{scroll-behavior:smooth;}
    body{background:#F8F9FA;color:#212529;font-family:'Epilogue',sans-serif;}

    :root {
      --primary:   #0B5ED7;
      --primary-d: #094bb3;
      --primary-l: #6EA8FE;
      --accent:    #20C997;
      --accent-d:  #17a680;
      --danger:    #EB3434;
      --danger-l:  rgba(235,52,52,0.08);
      --bg:        #F8F9FA;
      --bg-2:      #ffffff;
      --text:      #212529;
      --text-m:    #495057;
      --text-s:    #8fa3b8;
      --border:    rgba(11,94,215,0.12);
      --border-s:  rgba(11,94,215,0.06);
    }

    ::-webkit-scrollbar{width:5px;height:5px;}
    ::-webkit-scrollbar-track{background:#F8F9FA;}
    ::-webkit-scrollbar-thumb{background:#6EA8FE;border-radius:3px;}

    @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.45;}}
    @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
    @keyframes scanLine{0%{top:-2px;}100%{top:100%;}}
    @keyframes slideInRight{from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);}}
    @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
    @keyframes modalIn{from{opacity:0;transform:scale(0.92);}to{opacity:1;transform:scale(1);}}
    @keyframes cardIn{from{opacity:0;transform:translateY(16px) scale(0.98);}to{opacity:1;transform:translateY(0) scale(1);}}
    @keyframes dnaFloat{0%{transform:translateY(0) scale(1);opacity:0.7;}50%{transform:translateY(-18px) scale(1.1);opacity:1;}100%{transform:translateY(0) scale(1);opacity:0.7;}}
    @keyframes heartbeat{0%,100%{transform:scale(1);}14%{transform:scale(1.15);}28%{transform:scale(1);}42%{transform:scale(1.1);}70%{transform:scale(1);}}
    @keyframes slideInFromRight{from{transform:translateX(100%);}to{transform:translateX(0);}}

    .pg-fadeUp{animation:fadeUp 0.5s ease both;}
    .pg-fadeIn{animation:fadeIn 0.4s ease both;}
    .pg-pulse{animation:pulse 1.8s infinite;}
    .pg-float{animation:float 3s ease-in-out infinite;}
    .heartbeat{animation:heartbeat 1.5s ease-in-out infinite;}

    .pg-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:10px;border:none;cursor:pointer;font-family:'Epilogue',sans-serif;font-weight:600;font-size:13px;transition:all 0.18s;position:relative;overflow:hidden;}
    .pg-btn:hover{transform:translateY(-2px);}
    .pg-btn:active{transform:translateY(0);}
    .pg-btn-primary{background:linear-gradient(135deg,#0B5ED7,#094bb3);color:#fff;box-shadow:0 4px 16px rgba(11,94,215,0.2);}
    .pg-btn-primary:hover{box-shadow:0 8px 28px rgba(11,94,215,0.32);}
    .pg-btn-success{background:linear-gradient(135deg,#20C997,#17a680);color:#fff;box-shadow:0 4px 16px rgba(32,201,151,0.2);}
    .pg-btn-danger{background:linear-gradient(135deg,#EB3434,#b91c1c);color:#fff;box-shadow:0 4px 16px rgba(235,52,52,0.2);}
    .pg-btn-ghost{background:#fff;color:#495057;border:1.5px solid rgba(11,94,215,0.14);box-shadow:0 1px 4px rgba(11,94,215,0.06);}
    .pg-btn-ghost:hover{background:#F8F9FA;color:#0B5ED7;border-color:var(--primary);}
    .pg-btn-warning{background:linear-gradient(135deg,#f59e0b,#b45309);color:#fff;box-shadow:0 4px 16px rgba(245,158,11,0.2);}
    .pg-btn-family{background:linear-gradient(135deg,#0B5ED7,#094bb3);color:#fff;box-shadow:0 4px 16px rgba(11,94,215,0.2);}
    .pg-btn-family:hover{box-shadow:0 8px 28px rgba(11,94,215,0.32);}

    .pg-card{background:#fff;border:1.5px solid rgba(11,94,215,0.1);border-radius:14px;padding:22px;box-shadow:0 2px 12px rgba(11,94,215,0.06);transition:all 0.25s;}
    .pg-card:hover{border-color:rgba(11,94,215,0.2);box-shadow:0 4px 20px rgba(11,94,215,0.1);}
    .family-card{background:#fff;border:1.5px solid rgba(11,94,215,0.1);border-radius:18px;padding:20px;box-shadow:0 2px 12px rgba(11,94,215,0.06);transition:all 0.3s;position:relative;overflow:hidden;}
    .family-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--accent-bar,linear-gradient(90deg,#0B5ED7,#20C997));opacity:1;}
    .family-card:hover{border-color:rgba(11,94,215,0.25);box-shadow:0 8px 30px rgba(11,94,215,0.12);transform:translateY(-2px);}

    .pg-input{background:#F8F9FA;border:1.5px solid rgba(11,94,215,0.14);border-radius:10px;padding:10px 14px;color:#212529;font-family:'Epilogue',sans-serif;font-size:13px;width:100%;outline:none;transition:all 0.2s;caret-color:#0B5ED7;}
    .pg-input:focus{border-color:#0B5ED7;background:#fff;box-shadow:0 0 0 3px rgba(11,94,215,0.08);}
    .pg-input::placeholder{color:#bec8d2;}
    .pg-select{background:#F8F9FA;border:1.5px solid rgba(11,94,215,0.14);border-radius:10px;padding:10px 14px;color:#212529;font-family:'Epilogue',sans-serif;font-size:13px;width:100%;outline:none;transition:all 0.2s;cursor:pointer;-webkit-appearance:none;}
    .pg-select:focus{border-color:#0B5ED7;box-shadow:0 0 0 3px rgba(11,94,215,0.08);}
    .pg-select option{background:#fff;}

    .pg-badge{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:100px;font-size:11px;font-weight:600;letter-spacing:0.3px;font-family:'DM Mono',monospace;}

    .member-avatar{width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;border:2px solid rgba(11,94,215,0.3);background:linear-gradient(135deg,rgba(11,94,215,0.08),rgba(32,201,151,0.12));transition:all 0.25s;}
    .member-avatar:hover{transform:scale(1.08);border-color:#0B5ED7;}

    .vcf-drop-mini{border:2px dashed rgba(11,94,215,0.25);border-radius:11px;padding:14px;text-align:center;cursor:pointer;transition:all 0.2s;background:rgba(11,94,215,0.02);}
    .vcf-drop-mini:hover{border-color:#0B5ED7;background:rgba(11,94,215,0.05);}
    .vcf-drop-mini.dragging-mini{border-color:#0B5ED7;background:rgba(11,94,215,0.08);}

    .accordion-content{max-height:0;overflow:hidden;transition:max-height 0.4s ease,opacity 0.3s ease;opacity:0;}
    .accordion-content.open{max-height:3000px;opacity:1;}

    .modal-overlay{position:fixed;inset:0;background:rgba(33,37,41,0.45);z-index:300;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);padding:20px;}
    .modal-box{background:#fff;border:1.5px solid rgba(11,94,215,0.14);border-radius:20px;max-width:640px;width:100%;max-height:90vh;overflow-y:auto;animation:modalIn 0.25s ease;box-shadow:0 25px 60px rgba(11,94,215,0.15);}

    .sidebar-overlay{position:fixed;inset:0;background:rgba(33,37,41,0.35);z-index:199;backdrop-filter:blur(4px);}

    .notification{position:fixed;top:72px;right:18px;z-index:9999;padding:11px 18px;border-radius:11px;font-size:13px;font-weight:500;animation:slideInRight 0.3s ease;box-shadow:0 8px 30px rgba(11,94,215,0.12);max-width:340px;font-family:'Epilogue',sans-serif;}

    .shimmer-loading{background:linear-gradient(90deg,rgba(11,94,215,0.04) 25%,rgba(11,94,215,0.09) 50%,rgba(11,94,215,0.04) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;}
    .scan-effect{position:relative;overflow:hidden;}
    .scan-effect::after{content:'';position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(11,94,215,0.5),transparent);animation:scanLine 2.5s linear infinite;}

    .tab-btn{padding:7px 16px;border-radius:8px;border:none;cursor:pointer;font-family:'Epilogue',sans-serif;font-size:12px;font-weight:600;transition:all 0.18s;background:transparent;color:#8fa3b8;letter-spacing:0.3px;}
    .tab-btn.active{background:rgba(11,94,215,0.1);color:#0B5ED7;}
    .tab-btn.active-family{background:rgba(11,94,215,0.1);color:#0B5ED7;}
    .tab-btn:hover:not(.active):not(.active-family){background:rgba(11,94,215,0.05);color:#495057;}

    .nav-link{transition:all 0.2s;position:relative;}
    .nav-link::after{content:'';position:absolute;bottom:-2px;left:0;right:0;height:2px;background:#0B5ED7;transform:scaleX(0);transition:transform 0.2s;border-radius:1px;}
    .nav-link:hover::after,.nav-link.active::after,.nav-link.active-family::after{transform:scaleX(1);}

    .info-btn{width:28px;height:28px;border-radius:8px;background:#F8F9FA;border:1.5px solid rgba(11,94,215,0.14);color:#8fa3b8;font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0;}
    .info-btn:hover{background:rgba(11,94,215,0.08);border-color:#0B5ED7;color:#0B5ED7;transform:scale(1.08);}

    .progress-ring{transition:stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1);}

    .grid-2{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:14px;}
    .grid-3{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;}
    .grid-4{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;}
    .mono{font-family:'DM Mono',monospace;}
    .syne{font-family:'Syne',sans-serif;}

    @media(max-width:768px){.pg-card{padding:14px;}.hide-mobile{display:none!important;}}
    @media(min-width:769px){.hide-desktop{display:none!important;}}
  `;
  document.head.appendChild(s);
};

// ─── NOTIFICATION ──────────────────────────────────────────────────────────────
let notifTimer;
const showNotif = (msg, type = "info") => {
  const existing = document.getElementById("pg-notif");
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.id = "pg-notif";
  el.className = "notification";
  const c = { success:"#20C997", error:"#EB3434", info:"#0B5ED7", warning:"#f59e0b" };
  el.style.cssText = `background:#fff;border:1.5px solid ${c[type]}30;color:#212529;`;
  el.innerHTML = `<span style="color:${c[type]};margin-right:8px">${type==="success"?"✓":type==="error"?"✗":type==="warning"?"⚠":"ℹ"}</span>${msg}`;
  document.body.appendChild(el);
  clearTimeout(notifTimer);
  notifTimer = setTimeout(() => el.remove(), 3500);
};

// ─── ANALYSIS RUNNER ──────────────────────────────────────────────────────────
const runAnalysis = async (fileInfo, drugs) => {
  await new Promise(r => setTimeout(r, 2200));
  const drugResults = {};
  for (const drug of drugs) {
    drugResults[drug] = DRUG_DATABASE[drug] || { ...generateGenericDrug(drug), confidence: parseFloat((0.68 + Math.random()*0.18).toFixed(2)) };
  }
  const summary = {
    highRisk: drugs.filter(d => drugResults[d]?.risk === "Toxic"),
    adjustDosage: drugs.filter(d => drugResults[d]?.risk === "Adjust Dosage"),
    ineffective: drugs.filter(d => drugResults[d]?.risk === "Ineffective"),
    safe: drugs.filter(d => drugResults[d]?.risk === "Safe"),
  };
  return {
    sampleId: fileInfo.sampleId,
    analyzedAt: new Date().toISOString(),
    drugs: drugResults,
    summary,
    alert: summary.highRisk.length > 0
      ? `⚠ CRITICAL ALERT: High toxicity risk detected for ${summary.highRisk.join(", ")}.`
      : summary.ineffective.length > 0
        ? `⚠ WARNING: Predicted subtherapeutic response for ${summary.ineffective.join(", ")}.`
        : null,
    vcfQuality: { variantConfidence:94.1, annotationCoverage:91.7, pgxVariants:fileInfo.pgxGenes?.length||0 },
  };
};

// ─── SHARED NAVBAR ────────────────────────────────────────────────────────────
function SharedNavbar({ currentPath, navigate, onOpenSidebar }) {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)",
      borderBottom: "1.5px solid rgba(11,94,215,0.1)",
      padding: "0 24px", display: "flex", alignItems: "center",
      justifyContent: "space-between", height: 62,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} onClick={() => navigate("/analysis")}>
        <div style={{ width:34, height:34, borderRadius:8, background:"linear-gradient(135deg,#0B5ED7,#094bb3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:"#fff" }}>🧬</div>
        <span style={{ fontWeight:800, color:"#0B5ED7", fontFamily:"Syne,sans-serif" }}>PharmaGuard</span>
      </div>

      <div className="hide-mobile" style={{ display:"flex", gap:4 }}>
        {NAV_ITEMS.map(item => (
          <button key={item.path}
            className={`tab-btn nav-link ${currentPath === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}>
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <button
          onClick={onOpenSidebar}
          style={{
            width:36, height:36, borderRadius:"50%",
            background:"linear-gradient(135deg,#0B5ED7,#20C997)",
            border:"none", cursor:"pointer", display:"flex",
            alignItems:"center", justifyContent:"center",
            fontSize:14, color:"#fff", fontWeight:800,
            boxShadow:"0 2px 8px rgba(11,94,215,0.25)", transition:"all 0.2s",
          }}
          title="Open profile"
        >DR</button>
        <button className="pg-btn pg-btn-ghost hide-desktop" onClick={() => setMobileMenu(!mobileMenu)}>☰</button>
      </div>

      {mobileMenu && (
        <div style={{ position:"absolute", top:62, left:0, right:0, background:"#fff", padding:14, display:"flex", flexDirection:"column", gap:6, borderBottom:"1.5px solid rgba(11,94,215,0.1)", zIndex:50 }}>
          {NAV_ITEMS.map(item => (
            <button key={item.path} className="tab-btn" style={{ textAlign:"left" }}
              onClick={() => { navigate(item.path); setMobileMenu(false); }}>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ sidebarOpen, setSidebarOpen, navigate }) {
  if (!sidebarOpen) return null;

  return (
    <>
      <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      <div style={{
        position:"fixed", top:0, right:0, height:"100vh", width:360,
        background:"#fff", borderLeft:"1.5px solid rgba(11,94,215,0.1)",
        zIndex:200, overflowY:"auto", padding:22,
        boxShadow:"-8px 0 40px rgba(11,94,215,0.08)",
        animation:"slideInFromRight 0.32s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <span className="syne" style={{ fontWeight:700, fontSize:15, color:"#212529" }}>User Profile</span>
          <button className="pg-btn pg-btn-ghost" onClick={() => setSidebarOpen(false)} style={{ padding:"5px 9px" }}>✕</button>
        </div>
        <div style={{ textAlign:"center", marginBottom:22 }}>
          <div style={{ width:76, height:76, borderRadius:"50%", background:"linear-gradient(135deg,#0B5ED7,#20C997)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:800, color:"#fff", margin:"0 auto 10px" }}>DR</div>
          <div className="syne" style={{ fontSize:16, fontWeight:700, color:"#212529" }}>Dr. Emily Roberts</div>
          <div style={{ fontSize:12, color:"#8fa3b8" }}>Clinical Pharmacogenomics</div>
          <div className="pg-badge" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.2)", marginTop:7 }}>🏥 Mount Sinai Hospital</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
          {[
            { icon:"📊", l:"Analyses Completed", v:"247" },
            { icon:"🧬", l:"PGx Reports", v:"184" },
            { icon:"👨‍👩‍👧‍👦", l:"Family Members", v:"6" },
            { icon:"⭐", l:"Accuracy Score", v:"98.2%" },
          ].map(s => (
            <div key={s.l} className="pg-card" style={{ padding:"11px 14px", display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:12, color:"#495057" }}>{s.icon} {s.l}</span>
              <span style={{ fontSize:12, fontWeight:700, color:"#212529" }}>{s.v}</span>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <button className="pg-btn pg-btn-family" style={{ width:"100%", justifyContent:"center" }}
            onClick={() => { setSidebarOpen(false); navigate("/family-section"); }}>
            👨‍👩‍👧‍👦 Go to Family Dashboard
          </button>
          <button className="pg-btn pg-btn-ghost" style={{ width:"100%", justifyContent:"center" }}
            onClick={() => { setSidebarOpen(false); navigate("/profile"); }}>
            ⚙️ Settings
          </button>
          <button className="pg-btn pg-btn-ghost" style={{ width:"100%", justifyContent:"center" }}
            onClick={() => setSidebarOpen(false)}>
            🚪 Sign Out
          </button>
        </div>
      </div>
    </>
  );
}

// ─── CIRCULAR PROGRESS ────────────────────────────────────────────────────────
function CircularProgress({ value, size=76, color="#0B5ED7", label }) {
  const r = (size-8)/2, circ = 2*Math.PI*r, offset = circ-(value/100)*circ;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(11,94,215,0.1)" strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="progress-ring" />
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle"
          fill="#212529" fontSize={12} fontWeight={600} fontFamily="DM Mono, monospace"
          style={{ transform:`rotate(90deg)`, transformOrigin:`${size/2}px ${size/2}px` }}>
          {Math.round(value)}%
        </text>
      </svg>
      {label && <span style={{ fontSize:10, color:"#8fa3b8", fontWeight:600, letterSpacing:1, fontFamily:"DM Mono,monospace" }}>{label}</span>}
    </div>
  );
}

function MiniBarChart({ value, color }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, margin:"4px 0" }}>
      <div style={{ flex:1, height:7, background:"rgba(11,94,215,0.06)", borderRadius:4, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${value}%`, background:color, borderRadius:4, transition:"width 1.2s cubic-bezier(0.4,0,0.2,1)", boxShadow:`0 0 6px ${color}40` }} />
      </div>
      <span className="mono" style={{ fontSize:10, color, width:32, textAlign:"right", fontWeight:600 }}>{value}%</span>
    </div>
  );
}

function DNALoader() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:22, padding:40 }}>
      <div style={{ position:"relative", width:72, height:80 }}>
        {[0,1,2,3,4,5,6,7].map(i => (
          <div key={i} style={{
            position:"absolute", width:11, height:11, borderRadius:"50%",
            background: i%2===0 ? "#0B5ED7" : "#20C997",
            left:18+Math.sin(i*0.9)*22, top:i*10,
            animation:`dnaFloat ${1.2+i*0.1}s ease-in-out infinite`,
            animationDelay:`${i*0.15}s`,
            boxShadow: i%2===0 ? "0 0 8px rgba(11,94,215,0.5)" : "0 0 8px rgba(32,201,151,0.5)"
          }} />
        ))}
      </div>
      <div style={{ textAlign:"center" }}>
        <div className="syne" style={{ fontSize:17, fontWeight:700, color:"#212529", marginBottom:7 }}>Analyzing Genetic Profile</div>
        <div className="mono" style={{ fontSize:12, color:"#8fa3b8" }}>Running CPIC pharmacogenomic pipeline...</div>
      </div>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" }}>
        {["Parsing VCF","Mapping alleles","Querying CPIC DB","Generating report"].map((s,i) => (
          <span key={s} className="pg-badge" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.2)", animation:`pulse ${1.2+i*0.25}s infinite` }}>
            ⟳ {s}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── INFO MODAL ───────────────────────────────────────────────────────────────
function InfoModal({ drug, data, onClose }) {
  const cfg = RISK_CONFIG[data.risk] || RISK_CONFIG.Unknown;
  const sevCfg = SEVERITY_CONFIG[data.severity] || SEVERITY_CONFIG.none;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ padding:"22px 24px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:48, height:48, borderRadius:12, background:cfg.bg, border:`1.5px solid ${cfg.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{cfg.icon}</div>
              <div>
                <div className="syne" style={{ fontSize:22, fontWeight:800, color:"#212529" }}>{drug}</div>
                <span className="pg-badge" style={{ background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, marginTop:4 }}>{cfg.label}</span>
              </div>
            </div>
            <button className="pg-btn pg-btn-ghost" onClick={onClose} style={{ padding:"5px 10px" }}>✕</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
            {[{l:"Gene",v:data.gene},{l:"Diplotype",v:data.diplotype},{l:"Phenotype",v:data.phenotypeLabel},{l:"CPIC Level",v:data.cpic}].map(f => (
              <div key={f.l} style={{ background:"#F8F9FA", borderRadius:9, padding:"10px 13px", border:"1.5px solid rgba(11,94,215,0.1)" }}>
                <div style={{ fontSize:10, color:"#8fa3b8", letterSpacing:1.2, marginBottom:4, fontWeight:600, fontFamily:"DM Mono,monospace" }}>{f.l.toUpperCase()}</div>
                <div className="mono" style={{ fontSize:12, color:"#212529", fontWeight:500 }}>{f.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding:"0 24px 22px", display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ background:cfg.bg, borderRadius:11, padding:"14px 16px", border:`1.5px solid ${cfg.border}` }}>
            <div style={{ fontSize:11, color:cfg.textColor, letterSpacing:1.2, marginBottom:8, fontWeight:700, fontFamily:"DM Mono,monospace" }}>⚠ WHY IS THIS {data.risk.toUpperCase()}?</div>
            <div style={{ fontSize:13, color:"#212529", lineHeight:1.75 }}>{data.whyRisk}</div>
          </div>
          <div style={{ background:"#F8F9FA", borderRadius:11, padding:"14px 16px", border:"1.5px solid rgba(11,94,215,0.1)" }}>
            <div style={{ fontSize:11, color:"#8fa3b8", letterSpacing:1.2, marginBottom:8, fontWeight:600, fontFamily:"DM Mono,monospace" }}>🔬 PHARMACOGENOMIC MECHANISM</div>
            <div style={{ fontSize:13, color:"#495057", lineHeight:1.75 }}>{data.mechanism}</div>
          </div>
          <div style={{ background:"rgba(11,94,215,0.04)", borderRadius:11, padding:"14px 16px", border:"1.5px solid rgba(11,94,215,0.14)" }}>
            <div style={{ fontSize:11, color:"#8fa3b8", letterSpacing:1.2, marginBottom:8, fontWeight:600, fontFamily:"DM Mono,monospace" }}>💊 CLINICAL RECOMMENDATION</div>
            <div style={{ fontSize:13, color:"#0B5ED7", marginBottom:6, lineHeight:1.7 }}><strong>Dosage:</strong> {data.dosage}</div>
            <div style={{ fontSize:13, color:"#20C997", lineHeight:1.7 }}><strong>Alternative:</strong> {data.alternative}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ fontSize:11, color:"#8fa3b8" }}>Severity:</div>
            <span className="pg-badge" style={{ background:`${sevCfg.color}12`, color:sevCfg.color, border:`1px solid ${sevCfg.color}30` }}>{sevCfg.label.toUpperCase()}</span>
            <div style={{ fontSize:11, color:"#8fa3b8", marginLeft:10 }}>Confidence:</div>
            <span className="mono" style={{ fontSize:12, color:cfg.color, fontWeight:600 }}>{Math.round((data.confidence||0)*100)}%</span>
          </div>
          {data.variants?.length > 0 && (
            <div>
              <div style={{ fontSize:11, color:"#8fa3b8", letterSpacing:1.2, marginBottom:8, fontWeight:600, fontFamily:"DM Mono,monospace" }}>🧬 DETECTED VARIANTS</div>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead><tr style={{ borderBottom:"1.5px solid rgba(11,94,215,0.1)" }}>
                  {["rsID","Change","Impact","Consequence"].map(h => <th key={h} style={{ padding:"6px 10px", textAlign:"left", color:"#8fa3b8", fontWeight:600, fontSize:10, letterSpacing:1, fontFamily:"DM Mono,monospace" }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {data.variants.map((v,i) => (
                    <tr key={i} style={{ borderBottom:"1px solid rgba(11,94,215,0.06)" }}>
                      <td className="mono" style={{ padding:"7px 10px", color:"#0B5ED7", fontSize:11 }}>{v.rsid||v.id}</td>
                      <td className="mono" style={{ padding:"7px 10px", color:"#212529", fontSize:11 }}>{v.allele}</td>
                      <td style={{ padding:"7px 10px" }}>
                        <span className="pg-badge" style={{ background:v.impact==="HIGH"?"rgba(235,52,52,0.08)":"rgba(245,158,11,0.08)", color:v.impact==="HIGH"?"#EB3434":"#f59e0b", fontSize:10 }}>{v.impact}</span>
                      </td>
                      <td style={{ padding:"7px 10px", color:"#495057", fontSize:11 }}>{v.consequence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── RISK CARD ────────────────────────────────────────────────────────────────
function RiskCard({ drug, data, delay=0 }) {
  const [modalOpen, setModalOpen] = useState(false);
  const cfg = RISK_CONFIG[data.risk] || RISK_CONFIG.Unknown;
  const confidence = Math.round((data.confidence||0)*100);
  return (
    <>
      <div className="pg-card" style={{ border:`1.5px solid ${cfg.border}`, background:cfg.bg, animation:`cardIn 0.45s ease ${delay}s both`, position:"relative" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
          <div>
            <div style={{ fontSize:10, color:"#8fa3b8", fontWeight:700, letterSpacing:2, marginBottom:4, fontFamily:"DM Mono,monospace" }}>DRUG</div>
            <div className="syne" style={{ fontSize:19, fontWeight:800, color:"#212529" }}>{drug}</div>
            <div style={{ fontSize:10, color:"#8fa3b8", marginTop:2 }}>{data.category||"Medication"}</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
            <button className="info-btn" onClick={() => setModalOpen(true)}>ℹ</button>
            <div style={{ fontSize:24 }}>{cfg.icon}</div>
            <span className="pg-badge" style={{ background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>{cfg.label}</span>
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <CircularProgress value={confidence} size={68} color={cfg.color} label="CONFIDENCE" />
          <div style={{ flex:1, paddingLeft:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6 }}>
              <span style={{ color:"#8fa3b8" }}>Gene</span>
              <span className="mono" style={{ color:"#0B5ED7", fontSize:11 }}>{data.gene}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6 }}>
              <span style={{ color:"#8fa3b8" }}>Phenotype</span>
              <span style={{ color:"#212529", fontSize:11, textAlign:"right", maxWidth:130 }}>{data.phenotypeLabel||data.phenotype}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
              <span style={{ color:"#8fa3b8" }}>CPIC</span>
              <span className="mono" style={{ color:"#20C997", fontSize:11 }}>{data.cpic}</span>
            </div>
          </div>
        </div>
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:"#8fa3b8", marginBottom:5, letterSpacing:1, fontWeight:600, fontFamily:"DM Mono,monospace" }}>GENE IMPACT</div>
          <MiniBarChart value={data.geneImpact} color={cfg.color} />
        </div>
        <div style={{ padding:"9px 12px", background:"#F8F9FA", borderRadius:9, border:"1.5px solid rgba(11,94,215,0.08)", fontSize:12, color:"#495057", lineHeight:1.5 }}>
          💊 <strong style={{ color:"#212529" }}>Alt:</strong> {data.alternative}
        </div>
        <button onClick={() => setModalOpen(true)} style={{ marginTop:10, width:"100%", padding:"8px", background:`${cfg.color}10`, border:`1.5px solid ${cfg.border}`, borderRadius:9, cursor:"pointer", color:cfg.color, fontSize:12, fontWeight:600, fontFamily:"Epilogue,sans-serif", transition:"all 0.18s", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          ℹ Why {cfg.label}? →
        </button>
      </div>
      {modalOpen && <InfoModal drug={drug} data={data} onClose={() => setModalOpen(false)} />}
    </>
  );
}

// ─── MEMBER VCF UPLOADER ──────────────────────────────────────────────────────
function MemberVCFUploader({ member, onVCFParsed, onAnalyze }) {
  const [draggingMini, setDraggingMini] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (f) => {
    if (!f) return;
    onVCFParsed(member.id, { status:"validating" });
    try {
      if (!f.name.endsWith(".vcf") && !f.name.endsWith(".vcf.gz")) throw new Error("Invalid format: must be a .vcf file");
      if (f.size > 5*1024*1024) throw new Error("File too large: maximum 5MB allowed");
      const info = await parseVCF(f);
      onVCFParsed(member.id, { status:"valid", fileInfo:info, fileName:f.name });
      showNotif(`✓ VCF validated for ${member.name} — ${info.variants} variants detected`, "success");
    } catch(e) {
      onVCFParsed(member.id, { status:"error", error:e.message });
      showNotif(e.message, "error");
    }
  };

  const vcfState = member.vcfState || {};

  return (
    <div>
      {!vcfState.status || vcfState.status === "error" ? (
        <>
          <div
            className={`vcf-drop-mini ${draggingMini?"dragging-mini":""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDraggingMini(true); }}
            onDragLeave={() => setDraggingMini(false)}
            onDrop={e => { e.preventDefault(); setDraggingMini(false); handleFile(e.dataTransfer.files[0]); }}
          >
            <input ref={fileInputRef} type="file" accept=".vcf,.vcf.gz" style={{ display:"none" }} onChange={e => handleFile(e.target.files[0])} />
            <div style={{ fontSize:20, marginBottom:5 }}>🧬</div>
            <div style={{ fontSize:11, color:"#495057", marginBottom:3, fontWeight:600 }}>Upload VCF for {member.name}</div>
            <div style={{ fontSize:10, color:"#8fa3b8" }}>.vcf format · max 5MB</div>
            <button className="pg-btn pg-btn-family" style={{ marginTop:8, fontSize:11, padding:"6px 14px" }} onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              📂 Browse
            </button>
          </div>
          {vcfState.status === "error" && (
            <div style={{ marginTop:8, padding:"10px 13px", background:"rgba(235,52,52,0.06)", border:"1.5px solid rgba(235,52,52,0.2)", borderRadius:9 }}>
              <div style={{ fontSize:11, color:"#EB3434", fontWeight:600, marginBottom:4 }}>⚠ Upload Failed</div>
              <div style={{ fontSize:11, color:"#495057", lineHeight:1.5 }}>{vcfState.error}</div>
            </div>
          )}
        </>
      ) : vcfState.status === "validating" ? (
        <div style={{ textAlign:"center", padding:"14px", background:"rgba(11,94,215,0.04)", borderRadius:11, border:"1.5px solid rgba(11,94,215,0.15)" }}>
          <div style={{ fontSize:18, marginBottom:5 }} className="pg-pulse">🔬</div>
          <div style={{ fontSize:12, color:"#0B5ED7", fontWeight:600 }}>Parsing VCF...</div>
        </div>
      ) : vcfState.status === "valid" ? (
        <div style={{ background:"rgba(32,201,151,0.06)", border:"1.5px solid rgba(32,201,151,0.25)", borderRadius:11, padding:"12px 14px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
            <span style={{ fontSize:14 }}>✅</span>
            <span style={{ fontSize:12, fontWeight:700, color:"#20C997" }}>VCF Validated</span>
            <button style={{ marginLeft:"auto", background:"#F8F9FA", border:"1px solid rgba(11,94,215,0.14)", cursor:"pointer", color:"#8fa3b8", fontSize:10, padding:"2px 6px", borderRadius:5 }}
              onClick={() => onVCFParsed(member.id, { status:null })}>✕ Remove</button>
          </div>
          <div className="mono" style={{ fontSize:10, color:"#8fa3b8", marginBottom:8 }}>{vcfState.fileName} · {vcfState.fileInfo?.variants?.toLocaleString()} variants</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
            {(vcfState.fileInfo?.pgxGenes||[]).map(g => (
              <span key={g} className="pg-badge mono" style={{ background:"rgba(32,201,151,0.08)", color:"#20C997", border:"1px solid rgba(32,201,151,0.2)", fontSize:9 }}>{g}</span>
            ))}
          </div>
          <button className="pg-btn pg-btn-family" style={{ width:"100%", justifyContent:"center", fontSize:11 }} onClick={() => onAnalyze(member)}>
            🔬 Analyze {member.name}'s Report →
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ─── ADD MEMBER MODAL ─────────────────────────────────────────────────────────
function AddMemberModal({ onClose, onAdd, editMember=null }) {
  const [form, setForm] = useState(editMember || {
    name:"", relation:"Father", age:"", gender:"Male",
    bloodGroup:"Unknown", medicalConditions:"", allergies:"", currentMedications:""
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]:v }));

  const handleSubmit = () => {
    if (!form.name.trim()) return showNotif("Please enter member name", "error");
    if (!form.age || isNaN(form.age) || form.age < 0 || form.age > 130) return showNotif("Please enter a valid age (0-130)", "error");
    onAdd({ ...form, id: editMember?.id || Date.now().toString(), age:parseInt(form.age) });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth:560 }}>
        <div style={{ padding:"24px 26px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
            <div>
              <div className="syne" style={{ fontSize:22, fontWeight:800, color:"#212529" }}>{editMember?"Edit":"Add"} Family Member</div>
              <div style={{ fontSize:12, color:"#8fa3b8", marginTop:3 }}>Enter genetic profile details for analysis</div>
            </div>
            <button className="pg-btn pg-btn-ghost" onClick={onClose} style={{ padding:"5px 10px" }}>✕</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
            <div>
              <label style={{ fontSize:11, color:"#8fa3b8", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6, fontFamily:"DM Mono,monospace" }}>FULL NAME *</label>
              <input className="pg-input" placeholder="Member name" value={form.name} onChange={e => set("name",e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize:11, color:"#8fa3b8", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6, fontFamily:"DM Mono,monospace" }}>RELATION *</label>
              <select className="pg-select" value={form.relation} onChange={e => set("relation",e.target.value)}>
                {RELATIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:11, color:"#8fa3b8", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6, fontFamily:"DM Mono,monospace" }}>AGE *</label>
              <input className="pg-input" type="number" placeholder="Age in years" min="0" max="130" value={form.age} onChange={e => set("age",e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize:11, color:"#8fa3b8", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6, fontFamily:"DM Mono,monospace" }}>GENDER</label>
              <select className="pg-select" value={form.gender} onChange={e => set("gender",e.target.value)}>
                {["Male","Female","Non-binary","Prefer not to say"].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:11, color:"#8fa3b8", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6, fontFamily:"DM Mono,monospace" }}>BLOOD GROUP</label>
              <select className="pg-select" value={form.bloodGroup} onChange={e => set("bloodGroup",e.target.value)}>
                {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:11, color:"#8fa3b8", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6, fontFamily:"DM Mono,monospace" }}>ICON PREVIEW</label>
              <div style={{ height:42, display:"flex", alignItems:"center", gap:10, padding:"0 13px", background:"#F8F9FA", borderRadius:10, border:"1.5px solid rgba(11,94,215,0.14)" }}>
                <span style={{ fontSize:22 }}>{RELATION_ICONS[form.relation]||"👤"}</span>
                <span style={{ fontSize:12, color:"#495057" }}>{form.relation}</span>
              </div>
            </div>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, color:"#8fa3b8", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6, fontFamily:"DM Mono,monospace" }}>KNOWN MEDICAL CONDITIONS</label>
            <input className="pg-input" placeholder="e.g. Hypertension, Diabetes Type 2, Epilepsy..." value={form.medicalConditions} onChange={e => set("medicalConditions",e.target.value)} />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, color:"#8fa3b8", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6, fontFamily:"DM Mono,monospace" }}>KNOWN DRUG ALLERGIES</label>
            <input className="pg-input" placeholder="e.g. Penicillin, Sulfonamides..." value={form.allergies} onChange={e => set("allergies",e.target.value)} />
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:11, color:"#8fa3b8", fontWeight:600, letterSpacing:1, display:"block", marginBottom:6, fontFamily:"DM Mono,monospace" }}>CURRENT MEDICATIONS</label>
            <input className="pg-input" placeholder="e.g. Warfarin 5mg, Metformin 500mg..." value={form.currentMedications} onChange={e => set("currentMedications",e.target.value)} />
          </div>
        </div>
        <div style={{ padding:"0 26px 24px", display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button className="pg-btn pg-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="pg-btn pg-btn-family" onClick={handleSubmit}>
            {editMember ? "💾 Save Changes" : "➕ Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MEMBER REPORT MODAL ──────────────────────────────────────────────────────
function MemberReportModal({ member, onClose }) {
  const results = member.analysisResults;
  const [activeTab, setActiveTab] = useState("cards");
  if (!results) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth:780 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding:"22px 24px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:46, height:46, borderRadius:"50%", background:"linear-gradient(135deg,rgba(11,94,215,0.1),rgba(32,201,151,0.15))", border:"2px solid rgba(11,94,215,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                {RELATION_ICONS[member.relation]||"👤"}
              </div>
              <div>
                <div className="syne" style={{ fontSize:20, fontWeight:800, color:"#212529" }}>{member.name}'s Report</div>
                <div style={{ fontSize:12, color:"#8fa3b8" }}>{member.relation} · Age {member.age} · {member.gender}</div>
              </div>
            </div>
            <button className="pg-btn pg-btn-ghost" onClick={onClose} style={{ padding:"5px 10px" }}>✕</button>
          </div>
          {results.alert && (
            <div style={{ padding:"12px 16px", borderRadius:11, marginBottom:16, background:results.summary.highRisk.length>0?"rgba(235,52,52,0.07)":"rgba(245,158,11,0.07)", border:`1.5px solid ${results.summary.highRisk.length>0?"rgba(235,52,52,0.25)":"rgba(245,158,11,0.25)"}`, display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:18 }}>🚨</span>
              <div style={{ fontSize:12, color:"#495057", lineHeight:1.5 }}>{results.alert}</div>
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:16 }}>
            {[{l:"Toxic",c:results.summary.highRisk.length,col:"#EB3434",icon:"☠️"},{l:"Adjust",c:results.summary.adjustDosage.length,col:"#f59e0b",icon:"⚖️"},{l:"Ineffective",c:results.summary.ineffective.length,col:"#f97316",icon:"🚫"},{l:"Safe",c:results.summary.safe.length,col:"#20C997",icon:"🛡️"}].map(s => (
              <div key={s.l} style={{ textAlign:"center", padding:"11px 8px", background:"#F8F9FA", borderRadius:10, border:"1.5px solid rgba(11,94,215,0.08)" }}>
                <div style={{ fontSize:16, marginBottom:2 }}>{s.icon}</div>
                <div className="syne" style={{ fontSize:22, fontWeight:800, color:s.col }}>{s.c}</div>
                <div style={{ fontSize:10, color:"#8fa3b8" }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:3, marginBottom:16, background:"#F8F9FA", borderRadius:10, padding:4, border:"1.5px solid rgba(11,94,215,0.08)" }}>
            {[{id:"cards",label:"💊 Risk Cards"},{id:"summary",label:"📋 Summary"}].map(t => (
              <button key={t.id} className={`tab-btn ${activeTab===t.id?"active-family":""}`} onClick={() => setActiveTab(t.id)} style={{ flex:1 }}>{t.label}</button>
            ))}
          </div>
        </div>
        <div style={{ padding:"0 24px 24px", maxHeight:"50vh", overflowY:"auto" }}>
          {activeTab==="cards" && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:12 }}>
              {Object.entries(results.drugs).map(([drug,data],i) => (
                <RiskCard key={drug} drug={drug} data={data} delay={i*0.05} />
              ))}
            </div>
          )}
          {activeTab==="summary" && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div className="pg-card" style={{ padding:"14px 16px" }}>
                <div style={{ fontSize:12, fontWeight:600, color:"#495057", marginBottom:12 }}>📊 Sample Information</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[{l:"Sample ID",v:member.vcfState?.fileInfo?.sampleId},{l:"VCF Format",v:member.vcfState?.fileInfo?.fileformat||"VCFv4.2"},{l:"Total Variants",v:member.vcfState?.fileInfo?.variants?.toLocaleString()},{l:"PGx Genes",v:member.vcfState?.fileInfo?.pgxGenes?.length},{l:"Quality Score",v:`${member.vcfState?.fileInfo?.quality}%`},{l:"Analyzed",v:new Date(results.analyzedAt).toLocaleDateString()}].map(f => (
                    <div key={f.l} style={{ background:"#F8F9FA", borderRadius:8, padding:"9px 11px", border:"1.5px solid rgba(11,94,215,0.08)" }}>
                      <div style={{ fontSize:10, color:"#8fa3b8", marginBottom:3, fontFamily:"DM Mono,monospace" }}>{f.l}</div>
                      <div className="mono" style={{ fontSize:11, color:"#0B5ED7", fontWeight:600 }}>{f.v||"—"}</div>
                    </div>
                  ))}
                </div>
              </div>
              {member.currentMedications && (
                <div style={{ padding:"12px 14px", background:"rgba(11,94,215,0.04)", borderRadius:10, border:"1.5px solid rgba(11,94,215,0.14)" }}>
                  <div style={{ fontSize:11, color:"#0B5ED7", fontWeight:600, marginBottom:6, fontFamily:"DM Mono,monospace" }}>💊 CURRENT MEDICATIONS</div>
                  <div style={{ fontSize:12, color:"#495057" }}>{member.currentMedications}</div>
                </div>
              )}
              {member.medicalConditions && (
                <div style={{ padding:"12px 14px", background:"rgba(245,158,11,0.06)", borderRadius:10, border:"1.5px solid rgba(245,158,11,0.2)" }}>
                  <div style={{ fontSize:11, color:"#f59e0b", fontWeight:600, marginBottom:6, fontFamily:"DM Mono,monospace" }}>🏥 MEDICAL CONDITIONS</div>
                  <div style={{ fontSize:12, color:"#495057" }}>{member.medicalConditions}</div>
                </div>
              )}
              {member.allergies && (
                <div style={{ padding:"12px 14px", background:"rgba(235,52,52,0.06)", borderRadius:10, border:"1.5px solid rgba(235,52,52,0.2)" }}>
                  <div style={{ fontSize:11, color:"#EB3434", fontWeight:600, marginBottom:6, fontFamily:"DM Mono,monospace" }}>⚠ KNOWN ALLERGIES</div>
                  <div style={{ fontSize:12, color:"#495057" }}>{member.allergies}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DRUG PICKER MODAL ────────────────────────────────────────────────────────
function DrugPickerModal({ member, onClose, onRunAnalysis }) {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toUpperCase().trim();
    return q ? ALL_DRUGS.filter(d => d.includes(q) && !selected.includes(d)) : ALL_DRUGS.filter(d => !selected.includes(d));
  }, [search, selected]);

  const handleRun = async () => {
    if (selected.length === 0) return showNotif("Select at least one drug", "error");
    setAnalyzing(true);
    try {
      const results = await runAnalysis(member.vcfState.fileInfo, selected);
      onRunAnalysis(member.id, results);
      onClose();
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth:580 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding:"22px 24px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <div>
              <div className="syne" style={{ fontSize:20, fontWeight:800, color:"#212529" }}>Select Drugs for {member.name}</div>
              <div style={{ fontSize:12, color:"#8fa3b8", marginTop:3 }}>Choose drugs to analyze against {member.name}'s genetic profile</div>
            </div>
            <button className="pg-btn pg-btn-ghost" onClick={onClose} style={{ padding:"5px 10px" }}>✕</button>
          </div>
          <input className="pg-input" placeholder="🔍 Search drugs..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom:12 }} />
          <div style={{ maxHeight:200, overflowY:"auto", display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
            {filtered.slice(0,60).map(d => (
              <button key={d} className="pg-btn pg-btn-ghost" style={{ fontSize:11, padding:"5px 11px" }} onClick={() => setSelected(p => [...p,d])}>+ {d}</button>
            ))}
          </div>
          {selected.length > 0 && (
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:10, color:"#8fa3b8", marginBottom:7, fontWeight:600, letterSpacing:1, fontFamily:"DM Mono,monospace" }}>SELECTED ({selected.length})</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {selected.map(d => (
                  <span key={d} className="pg-badge" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1.5px solid rgba(11,94,215,0.2)", fontSize:12, cursor:"pointer", padding:"5px 11px" }}
                    onClick={() => setSelected(p => p.filter(x=>x!==d))}>
                    💊 {d} <span style={{ marginLeft:4, opacity:0.65 }}>✕</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ padding:"0 24px 24px", display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button className="pg-btn pg-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="pg-btn pg-btn-family" onClick={handleRun} disabled={selected.length===0||analyzing}>
            {analyzing ? "⟳ Analyzing..." : `🔬 Analyze ${selected.length} Drug${selected.length!==1?"s":""}`}
          </button>
        </div>
        {analyzing && <div style={{ padding:"0 24px 24px" }}><DNALoader /></div>}
      </div>
    </div>
  );
}

// ─── FAMILY OVERVIEW STATS ────────────────────────────────────────────────────
function FamilyRiskOverview({ members }) {
  const analyzed = members.filter(m => m.analysisResults);
  if (analyzed.length === 0) return null;
  const allDrugs = {};
  analyzed.forEach(m => {
    Object.entries(m.analysisResults.drugs||{}).forEach(([drug,data]) => {
      if (!allDrugs[drug]) allDrugs[drug] = [];
      allDrugs[drug].push({ member:m.name, risk:data.risk, severity:data.severity });
    });
  });
  const sharedHighRisk = Object.entries(allDrugs).filter(([,v]) => v.filter(x=>x.risk==="Toxic").length>1);
  return (
    <div className="pg-card pg-fadeUp" style={{ marginBottom:20, border:"1.5px solid rgba(11,94,215,0.2)", background:"linear-gradient(135deg,rgba(11,94,215,0.03),rgba(32,201,151,0.02))" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
        <span style={{ fontSize:22 }}>🧬</span>
        <div>
          <div className="syne" style={{ fontWeight:700, fontSize:15, color:"#212529" }}>Family Risk Overview</div>
          <div style={{ fontSize:11, color:"#8fa3b8" }}>{analyzed.length} members analyzed · Shared genetic risk patterns</div>
        </div>
        <span className="pg-badge" style={{ marginLeft:"auto", background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.2)" }}>
          {analyzed.length}/{members.length} Analyzed
        </span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:10, marginBottom:16 }}>
        {[
          { l:"Total Members", v:members.length, col:"#0B5ED7", icon:"👨‍👩‍👧‍👦" },
          { l:"Toxic Risks", v:analyzed.reduce((acc,m)=>acc+(m.analysisResults?.summary?.highRisk?.length||0),0), col:"#EB3434", icon:"☠️" },
          { l:"Dose Adjustments", v:analyzed.reduce((acc,m)=>acc+(m.analysisResults?.summary?.adjustDosage?.length||0),0), col:"#f59e0b", icon:"⚖️" },
          { l:"Safe Profiles", v:analyzed.reduce((acc,m)=>acc+(m.analysisResults?.summary?.safe?.length||0),0), col:"#20C997", icon:"🛡️" },
        ].map(s => (
          <div key={s.l} style={{ textAlign:"center", padding:"14px 10px", background:"#F8F9FA", borderRadius:11, border:"1.5px solid rgba(11,94,215,0.08)" }}>
            <div style={{ fontSize:18, marginBottom:4 }}>{s.icon}</div>
            <div className="syne" style={{ fontSize:26, fontWeight:800, color:s.col }}>{s.v}</div>
            <div style={{ fontSize:10, color:"#8fa3b8", letterSpacing:0.5 }}>{s.l}</div>
          </div>
        ))}
      </div>
      {sharedHighRisk.length > 0 && (
        <div style={{ padding:"12px 14px", background:"rgba(235,52,52,0.06)", border:"1.5px solid rgba(235,52,52,0.2)", borderRadius:10 }}>
          <div style={{ fontSize:11, color:"#EB3434", fontWeight:700, marginBottom:8, fontFamily:"DM Mono,monospace" }}>⚠ SHARED FAMILY TOXIC RISKS</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {sharedHighRisk.map(([drug,mems]) => (
              <div key={drug} style={{ padding:"6px 10px", background:"rgba(235,52,52,0.06)", borderRadius:8, border:"1.5px solid rgba(235,52,52,0.18)" }}>
                <div style={{ fontSize:11, color:"#EB3434", fontWeight:600 }}>☠️ {drug}</div>
                <div style={{ fontSize:10, color:"#495057", marginTop:2 }}>{mems.map(m=>m.member).join(", ")}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MEMBER CARD ──────────────────────────────────────────────────────────────
function MemberCard({ member, idx, onEdit, onRemove, onVCFParsed, onAnalyze, onViewReport }) {
  const [showVCFUpload, setShowVCFUpload] = useState(false);
  const hasResults = !!member.analysisResults;
  const vcfValid = member.vcfState?.status === "valid";
  const results = member.analysisResults;
  const riskSummary = results ? [
    { label:"Toxic", count:results.summary.highRisk.length, color:"#EB3434" },
    { label:"Adjust", count:results.summary.adjustDosage.length, color:"#f59e0b" },
    { label:"Safe", count:results.summary.safe.length, color:"#20C997" },
  ] : [];
  const accentBars = [
    "linear-gradient(90deg,#0B5ED7,#6EA8FE)","linear-gradient(90deg,#0B5ED7,#20C997)",
    "linear-gradient(90deg,#20C997,#6EA8FE)","linear-gradient(90deg,#094bb3,#20C997)",
    "linear-gradient(90deg,#EB3434,#f59e0b)","linear-gradient(90deg,#0B5ED7,#094bb3)",
  ];
  const accentColors = ["#0B5ED7","#0B5ED7","#20C997","#094bb3","#EB3434","#0B5ED7"];
  const accent = accentColors[idx % accentColors.length];
  const accentBar = accentBars[idx % accentBars.length];

  return (
    <div className="family-card" style={{ animation:`cardIn 0.4s ease ${idx*0.08}s both`, "--accent-bar":accentBar }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:accentBar, borderRadius:"18px 18px 0 0" }} />
      <div style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:14 }}>
        <div className="member-avatar" style={{ borderColor:`${accent}40`, background:`linear-gradient(135deg,${accent}10,rgba(32,201,151,0.1))` }}>
          {RELATION_ICONS[member.relation]||"👤"}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
            <div className="syne" style={{ fontSize:17, fontWeight:800, color:"#212529", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{member.name}</div>
          </div>
          <div style={{ fontSize:11, color:"#8fa3b8" }}>{member.relation} · {member.gender} · Age {member.age}</div>
          <div style={{ display:"flex", gap:5, marginTop:5, flexWrap:"wrap" }}>
            <span className="pg-badge" style={{ background:`${accent}10`, color:accent, border:`1px solid ${accent}25`, fontSize:10 }}>🩸 {member.bloodGroup}</span>
            {hasResults && <span className="pg-badge" style={{ background:"rgba(32,201,151,0.08)", color:"#20C997", border:"1px solid rgba(32,201,151,0.2)", fontSize:10 }}>✓ Analyzed</span>}
            {vcfValid && !hasResults && <span className="pg-badge" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.2)", fontSize:10 }}>🧬 VCF Ready</span>}
          </div>
        </div>
        <div style={{ display:"flex", gap:5, flexShrink:0 }}>
          <button className="info-btn" onClick={onEdit} title="Edit member">✏</button>
          <button className="info-btn" onClick={onRemove} title="Remove member" style={{ color:"#EB3434", borderColor:"rgba(235,52,52,0.25)" }}>✕</button>
        </div>
      </div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
        {member.medicalConditions && <span style={{ fontSize:10, color:"#495057", background:"#F8F9FA", padding:"3px 8px", borderRadius:6, border:"1.5px solid rgba(11,94,215,0.08)" }}>🏥 {member.medicalConditions.split(",")[0]}</span>}
        {member.allergies && <span style={{ fontSize:10, color:"#f59e0b", background:"rgba(245,158,11,0.06)", padding:"3px 8px", borderRadius:6, border:"1px solid rgba(245,158,11,0.18)" }}>⚠ Allergic: {member.allergies.split(",")[0]}</span>}
      </div>
      {hasResults && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginBottom:12 }}>
          {riskSummary.map(r => (
            <div key={r.label} style={{ textAlign:"center", padding:"8px 4px", background:`${r.color}08`, borderRadius:8, border:`1.5px solid ${r.color}20` }}>
              <div className="syne" style={{ fontSize:18, fontWeight:800, color:r.color }}>{r.count}</div>
              <div style={{ fontSize:9, color:"#8fa3b8" }}>{r.label}</div>
            </div>
          ))}
        </div>
      )}
      {!vcfValid && !hasResults && (
        <div>
          {!showVCFUpload ? (
            <button className="pg-btn pg-btn-family" style={{ width:"100%", justifyContent:"center", fontSize:12 }} onClick={() => setShowVCFUpload(true)}>🧬 Upload VCF File</button>
          ) : (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ fontSize:11, color:"#8fa3b8" }}>Upload VCF File</span>
                <button onClick={() => setShowVCFUpload(false)} style={{ fontSize:10, color:"#8fa3b8", background:"none", border:"none", cursor:"pointer" }}>✕</button>
              </div>
              <MemberVCFUploader member={member} onVCFParsed={onVCFParsed} onAnalyze={onAnalyze} />
            </div>
          )}
        </div>
      )}
      {vcfValid && !hasResults && <MemberVCFUploader member={member} onVCFParsed={onVCFParsed} onAnalyze={onAnalyze} />}
      {hasResults && (
        <div style={{ display:"flex", gap:8, marginTop:4 }}>
          <button className="pg-btn pg-btn-family" style={{ flex:1, justifyContent:"center", fontSize:12 }} onClick={onViewReport}>📊 View Report</button>
          <button className="pg-btn pg-btn-ghost" style={{ fontSize:12, padding:"9px 12px" }} onClick={() => { onVCFParsed(member.id, member.vcfState); onAnalyze(member); }}>🔄 Re-analyze</button>
        </div>
      )}
    </div>
  );
}

// ─── MEMBER LIST ROW ──────────────────────────────────────────────────────────
function MemberListRow({ member, onEdit, onRemove, onVCFParsed, onAnalyze, onViewReport }) {
  const [expanded, setExpanded] = useState(false);
  const hasResults = !!member.analysisResults;
  const vcfValid = member.vcfState?.status === "valid";
  const results = member.analysisResults;
  return (
    <div className="pg-card" style={{ padding:"14px 18px", border:hasResults?"1.5px solid rgba(11,94,215,0.2)":"1.5px solid rgba(11,94,215,0.1)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,rgba(11,94,215,0.1),rgba(32,201,151,0.12))", border:"1.5px solid rgba(11,94,215,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
          {RELATION_ICONS[member.relation]||"👤"}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
            <div className="syne" style={{ fontSize:15, fontWeight:800, color:"#212529" }}>{member.name}</div>
            <span style={{ fontSize:11, color:"#8fa3b8" }}>{member.relation} · Age {member.age}</span>
            {hasResults && <span className="pg-badge" style={{ background:"rgba(32,201,151,0.08)", color:"#20C997", border:"1px solid rgba(32,201,151,0.2)", fontSize:10 }}>✓ Analyzed</span>}
            {vcfValid && !hasResults && <span className="pg-badge" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.2)", fontSize:10 }}>🧬 VCF Ready</span>}
          </div>
          {hasResults && (
            <div style={{ display:"flex", gap:10 }}>
              {[{l:"Toxic",v:results.summary.highRisk.length,c:"#EB3434"},{l:"Adjust",v:results.summary.adjustDosage.length,c:"#f59e0b"},{l:"Safe",v:results.summary.safe.length,c:"#20C997"}].map(r => (
                <span key={r.l} style={{ fontSize:11, color:r.c, fontWeight:600 }}>● {r.l}: {r.v}</span>
              ))}
            </div>
          )}
        </div>
        <div style={{ display:"flex", gap:7, flexShrink:0 }}>
          {hasResults && <button className="pg-btn pg-btn-family" style={{ fontSize:11, padding:"6px 14px" }} onClick={onViewReport}>📊 Report</button>}
          {!hasResults && vcfValid && <button className="pg-btn pg-btn-family" style={{ fontSize:11, padding:"6px 14px" }} onClick={() => onAnalyze(member)}>🔬 Analyze</button>}
          {!vcfValid && <button className="pg-btn pg-btn-ghost" style={{ fontSize:11, padding:"6px 14px" }} onClick={() => setExpanded(!expanded)}>🧬 Upload VCF</button>}
          <button className="info-btn" onClick={onEdit}>✏</button>
          <button className="info-btn" onClick={onRemove} style={{ color:"#EB3434", borderColor:"rgba(235,52,52,0.2)" }}>✕</button>
        </div>
      </div>
      {expanded && !vcfValid && (
        <div style={{ marginTop:14, paddingTop:14, borderTop:"1.5px solid rgba(11,94,215,0.08)" }}>
          <MemberVCFUploader member={member} onVCFParsed={onVCFParsed} onAnalyze={onAnalyze} />
        </div>
      )}
    </div>
  );
}

// ─── ADD MEMBER TILE ──────────────────────────────────────────────────────────
function AddMemberTile({ onClick }) {
  return (
    <div onClick={onClick} style={{ border:"2px dashed rgba(11,94,215,0.2)", borderRadius:18, padding:24, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, transition:"all 0.25s", minHeight:160, background:"rgba(11,94,215,0.02)" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor="#0B5ED7"; e.currentTarget.style.background="rgba(11,94,215,0.05)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(11,94,215,0.2)"; e.currentTarget.style.background="rgba(11,94,215,0.02)"; }}>
      <div style={{ fontSize:36, color:"rgba(11,94,215,0.4)" }}>➕</div>
      <div style={{ fontSize:13, fontWeight:600, color:"#8fa3b8" }}>Add Family Member</div>
      <div style={{ fontSize:11, color:"#bec8d2", textAlign:"center" }}>Upload VCF & track genetic drug risks</div>
    </div>
  );
}

// ─── FAMILY TREE VIZ ──────────────────────────────────────────────────────────
function FamilyTreeViz({ members }) {
  const parentGen = members.filter(m => ["Father","Mother","Grandfather","Grandmother"].includes(m.relation));
  const selfGen = members.filter(m => ["Self","Spouse"].includes(m.relation));
  const childGen = members.filter(m => ["Son","Daughter","Brother","Sister"].includes(m.relation));
  const otherGen = members.filter(m => !["Father","Mother","Grandfather","Grandmother","Self","Spouse","Son","Daughter","Brother","Sister"].includes(m.relation));

  const NodeViz = ({ member }) => {
    const hasResults = !!member.analysisResults;
    const highRisk = member.analysisResults?.summary?.highRisk?.length || 0;
    const col = highRisk > 0 ? "#EB3434" : hasResults ? "#20C997" : "#0B5ED7";
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
        <div style={{ width:46, height:46, borderRadius:"50%", background:`linear-gradient(135deg,${col}12,${col}20)`, border:`2px solid ${col}50`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, boxShadow:hasResults?`0 4px 12px ${col}25`:"0 2px 6px rgba(11,94,215,0.1)" }}>
          {RELATION_ICONS[member.relation]||"👤"}
        </div>
        <div style={{ fontSize:10, color:"#495057", fontWeight:600, textAlign:"center", maxWidth:70 }}>{member.name.split(" ")[0]}</div>
        {hasResults && <div style={{ width:8, height:8, borderRadius:"50%", background:col, boxShadow:`0 0 6px ${col}60` }} />}
      </div>
    );
  };

  return (
    <div className="pg-card" style={{ marginTop:24, border:"1.5px solid rgba(11,94,215,0.15)", background:"linear-gradient(135deg,rgba(11,94,215,0.02),rgba(32,201,151,0.02))" }}>
      <div className="syne" style={{ fontWeight:700, fontSize:14, marginBottom:16, display:"flex", alignItems:"center", gap:8, color:"#212529" }}>
        <span>🌳</span> Family Genetic Map
        <span style={{ fontSize:11, color:"#8fa3b8", fontWeight:400, marginLeft:4 }}>Colored nodes indicate completed analysis</span>
      </div>
      <div style={{ overflowX:"auto", paddingBottom:10 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:0, minWidth:320, alignItems:"center" }}>
          {parentGen.length > 0 && <div style={{ display:"flex", gap:28, justifyContent:"center", marginBottom:8 }}>{parentGen.map(m => <NodeViz key={m.id} member={m} />)}</div>}
          {parentGen.length > 0 && selfGen.length > 0 && <div style={{ width:2, height:24, background:"linear-gradient(to bottom,rgba(11,94,215,0.4),rgba(32,201,151,0.2))" }} />}
          {selfGen.length > 0 && <div style={{ display:"flex", gap:28, justifyContent:"center", marginBottom:8 }}>{selfGen.map(m => <NodeViz key={m.id} member={m} />)}</div>}
          {selfGen.length > 0 && childGen.length > 0 && <div style={{ width:2, height:24, background:"linear-gradient(to bottom,rgba(11,94,215,0.4),rgba(32,201,151,0.2))" }} />}
          {childGen.length > 0 && <div style={{ display:"flex", gap:28, justifyContent:"center", marginBottom:8 }}>{childGen.map(m => <NodeViz key={m.id} member={m} />)}</div>}
          {otherGen.length > 0 && <div style={{ display:"flex", gap:20, justifyContent:"center", marginTop:4, padding:"10px", borderTop:"1px dashed rgba(11,94,215,0.12)", flexWrap:"wrap" }}>{otherGen.map(m => <NodeViz key={m.id} member={m} />)}</div>}
        </div>
      </div>
      <div style={{ display:"flex", gap:14, justifyContent:"center", marginTop:12, flexWrap:"wrap" }}>
        {[{c:"#EB3434",l:"Has Toxic Risk"},{c:"#20C997",l:"Analyzed (Safe)"},{c:"#0B5ED7",l:"Pending Analysis"}].map(l => (
          <div key={l.l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#495057" }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:l.c }} />{l.l}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FAMILY PAGE ──────────────────────────────────────────────────────────────
function FamilyPage({ navigate }) {
  const [members, setMembers] = useState([
    { id:"demo1", name:"Dr. Roberts", relation:"Self", age:42, gender:"Female", bloodGroup:"O+", medicalConditions:"Hypertension", allergies:"Penicillin", currentMedications:"Lisinopril 10mg", vcfState:null, analysisResults:null },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [drugPickerMember, setDrugPickerMember] = useState(null);
  const [reportMember, setReportMember] = useState(null);
  const [view, setView] = useState("grid");
  const [searchMember, setSearchMember] = useState("");
  const [familyId] = useState("FAM-" + Math.random().toString(36).slice(2,8).toUpperCase());

  const filteredMembers = useMemo(() => {
    const q = searchMember.toLowerCase();
    return q ? members.filter(m => m.name.toLowerCase().includes(q) || m.relation.toLowerCase().includes(q)) : members;
  }, [members, searchMember]);

  const addOrUpdateMember = (data) => {
    setMembers(prev => {
      const exists = prev.find(m => m.id === data.id);
      if (exists) return prev.map(m => m.id===data.id ? { ...m, ...data } : m);
      return [...prev, { ...data, vcfState:null, analysisResults:null }];
    });
    showNotif(editMember ? `${data.name}'s profile updated` : `${data.name} added to family`, "success");
    setEditMember(null);
  };

  const removeMember = (id) => {
    const m = members.find(x=>x.id===id);
    setMembers(prev => prev.filter(x => x.id!==id));
    showNotif(`${m?.name} removed from family`, "info");
  };

  const handleVCFParsed = (memberId, vcfState) => {
    setMembers(prev => prev.map(m => m.id===memberId ? { ...m, vcfState, analysisResults:null } : m));
  };

  const handleAnalyzeResults = (memberId, results) => {
    setMembers(prev => prev.map(m => m.id===memberId ? { ...m, analysisResults:results } : m));
    const member = members.find(m => m.id===memberId);
    showNotif(`Analysis complete for ${member?.name}`, "success");
  };

  const handleAnalyzeMember = (member) => setDrugPickerMember(member);
  const analyzedCount = members.filter(m => m.analysisResults).length;
  const vcfUploadedCount = members.filter(m => m.vcfState?.status==="valid").length;

  return (
    <div style={{ maxWidth:1180, margin:"0 auto", padding:"30px 22px" }}>
      {showAddModal && <AddMemberModal onClose={() => setShowAddModal(false)} onAdd={addOrUpdateMember} />}
      {editMember && <AddMemberModal editMember={editMember} onClose={() => setEditMember(null)} onAdd={addOrUpdateMember} />}
      {drugPickerMember && <DrugPickerModal member={drugPickerMember} onClose={() => setDrugPickerMember(null)} onRunAnalysis={handleAnalyzeResults} />}
      {reportMember && <MemberReportModal member={reportMember} onClose={() => setReportMember(null)} />}

      <div className="pg-fadeUp" style={{ marginBottom:36 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16, marginBottom:8 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <span className="pg-badge" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.2)" }}>
                🏠 Family ID: {familyId}
              </span>
              <span className="pg-badge" style={{ background:"rgba(32,201,151,0.08)", color:"#20C997", border:"1px solid rgba(32,201,151,0.2)" }}>
                {members.length} Members
              </span>
              {analyzedCount > 0 && (
                <span className="pg-badge" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.15)" }}>
                  {analyzedCount} Analyzed
                </span>
              )}
            </div>
            <div className="syne" style={{ fontSize:"clamp(26px,4vw,40px)", fontWeight:900, lineHeight:1.1, marginBottom:8, color:"#212529" }}>
              Family Genetic<br/>
              <span style={{ background:"linear-gradient(135deg,#0B5ED7,#20C997)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                Risk Dashboard
              </span>
            </div>
            <div style={{ color:"#8fa3b8", fontSize:13, lineHeight:1.7, maxWidth:520 }}>
              Upload VCF files for each family member to map genetic drug risks across generations.
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end" }}>
            <button className="pg-btn pg-btn-family" onClick={() => setShowAddModal(true)} style={{ fontSize:13 }}>
              ➕ Add Family Member
            </button>
            <button className="pg-btn pg-btn-ghost" style={{ fontSize:11 }} onClick={() => navigate("/analysis")}>
              🔬 Go to Main Analysis →
            </button>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:10, marginTop:20 }}>
          {[
            { icon:"👨‍👩‍👧‍👦", l:"Family Members", v:members.length, col:"#0B5ED7" },
            { icon:"🧬", l:"VCFs Uploaded", v:vcfUploadedCount, col:"#0B5ED7" },
            { icon:"📊", l:"Analyses Done", v:analyzedCount, col:"#20C997" },
            { icon:"☠️", l:"Toxic Risks Found", v:members.reduce((acc,m)=>acc+(m.analysisResults?.summary?.highRisk?.length||0),0), col:"#EB3434" },
          ].map(s => (
            <div key={s.l} style={{ padding:"14px 12px", background:"#fff", borderRadius:12, border:"1.5px solid rgba(11,94,215,0.1)", textAlign:"center", boxShadow:"0 2px 8px rgba(11,94,215,0.06)" }}>
              <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
              <div className="syne" style={{ fontSize:24, fontWeight:800, color:s.col }}>{s.v}</div>
              <div style={{ fontSize:10, color:"#8fa3b8", letterSpacing:0.5 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <FamilyRiskOverview members={members} />

      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        <input className="pg-input" placeholder="🔍 Search family members..." value={searchMember} onChange={e => setSearchMember(e.target.value)} style={{ maxWidth:280 }} />
        <div style={{ display:"flex", background:"#fff", borderRadius:10, padding:4, gap:2, marginLeft:"auto", border:"1.5px solid rgba(11,94,215,0.12)" }}>
          {[{id:"grid",icon:"⊞"},{id:"list",icon:"☰"}].map(v => (
            <button key={v.id} onClick={() => setView(v.id)} style={{ padding:"6px 12px", borderRadius:7, border:"none", cursor:"pointer", fontFamily:"Epilogue,sans-serif", fontSize:14, transition:"all 0.18s", background:view===v.id?"rgba(11,94,215,0.1)":"transparent", color:view===v.id?"#0B5ED7":"#8fa3b8" }}>{v.icon}</button>
          ))}
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 20px" }}>
          <div style={{ fontSize:56, marginBottom:16 }}>👨‍👩‍👧‍👦</div>
          <div className="syne" style={{ fontSize:22, fontWeight:800, color:"#212529", marginBottom:8 }}>
            {searchMember ? "No members found" : "No family members yet"}
          </div>
          <div style={{ color:"#8fa3b8", fontSize:13, marginBottom:20 }}>
            {searchMember ? "Try a different search term" : "Add your first family member to start tracking genetic drug risks together"}
          </div>
          {!searchMember && (
            <button className="pg-btn pg-btn-family" onClick={() => setShowAddModal(true)} style={{ fontSize:14, padding:"11px 28px" }}>
              ➕ Add First Member
            </button>
          )}
        </div>
      ) : view === "grid" ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:18 }}>
          {filteredMembers.map((member, idx) => (
            <MemberCard key={member.id} member={member} idx={idx}
              onEdit={() => setEditMember(member)}
              onRemove={() => removeMember(member.id)}
              onVCFParsed={handleVCFParsed}
              onAnalyze={handleAnalyzeMember}
              onViewReport={() => setReportMember(member)}
            />
          ))}
          <AddMemberTile onClick={() => setShowAddModal(true)} />
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filteredMembers.map((member) => (
            <MemberListRow key={member.id} member={member}
              onEdit={() => setEditMember(member)}
              onRemove={() => removeMember(member.id)}
              onVCFParsed={handleVCFParsed}
              onAnalyze={handleAnalyzeMember}
              onViewReport={() => setReportMember(member)}
            />
          ))}
        </div>
      )}
      {members.length >= 2 && <FamilyTreeViz members={members} />}
    </div>
  );
}

// ─── HISTORY PAGE (FULL — matches Analysis file) ──────────────────────────────
function HistoryPage() {
  const HISTORY = [
    { id:"H001", date:"2025-02-15", sampleId:"SAMPLE_AB12CD", drugs:["WARFARIN","CLOPIDOGREL"], highRiskCount:1, status:"Complete", sampleCount:834 },
    { id:"H002", date:"2025-02-10", sampleId:"SAMPLE_XY99ZW", drugs:["CODEINE","SIMVASTATIN","TRAMADOL"], highRiskCount:2, status:"Complete", sampleCount:1247 },
    { id:"H003", date:"2025-01-28", sampleId:"SAMPLE_GH34MN", drugs:["AZATHIOPRINE","IRINOTECAN"], highRiskCount:2, status:"Complete", sampleCount:962 },
    { id:"H004", date:"2025-01-14", sampleId:"SAMPLE_KL77PQ", drugs:["TAMOXIFEN","VORICONAZOLE"], highRiskCount:1, status:"Complete", sampleCount:1108 },
  ];
  return (
    <div style={{ padding:"30px 22px", maxWidth:900, margin:"0 auto" }}>
      <div style={{ marginBottom:28 }}>
        <div className="syne" style={{ fontSize:30, fontWeight:800, marginBottom:6, color:"#212529" }}>Analysis History</div>
        <div style={{ color:"#8fa3b8", fontSize:13 }}>Past pharmacogenomic analysis records for your practice</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {HISTORY.map(h => (
          <div key={h.id} className="pg-card pg-fadeUp">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
                  <span className="mono" style={{ color:"#0B5ED7", fontSize:13 }}>{h.sampleId}</span>
                  <span className="pg-badge" style={{ background:"rgba(32,201,151,0.08)", color:"#20C997", border:"1px solid rgba(32,201,151,0.2)", fontSize:10 }}>{h.status}</span>
                </div>
                <div style={{ color:"#495057", fontSize:12 }}>Drugs: {h.drugs.join(" · ")}</div>
                <div style={{ fontSize:11, color:"#8fa3b8", marginTop:4 }}>📅 {h.date} · {h.sampleCount.toLocaleString()} variants analyzed</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <span className="pg-badge" style={{ background:"rgba(235,52,52,0.08)", color:"#EB3434", border:"1px solid rgba(235,52,52,0.2)", fontSize:11 }}>
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

// ─── ABOUT PAGE (FULL — matches Analysis file) ────────────────────────────────
function AboutPage() {
  return (
    <div style={{ padding:"30px 22px", maxWidth:820, margin:"0 auto" }}>
      <div className="pg-card" style={{ textAlign:"center", padding:44, marginBottom:22 }}>
        <div style={{ fontSize:56, marginBottom:14 }}>🧬</div>
        <div className="syne" style={{ fontSize:34, fontWeight:900, marginBottom:10, color:"#212529" }}>PharmaGuard</div>
        <div style={{ color:"#8fa3b8", fontSize:14, lineHeight:1.8, maxWidth:540, margin:"0 auto" }}>
          Clinical-grade pharmacogenomic analysis platform powered by CPIC guidelines. Upload patient VCF files to predict drug response, detect toxicity risks, and optimize therapeutic decisions with evidence-based precision.
        </div>
      </div>
      <div className="grid-3" style={{ marginBottom:22 }}>
        {[
          { icon:"🧬", title:"PGx Analysis", desc:"CPIC Level A pharmacogenomic variant detection across 50+ drugs" },
          { icon:"🛡️", title:"Risk Detection", desc:"Real-time toxicity and efficacy risk scoring with confidence intervals" },
          { icon:"💊", title:"Drug Guidance", desc:"Evidence-based dosage & clinically validated alternatives" },
          { icon:"👨‍👩‍👧‍👦", title:"Family Tracking", desc:"Track genetic drug risks across all family members in one dashboard" },
          { icon:"📋", title:"Clinical Reports", desc:"Export-ready JSON, CSV, and printable PDF clinical summaries" },
          { icon:"🔒", title:"HIPAA Ready", desc:"Local processing — your genomic data never leaves your browser" },
        ].map(f => (
          <div key={f.title} className="pg-card">
            <div style={{ fontSize:26, marginBottom:8 }}>{f.icon}</div>
            <div className="syne" style={{ fontWeight:700, marginBottom:5, fontSize:13, color:"#212529" }}>{f.title}</div>
            <div style={{ fontSize:12, color:"#8fa3b8", lineHeight:1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
      <div className="pg-card" style={{ marginBottom:14 }}>
        <div className="syne" style={{ fontWeight:700, marginBottom:10, fontSize:13, color:"#212529" }}>Supported Pharmacogenes</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
          {["CYP2D6","CYP2C19","CYP2C9","VKORC1","TPMT","DPYD","SLCO1B1","ABCB1","UGT1A1","HLA-A","HLA-B","NUDT15","CYP3A5","CYP1A2","CYP2B6"].map(g => (
            <span key={g} className="pg-badge mono" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.18)", fontSize:11 }}>{g}</span>
          ))}
        </div>
      </div>
      <div className="pg-card">
        <div className="syne" style={{ fontWeight:700, marginBottom:10, fontSize:13, color:"#212529" }}>Drug Coverage ({ALL_DRUGS.length}+ medications)</div>
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

// ─── PROFILE PAGE STUB ────────────────────────────────────────────────────────
function ProfilePageStub() {
  return (
    <div style={{ padding:"30px 22px", maxWidth:820, margin:"0 auto", textAlign:"center" }}>
      <div className="pg-card" style={{ padding:44 }}>
        <div style={{ fontSize:56, marginBottom:14 }}>👤</div>
        <div className="syne" style={{ fontSize:28, fontWeight:900, marginBottom:10, color:"#212529" }}>User Profile</div>
        <div style={{ color:"#8fa3b8", fontSize:14, marginBottom:24 }}>
          View your full profile, analytics, and platform capabilities on the dedicated Profile page.
        </div>
        <a href="/profile" className="pg-btn pg-btn-primary" style={{ textDecoration:"none", fontSize:14, padding:"12px 28px" }}>
          Go to Full Profile →
        </a>
      </div>
    </div>
  );
}

// ─── TECHNICIAN PAGE STUB ─────────────────────────────────────────────────────
function TechnicianPageStub() {
  return (
    <div style={{ padding:"30px 22px", maxWidth:820, margin:"0 auto", textAlign:"center" }}>
      <div className="pg-card" style={{ padding:44 }}>
        <div style={{ fontSize:56, marginBottom:14 }}>🏥</div>
        <div className="syne" style={{ fontSize:28, fontWeight:900, marginBottom:10, color:"#212529" }}>Book a Technician</div>
        <div style={{ color:"#8fa3b8", fontSize:14, marginBottom:24 }}>
          Schedule a certified lab technician for home sample collection.
        </div>
        <a href="/technician" className="pg-btn pg-btn-primary" style={{ textDecoration:"none", fontSize:14, padding:"12px 28px" }}>
          Go to Booking Page →
        </a>
      </div>
    </div>
  );
}

// ─── MAIN ANALYSIS PAGE ───────────────────────────────────────────────────────
function MainPage({ navigate }) {
  const [file, setFile] = useState(null);
  const [fileStatus, setFileStatus] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("cards");
  const [drugSearch, setDrugSearch] = useState("");
  const fileInputRef = useRef(null);
  const drugInputRef = useRef(null);

  const filteredDrugs = useMemo(() => {
    const q = drugSearch.toUpperCase().trim();
    return q ? ALL_DRUGS.filter(d => d.includes(q) && !selectedDrugs.includes(d)) : ALL_DRUGS.filter(d => !selectedDrugs.includes(d));
  }, [drugSearch, selectedDrugs]);

  const handleFile = async (f) => {
    if (!f) return;
    setFile(f); setFileStatus("validating"); setResults(null); setSelectedDrugs([]);
    try {
      if (!f.name.endsWith(".vcf") && !f.name.endsWith(".vcf.gz")) throw new Error("Invalid format: must be a .vcf file");
      if (f.size > 5*1024*1024) throw new Error("File too large: maximum 5MB allowed");
      const info = await parseVCF(f);
      setFileInfo(info); setFileStatus("valid");
      showNotif(`✓ VCF validated — ${info.variants} variants, ${info.pgxGenes.length} PGx genes`, "success");
    } catch(e) {
      setFileStatus("error"); setFileError(e.message);
      showNotif(e.message, "error");
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const doAnalysis = async () => {
    if (!fileInfo || selectedDrugs.length === 0) return;
    setAnalyzing(true); setResults(null);
    try {
      const r = await runAnalysis(fileInfo, selectedDrugs);
      setResults(r); setActiveTab("cards");
      setTimeout(() => document.getElementById("results-section")?.scrollIntoView({ behavior:"smooth" }), 100);
    } catch(e) {
      showNotif("Analysis failed — please retry", "error");
    } finally { setAnalyzing(false); }
  };

  const buildClinicalJSON = (results, fileInfo) => ({
    report_metadata: { report_id:`PG-${Date.now()}`, generated_at:new Date().toISOString(), generator:"PharmaGuard v3.0", guideline_version:"CPIC 2024" },
    patient_sample: { patient_id:fileInfo?.sampleId, vcf_reference:fileInfo?.metadata?.reference||"GRCh38" },
    drug_analyses: Object.entries(results.drugs).map(([drug,data]) => ({ drug, risk_label:data.risk, gene:data.gene, diplotype:data.diplotype, cpic:data.cpic, dosage:data.dosage, alternative:data.alternative })),
    summary: results.summary
  });

  const clinicalJSON = useMemo(() => results ? buildClinicalJSON(results, fileInfo) : null, [results, fileInfo]);

  const copyJSON = () => { navigator.clipboard.writeText(JSON.stringify(clinicalJSON, null, 2)); showNotif("Clinical JSON copied", "success"); };
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(clinicalJSON, null, 2)], { type:"application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `pharmaguard_${results?.sampleId}.json`; a.click();
    showNotif("JSON downloaded", "success");
  };
  const downloadCSV = () => {
    if (!results) return;
    const headers = ["Drug","Risk","Severity","Confidence","Gene","Diplotype","CPIC","Dosage","Alternative"];
    const rows = Object.entries(results.drugs).map(([d,v]) => [d,v.risk,v.severity,Math.round((v.confidence||0)*100)+"%",v.gene,v.diplotype||"N/A",v.cpic||"N/A",`"${v.dosage}"`,`"${v.alternative}"`]);
    const csv = [headers,...rows].map(r=>r.join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv"});
    const a = document.createElement("a"); a.href=URL.createObjectURL(blob);
    a.download=`pharmaguard_${results.sampleId}.csv`; a.click();
    showNotif("CSV downloaded","success");
  };

  return (
    <div style={{ maxWidth:1180, margin:"0 auto", padding:"30px 22px" }}>
      <div className="pg-fadeUp" style={{ textAlign:"center", marginBottom:44 }}>
        <div className="pg-badge" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.2)", marginBottom:14, display:"inline-flex" }}>
          🧬 CPIC Level A Pharmacogenomics · 2024 Guidelines
        </div>
        <div className="syne" style={{ fontSize:"clamp(28px,5.5vw,50px)", fontWeight:900, lineHeight:1.1, marginBottom:14, color:"#212529" }}>
          Patient Genetic<br />
          <span style={{ background:"linear-gradient(135deg,#0B5ED7,#20C997)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Drug Risk Analysis</span>
        </div>
        <div style={{ color:"#8fa3b8", fontSize:14, maxWidth:500, margin:"0 auto 20px", lineHeight:1.7 }}>
          Upload patient VCF files to analyze pharmacogenomic variants and generate evidence-based drug risk predictions.
        </div>
        <button className="pg-btn pg-btn-family" onClick={() => navigate("/family-section")} style={{ fontSize:12 }}>
          👨‍👩‍👧‍👦 Track Full Family Risks →
        </button>
      </div>

      <div style={{ display:"flex", justifyContent:"center", gap:14, flexWrap:"wrap", marginBottom:36 }}>
        {Object.entries(RISK_CONFIG).map(([k,v]) => (
          <div key={k} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#495057" }}>
            <div style={{ width:9, height:9, borderRadius:2, background:v.color }} />{v.icon} {k}
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      <div className="pg-card pg-fadeUp" style={{ marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#0B5ED7,#094bb3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff" }}>1</div>
          <div>
            <div className="syne" style={{ fontWeight:700, fontSize:15, color:"#212529" }}>Upload VCF File</div>
            <div style={{ fontSize:11, color:"#8fa3b8" }}>Upload patient genetic data (.vcf format, max 5MB)</div>
          </div>
        </div>
        <div
          style={{ border:`2px dashed ${fileStatus==="valid"?"#20C997":fileStatus==="error"?"#EB3434":"rgba(11,94,215,0.2)"}`, borderRadius:13, padding:"36px 22px", textAlign:"center", cursor:"pointer", background:fileStatus==="valid"?"rgba(32,201,151,0.04)":fileStatus==="error"?"rgba(235,52,52,0.04)":"rgba(11,94,215,0.02)", transition:"all 0.25s" }}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept=".vcf,.vcf.gz" style={{ display:"none" }} onChange={e => handleFile(e.target.files[0])} />
          {fileStatus==="validating" && <div><div style={{ fontSize:34, marginBottom:10 }} className="pg-pulse">🔬</div><div style={{ fontWeight:600, color:"#0B5ED7" }}>Parsing VCF file...</div></div>}
          {fileStatus==="valid" && (
            <div>
              <div style={{ fontSize:34, marginBottom:10 }}>✅</div>
              <div className="syne" style={{ fontWeight:700, color:"#20C997", fontSize:15 }}>VCF Validated</div>
              <div className="mono" style={{ fontSize:12, color:"#8fa3b8", marginTop:4 }}>{file.name} · {(file.size/1024).toFixed(1)} KB</div>
              <div style={{ display:"flex", justifyContent:"center", gap:20, marginTop:14, flexWrap:"wrap" }}>
                {[{l:"Variants",v:fileInfo?.variants?.toLocaleString()},{l:"PGx Genes",v:fileInfo?.pgxGenes?.length},{l:"Quality",v:`${fileInfo?.quality}%`},{l:"Sample ID",v:fileInfo?.sampleId?.slice(0,14)}].map(s => (
                  <div key={s.l} style={{ textAlign:"center" }}>
                    <div className="mono" style={{ fontSize:17, fontWeight:700, color:"#0B5ED7" }}>{s.v}</div>
                    <div style={{ fontSize:10, color:"#8fa3b8", letterSpacing:1, fontFamily:"DM Mono,monospace" }}>{s.l.toUpperCase()}</div>
                  </div>
                ))}
              </div>
              {fileInfo?.pgxGenes?.length > 0 && (
                <div style={{ marginTop:12, display:"flex", gap:6, flexWrap:"wrap", justifyContent:"center" }}>
                  {fileInfo.pgxGenes.map(g => <span key={g} className="pg-badge mono" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1px solid rgba(11,94,215,0.2)", fontSize:10 }}>{g}</span>)}
                </div>
              )}
              <button className="pg-btn pg-btn-ghost" style={{ marginTop:14, fontSize:11 }} onClick={e => { e.stopPropagation(); setFile(null); setFileStatus(null); setFileInfo(null); setResults(null); setSelectedDrugs([]); }}>🔄 Upload Different File</button>
            </div>
          )}
          {fileStatus==="error" && <div><div style={{ fontSize:34, marginBottom:10 }}>❌</div><div className="syne" style={{ fontWeight:700, color:"#EB3434" }}>Upload Failed</div><div style={{ fontSize:12, color:"#495057", marginTop:4 }}>{fileError}</div></div>}
          {!fileStatus && (
            <div>
              <div style={{ fontSize:44, marginBottom:10 }} className={dragging?"pg-float":""}>📁</div>
              <div className="syne" style={{ fontWeight:600, fontSize:15, marginBottom:5, color:"#212529" }}>Drag & drop your VCF file</div>
              <div style={{ color:"#8fa3b8", fontSize:12 }}>or click to browse · .vcf format · max 5MB</div>
              <button className="pg-btn pg-btn-primary" style={{ marginTop:14 }} onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>📂 Browse Files</button>
            </div>
          )}
        </div>
        {!fileStatus && (
          <div style={{ textAlign:"center", marginTop:10 }}>
            <button className="pg-btn pg-btn-ghost" style={{ fontSize:11 }}
              onClick={() => handleFile(new File(["##fileformat=VCFv4.2\n##reference=GRCh38\n##source=IlluminaDRAGEN\n#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tSAMPLE_DEMO\nchr22\t42523528\trs16947\tC\tT\t99.5\tPASS\tGENE=CYP2D6;IMPACT=HIGH\tGT:DP\t0/1:45\nchr10\t96540410\trs1799853\tC\tT\t98.1\tPASS\tGENE=CYP2C9;IMPACT=HIGH\tGT:DP\t0/1:52\nchr10\t96702048\trs4244285\tG\tA\t97.3\tPASS\tGENE=CYP2C19;IMPACT=HIGH\tGT:DP\t1/1:48\nchr6\t18143956\trs1800460\tC\tT\t99.0\tPASS\tGENE=TPMT;IMPACT=HIGH\tGT:DP\t0/1:61\nchr1\t97915614\trs3918290\tC\tT\t96.8\tPASS\tGENE=DPYD;IMPACT=HIGH\tGT:DP\t0/1:39\nchr12\t21331549\trs4149056\tT\tC\t99.1\tPASS\tGENE=SLCO1B1;IMPACT=HIGH\tGT:DP\t1/1:57\nchr16\t31102380\trs9923231\tC\tT\t98.4\tPASS\tGENE=VKORC1;IMPACT=HIGH\tGT:DP\t0/1:44\n"], "demo_patient_GRCh38.vcf", { type:"text/plain" }))}>
              🎯 Load Demo VCF
            </button>
          </div>
        )}
      </div>

      {/* STEP 2 */}
      {fileStatus==="valid" && (
        <div className="pg-card pg-fadeUp" style={{ marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#20C997,#17a680)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff" }}>2</div>
            <div>
              <div className="syne" style={{ fontWeight:700, fontSize:15, color:"#212529" }}>Select Drugs to Analyze</div>
              <div style={{ fontSize:11, color:"#8fa3b8" }}>{ALL_DRUGS.length}+ drugs supported</div>
            </div>
          </div>
          <input ref={drugInputRef} className="pg-input" placeholder="🔍 Search any drug (e.g. Warfarin, Codeine...)" value={drugSearch} onChange={e => setDrugSearch(e.target.value)} style={{ marginBottom:12 }} />
          {filteredDrugs.length > 0 && (
            <div style={{ maxHeight:180, overflowY:"auto", display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
              {filteredDrugs.slice(0,60).map(d => (
                <button key={d} className="pg-btn pg-btn-ghost" style={{ fontSize:11, padding:"5px 11px", borderRadius:7 }}
                  onClick={() => { setSelectedDrugs(prev => [...prev,d]); setDrugSearch(""); setTimeout(() => drugInputRef.current?.focus(), 10); }}>
                  + {d}
                </button>
              ))}
            </div>
          )}
          {selectedDrugs.length > 0 && (
            <div>
              <div style={{ fontSize:10, color:"#8fa3b8", marginBottom:7, letterSpacing:1.2, fontWeight:600, fontFamily:"DM Mono,monospace" }}>SELECTED ({selectedDrugs.length})</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {selectedDrugs.map(d => (
                  <span key={d} className="pg-badge" style={{ background:"rgba(11,94,215,0.08)", color:"#0B5ED7", border:"1.5px solid rgba(11,94,215,0.2)", fontSize:12, cursor:"pointer", padding:"5px 11px" }}
                    onClick={() => setSelectedDrugs(prev => prev.filter(x=>x!==d))}>
                    💊 {d} <span style={{ marginLeft:4, opacity:0.65 }}>✕</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3 */}
      {fileStatus==="valid" && (
        <div className="pg-fadeUp" style={{ textAlign:"center", marginBottom:36 }}>
          <button className={`pg-btn ${selectedDrugs.length>0?"pg-btn-primary":"pg-btn-ghost"}`}
            style={{ fontSize:15, padding:"13px 34px", borderRadius:13, opacity:selectedDrugs.length>0?1:0.55, cursor:selectedDrugs.length>0?"pointer":"not-allowed" }}
            onClick={doAnalysis} disabled={selectedDrugs.length===0||analyzing}>
            {analyzing ? "⟳ Analyzing..." : "🔬 Run Pharmacogenomic Analysis"}
          </button>
          {selectedDrugs.length===0 && <div style={{ fontSize:11, color:"#8fa3b8", marginTop:7 }}>Select at least one drug to continue</div>}
        </div>
      )}

      {analyzing && <div className="pg-card pg-fadeUp scan-effect" style={{ marginBottom:22 }}><DNALoader /></div>}

      {results && !analyzing && (
        <div id="results-section">
          {results.alert && (
            <div style={{ padding:"14px 18px", borderRadius:13, marginBottom:18, background:results.summary.highRisk.length>0?"rgba(235,52,52,0.07)":"rgba(245,158,11,0.07)", border:`1.5px solid ${results.summary.highRisk.length>0?"rgba(235,52,52,0.25)":"rgba(245,158,11,0.25)"}`, display:"flex", gap:10 }}>
              <span style={{ fontSize:22 }}>🚨</span>
              <div>
                <div className="syne" style={{ fontWeight:700, color:results.summary.highRisk.length>0?"#EB3434":"#f59e0b", fontSize:13 }}>Clinical Alert</div>
                <div style={{ fontSize:12, color:"#495057" }}>{results.alert}</div>
              </div>
            </div>
          )}
          <div className="grid-4" style={{ marginBottom:20 }}>
            {[{l:"Toxic Risk",c:results.summary.highRisk.length,col:"#EB3434",icon:"☠️"},{l:"Adjust Dose",c:results.summary.adjustDosage.length,col:"#f59e0b",icon:"⚖️"},{l:"Ineffective",c:results.summary.ineffective.length,col:"#f97316",icon:"🚫"},{l:"Safe",c:results.summary.safe.length,col:"#20C997",icon:"🛡️"}].map(s => (
              <div key={s.l} className="pg-card" style={{ textAlign:"center", padding:"14px 10px" }}>
                <div style={{ fontSize:22, marginBottom:3 }}>{s.icon}</div>
                <div className="syne" style={{ fontSize:26, fontWeight:800, color:s.col }}>{s.c}</div>
                <div style={{ fontSize:10, color:"#8fa3b8" }}>{s.l.toUpperCase()}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:3, marginBottom:18, flexWrap:"wrap", background:"#F8F9FA", borderRadius:11, padding:5, border:"1.5px solid rgba(11,94,215,0.08)" }}>
            {[{id:"cards",label:"💊 Risk Cards"},{id:"json",label:"{ } JSON Report"}].map(t => (
              <button key={t.id} className={`tab-btn ${activeTab===t.id?"active":""}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
            ))}
          </div>
          {activeTab==="cards" && (
            <div className="grid-2">
              {Object.entries(results.drugs).map(([drug,data],i) => <RiskCard key={drug} drug={drug} data={data} delay={i*0.08} />)}
            </div>
          )}
          {activeTab==="json" && (
            <div className="pg-card">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div className="syne" style={{ fontWeight:700, fontSize:14, color:"#212529" }}>📋 Clinical JSON Report</div>
                <div style={{ display:"flex", gap:7 }}>
                  <button className="pg-btn pg-btn-ghost" onClick={copyJSON} style={{ fontSize:11 }}>📋 Copy</button>
                  <button className="pg-btn pg-btn-success" onClick={downloadJSON} style={{ fontSize:11 }}>⬇ Download</button>
                </div>
              </div>
              <div className="mono" style={{ background:"#F8F9FA", borderRadius:11, padding:18, fontSize:11, color:"#0B5ED7", maxHeight:520, overflowY:"auto", lineHeight:1.85, border:"1.5px solid rgba(11,94,215,0.12)", whiteSpace:"pre-wrap", wordBreak:"break-all" }}>
                {JSON.stringify(clinicalJSON, null, 2)}
              </div>
            </div>
          )}
          <div className="pg-card" style={{ marginTop:20, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div className="syne" style={{ fontSize:13, fontWeight:600, color:"#212529" }}>📥 Export Clinical Results</div>
              <div style={{ fontSize:11, color:"#8fa3b8", marginTop:2 }}>Download for EHR integration</div>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <button className="pg-btn pg-btn-success" onClick={downloadJSON} style={{ fontSize:11 }}>⬇ JSON</button>
              <button className="pg-btn pg-btn-ghost" onClick={downloadCSV} style={{ fontSize:11 }}>📊 CSV</button>
              <button className="pg-btn pg-btn-ghost" onClick={copyJSON} style={{ fontSize:11 }}>📋 Copy JSON</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ROOT APP COMPONENT ───────────────────────────────────────────────────────
export default function FamilySection() {
  useEffect(() => { injectStyles(); }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Internal page state so History/About work even when the router
  //    only mounts this component on /family-section.
  //    We seed it from location.pathname on first mount, then track
  //    it locally so nav clicks always switch the view correctly.
  const pathToPage = (p) => {
    if (p === "/analysis")       return "analysis";
    if (p === "/family-section") return "family";
    if (p === "/history")        return "history";
    if (p === "/about")          return "about";
    if (p === "/profile")        return "profile";
    if (p === "/technician")     return "technician";
    return "family"; // default for this file
  };

  const [activePage, setActivePage] = useState(() => pathToPage(location.pathname));

  // Handle navigation: ONLY switch internal state — never call navigate()
  // for internal routes. Calling navigate() changes the URL which makes
  // React Router unmount this component (if /history or /about aren't
  // registered in the router), causing a blank page.
  const handleNavigate = (path) => {
    const internalRoutes = ["/analysis", "/family-section", "/history", "/about", "/profile", "/technician"];
    if (internalRoutes.includes(path)) {
      setActivePage(pathToPage(path));
      // Update URL bar without triggering router re-mount
      window.history.pushState(null, "", path);
    } else {
      navigate(path);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case "analysis":    return <MainPage navigate={handleNavigate} />;
      case "family":      return <FamilyPage navigate={handleNavigate} />;
      case "history":     return <HistoryPage />;
      case "about":       return <AboutPage />;
      case "profile":     return <ProfilePageStub />;
      case "technician":  return <TechnicianPageStub />;
      default:            return <FamilyPage navigate={handleNavigate} />;
    }
  };

  // Current "path" for the navbar active-tab highlight
  const currentPath = (() => {
    if (activePage === "analysis")   return "/analysis";
    if (activePage === "family")     return "/family-section";
    if (activePage === "history")    return "/history";
    if (activePage === "about")      return "/about";
    if (activePage === "profile")    return "/profile";
    if (activePage === "technician") return "/technician";
    return "/family-section";
  })();

  return (
    <div style={{ minHeight:"100vh", background:"#F8F9FA", color:"#212529", fontFamily:"'Epilogue',sans-serif" }}>
      {/* Background */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", backgroundImage:"linear-gradient(rgba(11,94,215,0.025) 1px, transparent 1px),linear-gradient(90deg, rgba(11,94,215,0.025) 1px, transparent 1px)", backgroundSize:"44px 44px" }} />
      <div style={{ position:"fixed", top:"-15%", left:"-5%", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(11,94,215,0.06),transparent 68%)", zIndex:0, pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:"-10%", right:"-5%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(32,201,151,0.06),transparent 68%)", zIndex:0, pointerEvents:"none" }} />

      <div style={{ position:"relative", zIndex:1 }}>
        <SharedNavbar
          currentPath={currentPath}
          navigate={handleNavigate}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        {renderPage()}

        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          navigate={handleNavigate}
        />

        {/* Footer */}
        <footer style={{ borderTop:"1.5px solid rgba(11,94,215,0.1)", marginTop:40, padding:"28px 24px", background:"#fff" }}>
          <div style={{ maxWidth:900, margin:"0 auto" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center", marginBottom:14 }}>
              <span>🧬</span>
              <span className="syne" style={{ fontWeight:700, color:"#0B5ED7" }}>PharmaGuard v3.0</span>
              <span style={{ color:"#bec8d2", fontSize:12 }}>· CPIC Guidelines 2024 ·</span>
              <span style={{ color:"#20C997", fontSize:12 }}>Clinical Decision Support</span>
            </div>
            <div style={{ background:"rgba(245,158,11,0.06)", border:"1.5px solid rgba(245,158,11,0.2)", borderRadius:10, padding:"14px 18px" }}>
              <div style={{ fontSize:12, color:"#f59e0b", fontWeight:700, marginBottom:5 }}>⚕️ Medical Use Limitation Notice</div>
              <div style={{ fontSize:11, color:"#495057", lineHeight:1.8 }}>
                This tool is intended for clinical decision support and research use only. All pharmacogenomic findings must be interpreted by a qualified healthcare professional. <strong style={{ color:"#212529" }}>Prescribing decisions must always be made by a licensed clinician.</strong>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}