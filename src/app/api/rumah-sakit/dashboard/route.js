import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    // Fetch appointments stats
    const { data: appointments, error: appointmentError } = await supabase
      .from('janji_temu')
      .select('*')
      .eq('status', 'scheduled');

    if (appointmentError) {
      console.error('Error fetching appointments:', appointmentError);
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      );
    }

    // Count today's appointments
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.created_at).toISOString().split('T')[0];
      return aptDate === today;
    });

    // Fetch claims stats
    const { data: claims, error: claimsError } = await supabase
      .from('claims')
      .select('*');

    if (claimsError) {
      console.error('Error fetching claims:', claimsError);
      return NextResponse.json(
        { error: 'Failed to fetch claims' },
        { status: 500 }
      );
    }

    // Calculate claim statistics
    const pendingClaims = claims.filter(c => c.status === 'pending');
    const approvedClaims = claims.filter(c => c.status === 'approved');
    const rejectedClaims = claims.filter(c => c.status === 'rejected');
    const totalClaims = claims.length;
    const approvalRate = totalClaims > 0
      ? Math.round((approvedClaims.length / totalClaims) * 100)
      : 0;

    // Fetch notifications
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_type', 'rumah_sakit')
      .eq('read', false);

    if (notifError) {
      console.error('Error fetching notifications:', notifError);
    }

    // Get recent patient queue with triage data
    const triageIds = [...new Set(appointments.map(a => a.triage_id).filter(Boolean))];

    const { data: triageData, error: triageError } = await supabase
      .from('triage_history')
      .select('*')
      .in('triage_id', triageIds);

    if (triageError) {
      console.error('Error fetching triage data:', triageError);
    }

    // Create triage map
    const triageMap = {};
    if (triageData) {
      triageData.forEach(triage => {
        triageMap[triage.triage_id] = triage;
      });
    }

    // Combine appointments with triage data and sort by severity
    const severityOrder = { emergency: 0, high: 1, medium: 2, low: 3 };
    const patientQueue = appointments
      .map(apt => ({
        ...apt,
        triage: triageMap[apt.triage_id] || null
      }))
      .filter(apt => apt.triage)
      .sort((a, b) => {
        const aSeverity = severityOrder[a.triage.tingkat_keparahan] ?? 999;
        const bSeverity = severityOrder[b.triage.tingkat_keparahan] ?? 999;
        return aSeverity - bSeverity;
      })
      .slice(0, 3);

    // Get pending claims that need attention
    const claimsNeedingAttention = pendingClaims
      .filter(claim => claim.ai_flags && claim.ai_flags.length > 0)
      .sort((a, b) => {
        // Sort by priority and days pending
        const priorityOrder = { high: 0, medium: 1, normal: 2 };
        const aPriority = priorityOrder[a.priority] ?? 999;
        const bPriority = priorityOrder[b.priority] ?? 999;
        if (aPriority !== bPriority) return aPriority - bPriority;

        // Sort by submission date (older first)
        return new Date(a.submitted_at) - new Date(b.submitted_at);
      })
      .slice(0, 5);

    // Calculate days old for pending claims
    const claimsWithDaysOld = claimsNeedingAttention.map(claim => {
      const submittedDate = new Date(claim.submitted_at);
      const now = new Date();
      const diffTime = Math.abs(now - submittedDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...claim,
        daysOld: diffDays
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          patientsToday: todayAppointments.length,
          totalScheduled: appointments.length,
          claimsReady: 0, // Claims without issues/flags
          claimsPending: pendingClaims.length,
          approvalRate: approvalRate,
          claimsApproved: approvedClaims.length,
          claimsRejected: rejectedClaims.length
        },
        patientQueue,
        pendingClaims: claimsWithDaysOld,
        unreadNotifications: notifications?.length || 0,
        totalAppointments: appointments.length
      }
    });

  } catch (error) {
    console.error('Error in dashboard API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
