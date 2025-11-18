import BPJSNavbar from '@/components/BPJSNavbar';
import { FileText, TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function BPJSPage() {
  // Dummy national statistics
  const stats = [
    {
      title: "Klaim Masuk Hari Ini",
      value: "1,247",
      icon: FileText,
      color: "text-[#144782]",
      bgColor: "bg-blue-50",
      change: "+12%"
    },
    {
      title: "Pending Verifikasi",
      value: "328",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: "+5%"
    },
    {
      title: "Terdeteksi Anomali",
      value: "42",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      change: "-8%"
    },
    {
      title: "Tingkat Approval",
      value: "92%",
      icon: CheckCircle,
      color: "text-[#03974a]",
      bgColor: "bg-green-50",
      change: "+3%"
    }
  ];

  // Dummy hospital rankings
  const hospitalRankings = [
    {
      id: 1,
      name: "RS Cipto Mangunkusumo",
      claimsTotal: 156,
      issueRate: 8,
      rating: "Baik"
    },
    {
      id: 2,
      name: "RS Hasan Sadikin",
      claimsTotal: 142,
      issueRate: 12,
      rating: "Sedang"
    },
    {
      id: 3,
      name: "RS Dr. Sardjito",
      claimsTotal: 138,
      issueRate: 5,
      rating: "Sangat Baik"
    },
    {
      id: 4,
      name: "RSUD Dr. Soetomo",
      claimsTotal: 124,
      issueRate: 18,
      rating: "Perlu Perhatian"
    }
  ];

  // Dummy verification queue
  const verificationQueue = [
    {
      id: "CLM-2025-1847",
      hospital: "RS Cipto Mangunkusumo",
      amount: "Rp 12.500.000",
      priority: "high",
      aiFlag: true
    },
    {
      id: "CLM-2025-1846",
      hospital: "RS Hasan Sadikin",
      amount: "Rp 8.200.000",
      priority: "medium",
      aiFlag: false
    },
    {
      id: "CLM-2025-1845",
      hospital: "RS Dr. Sardjito",
      amount: "Rp 15.700.000",
      priority: "high",
      aiFlag: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <BPJSNavbar />

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Dashboard BPJS Kesehatan
          </h1>
          <p className="text-gray-600">
            Monitoring klaim nasional dan deteksi fraud terpadu
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} strokeWidth={2} />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    stat.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Verification Queue */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Antrian Verifikasi Prioritas</h3>
              <div className="space-y-4">
                {verificationQueue.map((claim) => (
                  <div 
                    key={claim.id} 
                    className={`p-4 rounded-xl border-l-4 ${
                      claim.priority === 'high' ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{claim.id}</h4>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Building2 className="w-4 h-4" />
                          {claim.hospital}
                        </p>
                      </div>
                      {claim.aiFlag && (
                        <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">
                          <AlertTriangle className="w-3 h-3" />
                          AI Flag
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#144782]">{claim.amount}</span>
                      <Link 
                        href={`/bpjs/verifikasi/${claim.id}`}
                        className="text-sm text-[#03974a] hover:text-[#144782] font-semibold"
                      >
                        Verifikasi →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <Link 
                href="/bpjs/verifikasi"
                className="mt-4 block text-center text-[#144782] hover:text-[#03974a] font-semibold"
              >
                Lihat Semua Klaim →
              </Link>
            </div>

            {/* Claim Trend Chart Placeholder */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Trend Klaim Mingguan</h3>
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 rounded-xl">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Chart akan ditampilkan di sini</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hospital Rankings */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Peringkat Rumah Sakit</h3>
              <p className="text-xs text-gray-500 mb-4">Berdasarkan tingkat klaim bermasalah</p>
              <div className="space-y-3">
                {hospitalRankings.map((hospital, index) => (
                  <div key={hospital.id} className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-lg text-gray-400">#{index + 1}</span>
                        <div>
                          <h4 className="font-semibold text-sm text-gray-800">{hospital.name}</h4>
                          <p className="text-xs text-gray-500">{hospital.claimsTotal} klaim</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Issue rate: {hospital.issueRate}%</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        hospital.rating === 'Sangat Baik' ? 'bg-green-100 text-green-700' :
                        hospital.rating === 'Baik' ? 'bg-blue-100 text-blue-700' :
                        hospital.rating === 'Sedang' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {hospital.rating}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Link 
                href="/bpjs/insight"
                className="mt-4 block w-full py-2 text-center bg-gradient-to-r from-[#03974a] to-[#144782] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Lihat Detail Insight
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Aksi Cepat</h3>
              <div className="space-y-3">
                <Link 
                  href="/bpjs/fraud"
                  className="block p-3 bg-white rounded-xl hover:shadow-md transition-all text-gray-700 hover:text-[#144782] font-medium"
                >
                  🔍 Fraud Analytics
                </Link>
                <Link 
                  href="/bpjs/verifikasi"
                  className="block p-3 bg-white rounded-xl hover:shadow-md transition-all text-gray-700 hover:text-[#144782] font-medium"
                >
                  ✅ Verifikasi Klaim
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
