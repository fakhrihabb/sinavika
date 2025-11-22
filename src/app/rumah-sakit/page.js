'use client';

import { useState, useEffect } from 'react';
import RumahSakitNavbar from '@/components/RumahSakitNavbar';
import { Users, FileCheck, AlertCircle, TrendingUp, Clock, CheckCircle, XCircle, ChevronRight, FileText, Bell, ArrowUpRight, ArrowDownRight, User, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RumahSakitPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rumah-sakit/dashboard');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }

      setDashboardData(result.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <RumahSakitNavbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-[#03974a] animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Memuat data dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <RumahSakitNavbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-1">Error Loading Dashboard</h3>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={fetchDashboardData}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  const { kpis: kpisData, patientQueue, pendingClaims, unreadNotifications, totalAppointments } = dashboardData;

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Calculate time ago
  const timeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return `${diffDays} hari lalu`;
  };

  // Get current date in Indonesian
  const getCurrentDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const now = new Date();
    return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  // Key Performance Indicators
  const kpis = [
    {
      title: "Pasien SINAVIKA",
      subtitle: "Hari Ini",
      value: kpisData.patientsToday.toString(),
      change: kpisData.patientsToday > 0 ? `+${kpisData.patientsToday}` : "0",
      changeType: kpisData.patientsToday > 0 ? "increase" : "neutral",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      title: "Total Terjadwal",
      subtitle: "Semua pasien",
      value: kpisData.totalScheduled.toString(),
      change: `${kpisData.totalScheduled} total`,
      changeType: "neutral",
      icon: CheckCircle,
      color: "bg-green-500"
    },
    {
      title: "Klaim Pending",
      subtitle: "Perlu review",
      value: kpisData.claimsPending.toString(),
      change: kpisData.claimsPending > 0 ? `${kpisData.claimsPending} klaim` : "0",
      changeType: kpisData.claimsPending > 0 ? "increase" : "neutral",
      icon: AlertCircle,
      color: "bg-orange-500"
    },
    {
      title: "Approval Rate",
      subtitle: "Klaim disetujui",
      value: `${kpisData.approvalRate}%`,
      change: `${kpisData.claimsApproved}/${kpisData.claimsApproved + kpisData.claimsRejected + kpisData.claimsPending}`,
      changeType: kpisData.approvalRate >= 80 ? "increase" : "decrease",
      icon: TrendingUp,
      color: "bg-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <RumahSakitNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Dashboard Operasional
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {getCurrentDate()}
          </p>
        </div>

        {/* Primary Quick Actions - Highlighted at Top */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/rumah-sakit/antrian"
              className="group block bg-gradient-to-r from-[#03974a] to-[#144782] rounded-xl p-6 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            >
              <div className="flex items-start justify-between mb-3">
                <Users className="w-10 h-10 text-white/90 group-hover:scale-110 transition-transform" strokeWidth={2} />
                <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Kelola Antrian</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                Lihat dan atur pasien SINAVIKA dengan hasil triage
              </p>
            </Link>

            <Link
              href="/rumah-sakit/pre-check"
              className="group block bg-white rounded-xl p-6 border-2 border-[#03974a] shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            >
              <div className="flex items-start justify-between mb-3">
                <FileCheck className="w-10 h-10 text-[#03974a] group-hover:scale-110 transition-transform" strokeWidth={2} />
                <ChevronRight className="w-5 h-5 text-[#03974a] group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pre-check Klaim</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Validasi klaim sebelum dikirim ke BPJS
              </p>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <Link
              href="/rumah-sakit/notifikasi"
              className="group flex items-center gap-4 bg-white rounded-xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all"
            >
              <div className="p-3 bg-[#03974a] rounded-lg group-hover:scale-110 transition-transform">
                <Bell className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Notifikasi</h3>
                <p className="text-gray-600 text-sm">
                  {unreadNotifications > 0
                    ? `${unreadNotifications} notifikasi baru memerlukan tindakan`
                    : 'Tidak ada notifikasi baru'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#03974a] transition-colors" />
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 ${kpi.color} rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                    kpi.changeType === 'increase' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {kpi.changeType === 'increase' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {kpi.change}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{kpi.value}</h3>
                <p className="text-sm font-medium text-gray-900">{kpi.title}</p>
                <p className="text-xs text-gray-500">{kpi.subtitle}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Queue */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Antrian Pasien SINAVIKA</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Pasien dengan hasil triage siap ditangani</p>
                </div>
                <Link
                  href="/rumah-sakit/antrian"
                  className="text-sm font-semibold text-[#03974a] hover:text-[#144782] flex items-center gap-1"
                >
                  Lihat Semua
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {patientQueue.length > 0 ? (
                  patientQueue.map((appointment) => {
                    const triage = appointment.triage;
                    const severity = triage?.tingkat_keparahan || 'low';

                    return (
                      <div key={appointment.id} className="p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-0.5">
                                {appointment.hospital_name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-1">
                                {triage?.rekomendasi_layanan || appointment.appointment_type}
                                {appointment.specialty && ` - ${appointment.specialty}`}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {timeAgo(appointment.created_at)}
                                </span>
                                <span>•</span>
                                <span>{appointment.distance_text || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            severity === 'emergency' ? 'bg-red-100 text-red-700' :
                            severity === 'high' ? 'bg-orange-100 text-orange-700' :
                            severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {triage?.label_keparahan || 'Terjadwal'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pl-11">
                          <span className="text-xs text-gray-500 capitalize">{appointment.status}</span>
                          <Link
                            href={`/rumah-sakit/antrian/${appointment.id}`}
                            className="text-sm font-medium text-[#144782] hover:text-[#03974a]"
                          >
                            Lihat Detail →
                          </Link>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Tidak ada pasien dalam antrian saat ini</p>
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <Link
                  href="/rumah-sakit/antrian"
                  className="block w-full py-2.5 text-center bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Lihat Semua Pasien ({totalAppointments} total)
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Claim Status Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Ringkasan Klaim</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Diterima</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">{kpisData.claimsApproved}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-900">Pending</span>
                  </div>
                  <span className="text-xl font-bold text-orange-600">{kpisData.claimsPending}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-gray-900">Ditolak</span>
                  </div>
                  <span className="text-xl font-bold text-red-600">{kpisData.claimsRejected}</span>
                </div>
              </div>
              <Link
                href="/bpjs/verifikasi"
                className="block mt-4 w-full py-2.5 text-center bg-gradient-to-r from-[#03974a] to-[#144782] text-white rounded-lg text-sm font-semibold hover:shadow-md transition-shadow"
              >
                Kelola Semua Klaim
              </Link>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border border-blue-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">💡 Tips</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Gunakan AI Copilot untuk menghasilkan draft resume medis dan rekomendasi kode ICD otomatis, menghemat waktu dokumentasi hingga 60%.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
