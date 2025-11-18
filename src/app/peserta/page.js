import PesertaNavbar from '@/components/PesertaNavbar';
import { FileText, BookOpen, AlertCircle, CheckCircle, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function PesertaPage() {
  // Dummy data for last triage
  const lastTriage = {
    date: "15 November 2025",
    complaint: "Demam tinggi dan batuk",
    severity: "Perlu dokter hari ini",
    recommendation: "Poli Umum - RS Siloam",
    status: "Menunggu kunjungan"
  };

  // Dummy data for history
  const triageHistory = [
    {
      id: 1,
      date: "15 Nov 2025",
      complaint: "Demam tinggi dan batuk",
      severity: "Perlu dokter hari ini",
      route: "Poli Umum"
    },
    {
      id: 2,
      date: "10 Nov 2025",
      complaint: "Sakit kepala ringan",
      severity: "Bisa dijadwalkan",
      route: "FKTP"
    }
  ];

  const tips = [
    "Gunakan FKTP untuk keluhan ringan dan pemeriksaan rutin",
    "IGD hanya untuk kondisi gawat darurat yang mengancam nyawa",
    "Konsultasi dengan dokter keluarga untuk keluhan yang tidak mendesak"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <PesertaNavbar />

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Selamat Datang di SINAVIKA
          </h1>
          <p className="text-gray-600">
            Cek keluhan kesehatan Anda dan dapatkan rekomendasi layanan yang tepat
          </p>
        </div>

        {/* Main Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link 
            href="/peserta/triage"
            className="group bg-gradient-to-br from-[#03974a] to-emerald-600 rounded-2xl p-8 text-white hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <FileText className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-bold mb-2">Mulai Cek Keluhan</h2>
            <p className="text-white/90">
              Isi kuesioner AI untuk mendapat rekomendasi layanan kesehatan
            </p>
          </Link>

          <Link 
            href="/peserta/riwayat"
            className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <BookOpen className="w-12 h-12 mb-4 text-[#144782] group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Lihat Riwayat Triage</h2>
            <p className="text-gray-600">
              Akses hasil pemeriksaan dan rekomendasi sebelumnya
            </p>
          </Link>
        </div>

        {/* Last Triage Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Status Triage Terakhir</h3>
          {lastTriage ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Tanggal</p>
                  <p className="font-semibold text-gray-800">{lastTriage.date}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Keluhan</p>
                  <p className="font-semibold text-gray-800">{lastTriage.complaint}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-orange-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Tingkat Kegawatan</p>
                  <p className="font-semibold text-orange-600">{lastTriage.severity}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Rekomendasi Faskes</p>
                  <p className="font-semibold text-gray-800">{lastTriage.recommendation}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-50 text-yellow-700 border border-yellow-200">
                  {lastTriage.status}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Belum ada riwayat triage</p>
          )}
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Tips Pemanfaatan JKN</h3>
          <ul className="space-y-3">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#03974a] mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
