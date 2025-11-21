import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';

    // Fetch appointments for the user
    const { data: appointments, error } = await supabase
      .from('janji_temu')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching appointments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch appointments', details: error.message },
        { status: 500 }
      );
    }

    // Fetch triage data for each appointment
    const appointmentsWithTriage = await Promise.all(
      (appointments || []).map(async (appointment) => {
        const { data: triage, error: triageError } = await supabase
          .from('triage_history')
          .select('*')
          .eq('triage_id', appointment.triage_id)
          .single();

        if (triageError) {
          console.error('Error fetching triage for appointment:', triageError);
        }

        return {
          ...appointment,
          triage: triage || null,
        };
      })
    );

    return NextResponse.json({
      appointments: appointmentsWithTriage || [],
      count: appointmentsWithTriage?.length || 0,
    });
  } catch (error) {
    console.error('Error in appointments API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
