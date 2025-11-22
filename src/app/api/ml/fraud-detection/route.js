import { NextResponse } from 'next/server';

/**
 * Fraud Detection API
 *
 * This is a JavaScript implementation of fraud detection rules
 * based on patterns learned from ML training.
 *
 * For production, consider deploying actual Python ML model as microservice.
 */

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      tarif_rs,
      tarif_inacbg,
      los_days,
      num_procedures = 0,
      care_class = '3',
      diagnosis_severity = 'normal', // low, normal, high
      provider_claims_count = 1,
      provider_fraud_history_rate = 0,
      hospital_fraud_history_rate = 0,
    } = body;

    // Validate required fields
    if (!tarif_rs || !tarif_inacbg) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: tarif_rs, tarif_inacbg' },
        { status: 400 }
      );
    }

    // Calculate derived features
    const tariff_ratio = tarif_rs / tarif_inacbg;
    const tariff_difference = tarif_rs - tarif_inacbg;
    const tariff_diff_percentage = ((tarif_rs - tarif_inacbg) / tarif_inacbg) * 100;
    const tariff_per_day = tarif_rs / (los_days || 1);
    const procedure_intensity = num_procedures / (los_days || 1);

    // Initialize fraud probability and risk factors
    let fraud_probability = 0.0;
    const risk_factors = [];
    let evidence_count = 0;

    // ============================================
    // FRAUD DETECTION RULES (ML-inspired)
    // ============================================

    // Rule 1: Extreme overcharging (Weight: 0.35)
    if (tariff_ratio > 1.5) {
      fraud_probability += 0.35;
      evidence_count++;
      risk_factors.push({
        factor: 'Extreme Overcharging',
        severity: 'critical',
        detail: `Tarif RS ${tariff_ratio.toFixed(2)}x lebih tinggi dari INA-CBG (${tariff_diff_percentage.toFixed(1)}%)`,
        contribution: 0.35
      });
    } else if (tariff_ratio > 1.3) {
      fraud_probability += 0.25;
      evidence_count++;
      risk_factors.push({
        factor: 'Significant Overcharging',
        severity: 'high',
        detail: `Tarif RS ${tariff_diff_percentage.toFixed(1)}% lebih tinggi dari INA-CBG`,
        contribution: 0.25
      });
    } else if (tariff_ratio > 1.2) {
      fraud_probability += 0.15;
      evidence_count++;
      risk_factors.push({
        factor: 'Moderate Overcharging',
        severity: 'medium',
        detail: `Tarif RS ${tariff_diff_percentage.toFixed(1)}% di atas INA-CBG`,
        contribution: 0.15
      });
    }

    // Rule 2: Provider history (Weight: 0.25)
    if (provider_fraud_history_rate > 0.5) {
      fraud_probability += 0.25;
      evidence_count++;
      risk_factors.push({
        factor: 'Provider Fraud History',
        severity: 'critical',
        detail: `Provider memiliki ${(provider_fraud_history_rate * 100).toFixed(0)}% riwayat klaim berisiko`,
        contribution: 0.25
      });
    } else if (provider_fraud_history_rate > 0.3) {
      fraud_probability += 0.15;
      evidence_count++;
      risk_factors.push({
        factor: 'Provider Suspicious Pattern',
        severity: 'high',
        detail: `Provider memiliki ${(provider_fraud_history_rate * 100).toFixed(0)}% klaim berisiko`,
        contribution: 0.15
      });
    }

    // Rule 3: Hospital history (Weight: 0.20)
    if (hospital_fraud_history_rate > 0.4) {
      fraud_probability += 0.20;
      evidence_count++;
      risk_factors.push({
        factor: 'Hospital Fraud Pattern',
        severity: 'critical',
        detail: `RS memiliki ${(hospital_fraud_history_rate * 100).toFixed(0)}% riwayat klaim bermasalah`,
        contribution: 0.20
      });
    } else if (hospital_fraud_history_rate > 0.25) {
      fraud_probability += 0.12;
      evidence_count++;
      risk_factors.push({
        factor: 'Hospital Suspicious Pattern',
        severity: 'medium',
        detail: `RS memiliki tingkat masalah ${(hospital_fraud_history_rate * 100).toFixed(0)}%`,
        contribution: 0.12
      });
    }

    // Rule 4: Excessive procedures (Weight: 0.15)
    if (num_procedures >= 5 && tarif_inacbg < 5000000) {
      fraud_probability += 0.15;
      evidence_count++;
      risk_factors.push({
        factor: 'Excessive Procedures',
        severity: 'high',
        detail: `${num_procedures} prosedur untuk diagnosis dengan tarif rendah (kemungkinan unnecessary)`,
        contribution: 0.15
      });
    } else if (num_procedures >= 4 && tarif_inacbg < 3000000) {
      fraud_probability += 0.10;
      evidence_count++;
      risk_factors.push({
        factor: 'High Procedure Count',
        severity: 'medium',
        detail: `${num_procedures} prosedur untuk kasus relatif sederhana`,
        contribution: 0.10
      });
    }

    // Rule 5: Abnormal length of stay (Weight: 0.10)
    const expected_los = getExpectedLOS(tarif_inacbg, diagnosis_severity);
    if (los_days > expected_los * 2.5) {
      fraud_probability += 0.10;
      evidence_count++;
      risk_factors.push({
        factor: 'Extended Hospital Stay',
        severity: 'high',
        detail: `LOS ${los_days} hari jauh melebihi ekspektasi ${expected_los} hari`,
        contribution: 0.10
      });
    } else if (los_days > expected_los * 2) {
      fraud_probability += 0.07;
      evidence_count++;
      risk_factors.push({
        factor: 'Long Hospital Stay',
        severity: 'medium',
        detail: `LOS ${los_days} hari melebihi ekspektasi ${expected_los} hari`,
        contribution: 0.07
      });
    }

    // Rule 6: Upcoding detection (Weight: 0.10)
    if (tariff_ratio > 1.4 && diagnosis_severity === 'normal' && num_procedures <= 1) {
      fraud_probability += 0.10;
      evidence_count++;
      risk_factors.push({
        factor: 'Possible Upcoding',
        severity: 'high',
        detail: 'Tarif tinggi namun diagnosis severity normal dengan prosedur minimal',
        contribution: 0.10
      });
    }

    // Rule 7: High tariff per day (Weight: 0.08)
    const avg_tariff_per_day = 1500000; // Average ~1.5 juta per hari
    if (tariff_per_day > avg_tariff_per_day * 2) {
      fraud_probability += 0.08;
      evidence_count++;
      risk_factors.push({
        factor: 'High Daily Cost',
        severity: 'medium',
        detail: `Biaya per hari Rp ${(tariff_per_day/1000000).toFixed(1)}jt melebihi rata-rata`,
        contribution: 0.08
      });
    }

    // Rule 8: Procedure intensity (Weight: 0.07)
    if (procedure_intensity > 2) {
      fraud_probability += 0.07;
      evidence_count++;
      risk_factors.push({
        factor: 'High Procedure Intensity',
        severity: 'medium',
        detail: `${procedure_intensity.toFixed(1)} prosedur per hari (kemungkinan excessive)`,
        contribution: 0.07
      });
    }

    // Cap fraud probability at 0.99
    fraud_probability = Math.min(fraud_probability, 0.99);

    // Calculate risk score (0-100)
    const risk_score = Math.round(fraud_probability * 100);

    // Determine risk level
    let risk_level = 'low';
    if (risk_score >= 80) risk_level = 'critical';
    else if (risk_score >= 60) risk_level = 'high';
    else if (risk_score >= 40) risk_level = 'medium';

    // Sort risk factors by contribution
    risk_factors.sort((a, b) => b.contribution - a.contribution);

    // Build response
    return NextResponse.json({
      success: true,
      fraud_detection: {
        fraud_probability: parseFloat(fraud_probability.toFixed(4)),
        risk_score,
        risk_level,
        evidence_count,
        risk_factors,
        features_analyzed: {
          tariff_ratio: parseFloat(tariff_ratio.toFixed(4)),
          tariff_diff_percentage: parseFloat(tariff_diff_percentage.toFixed(2)),
          tariff_difference: parseFloat(tariff_difference.toFixed(2)),
          tariff_per_day: parseFloat(tariff_per_day.toFixed(2)),
          procedure_intensity: parseFloat(procedure_intensity.toFixed(4)),
          los_days,
          num_procedures
        },
        recommendation: getRecommendation(risk_level, risk_score)
      }
    });

  } catch (error) {
    console.error('Fraud detection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal melakukan analisis fraud',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Helper function: Get expected LOS based on tariff and severity
function getExpectedLOS(tarif_inacbg, severity) {
  // Simple heuristic based on tariff ranges
  if (tarif_inacbg > 10000000) return 5; // Complex cases
  if (tarif_inacbg > 5000000) return 4;
  if (tarif_inacbg > 3000000) return 3;
  return 2; // Simple cases

  // Adjust for severity
  const severityMultiplier = {
    'low': 0.7,
    'normal': 1.0,
    'high': 1.3
  };

  return Math.round(baseLOS * (severityMultiplier[severity] || 1.0));
}

// Helper function: Get recommendation based on risk
function getRecommendation(risk_level, risk_score) {
  const recommendations = {
    'critical': {
      action: 'REJECT_OR_INVESTIGATE',
      message: `Klaim ini memiliki risiko fraud sangat tinggi (${risk_score}%). Disarankan untuk investigasi mendalam atau penolakan.`,
      review_priority: 'URGENT',
      suggested_actions: [
        'Review manual oleh senior verifier',
        'Audit dokumen lengkap',
        'Konfirmasi ke provider',
        'Cek riwayat provider',
        'Pertimbangkan site visit'
      ]
    },
    'high': {
      action: 'DETAILED_REVIEW',
      message: `Klaim ini memiliki risiko fraud tinggi (${risk_score}%). Memerlukan review mendetail sebelum approval.`,
      review_priority: 'HIGH',
      suggested_actions: [
        'Review mendetail oleh verifier',
        'Verifikasi dokumen pendukung',
        'Cross-check dengan standar',
        'Cek pattern provider'
      ]
    },
    'medium': {
      action: 'STANDARD_REVIEW',
      message: `Klaim ini memiliki risiko fraud sedang (${risk_score}%). Lakukan review standar dengan perhatian khusus.`,
      review_priority: 'NORMAL',
      suggested_actions: [
        'Review standar',
        'Verifikasi field mencurigakan',
        'Monitor untuk pattern'
      ]
    },
    'low': {
      action: 'APPROVE_WITH_MONITORING',
      message: `Klaim ini memiliki risiko fraud rendah (${risk_score}%). Dapat diproses dengan review standar.`,
      review_priority: 'LOW',
      suggested_actions: [
        'Review checklist standar',
        'Approval normal'
      ]
    }
  };

  return recommendations[risk_level] || recommendations['low'];
}
