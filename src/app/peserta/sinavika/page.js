'use client';
import { useState, useEffect } from 'react';
import { Stethoscope, FileText, Clock, Activity, Calendar, CalendarCheck, Loader2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
      <main className="px-4 py-6">
        {/* SINAVIKA Header */}
        <div className="flex flex-col items-center justify-center mb-8">
          <Image
            src="/branding/sinavika-logo.png"
            alt="SINAVIKA Logo"
            width={80}
            height={80}
            className="mb-3"
          />
          <h1 className="text-2xl font-bold text-gray-900">SINAVIKA</h1>
        </div>

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
