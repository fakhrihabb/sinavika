import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { analyzeClaimForFraud } from '@/lib/fraud-detector';
import { promises as fs } from 'fs';
import path from 'path';

// --- HTML Parsing Functions ---

function parseResumeHTML(htmlContent) {
    const data = {};
    const findValue = (regex) => (htmlContent.match(regex) || [])[1]?.trim() || null;

    data.nama = findValue(/<strong>Nama Pasien<\/strong><\/td>\s*<td>([^<]+)<\/td>/);
    data.noBPJS = findValue(/<strong>No. BPJS<\/strong><\/td>\s*<td>([^<]+)<\/td>/);
    data.tanggalMasuk = findValue(/<strong>Tanggal Masuk<\/strong><\/td>\s*<td>([^<,]+)/);
    data.tanggalKeluar = findValue(/<strong>Tanggal Keluar<\/strong><\/td>\s*<td>([^<,]+)/);
    data.labTanggal = findValue(/Laboratorium \(([^)]+)\):/);
    data.diagnosisUtama = findValue(/<strong>Diagnosis Utama:<\/strong><\/div>\s*<div class="field-value"><strong>([^<]+) /);
    data.icd10Utama = findValue(/<strong>Diagnosis Utama:<\/strong>.*\(ICD-10: <strong>([^<]+)<\/strong>\)/);
    data.tindakan = findValue(/<strong>Tindakan<\/strong><\/td>\s*<td>([^<]+) /);
    data.icd9cm = findValue(/<strong>Tindakan<\/strong>.*\((\d{2}\.\d{1,2})\)/);

    // Convert date format '15 Oktober 2025' to '2025-10-15'
    const convertDate = (dateStr) => {
        if (!dateStr) return null;
        const parts = dateStr.split(' ');
        if (parts.length !== 3) return dateStr; // return as is if format is unexpected
        const day = parts[0];
        const month = {
            'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04', 'Mei': '05', 'Juni': '06',
            'Juli': '07', 'Agustus': '08', 'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
        }[parts[1]];
        const year = parts[2];
        return `${year}-${month}-${day}`;
    };
    
    data.tanggalMasuk = convertDate(data.tanggalMasuk);
    data.tanggalKeluar = convertDate(data.tanggalKeluar);
    data.labTanggal = convertDate(data.labTanggal);

    return data;
}

function parseSepHTML(htmlContent) {
    const data = {};
    const findValue = (regex) => (htmlContent.match(regex) || [])[1]?.trim() || null;
    
    data.tglSEP = findValue(/<td>Tanggal SEP<\/td>\s*<td>: ([^<,]+)/);
    data.namaPeserta = findValue(/<td>Nama Peserta<\/td>\s*<td>: ([^<]+)<\/td>/);
    data.diagnosisAwal = findValue(/<td>Diagnosa Awal<\/td>\s*<td>: ([^<(]+)/);
    
    // Convert date format
     const convertDate = (dateStr) => {
        if (!dateStr) return null;
        const parts = dateStr.split(' ');
        if (parts.length !== 3) return dateStr;
        const day = parts[0];
        const month = {
            'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04', 'Mei': '05', 'Juni': '06',
            'Juli': '07', 'Agustus': '08', 'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
        }[parts[1]];
        const year = parts[2];
        return `${year}-${month}-${day}`;
    };
    data.tglSEP = convertDate(data.tglSEP);

    return data;
}


async function getMockFraudulentData(claimId) {
    const basePath = process.cwd();
    let resumePath, sepPath;

    if (claimId.includes('COMBINED')) {
        // Combined fraud test: Timeline + Patient Mismatch + Upcoding + ML Tariff overcharging
        resumePath = path.join(basePath, 'test-resume-medis-fraud-combined.html');
        sepPath = path.join(basePath, 'test-sep-fraud-combined.html');
    } else if (claimId.includes('TIMELINE')) {
        resumePath = path.join(basePath, 'test-resume-medis-fraud-timeline.html');
        sepPath = path.join(basePath, 'test-sep-fraud-timeline.html');
    } else if (claimId.includes('MISMATCH')) {
        resumePath = path.join(basePath, 'test-resume-medis-fraud-mismatch.html');
        sepPath = path.join(basePath, 'test-sep-fraud-mismatch.html');
    } else if (claimId.includes('UPCODING')) {
        resumePath = path.join(basePath, 'test-resume-medis-fraud-upcoding.html');
        sepPath = path.join(basePath, 'test-sep-fraud-upcoding.html');
    } else {
        return null;
    }

    try {
        const resumeFile = await fs.readFile(resumePath, 'utf8');
        const sepFile = await fs.readFile(sepPath, 'utf8');
        return {
            resumeData: parseResumeHTML(resumeFile),
            sepData: parseSepHTML(sepFile),
        };
    } catch (error) {
        console.error("Error reading mock fraud HTML files:", error);
        return null;
    }
}


export async function GET(request, { params }) {
  try {
    // Next.js 15+ requires awaiting the entire params object
    const resolvedParams = await params;
    const claimId = resolvedParams.claimId;

    console.log('🔍 Analyze-fraud: Looking for claim ID:', claimId);

    if (!claimId) {
      return NextResponse.json(
        { success: false, error: 'Claim ID missing' },
        { status: 400 }
      );
    }

    // Use maybeSingle() instead of single() for better error handling
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('*')
      .eq('id', claimId)
      .maybeSingle();

    if (claimError) {
      console.error('❌ Database error:', claimError);
      return NextResponse.json(
        { success: false, error: 'Database error', details: claimError.message },
        { status: 500 }
      );
    }

    if (!claim) {
      console.error('❌ Claim not found:', claimId);
      return NextResponse.json(
        { success: false, error: 'Klaim tidak ditemukan', claimId },
        { status: 404 }
      );
    }

    console.log('✅ Claim found:', claim.id);

    // Fetch diagnoses from database
    const { data: diagnoses } = await supabase
      .from('claim_diagnoses')
      .select('*')
      .eq('claim_id', claimId);

    // Fetch procedures from database
    const { data: procedures } = await supabase
      .from('claim_procedures')
      .select('*')
      .eq('claim_id', claimId);

    console.log(`📊 Found ${diagnoses?.length || 0} diagnoses and ${procedures?.length || 0} procedures`);

    const mockData = await getMockFraudulentData(claimId);

    const richClaimObject = {
        ...claim,
        patient_name: mockData?.resumeData?.nama || claim.patient_name,
        dataRawat: {
            tanggalMasuk: mockData?.resumeData?.tanggalMasuk || claim.admission_date,
            tanggalKeluar: mockData?.resumeData?.tanggalKeluar || claim.discharge_date,
        },
        diagnoses: diagnoses && diagnoses.length > 0 ? diagnoses : (mockData?.resumeData?.diagnosisUtama ? [{
            diagnosis_type: 'primary',
            diagnosis_name: mockData.resumeData.diagnosisUtama,
            icd10_code: mockData.resumeData.icd10Utama,
        }] : []),
        procedures: procedures && procedures.length > 0 ? procedures : (mockData?.resumeData?.tindakan ? [{
            procedure_name: mockData.resumeData.tindakan,
            icd9cm_code: mockData.resumeData.icd9cm,
        }] : []),
        los_days: claim.los_days,
        pemeriksaanPenunjang: {
            laboratorium: {
                tanggal: mockData?.resumeData?.labTanggal,
            },
        },
        sep_data: mockData?.sepData,
    };


    // ========================================
    // GABUNGAN FRAUD DETECTION
    // Sistem Lama: Document-based (timeline, patient mismatch, upcoding)
    // Sistem Baru: ML-based (tariff overcharging, provider patterns)
    // ========================================

    // 1. Sistem Lama - Document Analysis
    const documentAnalysis = analyzeClaimForFraud(richClaimObject);

    // 2. Sistem Baru - ML Tariff Analysis
    let mlAnalysis = null;
    try {
      // Calculate LOS
      const calculateLOS = () => {
        const admission = claim.admission_date ? new Date(claim.admission_date) : null;
        const discharge = claim.discharge_date ? new Date(claim.discharge_date) : null;
        if (!admission || !discharge) return 1;
        const diffTime = Math.abs(discharge - admission);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      };

      const los = calculateLOS();

      // Call ML fraud detection API
      const mlResponse = await fetch('http://localhost:3000/api/ml/fraud-detection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tarif_rs: parseFloat(claim.tarif_rs) || 0,
          tarif_inacbg: parseFloat(claim.tarif_ina_cbg) || 0,
          los_days: los,
          num_procedures: claim.procedures?.length || 0,
          care_class: claim.care_class || '3',
          diagnosis_severity: 'normal',
          provider_claims_count: 1,
          provider_fraud_history_rate: 0,
          hospital_fraud_history_rate: 0,
        }),
      });

      if (mlResponse.ok) {
        const mlResult = await mlResponse.json();
        if (mlResult.success) {
          mlAnalysis = mlResult.fraud_detection;
        }
      }
    } catch (mlError) {
      console.error('⚠️ ML fraud detection failed:', mlError);
      // Continue with document analysis only
    }

    // 3. Combine both analyses
    const combinedAnalysis = {
      // Document-based confidence (0-100)
      documentConfidence: documentAnalysis.confidenceScore,
      documentIssues: documentAnalysis.issues,
      documentSummary: documentAnalysis.summary,

      // ML-based confidence (0-100)
      mlConfidence: mlAnalysis?.risk_score || 0,
      mlRiskLevel: mlAnalysis?.risk_level || 'low',
      mlRiskFactors: mlAnalysis?.risk_factors || [],
      mlRecommendation: mlAnalysis?.recommendation || null,

      // Combined score (weighted average: 50% document + 50% ML)
      confidenceScore: Math.round(
        (documentAnalysis.confidenceScore * 0.5) +
        ((mlAnalysis?.risk_score || 0) * 0.5)
      ),

      // All issues combined
      issues: [
        ...documentAnalysis.issues,
        ...(mlAnalysis?.risk_factors || []).map(rf => ({
          code: 'ML_TARIFF',
          description: rf.detail || rf.factor,
          severity: rf.severity?.toUpperCase() || 'MEDIUM',
          score: Math.round((mlAnalysis?.risk_score || 0) / (mlAnalysis?.risk_factors?.length || 1))
        }))
      ],

      // Summary combines both
      summary: documentAnalysis.confidenceScore > 0 || (mlAnalysis?.risk_score || 0) > 0
        ? `Terdeteksi ${documentAnalysis.issues.length} masalah dokumen dan ${mlAnalysis?.risk_factors?.length || 0} indikator fraud tarif/provider.`
        : 'Tidak ada indikasi fraud yang terdeteksi.'
    };

    return NextResponse.json({
      success: true,
      data: combinedAnalysis,
    });

  } catch (error) {
    console.error('Fraud analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal melakukan analisis fraud', details: error.message },
      { status: 500 }
    );
  }
}
