import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch all claims with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    let query = supabase
      .from('claims')
      .select('*')
      .order('submitted_at', { ascending: false });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }

    if (search) {
      query = query.or(
        `id.ilike.%${search}%,patient_name.ilike.%${search}%,hospital.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Fetch claims error:', error);
    return NextResponse.json(
      {
        error: 'Gagal mengambil data klaim',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
