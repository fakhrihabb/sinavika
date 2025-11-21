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

    // Fetch triage history for user
    const { data, error } = await supabase
      .from('triage_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Gagal mengambil riwayat triase');
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    });

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
