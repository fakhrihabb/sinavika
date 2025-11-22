-- BPJS Verification System - Database Schema
-- Run this in Supabase SQL Editor

-- Table: claims
-- Main table for storing all claim submissions from hospitals
CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,
  hospital TEXT NOT NULL,
  hospital_code TEXT,

  -- Patient Information
  patient_name TEXT NOT NULL,
  patient_bpjs_number TEXT NOT NULL,
  patient_nik TEXT,
  patient_dob DATE,
  patient_gender TEXT,
  patient_phone TEXT,
  patient_address TEXT,

  -- SEP & Medical Record
  sep_number TEXT NOT NULL,
  sep_date DATE,
  rm_number TEXT,

  -- Admission Data
  admission_date TIMESTAMP,
  discharge_date TIMESTAMP,
  los_days INTEGER, -- Length of Stay
  care_class TEXT, -- Kelas Perawatan: 1, 2, 3
  care_type TEXT, -- Rawat Inap / Rawat Jalan

  -- GROUPER Result
  ina_cbg_code TEXT,
  ina_cbg_description TEXT,
  tarif_ina_cbg DECIMAL(15,2),
  tarif_rs DECIMAL(15,2),
  tarif_difference DECIMAL(15,2),
  tarif_difference_percentage DECIMAL(5,2),

  -- Claim Status
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, revision
  priority TEXT DEFAULT 'normal', -- normal, high, urgent
  ai_risk_score INTEGER, -- 0-100
  ai_flags JSONB, -- Array of AI detected issues

  -- Timestamps
  submitted_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  verified_by TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: claim_diagnoses
-- Stores primary, secondary, and tertiary diagnoses
CREATE TABLE IF NOT EXISTS claim_diagnoses (
  id SERIAL PRIMARY KEY,
  claim_id TEXT REFERENCES claims(id) ON DELETE CASCADE,
  diagnosis_type TEXT NOT NULL, -- primary, secondary, tertiary
  diagnosis_name TEXT NOT NULL,
  icd10_code TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: claim_procedures
-- Stores procedures performed during treatment
CREATE TABLE IF NOT EXISTS claim_procedures (
  id SERIAL PRIMARY KEY,
  claim_id TEXT REFERENCES claims(id) ON DELETE CASCADE,
  procedure_name TEXT NOT NULL,
  icd9cm_code TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: claim_documents
-- Stores uploaded document metadata
CREATE TABLE IF NOT EXISTS claim_documents (
  id SERIAL PRIMARY KEY,
  claim_id TEXT REFERENCES claims(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- SEP, Resume Medis, Hasil Lab, Hasil Radiologi, Resep Obat, Surat Rujukan
  file_name TEXT NOT NULL,
  file_url TEXT, -- Supabase Storage URL
  file_size INTEGER,
  verified BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Table: claim_verifications
-- Stores verification data from BPJS staff
CREATE TABLE IF NOT EXISTS claim_verifications (
  id SERIAL PRIMARY KEY,
  claim_id TEXT REFERENCES claims(id) ON DELETE CASCADE,

  -- Verification Decision
  decision TEXT NOT NULL, -- approve, reject, revision
  notes TEXT,

  -- Checklist
  checklist_identitas_pasien BOOLEAN DEFAULT false,
  checklist_diagnosis_sesuai BOOLEAN DEFAULT false,
  checklist_icd10_valid BOOLEAN DEFAULT false,
  checklist_prosedur_sesuai BOOLEAN DEFAULT false,
  checklist_dokumen_lengkap BOOLEAN DEFAULT false,
  checklist_tarif_wajar BOOLEAN DEFAULT false,

  -- Verifier Info
  verified_by TEXT NOT NULL,
  verified_by_name TEXT,
  verified_at TIMESTAMP DEFAULT NOW(),

  -- Revision requests (if any)
  revision_requests JSONB,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: hospitals
-- Master data for hospitals
CREATE TABLE IF NOT EXISTS hospitals (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  city TEXT,
  claims_total INTEGER DEFAULT 0,
  claims_approved INTEGER DEFAULT 0,
  claims_rejected INTEGER DEFAULT 0,
  issue_rate DECIMAL(5,2) DEFAULT 0,
  common_issues TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_hospital ON claims(hospital);
CREATE INDEX IF NOT EXISTS idx_claims_submitted_at ON claims(submitted_at);
CREATE INDEX IF NOT EXISTS idx_claims_priority ON claims(priority);
CREATE INDEX IF NOT EXISTS idx_claim_diagnoses_claim_id ON claim_diagnoses(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_procedures_claim_id ON claim_procedures(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_documents_claim_id ON claim_documents(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_verifications_claim_id ON claim_verifications(claim_id);

-- Function: Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger: Auto-update updated_at for claims table
CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON claims
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update updated_at for hospitals table
CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON hospitals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample hospitals data
INSERT INTO hospitals (code, name, region, city, claims_total, issue_rate, common_issues) VALUES
('RS001', 'RSUD Dr. Soetomo', 'Jawa Timur', 'Surabaya', 124, 18, 'Dokumen tidak lengkap'),
('RS002', 'RS Hasan Sadikin', 'Jawa Barat', 'Bandung', 142, 12, 'Kode ICD tidak sesuai'),
('RS003', 'RS Cipto Mangunkusumo', 'DKI Jakarta', 'Jakarta', 238, 8, 'Tarif tidak wajar'),
('RS004', 'RS Dr. Sardjito', 'DI Yogyakarta', 'Yogyakarta', 156, 10, 'Diagnosis kurang lengkap')
ON CONFLICT (code) DO NOTHING;

-- Insert sample claim data
INSERT INTO claims (
  id, hospital, hospital_code,
  patient_name, patient_bpjs_number, sep_number, rm_number,
  admission_date, discharge_date, los_days, care_class, care_type,
  ina_cbg_code, ina_cbg_description, tarif_ina_cbg, tarif_rs, tarif_difference, tarif_difference_percentage,
  status, priority, ai_risk_score, ai_flags, submitted_at
) VALUES
('CLM-2025-1847', 'RS Cipto Mangunkusumo', 'RS003',
 'Ahmad Fauzi', '0001234567890', '0301R0011024Y000001', '00-12-34-56',
 '2025-11-15 08:00:00', '2025-11-18 14:00:00', 3, '2', 'Rawat Inap',
 'E-4-10-I', 'Pneumonia & Pleurisy Age > 17 W CC', 4850000, 5234000, 384000, 7.9,
 'pending', 'high', 87, '["Dokumen tidak konsisten", "Pola klaim tidak biasa"]'::jsonb, '2025-11-18 15:30:00'),

('CLM-2025-1845', 'RS Dr. Sardjito', 'RS004',
 'Siti Aminah', '0001234567891', '0401R0011024Y000002', '00-12-34-57',
 '2025-11-16 10:00:00', '2025-11-19 16:00:00', 3, '1', 'Rawat Inap',
 'I-4-20-I', 'Major Cardiovascular Procedures W MCC', 15200000, 15700000, 500000, 3.3,
 'pending', 'high', 72, '["Kode ICD perlu review"]'::jsonb, '2025-11-19 17:00:00'),

('CLM-2025-1844', 'RS Hasan Sadikin', 'RS002',
 'Budi Santoso', '0001234567892', '0201R0011024Y000003', '00-12-34-58',
 '2025-11-17 09:00:00', '2025-11-18 11:00:00', 1, '3', 'Rawat Inap',
 'E-4-10-II', 'Pneumonia & Pleurisy Age > 17 W/O CC', 3800000, 4200000, 400000, 10.5,
 'pending', 'normal', 45, '[]'::jsonb, '2025-11-18 12:00:00');

-- Insert diagnoses for CLM-2025-1847
INSERT INTO claim_diagnoses (claim_id, diagnosis_type, diagnosis_name, icd10_code) VALUES
('CLM-2025-1847', 'primary', 'Pneumonia', 'J18.9'),
('CLM-2025-1847', 'secondary', 'Hipertensi Esensial', 'I10'),
('CLM-2025-1847', 'tertiary', 'Anemia', 'D64.9');

-- Insert procedures for CLM-2025-1847
INSERT INTO claim_procedures (claim_id, procedure_name, icd9cm_code, quantity) VALUES
('CLM-2025-1847', 'Transfusi PRC 2 kantong', '99.04', 2),
('CLM-2025-1847', 'Foto Rontgen Thorax AP', '87.44', 1);

-- Insert documents for CLM-2025-1847
INSERT INTO claim_documents (claim_id, document_type, file_name, verified) VALUES
('CLM-2025-1847', 'SEP', 'sep-ahmad-fauzi.pdf', true),
('CLM-2025-1847', 'Resume Medis', 'resume-medis-ahmad.pdf', true),
('CLM-2025-1847', 'Hasil Lab', 'hasil-lab-ahmad.pdf', true),
('CLM-2025-1847', 'Hasil Radiologi', 'hasil-radiologi-ahmad.pdf', false),
('CLM-2025-1847', 'Resep Obat', 'resep-obat-ahmad.pdf', true);

-- Insert diagnoses for CLM-2025-1845
INSERT INTO claim_diagnoses (claim_id, diagnosis_type, diagnosis_name, icd10_code) VALUES
('CLM-2025-1845', 'primary', 'Penyakit Jantung Koroner', 'I25.1'),
('CLM-2025-1845', 'secondary', 'Diabetes Melitus Tipe 2', 'E11.9');

-- Insert procedures for CLM-2025-1845
INSERT INTO claim_procedures (claim_id, procedure_name, icd9cm_code, quantity) VALUES
('CLM-2025-1845', 'Operasi Bypass Arteri Koroner', '36.1', 1),
('CLM-2025-1845', 'Echocardiography', '88.72', 1);

-- Insert documents for CLM-2025-1845
INSERT INTO claim_documents (claim_id, document_type, file_name, verified) VALUES
('CLM-2025-1845', 'SEP', 'sep-siti-aminah.pdf', true),
('CLM-2025-1845', 'Resume Medis', 'resume-medis-siti.pdf', true),
('CLM-2025-1845', 'Hasil Lab', 'hasil-lab-siti.pdf', true);

-- Insert diagnoses for CLM-2025-1844
INSERT INTO claim_diagnoses (claim_id, diagnosis_type, diagnosis_name, icd10_code) VALUES
('CLM-2025-1844', 'primary', 'Pneumonia Berat', 'J18.0');

-- Insert procedures for CLM-2025-1844
INSERT INTO claim_procedures (claim_id, procedure_name, icd9cm_code, quantity) VALUES
('CLM-2025-1844', 'Foto Thorax', '87.44', 1),
('CLM-2025-1844', 'Nebulizer', '93.94', 3);

-- Insert documents for CLM-2025-1844
INSERT INTO claim_documents (claim_id, document_type, file_name, verified) VALUES
('CLM-2025-1844', 'SEP', 'sep-budi-santoso.pdf', true),
('CLM-2025-1844', 'Resume Medis', 'resume-medis-budi.pdf', true);

-- Enable Row Level Security (RLS) - Optional, customize based on your auth needs
-- ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE claim_diagnoses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE claim_procedures ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE claim_documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE claim_verifications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (customize based on your authentication strategy)
-- Example: Allow BPJS staff to read all claims
-- CREATE POLICY "BPJS staff can view all claims" ON claims FOR SELECT USING (true);
-- CREATE POLICY "BPJS staff can update claims" ON claims FOR UPDATE USING (true);
