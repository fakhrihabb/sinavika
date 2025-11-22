import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { analyzeClaimForFraud } from '@/lib/fraud-detector';
import { promises as fs } from 'fs';
import path from 'path';

// --- HTML Parsing Functions ---

function parseResumeHTML(htmlContent) {
    const data = {};
    const findValue = (regex) => (htmlContent.match(regex) || [])[1]?.trim() || null;

    data.nama = findValue(/<strong>Nama Pasien<\/strong><\/td>\s*<td>([^<]+)<\/td>/);
    data.noBPJS = findValue(/<strong>No. BPJS<\/strong><\/td>\s*<td>([^<]+)<\/td>/);
    data.tanggalMasuk = findValue(/<strong>Tanggal Masuk<\/strong><\/td>\s*<td>([^<,]+)/);
    data.tanggalKeluar = findValue(/<strong>Tanggal Keluar<\/strong><\/td>\s*<td>([^<,]+)/);
    data.labTanggal = findValue(/Laboratorium \(([^)]+)\):/);
    data.diagnosisUtama = findValue(/<strong>Diagnosis Utama:<\/strong><\/div>\s*<div class="field-value"><strong>([^<]+) /);
    data.icd10Utama = findValue(/<strong>Diagnosis Utama:<\/strong>.*\(ICD-10: <strong>([^<]+)<\/strong>\)/);
    data.tindakan = findValue(/<strong>Tindakan<\/strong><\/td>\s*<td>([^<]+) /);
    data.icd9cm = findValue(/<strong>Tindakan<\/strong>.*\((\d{2}\.\d{1,2})\)/);

    // Convert date format '15 Oktober 2025' to '2025-10-15'
    const convertDate = (dateStr) => {
        if (!dateStr) return null;
        const parts = dateStr.split(' ');
        if (parts.length !== 3) return dateStr; // return as is if format is unexpected
        const day = parts[0];
        const month = {
            'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04', 'Mei': '05', 'Juni': '06',
            'Juli': '07', 'Agustus': '08', 'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
        }[parts[1]];
        const year = parts[2];
        return `${year}-${month}-${day}`;
    };
    
    data.tanggalMasuk = convertDate(data.tanggalMasuk);
    data.tanggalKeluar = convertDate(data.tanggalKeluar);
    data.labTanggal = convertDate(data.labTanggal);

    return data;
}

function parseSepHTML(htmlContent) {
    const data = {};
    const findValue = (regex) => (htmlContent.match(regex) || [])[1]?.trim() || null;
    
    data.tglSEP = findValue(/<td>Tanggal SEP<\/td>\s*<td>: ([^<,]+)/);
    data.namaPeserta = findValue(/<td>Nama Peserta<\/td>\s*<td>: ([^<]+)<\/td>/);
    data.diagnosisAwal = findValue(/<td>Diagnosa Awal<\/td>\s*<td>: ([^<(]+)/);
    
    // Convert date format
     const convertDate = (dateStr) => {
        if (!dateStr) return null;
        const parts = dateStr.split(' ');
        if (parts.length !== 3) return dateStr;
        const day = parts[0];
        const month = {
            'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04', 'Mei': '05', 'Juni': '06',
            'Juli': '07', 'Agustus': '08', 'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
        }[parts[1]];
        const year = parts[2];
        return `${year}-${month}-${day}`;
    };
    data.tglSEP = convertDate(data.tglSEP);

    return data;
}


async function getMockFraudulentData(claimId) {
    const basePath = process.cwd();
    let resumePath, sepPath;

    if (claimId.includes('TIMELINE')) {
        resumePath = path.join(basePath, 'test-resume-medis-fraud-timeline.html');
        sepPath = path.join(basePath, 'test-sep-fraud-timeline.html');
    } else if (claimId.includes('MISMATCH')) {
        resumePath = path.join(basePath, 'test-resume-medis-fraud-mismatch.html');
        sepPath = path.join(basePath, 'test-sep-fraud-mismatch.html');
    } else if (claimId.includes('UPCODING')) {
        resumePath = path.join(basePath, 'test-resume-medis-fraud-upcoding.html');
        sepPath = path.join(basePath, 'test-sep-fraud-upcoding.html');
    } else {
        return null;
    }

    try {
        const resumeFile = await fs.readFile(resumePath, 'utf8');
        const sepFile = await fs.readFile(sepPath, 'utf8');
        return {
            resumeData: parseResumeHTML(resumeFile),
            sepData: parseSepHTML(sepFile),
        };
    } catch (error) {
        console.error("Error reading mock fraud HTML files:", error);
        return null;
    }
}


export async function GET(request, { params }) {
  try {
    const { claimId } = params;

    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('*')
      .eq('id', claimId)
      .single();

    if (claimError || !claim) {
      return NextResponse.json(
        { success: false, error: 'Klaim tidak ditemukan' },
        { status: 404 }
      );
    }
    
    const mockData = await getMockFraudulentData(claimId);
    
    const richClaimObject = {
        ...claim,
        patient_name: mockData?.resumeData?.nama || claim.patient_name,
        dataRawat: {
            tanggalMasuk: mockData?.resumeData?.tanggalMasuk,
            tanggalKeluar: mockData?.resumeData?.tanggalKeluar,
        },
        diagnoses: mockData?.resumeData?.diagnosisUtama ? [{
            diagnosis_type: 'primary',
            diagnosis_name: mockData.resumeData.diagnosisUtama,
            icd10_code: mockData.resumeData.icd10Utama,
        }] : [],
        procedures: mockData?.resumeData?.tindakan ? [{
            procedure_name: mockData.resumeData.tindakan,
            icd9cm_code: mockData.resumeData.icd9cm,
        }] : [],
        pemeriksaanPenunjang: {
            laboratorium: {
                tanggal: mockData?.resumeData?.labTanggal,
            },
        },
        sep_data: mockData?.sepData,
    };


    const analysisResult = analyzeClaimForFraud(richClaimObject);

    return NextResponse.json({
      success: true,
      data: analysisResult,
    });

  } catch (error) {
    console.error('Fraud analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal melakukan analisis fraud', details: error.message },
      { status: 500 }
    );
  }
}
