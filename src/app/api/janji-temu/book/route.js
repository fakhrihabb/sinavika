import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { notifyHospitalNewPatient } from '@/lib/notificationService';

export async function POST(request) {
  try {
    const bookingData = await request.json();

    const {
      userId,
      triageId,
      hospitalName,
      hospitalAddress,
      hospitalPlaceId,
      hospitalLat,
      hospitalLng,
      hospitalPhotoReference,
      hospitalPhone,
      distanceKm,
      distanceText,
      durationText,
      appointmentType,
      specialty,
    } = bookingData;

    // Validate required fields
    if (!userId || !triageId || !hospitalName || !hospitalPlaceId || !appointmentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch triage data to get clinical summary and other info
    const { data: triageData, error: triageError } = await supabase
      .from('triage_history')
      .select('ringkasan_untuk_rs, estimasi_waktu_tunggu, jam_operasional_disarankan')
      .eq('triage_id', triageId)
      .single();

    if (triageError) {
      console.error('Error fetching triage data:', triageError);
      // Continue anyway, clinical summary is optional
    }

    // Extract facility availability info from request (if available)
    const {
      estimatedWaitTime,
      operationalHours,
    } = bookingData;

    // Insert booking into janji_temu table
    const { data: appointment, error: insertError } = await supabase
      .from('janji_temu')
      .insert({
        user_id: userId,
        triage_id: triageId,
        hospital_name: hospitalName,
        hospital_address: hospitalAddress,
        hospital_place_id: hospitalPlaceId,
        hospital_lat: hospitalLat,
        hospital_lng: hospitalLng,
        hospital_photo_reference: hospitalPhotoReference,
        hospital_phone: hospitalPhone,
        distance_km: distanceKm,
        distance_text: distanceText,
        duration_text: durationText,
        appointment_type: appointmentType,
        specialty: specialty || null,
        status: 'scheduled',
        clinical_summary: triageData?.ringkasan_untuk_rs || null,
        estimated_wait_time: estimatedWaitTime || triageData?.estimasi_waktu_tunggu || null,
        operational_hours: operationalHours || triageData?.jam_operasional_disarankan || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating appointment:', insertError);
      return NextResponse.json(
        { error: 'Failed to create appointment', details: insertError.message },
        { status: 500 }
      );
    }

    // Update triage_history to mark this triage as having an appointment
    const { error: updateError } = await supabase
      .from('triage_history')
      .update({ appointment_status: 'Sudah Atur Janji Temu' })
      .eq('triage_id', triageId);

    if (updateError) {
      console.error('Error updating triage status:', updateError);
      // Don't fail the request, appointment was created successfully
    }

    // Create notification for hospital about new patient
    // Fetch full triage data for the notification
    const { data: fullTriageData, error: fullTriageError } = await supabase
      .from('triage_history')
      .select('*')
      .eq('triage_id', triageId)
      .single();

    if (!fullTriageError && fullTriageData) {
      await notifyHospitalNewPatient(fullTriageData, appointment);
    }

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
