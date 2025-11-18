'use client';
import { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Apa itu SINAVIKA?",
      answer: "SINAVIKA adalah platform digital berbasis Agentic AI dan Computer Vision yang dirancang khusus untuk ekosistem Jaminan Kesehatan Nasional (JKN). Platform ini memperbaiki alur layanan dan klaim dari hulu ke hilir, mulai dari triage peserta JKN, dokumentasi klinis di rumah sakit, hingga verifikasi klaim di BPJS Kesehatan."
    },
    {
      question: "Siapa saja yang bisa menggunakan SINAVIKA?",
      answer: "SINAVIKA memiliki tiga kelompok pengguna utama: (1) Peserta JKN untuk triage keluhan awal, (2) Rumah Sakit untuk copilot klinis dan manajemen klaim, dan (3) BPJS Kesehatan untuk verifikasi klaim dan analitik fraud."
    },
    {
      question: "Apakah SINAVIKA menggantikan dokter atau verifikator?",
      answer: "Tidak. SINAVIKA berperan sebagai lapisan kecerdasan yang membantu triage, dokumentasi, dan verifikasi agar lebih cepat, rapi, dan akurat. Keputusan akhir tetap berada di tangan tenaga kesehatan dan verifikator."
    },
    {
      question: "Bagaimana SINAVIKA menganalisis foto keluhan?",
      answer: "SINAVIKA menggunakan teknologi computer vision yang dilatih untuk mengenali kondisi visual seperti ruam, bengkak, luka, atau kemerahan. Hasil analisis visual dikombinasikan dengan data kuesioner untuk memberikan rekomendasi yang lebih akurat."
    },
    {
      question: "Apa saja dampak utama SINAVIKA?",
      answer: "SINAVIKA berfokus pada tiga dampak utama: (1) Mengurangi beban IGD dari kasus non-darurat, (2) Menurunkan klaim pending akibat kesalahan koding dan dokumentasi, dan (3) Mempercepat dan memperkuat proses verifikasi di BPJS untuk mengurangi fraud."
    },
    {
      question: "Bagaimana data saya dijaga keamanannya?",
      answer: "Semua data kesehatan dienkripsi dan disimpan sesuai standar keamanan data kesehatan. Data hanya dapat diakses oleh pihak yang berwenang dalam ekosistem JKN (peserta, rumah sakit yang merawat, dan BPJS untuk verifikasi)."
    },
    {
      question: "Apakah SINAVIKA sudah bisa digunakan sekarang?",
      answer: "SINAVIKA saat ini dalam tahap pengembangan dan pilot testing. Anda dapat mencoba demo platform untuk melihat fitur-fitur yang tersedia dan memberikan feedback untuk penyempurnaan."
    },
    {
      question: "Bagaimana cara rumah sakit mengintegrasikan SINAVIKA?",
      answer: "SINAVIKA dirancang untuk dapat berintegrasi dengan sistem informasi rumah sakit yang ada melalui API. Tim kami akan membantu proses onboarding dan integrasi sesuai kebutuhan masing-masing rumah sakit."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-gradient-to-br from-green-50 via-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#03974a] to-[#144782] bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Pertanyaan yang sering diajukan tentang SINAVIKA
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="text-lg font-semibold text-gray-800 pr-4">
                  {faq.question}
                </span>
                <span
                  className={`text-2xl font-bold bg-gradient-to-r from-[#03974a] to-[#144782] bg-clip-text text-transparent transform transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                >
                  ↓
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 pt-2 text-gray-600 leading-relaxed border-t border-gray-100">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
