'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PesertaNavbar from '@/components/PesertaNavbar';
import {
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  Activity,
  ChevronRight,
  Loader2,
  Search,
  Filter,
  CalendarCheck,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

export default function RiwayatPage() {
  const searchParams = useSearchParams();
  const triageIdParam = searchParams.get('triageId');

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTriage, setSelectedTriage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    // Auto-select triage if triageId is in URL params
    if (triageIdParam && history.length > 0 && !selectedTriage) {
      const triage = history.find(t => t.triage_id === triageIdParam);
      if (triage) {
        setSelectedTriage(triage);
      }
    }
  }, [triageIdParam, history, selectedTriage]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/triage/history?userId=demo-user');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengambil riwayat');
      }

      setHistory(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (level) => {
    switch (level) {
      case 'emergency':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMainComplaint = (conversationSummary) => {
    if (!conversationSummary || conversationSummary.length === 0) return 'Tidak ada data';
    return conversationSummary[0]?.answer || 'Tidak ada data';
  };

  // Filter history
  const filteredHistory = history.filter(item => {
    const matchesSearch = searchTerm === '' ||
      getMainComplaint(item.conversation_summary).toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rekomendasi_layanan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = filterSeverity === 'all' || item.tingkat_keparahan === filterSeverity;

    return matchesSearch && matchesSeverity;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PesertaNavbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-[#03974a] mx-auto mb-4" />
            <p className="text-gray-600">Memuat riwayat triase...</p>
          </div>
        </main>
      </div>
    );
  }

  if (selectedTriage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PesertaNavbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <button
            onClick={() => setSelectedTriage(null)}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Kembali ke Riwayat
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Detail Hasil Triase</h2>
                  <p className="text-sm text-gray-500">ID: {selectedTriage.triage_id}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(selectedTriage.created_at)} • {formatTime(selectedTriage.created_at)} WIB
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getSeverityColor(selectedTriage.tingkat_keparahan)}`}>
                  {selectedTriage.label_keparahan}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Main Recommendation */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-start gap-3 mb-3">
                  <Activity className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Rekomendasi Layanan</p>
                    <p className="text-xl font-bold text-gray-900">{selectedTriage.rekomendasi_layanan}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 pt-3 border-t border-green-100">
                  <Calendar className="w-4 h-4" />
                  <span>Waktu kunjungan: {selectedTriage.tanggal_kunjungan_disarankan}</span>
                </div>
              </div>

              {/* Reason */}
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  Alasan
                </h3>
                <p className="text-gray-700 leading-relaxed">{selectedTriage.alasan}</p>
              </div>

              {/* Actions */}
              {selectedTriage.tindakan && selectedTriage.tindakan.length > 0 && (
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Yang Harus Dilakukan</h3>
                  <ul className="space-y-2">
                    {selectedTriage.tindakan.map((tindakan, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 pt-0.5">{tindakan}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warning Signs */}
              {selectedTriage.gejala_bahaya && selectedTriage.gejala_bahaya.length > 0 && (
                <div className="bg-red-50 rounded-xl p-5 border-2 border-red-200">
                  <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Gejala Bahaya yang Perlu Diwaspadai
                  </h3>
                  <ul className="space-y-1">
                    {selectedTriage.gejala_bahaya.map((gejala, index) => (
                      <li key={index} className="text-red-800 text-sm flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>{gejala}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Clinical Summary */}
              {selectedTriage.ringkasan_klinis && (
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Ringkasan Klinis</h3>
                  <p className="text-blue-800 text-sm leading-relaxed">{selectedTriage.ringkasan_klinis}</p>
                </div>
              )}

              {/* Conversation History */}
              {selectedTriage.conversation_summary && selectedTriage.conversation_summary.length > 0 && (
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Riwayat Percakapan</h3>
                  <div className="space-y-3">
                    {selectedTriage.conversation_summary.map((item, index) => (
                      <div key={index} className="border-l-2 border-gray-300 pl-4 py-1">
                        <p className="text-sm font-medium text-gray-700">{item.question}</p>
                        <p className="text-sm text-gray-600 mt-1">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4">
                {selectedTriage.appointment_status === 'Sudah Atur Janji Temu' ? (
                  <Link
                    href="/peserta/janji-temu"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <CalendarCheck className="w-5 h-5" />
                    Lihat Janji Temu
                  </Link>
                ) : (
                  <Link
                    href={`/peserta/triage/pilih-rumah-sakit?triageId=${selectedTriage.triage_id}&serviceType=${encodeURIComponent(selectedTriage.rekomendasi_layanan)}`}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#03974a] to-[#144782] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    <MapPin className="w-5 h-5" />
                    Cari Rumah Sakit Terdekat
                  </Link>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PesertaNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Riwayat Triase
          </h1>
          <p className="text-gray-600">
            Lihat semua hasil triase kesehatan Anda sebelumnya
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari keluhan atau rekomendasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#03974a] focus:border-transparent outline-none"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#03974a] focus:border-transparent outline-none appearance-none"
            >
              <option value="all">Semua Tingkat Keparahan</option>
              <option value="emergency">Gawat Darurat</option>
              <option value="high">Perlu dokter hari ini</option>
              <option value="medium">Perlu dokter dalam 1-3 hari</option>
              <option value="low">Dapat ditangani sendiri</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800">{error}</p>
                <button
                  onClick={fetchHistory}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold mt-1"
                >
                  Coba lagi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredHistory.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterSeverity !== 'all' ? 'Tidak ada hasil' : 'Belum ada riwayat triase'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterSeverity !== 'all'
                ? 'Coba ubah filter atau kata kunci pencarian'
                : 'Mulai cek keluhan Anda untuk membuat riwayat triase pertama'}
            </p>
            {!searchTerm && filterSeverity === 'all' && (
              <Link
                href="/peserta/triage"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#03974a] to-[#144782] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Mulai Cek Keluhan
                <ChevronRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        )}

        {/* History List */}
        {filteredHistory.length > 0 && (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedTriage(item)}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(item.tingkat_keparahan)}`}>
                        {item.label_keparahan}
                      </span>
                      {item.appointment_status === 'Sudah Atur Janji Temu' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1">
                          <CalendarCheck className="w-3 h-3" />
                          Sudah Atur Janji
                        </span>
                      )}
                      <span className="text-xs text-gray-500">ID: {item.triage_id}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Keluhan: {getMainComplaint(item.conversation_summary)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Rekomendasi: {item.rekomendasi_layanan}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(item.created_at)} WIB</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {history.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
            <p className="text-sm text-gray-700">
              Menampilkan <span className="font-semibold">{filteredHistory.length}</span> dari{' '}
              <span className="font-semibold">{history.length}</span> triase
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
