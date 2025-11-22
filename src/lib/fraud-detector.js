// src/lib/fraud-detector.js

/**
 * This library contains the core logic for detecting potential fraud in BPJS claims.
 * It operates on a rule-based engine, checking for inconsistencies and anomalies
 * within a single, fully-formed claim object.
 */

// --- Rule Definitions ---
const RULES = {
  // Timeline Inconsistencies (High Severity)
  TIMELINE_SEP_AFTER_DISCHARGE: {
    code: 'TIMELINE_01',
    description: 'Tanggal SEP diterbitkan setelah pasien pulang.',
    severity: 'HIGH',
    score: 40,
  },
  TIMELINE_LAB_OUTSIDE_TREATMENT: {
    code: 'TIMELINE_02',
    description: 'Tanggal pemeriksaan lab berada di luar periode perawatan.',
    severity: 'HIGH',
    score: 30,
  },

  // Patient Data Mismatches (High Severity)
  PATIENT_NAME_MISMATCH: {
    code: 'PATIENT_01',
    description: 'Nama pasien di SEP tidak cocok dengan nama di data klaim utama.',
    severity: 'HIGH',
    score: 50,
  },

  // Medical Coding Anomalies (Medium Severity)
  MEDICAL_UPCODING_SUSPICION: {
    code: 'MEDICAL_01',
    description: 'Kombinasi antara diagnosa dan prosedur tindakan tidak umum (indikasi upcoding).',
    severity: 'MEDIUM',
    score: 25,
  },
  MEDICAL_DIAGNOSIS_INCONSISTENCY: {
    code: 'MEDICAL_02',
    description: 'Diagnosa utama pada resume medis berbeda signifikan dengan diagnosa awal pada SEP.',
    severity: 'LOW',
    score: 10,
  },
};

// Simplified dictionary of highly unlikely Diagnosis-Procedure pairs
const UNLIKELY_PAIRS = {
  // Key: ICD-10 Code (Diagnosis), Value: Array of unlikely ICD-9-CM Codes (Procedures)
  'J00': ['47.11', '47.0'], // Common Cold -> Appendectomy
  'L03': ['36.1'],       // Cellulitis -> Open Heart Surgery
};


// --- Rule Execution Functions ---

/**
 * Checks for chronological inconsistencies in claim dates.
 * @param {object} claim - The detailed claim object.
 * @returns {Array} - An array of fraud issue objects.
 */
function checkTimeline(claim) {
  const issues = [];
  // Dates from the main dataRawat (from resume medis)
  const admissionDate = claim.dataRawat?.tanggalMasuk ? new Date(claim.dataRawat.tanggalMasuk) : null;
  const dischargeDate = claim.dataRawat?.tanggalKeluar ? new Date(claim.dataRawat.tanggalKeluar) : null;
  
  // Date from SEP data
  const sepDate = claim.sep_data?.tglSEP ? new Date(claim.sep_data.tglSEP) : null;
  
  // Date from Lab data
  const labDate = claim.pemeriksaanPenunjang?.laboratorium?.tanggal ? new Date(claim.pemeriksaanPenunjang.laboratorium.tanggal) : null;

  if (sepDate && dischargeDate) {
    if (sepDate > dischargeDate) {
      issues.push(RULES.TIMELINE_SEP_AFTER_DISCHARGE);
    }
  }

  if (labDate && admissionDate && dischargeDate) {
    if (labDate < admissionDate || labDate > dischargeDate) {
      issues.push(RULES.TIMELINE_LAB_OUTSIDE_TREATMENT);
    }
  }

  return issues;
}

/**
 * Checks for inconsistencies in patient master data across documents.
 * @param {object} claim - The detailed claim object.
 * @returns {Array} - An array of fraud issue objects.
 */
function checkPatientData(claim) {
    const issues = [];
    const mainPatientName = claim.patient_name?.trim().toLowerCase();
    const sepPatientName = claim.sep_data?.namaPeserta?.trim().toLowerCase();

    if (mainPatientName && sepPatientName && mainPatientName !== sepPatientName) {
        const issue = {...RULES.PATIENT_NAME_MISMATCH};
        issue.description = `Nama pasien di klaim (${claim.patient_name}) tidak cocok dengan nama di SEP (${claim.sep_data.namaPeserta}).`;
        issues.push(issue);
    }

    return issues;
}


/**
 * Checks for medical coding anomalies like upcoding.
 * @param {object} claim - The detailed claim object.
 * @returns {Array} - An array of fraud issue objects.
 */
function checkMedicalCoding(claim) {
  const issues = [];
  const primaryDiagnosis = claim.diagnoses?.find(d => d.diagnosis_type === 'primary');
  const procedures = claim.procedures || [];

  // Check for suspicious diagnosis-procedure pairs
  if (primaryDiagnosis && procedures.length > 0) {
    const primaryIcd10 = primaryDiagnosis.icd10_code;
    const unlikelyProcedures = UNLIKELY_PAIRS[primaryIcd10] || [];

    procedures.forEach(proc => {
      if (unlikelyProcedures.includes(proc.icd9cm_code)) {
        const issue = { ...RULES.MEDICAL_UPCODING_SUSPICION };
        issue.description = `Kombinasi diagnosa ${primaryDiagnosis.diagnosis_name} (${primaryIcd10}) dengan prosedur ${proc.procedure_name} (${proc.icd9cm_code}) mencurigakan.`;
        issues.push(issue);
      }
    });
  }
  
  // Check inconsistency between initial and final diagnosis
  const initialDiagnosisName = claim.sep_data?.diagnosisAwal?.toLowerCase().trim();
  if (initialDiagnosisName && primaryDiagnosis?.diagnosis_name) {
      const primaryDiagnosisName = primaryDiagnosis.diagnosis_name.toLowerCase().trim();
      
      // Simple check: if the names don't contain each other, flag as low severity issue.
      if (!primaryDiagnosisName.includes(initialDiagnosisName) && !initialDiagnosisName.includes(primaryDiagnosisName)) {
          const issue = { ...RULES.MEDICAL_DIAGNOSIS_INCONSISTENCY };
          issue.description = `Diagnosa awal di SEP (${claim.sep_data.diagnosisAwal}) berbeda dengan diagnosa utama di Resume Medis (${primaryDiagnosis.diagnosis_name}).`;
          issues.push(issue);
      }
  }

  return issues;
}


// --- Main Exported Function ---

/**
 * Analyzes a claim for potential fraud by running it through a set of rules.
 * @param {object} claim - The detailed claim object, including diagnoses, procedures, and documents.
 * @returns {object} - An analysis report containing a list of issues and a confidence score.
 */
export function analyzeClaimForFraud(claim) {
  console.log("🕵️  Running Fraud Analysis on Claim:", claim.id);
  
  let issues = [];

  // Run all rule functions and collect issues
  issues = issues.concat(checkTimeline(claim));
  issues = issues.concat(checkPatientData(claim));
  issues = issues.concat(checkMedicalCoding(claim));
  
  // Remove duplicate issues based on 'code'
  const uniqueIssues = [...new Map(issues.map(item => [item.code, item])).values()];

  // Calculate confidence score
  const totalScore = uniqueIssues.reduce((sum, issue) => sum + issue.score, 0);
  const confidenceScore = Math.min(totalScore, 100); // Cap the score at 100

  console.log(`[Fraud Analysis] Found ${uniqueIssues.length} issues with a total score of ${confidenceScore}`);

  return {
    issues: uniqueIssues,
    confidenceScore: confidenceScore,
    summary: `Ditemukan ${uniqueIssues.length} potensi anomali dengan skor kepercayaan fraud ${confidenceScore}%.`,
  };
}
