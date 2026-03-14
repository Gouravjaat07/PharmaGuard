// ═══════════════════════════════════════════════════════════════════════════════
// PharmaGuard — Two-change patch: PARACETAMOL + DISPRIN
// ═══════════════════════════════════════════════════════════════════════════════
//
// HOW TO APPLY
// ─────────────────────────────────────────────────────────────────────────────
// 1.  In your PharmaGuard.jsx, find the ALL_DRUGS declaration and replace the
//     last line "METFORMIN","GLIPIZIDE","GLIMEPIRIDE" with the line below
//     (note the two new entries at the end):
//
//       "METFORMIN","GLIPIZIDE","GLIMEPIRIDE","PARACETAMOL","DISPRIN"
//
// 2.  In DRUG_DATABASE, after the closing brace of the ATORVASTATIN entry,
//     paste the PARACETAMOL and DISPRIN entries shown below (already comma-
//     separated; keep the final comma before the closing }; of DRUG_DATABASE).
// ═══════════════════════════════════════════════════════════════════════════════


// ─── NEW DRUG_DATABASE ENTRIES (paste after ATORVASTATIN block) ───────────────

  PARACETAMOL: {
    // ── Metabolic pathway ─────────────────────────────────────────────────────
    // Primary:  UGT1A1 / UGT1A6 glucuronidation  (~55 %)
    //           SULT1A1 / SULT1A3 sulfation        (~30 %)
    // Minor:    CYP2E1 / CYP3A4 → NAPQI           (~5–10 %)
    //           NAPQI detoxified by GSTP1 / GSTM1 via glutathione conjugation
    // ──────────────────────────────────────────────────────────────────────────
    gene: "CYP2E1 + UGT1A1", diplotype: "*1/*1", phenotype: "NM",
    phenotypeLabel: "Normal Metabolizer",
    risk: "Safe", severity: "none", confidence: 0.78,

    mechanism:
      "Paracetamol (acetaminophen) undergoes hepatic glucuronidation (~55 %) " +
      "via UGT1A1/UGT1A6, sulfation (~30 %) via SULT1A1/SULT1A3, and a minor " +
      "CYP2E1/CYP3A4-mediated oxidation (~5–10 %) to the reactive intermediate " +
      "NAPQI. At therapeutic doses NAPQI is rapidly detoxified by glutathione (GSH) " +
      "conjugation via GSTP1/GSTM1. CYP2E1 promoter variants (rs2031920) can " +
      "modestly alter CYP2E1 inducibility; UGT1A6 rs1799853 may slightly reduce " +
      "glucuronidation throughput — neither variant is clinically significant at " +
      "recommended doses.",

    whyRisk:
      "Your CYP2E1 and UGT1A1 normal metabolizer status predicts standard " +
      "paracetamol pharmacokinetics. Glucuronidation and sulfation capacity is " +
      "sufficient for recommended doses (≤4 g/day in adults). NAPQI production " +
      "remains well within detoxifiable limits. No pharmacogenomic-driven dose " +
      "adjustment is indicated — standard precautions for hepatic impairment and " +
      "chronic alcohol use apply universally, not based on genotype.",

    cpic: "Not Classified",
    dosage:
      "Max 4 g/day in healthy adults (1 g per dose, every 4–6 h); " +
      "reduce to ≤2 g/day in chronic alcohol users or significant hepatic impairment",
    alternative:
      "No pharmacogenomic-based alternative needed; NSAIDs (ibuprofen/diclofenac) " +
      "are options but carry their own risk profiles",

    variants: [
      {
        rsid: "rs2031920",
        allele: "C>T",
        impact: "LOW",
        gene: "CYP2E1",
        consequence: "5'-flanking — modestly reduces CYP2E1 inducibility; slightly lowers NAPQI formation"
      },
      {
        rsid: "rs1799853",
        allele: "C>T",
        impact: "LOW",
        gene: "UGT1A6",
        consequence: "p.Thr181Ala — minor reduction in UGT1A6-mediated paracetamol glucuronidation"
      }
    ],

    geneImpact: 18,
    references: [
      "PharmGKB PA450128",
      "PMID:22895945",
      "PMID:17895393"
    ],
    category: "Analgesic / Antipyretic"
  },


  DISPRIN: {
    // ── Mechanism note ────────────────────────────────────────────────────────
    // Disprin = Aspirin (acetylsalicylic acid) — NOT a CYP-activated prodrug.
    // Antiplatelet effect = irreversible COX-1 (PTGS1) acetylation → ↓ TXA2.
    // PGx impact is modest compared to prodrugs like clopidogrel.
    // Key variants: PTGS1 rs10306114 (COX-1 promoter), ITGA2B rs5918 (Leu33Pro)
    // ──────────────────────────────────────────────────────────────────────────
    gene: "PTGS1 + CYP2C19", diplotype: "*1/*1", phenotype: "NM",
    phenotypeLabel: "Normal Responder",
    risk: "Safe", severity: "none", confidence: 0.74,

    mechanism:
      "Disprin (aspirin / acetylsalicylic acid) irreversibly acetylates serine-530 " +
      "of COX-1 (PTGS1), permanently blocking thromboxane A2 (TXA2) synthesis and " +
      "platelet aggregation for the ~10-day platelet lifespan. Unlike clopidogrel, " +
      "aspirin is NOT a prodrug — it does not require CYP-mediated bioactivation, so " +
      "CYP2C19 poor metabolizer status does not impair its antiplatelet efficacy. " +
      "CYP2C9 and CYP2C19 modestly influence aspirin ester hydrolysis to salicylate " +
      "but this does not alter COX-1 inhibition. PTGS1 rs10306114 (promoter) affects " +
      "basal COX-1 expression; ITGA2B rs5918 (Leu33Pro) affects the platelet " +
      "fibrinogen receptor GPIIb/IIIa and is weakly linked to variable aspirin response.",

    whyRisk:
      "Your PTGS1 and CYP2C19 normal metabolizer status predicts a standard aspirin " +
      "antiplatelet response. Because aspirin's mechanism is direct irreversible " +
      "COX-1 acetylation — not prodrug activation — your metabolizer genotype has " +
      "minimal impact on antiplatelet efficacy. No pharmacogenomic dose adjustment " +
      "is indicated. Platelet-receptor variants associated with 'aspirin resistance' " +
      "(rs5918, rs10306114) are not clinically actionable per current guidelines.",

    cpic: "Not Classified",
    dosage:
      "Antiplatelet: 75–100 mg/day (low-dose); " +
      "Analgesic/antipyretic: 300–600 mg every 4–6 h (max 4 g/day); " +
      "take with food or milk to reduce GI irritation",
    alternative:
      "No pharmacogenomic-based alternative needed; if switching antiplatelet agents " +
      "consider ticagrelor (no CYP activation required); avoid in children <16 " +
      "(Reye syndrome risk)",

    variants: [
      {
        rsid: "rs5918",
        allele: "T>C",
        impact: "LOW",
        gene: "ITGA2B",
        consequence: "p.Leu33Pro — platelet GPIIb/IIIa fibrinogen receptor variant; weak association with variable aspirin antiplatelet response"
      },
      {
        rsid: "rs10306114",
        allele: "G>A",
        impact: "LOW",
        gene: "PTGS1",
        consequence: "COX-1 promoter — modestly reduces basal COX-1 expression; may influence aspirin sensitivity"
      }
    ],

    geneImpact: 22,
    references: [
      "PharmGKB PA448497",
      "PMID:20442399",
      "PMID:18574025"
    ],
    category: "Analgesic / Antiplatelet (NSAID)"
  },
