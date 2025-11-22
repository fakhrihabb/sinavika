import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST - Submit verification decision
export async function POST(request, { params }) {
  try {
    const { claimId } = await params;
    const body = await request.json();

    const {
      decision, // 'approve' or 'reject'
      notes,
      checklist,
      verifiedBy = 'demo-verifier',
      verifiedByName = 'Verifikator BPJS',
    } = body;

    // Validate required fields
    if (!decision || !['approve', 'reject', 'revision'].includes(decision)) {
      return NextResponse.json(
        { error: 'Keputusan verifikasi tidak valid' },
        { status: 400 }
      );
    }

    // Start transaction: Update claim status and insert verification record
    const { data: claimUpdate, error: claimError } = await supabase
      .from('claims')
      .update({
        status: decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'revision',
        verified_at: new Date().toISOString(),
        verified_by: verifiedBy,
      })
      .eq('id', claimId)
      .select()
      .single();

    if (claimError) {
      console.error('Claim update error:', claimError);
      throw claimError;
    }

    // Insert verification record
    const { data: verification, error: verificationError } = await supabase
      .from('claim_verifications')
      .insert([
        {
          claim_id: claimId,
          decision,
          notes: notes || null,
          checklist_identitas_pasien: checklist?.identitasPasien || false,
          checklist_diagnosis_sesuai: checklist?.diagnosisSesuai || false,
          checklist_icd10_valid: checklist?.icd10Valid || false,
          checklist_prosedur_sesuai: checklist?.prosedurSesuai || false,
          checklist_dokumen_lengkap: checklist?.dokumentLengkap || false,
          checklist_tarif_wajar: checklist?.tarifWajar || false,
          verified_by: verifiedBy,
          verified_by_name: verifiedByName,
        },
      ])
      .select()
      .single();

    if (verificationError) {
      console.error('Verification insert error:', verificationError);
      throw verificationError;
    }

    return NextResponse.json({
      success: true,
      message: decision === 'approve'
        ? 'Klaim berhasil disetujui'
        : decision === 'reject'
        ? 'Klaim berhasil ditolak'
        : 'Klaim memerlukan revisi',
      data: {
        claim: claimUpdate,
        verification: verification,
      },
    });
  } catch (error) {
    console.error('Verify claim error:', error);
    return NextResponse.json(
      {
        error: 'Gagal menyimpan keputusan verifikasi',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
