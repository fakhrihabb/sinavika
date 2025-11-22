import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Optimized: Only select fields needed for the list view
    // This significantly reduces payload size by excluding large JSON fields
    const { data, error } = await supabase
      .from('triage_history')
      .select(`
        id,
        triage_id,
        user_id,
        tingkat_keparahan,
        label_keparahan,
        rekomendasi_layanan,
        alasan,
        tanggal_kunjungan_disarankan,
        conversation_summary,
        tindakan,
        gejala_bahaya,
        ringkasan_klinis,
        appointment_status,
        created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Gagal mengambil riwayat triase');
    }

    // Set cache headers for better performance
    return NextResponse.json(
      {
        success: true,
        data: data || [],
        count: data?.length || 0,
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        },
      }
    );

  } catch (error) {
    console.error('Get history error:', error);
    return NextResponse.json(
      {
        error: 'Terjadi kesalahan saat mengambil riwayat triase',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
