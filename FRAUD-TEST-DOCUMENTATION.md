# 🔍 Fraud Detection Test Documentation

## 📋 Overview

File ini mendokumentasikan file-file HTML test untuk fraud detection system SINAVIKA. Sistem fraud detection menggunakan **2 layer deteksi**:

1. **Document Analysis** (Sistem Lama) - Rules-based
2. **ML Tariff Analysis** (Sistem Baru) - Machine Learning-based

---

## 📁 Test Files: Combined Fraud Detection

### File Locations
- **Resume Medis**: `test-resume-medis-fraud-combined.html`
- **SEP**: `test-sep-fraud-combined.html`

### Claim ID untuk Testing
Untuk menggunakan file test ini, gunakan claim ID yang mengandung kata **"COMBINED"**, contoh:
- `CLM-2025-COMBINED-001`
- `TEST-COMBINED-FRAUD`
- `COMBINED-12345`

### URL Testing
```
http://localhost:3000/bpjs/verifikasi/CLM-2025-COMBINED-001
```

---

## 🚨 Fraud Patterns yang Dideteksi

### 1️⃣ Document Analysis (Sistem Lama)

#### A. Timeline Fraud - SEP After Discharge
**Rule**: `TIMELINE_SEP_AFTER_DISCHARGE`
**Severity**: HIGH
**Score**: 40 points

**Detail**:
- Tanggal masuk: 10 Oktober 2024
- Tanggal keluar: **12 Oktober 2024, 16:00 WIB**
- Tanggal SEP: **13 Oktober 2024, 10:00 WIB**

❌ **SEP diterbitkan SETELAH pasien pulang** (1 hari setelah discharge)

---

#### B. Timeline Fraud - Lab Outside Treatment
**Rule**: `TIMELINE_LAB_OUTSIDE_TREATMENT`
**Severity**: HIGH
**Score**: 30 points

**Detail**:
- Tanggal masuk: 10 Oktober 2024
- Tanggal keluar: 12 Oktober 2024
- Lab test: **14 Oktober 2024**

❌ **Lab test dilakukan 2 hari SETELAH pasien pulang**

---

#### C. Patient Data Mismatch
**Rule**: `PATIENT_NAME_MISMATCH`
**Severity**: HIGH
**Score**: 50 points

**Detail**:
- Nama di Resume Medis: **Ahmad Fauzi**
- Nama di SEP: **Ahmad Fauzi bin Abdullah**

❌ **Nama tidak cocok persis** (ada tambahan "bin Abdullah")

---

#### D. Medical Upcoding Suspicion
**Rule**: `MEDICAL_UPCODING_SUSPICION`
**Severity**: MEDIUM
**Score**: 25 points

**Detail**:
- Diagnosis: **Common Cold / Flu Biasa (ICD-10: J00)** - Penyakit ringan
- Prosedur:
  - **Appendectomy (ICD-9-CM: 47.0)** - Operasi usus buntu
  - **Open Heart Surgery (ICD-9-CM: 36.1)** - Bedah jantung terbuka

❌ **Diagnosis ringan dengan prosedur berat yang TIDAK RELEVAN**

**Unlikely Pairs** (dari fraud-detector.js):
```javascript
'J00': ['47.0', '47.11']  // Common Cold -> Appendectomy
'L03': ['36.1']           // Cellulitis -> Open Heart Surgery
```

---

### 2️⃣ ML Tariff Analysis (Sistem Baru)

#### A. Extreme Overcharging
**Risk Factor**: Tariff ratio sangat tinggi
**Severity**: CRITICAL
**Expected Score**: 30-40 points

**Detail**:
- Tarif INA-CBG: **Rp 3.200.000,-**
- Tarif RS: **Rp 8.500.000,-**
- Selisih: **Rp 5.300.000,-**
- **Tariff Ratio**: **2.66x** (266% dari INA-CBG!)

🤖 **ML Model akan detect**:
```javascript
tariff_ratio = 8500000 / 3200000 = 2.656
is_high_cost = true (tariff_ratio > 1.3)
fraud_probability >= 0.35 (extreme overcharging rule)
```

---

#### B. Extended Stay (LOS)
**Risk Factor**: Lama rawat tidak sesuai diagnosis
**Severity**: MEDIUM
**Expected Score**: 10-15 points

**Detail**:
- Diagnosis: Common Cold (J00) - Biasanya tidak perlu rawat inap
- LOS: **3 hari**
- Normal LOS untuk J00: 0-1 hari (rawat jalan)

🤖 **ML Model akan detect**:
```javascript
los_days = 3
is_long_stay = true (LOS > 2 hari untuk diagnosis ringan)
```

---

#### C. Excessive Procedures
**Risk Factor**: Jumlah prosedur berlebihan
**Severity**: HIGH
**Expected Score**: 15-20 points

**Detail**:
- Diagnosis: Common Cold (ringan)
- Jumlah prosedur: **9 prosedur**:
  1. Appendectomy (Operasi usus buntu)
  2. Open Heart Surgery (Bedah jantung)
  3. Foto Rontgen Thorax
  4. CT Scan Abdomen dengan kontras
  5. USG Whole Abdomen
  6. EKG 12 Lead
  7. Echocardiography
  8. Pemasangan infus line
  9. Nebulisasi 6x sehari

🤖 **ML Model akan detect**:
```javascript
num_procedures = 9
procedure_intensity = 9 / 3 = 3.0 prosedur per hari
fraud_probability += 0.15 (excessive procedures)
```

---

#### D. High Daily Cost
**Risk Factor**: Biaya per hari sangat tinggi
**Severity**: HIGH
**Expected Score**: 10-15 points

**Detail**:
- Total tarif RS: Rp 8.500.000,-
- LOS: 3 hari
- **Tariff per day**: **Rp 2.833.333,- per hari**

🤖 **ML Model akan detect**:
```javascript
tariff_per_day = 8500000 / 3 = 2833333
// Sangat tinggi untuk diagnosis ringan
```

---

## 📊 Expected Combined Score

### Document Analysis Score
```
Timeline SEP After Discharge:  40 points
Timeline Lab Outside:          30 points
Patient Name Mismatch:         50 points
Medical Upcoding:              25 points
─────────────────────────────────────────
TOTAL DOCUMENT SCORE:         145 points (capped at 100)
Document Confidence:          100%
```

### ML Tariff Analysis Score
```
Extreme Overcharging:          35 points
Extended Stay:                 15 points
Excessive Procedures:          20 points
High Daily Cost:               15 points
─────────────────────────────────────────
TOTAL ML SCORE:                85 points
ML Confidence:                 85%
Risk Level:                    CRITICAL
```

### Combined Score (50% + 50%)
```
Combined Score = (100 * 0.5) + (85 * 0.5)
Combined Score = 50 + 42.5
Combined Score = 92.5% ≈ 93%

Risk Level: CRITICAL
Recommendation: REJECT_OR_INVESTIGATE
```

---

## 🧪 Testing Steps

### 1. Start Services
```bash
# Terminal 1: ML Service
cd ml
python3 ml_service.py

# Terminal 2: Next.js
npm run dev
```

### 2. Create Test Claim in Database
```sql
INSERT INTO claims (
    id,
    hospital,
    patient_name,
    patient_bpjs_number,
    sep_number,
    admission_date,
    discharge_date,
    care_class,
    ina_cbg_code,
    tarif_ina_cbg,
    tarif_rs,
    status,
    priority
) VALUES (
    'CLM-2025-COMBINED-001',
    'RS Budi Sehat',
    'Ahmad Fauzi',
    '0009876543210',
    '0301R0011024Y999999',
    '2024-10-10',
    '2024-10-12',
    '3',
    'J00',
    3200000,
    8500000,
    'pending',
    'normal'
);
```

### 3. Access Verification Page
```
http://localhost:3000/bpjs/verifikasi/CLM-2025-COMBINED-001
```

### 4. Expected Results

**Fraud Panel akan tampil dengan**:
- ✅ Combined Score: **~93%** (RED - CRITICAL)
- ✅ Breakdown:
  - 📄 Dokumen: 100%
  - 🤖 ML Tarif: 85%
- ✅ Risk Level: **CRITICAL**
- ✅ Rekomendasi: **REJECT_OR_INVESTIGATE**

**Detail Anomali**:
- 📄 **Masalah Dokumen (4)**:
  - TIMELINE_01: SEP setelah pulang
  - TIMELINE_02: Lab di luar periode rawat
  - PATIENT_01: Nama tidak cocok
  - MEDICAL_01: Upcoding (J00 dengan prosedur berat)

- 🤖 **Indikator ML Tarif/Provider (4)**:
  - Extreme Overcharging (266% dari INA-CBG)
  - Extended Stay (3 hari untuk diagnosis ringan)
  - Excessive Procedures (9 prosedur untuk flu)
  - High Daily Cost (Rp 2.8jt/hari)

---

## 🎯 Use Cases

### Development Testing
```javascript
// Test combined fraud detection
const response = await fetch('/api/bpjs/claims/CLM-2025-COMBINED-001/analyze-fraud');
const result = await response.json();

console.log('Combined Score:', result.data.confidenceScore);
console.log('Document Issues:', result.data.documentIssues.length);
console.log('ML Risk Factors:', result.data.mlRiskFactors.length);
```

### Demo Scenarios
1. **Show to stakeholders**: Demonstrasi deteksi fraud dengan multiple patterns
2. **Training verifier**: Latihan untuk petugas BPJS mengenali fraud patterns
3. **Algorithm testing**: Validasi akurasi kombinasi Document + ML analysis

---

## 📌 Notes

1. **File test ini SENGAJA dibuat suspicious** untuk menguji sistem
2. **Semua fraud patterns dapat terdeteksi** oleh kedua sistem
3. **Combined score harus tinggi** (>90%) karena banyak fraud indicators
4. **Sistem tidak akan auto-reject** - hanya memberikan rekomendasi ke verifier
5. **Use case realistis**: Fraud biasanya tidak se-obvious ini, tapi file test dirancang agar semua detection rules terpicu

---

## 🔧 Troubleshooting

### Issue: Fraud panel tidak muncul
- ✅ Pastikan claim ID mengandung "COMBINED"
- ✅ Cek ML service running di port 5001
- ✅ Cek Next.js dev server running

### Issue: ML confidence = 0%
- ✅ Pastikan ML service running
- ✅ Cek log di terminal ML service
- ✅ Test ML service: `curl http://localhost:5001/health`

### Issue: Document confidence = 0%
- ✅ Pastikan file HTML ada di root project
- ✅ Cek parseResumeHTML() dan parseSepHTML() berhasil extract data
- ✅ Cek console.log di API untuk debug

---

## 📚 References

- **Fraud Detector Library**: `/src/lib/fraud-detector.js`
- **ML Service**: `/ml/ml_service.py`
- **API Endpoint**: `/src/app/api/bpjs/claims/[claimId]/analyze-fraud/route.js`
- **Verification Page**: `/src/app/bpjs/verifikasi/[claimId]/page.js`

---

**Created**: 2025-01-22
**Last Updated**: 2025-01-22
**Version**: 1.0
**Author**: SINAVIKA Fraud Detection Team
