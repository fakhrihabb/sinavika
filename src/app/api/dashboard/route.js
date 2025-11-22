import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';

    // Get current date for monthly calculation
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Parallel queries for optimal performance
    const [
      totalTriageResult,
      monthlyTriageResult,
      lastTriageResult,
      appointmentsResult
    ] = await Promise.all([
      // Query 1: Get total triage count
      supabase
        .from('triage_history')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),

      // Query 2: Get monthly triage count
      supabase
        .from('triage_history')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', firstDayOfMonth),

      // Query 3: Get last triage only (with minimal data)
      supabase
        .from('triage_history')
        .select('created_at, tingkat_keparahan, label_keparahan, conversation_summary')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      // Query 4: Get recent appointments with triage data in a single join query
      supabase
        .from('janji_temu')
        .select(`
          id,
          hospital_name,
          appointment_type,
          status,
          created_at,
          triage_id,
          triage_history!fk_janji_temu_triage (
            tingkat_keparahan,
            label_keparahan
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3)
    ]);

    // Check for errors
    if (totalTriageResult.error) throw totalTriageResult.error;
    if (monthlyTriageResult.error) throw monthlyTriageResult.error;
    if (lastTriageResult.error) throw lastTriageResult.error;
    if (appointmentsResult.error) throw appointmentsResult.error;

    // Calculate stats
    const totalCount = totalTriageResult.count || 0;
    const monthlyCount = monthlyTriageResult.count || 0;

    let lastTriageTime = '-';
    if (lastTriageResult.data) {
      const lastTriageDate = new Date(lastTriageResult.data.created_at);
      const diffTime = Math.abs(now - lastTriageDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      lastTriageTime = diffDays === 0 ? 'Hari ini' : `${diffDays} hari`;
    }

    return NextResponse.json(
      {
        success: true,
        stats: {
          total: totalCount,
          monthly: monthlyCount,
          lastTriageTime: lastTriageTime
        },
        lastTriage: lastTriageResult.data || null,
        recentAppointments: appointmentsResult.data || []
      },
      {
        headers: {
          // Cache for 30 seconds, serve stale for 60 seconds while revalidating
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        },
      }
    );

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      {
        error: 'Terjadi kesalahan saat mengambil data dashboard',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
