'use client';

import { useState, useEffect } from 'react';
import RumahSakitNavbar from '@/components/RumahSakitNavbar';
import {
  Users, Clock, AlertCircle, Filter, Search, ChevronRight,
  User, Calendar, MapPin, Phone, FileText, Activity,
  ArrowUpDown, CheckCircle, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { generateIndonesianName, formatPatientId } from '@/lib/nameGenerator';

export default function AntrianPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [appointmentTypeFilter, setAppointmentTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // newest, severity, type

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rumah-sakit/antrian?status=scheduled');
      const result = await response.json();

      if (result.success) {
        setPatients(result.data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort patients
  const filteredPatients = patients
    .filter(patient => {
      // Search filter
      const matchesSearch = !searchTerm ||
        patient.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.triage_id?.toLowerCase().includes(searchTerm.toLowerCase());

      // Severity filter
      const matchesSeverity = severityFilter === 'all' ||
        patient.triage?.tingkat_keparahan === severityFilter;

      // Appointment type filter
      const matchesType = appointmentTypeFilter === 'all' ||
        patient.appointment_type === appointmentTypeFilter;

      return matchesSearch && matchesSeverity && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'severity') {
        const severityOrder = { emergency: 0, high: 1, medium: 2, low: 3 };
        return (severityOrder[a.triage?.tingkat_keparahan] || 99) -
               (severityOrder[b.triage?.tingkat_keparahan] || 99);
      } else if (sortBy === 'type') {
        return (a.appointment_type || '').localeCompare(b.appointment_type || '');
      }
      return 0;
    });

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'emergency':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAppointmentTypeIcon = (type) => {
    switch (type) {
      case 'IGD':
        return <Activity className="w-4 h-4" />;
      case 'Poli Spesialis':
      case 'Poli Umum':
        return <User className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} menit lalu`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} jam lalu`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} hari lalu`;
    }
  };

  // Statistics
  const stats = {
    total: filteredPatients.length,
    emergency: filteredPatients.filter(p => p.triage?.tingkat_keparahan === 'emergency').length,
    high: filteredPatients.filter(p => p.triage?.tingkat_keparahan === 'high').length,
    medium: filteredPatients.filter(p => p.triage?.tingkat_keparahan === 'medium').length,
    low: filteredPatients.filter(p => p.triage?.tingkat_keparahan === 'low').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RumahSakitNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Antrian Pasien Triage
              </h1>
              <p className="text-gray-600">
                Kelola pasien yang datang dengan hasil triage SINAVIKA
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchPatients}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Total</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">Darurat</span>
              </div>
              <p className="text-2xl font-bold text-red-700">{stats.emergency}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-700">Tinggi</span>
              </div>
              <p className="text-2xl font-bold text-orange-700">{stats.high}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">Sedang</span>
              </div>
              <p className="text-2xl font-bold text-yellow-700">{stats.medium}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700">Rendah</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{stats.low}</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Pasien
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ID atau Nama..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#03974a] focus:border-transparent"
                />
              </div>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tingkat Keparahan
              </label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#03974a] focus:border-transparent"
              >
                <option value="all">Semua</option>
                <option value="emergency">Gawat Darurat</option>
                <option value="high">Tinggi</option>
                <option value="medium">Sedang</option>
                <option value="low">Rendah</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Layanan
              </label>
              <select
                value={appointmentTypeFilter}
                onChange={(e) => setAppointmentTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#03974a] focus:border-transparent"
              >
                <option value="all">Semua</option>
                <option value="IGD">IGD</option>
                <option value="Poli Spesialis">Poli Spesialis</option>
                <option value="Poli Umum">Poli Umum</option>
                <option value="Faskes Tingkat Pertama">Faskes Tk. Pertama</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urutkan
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#03974a] focus:border-transparent"
              >
                <option value="newest">Terbaru</option>
                <option value="severity">Tingkat Keparahan</option>
                <option value="type">Jenis Layanan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patient Queue List */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Memuat data pasien...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Tidak ada pasien dalam antrian</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    {/* Patient Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {generateIndonesianName(patient.triage_id || patient.user_id)}
                          </h3>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                            {formatPatientId(patient.user_id, patient.triage_id)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityBadgeClass(patient.triage?.tingkat_keparahan)}`}>
                            {patient.triage?.label_keparahan || 'Tidak ada triage'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>Triage ID: <span className="font-medium">{patient.triage_id}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Dibuat: {formatTimeAgo(patient.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getAppointmentTypeIcon(patient.appointment_type)}
                            <span>Layanan: <span className="font-medium">{patient.appointment_type}</span></span>
                          </div>
                          {patient.specialty && (
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4" />
                              <span>Spesialis: <span className="font-medium">{patient.specialty}</span></span>
                            </div>
                          )}
                        </div>

                        {/* Hospital Info */}
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">{patient.hospital_name}</p>
                              <p className="text-xs text-gray-600 mt-0.5">{patient.hospital_address}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                {patient.hospital_phone && patient.hospital_phone !== 'Tidak tersedia' && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {patient.hospital_phone}
                                  </span>
                                )}
                                {patient.distance_text && (
                                  <span>📍 {patient.distance_text}</span>
                                )}
                                {patient.duration_text && (
                                  <span>🕐 {patient.duration_text}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Triage Summary Preview */}
                        {patient.triage?.ringkasan_klinis && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-gray-700 line-clamp-2">
                              <span className="font-semibold text-blue-900">Ringkasan: </span>
                              {patient.triage.ringkasan_klinis}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {patient.triage?.perlu_rujukan && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">
                          Perlu Rujukan
                        </span>
                      )}
                      {patient.triage?.tanggal_kunjungan_disarankan && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {patient.triage.tanggal_kunjungan_disarankan}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/rumah-sakit/antrian/${patient.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#03974a] to-[#144782] text-white rounded-lg text-sm font-semibold hover:shadow-md transition-shadow"
                    >
                      Buka Ringkasan Klinis
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
