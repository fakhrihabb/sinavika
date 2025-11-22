import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const body = await request.json();

    // Extract triageResult from the request body
    const { triageResult, userId = 'demo-user' } = body;

    // If triageResult is provided, use it; otherwise fall back to direct fields
    const triageData = triageResult || body;

    const {
      triageId,
      tingkatKeparahan,
      labelKeparahan,
      rekomendasiLayanan,
      namaSpesialis,
      tanggalKunjunganDisarankan,
      perluRujukan,
      alasan,
      tindakan,
      gejalaBahaya,
      catatanTambahan,
      ringkasanKlinis,
      ringkasanUntukRS,
      estimasiWaktuTunggu,
      jamOperasionalDisarankan,
      conversationSummary,
    } = triageData;

    // Validate required fields
    if (!triageId || !tingkatKeparahan || !labelKeparahan || !rekomendasiLayanan) {
      return NextResponse.json(
        { error: 'Data triase tidak lengkap' },
        { status: 400 }
      );
    }

    // Insert into database
    const { data, error } = await supabase
      .from('triage_history')
      .insert([
        {
          triage_id: triageId,
          user_id: userId,
          tingkat_keparahan: tingkatKeparahan,
          label_keparahan: labelKeparahan,
          rekomendasi_layanan: rekomendasiLayanan,
          nama_spesialis: namaSpesialis || null,
          tanggal_kunjungan_disarankan: tanggalKunjunganDisarankan,
          perlu_rujukan: perluRujukan || false,
          alasan: alasan,
          tindakan: tindakan || [],
          gejala_bahaya: gejalaBahaya || [],
          catatan_tambahan: catatanTambahan,
          ringkasan_klinis: ringkasanKlinis,
          ringkasan_untuk_rs: ringkasanUntukRS || null,
          estimasi_waktu_tunggu: estimasiWaktuTunggu || null,
          jam_operasional_disarankan: jamOperasionalDisarankan || null,
          conversation_summary: conversationSummary || [],
        },
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Gagal menyimpan hasil triase');
    }

    return NextResponse.json({
      success: true,
      data: data[0],
    });

  } catch (error) {
    console.error('Save triage error:', error);
    return NextResponse.json(
      {
        error: 'Terjadi kesalahan saat menyimpan hasil triase',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
