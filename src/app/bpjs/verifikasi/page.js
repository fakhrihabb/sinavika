'use client';
import { useState, useEffect } from 'react';
import BpjsNavbar from '@/components/BpjsNavbar';
import { FileText, Search, Filter, Clock, CheckCircle, XCircle, AlertTriangle, Eye, ChevronDown, Calendar, Hospital, User, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifikasiKlaimPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch claims from API
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/bpjs/claims');
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Gagal mengambil data klaim');
        }

        // Transform data from Supabase to component format
        const transformedClaims = result.data.map(claim => ({
          id: claim.id,
          patientName: claim.patient_name,
          patientId: claim.patient_bpjs_number,
          hospital: claim.hospital,
          submittedDate: new Date(claim.submitted_at).toLocaleDateString('id-ID'),
          treatmentDate: claim.discharge_date ? new Date(claim.discharge_date).toLocaleDateString('id-ID') : '-',
          diagnosis: claim.ina_cbg_description || '-',
          inaCbgCode: claim.ina_cbg_code || '-',
          claimAmount: claim.tarif_rs || 0,
          inaCbgAmount: claim.tarif_ina_cbg || 0,
          status: claim.status,
          priority: claim.priority,
          documentsComplete: true, // TODO: calculate from documents
          verifier: claim.verified_by
        }));

        setClaims(transformedClaims);
      } catch (err) {
        console.error('Fetch claims error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            Menunggu Verifikasi
          </span>
        );
      case 'approved':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            Disetujui
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold flex items-center gap-1.5">
            <XCircle className="w-4 h-4" />
            Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">High</span>;
      case 'medium':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">Medium</span>;
      case 'low':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">Low</span>;
      default:
        return null;
    }
  };

  const getAmountDifference = (claimAmount, inaCbgAmount) => {
    const diff = claimAmount - inaCbgAmount;
    const percentage = ((diff / inaCbgAmount) * 100).toFixed(1);

    if (diff > 0) {
      return (
        <span className="text-red-600 font-semibold">
          +Rp {diff.toLocaleString('id-ID')} ({percentage}%)
        </span>
      );
    } else if (diff < 0) {
      return (
        <span className="text-green-600 font-semibold">
          -Rp {Math.abs(diff).toLocaleString('id-ID')} ({Math.abs(percentage)}%)
        </span>
      );
    } else {
      return <span className="text-gray-600">Sesuai</span>;
    }
  };

  // Filter claims
  const filteredClaims = claims.filter(claim => {
    const matchSearch =
      claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.hospital.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus = filterStatus === 'all' || claim.status === filterStatus;
    const matchPriority = filterPriority === 'all' || claim.priority === filterPriority;

    return matchSearch && matchStatus && matchPriority;
  });

  // Statistics
  const stats = {
    total: claims.length,
    pending: claims.filter(c => c.status === 'pending').length,
    approved: claims.filter(c => c.status === 'approved').length,
    rejected: claims.filter(c => c.status === 'rejected').length
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BpjsNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#144782] animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Memuat data klaim...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BpjsNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center max-w-md">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gagal Memuat Data</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#144782] text-white rounded-xl hover:bg-[#03974a] transition-colors font-semibold"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BpjsNavbar />

      <div className="max-w-[1920px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Verifikasi Klaim</h1>
              <p className="text-gray-600">Review dan verifikasi klaim dari rumah sakit</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Klaim</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-2xl border-2 border-orange-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 mb-1">Menunggu</p>
                  <p className="text-3xl font-bold text-orange-900">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-orange-200 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-700" />
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-2xl border-2 border-green-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 mb-1">Disetujui</p>
                  <p className="text-3xl font-bold text-green-900">{stats.approved}</p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 mb-1">Ditolak</p>
                  <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
                </div>
                <div className="w-12 h-12 bg-red-200 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari klaim, pasien, atau rumah sakit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144782]"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144782] appearance-none bg-white"
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Menunggu</option>
                  <option value="approved">Disetujui</option>
                  <option value="rejected">Ditolak</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Priority Filter */}
              <div className="relative">
                <AlertTriangle className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144782] appearance-none bg-white"
                >
                  <option value="all">Semua Prioritas</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Claims List */}
        <div className="space-y-4">
          {filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className={`bg-white rounded-2xl border-2 shadow-sm hover:shadow-lg transition-all ${
                claim.status === 'pending' ? 'border-orange-300' : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{claim.id}</h3>
                      {getStatusBadge(claim.status)}
                      {getPriorityBadge(claim.priority)}
                      {!claim.documentsComplete && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Dokumen Tidak Lengkap
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-[#144782]" />
                        <div>
                          <p className="text-xs text-gray-500">Pasien</p>
                          <p className="font-semibold text-gray-900">{claim.patientName}</p>
                          <p className="text-xs text-gray-500">{claim.patientId}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Hospital className="w-5 h-5 text-[#144782]" />
                        <div>
                          <p className="text-xs text-gray-500">Rumah Sakit</p>
                          <p className="font-semibold text-gray-900">{claim.hospital}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#144782]" />
                        <div>
                          <p className="text-xs text-gray-500">Tanggal Rawat</p>
                          <p className="font-semibold text-gray-900">{claim.treatmentDate}</p>
                          <p className="text-xs text-gray-500">Disubmit: {claim.submittedDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diagnosis & INA-CBG */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Diagnosa</p>
                    <p className="font-semibold text-gray-900">{claim.diagnosis}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Kode INA-CBG</p>
                    <p className="font-semibold text-[#03974a]">{claim.inaCbgCode}</p>
                  </div>
                </div>

                {/* Amount Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-700 mb-1">Klaim RS</p>
                    <p className="text-xl font-bold text-blue-900">
                      Rp {claim.claimAmount.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-sm text-green-700 mb-1">Tarif INA-CBG</p>
                    <p className="text-xl font-bold text-green-900">
                      Rp {claim.inaCbgAmount.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-700 mb-1">Selisih</p>
                    <p className="text-xl font-bold">
                      {getAmountDifference(claim.claimAmount, claim.inaCbgAmount)}
                    </p>
                  </div>
                </div>

                {/* Verifier & Rejection Reason */}
                {claim.verifier && (
                  <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Diverifikasi oleh: <span className="font-semibold">{claim.verifier}</span>
                    </p>
                    {claim.rejectionReason && (
                      <p className="text-sm text-red-600 mt-1">
                        <strong>Alasan Penolakan:</strong> {claim.rejectionReason}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <div className="flex justify-end">
                  <Link
                    href={`/bpjs/verifikasi/${claim.id}`}
                    className="px-6 py-3 bg-gradient-to-r from-[#144782] to-[#03974a] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
                  >
                    <Eye className="w-5 h-5" />
                    Review Klaim
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {filteredClaims.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak ada klaim ditemukan</h3>
              <p className="text-gray-600">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
