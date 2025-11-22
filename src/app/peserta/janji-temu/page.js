'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PesertaNavbar from '@/components/PesertaNavbar';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Phone,
  Building2,
  Navigation,
  Clock,
  ExternalLink,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Activity,
  FileText,
  ChevronRight,
} from 'lucide-react';

function JanjiTemuContent() {
  const searchParams = useSearchParams();
  const successParam = searchParams.get('success');

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(successParam === 'true');

  useEffect(() => {
    fetchAppointments();

    // Hide success message after 5 seconds
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/janji-temu?userId=demo-user');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengambil data janji temu');
      }

      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInMaps = (appointment) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${appointment.hospital_lat},${appointment.hospital_lng}&query_place_id=${appointment.hospital_place_id}`;
    window.open(mapsUrl, '_blank');
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: {
        label: 'Terjadwal',
        className: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle,
      },
      completed: {
        label: 'Selesai',
        className: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: CheckCircle,
      },
      cancelled: {
        label: 'Dibatalkan',
        className: 'bg-red-100 text-red-700 border-red-200',
        icon: XCircle,
      },
    };
    return badges[status] || badges.scheduled;
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
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getMainComplaint = (conversationSummary) => {
    if (!conversationSummary || conversationSummary.length === 0) return 'Tidak ada data';
    return conversationSummary[0]?.answer || 'Tidak ada data';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PesertaNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-[#03974a] animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Memuat janji temu...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PesertaNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Terjadi Kesalahan</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PesertaNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-800">Janji Temu Berhasil Dibuat!</h3>
                <p className="text-green-700 text-sm">
                  Janji temu Anda telah terdaftar. Pastikan untuk datang tepat waktu.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Janji Temu Saya</h1>
          <p className="text-gray-600">
            Daftar janji temu Anda dengan rumah sakit beserta ringkasan keluhan
          </p>
        </div>

        {/* Appointments List */}
        {appointments.length > 0 ? (
          <div className="space-y-6">
            {appointments.map((appointment) => {
              const StatusBadge = getStatusBadge(appointment.status);
              const triage = appointment.triage;

              return (
                <div
                  key={appointment.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all"
                >
                  <div className="p-8">
                    {/* Header with Status */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 flex items-center gap-1.5 ${StatusBadge.className}`}>
                          <StatusBadge.icon className="w-3.5 h-3.5" />
                          {StatusBadge.label}
                        </span>
                        {triage && (
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${getSeverityColor(triage.tingkat_keparahan)}`}>
                            {triage.label_keparahan}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {appointment.hospital_name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Activity className="w-4 h-4 text-[#03974a]" />
                        <span className="font-medium">{appointment.appointment_type}</span>
                        {appointment.specialty && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span>{appointment.specialty}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Triage Summary */}
                    {triage && (
                      <div className="mb-5 p-5 bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 border-2 border-green-300 rounded-xl">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-[#03974a]" />
                          Ringkasan Triage
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex gap-3">
                            <span className="font-semibold text-gray-700 min-w-[140px]">Keluhan utama:</span>
                            <p className="text-gray-800">{getMainComplaint(triage.conversation_summary)}</p>
                          </div>
                          <div className="flex gap-3">
                            <span className="font-semibold text-gray-700 min-w-[140px]">Rekomendasi:</span>
                            <p className="text-gray-800 font-medium">{triage.rekomendasi_layanan}</p>
                          </div>
                          <div className="flex gap-3">
                            <span className="font-semibold text-gray-700 min-w-[140px]">Alasan:</span>
                            <p className="text-gray-800">{triage.alasan}</p>
                          </div>
                          <div className="flex gap-3">
                            <span className="font-semibold text-gray-700 min-w-[140px]">Waktu kunjungan:</span>
                            <p className="text-gray-800">{triage.tanggal_kunjungan_disarankan}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Clinical Summary for Hospital */}
                    {appointment.clinical_summary && (
                      <div className="mb-5 p-5 bg-purple-50 border-2 border-purple-200 rounded-xl">
                        <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-purple-600" />
                          Ringkasan Klinis yang Dikirim ke Faskes
                        </h4>
                        <p className="text-sm text-purple-800 leading-relaxed whitespace-pre-line">
                          {appointment.clinical_summary}
                        </p>
                        <p className="text-xs text-purple-600 mt-3 italic">
                          Ringkasan ini telah dibagikan ke rumah sakit/faskes untuk mempercepat proses pelayanan Anda.
                        </p>
                      </div>
                    )}

                    {/* Hospital Details */}
                    <div className="space-y-3 mb-5 p-5 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#144782]" />
                        Detail Rumah Sakit
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3 text-gray-700">
                          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#03974a]" />
                          <span className="leading-relaxed">{appointment.hospital_address}</span>
                        </div>
                        {appointment.hospital_phone && (
                          <div className="flex items-center gap-3 text-gray-700">
                            <Phone className="w-4 h-4 flex-shrink-0 text-[#03974a]" />
                            <span>{appointment.hospital_phone}</span>
                          </div>
                        )}
                        {appointment.estimated_wait_time && (
                          <div className="flex items-center gap-3 text-gray-700">
                            <Clock className="w-4 h-4 flex-shrink-0 text-[#03974a]" />
                            <span>Estimasi tunggu: <span className="font-semibold">{appointment.estimated_wait_time}</span></span>
                          </div>
                        )}
                        {appointment.operational_hours && (
                          <div className="flex items-start gap-3 text-gray-700">
                            <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#03974a]" />
                            <span>Jam operasional: {appointment.operational_hours}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-6 text-gray-700 pt-2 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <Navigation className="w-4 h-4 flex-shrink-0 text-[#03974a]" />
                            <span className="font-semibold">{appointment.distance_km} km</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 flex-shrink-0 text-gray-500" />
                            <span>{appointment.duration_text}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="mb-5 p-4 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 flex-shrink-0 text-[#144782]" />
                        <span>Dibuat: {formatDate(appointment.created_at)} • {formatTime(appointment.created_at)}</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        <span>ID Triage: </span>
                        <span className="font-mono font-semibold text-gray-700">{appointment.triage_id}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleOpenInMaps(appointment)}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 border-2 border-[#03974a] text-[#03974a] rounded-xl hover:bg-green-50 hover:shadow-sm transition-all font-semibold"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Buka di Maps</span>
                      </button>
                      {triage && (
                        <Link
                          href={`/peserta/riwayat?triageId=${appointment.triage_id}`}
                          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#144782] to-[#0d3461] text-white rounded-xl hover:shadow-md transition-all font-semibold"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Lihat Detail Keluhan</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Belum Ada Janji Temu
            </h3>
            <p className="text-gray-600 mb-6">
              Anda belum memiliki janji temu dengan rumah sakit manapun.
            </p>
            <Link
              href="/peserta/triage"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#03974a] to-[#144782] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Mulai Cek Keluhan
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JanjiTemuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <PesertaNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 text-[#03974a] animate-spin" />
          </div>
        </div>
      </div>
    }>
      <JanjiTemuContent />
    </Suspense>
  );
}
