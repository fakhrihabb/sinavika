# Sample Documents for BPJS Claim Pre-Check

This folder contains sample documents for testing the AI Copilot document upload and auto-fill functionality.

## Documents Included

### 1. SEP (Surat Eligibilitas Peserta)
**File**: `sep-sample.json`
**Purpose**: Document validation that patient is eligible for BPJS coverage
**Key Data Extracted**:
- No SEP
- Tanggal SEP
- Nama Peserta
- No Kartu BPJS
- Diagnosa Awal
- Jenis Rawat (Rawat Jalan/Rawat Inap)
- Status Peserta (PNS/Swasta/etc)
- COB (Coordination of Benefit)
- Poli Tujuan
- Asal Faskes Tk. I

**Sample Data**:
```json
{
  "documentType": "SEP",
  "noSEP": "1320R0020516000823",
  "tglSEP": "31/05/2016",
  "noKartu": "0001326568037 No MR: 0",
  "namaPeserta": "WENDY TRI JAYA",
  "tglLahir": "30/12/1992",
  "gender": "L",
  "polTujuan": "Instalasi Gawat Darurat",
  "asalFaskesTk1": "GEDEG",
  "diagnosisAwal": "Dyspepsia",
  "cob": "",
  "jenisRawat": "Rawat Jalan",
  "kelasRawat": "",
  "peserta": "PEGAWAI SWASTA",
  "pasisenKeluargaPasien": "Pasien",
  "pesertaBPJSKesehatanPasien": "Peserta BPJS Kesehatan"
}
```

---

### 2. Formulir Pengajuan Klaim (FPK)
**File**: `fpk-sample.json`
**Purpose**: Claim submission form from healthcare facility to BPJS
**Key Data Extracted**:
- Tanggal Masuk & Keluar
- No Registrasi Masuk/MPKP/Klaim KEU
- Jenis Penagihan (Kolektif/Individual)
- Nama PPK & Kode PPK
- Jenis Pelayanan
- Nama Pengaju
- Nama Penderita
- No Kartu Peserta
- Alamat
- Uraian Biaya (RITP/Kasus/HR/Tindakan)
- Total Biaya

**Sample Data**:
```json
{
  "documentType": "FPK",
  "tanggalMasuk": "",
  "tglTerimaMPKP": "",
  "tglTerimaKEU": "",
  "noRegMasuk": "",
  "noRegKlaimMPKP": "",
  "noRegKlaimKEU": "",
  "jenisPenagihan": "KOLEKTIF",
  "namaPPK": "KLINIK PERMATA",
  "kodePPK": "0457U003",
  "jenisPelayanan": "RITP(RAWAT INAP TINGKAT PERTAMA)",
  "blnThnPelayanan": "OKTOBER/2017",
  "namaPengaju": "KLINIK PERMATA",
  "peserta": "P",
  "namaPenderita": "NOFI YANTI dkk",
  "noKartuPeserta": "0001285923813",
  "alamat": "GP. PAYA, KEC. TRIENGGADENG, KAB. PIDIE JAYA",
  "telponHP": "",
  "uraianBiaya": [
    {
      "no": 1,
      "uraian": "RITP",
      "kasus": 42,
      "hrTindakan": "105 HARI",
      "biaya": "12600000",
      "kodeAkun": ""
    }
  ],
  "jumlah": {
    "kasus": 42,
    "hrTindakan": "105 HARI",
    "biaya": "12600000"
  },
  "tanggal": "Trienggadeng, 06 November 2017",
  "penanggungJawab": "TEUKU DIAN, SE"
}
```

---

### 3. Resume Medis (To be added)
**File**: `resume-medis-sample.json`
**Purpose**: Medical summary from doctor containing diagnoses, procedures, and ICD codes
**Key Data Expected**:
- Data Pasien (Nama, No RM, Tanggal Lahir)
- Tanggal Masuk & Keluar
- Jenis Rawat
- Diagnosa Utama + ICD-10
- Diagnosa Sekunder + ICD-10
- Diagnosa Penyerta + ICD-10
- Prosedur/Tindakan + ICD-9-CM
- DPJP
- Kondisi Pulang
- Ringkasan Kasus

---

### 4. Hasil Laboratorium (To be added)
**File**: `lab-result-sample.json`
**Purpose**: Laboratory test results supporting diagnosis
**Key Data Expected**:
- Jenis Pemeriksaan
- Hasil
- Nilai Normal
- Satuan
- Tanggal Pemeriksaan

---

### 5. Hasil Radiologi (To be added)
**File**: `radiology-result-sample.json`
**Purpose**: Radiology examination results (X-ray, CT, etc.)
**Key Data Expected**:
- Jenis Pemeriksaan
- Kesan/Kesimpulan
- Deskripsi
- Tanggal Pemeriksaan

---

## How AI Copilot Uses These Documents

### SEP Document Processing
When SEP is uploaded, AI extracts:
- ✅ No Kartu → Auto-fill to form
- ✅ Nama Peserta → Auto-fill to form
- ✅ Diagnosa Awal → Map to ICD-10 → Generate INA-CBG
- ✅ Jenis Rawat → Rawat Jalan/Inap
- ✅ Kelas Rawat → For tariff calculation

### FPK Document Processing
When FPK is uploaded, AI extracts:
- ✅ No Kartu Peserta
- ✅ Jenis Pelayanan
- ✅ Total Biaya
- ✅ Validation data

### Resume Medis Processing (Most Important!)
When Resume Medis is uploaded, AI extracts:
- ✅ Diagnosa Utama → ICD-10 → **AUTO-GENERATE INA-CBG**
- ✅ Diagnosa Sekunder → ICD-10
- ✅ Diagnosa Penyerta → ICD-10
- ✅ Prosedur → ICD-9-CM
- ✅ DPJP
- ✅ Tanggal Masuk/Keluar → Auto-calculate LOS
- ✅ **This is the PRIMARY document for auto-fill!**

---

## Integration with ChatPanel.js

The `generateDocumentResponse()` function in ChatPanel.js processes these documents:

```javascript
// SEP Processing
if (lowerName.includes('sep')) {
  // Extract SEP data
  // Auto-fill: No Kartu, Nama Pasien, Diagnosa Awal
}

// Resume Medis Processing (MOST IMPORTANT)
if (lowerName.includes('resume') || lowerName.includes('medis')) {
  // Extract diagnoses and ICD codes
  // Auto-generate INA-CBG from ICD-10
  // Fill all form fields
  // Return formData object with all extracted data
}

// Lab Results Processing
if (lowerName.includes('lab') || lowerName.includes('darah')) {
  // Validate diagnosis with lab results
}
```

---

## Analysis of Current Documents vs Web Requirements

### ✅ SEP Document - SESUAI
- Contains all necessary data for validation
- Can extract: No Kartu, Nama Peserta, Diagnosa Awal, Jenis Rawat
- **Integration Ready**: YES

### ✅ FPK Document - SESUAI
- Contains claim submission data
- Can extract: Biaya, Jenis Pelayanan, No Kartu
- **Integration Ready**: YES
- **Note**: This is OUTPUT document (result after pre-check), not INPUT

### ❌ Resume Medis - BELUM ADA
- **CRITICAL**: This is the MOST IMPORTANT document!
- Without this, AI cannot:
  - Extract ICD-10 codes
  - Auto-generate INA-CBG
  - Fill diagnosa fields
  - Fill procedure fields
- **Integration Ready**: NO - Need sample resume medis

### ❌ Hasil Lab - BELUM ADA
- Supporting document for diagnosis validation
- **Integration Ready**: NO - Need sample

### ❌ Hasil Radiologi - BELUM ADA
- Supporting document for diagnosis validation
- **Integration Ready**: NO - Need sample

---

## Recommendation

### Priority 1 (URGENT): Resume Medis
Create or obtain sample resume medis containing:
- Diagnosa Utama: "Diabetes Mellitus Tipe 2" → ICD-10: E11.9
- Diagnosa Sekunder: "Hipertensi Esensial" → ICD-10: I10
- Prosedur: "Konsultasi" → ICD-9-CM: 99.10
- DPJP: dr. Budi
- Tanggal Masuk: 5 Sep 2020
- Tanggal Keluar: 5 Sep 2020

This will enable full auto-fill functionality!

### Priority 2: Lab & Radiology Results
Add supporting documents for diagnosis validation.

---

## Next Steps

1. ✅ Store SEP and FPK samples (DONE)
2. ⏳ Create Resume Medis sample (NEEDED)
3. ⏳ Create Lab Result sample (NEEDED)
4. ⏳ Create Radiology Result sample (NEEDED)
5. ⏳ Update ChatPanel.js to read from these JSON files
6. ⏳ Test auto-fill functionality with real samples
