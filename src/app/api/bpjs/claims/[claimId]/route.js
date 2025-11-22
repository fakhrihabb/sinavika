import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch single claim with all related data
export async function GET(request, { params }) {
  try {
    const { claimId } = await params;

    // Fetch main claim data
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('*')
      .eq('id', claimId)
      .single();

    // Handle "not found" error from Supabase
    if (claimError) {
      if (claimError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Klaim tidak ditemukan' },
          { status: 404 }
        );
      }
      throw claimError;
    }

    if (!claim) {
      return NextResponse.json(
        { success: false, error: 'Klaim tidak ditemukan' },
        { status: 404 }
      );
    }

    // Fetch diagnoses
    const { data: diagnoses, error: diagnosesError } = await supabase
      .from('claim_diagnoses')
      .select('*')
      .eq('claim_id', claimId)
      .order('diagnosis_type', { ascending: true });

    if (diagnosesError) throw diagnosesError;

    // Fetch procedures
    const { data: procedures, error: proceduresError } = await supabase
      .from('claim_procedures')
      .select('*')
      .eq('claim_id', claimId);

    if (proceduresError) throw proceduresError;

    // Fetch documents
    const { data: documents, error: documentsError } = await supabase
      .from('claim_documents')
      .select('*')
      .eq('claim_id', claimId)
      .order('uploaded_at', { ascending: true });

    if (documentsError) throw documentsError;

    // Generate signed URLs for documents as they are likely in a private bucket
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        if (doc.file_url) {
          const { data, error: urlError } = await supabase.storage
            .from('documents')
            .createSignedUrl(doc.file_url, 3600); // URL valid for 1 hour

          if (urlError) {
            console.error(`Error creating signed URL for ${doc.file_url}:`, urlError);
            return { ...doc, file_url: null }; // Return with null URL on error
          }

          return { ...doc, file_url: data.signedUrl };
        }
        return doc;
      })
    );


    // Fetch verification history
    const { data: verifications, error: verificationsError } = await supabase
      .from('claim_verifications')
      .select('*')
      .eq('claim_id', claimId)
      .order('created_at', { ascending: false });

    if (verificationsError) throw verificationsError;

    // Combine all data
    const claimDetail = {
      ...claim,
      diagnoses: diagnoses || [],
      procedures: procedures || [],
      documents: documentsWithUrls || [],
      verifications: verifications || [],
    };

    return NextResponse.json({
      success: true,
      data: claimDetail,
    });
  } catch (error) {
    console.error('Fetch claim detail error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil detail klaim',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
