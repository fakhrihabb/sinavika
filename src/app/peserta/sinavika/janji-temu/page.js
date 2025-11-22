'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import MobileHeader from '@/components/MobileHeader';

function JanjiTemuContent() {
  const searchParams = useSearchParams();
  const successParam = searchParams.get('success');

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(successParam === 'true');
  const [expandedCards, setExpandedCards] = useState({});

  const fetchAppointments = async () => {
    // Check cache first
    const cacheKey = 'appointments-demo-user';
    const cached = sessionStorage.getItem(cacheKey);
    const cacheTime = sessionStorage.getItem(`${cacheKey}-time`);
    
    // Use cached data if less than 30 seconds old
    if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 30000) {
      const data = JSON.parse(cached);
      setAppointments(data.appointments || []);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/janji-temu?userId=demo-user');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengambil data janji temu');
      }

      // Cache the result
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
      sessionStorage.setItem(`${cacheKey}-time`, Date.now().toString());

      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();

    // Hide success message after 5 seconds
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

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

  const toggleCard = (appointmentId) => {
    setExpandedCards(prev => ({
      ...prev,
      [appointmentId]: !prev[appointmentId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader title="Janji Temu Saya" />
        <div className="px-4 py-8">
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-[#03974a] animate-spin mx-auto mb-3" />
              <p className="text-gray-600 text-sm">Memuat janji temu...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader title="Janji Temu Saya" />
        <div className="px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 mb-1 text-sm">Terjadi Kesalahan</h3>
                <p className="text-red-700 text-xs leading-relaxed">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Janji Temu Saya" />

      <div className="px-4 py-4">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-3 bg-green-50 border border-green-300 rounded-lg p-3 shadow-sm">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800 text-sm mb-0.5">Janji Temu Berhasil Dibuat!</h3>
                <p className="text-green-700 text-xs leading-relaxed">
                  Janji temu Anda telah terdaftar. Pastikan untuk datang tepat waktu.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Appointments List */}
        {appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.map((appointment) => {
              const StatusBadge = getStatusBadge(appointment.status);
              const triage = appointment.triage;
              const isExpanded = expandedCards[appointment.id];

              return (
                <div
                  key={appointment.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Collapsible Header */}
                  <div 
                    className="p-4 cursor-pointer active:bg-gray-50 transition-colors"
                    onClick={() => toggleCard(appointment.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${StatusBadge.className}`}>
                            <StatusBadge.icon className="w-3 h-3" />
                            {StatusBadge.label}
                          </span>
                          {triage && (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(triage.tingkat_keparahan)}`}>
                              {triage.label_keparahan}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">
                          {appointment.hospital_name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Activity className="w-3.5 h-3.5 text-[#03974a]" />
                          <span className="font-medium">{appointment.appointment_type}</span>
                          {appointment.specialty && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="truncate">{appointment.specialty}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Toggle Icon */}
                      <button 
                        className="shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCard(appointment.id);
                        }}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      {/* Triage Summary */}
                      {triage && (
                        <div className="mt-3 mb-3 p-3 bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 border border-green-300 rounded-lg">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-1.5 text-sm">
                            <FileText className="w-4 h-4 text-[#03974a]" />
                            Ringkasan Triage
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="font-semibold text-gray-700 block mb-0.5">Keluhan utama:</span>
                              <p className="text-gray-800 leading-relaxed">{getMainComplaint(triage.conversation_summary)}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700 block mb-0.5">Rekomendasi:</span>
                              <p className="text-gray-800 font-medium">{triage.rekomendasi_layanan}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700 block mb-0.5">Alasan:</span>
                              <p className="text-gray-800 leading-relaxed">{triage.alasan}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700 block mb-0.5">Waktu kunjungan:</span>
                              <p className="text-gray-800">{triage.tanggal_kunjungan_disarankan}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Clinical Summary for Hospital */}
                      {appointment.clinical_summary && (
                        <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-1.5 text-sm">
                            <FileText className="w-4 h-4 text-purple-600" />
                            Ringkasan Klinis untuk Faskes
                          </h4>
                          <p className="text-xs text-purple-800 leading-relaxed whitespace-pre-line">
                            {appointment.clinical_summary}
                          </p>
                          <p className="text-[10px] text-purple-600 mt-2 italic leading-relaxed">
                            Ringkasan ini telah dibagikan ke rumah sakit/faskes untuk mempercepat proses pelayanan Anda.
                          </p>
                        </div>
                      )}

                      {/* Hospital Details */}
                      <div className="mb-3 p-3 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                        <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-1.5 text-sm">
                          <Building2 className="w-4 h-4 text-[#144782]" />
                          Detail Rumah Sakit
                        </h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-start gap-2 text-gray-700">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#03974a]" />
                            <span className="leading-relaxed">{appointment.hospital_address}</span>
                          </div>
                          {appointment.hospital_phone && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Phone className="w-3.5 h-3.5 flex-shrink-0 text-[#03974a]" />
                              <span>{appointment.hospital_phone}</span>
                            </div>
                          )}
                          {appointment.estimated_wait_time && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock className="w-3.5 h-3.5 flex-shrink-0 text-[#03974a]" />
                              <span>Estimasi tunggu: <span className="font-semibold">{appointment.estimated_wait_time}</span></span>
                            </div>
                          )}
                          {appointment.operational_hours && (
                            <div className="flex items-start gap-2 text-gray-700">
                              <Clock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#03974a]" />
                              <span>Jam operasional: {appointment.operational_hours}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-gray-700 pt-2 border-t border-blue-200/50">
                            <div className="flex items-center gap-1.5">
                              <Navigation className="w-3.5 h-3.5 flex-shrink-0 text-[#03974a]" />
                              <span className="font-semibold">{appointment.distance_km} km</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                              <span>{appointment.duration_text}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="mb-3 p-2.5 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-[#144782]" />
                          <span className="text-[11px]">Dibuat: {formatDate(appointment.created_at)} • {formatTime(appointment.created_at)}</span>
                        </div>
                        <div className="mt-1.5 text-[10px] text-gray-500">
                          <span>ID: </span>
                          <span className="font-mono font-semibold text-gray-700">{appointment.triage_id}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenInMaps(appointment);
                          }}
                          className="flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-[#03974a] text-[#03974a] rounded-lg active:bg-green-50 transition-colors font-semibold text-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Maps</span>
                        </button>
                        {triage && (
                          <Link
                            href={`/peserta/sinavika/riwayat?triageId=${appointment.triage_id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-[#144782] to-[#0d3461] text-white rounded-lg active:opacity-90 transition-opacity font-semibold text-xs"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
            <Calendar className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1.5">
              Belum Ada Janji Temu
            </h3>
            <p className="text-sm text-gray-600 mb-5 px-6">
              Anda belum memiliki janji temu dengan rumah sakit manapun.
            </p>
            <Link
              href="/peserta/sinavika/triage"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#03974a] to-[#144782] text-white rounded-lg font-semibold text-sm active:scale-95 transition-transform"
            >
              Mulai Cek Keluhan
              <ChevronRight className="w-4 h-4" />
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
        <MobileHeader title="Janji Temu Saya" />
        <div className="px-4 py-8">
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 text-[#03974a] animate-spin" />
          </div>
        </div>
      </div>
    }>
      <JanjiTemuContent />
    </Suspense>
  );
}
