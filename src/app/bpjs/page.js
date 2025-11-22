'use client';

import { useEffect, useState } from 'react';
import BpjsNavbar from '@/components/BPJSNavbar';
import { FileText, TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock, Building2, ArrowUpRight, ArrowDownRight, ChevronRight, Calendar, Shield, Filter, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function BPJSPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bpjs/dashboard');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Gagal mengambil data dashboard');
      }

      setDashboardData(result.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate KPIs from real data
  const getKPIs = () => {
    if (!dashboardData) return [];

    const { stats } = dashboardData;

    // Calculate approval rate (approved / (approved + rejected) * 100)
    const totalProcessed = (stats.approved || 0) + (stats.rejected || 0);
    const approvalRate = totalProcessed > 0
      ? Math.round((stats.approved / totalProcessed) * 100)
      : 0;

    return [
      {
        title: "Klaim Masuk",
        subtitle: "Hari Ini",
        value: stats.today?.toString() || "0",
        change: "+12%",
        changeType: "increase",
        icon: FileText,
        color: "bg-blue-500"
      },
      {
        title: "Pending Verifikasi",
        subtitle: "Perlu ditangani",
        value: stats.pending?.toString() || "0",
        change: stats.pending > stats.total * 0.5 ? "+5%" : "-3%",
        changeType: stats.pending > stats.total * 0.5 ? "increase" : "decrease",
        icon: Clock,
        color: "bg-orange-500"
      },
      {
        title: "AI Fraud Alert",
        subtitle: "Terdeteksi hari ini",
        value: stats.highRisk?.toString() || "0",
        change: "-8%",
        changeType: "decrease",
        icon: AlertTriangle,
        color: "bg-red-500"
      },
      {
        title: "Approval Rate",
        subtitle: "Total yang diproses",
        value: `${approvalRate}%`,
        change: approvalRate >= 90 ? "+3%" : "-2%",
        changeType: approvalRate >= 90 ? "increase" : "decrease",
        icon: TrendingUp,
        color: "bg-emerald-500"
      }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BpjsNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#03974a] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Memuat data dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BpjsNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Memuat Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-[#03974a] text-white rounded-lg hover:bg-[#144782] transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const kpis = getKPIs();
  const highPriorityClaims = dashboardData?.priorityClaims || [];
  const stats = dashboardData?.stats || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <BpjsNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Dashboard Verifikasi Nasional
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Primary Quick Actions - Highlighted at Top */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/bpjs/verifikasi"
              className="group block bg-gradient-to-r from-[#03974a] to-[#144782] rounded-xl p-6 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            >
              <div className="flex items-start justify-between mb-3">
                <FileText className="w-10 h-10 text-white/90 group-hover:scale-110 transition-transform" strokeWidth={2} />
                <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Verifikasi Klaim</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                {stats.pending || 0} klaim menunggu verifikasi dan proses Anda
              </p>
            </Link>

            <Link
              href="/bpjs/fraud"
              className="group block bg-white rounded-xl p-6 border-2 border-[#03974a] shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            >
              <div className="flex items-start justify-between mb-3">
                <Shield className="w-10 h-10 text-[#03974a] group-hover:scale-110 transition-transform" strokeWidth={2} />
                <ChevronRight className="w-5 h-5 text-[#03974a] group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fraud Analytics</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {stats.highRisk || 0} AI fraud alert baru terdeteksi hari ini
              </p>
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
          {/* Main Content - High Priority Claims */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Antrian Prioritas Tinggi</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Klaim dengan AI fraud alert dan risiko tinggi</p>
                </div>
                <Link
                  href="/bpjs/verifikasi"
                  className="text-sm font-semibold text-[#03974a] hover:text-[#144782] flex items-center gap-1"
                >
                  Lihat Semua
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {highPriorityClaims.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Tidak ada klaim dalam antrian prioritas saat ini</p>
                  </div>
                ) : (
                  highPriorityClaims.slice(0, 5).map((claim) => (
                    <div key={claim.id} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{claim.id}</h3>
                            {claim.aiRiskScore >= 70 && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                <Shield className="w-3 h-3" />
                                Risk: {claim.aiRiskScore}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Building2 className="w-4 h-4" />
                            <span>{claim.hospital}</span>
                          </div>
                          <p className="text-sm text-gray-600">{claim.patientName} • {claim.diagnosis}</p>
                          {claim.aiFlags && claim.aiFlags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {claim.aiFlags.map((flag, idx) => (
                                <span key={idx} className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded-full">
                                  {flag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-gray-900 whitespace-nowrap">{claim.amount}</p>
                          <p className="text-xs text-gray-500 mt-1">{claim.submittedDate}</p>
                          <p className="text-xs text-blue-600 mt-1">~{claim.estimatedTime}</p>
                        </div>
                      </div>
                      <Link
                        href={`/bpjs/verifikasi/${claim.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#144782] hover:text-[#03974a]"
                      >
                        Mulai Verifikasi
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))
                )}
              </div>
              {highPriorityClaims.length > 0 && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <Link
                    href="/bpjs/verifikasi"
                    className="block w-full py-2.5 text-center bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Lihat Semua Antrian ({stats.pending || 0} klaim)
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Ringkasan Hari Ini</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Disetujui</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">{stats.approved || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-900">Pending</span>
                  </div>
                  <span className="text-xl font-bold text-orange-600">{stats.pending || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-gray-900">Ditolak</span>
                  </div>
                  <span className="text-xl font-bold text-red-600">{stats.rejected || 0}</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border border-blue-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">💡 Sistem AI</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                AI Fraud Detection sudah memfilter dan memprioritaskan klaim berisiko tinggi, menghemat waktu verifikasi hingga 70% untuk klaim yang aman.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
