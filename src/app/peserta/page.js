import PesertaNavbar from '@/components/PesertaNavbar';
import { Stethoscope, FileText, Clock, AlertCircle, CheckCircle, MapPin, ChevronRight, Activity, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function PesertaPage() {
  // Dummy data for last triage
  const lastTriage = {
    date: "15 November 2025",
    time: "14:30",
    complaint: "Demam tinggi dan batuk",
    severity: "Perlu dokter hari ini",
    severityLevel: "medium", // low, medium, high, emergency
    recommendation: "Poli Umum",
    hospital: "RS Siloam Jakarta",
    estimatedTime: "Besok pagi (09:00)",
    id: "TRG-2025-0842"
  };

  // Quick stats
  const stats = [
    { label: "Total Triage", value: "12", icon: Activity, color: "text-blue-600" },
    { label: "Bulan Ini", value: "3", icon: Calendar, color: "text-green-600" },
    { label: "Triage Terakhir", value: "4 hari", icon: Clock, color: "text-orange-600" }
  ];

  // Tips for JKN users
  const tips = [
    {
      title: "Siapkan Kartu JKN",
      description: "Pastikan kartu aktif dan tidak menunggak iuran sebelum berobat"
    },
    {
      title: "Lakukan Triage Dulu",
      description: "Triage membantu Anda tahu ke faskes mana harus pergi dan dokumen apa yang perlu disiapkan"
    },
    {
      title: "Simpan Hasil Triage",
      description: "Tunjukkan hasil triage ke petugas pendaftaran untuk mempercepat proses"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PesertaNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Selamat Datang, Budi
          </h1>
          <p className="text-gray-600">
            Cek keluhan kesehatan Anda dan dapatkan rekomendasi layanan yang tepat
          </p>
        </div>

        {/* Primary Quick Actions - Highlighted at Top */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/peserta/triage"
              className="group block bg-gradient-to-r from-[#03974a] to-[#144782] rounded-xl p-6 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            >
              <div className="flex items-start justify-between mb-3">
                <Stethoscope className="w-10 h-10 text-white/90 group-hover:scale-110 transition-transform" strokeWidth={2} />
                <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Mulai Cek Keluhan</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                Jawab pertanyaan sederhana tentang keluhan Anda dan dapatkan rekomendasi layanan yang tepat
              </p>
            </Link>

            <Link 
              href="/peserta/riwayat"
              className="group block bg-white rounded-xl p-6 border-2 border-[#03974a] shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            >
              <div className="flex items-start justify-between mb-3">
                <FileText className="w-10 h-10 text-[#03974a] group-hover:scale-110 transition-transform" strokeWidth={2} />
                <ChevronRight className="w-5 h-5 text-[#03974a] group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Lihat Riwayat Triage</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Akses semua hasil triage sebelumnya dan dokumentasi kesehatan Anda
              </p>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Icon className={`w-5 h-5 ${stat.color}`} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Last Triage Card - Hero Section */}
        {lastTriage && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Hasil Triage Terakhir</h2>
                  <p className="text-sm text-gray-500">ID: {lastTriage.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  lastTriage.severityLevel === 'emergency' ? 'bg-red-100 text-red-700' :
                  lastTriage.severityLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                  lastTriage.severityLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {lastTriage.severity}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Waktu Triage</p>
                    <p className="font-medium text-gray-900">{lastTriage.date}</p>
                    <p className="text-sm text-gray-600">{lastTriage.time} WIB</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Keluhan Utama</p>
                    <p className="font-medium text-gray-900">{lastTriage.complaint}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Rekomendasi Layanan</p>
                    <p className="font-semibold text-gray-900 mb-1">{lastTriage.recommendation}</p>
                    <p className="text-sm text-gray-600">di {lastTriage.hospital}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2 pt-2 border-t border-green-100">
                  <MapPin className="w-4 h-4" />
                  <span>Estimasi waktu kunjungan: {lastTriage.estimatedTime}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">Butuh triage ulang atau keluhan berbeda?</span>
              <Link 
                href="/peserta/triage"
                className="flex items-center gap-1 text-sm font-semibold text-[#03974a] hover:text-[#144782] transition-colors"
              >
                Mulai Triage Baru
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tips & Information */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Tips Penggunaan</h3>
            
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {tips.map((tip, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-green-50 rounded-lg mt-0.5">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">{tip.title}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{tip.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Help Card */}
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-5 border border-blue-100">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Butuh Bantuan?</h4>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                Jika Anda mengalami gejala darurat seperti nyeri dada, kesulitan bernapas, atau pendarahan hebat, segera hubungi 119 atau datang ke IGD terdekat.
              </p>
              <a 
                href="tel:119" 
                className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"
              >
                <AlertCircle className="w-4 h-4" />
                Hubungi Darurat 119
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
