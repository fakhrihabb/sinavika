'use client';
import { useState, useEffect } from 'react';
import { Stethoscope, FileText, Clock, Activity, Calendar, CalendarCheck, Loader2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function PesertaPage() {
  const [stats, setStats] = useState([
    { label: "Total Keluhan", value: "0", icon: Activity, color: "text-blue-600" },
    { label: "Bulan Ini", value: "0", icon: Calendar, color: "text-green-600" },
    { label: "Keluhan Terakhir", value: "-", icon: Clock, color: "text-orange-600" }
  ]);

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    // Check cache first
    const cacheKey = 'dashboard-demo-user';
    const cached = sessionStorage.getItem(cacheKey);
    const cacheTime = sessionStorage.getItem(`${cacheKey}-time`);
    
    // Use cached data if less than 30 seconds old
    if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 30000) {
      const result = JSON.parse(cached);
      updateDashboardState(result);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all dashboard data in a single optimized API call
      const response = await fetch('/api/dashboard?userId=demo-user');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengambil data');
      }

      // Cache the result
      sessionStorage.setItem(cacheKey, JSON.stringify(result));
      sessionStorage.setItem(`${cacheKey}-time`, Date.now().toString());

      updateDashboardState(result);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateDashboardState = (result) => {
    // Update stats with server-calculated values
    setStats([
      { label: "Total Keluhan", value: result.stats.total.toString(), icon: Activity, color: "text-blue-600" },
      { label: "Bulan Ini", value: result.stats.monthly.toString(), icon: Calendar, color: "text-green-600" },
      { label: "Keluhan Terakhir", value: result.stats.lastTriageTime, icon: Clock, color: "text-orange-600" }
    ]);

    setDashboardData(result);
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <main className="px-4 py-6">
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
      {/* Header with Gradient Background */}
      <div className="relative bg-gradient-to-br from-teal-100 via-cyan-50 to-blue-100 pt-8 pb-20">
        {/* SINAVIKA Header */}
        <div className="flex flex-col items-center justify-center">
          <Image
            src="/branding/sinavika-logo.png"
            alt="SINAVIKA Logo"
            width={80}
            height={80}
            className="mb-3"
          />
          <h1 className="text-2xl font-bold text-gray-900">SINAVIKA</h1>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 -mb-1">
          <svg viewBox="0 0 1440 120" className="w-full block">
            <path
              fill="#f9fafb"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            ></path>
          </svg>
        </div>
      </div>

      <main className="px-4 -mt-12 relative z-10">
        {/* Quick Stats - Mobile Friendly */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-3 border border-gray-200">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Icon className={`w-5 h-5 ${stat.color}`} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Primary Quick Actions - Mobile Friendly */}
        <div className="space-y-4">
          <Link
            href="/peserta/sinavika/triage"
            className="group flex items-center justify-between bg-gradient-to-r from-[#03974a] to-[#144782] rounded-xl p-6 shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-4">
              <Stethoscope className="w-10 h-10 text-white/90" strokeWidth={2} />
              <div>
                <h3 className="text-xl font-bold text-white">Mulai Cek Keluhan</h3>
                <p className="text-white/80 text-sm">
                  Dapatkan rekomendasi layanan yang tepat
                </p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-white/70 flex-shrink-0" />
          </Link>

          <Link
            href="/peserta/sinavika/riwayat"
            className="group flex items-center justify-between bg-white rounded-xl p-6 border-2 border-[#03974a] shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-4">
              <FileText className="w-10 h-10 text-[#03974a]" strokeWidth={2} />
              <div>
                <h3 className="text-xl font-bold text-gray-900">Lihat Riwayat Keluhan</h3>
                <p className="text-gray-600 text-sm">
                  Akses hasil keluhan sebelumnya
                </p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-[#03974a] flex-shrink-0" />
          </Link>

          <Link
            href="/peserta/sinavika/janji-temu"
            className="group flex items-center justify-between bg-white rounded-xl p-6 border-2 border-blue-500 shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-4">
              <CalendarCheck className="w-10 h-10 text-blue-600" strokeWidth={2} />
              <div>
                <h3 className="text-xl font-bold text-gray-900">Janji Temu Saya</h3>
                <p className="text-gray-600 text-sm">
                  Kelola janji temu Anda
                </p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-blue-600 flex-shrink-0" />
          </Link>
        </div>
      </main>
    </div>
  );
}
