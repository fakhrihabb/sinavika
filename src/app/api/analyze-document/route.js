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

    // Create the appropriate prompt based on document type
    let prompt = '';

    if (documentType === 'resume_medis' || file.name.toLowerCase().includes('resume') || file.name.toLowerCase().includes('medis')) {
      prompt = `Anda adalah AI medis expert yang membantu ekstraksi data dari resume medis untuk sistem E-Klaim BPJS Indonesia.

TUGAS: Analisis dokumen resume medis ini dengan SANGAT TELITI dan ekstrak SEMUA informasi dalam format JSON yang LENGKAP dan AKURAT.

STRATEGI EKSTRAKSI:
1. Dokumen ini bisa berupa HTML atau PDF dari resume medis
2. Cari di SEMUA bagian dokumen: header, tabel, body text, footer
3. Perhatikan label seperti "Nama Pasien:", "No. BPJS:", "No. SEP:", "No. Rekam Medis:", "DPJP:", dll
4. Tabel HTML biasanya memiliki struktur: <strong>Label</strong> di kolom kiri, value di kolom kanan
5. Tanggal bisa dalam format "4 September 2020" atau "2020-09-04" - konversi ke YYYY-MM-DD

CRITICAL FIELDS - WAJIB EKSTRAK:
1. DATA PASIEN:
   - Nama Pasien (cari: "Nama Pasien:", "Nama:", di tabel data pasien)
   - No. BPJS / No. Peserta BPJS (13 digit, cari: "No. BPJS:", "Nomor BPJS:", "No. Peserta:")
   - No. SEP (format: 0301R001..., cari: "No. SEP:", "Nomor SEP:", "SEP:")
   - No. Rekam Medis / RM (format: 00-12-34-56, cari: "No. Rekam Medis:", "No. RM:")

2. DATA PERAWATAN:
   - Tanggal Masuk (cari: "Tanggal Masuk:", "Tgl Masuk:", di tabel data perawatan)
   - Tanggal Keluar (cari: "Tanggal Keluar:", "Tgl Keluar:", "Tanggal Pulang:")
   - Kelas Rawat (cari: "Kelas 1", "Kelas 2", "Kelas 3", "Ruang Perawatan:")
   - DPJP (cari: "DPJP:", "Dokter Penanggung Jawab", biasanya format: dr. Nama, Sp.XX)

3. DIAGNOSA (CRITICAL!):
   - Diagnosis Utama/Primary (cari: "Diagnosis Utama:", "Diagnosa Utama:", dan kode ICD-10 dalam kurung)
   - Diagnosis Sekunder (cari: "Diagnosis Sekunder:", "Diagnosa Sekunder:")
   - Diagnosis Penyerta/Tertiary (cari: "Diagnosis Penyerta:", "Diagnosa Lainnya:")
   - Kode ICD-10 biasanya dalam format: (ICD-10: J18.9) atau <strong>J18.9</strong>

4. TINDAKAN:
   - Cari di section "TINDAKAN", "PROSEDUR", "TINDAKAN & PROSEDUR"
   - Kode ICD-9-CM biasanya dalam format: (ICD-9-CM: 99.04) atau <strong>99.04</strong>

FORMAT OUTPUT JSON (HARUS LENGKAP):

{
  "documentType": "resume_medis",
  "patient": {
    "name": "nama lengkap pasien (WAJIB)",
    "age": "umur dalam angka saja",
    "gender": "L atau P",
    "medicalRecordNumber": "nomor RM/rekam medis (cari format: 00-12-34-56 atau RM-xxx)",
    "bpjsNumber": "nomor kartu BPJS Kesehatan 13 digit (cari: No. BPJS, No. Peserta, Kartu BPJS)",
    "sepNumber": "nomor SEP jika ada (format: 0301R001xxxx atau SEP)"
  },
  "treatment": {
    "type": "Rawat Jalan atau Rawat Inap (WAJIB - lihat di dokumen)",
    "admissionDate": "YYYY-MM-DD (tanggal masuk WAJIB)",
    "dischargeDate": "YYYY-MM-DD (tanggal keluar/pulang WAJIB)",
    "dpjp": "nama lengkap dokter DPJP dengan gelar (dr. Nama, Sp.XX)",
    "kelasRawat": "1 atau 2 atau 3 (jika rawat inap)"
  },
  "diagnosis": {
    "primary": {
      "name": "nama diagnosa utama LENGKAP",
      "icd10": "kode ICD-10 (contoh: J18.9, I10, E11.9)"
    },
    "secondary": {
      "name": "diagnosa sekunder jika ada",
      "icd10": "kode ICD-10 sekunder"
    },
    "tertiary": {
      "name": "diagnosa penyerta/tertiary jika ada",
      "icd10": "kode ICD-10 tertiary"
    }
  },
  "procedures": [
    {
      "name": "nama tindakan lengkap (contoh: Transfusi Darah, Foto Rontgen Thorax)",
      "icd9cm": "kode ICD-9-CM (contoh: 99.04, 87.44, 39.95)"
    }
  ],
  "medications": ["daftar obat yang diberikan"],
  "summary": "ringkasan singkat kondisi medis"
}

CONTOH EKSTRAKSI DARI HTML/TABEL:
Jika menemukan:
  <strong>Nama Pasien</strong> | Ahmad Fauzi
  → patient.name = "Ahmad Fauzi"

  <strong>No. BPJS</strong> | 0001234567890
  → patient.bpjsNumber = "0001234567890"

  <strong>Tanggal Masuk</strong> | 4 September 2020, 14:30 WIB
  → treatment.admissionDate = "2020-09-04"

  Ruang Perawatan: Melati 3 - Kelas 3
  → treatment.kelasRawat = "3"

  <strong>DPJP</strong> | dr. Budi Santoso, Sp.PD, FINASIM
  → treatment.dpjp = "dr. Budi Santoso, Sp.PD, FINASIM"

  Diagnosis Utama: <strong>Pneumonia</strong> (ICD-10: <strong>J18.9</strong>)
  → diagnosis.primary.name = "Pneumonia"
  → diagnosis.primary.icd10 = "J18.9"

KONVERSI TANGGAL:
- "4 September 2020" → "2020-09-04"
- "5 Sep 2020" → "2020-09-05"
- "15 Januari 1975" → "1975-01-15"
- Januari=01, Februari=02, Maret=03, April=04, Mei=05, Juni=06, Juli=07, Agustus=08, September=09, Oktober=10, November=11, Desember=12

ATURAN PENTING:
✓ Jika field tidak ditemukan di dokumen, isi dengan null (BUKAN string kosong)
✓ Format tanggal HARUS YYYY-MM-DD (gunakan tabel konversi bulan di atas)
✓ Kode ICD-10 HARUS huruf kapital (contoh: J18.9, bukan j18.9)
✓ Kode ICD-9-CM untuk tindakan HARUS ada jika tindakan disebutkan
✓ DPJP harus format: dr. Nama Lengkap, Gelar (ekstrak lengkap dengan gelar Sp.XX)
✓ Array procedures HARUS diisi jika ada tindakan yang disebutkan
✓ Pastikan JSON 100% valid (bisa di-parse tanpa error)
✓ JANGAN tambahkan komentar, markdown, atau teks lain
✓ CRITICAL: Ekstrak No. BPJS/Peserta (13 digit), No. RM, dan No. SEP jika ada di dokumen
✓ Cek SEMUA bagian dokumen untuk mencari nomor identitas pasien (header, tabel, footer)
✓ SCAN DOKUMEN DARI ATAS KE BAWAH - jangan lewatkan section/tabel apapun

CONTOH TINDAKAN UMUM & KODE ICD-9-CM:
- Transfusi Darah/PRC → 99.04
- Foto Rontgen Thorax → 87.44
- Cuci Darah/Hemodialisis → 39.95
- CT Scan → 88.38

LANGKAH VERIFIKASI SEBELUM OUTPUT:
1. Apakah saya sudah mengekstrak patient.name? (WAJIB)
2. Apakah saya sudah mengekstrak patient.bpjsNumber? (WAJIB - 13 digit)
3. Apakah saya sudah mengekstrak patient.sepNumber? (WAJIB)
4. Apakah saya sudah mengekstrak patient.medicalRecordNumber? (WAJIB)
5. Apakah saya sudah mengekstrak treatment.admissionDate dan dischargeDate? (WAJIB - format YYYY-MM-DD)
6. Apakah saya sudah mengekstrak treatment.dpjp dengan gelar lengkap? (WAJIB)
7. Apakah saya sudah mengekstrak semua diagnosis dengan kode ICD-10? (WAJIB)
8. Apakah saya sudah mengekstrak semua procedures dengan kode ICD-9-CM? (WAJIB)

Jika ada yang belum, SCAN ULANG dokumen dan ekstrak!

Ekstrak dengan TELITI, LENGKAP, dan AKURAT!`;

    } else if (documentType === 'lab' || file.name.toLowerCase().includes('lab') || file.name.toLowerCase().includes('darah') || file.name.toLowerCase().includes('laboratorium')) {
      prompt = `Anda adalah AI medis expert yang membantu ekstraksi data dari hasil laboratorium untuk sistem E-Klaim BPJS Indonesia.

TUGAS: Analisis hasil laboratorium ini dan ekstrak SEMUA informasi dalam format JSON yang LENGKAP dan AKURAT.

STRATEGI EKSTRAKSI:
1. Cari data pasien di header dokumen (Nama, No. RM, No. BPJS)
2. Cari tanggal pemeriksaan
3. Ekstrak SEMUA hasil tes dari tabel (nama tes, nilai, satuan, rentang normal, status)
4. Identifikasi hasil yang abnormal (Tinggi/Rendah)

FORMAT OUTPUT JSON:

{
  "documentType": "lab_result",
  "patient": {
    "name": "nama lengkap pasien",
    "medicalRecordNumber": "nomor RM (format: 00-12-34-56)",
    "bpjsNumber": "nomor BPJS 13 digit jika ada",
    "sepNumber": "nomor SEP jika ada"
  },
  "testDate": "YYYY-MM-DD (tanggal pemeriksaan)",
  "tests": [
    {
      "name": "nama pemeriksaan lengkap",
      "value": "nilai hasil",
      "unit": "satuan (mg/dL, %, dll)",
      "normalRange": "rentang normal",
      "status": "Normal/Tinggi/Rendah"
    }
  ],
  "summary": "ringkasan hasil lab dan interpretasi",
  "relevantFindings": ["temuan penting yang mendukung diagnosa"]
}

ATURAN PENTING:
✓ Ekstrak SEMUA data pasien (nama, No. RM, No. BPJS)
✓ Format tanggal HARUS YYYY-MM-DD
✓ Status: "Normal" jika dalam rentang, "Tinggi" jika di atas, "Rendah" jika di bawah
✓ Jika field tidak ada, isi dengan null
✓ JANGAN tambahkan komentar atau teks lain
✓ Pastikan JSON 100% valid

Berikan JSON yang valid tanpa tambahan teks.`;

    } else if (file.name.toLowerCase().includes('foto') || file.name.toLowerCase().includes('radiologi') || file.name.toLowerCase().includes('rontgen') || file.name.toLowerCase().includes('xray')) {
      prompt = `Anda adalah AI medis expert yang membantu ekstraksi data dari hasil radiologi untuk sistem E-Klaim BPJS Indonesia.

TUGAS: Analisis hasil radiologi ini dan ekstrak SEMUA informasi dalam format JSON yang LENGKAP dan AKURAT.

STRATEGI EKSTRAKSI:
1. Cari data pasien di header (Nama, No. RM, No. BPJS)
2. Identifikasi jenis pemeriksaan yang SPESIFIK (Foto Thorax AP, CT Scan Kepala, dsb)
3. Cari tanggal pemeriksaan
4. Ekstrak temuan radiologi dan kesimpulan
5. WAJIB tentukan kode ICD-9-CM sesuai jenis pemeriksaan

FORMAT OUTPUT JSON:

{
  "documentType": "radiology",
  "patient": {
    "name": "nama lengkap pasien",
    "medicalRecordNumber": "nomor RM jika ada",
    "bpjsNumber": "nomor BPJS jika ada"
  },
  "examType": "jenis pemeriksaan LENGKAP (contoh: Foto Rontgen Thorax AP, CT Scan Kepala, dll)",
  "examDate": "YYYY-MM-DD",
  "icd9cm": "kode ICD-9-CM untuk tindakan radiologi (contoh: 87.44 untuk Foto Thorax, 88.38 untuk CT Scan)",
  "findings": ["temuan radiologi dari hasil bacaan"],
  "conclusion": "kesimpulan radiologi",
  "summary": "ringkasan singkat"
}

KODE ICD-9-CM RADIOLOGI UMUM:
- Foto Rontgen Thorax → 87.44
- CT Scan → 88.38
- MRI → 88.91
- USG → 88.76

ATURAN PENTING:
✓ Ekstrak SEMUA data pasien (nama, No. RM, No. BPJS)
✓ Format tanggal HARUS YYYY-MM-DD
✓ examType harus jelas dan spesifik
✓ WAJIB isi kode ICD-9-CM sesuai jenis pemeriksaan
✓ Jika field tidak ada, isi dengan null
✓ JANGAN tambahkan komentar atau teks lain
✓ Pastikan JSON 100% valid

Berikan JSON yang valid tanpa tambahan teks.`;

    } else if (file.name.toLowerCase().includes('resep') || file.name.toLowerCase().includes('obat') || file.name.toLowerCase().includes('prescription')) {
      prompt = `Anda adalah AI medis expert yang membantu ekstraksi data dari resep obat untuk sistem E-Klaim BPJS Indonesia.

TUGAS: Analisis resep obat ini dan ekstrak SEMUA informasi dalam format JSON yang LENGKAP dan AKURAT.

STRATEGI EKSTRAKSI:
1. Cari data pasien di header (Nama, No. RM, No. BPJS)
2. Cari tanggal resep dan nomor resep
3. Cari nama dokter yang meresepkan (LENGKAP dengan gelar)
4. Ekstrak SEMUA obat dengan dosis, jumlah, bentuk, dan aturan pakai
5. Cari ruang rawat dan kelas rawat jika ada

FORMAT OUTPUT JSON:

{
  "documentType": "resep_obat",
  "patient": {
    "name": "nama lengkap pasien",
    "medicalRecordNumber": "nomor RM jika ada",
    "bpjsNumber": "nomor BPJS jika ada"
  },
  "tanggalResep": "YYYY-MM-DD",
  "nomorResep": "nomor resep jika ada",
  "dokter": "nama lengkap dokter dengan gelar (dr. Nama, Sp.XX)",
  "ruangRawat": "ruang rawat jika rawat inap",
  "kelasRawat": "kelas rawat (1/2/3) jika ada",
  "medications": [
    {
      "name": "nama obat lengkap",
      "dosage": "dosis (contoh: 2x1 gram IV, 3x500 mg PO)",
      "quantity": "jumlah (contoh: 10 vial, 15 tablet)",
      "form": "bentuk sediaan (Tablet, Injeksi, Sirup, dll)",
      "instruction": "signa/aturan pakai"
    }
  ],
  "diagnosis": "diagnosa jika tercantum di resep"
}

ATURAN PENTING:
✓ Ekstrak SEMUA data pasien (nama, No. RM, No. BPJS)
✓ Ekstrak SEMUA obat yang diresepkan (nama, dosis, jumlah, aturan pakai)
✓ Nama dokter HARUS dengan gelar lengkap
✓ Format tanggal HARUS YYYY-MM-DD
✓ Jika field tidak ada, isi dengan null
✓ JANGAN tambahkan komentar atau teks lain
✓ Pastikan JSON 100% valid

Berikan JSON yang valid tanpa tambahan teks.`;

    } else if (file.name.toLowerCase().includes('rujuk') || file.name.toLowerCase().includes('referral')) {
      prompt = `Anda adalah AI medis expert yang membantu ekstraksi data dari surat rujukan untuk sistem E-Klaim BPJS Indonesia.

TUGAS: Analisis surat rujukan ini dan ekstrak SEMUA informasi dalam format JSON yang LENGKAP dan AKURAT.

STRATEGI EKSTRAKSI:
1. Cari data pasien (Nama, No. BPJS 13 digit, NIK, No. RM)
2. Cari nomor rujukan (format: 0103R001...)
3. Cari tanggal rujukan dan masa berlaku
4. Identifikasi faskes perujuk dan tujuan
5. Ekstrak diagnosa rujukan dengan kode ICD-10
6. Cari alasan rujukan

FORMAT OUTPUT JSON:

{
  "documentType": "surat_rujukan",
  "patient": {
    "name": "nama lengkap pasien",
    "medicalRecordNumber": "nomor RM jika ada",
    "bpjsNumber": "nomor BPJS/Peserta 13 digit",
    "nik": "NIK jika ada"
  },
  "rujukan": {
    "nomorRujukan": "nomor rujukan (format: 0103R0011024Y000345)",
    "tanggalRujukan": "YYYY-MM-DD",
    "masaBerlaku": "masa berlaku rujukan",
    "asalFaskes": "nama faskes perujuk (Puskesmas/RS)",
    "tujuanFaskes": "nama faskes tujuan",
    "poliklinikTujuan": "poli tujuan (Poli Penyakit Dalam, dll)",
    "jenisRujukan": "Rujukan Partial/Rujukan Vertikal"
  },
  "diagnosis": {
    "name": "diagnosa kerja/rujukan",
    "icd10": "kode ICD-10 jika ada"
  },
  "keluhanUtama": "keluhan utama pasien",
  "anamnesis": "anamnesis tambahan",
  "pemeriksaanFisik": "hasil pemeriksaan fisik",
  "alasanRujukan": "alasan merujuk"
}

ATURAN PENTING:
✓ Ekstrak SEMUA data pasien (nama, No. BPJS/Peserta, NIK)
✓ No. Rujukan sangat penting untuk klaim BPJS
✓ Format tanggal HARUS YYYY-MM-DD
✓ Diagnosa rujukan dan kode ICD-10 nya
✓ Jika field tidak ada, isi dengan null
✓ JANGAN tambahkan komentar atau teks lain
✓ Pastikan JSON 100% valid

Berikan JSON yang valid tanpa tambahan teks.`;

    } else if (file.name.toLowerCase().includes('sep') || file.name.toLowerCase().includes('eligibilitas') || file.name.toLowerCase().includes('surat eligibilitas')) {
      prompt = `Anda adalah AI medis expert yang membantu ekstraksi data dari Surat Eligibilitas Peserta (SEP) BPJS Kesehatan untuk sistem E-Klaim.

TUGAS: Analisis dokumen SEP ini dan ekstrak SEMUA informasi dalam format JSON yang LENGKAP dan AKURAT.

STRATEGI EKSTRAKSI:
1. SEP adalah dokumen resmi BPJS yang berisi data peserta dan pelayanan
2. Cari nomor SEP (format: 0301R001...) - INI SANGAT PENTING
3. Ekstrak data peserta lengkap (Nama, No. BPJS, NIK, Tanggal Lahir)
4. Ekstrak data pelayanan (PPK, Jenis Pelayanan, Kelas Rawat, DPJP)
5. Ekstrak diagnosa awal dan kode ICD-10

FORMAT OUTPUT JSON:

{
  "documentType": "sep",
  "patient": {
    "name": "nama lengkap peserta",
    "bpjsNumber": "nomor kartu BPJS 13 digit",
    "nik": "NIK 16 digit",
    "dateOfBirth": "YYYY-MM-DD",
    "gender": "L atau P",
    "pesertaType": "jenis peserta (PBI, PBPU, PPU)",
    "hakKelas": "hak kelas rawat (1/2/3)"
  },
  "sep": {
    "nomorSEP": "nomor SEP lengkap (format: 0301R001...)",
    "tanggalSEP": "YYYY-MM-DD",
    "tanggalPelayanan": "YYYY-MM-DD",
    "tanggalRujukan": "YYYY-MM-DD",
    "nomorRujukan": "nomor rujukan jika ada"
  },
  "pelayanan": {
    "ppkPerujuk": "nama PPK perujuk (Puskesmas/RS)",
    "ppkPelayanan": "nama PPK pelayanan (RS tujuan)",
    "jenisPelayanan": "1-Rawat Inap atau 2-Rawat Jalan",
    "kelasRawat": "kelas rawat (1/2/3)",
    "caraMasuk": "cara masuk (IGD, Rujukan, dll)",
    "poliTujuan": "poli tujuan",
    "dpjp": "nama DPJP dengan gelar lengkap"
  },
  "diagnosis": {
    "diagnosisAwal": "nama diagnosa awal",
    "icd10": "kode ICD-10",
    "catatan": "catatan diagnosa jika ada"
  }
}

ATURAN PENTING:
✓ Nomor SEP adalah FIELD PALING PENTING - WAJIB ekstrak
✓ Format tanggal HARUS YYYY-MM-DD
✓ No. BPJS harus 13 digit
✓ Jika field tidak ada, isi dengan null
✓ JANGAN tambahkan komentar atau teks lain
✓ Pastikan JSON 100% valid
✓ Ekstrak DPJP dengan gelar lengkap (dr. Nama, Sp.XX)

Berikan JSON yang valid tanpa tambahan teks.`;

    } else {
      // Generic document analysis
      prompt = `Analisis dokumen medis ini dan identifikasi:
1. Jenis dokumen (resume medis, hasil lab, surat rujukan, resep, dll)
2. Data pasien yang tersedia
3. Informasi medis penting
4. Data yang relevan untuk klaim BPJS

Berikan dalam format JSON yang sesuai dengan jenis dokumen yang terdeteksi.`;
    }

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
