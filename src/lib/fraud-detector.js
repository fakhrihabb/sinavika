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
  MEDICAL_EXCESSIVE_PROCEDURES: {
    code: 'MEDICAL_03',
    description: 'Jumlah prosedur/tindakan berlebihan untuk diagnosis dan lama rawat yang ada.',
    severity: 'MEDIUM',
    score: 20,
  },
};

// ICD-10 Chapter Mapping (first letter of code)
const ICD10_CHAPTERS = {
  'A': 'infectious', 'B': 'infectious',
  'C': 'neoplasm', 'D': 'blood',
  'E': 'endocrine',
  'F': 'mental',
  'G': 'nervous',
  'H': 'eye_ear',
  'I': 'circulatory',
  'J': 'respiratory',
  'K': 'digestive',
  'L': 'skin',
  'M': 'musculoskeletal',
  'N': 'genitourinary',
  'O': 'pregnancy',
  'P': 'perinatal',
  'Q': 'congenital',
  'R': 'symptoms',
  'S': 'injury', 'T': 'injury',
  'V': 'external', 'W': 'external', 'X': 'external', 'Y': 'external',
  'Z': 'health_status'
};

// ICD-9-CM Procedure Categories (based on code ranges)
const ICD9_PROCEDURE_CATEGORIES = {
  // Cardiovascular procedures (35-39)
  cardiovascular: ['35', '36', '37', '38', '39'],
  // Digestive system (42-54)
  digestive: ['42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54'],
  // Respiratory (30-34)
  respiratory: ['30', '31', '32', '33', '34'],
  // Nervous system (01-05)
  nervous: ['01', '02', '03', '04', '05'],
  // Musculoskeletal (76-84)
  musculoskeletal: ['76', '77', '78', '79', '80', '81', '82', '83', '84'],
  // Genitourinary (55-71)
  genitourinary: ['55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71'],
  // Obstetric (72-75)
  obstetric: ['72', '73', '74', '75'],
  // Eye (08-16)
  eye: ['08', '09', '10', '11', '12', '13', '14', '15', '16'],
  // Ear (18-20)
  ear: ['18', '19', '20'],
  // Diagnostic/imaging (87-88)
  diagnostic: ['87', '88'],
  // Therapeutic (93-99)
  therapeutic: ['93', '94', '95', '96', '97', '98', '99']
};

// Compatible diagnosis-procedure category pairs
const COMPATIBLE_PAIRS = {
  'respiratory': ['respiratory', 'diagnostic', 'therapeutic'],
  'circulatory': ['cardiovascular', 'diagnostic', 'therapeutic'],
  'digestive': ['digestive', 'diagnostic', 'therapeutic'],
  'nervous': ['nervous', 'diagnostic', 'therapeutic'],
  'musculoskeletal': ['musculoskeletal', 'diagnostic', 'therapeutic'],
  'genitourinary': ['genitourinary', 'diagnostic', 'therapeutic'],
  'pregnancy': ['obstetric', 'diagnostic', 'therapeutic'],
  'infectious': ['diagnostic', 'therapeutic'], // Infectious diseases rarely need surgery
  'endocrine': ['diagnostic', 'therapeutic'],
  'skin': ['diagnostic', 'therapeutic'],
  'injury': ['musculoskeletal', 'nervous', 'cardiovascular', 'diagnostic', 'therapeutic'], // Injuries can affect multiple systems
  'symptoms': ['diagnostic', 'therapeutic'], // Symptoms need diagnosis
};

// Get procedure category from ICD-9-CM code
function getProcedureCategory(icd9Code) {
  if (!icd9Code) return 'unknown';

  // Extract first 2 digits
  const prefix = icd9Code.split('.')[0].substring(0, 2);

  for (const [category, prefixes] of Object.entries(ICD9_PROCEDURE_CATEGORIES)) {
    if (prefixes.includes(prefix)) {
      return category;
    }
  }

  return 'unknown';
}

// Get diagnosis category from ICD-10 code
function getDiagnosisCategory(icd10Code) {
  if (!icd10Code) return 'unknown';
  const chapter = icd10Code.charAt(0).toUpperCase();
  return ICD10_CHAPTERS[chapter] || 'unknown';
}

// Check if diagnosis-procedure pair is compatible
function isProcedureCompatible(diagnosisCategory, procedureCategory) {
  // Unknown categories are allowed (benefit of doubt)
  if (diagnosisCategory === 'unknown' || procedureCategory === 'unknown') return true;

  const compatibleCategories = COMPATIBLE_PAIRS[diagnosisCategory] || [];
  return compatibleCategories.includes(procedureCategory);
}


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

  // Check for diagnosis-procedure category mismatches
  if (primaryDiagnosis && procedures.length > 0) {
    const diagnosisCategory = getDiagnosisCategory(primaryDiagnosis.icd10_code);

    console.log(`[Fraud Check] Primary diagnosis: ${primaryDiagnosis.diagnosis_name} (${primaryDiagnosis.icd10_code}) -> Category: ${diagnosisCategory}`);

    procedures.forEach(proc => {
      const procedureCategory = getProcedureCategory(proc.icd9cm_code);
      console.log(`[Fraud Check] Procedure: ${proc.procedure_name} (${proc.icd9cm_code}) -> Category: ${procedureCategory}`);

      // Skip diagnostic/therapeutic procedures - they're usually compatible
      if (procedureCategory === 'diagnostic' || procedureCategory === 'therapeutic') {
        return; // Continue to next procedure
      }

      // Check compatibility
      if (!isProcedureCompatible(diagnosisCategory, procedureCategory)) {
        const issue = { ...RULES.MEDICAL_UPCODING_SUSPICION };
        issue.description = `Kombinasi diagnosa ${primaryDiagnosis.diagnosis_name} (kategori: ${diagnosisCategory}) dengan prosedur ${proc.procedure_name} (kategori: ${procedureCategory}) mencurigakan - tidak sesuai dengan sistem organ yang sama.`;
        issues.push(issue);
      }
    });
  }

  // Check for excessive procedures
  const los = claim.los_days || claim.dataRawat?.losHari || 1;
  const majorProcedureCount = procedures.filter(proc => {
    const category = getProcedureCategory(proc.icd9cm_code);
    // Count non-diagnostic, non-therapeutic procedures as "major"
    return category !== 'diagnostic' && category !== 'therapeutic' && category !== 'unknown';
  }).length;

  // Rule: More than 2 major surgical procedures in short stay (<=3 days) is suspicious
  if (majorProcedureCount >= 3 && los <= 3) {
    const issue = { ...RULES.MEDICAL_EXCESSIVE_PROCEDURES };
    issue.description = `${majorProcedureCount} prosedur bedah mayor dilakukan dalam ${los} hari rawat inap - kemungkinan unbundling atau prosedur tidak perlu.`;
    issues.push(issue);
  }

  // Rule: Total procedures (including diagnostic) > 8 is excessive for most cases
  if (procedures.length >= 8 && los <= 5) {
    const issue = { ...RULES.MEDICAL_EXCESSIVE_PROCEDURES };
    issue.description = `Total ${procedures.length} prosedur dalam ${los} hari rawat - jumlah tindakan berlebihan.`;
    issues.push(issue);
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
