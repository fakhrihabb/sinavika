import Link from 'next/link';
import { ArrowLeft, User } from 'lucide-react';

export default function PesertaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-[#03974a] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Kembali ke Beranda</span>
            </Link>
            <div className="flex items-center gap-2 text-[#03974a]">
              <User className="w-6 h-6" strokeWidth={2} />
              <span className="font-semibold">Peserta JKN</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <div className="p-6 bg-white rounded-full shadow-lg">
              <User className="w-16 h-16 text-[#03974a]" strokeWidth={1.5} />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#03974a] to-[#144782] bg-clip-text text-transparent">
            Portal Peserta JKN
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Fitur triage keluhan dan navigasi layanan akan segera hadir
          </p>

          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Fitur yang akan tersedia:</h2>
            <ul className="text-left space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="text-[#03974a] mt-1">✓</span>
                <span>Kuesioner keluhan dinamis dengan AI</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#03974a] mt-1">✓</span>
                <span>Upload foto keluhan untuk analisis visual</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#03974a] mt-1">✓</span>
                <span>Penentuan tingkat kegawatan otomatis</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#03974a] mt-1">✓</span>
                <span>Rekomendasi rute layanan (IGD/Poli/FKTP)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#03974a] mt-1">✓</span>
                <span>Riwayat triage dan ringkasan klinis</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
