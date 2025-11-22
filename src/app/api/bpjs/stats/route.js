import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch statistics for BPJS dashboard
export async function GET() {
  try {
    // Get total claims count
    const { count: totalClaims, error: totalError } = await supabase
      .from('claims')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Get pending claims count
    const { count: pendingClaims, error: pendingError } = await supabase
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (pendingError) throw pendingError;

    // Get approved claims count
    const { count: approvedClaims, error: approvedError } = await supabase
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    if (approvedError) throw approvedError;

    // Get rejected claims count
    const { count: rejectedClaims, error: rejectedError } = await supabase
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected');

    if (rejectedError) throw rejectedError;

    // Get high-risk claims (AI risk score >= 70)
    const { count: highRiskClaims, error: riskError } = await supabase
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .gte('ai_risk_score', 70);

    if (riskError) throw riskError;

    // Get hospitals with high issue rates
    const { data: hospitals, error: hospitalsError } = await supabase
      .from('hospitals')
      .select('*')
      .gte('issue_rate', 10)
      .order('issue_rate', { ascending: false })
      .limit(5);

    if (hospitalsError) throw hospitalsError;

    return NextResponse.json({
      success: true,
      data: {
        total: totalClaims || 0,
        pending: pendingClaims || 0,
        approved: approvedClaims || 0,
        rejected: rejectedClaims || 0,
        highRisk: highRiskClaims || 0,
        topIssueHospitals: hospitals || [],
      },
    });
  } catch (error) {
    console.error('Fetch stats error:', error);
    return NextResponse.json(
      {
        error: 'Gagal mengambil statistik',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
