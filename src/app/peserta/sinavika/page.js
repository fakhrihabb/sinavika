'use client';
import { useState, useEffect } from 'react';
import PesertaNavbar from '@/components/PesertaNavbar';
import { Stethoscope, FileText, Clock, AlertCircle, CheckCircle, MapPin, ChevronRight, Activity, Calendar, CalendarCheck, Loader2, Building2, Phone, Navigation } from 'lucide-react';
import Link from 'next/link';

export default function PesertaPage() {
  const [lastTriage, setLastTriage] = useState(null);
  const [stats, setStats] = useState([
    { label: "Total Keluhan", value: "0", icon: Activity, color: "text-blue-600" },
    { label: "Bulan Ini", value: "0", icon: Calendar, color: "text-green-600" },
    { label: "Keluhan Terakhir", value: "-", icon: Clock, color: "text-orange-600" }
  ]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch triage history
      const triageResponse = await fetch('/api/triage/history?userId=demo-user');
      const triageResult = await triageResponse.json();

      if (!triageResponse.ok) {
        throw new Error(triageResult.error || 'Gagal mengambil data');
      }

      const triageHistory = triageResult.data || [];

      // Fetch appointments
      const appointmentsResponse = await fetch('/api/janji-temu?userId=demo-user');
      const appointmentsResult = await appointmentsResponse.json();

      if (!appointmentsResponse.ok) {
        throw new Error(appointmentsResult.error || 'Gagal mengambil data janji temu');
      }

      const appointments = appointmentsResult.appointments || [];

      // Calculate stats
      const now = new Date();
      const thisMonth = triageHistory.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      }).length;

      let lastTriageTime = '-';
      if (triageHistory.length > 0) {
        const lastTriageDate = new Date(triageHistory[0].created_at);
        const diffTime = Math.abs(now - lastTriageDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        lastTriageTime = diffDays === 0 ? 'Hari ini' : `${diffDays} hari`;
      }

      setStats([
        { label: "Total Keluhan", value: triageHistory.length.toString(), icon: Activity, color: "text-blue-600" },
        { label: "Bulan Ini", value: thisMonth.toString(), icon: Calendar, color: "text-green-600" },
        { label: "Keluhan Terakhir", value: lastTriageTime, icon: Clock, color: "text-orange-600" }
      ]);

      // Set last triage
      if (triageHistory.length > 0) {
        setLastTriage(triageHistory[0]);
      }

      // Set recent appointments (limit to 3)
      setRecentAppointments(appointments.slice(0, 3));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  const getSeverityColor = (level) => {
    switch (level) {
      case 'emergency':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: { label: 'Terjadwal', className: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
      completed: { label: 'Selesai', className: 'bg-gray-100 text-gray-700 border-gray-200', icon: CheckCircle },
      cancelled: { label: 'Dibatalkan', className: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
    };
    return badges[status] || badges.scheduled;
  };

  // Tips for JKN users
  const tips = [
    {
      title: "Siapkan Kartu JKN",
      description: "Pastikan kartu aktif dan tidak menunggak iuran sebelum berobat"
    },
    {
      title: "Lakukan Cek Keluhan Dulu",
      description: "Cek keluhan membantu Anda tahu ke faskes mana harus pergi dan dokumen apa yang perlu disiapkan"
    },
    {
      title: "Simpan Hasil Keluhan",
      description: "Tunjukkan hasil keluhan ke petugas pendaftaran untuk mempercepat proses"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PesertaNavbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-[#03974a] mx-auto mb-4" />
            <p className="text-gray-600">Memuat data dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

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

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800">{error}</p>
                <button
                  onClick={fetchDashboardData}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold mt-1"
                >
                  Coba lagi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Primary Quick Actions - Highlighted at Top */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">Lihat Riwayat Keluhan</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Akses semua hasil keluhan sebelumnya dan dokumentasi kesehatan Anda
              </p>
            </Link>

            <Link
              href="/peserta/janji-temu"
              className="group block bg-white rounded-xl p-6 border-2 border-blue-500 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            >
              <div className="flex items-start justify-between mb-3">
                <CalendarCheck className="w-10 h-10 text-blue-600 group-hover:scale-110 transition-transform" strokeWidth={2} />
                <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Janji Temu Saya</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Lihat dan kelola janji temu Anda dengan rumah sakit
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
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Keluhan Terakhir</h2>
                  <p className="text-sm text-gray-500">ID: {lastTriage.triage_id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(lastTriage.tingkat_keparahan)}`}>
                  {lastTriage.label_keparahan}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Waktu Keluhan</p>
                    <p className="font-medium text-gray-900">{formatDate(lastTriage.created_at)}</p>
                    <p className="text-sm text-gray-600">{formatTime(lastTriage.created_at)} WIB</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Keluhan Utama</p>
                    <p className="font-medium text-gray-900">{getMainComplaint(lastTriage.conversation_summary)}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Rekomendasi Layanan</p>
                    <p className="font-semibold text-gray-900 mb-1">{lastTriage.rekomendasi_layanan}</p>
                    {lastTriage.nama_spesialis && (
                      <p className="text-sm text-gray-600">Spesialis: {lastTriage.nama_spesialis}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2 pt-2 border-t border-green-100">
                  <Calendar className="w-4 h-4" />
                  <span>Waktu kunjungan: {lastTriage.tanggal_kunjungan_disarankan}</span>
                </div>
                {lastTriage.jam_operasional_disarankan && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Clock className="w-4 h-4" />
                    <span>Jam operasional: {lastTriage.jam_operasional_disarankan}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">Butuh cek keluhan ulang atau keluhan berbeda?</span>
              <Link
                href="/peserta/triage"
                className="flex items-center gap-1 text-sm font-semibold text-[#03974a] hover:text-[#144782] transition-colors"
              >
                Mulai Cek Keluhan Baru
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Janji Temu Kamu Section */}
        {recentAppointments.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Janji Temu Kamu</h2>
              <Link
                href="/peserta/janji-temu"
                className="text-sm font-semibold text-[#03974a] hover:text-[#144782] transition-colors flex items-center gap-1"
              >
                Lihat Semua
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {recentAppointments.map((appointment) => {
                const statusBadge = getStatusBadge(appointment.status);
                const StatusIcon = statusBadge.icon;

                return (
                  <div
                    key={appointment.id}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.className} flex items-center gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.label}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-1 flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-gray-600" />
                          {appointment.hospital_name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{appointment.appointment_type}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{appointment.hospital_address}</span>
                      </div>
                      {appointment.hospital_phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600">{appointment.hospital_phone}</span>
                        </div>
                      )}
                    </div>

                    {appointment.distance_text && (
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Navigation className="w-3 h-3" />
                          <span>{appointment.distance_text}</span>
                        </div>
                        {appointment.duration_text && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{appointment.duration_text}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link
                        href={`/peserta/janji-temu`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#03974a] to-[#144782] text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                      >
                        <CalendarCheck className="w-4 h-4" />
                        Lihat Detail
                      </Link>
                    </div>
                  </div>
                );
              })}
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
