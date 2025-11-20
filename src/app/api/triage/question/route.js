import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { conversationHistory, currentAnswer } = body;

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Build conversation context
    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = conversationHistory
        .map(item => `Q: ${item.question}\nA: ${item.answer}`)
        .join('\n\n');
    }

    // Create prompt for generating next question
    const prompt = `Anda adalah asisten medis AI yang melakukan triase pasien melalui pertanyaan adaptif.

${conversationContext ? `Riwayat percakapan sejauh ini:\n${conversationContext}\n\nJawaban terakhir pasien: ${currentAnswer}\n\n` : 'Ini adalah awal percakapan triase.\n\n'}

Tugas Anda:
1. Analisis informasi yang sudah dikumpulkan
2. Tentukan apakah sudah cukup informasi untuk membuat keputusan triase yang akurat
3. Jika BELUM cukup, buatkan 1 pertanyaan lanjutan yang SPESIFIK dan RELEVAN untuk menggali informasi penting yang masih kurang
4. Jika SUDAH cukup, tandai bahwa triase siap dilakukan

Pertimbangan penting:
- Prioritaskan pertanyaan tentang gejala darurat (nyeri dada, sesak napas berat, pendarahan, dll)
- Tanyakan durasi, intensitas, faktor yang memperburuk/memperbaiki
- Tanyakan gejala penyerta yang relevan
- Tanyakan riwayat penyakit jika relevan dengan keluhan
- Jangan mengulang pertanyaan yang sudah dijawab
- Maksimal 5-7 pertanyaan total untuk menghindari kelelahan pasien
- Gunakan bahasa yang mudah dipahami, tidak terlalu medis

Berikan output dalam format JSON:
{
  "isComplete": true|false,
  "nextQuestion": "Pertanyaan lanjutan (kosongkan jika isComplete=true)",
  "questionType": "text|choice|multi-choice",
  "choices": ["Pilihan 1", "Pilihan 2", "..."] atau null jika questionType=text,
  "placeholderText": "Placeholder spesifik untuk input text (misalnya: 'Contoh: Demam tinggi sejak 3 hari yang lalu'), null jika questionType bukan text",
  "allowMultipleSelections": true|false (gunakan true jika pasien bisa mengalami beberapa gejala sekaligus, false jika hanya satu pilihan),
  "reasoning": "Penjelasan singkat mengapa pertanyaan ini penting atau mengapa sudah cukup",
  "collectedInfo": {
    "keluhanUtama": "Ringkasan keluhan utama",
    "durasi": "Durasi keluhan jika sudah ditanya",
    "intensitas": "Tingkat keparahan jika sudah ditanya",
    "gejalaLain": ["Gejala penyerta yang disebutkan"],
    "faktorRisiko": ["Faktor risiko atau riwayat penyakit yang relevan"]
  }
}

PENTING tentang questionType:
- Gunakan "text" untuk pertanyaan terbuka yang memerlukan jawaban bebas
- Gunakan "choice" untuk pertanyaan dengan SATU pilihan saja (misalnya: "Ya/Tidak", "Pagi/Siang/Malam")
- Gunakan "multi-choice" untuk pertanyaan di mana pasien BISA mengalami BEBERAPA gejala/kondisi sekaligus (misalnya: gejala penyerta seperti demam, leher kaku, mual, muntah - pasien bisa mengalami lebih dari satu)
- Untuk multi-choice, set allowMultipleSelections=true dan pastikan ada pilihan "Tidak ada" atau "Tidak ada yang lain" di akhir

PENTING: Jika ini pertanyaan pertama (tidak ada conversation history), mulai dengan pertanyaan terbuka tentang keluhan utama pasien.

Berikan HANYA output JSON tanpa teks tambahan.`;

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let questionData;
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      questionData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Error parsing AI response:', text);
      throw new Error('Gagal memproses respons AI. Silakan coba lagi.');
    }

    return NextResponse.json(questionData);

  } catch (error) {
    console.error('Question API Error:', error);
    return NextResponse.json(
      {
        error: 'Terjadi kesalahan saat memproses pertanyaan. Silakan coba lagi.',
        details: error.message
      },
      { status: 500 }
    );
  }
}
