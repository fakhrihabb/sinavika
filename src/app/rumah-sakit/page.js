import RumahSakitNavbar from '@/components/RumahSakitNavbar';
import { Users, FileCheck, AlertCircle, TrendingUp, Clock, CheckCircle, XCircle, ChevronRight, FileText, Bell, ArrowUpRight, ArrowDownRight, User, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function RumahSakitPage() {
  // Key Performance Indicators
  const kpis = [
    {
      title: "Pasien SINAVIKA",
      subtitle: "Hari Ini",
      value: "24",
      change: "+6",
      changeType: "increase",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      title: "Klaim Siap Kirim",
      subtitle: "Sudah di-precheck",
      value: "12",
      change: "+3",
      changeType: "increase",
      icon: CheckCircle,
      color: "bg-green-500"
    },
    {
      title: "Klaim Pending",
      subtitle: "Perlu perbaikan",
      value: "8",
      change: "-2",
      changeType: "decrease",
      icon: AlertCircle,
      color: "bg-orange-500"
    },
    {
      title: "Approval Rate",
      subtitle: "30 hari terakhir",
      value: "87%",
      change: "+5%",
      changeType: "increase",
      icon: TrendingUp,
      color: "bg-emerald-500"
    }
  ];

  // Patient Queue - prioritized
  const patientQueue = [
    {
      id: "P001",
      name: "Ahmad Fauzi",
      complaint: "Demam tinggi dan batuk",
      severity: "medium",
      severityLabel: "Perlu dokter hari ini",
      triageTime: "10 menit lalu",
      status: "Menunggu pemeriksaan"
    },
    {
      id: "P002",
      name: "Siti Nurhaliza",
      complaint: "Sakit kepala berkepanjangan",
      severity: "low",
      severityLabel: "Bisa dijadwalkan",
      triageTime: "25 menit lalu",
      status: "Dalam antrian"
    },
    {
      id: "P003",
      name: "Budi Santoso",
      complaint: "Nyeri perut dan mual",
      severity: "medium",
      severityLabel: "Perlu dokter hari ini",
      triageTime: "1 jam lalu",
      status: "Menunggu pemeriksaan"
    }
  ];

  // Claims needing attention
  const pendingClaims = [
    {
      id: "CLM-2025-0847",
      patientName: "Rina Wijaya",
      issue: "Dokumen penunjang tidak lengkap",
      amount: "Rp 8.500.000",
      daysOld: 2,
      priority: "high"
    },
    {
      id: "CLM-2025-0846",
      patientName: "Joko Prasetyo",
      issue: "Kode ICD perlu review",
      amount: "Rp 12.300.000",
      daysOld: 1,
      priority: "medium"
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
            Selasa, 19 November 2025
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
              href="/rumah-sakit/klaim"
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
                <p className="text-gray-600 text-sm">8 notifikasi baru memerlukan tindakan</p>
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
                {patientQueue.map((patient) => (
                  <div key={patient.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-0.5">{patient.name}</h3>
                          <p className="text-sm text-gray-600 mb-1">{patient.complaint}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {patient.triageTime}
                            </span>
                            <span>•</span>
                            <span>ID: {patient.id}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        patient.severity === 'high' ? 'bg-red-100 text-red-700' :
                        patient.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {patient.severityLabel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pl-11">
                      <span className="text-xs text-gray-500">{patient.status}</span>
                      <Link
                        href={`/rumah-sakit/pasien/${patient.id}`}
                        className="text-sm font-medium text-[#144782] hover:text-[#03974a]"
                      >
                        Lihat Detail →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <Link
                  href="/rumah-sakit/antrian"
                  className="block w-full py-2.5 text-center bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Lihat Semua Pasien ({patientQueue.length + 12} total)
                </Link>
              </div>
            </div>

            {/* Pending Claims Alert */}
            <div className="bg-white rounded-xl border border-orange-200">
              <div className="p-5 border-b border-orange-100 bg-orange-50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-0.5">Klaim Perlu Perhatian</h2>
                    <p className="text-sm text-gray-600">Klaim yang memerlukan perbaikan sebelum dikirim ke BPJS</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {pendingClaims.map((claim) => (
                  <div key={claim.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{claim.id}</h3>
                          {claim.priority === 'high' && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{claim.patientName}</p>
                        <p className="text-sm text-orange-700 font-medium">{claim.issue}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{claim.amount}</p>
                        <p className="text-xs text-gray-500 mt-1">{claim.daysOld} hari pending</p>
                      </div>
                    </div>
                    <Link
                      href={`/rumah-sakit/klaim/${claim.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#144782] hover:text-[#03974a]"
                    >
                      Perbaiki Sekarang
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
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
                  <span className="text-xl font-bold text-green-600">45</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-900">Pending</span>
                  </div>
                  <span className="text-xl font-bold text-orange-600">8</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-gray-900">Ditolak</span>
                  </div>
                  <span className="text-xl font-bold text-red-600">2</span>
                </div>
              </div>
              <Link
                href="/rumah-sakit/klaim"
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
