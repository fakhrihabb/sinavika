import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST - Submit new claim from hospital to BPJS
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      // Basic claim info
      hospitalName,
      hospitalCode,

      // Patient data
      patientName,
      patientBpjsNumber,
      patientNik,
      patientDob,
      patientGender,
      sepNumber,
      rmNumber,

      // Treatment data
      treatmentType,
      admissionDate,
      dischargeDate,
      careClass,
      dpjp,

      // Diagnosis (array of {type, name, icd10})
      diagnoses,

      // Procedures (array of {name, icd9cm, quantity})
      procedures,

      // GROUPER result
      inaCbgCode,
      inaCbgDescription,
      tarifInaCbg,
      tarifRS,

      // Documents (array of {type, fileName, fileSize, verified})
      documents,

      // AI flags
      aiRiskScore,
      aiFlags
    } = body;

    // Generate a new unique claim ID
    const claimId = `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;


    // Validate required fields
    if (!patientName || !patientBpjsNumber || !sepNumber || !hospitalName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Data tidak lengkap. Pastikan nama pasien, nomor BPJS, SEP, dan rumah sakit terisi.'
        },
        { status: 400 }
      );
    }

    // Calculate LOS (Length of Stay)
    const calculateLOS = () => {
      if (!admissionDate || !dischargeDate) return null;
      const admission = new Date(admissionDate);
      const discharge = new Date(dischargeDate);
      const diffTime = Math.abs(discharge - admission);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };

    // Calculate tariff difference
    const calculateTariffDiff = () => {
      const rs = parseFloat(tarifRS) || 0;
      const inacbg = parseFloat(tarifInaCbg) || 0;
      if (inacbg === 0) return { diff: 0, percentage: 0 };

      const diff = rs - inacbg;
      const percentage = ((diff / inacbg) * 100).toFixed(2);
      return { diff, percentage: parseFloat(percentage) };
    };

    const los = calculateLOS();
    const tariffCalc = calculateTariffDiff();

    // ========================================
    // FRAUD DETECTION ANALYSIS
    // ========================================
    let fraudDetectionResult = null;
    try {
      // Call ML fraud detection API
      const fraudResponse = await fetch('http://localhost:3000/api/ml/fraud-detection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tarif_rs: parseFloat(tarifRS) || 0,
          tarif_inacbg: parseFloat(tarifInaCbg) || 0,
          los_days: los || 1,
          num_procedures: procedures?.length || 0,
          care_class: careClass || '3',
          diagnosis_severity: 'normal', // Could be inferred from ICD-10
          provider_claims_count: 1, // TODO: Get from database
          provider_fraud_history_rate: 0, // TODO: Calculate from history
          hospital_fraud_history_rate: 0, // TODO: Calculate from history
        }),
      });

      if (fraudResponse.ok) {
        const fraudResult = await fraudResponse.json();
        if (fraudResult.success) {
          fraudDetectionResult = fraudResult.fraud_detection;
          console.log('✅ Fraud detection completed:', fraudDetectionResult);
        }
      }
    } catch (fraudError) {
      console.error('⚠️ Fraud detection failed (non-blocking):', fraudError);
      // Don't block claim submission if fraud detection fails
    }

    // Determine priority based on fraud risk or tariff
    let priority = 'normal';
    if (fraudDetectionResult) {
      if (fraudDetectionResult.risk_level === 'critical') priority = 'urgent';
      else if (fraudDetectionResult.risk_level === 'high') priority = 'high';
      else if (fraudDetectionResult.risk_level === 'medium') priority = 'normal';
    } else if (tariffCalc.diff > 1000000) {
      priority = 'high';
    }

    // Prepare AI flags
    const compiledAiFlags = fraudDetectionResult
      ? fraudDetectionResult.risk_factors.map(rf => rf.factor)
      : (aiFlags || []);

    // Insert main claim
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .insert([
        {
          id: claimId,
          hospital: hospitalName,
          hospital_code: hospitalCode || null,

          // Patient info
          patient_name: patientName,
          patient_bpjs_number: patientBpjsNumber,
          patient_nik: patientNik || null,
          patient_dob: patientDob || null,
          patient_gender: patientGender || null,

          // SEP & RM
          sep_number: sepNumber,
          rm_number: rmNumber || null,

          // Admission
          admission_date: admissionDate || null,
          discharge_date: dischargeDate || null,
          los_days: los,
          care_class: careClass || null,
          care_type: treatmentType || null,

          // GROUPER
          ina_cbg_code: inaCbgCode || null,
          ina_cbg_description: inaCbgDescription || null,
          tarif_ina_cbg: parseFloat(tarifInaCbg) || null,
          tarif_rs: parseFloat(tarifRS) || null,
          tarif_difference: tariffCalc.diff,
          tarif_difference_percentage: tariffCalc.percentage,

          // Status & Priority
          status: 'pending',
          priority: priority,

          // ML Fraud Detection Results
          ai_risk_score: fraudDetectionResult?.risk_score || aiRiskScore || null,
          ai_flags: compiledAiFlags,

          submitted_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (claimError) {
      console.error('Claim insert error:', claimError);
      throw new Error(`Gagal menyimpan klaim: ${claimError.message}`);
    }

    // Insert diagnoses
    if (diagnoses && diagnoses.length > 0) {
      const diagnosesData = diagnoses.map(d => ({
        claim_id: claimId,
        diagnosis_type: d.type, // 'primary', 'secondary', 'tertiary'
        diagnosis_name: d.name,
        icd10_code: d.icd10
      }));

      const { error: diagnosesError } = await supabase
        .from('claim_diagnoses')
        .insert(diagnosesData);

      if (diagnosesError) {
        console.error('Diagnoses insert error:', diagnosesError);
        // Don't throw, just log - claim is already created
      }
    }

    // Insert procedures
    if (procedures && procedures.length > 0) {
      const proceduresData = procedures.map(p => ({
        claim_id: claimId,
        procedure_name: p.name,
        icd9cm_code: p.icd9cm,
        quantity: p.quantity || 1
      }));

      const { error: proceduresError } = await supabase
        .from('claim_procedures')
        .insert(proceduresData);

      if (proceduresError) {
        console.error('Procedures insert error:', proceduresError);
        // Don't throw, just log
      }
    }

    // Insert documents
    if (documents && documents.length > 0) {
      const documentsData = documents.map(d => ({
        claim_id: claimId,
        document_type: d.type,
        file_name: d.fileName,
        file_size: d.fileSize || null,
        verified: d.verified || false,
        file_url: d.fileUrl || null
      }));

      const { error: documentsError } = await supabase
        .from('claim_documents')
        .insert(documentsData);

      if (documentsError) {
        console.error('Documents insert error:', documentsError);
        // Don't throw, just log
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Klaim berhasil dikirim ke BPJS',
      data: {
        claimId: claim.id,
        status: claim.status,
        priority: claim.priority,
        submittedAt: claim.submitted_at,
        fraudDetection: fraudDetectionResult ? {
          riskScore: fraudDetectionResult.risk_score,
          riskLevel: fraudDetectionResult.risk_level,
          recommendation: fraudDetectionResult.recommendation.message
        } : null
      }
    });

  } catch (error) {
    console.error('Submit claim error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengirim klaim ke BPJS',
        details: error.message
      },
      { status: 500 }
    );
  }
}
