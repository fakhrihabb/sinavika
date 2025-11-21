# Quick Start Guide - Pre-Check Klaim AI

## ✅ Setup Complete!

The `/rumah-sakit/pre-check/[claimId]` page is now **fully functional** with real AI-powered document processing.

## 🚀 How to Test

### 1. Open the Pre-Check Page
Your dev server is already running! Visit:
```
http://localhost:3000/rumah-sakit/pre-check/CLM-2025-1847
```

### 2. Upload a Medical Document
1. Look at the **right sidebar** - you'll see the "AI Copilot" panel
2. Click the **📎 Upload** button at the bottom
3. Upload any medical document (PDF, JPG, or PNG)
   - For best results, name it with "resume" or "medis" in filename
   - Example: `resume_medis.pdf` or `medical_resume.jpg`

### 3. Watch the Magic Happen! ✨
The AI will:
- **Analyze** the document using Gemini Vision
- **Extract** patient info, diagnoses, ICD-10 codes, procedures
- **Display** all extracted data in a structured format
- **Offer** to auto-fill the form with one click

### 4. Auto-Fill the Form
- Click the **"🚀 Auto-fill E-Klaim Form Sekarang"** button
- Watch as the form on the left automatically fills:
  - ✅ Treatment dates and type
  - ✅ Doctor name (DPJP)
  - ✅ Primary, secondary, and tertiary diagnoses
  - ✅ ICD-10 codes
  - ✅ Procedures with ICD-9-CM codes
- Green highlights show which fields were auto-filled!

### 5. Chat with the AI
Ask questions like:
- "Cek kode ICD & INA-CBG"
- "Apa yang masih kurang?"
- "Bagaimana meningkatkan skor klaim?"

The AI will analyze your claim and give specific recommendations!

## 📋 What's Working

### ✅ Real Gemini AI Integration
- Using Google Gemini 1.5 Flash multimodal model
- OCR and intelligent data extraction
- Natural language chat support

### ✅ Automatic Form Filling
- One-click auto-fill from uploaded documents
- Intelligent field mapping
- Visual feedback with green highlights

### ✅ Smart Document Processing
**Resume Medis** → Full extraction + auto-fill
- Patient information
- Treatment details
- Diagnoses with ICD-10 codes
- Procedures with ICD-9-CM codes
- Medications

**Lab Results** → Analysis and interpretation
- Test values and normal ranges
- Status indicators (high/low/normal)
- Relevant findings for diagnosis

**Radiology** → Reading and validation
- Exam type and findings
- Radiologist conclusion

### ✅ INA-CBG Auto-Lookup
When you enter an ICD-10 code, the system automatically:
- Looks up the correct INA-CBG code
- Calculates tarif based on treatment type and class
- Displays in a prominent card

**Supported ICD-10 codes:**
- `I10` - Hipertensi Esensial
- `E11.9` - Diabetes Mellitus Tipe 2
- `J18.9` - Pneumonia

## 🎯 Key Features

1. **Real-time AI Chat** - Ask anything about the claim
2. **Document Upload** - Drag & drop medical files
3. **Auto-fill Magic** - One click to populate entire form
4. **Smart Validation** - Pre-check documents before sending to BPJS
5. **Readiness Score** - Know if claim is ready to submit
6. **Issue Detection** - Automatically find missing documents

## 📱 Test Scenarios

### Scenario 1: Upload Resume Medis
Upload a medical resume → AI extracts data → Click auto-fill → Form populated!

### Scenario 2: Ask for Help
Type: "Apa yang masih kurang?" → AI analyzes claim → Shows missing items

### Scenario 3: Check ICD Codes
Type: "Cek kode ICD & INA-CBG" → AI validates codes → Suggests corrections

## 🔧 Technical Details

**API Endpoints Created:**
- `/api/analyze-document` - Document processing with Gemini Vision
- `/api/chat` - Conversational AI for claim assistance

**Components Updated:**
- `ChatPanel.js` - Real API integration, file upload handler
- `EKlaimForm.js` - Auto-fill support, INA-CBG lookup
- Pre-check page - Fully functional workflow

**AI Model:**
- Google Gemini 1.5 Flash (multimodal)
- Supports: Images (PDF, JPG, PNG) + Text

## 📝 Sample Test Data

Create a simple medical document with:
```
RESUME MEDIS

Nama: Ahmad Fauzi
Umur: 52 tahun, L
Tanggal: 5 September 2020

DPJP: dr. Budi

Diagnosa:
1. Diabetes Mellitus Tipe 2 (E11.9)
2. Hipertensi Esensial (I10)

Tindakan:
- Konsultasi
- Pemeriksaan Laboratorium

Jenis Rawat: Rawat Jalan
```

Save as image or PDF, upload it, and watch the AI work!

## 🎉 You're Ready!

Everything is set up and working. Just visit:
**http://localhost:3000/rumah-sakit/pre-check/CLM-2025-1847**

For more details, see `SETUP_GUIDE.md`
