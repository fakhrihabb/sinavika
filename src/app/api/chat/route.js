import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { message, claimData, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'No message provided' },
        { status: 400 }
      );
    }

    // Use Gemini 2.0 Flash for chat
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Build system prompt
    const systemPrompt = `Anda adalah AI Copilot SINAVIKA untuk membantu rumah sakit melengkapi klaim BPJS.

KONTEKS KLAIM SAAT INI:
- No. Klaim: ${claimData?.id || 'N/A'}
- Pasien: ${claimData?.patientName || 'N/A'}
- Diagnosa: ${claimData?.diagnosis || 'N/A'}
- Jenis Rawat: ${claimData?.treatmentType || 'N/A'}

TUGAS ANDA:
1. Membantu verifikasi kelengkapan dokumen klaim
2. Menyarankan kode ICD-10 yang tepat berdasarkan diagnosa
3. Memberikan rekomendasi INA-CBG
4. Mendeteksi potensi masalah yang bisa menyebabkan klaim pending atau ditolak
5. Memberikan tips untuk meningkatkan approval rate di BPJS

GUIDELINES:
- Berikan jawaban yang spesifik dan actionable
- Gunakan format yang jelas dengan bullet points dan emoji
- Fokus pada workflow E-Klaim BPJS Indonesia
- Jika menyarankan kode ICD-10, jelaskan alasannya
- Jika ada masalah, berikan solusi konkret`;

    // Build chat history - filter out assistant's initial greeting to avoid "model" as first role
    const chatHistory = conversationHistory
      ?.filter(msg => msg.role !== 'assistant' || conversationHistory.indexOf(msg) > 0) // Skip first assistant message
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })) || [];

    // Combine system prompt with user message
    const fullMessage = `${systemPrompt}\n\nPertanyaan user: ${message}`;

    // Start chat with history
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    const result = await chat.sendMessage(fullMessage);
    const response = await result.response;
    const text = response.text();

    // Check if response suggests specific actions
    let suggestion = null;
    const lowerText = text.toLowerCase();

    if (lowerText.includes('auto-fill') || lowerText.includes('isi form')) {
      suggestion = {
        text: '🚀 Auto-fill E-Klaim Form',
        action: 'autofill-form'
      };
    } else if (lowerText.includes('kode icd') && (lowerText.includes('e11') || lowerText.includes('i10') || lowerText.includes('j18'))) {
      suggestion = {
        text: '✨ Terapkan Kode ICD',
        action: 'apply-icd'
      };
    }

    return NextResponse.json({
      success: true,
      response: text,
      suggestion: suggestion
    });

  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process chat' },
      { status: 500 }
    );
  }
}
