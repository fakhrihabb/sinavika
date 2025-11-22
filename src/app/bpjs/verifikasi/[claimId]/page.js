'use client';
import { useState, useEffect, use } from 'react';
import BpjsNavbar from '@/components/BpjsNavbar';
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Hospital,
  Calendar,
  Activity,
  Eye,
  Download,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Calculator,
  MessageSquare,
  Loader2,
  ShieldAlert
} from 'lucide-react';
import Link from 'next/link';

export default function DetailVerifikasiKlaimPage({ params }) {
  const unwrappedParams = use(params);
  const claimId = unwrappedParams.claimId;

  const [loading, setLoading] = useState(true);
  const [claimData, setClaimData] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [isAnalyzingFraud, setIsAnalyzingFraud] = useState(true);
  const [fraudAnalysis, setFraudAnalysis] = useState(null);

  const [expandedSections, setExpandedSections] = useState({
    dataPasien: true,
    formEKlaim: true,
    dokumen: true,
    grouper: true,
    verifikasi: true,
    fraud: true,
  });

  const [verificationData, setVerificationData] = useState({
    status: null, // 'approve' or 'reject'
    notes: '',
    checklist: {
      identitasPasien: false,
      diagnosisSesuai: false,
      icd10Valid: false,
      prosedurSesuai: false,
      dokumentLengkap: false,
      tarifWajar: false
    }
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch claim data from API
  useEffect(() => {
    const fetchClaimData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/bpjs/claims/${claimId}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Gagal mengambil data klaim');
        }

        setClaimData(transformClaimData(result.data));
      } catch (err) {
        console.error('Fetch claim error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClaimData();
  }, [claimId]);

  // --- New: Fetch Fraud Analysis Data ---
  useEffect(() => {
    if (!claimId) return;

    const fetchFraudAnalysis = async () => {
      setIsAnalyzingFraud(true);
      try {
        const response = await fetch(`/api/bpjs/claims/${claimId}/analyze-fraud`);
        const result = await response.json();
        if (result.success) {
          setFraudAnalysis(result.data);
        } else {
          console.error("Gagal melakukan analisis fraud:", result.error);
          setFraudAnalysis(null); // Set to null on failure
        }
      } catch (err) {
        console.error("Error fetching fraud analysis:", err);
        setFraudAnalysis(null);
      } finally {
        setIsAnalyzingFraud(false);
      }
    };

    fetchFraudAnalysis();
  }, [claimId]);


  // Transform Supabase data to component format
  const transformClaimData = (data) => {
    // Calculate age from DOB
    const calculateAge = (dob) => {
      if (!dob) return null;
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    // Calculate LOS
    const calculateLOS = (admissionDate, dischargeDate) => {
      if (!admissionDate || !dischargeDate) return null;
      const admission = new Date(admissionDate);
      const discharge = new Date(dischargeDate);
      const diffTime = Math.abs(discharge - admission);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };

    // Extract diagnoses by type
    const getPrimaryDiagnosis = () => {
      const primary = data.diagnoses?.find(d => d.diagnosis_type === 'primary');
      return primary ? { name: primary.diagnosis_name, icd10: primary.icd10_code } : null;
    };

    const getSecondaryDiagnosis = () => {
      const secondary = data.diagnoses?.find(d => d.diagnosis_type === 'secondary');
      return secondary ? { name: secondary.diagnosis_name, icd10: secondary.icd10_code } : null;
    };

    const getTertiaryDiagnosis = () => {
      const tertiary = data.diagnoses?.find(d => d.diagnosis_type === 'tertiary');
      return tertiary ? { name: tertiary.diagnosis_name, icd10: tertiary.icd10_code } : null;
    };

    const los = calculateLOS(data.admission_date, data.discharge_date);

    return {
      id: data.id,
      status: data.status,
      submittedDate: new Date(data.submitted_at).toLocaleString('id-ID'),
      patient: {
        name: data.patient_name,
        bpjsNumber: data.patient_bpjs_number,
        sepNumber: data.sep_number,
        rmNumber: data.rm_number,
        dateOfBirth: data.patient_dob ? new Date(data.patient_dob).toLocaleDateString('id-ID') : '-',
        gender: data.patient_gender || '-',
        age: calculateAge(data.patient_dob)
      },
      hospital: {
        name: data.hospital,
        code: data.hospital_code || '-',
        address: data.hospital_address || '-'
      },
      treatment: {
        type: data.care_type || '-',
        admissionDate: data.admission_date ? new Date(data.admission_date).toLocaleDateString('id-ID') : '-',
        dischargeDate: data.discharge_date ? new Date(data.discharge_date).toLocaleDateString('id-ID') : '-',
        los: los ? `${los} hari` : '-',
        kelasRawat: data.care_class || '-',
        dpjp: data.dpjp || '-',
        caraMasuk: data.cara_masuk || '-'
      },
      diagnosis: {
        primary: getPrimaryDiagnosis(),
        secondary: getSecondaryDiagnosis(),
        tertiary: getTertiaryDiagnosis()
      },
      procedures: (data.procedures || []).map(p => ({
        name: p.procedure_name,
        icd9cm: p.icd9cm_code,
        quantity: p.quantity
      })),
      grouper: {
        inaCbgCode: data.ina_cbg_code || '-',
        description: data.ina_cbg_description || '-',
        tarifInaCbg: data.tarif_ina_cbg || 0,
        tarifRS: data.tarif_rs || 0,
        selisih: data.tarif_difference || 0,
        persentase: data.tarif_difference_percentage || 0
      },
      documents: (data.documents || []).map(d => ({
        type: d.document_type,
        name: d.file_name,
        size: d.file_size ? `${Math.round(d.file_size / 1024)} KB` : '-',
        uploaded: new Date(d.uploaded_at).toLocaleString('id-ID'),
        verified: d.verified,
        url: d.file_url
      }))
    };
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChecklistChange = (key) => {
    setVerificationData(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [key]: !prev.checklist[key]
      }
    }));
  };

  const handleSubmitVerification = async () => {
    try {
      setSubmitting(true);
      const response = await fetch(`/api/bpjs/claims/${claimId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision: verificationData.status,
          notes: verificationData.notes,
          checklist: verificationData.checklist,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Gagal menyimpan verifikasi');
      }

      setShowConfirmModal(false);
      alert(`✓ Klaim berhasil ${verificationData.status === 'approve' ? 'DISETUJUI' : 'DITOLAK'}!`);

      // Redirect back to list after 1 second
      setTimeout(() => {
        window.location.href = '/bpjs/verifikasi';
      }, 1000);
    } catch (err) {
      console.error('Submit verification error:', err);
      alert(`✗ Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const allChecklistComplete = Object.values(verificationData.checklist).every(v => v === true);

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
  if (error || !claimData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BpjsNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center max-w-md">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gagal Memuat Data</h2>
            <p className="text-gray-600 mb-6">{error || 'Klaim tidak ditemukan'}</p>
            <Link
              href="/bpjs/verifikasi"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#144782] text-white rounded-xl hover:bg-[#03974a] transition-colors font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali ke Daftar Klaim
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score > 70) return 'text-red-500';
    if (score > 40) return 'text-orange-500';
    return 'text-yellow-500';
  };
  
  const getScoreBgColor = (score) => {
    if (score > 70) return 'bg-red-500';
    if (score > 40) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'HIGH':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">LOW</span>;
      default:
        return null;
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <BpjsNavbar />

      <div className="max-w-[1920px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/bpjs/verifikasi"
            className="inline-flex items-center gap-2 text-[#144782] hover:text-[#03974a] mb-4 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Daftar Klaim
          </Link>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#144782] to-[#03974a] rounded-2xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Detail Verifikasi Klaim</h1>
                    <p className="text-gray-600 mt-1">ID: {claimData.id}</p>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-[#144782]" />
                    <div>
                      <p className="text-xs text-gray-500">Pasien</p>
                      <p className="font-semibold text-gray-900">{claimData.patient.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Hospital className="w-5 h-5 text-[#144782]" />
                    <div>
                      <p className="text-xs text-gray-500">Rumah Sakit</p>
                      <p className="font-semibold text-gray-900">{claimData.hospital.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#144782]" />
                    <div>
                      <p className="text-xs text-gray-500">Tanggal Rawat</p>
                      <p className="font-semibold text-gray-900">{claimData.treatment.admissionDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-[#144782]" />
                    <div>
                      <p className="text-xs text-gray-500">Disubmit</p>
                      <p className="font-semibold text-gray-900">{claimData.submittedDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="ml-8">
                {claimData.status === 'pending' && (
                  <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                    Menunggu Verifikasi
                  </span>
                )}
                {claimData.status === 'approved' && (
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    ✓ Disetujui
                  </span>
                )}
                {claimData.status === 'rejected' && (
                  <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                    ✗ Ditolak
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- FRAUD ANALYSIS PANEL --- */}
        {isAnalyzingFraud ? (
          <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-3" />
            <p className="text-blue-800 font-medium">Menganalisis potensi fraud...</p>
          </div>
        ) : fraudAnalysis && fraudAnalysis.confidenceScore > 10 && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl shadow-lg">
            <button
                onClick={() => toggleSection('fraud')}
                className="w-full px-8 py-6 bg-red-100 hover:bg-red-200/50 transition-colors flex items-center justify-between"
              >
              <h2 className="text-xl font-bold text-red-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-white" />
                </div>
                Analisis Potensi Fraud Terdeteksi
              </h2>
              {expandedSections.fraud ? (
                  <ChevronUp className="w-6 h-6 text-red-700" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-red-700" />
                )}
            </button>
            
            {expandedSections.fraud && (
            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Score Gauge */}
                <div className="flex-shrink-0 text-center">
                  <p className="text-sm text-gray-600 font-semibold mb-2">Combined Score</p>
                  <div className={`text-6xl font-bold mb-2 ${getScoreColor(fraudAnalysis.confidenceScore)}`}>
                    {fraudAnalysis.confidenceScore}%
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-4 mx-auto">
                    <div
                      className={`h-4 rounded-full transition-all ${getScoreBgColor(fraudAnalysis.confidenceScore)}`}
                      style={{ width: `${fraudAnalysis.confidenceScore}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{fraudAnalysis.summary}</p>

                  {/* Breakdown Scores */}
                  <div className="mt-4 space-y-2 text-left bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">📄 Dokumen:</span>
                      <span className="font-bold">{fraudAnalysis.documentConfidence || 0}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">🤖 ML Tarif:</span>
                      <span className="font-bold">{fraudAnalysis.mlConfidence || 0}%</span>
                    </div>
                    {fraudAnalysis.mlRiskLevel && (
                      <div className="flex justify-between text-xs pt-2 border-t border-gray-200">
                        <span className="text-gray-600">Risk Level:</span>
                        <span className={`font-bold uppercase ${
                          fraudAnalysis.mlRiskLevel === 'critical' ? 'text-red-600' :
                          fraudAnalysis.mlRiskLevel === 'high' ? 'text-orange-600' :
                          fraudAnalysis.mlRiskLevel === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>{fraudAnalysis.mlRiskLevel}</span>
                      </div>
                    )}
                  </div>

                  {/* ML Recommendation */}
                  {fraudAnalysis.mlRecommendation && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-left">
                      <p className="text-xs font-semibold text-blue-900 mb-1">Rekomendasi AI:</p>
                      <p className="text-xs text-blue-800">{fraudAnalysis.mlRecommendation.message}</p>
                      <p className="text-xs text-blue-600 mt-1 font-medium">
                        Aksi: {fraudAnalysis.mlRecommendation.action}
                      </p>
                    </div>
                  )}
                </div>

                {/* Issues List */}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">Detail Anomali yang Ditemukan:</h3>

                  {/* Document Issues */}
                  {fraudAnalysis.documentIssues && fraudAnalysis.documentIssues.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">📄 Masalah Dokumen ({fraudAnalysis.documentIssues.length}):</p>
                      <div className="space-y-2">
                        {fraudAnalysis.documentIssues.map((issue, index) => (
                          <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-gray-800 text-sm">{issue.code}</p>
                              {getSeverityBadge(issue.severity)}
                            </div>
                            <p className="text-xs text-gray-700">{issue.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ML Issues */}
                  {fraudAnalysis.mlRiskFactors && fraudAnalysis.mlRiskFactors.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">🤖 Indikator ML Tarif/Provider ({fraudAnalysis.mlRiskFactors.length}):</p>
                      <div className="space-y-2">
                        {fraudAnalysis.mlRiskFactors.map((rf, index) => (
                          <div key={index} className="p-3 bg-white rounded-lg border border-blue-200 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-blue-800 text-sm">{rf.factor}</p>
                              {getSeverityBadge(rf.severity)}
                            </div>
                            <p className="text-xs text-gray-700">{rf.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No issues found */}
                  {(!fraudAnalysis.documentIssues || fraudAnalysis.documentIssues.length === 0) &&
                   (!fraudAnalysis.mlRiskFactors || fraudAnalysis.mlRiskFactors.length === 0) && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                      <p className="text-sm text-green-800">✅ Tidak ada anomali terdeteksi</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Section 1: Data Pasien & RS */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <button
                onClick={() => toggleSection('dataPasien')}
                className="w-full px-8 py-6 border-b border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#144782] rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  Data Pasien & Rumah Sakit
                </h2>
                {expandedSections.dataPasien ? (
                  <ChevronUp className="w-6 h-6 text-gray-600" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-600" />
                )}
              </button>

              {expandedSections.dataPasien && (
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 text-lg">Data Pasien</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nama Lengkap:</span>
                          <span className="font-semibold">{claimData.patient.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">No. BPJS:</span>
                          <span className="font-semibold">{claimData.patient.bpjsNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">No. SEP:</span>
                          <span className="font-semibold">{claimData.patient.sepNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">No. RM:</span>
                          <span className="font-semibold">{claimData.patient.rmNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tanggal Lahir:</span>
                          <span className="font-semibold">{claimData.patient.dateOfBirth} ({claimData.patient.age} tahun)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Jenis Kelamin:</span>
                          <span className="font-semibold">{claimData.patient.gender}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 text-lg">Data Rumah Sakit</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nama RS:</span>
                          <span className="font-semibold">{claimData.hospital.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Kode RS:</span>
                          <span className="font-semibold">{claimData.hospital.code}</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-gray-900 mb-3 text-lg mt-6">Data Rawat</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Jenis Rawat:</span>
                          <span className="font-semibold">{claimData.treatment.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tanggal Masuk:</span>
                          <span className="font-semibold">{claimData.treatment.admissionDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tanggal Keluar:</span>
                          <span className="font-semibold">{claimData.treatment.dischargeDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lama Rawat:</span>
                          <span className="font-semibold">{claimData.treatment.los}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Kelas Rawat:</span>
                          <span className="font-semibold">Kelas {claimData.treatment.kelasRawat}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">DPJP:</span>
                          <span className="font-semibold">{claimData.treatment.dpjp}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Form E-Klaim (Diagnosa & Prosedur) */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <button
                onClick={() => toggleSection('formEKlaim')}
                className="w-full px-8 py-6 border-b border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#144782] rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  Data Klaim E-Klaim
                </h2>
                {expandedSections.formEKlaim ? (
                  <ChevronUp className="w-6 h-6 text-gray-600" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-600" />
                )}
              </button>

              {expandedSections.formEKlaim && (
                <div className="p-8">
                  {/* Diagnosa */}
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Diagnosa (ICD-10)</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-orange-700 font-semibold">Diagnosa Utama</span>
                            <p className="font-bold text-gray-900">{claimData.diagnosis.primary.name}</p>
                          </div>
                          <span className="px-3 py-1 bg-orange-200 text-orange-900 rounded-lg font-mono font-bold">
                            {claimData.diagnosis.primary.icd10}
                          </span>
                        </div>
                      </div>

                      {claimData.diagnosis.secondary && (
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs text-blue-700 font-semibold">Diagnosa Sekunder</span>
                              <p className="font-bold text-gray-900">{claimData.diagnosis.secondary.name}</p>
                            </div>
                            <span className="px-3 py-1 bg-blue-200 text-blue-900 rounded-lg font-mono font-bold">
                              {claimData.diagnosis.secondary.icd10}
                            </span>
                          </div>
                        </div>
                      )}

                      {claimData.diagnosis.tertiary && (
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs text-blue-700 font-semibold">Diagnosa Penyerta</span>
                              <p className="font-bold text-gray-900">{claimData.diagnosis.tertiary.name}</p>
                            </div>
                            <span className="px-3 py-1 bg-blue-200 text-blue-900 rounded-lg font-mono font-bold">
                              {claimData.diagnosis.tertiary.icd10}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Prosedur */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Prosedur/Tindakan (ICD-9-CM)</h3>
                    <div className="space-y-2">
                      {claimData.procedures.map((proc, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                          <p className="font-semibold text-gray-900">{proc.name}</p>
                          <span className="px-3 py-1 bg-gray-200 text-gray-900 rounded-lg font-mono font-bold">
                            {proc.icd9cm}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Uploaded Documents */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <button
                onClick={() => toggleSection('dokumen')}
                className="w-full px-8 py-6 border-b border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#144782] rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  Dokumen Lampiran ({claimData.documents.length})
                </h2>
                {expandedSections.dokumen ? (
                  <ChevronUp className="w-6 h-6 text-gray-600" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-600" />
                )}
              </button>

              {expandedSections.dokumen && (
                <div className="p-8">
                  <div className="space-y-3">
                    {claimData.documents.map((doc, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{doc.name}</p>
                            <p className="text-sm text-gray-600">{doc.type} • {doc.size}</p>
                            <p className="text-xs text-gray-500">Diupload: {doc.uploaded}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.verified && (
                            <CheckCircle className="w-5 h-5 text-green-600" title="Terverifikasi" />
                          )}
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Lihat Dokumen">
                            <Eye className="w-5 h-5 text-[#144782]" />
                          </a>
                          <a href={doc.url} download className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Unduh Dokumen">
                            <Download className="w-5 h-5 text-[#144782]" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: GROUPER Result */}
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl border-2 border-[#03974a] shadow-lg">
              <button
                onClick={() => toggleSection('grouper')}
                className="w-full px-8 py-6 border-b-2 border-[#03974a] bg-gradient-to-r from-[#144782]/5 to-[#03974a]/5 hover:from-[#144782]/10 hover:to-[#03974a]/10 transition-colors flex items-center justify-between"
              >
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#144782] to-[#03974a] rounded-xl flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  Hasil GROUPER INA-CBG
                </h2>
                {expandedSections.grouper ? (
                  <ChevronUp className="w-6 h-6 text-gray-600" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-600" />
                )}
              </button>

              {expandedSections.grouper && (
                <div className="p-8">
                  <div className="p-6 bg-white rounded-xl border-2 border-[#03974a] mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Kode INA-CBG</p>
                        <p className="text-3xl font-bold text-[#03974a]">{claimData.grouper.inaCbgCode}</p>
                      </div>
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <p className="text-gray-700">{claimData.grouper.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-xl border-2 border-green-300">
                      <p className="text-sm text-green-700 mb-1">Tarif INA-CBG</p>
                      <p className="text-2xl font-bold text-green-900">
                        Rp {claimData.grouper.tarifInaCbg.toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-xl border-2 border-blue-300">
                      <p className="text-sm text-blue-700 mb-1">Klaim Rumah Sakit</p>
                      <p className="text-2xl font-bold text-blue-900">
                        Rp {claimData.grouper.tarifRS.toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className={`p-4 bg-white rounded-xl border-2 ${
                      claimData.grouper.selisih > 0 ? 'border-red-300' : 'border-gray-300'
                    }`}>
                      <p className="text-sm text-gray-700 mb-1">Selisih</p>
                      <p className={`text-2xl font-bold ${
                        claimData.grouper.selisih > 0 ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {claimData.grouper.selisih > 0 ? '+' : ''}Rp {claimData.grouper.selisih.toLocaleString('id-ID')}
                      </p>
                      <p className="text-sm text-gray-600">({claimData.grouper.persentase}%)</p>
                    </div>
                  </div>

                  {claimData.grouper.selisih > 0 && (
                    <div className="mt-4 p-4 bg-orange-100 border-2 border-orange-300 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-orange-900">Perhatian: Klaim melebihi tarif INA-CBG</p>
                          <p className="text-sm text-orange-800 mt-1">
                            Rumah sakit mengklaim Rp {claimData.grouper.selisih.toLocaleString('id-ID')} lebih tinggi dari tarif INA-CBG.
                            Pastikan semua tindakan dan diagnosa sudah sesuai.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Verification Panel (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-2xl border-2 border-[#03974a] shadow-lg">
              <div className="px-6 py-5 bg-gradient-to-r from-[#144782] to-[#03974a] rounded-t-xl">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckSquare className="w-6 h-6" />
                  Verifikasi Klaim
                </h2>
              </div>

              <div className="p-6">
                {/* Checklist */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">Checklist Verifikasi</h3>
                  <div className="space-y-2">
                    {[
                      { key: 'identitasPasien', label: 'Identitas pasien sesuai' },
                      { key: 'diagnosisSesuai', label: 'Diagnosis sesuai keluhan & pemeriksaan' },
                      { key: 'icd10Valid', label: 'Kode ICD-10 valid & tepat' },
                      { key: 'prosedurSesuai', label: 'Prosedur/tindakan sesuai' },
                      { key: 'dokumentLengkap', label: 'Dokumen lengkap & valid' },
                      { key: 'tarifWajar', label: 'Tarif wajar & sesuai' }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={verificationData.checklist[item.key]}
                          onChange={() => handleChecklistChange(item.key)}
                          className="w-5 h-5 text-[#03974a] rounded focus:ring-2 focus:ring-[#03974a]"
                        />
                        <span className="text-sm text-gray-900">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="block font-bold text-gray-900 mb-2">Catatan Verifikasi</label>
                  <textarea
                    value={verificationData.notes}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Tambahkan catatan atau alasan penolakan..."
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144782] resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setVerificationData(prev => ({ ...prev, status: 'approve' }));
                      setShowConfirmModal(true);
                    }}
                    disabled={!allChecklistComplete}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                      allChecklistComplete
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-xl hover:scale-105'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle className="w-6 h-6" />
                    Setujui Klaim
                  </button>

                  <button
                    onClick={() => {
                      setVerificationData(prev => ({ ...prev, status: 'reject' }));
                      setShowConfirmModal(true);
                    }}
                    className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all font-bold text-lg flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-6 h-6" />
                    Tolak Klaim
                  </button>
                </div>

                {!allChecklistComplete && (
                  <p className="text-sm text-orange-600 mt-3 text-center">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    Lengkapi semua checklist untuk menyetujui klaim
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              {verificationData.status === 'approve' ? (
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              ) : (
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Konfirmasi {verificationData.status === 'approve' ? 'Persetujuan' : 'Penolakan'}
              </h2>
              <p className="text-gray-600">
                Anda yakin ingin {verificationData.status === 'approve' ? 'menyetujui' : 'menolak'} klaim ini?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitVerification}
                disabled={submitting}
                className={`flex-1 px-6 py-3 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2 ${
                  verificationData.status === 'approve'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  `Ya, ${verificationData.status === 'approve' ? 'Setujui' : 'Tolak'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
