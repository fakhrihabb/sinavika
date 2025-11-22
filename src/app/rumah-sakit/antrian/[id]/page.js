'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RumahSakitNavbar from '@/components/RumahSakitNavbar';
import {
  ArrowLeft, User, FileText, AlertCircle, Clock, Calendar,
  MapPin, Phone, Activity, CheckCircle, Edit3, Send,
  AlertTriangle, TrendingUp, Stethoscope, ClipboardList,
  MessageSquare, Save, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { generateIndonesianName, formatPatientId } from '@/lib/nameGenerator';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [vitalSigns, setVitalSigns] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    respiratory: '',
    oxygenSaturation: ''
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // summary, history, vitals, notes

  useEffect(() => {
    fetchPatientDetail();
  }, [params.id]);

  const fetchPatientDetail = async () => {
    try {
      setLoading(true);
      // Fetch from the antrian API first
      const response = await fetch('/api/rumah-sakit/antrian?status=scheduled');
      const result = await response.json();

      if (result.success) {
        const foundPatient = result.data.find(p => p.id === params.id);
        if (foundPatient) {
          setPatient(foundPatient);
        } else {
          console.error('Patient not found');
        }
      } else {
        console.error('API error:', result);
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setSaving(true);
      const response = await fetch('/api/rumah-sakit/antrian', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: patient.id,
          status: newStatus
        })
      });

      const result = await response.json();
      if (result.success) {
        setPatient({ ...patient, status: newStatus });
        alert('Status berhasil diperbarui');

        if (newStatus === 'completed') {
          router.push('/rumah-sakit/antrian');
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Gagal memperbarui status');
    } finally {
      setSaving(false);
    }
  };

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'emergency':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <RumahSakitNavbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Memuat detail pasien...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <RumahSakitNavbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Pasien tidak ditemukan</p>
            <Link
              href="/rumah-sakit/antrian"
              className="inline-flex items-center gap-2 text-[#03974a] font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Antrian
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const triage = patient.triage;

  return (
    <div className="min-h-screen bg-gray-50">
      <RumahSakitNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/rumah-sakit/antrian"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Antrian
          </Link>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-[#03974a] to-[#144782] rounded-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {generateIndonesianName(patient.triage_id || patient.user_id)}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium">
                      {formatPatientId(patient.user_id, patient.triage_id)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getSeverityBadgeClass(triage?.tingkat_keparahan)}`}>
                      {triage?.label_keparahan || 'Tidak ada triage'}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {patient.appointment_type}
                    </span>
                    {patient.specialty && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                        {patient.specialty}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      Triage ID: <span className="font-medium">{patient.triage_id}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(patient.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus('completed')}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Selesai Ditangani
                </button>
                <button
                  onClick={() => handleUpdateStatus('cancelled')}
                  disabled={saving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Batalkan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'summary'
                    ? 'border-[#03974a] text-[#03974a]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Ringkasan Klinis
                </span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-[#03974a] text-[#03974a]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Riwayat Kuesioner
                </span>
              </button>
              <button
                onClick={() => setActiveTab('vitals')}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'vitals'
                    ? 'border-[#03974a] text-[#03974a]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Data Vital
                </span>
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'notes'
                    ? 'border-[#03974a] text-[#03974a]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  Catatan Dokter
                </span>
              </button>
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <>
                {/* AI Triage Result */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-1">
                        Hasil Analisis AI Triage
                      </h2>
                      <p className="text-sm text-gray-600">
                        Ringkasan klinis dari sistem SINAVIKA
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Severity and Recommendation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Tingkat Keparahan</p>
                        <p className="text-lg font-bold text-gray-900">
                          {triage?.label_keparahan || 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Rekomendasi Layanan</p>
                        <p className="text-lg font-bold text-gray-900">
                          {triage?.rekomendasi_layanan || 'N/A'}
                          {triage?.nama_spesialis && ` - ${triage.nama_spesialis}`}
                        </p>
                      </div>
                    </div>

                    {/* Clinical Summary */}
                    {triage?.ringkasan_klinis && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 mb-2">
                          Ringkasan Klinis Lengkap
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {triage.ringkasan_klinis}
                        </p>
                      </div>
                    )}

                    {/* Hospital Summary */}
                    {triage?.ringkasan_untuk_rs && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-semibold text-green-900 mb-2">
                          Ringkasan untuk Tenaga Kesehatan
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {triage.ringkasan_untuk_rs}
                        </p>
                      </div>
                    )}

                    {/* Reason */}
                    {triage?.alasan && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-900 mb-2">
                          Alasan Rekomendasi
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {triage.alasan}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Items and Danger Signs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Action Items */}
                  {triage?.tindakan && Array.isArray(triage.tindakan) && triage.tindakan.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <ClipboardList className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Tindakan yang Disarankan
                          </h3>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {triage.tindakan.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Danger Signs */}
                  {triage?.gejala_bahaya && Array.isArray(triage.gejala_bahaya) && triage.gejala_bahaya.length > 0 && (
                    <div className="bg-white rounded-lg border border-red-200 p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Gejala Bahaya
                          </h3>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {triage.gejala_bahaya.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-red-700">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                {triage?.catatan_tambahan && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Catatan Tambahan
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {triage.catatan_tambahan}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                      Riwayat Kuesioner Triage
                    </h2>
                    <p className="text-sm text-gray-600">
                      Pertanyaan dan jawaban dari sesi triage
                    </p>
                  </div>
                </div>

                {triage?.conversation_summary && Array.isArray(triage.conversation_summary) && triage.conversation_summary.length > 0 ? (
                  <div className="space-y-4">
                    {triage.conversation_summary.map((qa, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="mb-2">
                          <p className="text-sm font-semibold text-gray-900">
                            Q{index + 1}: {qa.question}
                          </p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Jawaban: </span>
                            {qa.answer}
                          </p>
                        </div>
                        {qa.timestamp && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(qa.timestamp).toLocaleString('id-ID')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Tidak ada riwayat kuesioner</p>
                )}
              </div>
            )}

            {/* Vitals Tab */}
            {activeTab === 'vitals' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Activity className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                      Data Vital Signs
                    </h2>
                    <p className="text-sm text-gray-600">
                      Input data vital pasien oleh tenaga kesehatan
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tekanan Darah (mmHg)
                      </label>
                      <input
                        type="text"
                        placeholder="120/80"
                        value={vitalSigns.bloodPressure}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressure: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03974a] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Denyut Nadi (bpm)
                      </label>
                      <input
                        type="text"
                        placeholder="75"
                        value={vitalSigns.heartRate}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, heartRate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03974a] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Suhu Tubuh (°C)
                      </label>
                      <input
                        type="text"
                        placeholder="36.5"
                        value={vitalSigns.temperature}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03974a] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Laju Respirasi (per menit)
                      </label>
                      <input
                        type="text"
                        placeholder="16"
                        value={vitalSigns.respiratory}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, respiratory: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03974a] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Saturasi Oksigen (%)
                      </label>
                      <input
                        type="text"
                        placeholder="98"
                        value={vitalSigns.oxygenSaturation}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, oxygenSaturation: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03974a] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button
                    className="w-full py-3 bg-gradient-to-r from-[#03974a] to-[#144782] text-white rounded-lg font-semibold hover:shadow-md transition-shadow flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Data Vital
                  </button>
                </div>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Edit3 className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                      Catatan Dokter
                    </h2>
                    <p className="text-sm text-gray-600">
                      Tambahkan catatan pemeriksaan dan diagnosis
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <textarea
                    rows={10}
                    placeholder="Tulis catatan pemeriksaan, diagnosis, dan rencana tindakan..."
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03974a] focus:border-transparent"
                  />
                  <div className="flex gap-3">
                    <button
                      className="flex-1 py-3 bg-gradient-to-r from-[#03974a] to-[#144782] text-white rounded-lg font-semibold hover:shadow-md transition-shadow flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Simpan Catatan
                    </button>
                    <button
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Kirim ke Modul Klaim
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Hospital Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Informasi Fasilitas</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{patient.hospital_name}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{patient.hospital_address}</p>
                  </div>
                </div>
                {patient.hospital_phone && patient.hospital_phone !== 'Tidak tersedia' && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-700">{patient.hospital_phone}</p>
                  </div>
                )}
                {patient.distance_text && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Jarak</span>
                    <span className="font-medium text-gray-900">{patient.distance_text}</span>
                  </div>
                )}
                {patient.duration_text && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Waktu Tempuh</span>
                    <span className="font-medium text-gray-900">{patient.duration_text}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Visit Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Informasi Kunjungan</h3>
              <div className="space-y-3">
                {triage?.perlu_rujukan !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Perlu Rujukan</span>
                    <span className={`font-semibold ${triage.perlu_rujukan ? 'text-orange-700' : 'text-green-700'}`}>
                      {triage.perlu_rujukan ? 'Ya' : 'Tidak'}
                    </span>
                  </div>
                )}
                {triage?.tanggal_kunjungan_disarankan && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Tanggal Kunjungan Disarankan</p>
                    <p className="text-sm font-semibold text-gray-900">{triage.tanggal_kunjungan_disarankan}</p>
                  </div>
                )}
                {triage?.jam_operasional_disarankan && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Jam Operasional</p>
                    <p className="text-sm font-semibold text-gray-900">{triage.jam_operasional_disarankan}</p>
                  </div>
                )}
                {triage?.estimasi_waktu_tunggu && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Estimasi Waktu Tunggu</p>
                    <p className="text-sm font-semibold text-gray-900">{triage.estimasi_waktu_tunggu}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Aksi Cepat</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-left">
                  Cetak Ringkasan
                </button>
                <button className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-left">
                  Kirim ke Dokter Lain
                </button>
                <Link
                  href="/rumah-sakit/klaim"
                  className="block w-full px-4 py-2 bg-gradient-to-r from-[#03974a] to-[#144782] text-white rounded-lg text-sm font-semibold text-center hover:shadow-md transition-shadow"
                >
                  Buat Klaim
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
