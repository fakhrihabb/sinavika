import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { conversationHistory, currentAnswer } = body;

    // Hard limit: If already 10 questions asked, force completion
    const questionCount = conversationHistory ? conversationHistory.length : 0;
    if (questionCount >= 10) {
      return NextResponse.json({
        isComplete: true,
        nextQuestion: '',
        questionType: 'text',
        choices: null,
        placeholderText: null,
        allowMultipleSelections: false,
        reasoning: 'Informasi yang dikumpulkan sudah cukup untuk melakukan triase.',
        collectedInfo: {
          keluhanUtama: 'Informasi lengkap telah terkumpul',
          durasi: '',
          intensitas: '',
          gejalaLain: [],
          faktorRisiko: []
        }
      });
    }

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

${conversationContext ? `Riwayat percakapan sejauh ini:\n${conversationContext}\n\nJawaban terakhir pasien: ${currentAnswer}\n\n**PENTING: Ini adalah pertanyaan ke-${questionCount + 1}. Maksimal 10 pertanyaan!**\n\n` : 'Ini adalah awal percakapan triase (Pertanyaan 1 dari maksimal 10).\n\n'}

Tugas Anda:
1. **PRIORITAS UTAMA**: Dalam 1-3 pertanyaan pertama, identifikasi apakah ini kondisi GAWAT DARURAT yang memerlukan IGD SEGERA
2. Jika terdeteksi gejala darurat (seperti: pendarahan hebat, nyeri dada, sesak napas berat, stroke, trauma kepala, penurunan kesadaran, kejang), LANGSUNG set isComplete=true tanpa pertanyaan tambahan
3. Jika BUKAN gawat darurat, lanjutkan dengan pertanyaan untuk menentukan tingkat keparahan
4. **BATAS MAKSIMAL: 10 pertanyaan total** - Setelah pertanyaan ke-8, Anda HARUS mulai mempertimbangkan untuk menyelesaikan triase
5. **WAJIB SELESAI** pada pertanyaan ke-10 - Jika sudah 10 pertanyaan, set isComplete=true

**GEJALA DARURAT yang harus langsung dihentikan (isComplete=true):**
- Pendarahan yang tidak terkontrol/hebat
- Nyeri dada yang menjalar ke lengan/rahang
- Sesak napas berat/tidak bisa berbicara
- Penurunan kesadaran/pingsan
- Stroke (kelemahan mendadak satu sisi tubuh, bicara pelo, wajah tidak simetris)
- Trauma kepala dengan pendarahan/muntah/pusing berat
- Kejang
- Nyeri perut hebat mendadak
- Luka bakar luas
- Patah tulang terbuka

Pertimbangan penting:
- **3 pertanyaan pertama HARUS fokus pada RED FLAGS untuk deteksi emergency**
- **WAJIB GALI LEBIH DALAM** sebelum mengakhiri triase untuk gejala berikut:
  * Sakit kepala mendadak/parah: Tanya tentang leher kaku, muntah proyektil, gangguan kesadaran, gangguan penglihatan
  * Nyeri dada: Tanya tentang penjalaran ke lengan/rahang, sesak napas, keringat dingin
  * Pendarahan: Tanya jumlah, bisa dikontrol atau tidak, ada trauma atau tidak
  * Sesak napas: Tanya bisa berbicara atau tidak, nyeri dada, batuk darah
  * Nyeri perut: Tanya lokasi, keparahan, muntah, demam
- **JANGAN langsung selesaikan triase** jika ada indikasi RED FLAG tanpa konfirmasi tambahan (minimal 1 pertanyaan lanjutan)
- Jika pasien menyebutkan kata kunci seperti "pendarahan", "tidak sadar", "nyeri dada", "sesak napas", "kejang", "sakit kepala parah" → gali lebih dalam SEGERA di pertanyaan berikutnya
- Jangan mengulang pertanyaan yang sudah dijawab
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
