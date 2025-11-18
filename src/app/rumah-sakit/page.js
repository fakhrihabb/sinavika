import RumahSakitNavbar from '@/components/RumahSakitNavbar';
import { Users, FileCheck, AlertCircle, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function RumahSakitPage() {
  // Dummy statistics
  const stats = [
    {
      title: "Pasien SINAVIKA Hari Ini",
      value: "24",
      icon: Users,
      color: "text-[#03974a]",
      bgColor: "bg-green-50"
    },
    {
      title: "Klaim Siap Kirim",
      value: "12",
      icon: FileCheck,
      color: "text-[#144782]",
      bgColor: "bg-blue-50"
    },
    {
      title: "Klaim Pending",
      value: "8",
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Tingkat Approval",
      value: "87%",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    }
  ];

  // Dummy notifications
  const notifications = [
    {
      id: 1,
      type: "patient",
      title: "Pasien Baru dari Triage",
      message: "Ahmad Fauzi - Tingkat kegawatan: Perlu dokter hari ini",
      time: "10 menit lalu",
      priority: "medium"
    },
    {
      id: 2,
      type: "claim",
      title: "Klaim Perlu Diperbaiki",
      message: "Klaim #INV-2025-0847 - Dokumen penunjang tidak lengkap",
      time: "1 jam lalu",
      priority: "high"
    },
    {
      id: 3,
      type: "patient",
      title: "Pasien Baru dari Triage",
      message: "Siti Nurhaliza - Tingkat kegawatan: Bisa dijadwalkan",
      time: "2 jam lalu",
      priority: "low"
    }
  ];

  // Dummy claim status
  const claimStatus = [
    { status: "Diterima", count: 45, color: "text-green-600", bgColor: "bg-green-50" },
    { status: "Pending", count: 8, color: "text-orange-600", bgColor: "bg-orange-50" },
    { status: "Ditolak", count: 2, color: "text-red-600", bgColor: "bg-red-50" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <RumahSakitNavbar />

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Dashboard Rumah Sakit
          </h1>
          <p className="text-gray-600">
            Monitoring pasien dan manajemen klaim terpadu
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
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notifications */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Notifikasi Terbaru</h3>
              <div className="space-y-4">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-4 rounded-xl border-l-4 ${
                      notif.priority === 'high' ? 'border-red-500 bg-red-50' : 
                      notif.priority === 'medium' ? 'border-orange-500 bg-orange-50' : 
                      'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{notif.title}</h4>
                      <span className="text-xs text-gray-500">{notif.time}</span>
                    </div>
                    <p className="text-sm text-gray-600">{notif.message}</p>
                  </div>
                ))}
              </div>
              <Link 
                href="/rumah-sakit/notifikasi"
                className="mt-4 block text-center text-[#144782] hover:text-[#03974a] font-semibold"
              >
                Lihat Semua Notifikasi →
              </Link>
            </div>
          </div>

          {/* Claim Status Summary */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Status Klaim</h3>
              <div className="space-y-3">
                {claimStatus.map((item, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-xl ${item.bgColor}`}>
                    <span className="font-semibold text-gray-700">{item.status}</span>
                    <span className={`text-2xl font-bold ${item.color}`}>{item.count}</span>
                  </div>
                ))}
              </div>
              <Link 
                href="/rumah-sakit/klaim"
                className="mt-4 block w-full py-2 text-center bg-gradient-to-r from-[#03974a] to-[#144782] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Kelola Klaim
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Aksi Cepat</h3>
              <div className="space-y-3">
                <Link 
                  href="/rumah-sakit/antrian"
                  className="block p-3 bg-white rounded-xl hover:shadow-md transition-all text-gray-700 hover:text-[#144782] font-medium"
                >
                  📋 Lihat Antrian Pasien
                </Link>
                <Link 
                  href="/rumah-sakit/klaim"
                  className="block p-3 bg-white rounded-xl hover:shadow-md transition-all text-gray-700 hover:text-[#144782] font-medium"
                >
                  ✅ Pre-check Klaim
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
