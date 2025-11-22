"""
Generate synthetic claims data for fraud detection training
Creates 1000 rows with realistic patterns and fraud cases
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

# Configuration
NUM_CLAIMS = 1000
FRAUD_RATE = 0.15  # 15% fraud rate

# Master data
HOSPITALS = [
    'RS001', 'RS002', 'RS003', 'RS004', 'RS005',
    'RS006', 'RS007', 'RS008', 'RS009', 'RS010'
]

DOCTORS = [
    f'DR{str(i).zfill(3)}' for i in range(1, 51)
]

ICD10_CODES = [
    ('J18.9', 'Pneumonia', 4850000, 3),  # (ICD, name, avg_tariff, avg_los)
    ('I10', 'Hipertensi', 2500000, 1),
    ('E11.9', 'Diabetes Type 2', 3200000, 2),
    ('A09', 'Gastroenteritis', 1800000, 2),
    ('J20.9', 'Bronkitis', 2100000, 2),
    ('I25.1', 'Penyakit Jantung Koroner', 15200000, 5),
    ('N18.9', 'CKD', 8500000, 4),
    ('K35.8', 'Appendicitis', 7250000, 3),
    ('O80', 'Persalinan Normal', 3500000, 2),
    ('S06.0', 'Trauma Kepala', 12000000, 4)
]

ICD9_PROCEDURES = [
    ('99.04', 'Transfusi Darah'),
    ('87.44', 'Foto Thorax'),
    ('88.72', 'Echocardiography'),
    ('36.1', 'Bypass Arteri Koroner'),
    ('93.94', 'Nebulizer'),
    ('37.22', 'Kateterisasi Jantung'),
    ('54.59', 'Laparotomi'),
    ('74.1', 'Sectio Caesarea'),
    ('03.09', 'Kraniotomi')
]

CARE_CLASSES = ['1', '2', '3']

def generate_claims_data():
    """Generate synthetic claims dataset with fraud patterns"""

    data = []

    # Track provider statistics for fraud pattern injection
    provider_claims_count = {doc: 0 for doc in DOCTORS}
    provider_high_cost_count = {doc: 0 for doc in DOCTORS}

    # Designate some providers as "fraudulent" (will have suspicious patterns)
    fraudulent_providers = random.sample(DOCTORS, 8)  # 8 out of 50 doctors
    fraudulent_hospitals = random.sample(HOSPITALS, 2)  # 2 out of 10 hospitals

    for i in range(NUM_CLAIMS):
        # Random selection
        hospital_code = random.choice(HOSPITALS)
        doctor_id = random.choice(DOCTORS)
        diagnosis = random.choice(ICD10_CODES)
        care_class = random.choice(CARE_CLASSES)

        icd10_code, diagnosis_name, base_tariff_inacbg, base_los = diagnosis

        # Generate base values
        tarif_inacbg = base_tariff_inacbg * (1 + np.random.normal(0, 0.1))  # +/- 10% variation
        los = max(1, int(base_los + np.random.normal(0, 1)))

        # Generate procedures (0-3 procedures)
        num_procedures = random.randint(0, 3)
        procedures = random.sample(ICD9_PROCEDURES, num_procedures)
        procedure_codes = ','.join([p[0] for p in procedures])

        # Calculate tarif RS with normal variation
        tarif_rs = tarif_inacbg * (1 + np.random.normal(0, 0.15))  # +/- 15% variation

        # FRAUD PATTERN INJECTION
        is_fraud = 0
        fraud_type = 'legitimate'

        # Pattern 1: Fraudulent providers charge significantly higher
        if doctor_id in fraudulent_providers and random.random() < 0.7:
            # Inflate tarif by 30-80%
            tarif_rs = tarif_inacbg * (1.3 + random.random() * 0.5)
            is_fraud = 1
            fraud_type = 'overcharging'

        # Pattern 2: Fraudulent hospitals have suspicious high-cost patterns
        if hospital_code in fraudulent_hospitals and random.random() < 0.6:
            tarif_rs = tarif_inacbg * (1.4 + random.random() * 0.6)
            is_fraud = 1
            fraud_type = 'hospital_fraud'

        # Pattern 3: Upcoding - claiming higher severity
        if random.random() < 0.05:  # 5% random upcoding
            # Claim higher tariff diagnosis but keep original
            tarif_inacbg_claimed = tarif_inacbg * 1.5
            tarif_rs = tarif_inacbg_claimed * 1.3
            is_fraud = 1
            fraud_type = 'upcoding'

        # Pattern 4: Excessive procedures for simple diagnosis
        if len(procedures) >= 3 and tarif_inacbg < 3000000:
            tarif_rs = tarif_inacbg * (1.5 + random.random() * 0.5)
            is_fraud = 1
            fraud_type = 'unnecessary_procedures'

        # Pattern 5: Unusually long LOS for diagnosis
        if los > base_los * 2:
            tarif_rs = tarif_inacbg * (1.3 + random.random() * 0.4)
            is_fraud = 1
            fraud_type = 'extended_stay'

        # Calculate derived features
        tariff_ratio = tarif_rs / tarif_inacbg if tarif_inacbg > 0 else 1.0
        tariff_difference = tarif_rs - tarif_inacbg
        tariff_diff_percentage = ((tarif_rs - tarif_inacbg) / tarif_inacbg * 100) if tarif_inacbg > 0 else 0

        # Track provider statistics
        provider_claims_count[doctor_id] += 1
        if tariff_ratio > 1.2:
            provider_high_cost_count[doctor_id] += 1

        # Provider fraud rate (historical)
        provider_fraud_rate = provider_high_cost_count[doctor_id] / max(provider_claims_count[doctor_id], 1)

        # Generate dates
        submitted_date = datetime.now() - timedelta(days=random.randint(0, 90))
        admission_date = submitted_date - timedelta(days=los + random.randint(1, 5))
        discharge_date = admission_date + timedelta(days=los)

        # Build record
        record = {
            'claim_id': f'CLM-2025-{str(i+2000).zfill(4)}',
            'hospital_code': hospital_code,
            'doctor_id': doctor_id,
            'patient_age': random.randint(18, 85),
            'patient_gender': random.choice(['L', 'P']),
            'icd10_code': icd10_code,
            'diagnosis_name': diagnosis_name,
            'procedures': procedure_codes,
            'num_procedures': num_procedures,
            'care_class': care_class,
            'los_days': los,
            'admission_date': admission_date.strftime('%Y-%m-%d'),
            'discharge_date': discharge_date.strftime('%Y-%m-%d'),
            'submitted_date': submitted_date.strftime('%Y-%m-%d'),
            'tarif_inacbg': round(tarif_inacbg, 2),
            'tarif_rs': round(tarif_rs, 2),
            'tariff_difference': round(tariff_difference, 2),
            'tariff_ratio': round(tariff_ratio, 4),
            'tariff_diff_percentage': round(tariff_diff_percentage, 2),
            'provider_claims_count': provider_claims_count[doctor_id],
            'provider_high_cost_rate': round(provider_fraud_rate, 4),
            'is_fraud': is_fraud,
            'fraud_type': fraud_type
        }

        data.append(record)

    # Create DataFrame
    df = pd.DataFrame(data)

    # Print statistics
    print(f"✅ Generated {len(df)} claims")
    print(f"📊 Fraud rate: {df['is_fraud'].mean()*100:.2f}%")
    print(f"\nFraud distribution by type:")
    print(df[df['is_fraud']==1]['fraud_type'].value_counts())
    print(f"\nFeature statistics:")
    print(df[['tariff_ratio', 'tariff_diff_percentage', 'los_days', 'num_procedures']].describe())

    return df

if __name__ == '__main__':
    # Generate data
    df = generate_claims_data()

    # Save to CSV
    output_path = 'claims_fraud_dataset.csv'
    df.to_csv(output_path, index=False)
    print(f"\n✅ Dataset saved to: {output_path}")

    # Display sample
    print("\n📋 Sample records:")
    print(df.head(10))

    print("\n🚨 Fraud examples:")
    print(df[df['is_fraud']==1].head(5)[['claim_id', 'doctor_id', 'tariff_ratio', 'fraud_type']])
