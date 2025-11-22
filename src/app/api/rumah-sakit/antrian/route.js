import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get query parameters for filtering
    const status = searchParams.get('status') || 'scheduled';
    const severity = searchParams.get('severity');
    const appointmentType = searchParams.get('appointmentType');

    // First, fetch appointments
    let appointmentQuery = supabase
      .from('janji_temu')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (appointmentType) {
      appointmentQuery = appointmentQuery.eq('appointment_type', appointmentType);
    }

    const { data: appointments, error: appointmentError } = await appointmentQuery;

    if (appointmentError) {
      console.error('Error fetching appointments:', appointmentError);
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      );
    }

    // Get all unique triage IDs
    const triageIds = [...new Set(appointments.map(a => a.triage_id).filter(Boolean))];

    // Fetch all related triage data
    let triageQuery = supabase
      .from('triage_history')
      .select('*')
      .in('triage_id', triageIds);

    if (severity) {
      triageQuery = triageQuery.eq('tingkat_keparahan', severity);
    }

    const { data: triageData, error: triageError } = await triageQuery;

    if (triageError) {
      console.error('Error fetching triage data:', triageError);
      return NextResponse.json(
        { error: 'Failed to fetch triage data' },
        { status: 500 }
      );
    }

    // Create a map of triage data by triage_id for quick lookup
    const triageMap = {};
    triageData.forEach(triage => {
      triageMap[triage.triage_id] = triage;
    });

    // Combine appointments with their triage data
    const transformedData = appointments
      .map(appointment => ({
        ...appointment,
        triage: triageMap[appointment.triage_id] || null
      }))
      .filter(appointment => {
        // If severity filter is applied, only include appointments with matching triage
        if (severity) {
          return appointment.triage !== null;
        }
        return true;
      });

    return NextResponse.json({
      success: true,
      data: transformedData,
      count: transformedData.length
    });

  } catch (error) {
    console.error('Error in antrian API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update appointment status
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { appointmentId, status, notes } = body;

    if (!appointmentId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('janji_temu')
      .update(updateData)
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating appointment:', error);
      return NextResponse.json(
        { error: 'Failed to update appointment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Error in antrian PATCH:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
