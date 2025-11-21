# AI Triage Setup Guide

## Overview

The AI Triage feature uses **Google's Gemini 2.0 Flash** model to provide intelligent, adaptive health triage in Bahasa Indonesia. The system uses conversational AI to ask follow-up questions based on patient responses, ensuring high specificity and proper understanding of the patient's condition.

## Features Implemented

### 1. **Adaptive Conversational Triage** ([src/app/peserta/triage/page.js](src/app/peserta/triage/page.js))
   - AI-generated follow-up questions based on previous answers
   - Dynamic question types (text input or multiple choice)
   - Chat-like interface with message bubbles
   - Auto-scrolling conversation view
   - Real-time loading indicators
   - Consistent design with brand colors (#03974a green and #144782 blue)

### 2. **Question Generation API** ([src/app/api/triage/question/route.js](src/app/api/triage/question/route.js))
   - **Emergency Detection**: Prioritizes identifying life-threatening conditions in first 1-3 questions
   - **Early Termination**: Automatically stops questioning if emergency symptoms detected (bleeding, chest pain, severe breathing difficulty, stroke, etc.)
   - **10-Question Limit**: Hard limit of maximum 10 questions to avoid patient fatigue
   - Analyzes conversation history
   - Generates contextually relevant follow-up questions
   - Determines when enough information has been collected
   - Provides reasoning for each question
   - Supports three question types:
     - **Text**: Free-form text input for open-ended questions
     - **Choice**: Single-selection multiple choice (radio button style)
     - **Multi-choice**: Multiple-selection for symptoms that can occur together (checkbox style)

### 3. **Final Triage Analysis API** ([src/app/api/triage/route.js](src/app/api/triage/route.js))
   - Comprehensive analysis of complete conversation
   - Severity categorization (Emergency, High, Medium, Low)
   - Service recommendations (IGD, Poli Spesialis, Poli Umum, etc.)
   - Action items for patients
   - Warning signs to watch for
   - Clinical summary for healthcare providers
   - Aligns with JKN's tiered referral system

## Google Cloud Platform Setup

### Step 1: Get Your Gemini API Key

#### Option A: Using Google AI Studio (Recommended - Fastest)

1. **Visit Google AI Studio:**
   - Go to: https://aistudio.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key:**
   - Click **"Create API Key"**
   - Choose an existing Google Cloud project or create a new one
   - Click **"Create API key in existing project"** or **"Create API key in new project"**
   - Copy the generated API key (it will look like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

#### Option B: Using Google Cloud Console (For Production)

1. **Create/Select a Project:**
   - Go to: https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Enable the API:**
   - Navigate to **APIs & Services > Library**
   - Search for "Generative Language API"
   - Click **Enable**

3. **Create Credentials:**
   - Go to **APIs & Services > Credentials**
   - Click **Create Credentials > API Key**
   - Copy the API key
   - (Optional) Click **Restrict Key** to add security restrictions:
     - HTTP referrers (for websites)
     - IP addresses (for servers)
     - API restrictions (limit to Generative Language API only)

### Step 2: Add Environment Variable

Create a `.env.local` file in the project root (or add to existing):

```bash
GOOGLE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Important:**
- Never commit `.env.local` to version control
- The `.env.local` file is already in `.gitignore`
- For production deployment (Vercel, etc.), add this as an environment variable in your hosting platform

### Step 3: Verify Setup

Run the development server:

```bash
npm run dev
```

Navigate to: http://localhost:3000/peserta/triage

If the AI responds to your first message, the setup is successful!

## Environment Variables Reference

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `GOOGLE_GEMINI_API_KEY` | Gemini API key from Google AI Studio or GCP | `AIzaSyXXXXXX...` | Yes |

## Pricing Information

### Gemini 2.0 Flash (Experimental)

**Free Tier (Current):**
- Up to **1,500 requests per day**
- **1 million tokens per minute** (TPM) for input
- **10 million tokens per day**

**Estimated Costs After Free Tier:**
- Similar to Gemini 1.5 Flash pricing
- Input: ~$0.075 per 1M tokens
- Output: ~$0.30 per 1M tokens
- Typical triage session (500 tokens in/out): ~**$0.0002 per session**

**Note:** Gemini 2.0 Flash is currently in experimental phase with a generous free tier. Pricing may change when it moves to stable release.

## How It Works

### 1. Adaptive Questioning Flow

```
User visits /peserta/triage
    ↓
AI asks initial question (e.g., "Apa keluhan utama Anda?")
    ↓
User responds
    ↓
AI analyzes response and determines next question
    ↓
Repeat until AI determines sufficient information gathered
    ↓
Final triage analysis performed
    ↓
Results displayed with recommendations
```

### 2. Question Generation Logic

The AI considers:
- **Emergency symptoms**: Prioritizes questions about life-threatening conditions (questions 1-3)
- **Specificity**: Asks about duration, intensity, and aggravating factors
- **Associated symptoms**: Explores related symptoms
- **Medical history**: Relevant pre-existing conditions
- **Conversation fatigue**: Hard limit of 10 questions maximum
  - After question 8: AI begins considering completion
  - At question 10: Automatically forces completion regardless of information gathered

### 3. Triage Classification

**Emergency (Gawat Darurat):** ⚠️ **Early Detection Priority**
- The AI is trained to detect these in the **first 1-3 questions** and terminate questioning immediately
- Uncontrolled/heavy bleeding
- Chest pain (especially radiating to arm/jaw)
- Severe breathing difficulty/unable to speak
- Loss of consciousness/fainting
- Stroke (one-sided weakness, slurred speech, facial asymmetry)
- Head trauma with bleeding/vomiting/severe dizziness
- Seizures
- Sudden severe abdominal pain
- Extensive burns
- Open fractures
- → Recommendation: **IGD (Emergency Room) IMMEDIATELY**

**High (Perlu dokter hari ini):**
- Persistent high fever, acute infections
- Severe pain, acute symptoms
- → Recommendation: Poli Spesialis or Poli Umum today

**Medium (Perlu dokter dalam 1-3 hari):**
- Moderate symptoms, subacute conditions
- Stable chronic conditions with changes
- → Recommendation: Poli Umum within 1-3 days

**Low (Dapat ditangani sendiri):**
- Minor symptoms, self-limiting conditions
- → Recommendation: Self-care with monitoring

## API Endpoints

### POST `/api/triage/question`

Generate next adaptive question based on conversation history.

**Request Body:**
```json
{
  "conversationHistory": [
    {
      "question": "Apa keluhan utama Anda?",
      "answer": "Demam tinggi dan batuk",
      "timestamp": "2025-11-20T10:30:00Z"
    }
  ],
  "currentAnswer": "Sudah 3 hari"
}
```

**Response (Choice question):**
```json
{
  "isComplete": false,
  "nextQuestion": "Seberapa parah demamnya? Apakah lebih dari 38.5°C?",
  "questionType": "choice",
  "choices": ["Ya, lebih dari 38.5°C", "Tidak, di bawah 38.5°C", "Tidak tahu"],
  "placeholderText": null,
  "allowMultipleSelections": false,
  "reasoning": "Menentukan tingkat keparahan demam penting untuk klasifikasi triase",
  "collectedInfo": {
    "keluhanUtama": "Demam tinggi dan batuk",
    "durasi": "3 hari",
    "intensitas": null,
    "gejalaLain": [],
    "faktorRisiko": []
  }
}
```

**Response (Multi-choice question):**
```json
{
  "isComplete": false,
  "nextQuestion": "Selain sakit kepala, apakah Anda mengalami gejala lain seperti demam, leher kaku, mual, muntah, gangguan penglihatan, atau kelemahan pada anggota tubuh?",
  "questionType": "multi-choice",
  "choices": [
    "Demam",
    "Leher kaku",
    "Mual",
    "Muntah",
    "Gangguan penglihatan",
    "Kelemahan pada anggota tubuh",
    "Tidak ada"
  ],
  "placeholderText": null,
  "allowMultipleSelections": true,
  "reasoning": "Gejala penyerta ini membantu menentukan apakah sakit kepala memerlukan evaluasi lebih lanjut",
  "collectedInfo": {
    "keluhanUtama": "Sakit kepala dengan intensitas 8",
    "durasi": "Sejak pagi",
    "intensitas": "8/10",
    "gejalaLain": [],
    "faktorRisiko": []
  }
}
```

### POST `/api/triage`

Perform final triage analysis based on complete conversation.

**Request Body:**
```json
{
  "conversationHistory": [
    {
      "question": "Apa keluhan utama Anda?",
      "answer": "Demam tinggi dan batuk",
      "timestamp": "2025-11-20T10:30:00Z"
    },
    // ... more Q&A pairs
  ]
}
```

**Response:**
```json
{
  "tingkatKeparahan": "medium",
  "labelKeparahan": "Perlu dokter dalam 1-3 hari",
  "rekomendasiLayanan": "Poli Umum",
  "alasan": "Demam dan batuk selama 3 hari menunjukkan kemungkinan infeksi saluran pernapasan...",
  "tindakan": [
    "Minum banyak air putih dan istirahat cukup",
    "Konsumsi obat penurun panas jika demam tinggi",
    "Kunjungi Poli Umum dalam 1-2 hari ke depan"
  ],
  "tanggalKunjunganDisarankan": "1-3 hari ke depan",
  "perluRujukan": false,
  "catatanTambahan": "Jika demam tidak turun dalam 3 hari atau sesak napas, segera ke IGD",
  "gejalaBahaya": [
    "Sesak napas yang semakin memberat",
    "Demam lebih dari 5 hari",
    "Batuk berdarah"
  ],
  "ringkasanKlinis": "Pasien dengan keluhan demam tinggi dan batuk selama 3 hari...",
  "triageId": "TRG-2025-0842",
  "timestamp": "2025-11-20T10:35:00Z",
  "conversationSummary": [...]
}
```

## Troubleshooting

### Issue: "Terjadi kesalahan saat memproses pertanyaan"

**Solution:**
1. Check that `GOOGLE_GEMINI_API_KEY` is set in `.env.local`
2. Verify the API key is valid at https://aistudio.google.com/app/apikey
3. Check console logs for detailed error messages
4. Ensure you haven't exceeded the free tier quota (1,500 requests/day)

### Issue: API key not working

**Solution:**
1. Make sure the API key starts with `AIzaSy`
2. Ensure "Generative Language API" is enabled in Google Cloud Console
3. Check if there are any IP or referrer restrictions on the key
4. Try creating a new unrestricted API key for testing

### Issue: Questions not appearing

**Solution:**
1. Open browser DevTools > Network tab
2. Check for failed API requests to `/api/triage/question`
3. Look at the response body for error details
4. Restart the dev server (`npm run dev`)

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Restrict API keys** in production:
   - Add HTTP referrer restrictions for web apps
   - Add IP restrictions for server-side apps
   - Limit to "Generative Language API" only
4. **Monitor usage** in Google Cloud Console to detect unusual activity
5. **Rotate keys** periodically

## Supabase Setup (Triage History)

### Step 1: Get Your Supabase Credentials

The project is already connected to Supabase for storing triage history. You need to add your Supabase anon key to the environment variables.

1. **Get the Anon Key:**
   - The Supabase URL is already configured: `https://xiqcpytcvubmypevflme.supabase.co`
   - Get the anon key from your Supabase project dashboard
   - Go to: Project Settings > API > Project API keys
   - Copy the `anon` `public` key

2. **Database Schema:**
   - The database table `triage_history` has already been created
   - It includes all necessary fields for storing triage results
   - Row Level Security (RLS) is enabled

### Step 2: Add Supabase Environment Variable

Add to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

The URL is already configured in the codebase.

### Step 3: Verify Triage History

1. Complete a triage session at `/peserta/triage`
2. View your triage history at `/peserta/riwayat`
3. Check the Supabase dashboard to see the saved data

## Features

### Triage History
- **Automatic Saving**: Every triage result is automatically saved to the database
- **History View**: Users can view all their past triage results at `/peserta/riwayat`
- **Search & Filter**: Search by complaint or recommendation, filter by severity level
- **Detailed View**: Click on any triage record to see the full details

## Next Steps

After completing setup, you can:

1. **Test the triage flow** at `/peserta/triage`
2. **View triage history** at `/peserta/riwayat`
3. **Customize prompts** in API route files for your specific use case
4. **Add image upload** for visual symptom analysis (as per PROJECT-FLOW.md)
5. **Add authentication** to track user-specific triage sessions (replace `demo-user`)
6. **Deploy to production** with environment variables configured

## Support

For issues related to:
- **Google Cloud/Gemini API**: https://cloud.google.com/support
- **This implementation**: Check the code comments or open an issue

## Model Information

**Current Model:** `gemini-2.0-flash-exp`

**Alternatives if needed:**
- `gemini-1.5-flash`: Stable version (if 2.0 has issues)
- `gemini-1.5-pro`: More capable but slower and more expensive
- `gemini-2.0-pro-exp`: Most advanced (experimental, higher costs)

To change models, edit the `model` parameter in:
- [src/app/api/triage/route.js](src/app/api/triage/route.js) (line 21)
- [src/app/api/triage/question/route.js](src/app/api/triage/question/route.js) (line 12)
