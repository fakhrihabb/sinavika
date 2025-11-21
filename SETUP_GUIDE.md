# SINAVIKA - Pre-Check Klaim Setup Guide

## Overview
The `/rumah-sakit/pre-check/[claimId]` page is now fully functional with real AI-powered document processing using Google Gemini API.

## Features Implemented

### ✅ 1. Real Gemini AI Integration
- Document analysis using Gemini 1.5 Flash multimodal model
- OCR and data extraction from medical documents
- Intelligent chat assistance for claim verification

### ✅ 2. Automatic Form Filling
When you upload a recognized medical document (resume medis), the chatbot will:
1. Extract patient information (name, age, gender, medical record number)
2. Extract treatment details (type, dates, DPJP, class)
3. Extract diagnoses with ICD-10 codes (primary, secondary, tertiary)
4. Extract procedures with ICD-9-CM codes
5. Extract medications and lab results
6. **Automatically offer to fill the E-Klaim form** with a single click

### ✅ 3. Supported Document Types
- **Resume Medis** (Medical Resume) - Full auto-fill support
- **Hasil Lab** (Laboratory Results) - Analysis and validation
- **Hasil Radiologi** (Radiology Results) - Reading and interpretation
- **Generic Medical Documents** - Basic processing

## Setup Instructions

### 1. Environment Variables
Your `.env` file is already configured with the Gemini API key:
```bash
GOOGLE_GEMINI_API_KEY=AIzaSyDvlnclDuFkdr7QSXJXvKKm2EWLknIYGWI
```

### 2. Install Dependencies
Already installed:
```bash
npm install @google/generative-ai
```

### 3. API Routes Created
Two API endpoints have been created:

#### `/api/analyze-document` (POST)
- Accepts: FormData with file upload
- Processes: PDF, JPG, PNG medical documents
- Returns: Structured JSON with extracted data

#### `/api/chat` (POST)
- Accepts: JSON with message, claimData, conversationHistory
- Processes: Natural language questions about claims
- Returns: AI-generated responses with suggestions

## How to Use

### For Testing the Pre-Check Page:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to a pre-check page:**
   ```
   http://localhost:3000/rumah-sakit/pre-check/CLM-2025-1847
   ```

3. **Upload a medical document:**
   - Click the 📎 Upload button in the AI Copilot panel (right sidebar)
   - Select a medical document:
     - For best results, name it with "resume" or "medis" in the filename
     - Supported formats: PDF, JPG, PNG
   - The AI will automatically process it

4. **Auto-fill the form:**
   - After processing, the chatbot will show extracted data
   - Click the "🚀 Auto-fill E-Klaim Form Sekarang" button
   - The form on the left will automatically populate with:
     - Treatment dates and type
     - DPJP (doctor name)
     - All diagnoses with ICD-10 codes
     - Procedures with ICD-9-CM codes
   - Fields that are auto-filled will highlight in green briefly

5. **Ask questions:**
   - Type questions in the chat like:
     - "Cek kode ICD & INA-CBG"
     - "Apa yang masih kurang?"
     - "Bagaimana meningkatkan skor?"
   - Get real-time AI-powered answers

## Document Processing Flow

```
User uploads file
       ↓
ChatPanel detects file type
       ↓
Calls /api/analyze-document
       ↓
Gemini 1.5 Flash analyzes image/PDF
       ↓
Extracts structured data (JSON)
       ↓
processDocumentData() formats response
       ↓
Shows extracted info in chat
       ↓
User clicks "Auto-fill" button
       ↓
onSuggestionApply() triggered
       ↓
EKlaimForm receives aiFilledData
       ↓
Form fields auto-populate
       ↓
Fields highlight in green (3 seconds)
```

## Sample Medical Document Test

To test with a real scenario, create a sample medical resume with:

**Minimum required information:**
- Patient name, age, gender
- Admission/discharge dates
- Doctor name (DPJP)
- At least one diagnosis with ICD-10 code
  - Example: "Diabetes Mellitus Tipe 2 (E11.9)"
  - Example: "Hipertensi Esensial (I10)"
  - Example: "Pneumonia (J18.9)"

The AI will extract this information and populate the form automatically.

## Troubleshooting

### If document processing fails:
1. Check that the API key is valid in `.env`
2. Check browser console for errors
3. Verify the file format is supported (PDF, JPG, PNG)
4. The system has a fallback to simulated responses if API fails

### If auto-fill doesn't work:
1. Ensure the document type is "resume_medis"
2. Check that diagnosis data was extracted
3. Look for the suggestion button in the chat response
4. Check browser console for any errors

### If chat doesn't respond:
1. Verify API key in `.env`
2. Check `/api/chat` endpoint is accessible
3. System will fallback to simulated responses if API fails

## ICD-10 and INA-CBG Auto-Lookup

The form has built-in intelligence:
- When you enter an ICD-10 code, it automatically looks up the INA-CBG code
- Tarif (rate) is calculated based on:
  - ICD-10 code
  - Treatment type (Rawat Jalan/Rawat Inap)
  - Class (Kelas 1/2/3)

### Supported ICD-10 codes in demo:
- **I10** - Hipertensi Esensial
- **E11.9** - Diabetes Mellitus Tipe 2
- **J18.9** - Pneumonia

More codes can be added in `EKlaimForm.js` in the `lookupInaCbg()` function.

## Next Steps

To enhance the system further:
1. Add more ICD-10 to INA-CBG mappings
2. Implement real document upload storage (currently in-memory)
3. Add validation rules for BPJS compliance
4. Integrate with actual e-Klaim API
5. Add support for more document types (surat rujukan, resep, etc.)

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze-document/
│   │   │   └── route.js          # Document processing API
│   │   └── chat/
│   │       └── route.js          # Chat API
│   └── rumah-sakit/
│       └── pre-check/
│           └── [claimId]/
│               └── page.js       # Main pre-check page
├── components/
│   ├── ChatPanel.js              # AI chatbot with upload
│   ├── EKlaimForm.js             # Form with auto-fill
│   └── RumahSakitNavbar.js
```

## Important Notes

⚠️ **Security**: The API key is currently in `.env`. In production:
- Use environment variables from hosting platform
- Never commit `.env` to git
- Rotate keys regularly

⚠️ **Rate Limits**: Gemini API has rate limits
- Flash model: 15 RPM (requests per minute)
- Monitor usage in Google AI Studio

⚠️ **Data Privacy**: Medical documents contain sensitive information
- Implement proper authentication
- Use HTTPS in production
- Consider data encryption
- Follow HIPAA/medical data regulations

## Support

For issues or questions:
1. Check browser console for errors
2. Check server logs for API errors
3. Verify Gemini API key is valid
4. Test with smaller/simpler documents first
