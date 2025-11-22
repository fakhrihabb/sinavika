import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch comprehensive dashboard data for BPJS
export async function GET() {
  try {
    // Get overall statistics
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_claims_statistics');

    // If RPC doesn't exist, fall back to manual queries
    let stats;
    if (statsError) {
      // Get total claims
      const { count: totalClaims } = await supabase
        .from('claims')
        .select('*', { count: 'exact', head: true });

      // Get pending claims
      const { count: pendingClaims } = await supabase
        .from('claims')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get approved claims
      const { count: approvedClaims } = await supabase
        .from('claims')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Get rejected claims
      const { count: rejectedClaims } = await supabase
        .from('claims')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected');

      // Get high-risk claims
      const { data: riskData } = await supabase
        .from('claims')
        .select('ai_risk_score')
        .gte('ai_risk_score', 70)
        .eq('status', 'pending');

      stats = {
        total: totalClaims || 0,
        pending: pendingClaims || 0,
        approved: approvedClaims || 0,
        rejected: rejectedClaims || 0,
        highRisk: riskData?.length || 0,
      };
    } else {
      stats = statsData[0];
    }

    // Get today's claims
    const today = new Date().toISOString().split('T')[0];
    const { count: todayClaims } = await supabase
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .gte('submitted_at', today);

    // Get priority queue - pending claims ordered by priority and risk score
    const { data: priorityClaims, error: claimsError } = await supabase
      .from('claims')
      .select('id, hospital, patient_name, ina_cbg_description, tarif_rs, tarif_ina_cbg, submitted_at, ai_risk_score, ai_flags, priority')
      .eq('status', 'pending')
      .order('priority', { ascending: true })
      .order('ai_risk_score', { ascending: false, nullsFirst: false })
      .order('submitted_at', { ascending: true })
      .limit(10);

    if (claimsError) throw claimsError;

    // Get hospitals with high issue rates
    const { data: hospitals, error: hospitalsError } = await supabase
      .from('hospitals')
      .select('name, code, claims_total, issue_rate, common_issues')
      .gt('issue_rate', 10)
      .order('issue_rate', { ascending: false })
      .limit(5);

    if (hospitalsError) throw hospitalsError;

    // Format claims for display
    const formattedClaims = (priorityClaims || []).map(claim => ({
      id: claim.id,
      hospital: claim.hospital,
      patientName: claim.patient_name,
      diagnosis: claim.ina_cbg_description || 'N/A',
      amount: claim.tarif_rs
        ? `Rp ${Number(claim.tarif_rs).toLocaleString('id-ID')}`
        : 'N/A',
      submittedDate: claim.submitted_at
        ? new Date(claim.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'N/A',
      aiRiskScore: claim.ai_risk_score || 0,
      aiFlags: claim.ai_flags || [],
      estimatedTime: estimateProcessingTime(claim.ai_risk_score, claim.ai_flags),
    }));

    // Format hospitals for display
    const formattedHospitals = (hospitals || []).map(hospital => ({
      name: hospital.name,
      code: hospital.code,
      claimsTotal: hospital.claims_total || 0,
      issueRate: Number(hospital.issue_rate) || 0,
      commonIssues: hospital.common_issues || 'N/A',
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          total: stats.total || 0,
          pending: stats.pending || 0,
          approved: stats.approved || 0,
          rejected: stats.rejected || 0,
          highRisk: stats.highRisk || 0,
          today: todayClaims || 0,
        },
        priorityClaims: formattedClaims,
        topIssueHospitals: formattedHospitals,
      },
    });
  } catch (error) {
    console.error('Fetch dashboard data error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data dashboard',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Helper function to estimate processing time based on complexity
function estimateProcessingTime(riskScore, flags) {
  if (!riskScore || riskScore < 30) {
    return '30 menit';
  } else if (riskScore < 60) {
    return '1 jam';
  } else if (riskScore < 80) {
    return '2 jam';
  } else {
    return '3 jam';
  }
}
