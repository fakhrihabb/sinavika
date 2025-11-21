import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { conversationHistory } = body;

    // Validate required fields
    if (!conversationHistory || conversationHistory.length === 0) {
      return NextResponse.json(
        { error: 'Data percakapan tidak lengkap. Mohon jawab pertanyaan triase terlebih dahulu.' },
        { status: 400 }
      );
    }

    // Initialize the model (using Gemini 2.0 Flash for speed and cost-efficiency)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Build conversation summary
    const conversationText = conversationHistory
      .map((item, index) => `${index + 1}. Q: ${item.question}\n   A: ${item.answer}`)
      .join('\n\n');

    // Create comprehensive prompt in Bahasa Indonesia
    const prompt = `Anda adalah asisten medis AI yang membantu melakukan triase pasien untuk sistem Jaminan Kesehatan Nasional (JKN) di Indonesia.

Berikut adalah percakapan lengkap dengan pasien:

${conversationText}

Berdasarkan informasi di atas, berikan analisis triase dalam format JSON dengan struktur berikut:

{
  "tingkatKeparahan": "emergency|high|medium|low",
  "labelKeparahan": "Gawat Darurat|Perlu dokter hari ini|Perlu dokter dalam 1-3 hari|Dapat ditangani sendiri",
  "rekomendasiLayanan": "IGD|Poli Spesialis [nama spesialis]|Poli Umum|Faskes Tingkat Pertama|Perawatan Mandiri",
  "namaSpesialis": "Nama spesialisasi jika rekomendasiLayanan adalah Poli Spesialis (misalnya: Penyakit Dalam, Bedah, Anak, dll), kosongkan jika tidak ada",
  "alasan": "Penjelasan singkat mengapa pasien dikategorikan dengan tingkat keparahan ini (2-3 kalimat)",
  "tindakan": [
    "Tindakan pertama yang harus dilakukan",
    "Tindakan kedua",
    "Tindakan ketiga (jika ada)"
  ],
  "tanggalKunjunganDisarankan": "Segera/Hari ini/Besok/1-3 hari ke depan/Jika memburuk",
  "perluRujukan": true|false,
  "catatanTambahan": "Catatan penting lainnya untuk pasien atau tenaga medis",
  "gejalaBahaya": [
    "Gejala bahaya yang harus diwaspadai (jika ada)"
  ],
  "ringkasanKlinis": "Ringkasan klinis terstruktur yang dapat digunakan oleh tenaga kesehatan (3-5 kalimat)",
  "ringkasanUntukRS": "Ringkasan klinis singkat dalam format profesional yang akan dikirim ke rumah sakit/faskes, mencakup: keluhan utama, onset, gejala penyerta, riwayat penyakit relevan, dan kesan awal (maksimal 200 kata)",
  "estimasiWaktuTunggu": "Estimasi waktu tunggu di faskes (misalnya: 0-30 menit untuk IGD, 1-2 jam untuk Poli, 30-60 menit untuk Faskes Tingkat Pertama)",
  "jamOperasionalDisarankan": "Saran jam operasional kunjungan (misalnya: Segera (24 jam), Jam kerja (08:00-16:00), Fleksibel)"
}

Pertimbangan penting:
1. **PRIORITAS KESELAMATAN**: Jika ragu, kategorikan sebagai lebih urgent
2. **KONDISI GAWAT DARURAT (emergency)** - Segera ke IGD:
   - Pendarahan tidak terkontrol/hebat
   - Nyeri dada (terutama menjalar ke lengan/rahang)
   - Sesak napas berat/tidak bisa berbicara
   - Penurunan kesadaran/pingsan
   - Stroke (kelemahan satu sisi, bicara pelo, wajah asimetris)
   - Trauma kepala dengan pendarahan/muntah/pusing berat
   - Kejang
   - Nyeri perut hebat mendadak
   - Luka bakar luas
   - Patah tulang terbuka
3. **Tingkat High** - Perlu dokter hari ini: Infeksi akut, demam tinggi persisten, nyeri akut → Poli Spesialis atau Poli Umum
4. **Tingkat Medium/Low** - Keluhan ringan, kronis stabil → Faskes Tingkat Pertama atau dapat dijadwalkan
5. **SISTEM RUJUKAN BERJENJANG JKN**:
   - Faskes Tingkat Pertama (Puskesmas, Klinik, Dokter Keluarga): Untuk keluhan umum, kontrol rutin, penyakit ringan-sedang
   - Poli RS: Untuk kasus yang memerlukan spesialis atau fasilitas rumah sakit
   - IGD: Hanya untuk kondisi gawat darurat yang mengancam jiwa
6. Berikan rekomendasi spesialis yang spesifik jika memungkinkan (misalnya "Penyakit Dalam", "Bedah", "Anak", "Kandungan")
7. Ringkasan klinis harus mencakup: keluhan utama, durasi, gejala penyerta, faktor risiko/riwayat penyakit yang relevan
8. **Ringkasan untuk RS** harus profesional, padat, dan mudah dipahami oleh tenaga kesehatan
9. **Estimasi waktu tunggu** sesuai dengan jenis layanan dan tingkat kegawatan
10. **PENTING**: Untuk emergency, tanggalKunjunganDisarankan harus "Segera", rekomendasiLayanan harus "IGD", jamOperasionalDisarankan "Segera (24 jam)"

Berikan HANYA output JSON tanpa teks tambahan.`;

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let triageResult;
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      triageResult = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Error parsing AI response:', text);
      throw new Error('Gagal memproses respons AI. Silakan coba lagi.');
    }

    // Add metadata
    const finalResult = {
      ...triageResult,
      timestamp: new Date().toISOString(),
      triageId: `TRG-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      conversationSummary: conversationHistory,
    };

    return NextResponse.json(finalResult);

  } catch (error) {
    console.error('Triage API Error:', error);
    return NextResponse.json(
      {
        error: 'Terjadi kesalahan saat memproses triase. Silakan coba lagi.',
        details: error.message
      },
      { status: 500 }
    );
  }
}
