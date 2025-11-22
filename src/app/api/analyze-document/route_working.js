import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const documentType = formData.get('documentType') || 'auto';

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');

    // Determine file type
    const mimeType = file.type;

    // Use Gemini 2.0 Flash for multimodal document analysis (supports vision)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // UNIVERSAL PROMPT - Auto-detect document type from visual content
    // No longer relying on filename - AI detects from document content
    const prompt = `Anda adalah AI medis expert yang membantu mengidentifikasi dan mengekstrak data dari dokumen medis untuk sistem E-Klaim BPJS Indonesia.

TUGAS:
1. IDENTIFIKASI jenis dokumen ini dengan SANGAT TELITI dari konten visual
2. EKSTRAK semua informasi penting sesuai jenis dokumen yang terdeteksi

JENIS DOKUMEN YANG MUNGKIN:
1. **Resume Medis / Discharge Summary**
   - Ciri: Ada diagnosa, kode ICD-10, tindakan/prosedur, tanggal rawat, nama DPJP
   - Header: "Resume Medis", "Discharge Summary", "Resume Rawat Inap"

2. **SEP (Surat Eligibilitas Peserta)**
   - Ciri: Logo BPJS Kesehatan, Nomor SEP (format: 0301R001...), Data Peserta, PPK
   - Header: "BPJS Kesehatan", "Surat Eligibilitas Peserta"

3. **Hasil Laboratorium**
   - Ciri: Tabel hasil tes darah/urine dengan nilai, satuan (mg/dL, %), rentang normal
   - Header: "Hasil Laboratorium", "Pemeriksaan Darah"

4. **Hasil Radiologi**
   - Ciri: Jenis pemeriksaan (Foto Rontgen, CT Scan, MRI), hasil bacaan, kesan/kesimpulan
   - Header: "Hasil Radiologi", "Foto Rontgen", "CT Scan"

5. **Surat Rujukan**
   - Ciri: Nomor rujukan, PPK perujuk, PPK tujuan, diagnosa rujukan, alasan rujuk
   - Header: "Surat Rujukan", "Rujukan"

6. **Resep Obat**
   - Ciri: Daftar obat dengan dosis, aturan pakai (3x1, 2x500mg), nama dokter
   - Header: "Resep", "Resep Obat", atau simbol Rx

STRATEGI IDENTIFIKASI (CRITICAL):
✓ Scan SELURUH dokumen dari atas ke bawah
✓ Cari logo/header/judul dokumen
✓ Identifikasi struktur (tabel, paragraf, daftar)
✓ Perhatikan keyword kunci sesuai jenis dokumen
✓ Jika ada lebih dari 1 kemungkinan, pilih yang PALING SESUAI

---

FORMAT OUTPUT BERDASARKAN JENIS DOKUMEN:

=== JIKA RESUME MEDIS ===
{
  "documentType": "resume_medis",
  "patient": {
    "name": "nama lengkap pasien (WAJIB)",
    "age": "umur",
    "gender": "L atau P",
    "medicalRecordNumber": "nomor RM (format: 00-12-34-56)",
    "bpjsNumber": "nomor BPJS 13 digit",
    "sepNumber": "nomor SEP jika ada"
  },
  "treatment": {
    "type": "Rawat Jalan atau Rawat Inap",
    "admissionDate": "YYYY-MM-DD (tanggal masuk)",
    "dischargeDate": "YYYY-MM-DD (tanggal keluar)",
    "dpjp": "nama dokter DPJP lengkap dengan gelar (dr. Nama, Sp.XX)",
    "kelasRawat": "1 atau 2 atau 3"
  },
  "diagnosis": {
    "primary": {"name": "diagnosa utama", "icd10": "kode ICD-10"},
    "secondary": {"name": "diagnosa sekunder", "icd10": "kode ICD-10"},
    "tertiary": {"name": "diagnosa penyerta", "icd10": "kode ICD-10"}
  },
  "procedures": [
    {"name": "nama tindakan", "icd9cm": "kode ICD-9-CM"}
  ],
  "medications": ["daftar obat"],
  "summary": "ringkasan"
}

=== JIKA SEP ===
{
  "documentType": "sep",
  "patient": {
    "name": "nama peserta",
    "bpjsNumber": "nomor BPJS 13 digit (WAJIB)",
    "nik": "NIK 16 digit",
    "dateOfBirth": "YYYY-MM-DD",
    "gender": "L atau P",
    "pesertaType": "jenis peserta",
    "hakKelas": "hak kelas (1/2/3)"
  },
  "sep": {
    "nomorSEP": "nomor SEP LENGKAP (WAJIB - format: 0301R001...)",
    "tanggalSEP": "YYYY-MM-DD",
    "tanggalPelayanan": "YYYY-MM-DD",
    "tanggalRujukan": "YYYY-MM-DD",
    "nomorRujukan": "nomor rujukan"
  },
  "pelayanan": {
    "ppkPerujuk": "nama PPK perujuk",
    "ppkPelayanan": "nama PPK pelayanan (RS)",
    "jenisPelayanan": "1-Rawat Inap atau 2-Rawat Jalan",
    "kelasRawat": "kelas rawat (1/2/3)",
    "caraMasuk": "cara masuk",
    "poliTujuan": "poli tujuan",
    "dpjp": "nama DPJP dengan gelar"
  },
  "diagnosis": {
    "diagnosisAwal": "diagnosa awal",
    "icd10": "kode ICD-10",
    "catatan": "catatan"
  }
}

=== JIKA HASIL LABORATORIUM ===
{
  "documentType": "lab_result",
  "patient": {
    "name": "nama pasien",
    "medicalRecordNumber": "nomor RM",
    "bpjsNumber": "nomor BPJS",
    "sepNumber": "nomor SEP jika ada"
  },
  "testDate": "YYYY-MM-DD",
  "tests": [
    {
      "name": "nama pemeriksaan",
      "value": "nilai hasil",
      "unit": "satuan (mg/dL, %, dll)",
      "normalRange": "rentang normal",
      "status": "Normal/Tinggi/Rendah"
    }
  ],
  "summary": "ringkasan hasil",
  "relevantFindings": ["temuan penting"]
}

=== JIKA HASIL RADIOLOGI ===
{
  "documentType": "radiology",
  "patient": {
    "name": "nama pasien",
    "medicalRecordNumber": "nomor RM",
    "bpjsNumber": "nomor BPJS"
  },
  "examType": "jenis pemeriksaan SPESIFIK (Foto Rontgen Thorax AP, CT Scan Kepala, dll)",
  "examDate": "YYYY-MM-DD",
  "icd9cm": "kode ICD-9-CM (87.44 untuk Foto Thorax, 88.38 untuk CT Scan, dll)",
  "findings": ["temuan radiologi"],
  "conclusion": "kesimpulan",
  "summary": "ringkasan"
}

=== JIKA SURAT RUJUKAN ===
{
  "documentType": "surat_rujukan",
  "patient": {
    "name": "nama pasien",
    "medicalRecordNumber": "nomor RM",
    "bpjsNumber": "nomor BPJS 13 digit",
    "nik": "NIK"
  },
  "rujukan": {
    "nomorRujukan": "nomor rujukan (format: 0103R001...)",
    "tanggalRujukan": "YYYY-MM-DD",
    "masaBerlaku": "masa berlaku",
    "asalFaskes": "nama faskes perujuk",
    "tujuanFaskes": "nama faskes tujuan",
    "poliklinikTujuan": "poli tujuan",
    "jenisRujukan": "jenis rujukan"
  },
  "diagnosis": {
    "name": "diagnosa rujukan",
    "icd10": "kode ICD-10"
  },
  "keluhanUtama": "keluhan utama",
  "alasanRujukan": "alasan rujuk"
}

=== JIKA RESEP OBAT ===
{
  "documentType": "resep_obat",
  "patient": {
    "name": "nama pasien",
    "medicalRecordNumber": "nomor RM",
    "bpjsNumber": "nomor BPJS"
  },
  "tanggalResep": "YYYY-MM-DD",
  "nomorResep": "nomor resep",
  "dokter": "nama dokter LENGKAP dengan gelar (dr. Nama, Sp.XX)",
  "ruangRawat": "ruang rawat",
  "kelasRawat": "kelas rawat (1/2/3)",
  "medications": [
    {
      "name": "nama obat",
      "dosage": "dosis (2x1 gram IV, 3x500 mg PO)",
      "quantity": "jumlah (10 vial, 15 tablet)",
      "form": "bentuk sediaan",
      "instruction": "aturan pakai"
    }
  ],
  "diagnosis": "diagnosa"
}

---

ATURAN EKSTRAKSI (CRITICAL):
✓ WAJIB tentukan documentType dengan TEPAT
✓ Ekstrak SEMUA data yang terlihat di dokumen
✓ Format tanggal HARUS YYYY-MM-DD
✓ Konversi bulan Indonesia ke angka (Januari=01, September=09, dll)
✓ Kode ICD-10 HARUS huruf kapital (J18.9, bukan j18.9)
✓ DPJP/Dokter HARUS dengan gelar lengkap (dr. Nama, Sp.XX)
✓ Jika field tidak ditemukan, isi dengan null (BUKAN string kosong)
✓ JANGAN tambahkan komentar, markdown, atau teks lain
✓ Output HARUS JSON valid 100% yang bisa di-parse

LANGKAH VERIFIKASI SEBELUM OUTPUT:
1. Apakah documentType sudah benar?
2. Apakah semua field WAJIB sudah terisi?
3. Apakah format tanggal sudah YYYY-MM-DD?
4. Apakah JSON valid (bisa di-parse)?

Berikan JSON yang valid tanpa tambahan teks apapun.`;

    // Generate content with image
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      }
    ]);

    const response = result.response;
    let text = await response.text();

    // Try to parse JSON from response
    let jsonData = null;
    try {
      // Remove markdown code blocks if present
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      console.log('🤖 AI Raw Response:', text);
      jsonData = JSON.parse(text);

      // Log extracted patient data for debugging
      console.log('👤 Extracted Patient Data:', JSON.stringify(jsonData.patient, null, 2));
      console.log('🏥 Extracted Treatment Data:', JSON.stringify(jsonData.treatment, null, 2));
      console.log('💊 Extracted Diagnosis:', JSON.stringify(jsonData.diagnosis, null, 2));
      console.log('🔧 Extracted Procedures:', JSON.stringify(jsonData.procedures, null, 2));
    } catch (e) {
      // If parsing fails, return raw text
      console.error('❌ JSON parse error:', e);
      return NextResponse.json({
        success: false,
        rawText: text,
        error: 'Failed to parse structured data'
      });
    }

    return NextResponse.json({
      success: true,
      data: jsonData,
      rawText: text
    });

  } catch (error) {
    console.error('Error analyzing document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze document' },
      { status: 500 }
    );
  }
}

