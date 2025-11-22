import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';

    // Optimized: Use a single query with JOIN to fetch appointments with triage data
    // Only select the fields we need to reduce payload size
    const { data: appointments, error } = await supabase
      .from('janji_temu')
      .select(`
        id,
        user_id,
        triage_id,
        hospital_name,
        hospital_address,
        hospital_place_id,
        hospital_lat,
        hospital_lng,
        hospital_phone,
        distance_km,
        distance_text,
        duration_text,
        appointment_type,
        specialty,
        status,
        estimated_wait_time,
        operational_hours,
        clinical_summary,
        created_at,
        triage_history!inner (
          triage_id,
          tingkat_keparahan,
          label_keparahan,
          rekomendasi_layanan,
          alasan,
          conversation_summary,
          tanggal_kunjungan_disarankan,
          ringkasan_klinis
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50); // Add reasonable limit

    if (error) {
      console.error('Error fetching appointments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch appointments', details: error.message },
        { status: 500 }
      );
    }

    // Transform the data structure to match expected format
    const appointmentsWithTriage = (appointments || []).map(appointment => ({
      ...appointment,
      triage: appointment.triage_history || null
    }));

    // Set cache headers for better performance
    return NextResponse.json(
      {
        appointments: appointmentsWithTriage,
        count: appointmentsWithTriage.length,
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Error in appointments API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
