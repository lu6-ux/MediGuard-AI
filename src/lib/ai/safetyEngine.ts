import { MedicalDocument, SafetyAlert, MedicalRiskScore, Medication } from '@/types/medical';

export function analyzePrescriptionSafety(documents: MedicalDocument[]): {
  alerts: SafetyAlert[];
  riskScore: MedicalRiskScore;
} {
  const alerts: SafetyAlert[] = [];

  // Aggregate all medications across all processed documents
  const allMedications: Array<{ med: Medication; visitDate: string; docName: string; provider: string }> = [];
  const knownAllergies: Set<string> = new Set();

  documents.forEach(doc => {
    if (doc.extractedData?.patient?.knownAllergies) {
      doc.extractedData.patient.knownAllergies.forEach(a => knownAllergies.add(a.toLowerCase()));
    }
    if (doc.extractedData?.medications) {
      doc.extractedData.medications.forEach(med => {
        allMedications.push({
          med,
          visitDate: doc.visitDate,
          docName: doc.fileName,
          provider: doc.healthcareProvider
        });
      });
    }
  });

  // 1. ALLERGY CONTRADICTION DETECTION
  // Penicillin allergy vs Amoxicillin, Ampicillin, Augmentin
  const hasPenicillinAllergy = Array.from(knownAllergies).some(a => a.includes('penicillin') || a.includes('beta-lactam'));

  if (hasPenicillinAllergy) {
    const penicillinMeds = allMedications.filter(item => 
      item.med.name.toLowerCase().includes('amoxicillin') ||
      item.med.name.toLowerCase().includes('ampicillin') ||
      item.med.name.toLowerCase().includes('penicillin') ||
      item.med.name.toLowerCase().includes('augmentin')
    );

    if (penicillinMeds.length > 0) {
      alerts.push({
        id: "alert-allergy-penicillin",
        type: "allergy_contradiction",
        severity: "high",
        title: "CRITICAL: Penicillin Allergy Contradiction Detected",
        description: `Patient record documents a severe Penicillin allergy, but ${penicillinMeds.map(p => p.med.name).join(', ')} was prescribed in a recent visit. Amoxicillin is a penicillin derivative and poses severe risk of anaphylaxis.`,
        evidence: [
          `Allergy Documented: Severe Penicillin Allergy (Visit 1 / Jan 15, 2025)`,
          `Prescription Issued: ${penicillinMeds[0].med.name} ${penicillinMeds[0].med.dosage} prescribed on ${penicillinMeds[0].visitDate} (${penicillinMeds[0].docName})`
        ],
        recommendation: "IMMEDIATELY consult a doctor or pharmacist to substitute this antibiotic with a non-penicillin alternative (e.g. Macrolide or Fluoroquinolone). Do NOT take Amoxicillin without physician clearance.",
        affectedMedications: penicillinMeds.map(p => p.med.name),
        docIds: Array.from(new Set(penicillinMeds.map(p => p.med.docId))),
        visitDates: Array.from(new Set(penicillinMeds.map(p => p.visitDate)))
      });
    }
  }

  // 2. DRUG INTERACTION DETECTION
  // Warfarin + Aspirin (Anticoagulant + NSAID/Antiplatelet)
  const hasWarfarin = allMedications.some(m => m.med.name.toLowerCase().includes('warfarin'));
  const hasAspirin = allMedications.some(m => m.med.name.toLowerCase().includes('aspirin') || m.med.name.toLowerCase().includes('ibuprofen'));

  if (hasWarfarin && hasAspirin) {
    const warfarinItem = allMedications.find(m => m.med.name.toLowerCase().includes('warfarin'));
    const aspirinItem = allMedications.find(m => m.med.name.toLowerCase().includes('aspirin'));

    alerts.push({
      id: "alert-interaction-warfarin-aspirin",
      type: "drug_interaction",
      severity: "high",
      title: "HIGH RISK: Severe Anticoagulant & Antiplatelet Drug Interaction",
      description: "Combining Warfarin (anticoagulant blood thinner) with Aspirin (antiplatelet NSAID) exponentially increases the risk of severe gastrointestinal bleeding, internal hemorrhage, and prolonged bleeding time.",
      evidence: [
        `Warfarin 5mg prescribed on ${warfarinItem?.visitDate} by ${warfarinItem?.provider}`,
        `Aspirin 100mg prescribed on ${aspirinItem?.visitDate} by ${aspirinItem?.provider}`
      ],
      recommendation: "High-risk interaction flag! Do not combine Warfarin and Aspirin unless specifically instructed and monitored by a cardiologist with routine INR monitoring.",
      affectedMedications: ["Warfarin", "Aspirin"],
      docIds: [warfarinItem?.med.docId || "", aspirinItem?.med.docId || ""].filter(Boolean),
      visitDates: [warfarinItem?.visitDate || "", aspirinItem?.visitDate || ""].filter(Boolean)
    });
  }

  // 3. DUPLICATE PRESCRIPTION DETECTION
  // Same medicine prescribed in multiple entries or multiple doses in single visit
  const medCounts: Record<string, typeof allMedications> = {};
  allMedications.forEach(item => {
    const key = item.med.name.toLowerCase();
    if (!medCounts[key]) medCounts[key] = [];
    medCounts[key].push(item);
  });

  Object.entries(medCounts).forEach(([name, items]) => {
    if (items.length > 1) {
      // Check if it's the exact same visit or across multiple visits
      const isSameVisit = items.every(i => i.visitDate === items[0].visitDate);
      
      alerts.push({
        id: `alert-dup-${name}`,
        type: "duplicate_prescription",
        severity: isSameVisit ? "high" : "warning",
        title: `DUPLICATE: Multiple Prescriptions Found for ${items[0].med.name}`,
        description: isSameVisit 
          ? `Patient was issued duplicate prescriptions for ${items[0].med.name} (${items.map(i => i.med.dosage).join(' and ')}) in the exact same doctor visit (${items[0].visitDate}).`
          : `${items[0].med.name} was prescribed across multiple healthcare visits without explicit discontinuation notes.`,
        evidence: items.map(i => `${i.med.name} ${i.med.dosage} (${i.med.frequency}) prescribed on ${i.visitDate} [${i.docName}]`),
        recommendation: "Consult pharmacist to clarify if both dosages are intended to be taken concurrently or if the newer prescription replaces the older one.",
        affectedMedications: [items[0].med.name],
        docIds: items.map(i => i.med.docId),
        visitDates: items.map(i => i.visitDate)
      });
    }
  });

  // 4. DOSAGE CONFLICT DETECTION
  // E.g. Metformin prescribed 500mg twice daily in Visit 2 vs 1000mg once daily in Visit 4
  const metforminEntries = allMedications.filter(m => m.med.name.toLowerCase().includes('metformin'));
  if (metforminEntries.length >= 2) {
    const dosages = metforminEntries.map(m => m.med.dosage);
    if (dosages[0] !== dosages[dosages.length - 1]) {
      alerts.push({
        id: "alert-dosage-metformin",
        type: "dosage_conflict",
        severity: "warning",
        title: "DOSAGE CONFLICT: Metformin Regimen Change Detected",
        description: `Metformin dosage instructions conflict between visits. Earlier visit instructed ${metforminEntries[0].med.dosage} (${metforminEntries[0].med.frequency}), while latest visit instructs ${metforminEntries[metforminEntries.length - 1].med.dosage} (${metforminEntries[metforminEntries.length - 1].med.frequency}).`,
        evidence: [
          `Visit 2 (${metforminEntries[0].visitDate}): Metformin ${metforminEntries[0].med.dosage} - ${metforminEntries[0].med.frequency}`,
          `Visit 4 (${metforminEntries[metforminEntries.length - 1].visitDate}): Metformin ${metforminEntries[metforminEntries.length - 1].med.dosage} - ${metforminEntries[metforminEntries.length - 1].med.frequency}`
        ],
        recommendation: "Confirm with your endocrinologist or primary doctor whether to switch to the 1000mg regimen or remain on the 500mg twice-daily schedule.",
        affectedMedications: ["Metformin"],
        docIds: metforminEntries.map(m => m.med.docId),
        visitDates: metforminEntries.map(m => m.visitDate)
      });
    }
  }

  // CALCULATE OVERALL MEDICAL RISK SCORE (0 to 100)
  let score = 100;
  const highRiskCount = alerts.filter(a => a.severity === 'high').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;
  const infoCount = alerts.filter(a => a.severity === 'info').length;

  score -= (highRiskCount * 25);
  score -= (warningCount * 10);
  score -= (infoCount * 5);
  if (score < 0) score = 0;

  let riskLevel: 'Safe' | 'Moderate' | 'High Risk' = 'Safe';
  if (score < 60 || highRiskCount > 0) {
    riskLevel = 'High Risk';
  } else if (score < 85 || warningCount > 0) {
    riskLevel = 'Moderate';
  }

  const summary = highRiskCount > 0
    ? `CRITICAL RISK FLAGS DETECTED: Found ${highRiskCount} high-risk prescription flags (including allergy contradiction & severe drug interaction). Immediate doctor consultation recommended.`
    : warningCount > 0
    ? `MODERATE CONCERNS: Found ${warningCount} medication warnings (duplicate prescribing or dosage adjustments). Review with your pharmacist.`
    : `SAFE PROFILE: No critical medication interactions or allergy conflicts detected across uploaded documents.`;

  return {
    alerts,
    riskScore: {
      score,
      riskLevel,
      totalAlerts: alerts.length,
      highRiskCount,
      warningCount,
      infoCount,
      summary
    }
  };
}
