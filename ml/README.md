# Fraud Detection ML Model

Sistem deteksi fraud menggunakan Random Forest Classifier untuk mendeteksi pola mencurigakan pada klaim BPJS.

## 🎯 Overview

Sistem ini menggunakan **2 layer deteksi fraud**:

1. **JavaScript Rules-Based** (Always Active)
   - Berjalan di Next.js API `/api/ml/fraud-detection`
   - Tidak perlu training, langsung siap pakai
   - Menggunakan rules yang terinspirasi dari pattern ML
   - Cocok untuk quick deployment

2. **Python ML Model** (Optional, Higher Accuracy)
   - Random Forest Classifier dengan ~95% ROC-AUC
   - Perlu training dengan data historis
   - Berjalan sebagai Flask microservice di port 5000
   - Lebih akurat, bisa detect pattern kompleks

## Setup & Training

### 1. Install Dependencies

```bash
cd ml
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Generate Training Data

```bash
python generate_fraud_data.py
```

Ini akan membuat file `claims_fraud_dataset.csv` dengan 1000 baris data, termasuk:
- **Legitimate claims** (~85%): Klaim normal dengan pola wajar
- **Fraud claims** (~15%): Klaim dengan pola mencurigakan seperti:
  - Overcharging (tarif jauh lebih tinggi dari INA-CBG)
  - Upcoding (klaim diagnosis severity lebih tinggi)
  - Unnecessary procedures (prosedur berlebihan)
  - Extended stay (LOS tidak wajar)

### 3. Train Model

```bash
python train_fraud_model.py
```

Output files:
- `fraud_detection_model.pkl` - Trained Random Forest model
- `label_encoders.pkl` - Encoders untuk categorical variables
- `feature_names.pkl` - List of feature names
- `feature_importance.csv` - Feature importance ranking

### 4. Model Metrics

Setelah training, Anda akan melihat:
- **ROC-AUC Score**: ~0.95+ (excellent discrimination)
- **Precision**: ~0.90+ (low false positives)
- **Recall**: ~0.85+ (catches most fraud)
- **F1-Score**: ~0.87+

## Features Used

### Tariff-Related (Most Important)
- `tariff_ratio`: Rasio tarif RS / INA-CBG
- `tariff_diff_percentage`: Persentase selisih tarif
- `tariff_per_day`: Tarif per hari rawat

### Clinical Features
- `los_days`: Length of stay
- `num_procedures`: Jumlah prosedur
- `procedure_intensity`: Prosedur per hari

### Provider Features
- `provider_claims_count`: Total klaim provider
- `provider_high_cost_rate`: Persentase klaim high-cost provider

### Categorical
- Hospital, Doctor, ICD-10, Gender, Care class

## Fraud Patterns Detected

1. **Overcharging**: Provider konsisten charge 30-80% lebih tinggi
2. **Upcoding**: Klaim diagnosis severity tinggi dengan treatment biasa
3. **Unnecessary Procedures**: Prosedur berlebihan untuk diagnosis simple
4. **Extended Stay**: LOS 2x lebih lama dari normal
5. **Hospital Fraud**: RS dengan pola sistematis high tariff

## API Integration

Model di-load oleh API endpoint `/api/ml/fraud-detection` dan memberikan:
- `fraud_probability`: Probabilitas fraud (0-1)
- `risk_score`: Skor risiko (0-100)
- `risk_level`: low/medium/high/critical
- `risk_factors`: List faktor yang mencurigakan

## Testing

Test both fraud detection services:

```bash
# Install requests library for testing
pip install requests

# Run test suite
python test_fraud_detection.py
```

Test output akan menampilkan hasil deteksi untuk 4 test cases:
- Normal claim (low risk)
- Overcharging (high risk)
- Excessive procedures (high risk)
- Extended stay (medium risk)

## Production Usage

### Current Implementation (JavaScript)

Saat ini sistem menggunakan **JavaScript rules-based detection** yang:
- ✅ Sudah terintegrasi dengan claim submission
- ✅ Auto-calculate fraud risk saat rumah sakit submit
- ✅ Simpan risk score ke database (`ai_risk_score`, `ai_flags`)
- ✅ Auto-prioritize klaim berisiko tinggi (urgent/high priority)

### Upgrade to ML Model (Optional)

Untuk accuracy lebih tinggi, deploy Flask microservice:

```bash
# Terminal 1: Start Next.js (port 3000)
npm run dev

# Terminal 2: Start Flask ML service (port 5000)
cd ml
python ml_service.py
```

Kemudian update `/api/bpjs/claims/submit/route.js` line 94:
```javascript
// Change from:
const fraudResponse = await fetch('http://localhost:3000/api/ml/fraud-detection', ...

// To:
const fraudResponse = await fetch('http://localhost:5000/predict', ...
```

## BPJS Verification Display

Risk score dan flags ditampilkan di:
- `/bpjs/verifikasi` - List view (priority badge, AI flags)
- `/bpjs/verifikasi/[claimId]` - Detail view (risk analysis panel)

Auto-flagging logic:
```
Risk Score >= 80: URGENT priority, reject/investigate
Risk Score 60-79: HIGH priority, detailed review
Risk Score 40-59: NORMAL priority, standard review
Risk Score < 40:  LOW priority, quick approval
```

## Architecture

```
Hospital Submit Claim
        ↓
Next.js API (/api/bpjs/claims/submit)
        ↓
Fraud Detection API
  ├─→ JavaScript Rules (/api/ml/fraud-detection) [DEFAULT]
  └─→ Python ML Model (http://localhost:5000/predict) [OPTIONAL]
        ↓
Save to Supabase (claims table)
  - ai_risk_score (0-100)
  - ai_flags (JSON array)
  - priority (urgent/high/normal/low)
        ↓
BPJS Verification (/bpjs/verifikasi)
  - Auto-prioritize high risk claims
  - Display risk factors
  - Recommended actions
```

## Monitoring & Analytics

Track fraud detection performance:

```sql
-- High-risk claims count
SELECT COUNT(*) FROM claims WHERE ai_risk_score >= 60;

-- Fraud detection by hospital
SELECT hospital, AVG(ai_risk_score) as avg_risk
FROM claims
GROUP BY hospital
ORDER BY avg_risk DESC;

-- Top fraud patterns
SELECT ai_flags, COUNT(*) as frequency
FROM claims
WHERE ai_risk_score >= 70
GROUP BY ai_flags;
```

## Future Enhancements

1. **Provider History Tracking**: Calculate actual `provider_fraud_history_rate` from database
2. **Model Retraining**: Retrain setiap bulan dengan data baru
3. **A/B Testing**: Compare JavaScript vs ML model accuracy
4. **Ensemble Model**: Combine multiple ML models for better accuracy
5. **Real-time Monitoring**: Dashboard untuk track fraud patterns
6. **Feedback Loop**: BPJS verifier feedback untuk improve model
