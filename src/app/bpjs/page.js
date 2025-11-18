import BPJSNavbar from '@/components/BPJSNavbar';
import { FileText, TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock, Building2, ArrowUpRight, ArrowDownRight, ChevronRight, Calendar, Shield, Filter } from 'lucide-react';
import Link from 'next/link';

export default function BPJSPage() {
  // National KPIs
  const kpis = [
    {
      title: "Klaim Masuk",
      subtitle: "Hari Ini",
      value: "1,247",
      change: "+12%",
      changeType: "increase",
      icon: FileText,
      color: "bg-blue-500"
    },
    {
      title: "Pending Verifikasi",
      subtitle: "Perlu ditangani",
      value: "328",
      change: "+5%",
      changeType: "increase",
      icon: Clock,
      color: "bg-orange-500"
    },
    {
      title: "AI Fraud Alert",
      subtitle: "Terdeteksi hari ini",
      value: "42",
      change: "-8%",
      changeType: "decrease",
      icon: AlertTriangle,
      color: "bg-red-500"
    },
    {
      title: "Approval Rate",
      subtitle: "30 hari terakhir",
      value: "92%",
      change: "+3%",
      changeType: "increase",
      icon: TrendingUp,
      color: "bg-emerald-500"
    }
  ];

  // Priority verification queue
  const highPriorityClaims = [
    {
      id: "CLM-2025-1847",
      hospital: "RS Cipto Mangunkusumo",
      patientName: "Ahmad Fauzi",
      diagnosis: "Diabetes Type 2 + Komplikasi",
      amount: "Rp 12.500.000",
      submittedDate: "18 Nov 2025",
      aiRiskScore: 87,
      aiFlags: ["Dokumen tidak konsisten", "Pola klaim tidak biasa"],
      estimatedTime: "2 jam"
    },
    {
      id: "CLM-2025-1845",
      hospital: "RS Dr. Sardjito",
      patientName: "Siti Aminah",
      diagnosis: "Operasi Jantung Koroner",
      amount: "Rp 15.700.000",
      submittedDate: "19 Nov 2025",
      aiRiskScore: 72,
      aiFlags: ["Kode ICD perlu review"],
      estimatedTime: "1 jam"
    },
    {
      id: "CLM-2025-1844",
      hospital: "RS Hasan Sadikin",
      patientName: "Budi Santoso",
      diagnosis: "Pneumonia Berat",
      amount: "Rp 9.200.000",
      submittedDate: "18 Nov 2025",
      aiRiskScore: 45,
      aiFlags: [],
      estimatedTime: "30 menit"
    }
  ];

  // Hospital performance summary
  const topIssueHospitals = [
    {
      name: "RSUD Dr. Soetomo",
      claimsTotal: 124,
      issueRate: 18,
      commonIssues: "Dokumen tidak lengkap"
    },
    {
      name: "RS Hasan Sadikin",
      claimsTotal: 142,
      issueRate: 12,
      commonIssues: "Kode ICD tidak sesuai"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <BPJSNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Dashboard Verifikasi Nasional
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Selasa, 19 November 2025 • Region: DKI Jakarta
          </p>
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
                {highPriorityClaims.map((claim) => (
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
                        {claim.aiFlags.length > 0 && (
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
                ))}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <Link
                  href="/bpjs/verifikasi"
                  className="block w-full py-2.5 text-center bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Lihat Semua Antrian ({highPriorityClaims.length + 325} klaim)
                </Link>
              </div>
            </div>

            {/* Hospitals Needing Attention */}
            <div className="bg-white rounded-xl border border-orange-200">
              <div className="p-5 border-b border-orange-100 bg-orange-50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-0.5">Rumah Sakit Perlu Perhatian</h2>
                    <p className="text-sm text-gray-600">RS dengan tingkat klaim bermasalah tinggi</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {topIssueHospitals.map((hospital, index) => (
                  <div key={index} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{hospital.name}</h3>
                        <p className="text-sm text-gray-600">{hospital.claimsTotal} klaim bulan ini</p>
                        <p className="text-sm text-orange-700 font-medium mt-1">Issue umum: {hospital.commonIssues}</p>
                      </div>
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full whitespace-nowrap">
                        {hospital.issueRate}% bermasalah
                      </span>
                    </div>
                    <Link
                      href={`/bpjs/insight?hospital=${hospital.name}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#144782] hover:text-[#03974a]"
                    >
                      Lihat Detail & Feedback
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
              <div className="space-y-2">
                <Link
                  href="/bpjs/verifikasi"
                  className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Verifikasi Klaim</p>
                    <p className="text-xs text-gray-500">328 menunggu</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  href="/bpjs/fraud"
                  className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                    <Shield className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Fraud Analytics</p>
                    <p className="text-xs text-gray-500">42 alert baru</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  href="/bpjs/insight"
                  className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Insight & Feedback</p>
                    <p className="text-xs text-gray-500">Analisis pola klaim</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>

            {/* Today's Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Ringkasan Hari Ini</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Disetujui</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">847</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-900">Pending</span>
                  </div>
                  <span className="text-xl font-bold text-orange-600">72</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-gray-900">Ditolak</span>
                  </div>
                  <span className="text-xl font-bold text-red-600">28</span>
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
