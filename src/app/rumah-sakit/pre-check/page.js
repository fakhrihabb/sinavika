'use client';
import { useState, useEffect, use } from 'react';
import RumahSakitNavbar from '@/components/RumahSakitNavbar';
import ChatPanel from '@/components/ChatPanel';
import EKlaimForm from '@/components/EKlaimForm';
import {
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  Send,
  ArrowLeft,
  Eye,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Building2,
  Calendar,
  Activity,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function PreCheckKlaimPage() {
  const [expandedSections, setExpandedSections] = useState({
    rujukan: true,
    resume: true,
    penunjang: true,
    formulir: true
  });

  const [aiFilledData, setAiFilledData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [claimData, setClaimData] = useState(null);
  const [documentChecklist, setDocumentChecklist] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    // This page is for creating a new claim, so we start with a blank slate.
    setLoading(true);

    const initialClaimData = {
      id: "(akan dibuat saat submit)",
      patientName: "",
      patientId: "",
      sepNumber: "",
      hospital: "RS Mitra Keluarga", // Example default, can be fetched from user session
      admissionDate: "",
      dischargeDate: "",
      los: "0 hari",
      diagnosis: "",
      treatmentType: "Rawat Jalan",
      doctor: "",
      amount: "Rp 0"
    };

    const initialChecklist = {
      rujukan: {
        title: "Surat Rujukan",
        items: [
          { id: 'rujukan_valid', name: 'Surat rujukan tersedia dan masih berlaku', status: 'incomplete', file: null },
          { id: 'rujukan_sesuai', name: 'Diagnosa rujukan sesuai dengan klaim', status: 'incomplete', file: null },
          { id: 'rujukan_tanggal', name: 'Tanggal rujukan valid (tidak kadaluarsa)', status: 'incomplete', file: null }
        ]
      },
      resume: {
        title: "Resume Medis",
        items: [
          { id: 'resume_lengkap', name: 'Resume medis lengkap dan terbaca', status: 'incomplete', file: null },
          { id: 'resume_ttd', name: 'Tanda tangan dokter dan stempel RS', status: 'incomplete', file: null },
          { id: 'resume_icd', name: 'Kode ICD-10 tercantum dan sesuai', status: 'incomplete', file: null }
        ]
      },
      penunjang: {
        title: "Hasil Penunjang",
        items: [
          { id: 'lab_required', name: 'Hasil laboratorium (wajib untuk diagnosis ini)', status: 'incomplete', file: null },
          { id: 'radiologi', name: 'Hasil radiologi (jika diperlukan)', status: 'na', file: null },
          { id: 'penunjang_tanggal', name: 'Tanggal hasil penunjang sesuai masa rawat', status: 'incomplete', file: null }
        ]
      },
      formulir: {
        title: "Formulir Lain",
        items: [
          { id: 'sep', name: 'SEP (Surat Elegibilitas Peserta)', status: 'incomplete', file: null },
          { id: 'informed_consent', name: 'Informed consent (jika ada tindakan)', status: 'na', file: null },
          { id: 'resep', name: 'Resep obat', status: 'incomplete', file: null }
        ]
      }
    };
    setClaimData(initialClaimData);
    setDocumentChecklist(initialChecklist);
    setLoading(false);
  }, []);

  // Calculate readiness score
  const calculateReadinessScore = () => {
    let totalItems = 0;
    let completeItems = 0;
    let weightedScore = 0;
    let maxWeight = 0;

    Object.values(documentChecklist).forEach(section => {
      section.items.forEach(item => {
        if (item.status !== 'na') {
          totalItems++;
          // Weight: complete = 100, warning = 70, incomplete = 0
          const weight = item.status === 'complete' ? 100 : item.status === 'warning' ? 70 : 0;
          weightedScore += weight;
          maxWeight += 100;

          if (item.status === 'complete') {
            completeItems++;
          }
        }
      });
    });

    return {
      score: Math.round((weightedScore / maxWeight) * 100),
      complete: completeItems,
      total: totalItems,
      readyToSubmit: weightedScore / maxWeight >= 0.85 // 85% threshold
    };
  };

  const readiness = calculateReadinessScore();

  // Get all issues
  const getIssues = () => {
    const issues = [];
    Object.entries(documentChecklist).forEach(([sectionKey, section]) => {
      section.items.forEach(item => {
        if (item.status === 'incomplete') {
          issues.push({
            type: 'error',
            section: section.title,
            item: item.name,
            message: item.issue || 'Dokumen belum tersedia',
            action: 'Upload dokumen yang diperlukan'
          });
        } else if (item.status === 'warning') {
          issues.push({
            type: 'warning',
            section: section.title,
            item: item.name,
            message: item.issue,
            action: 'Periksa dan perbaiki jika perlu'
          });
        }
      });
    });
    return issues;
  };

  const issues = getIssues();

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'incomplete':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'na':
        return <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">N/A</div>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'complete':
        return <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">Lengkap</span>;
      case 'warning':
        return <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full">Perlu Perhatian</span>;
      case 'incomplete':
        return <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full">Tidak Lengkap</span>;
      case 'na':
        return <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs font-semibold rounded-full">Tidak Diperlukan</span>;
      default:
        return null;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-orange-500';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 85) return 'bg-green-600';
    if (score >= 70) return 'bg-orange-500';
    return 'bg-red-600';
  };

  // Handle document uploaded notification
  const handleDocumentUploaded = (documentType, file) => {
    console.log('📄 [DEBUG] Document uploaded:', { documentType, fileName: file.name });

    setDocumentChecklist(prev => {
      const updated = { ...prev };

      const updateItem = (sectionKey, itemId, status, issue = null) => {
        const section = updated[sectionKey];
        if (section) {
          const itemIndex = section.items.findIndex(i => i.id === itemId);
          if (itemIndex > -1) {
            section.items[itemIndex].status = status;
            section.items[itemIndex].file = file;
            section.items[itemIndex].issue = issue;
          }
        }
      };

      if (documentType === 'resume_medis') {
        updateItem('resume', 'resume_lengkap', 'complete');
        updateItem('resume', 'resume_icd', 'complete');
        updateItem('resume', 'resume_ttd', 'warning', 'Perlu verifikasi manual tanda tangan & stempel');
      }
      else if (documentType === 'lab_result') {
        updateItem('penunjang', 'lab_required', 'complete');
        updateItem('penunjang', 'penunjang_tanggal', 'complete');
      }
      else if (documentType === 'radiology') {
        updateItem('penunjang', 'radiologi', 'complete');
        // Also mark date as complete if a radiology report is uploaded
        updateItem('penunjang', 'penunjang_tanggal', 'complete');
      }
      else if (documentType === 'sep' || documentType === 'surat_eligibilitas_peserta') {
        updateItem('formulir', 'sep', 'complete');
      }
      else if (documentType === 'surat_rujukan') {
        // A single referral letter completes the entire section
        if (updated.rujukan) {
            updated.rujukan.items = updated.rujukan.items.map(item => ({
                ...item,
                status: 'complete',
                file: file,
            }));
        }
      }
      else if (documentType === 'resep_obat') {
        updateItem('formulir', 'resep', 'complete');
      }

      return updated;
    });
  };

  // Handle AI suggestion (auto-fill form)
  const handleSuggestionApply = (action, data) => {
    console.log('🎬 [DEBUG] handleSuggestionApply called:', { action, hasData: !!data });
    if (action === 'autofill-form' && data) {
      console.log('🚀 [DEBUG] Setting aiFilledData in page.js:', JSON.stringify(data, null, 2));
      setAiFilledData(data);
    }
  };

  // Handle form data change
  const handleFormChange = (newFormData) => {
    setFormData(newFormData);
  };

  // Handle submit to BPJS
  const handleSubmitToBPJS = async () => {
    if (!formData || !claimData) {
      alert('Data form belum lengkap');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const tarifRSNumber = parseFloat(String(formData.totalTarifRS).replace(/[^0-9]/g, '')) || 0;
      const tarifInaCbgNumber = parseFloat(String(formData.tarifInaCbg).replace(/[^0-9]/g, '')) || 0;

      // Validate GROUPER data
      if (!formData.inaCbgCode || formData.inaCbgCode === 'N/A' || tarifInaCbgNumber === 0) {
        alert('⚠️ Harap jalankan GROUPER terlebih dahulu!\n\nPastikan Anda telah mengisi:\n- ICD-10 Primary\n- Kelas Rawat\n\nGROUPER akan otomatis berjalan setelah field tersebut diisi.');
        setSubmitting(false);
        return;
      }

      // Transform formData to API format
      const submitData = {
        // Basic info
        hospitalName: claimData.hospital || 'RS Cipto Mangunkusumo',
        hospitalCode: 'RS003',

        // Patient data
        patientName: formData.patientName,
        patientBpjsNumber: formData.patientId,
        sepNumber: formData.sepNumber,
        rmNumber: formData.nomorRM,
        patientDob: null, // TODO: Add to form if needed
        patientGender: null, // TODO: Add to form if needed

        // Treatment data
        treatmentType: formData.treatmentType,
        admissionDate: formData.admissionDate,
        dischargeDate: formData.dischargeDate,
        careClass: formData.kelasRawat,
        dpjp: formData.dpjp,
        los_days: formData.los,

        // Diagnoses
        diagnoses: [],

        // Procedures
        procedures: formData.procedures || [],

        // GROUPER result & Tariffs
        inaCbgCode: formData.inaCbgCode,
        inaCbgDescription: formData.inaCbgDescription,
        tarifInaCbg: tarifInaCbgNumber,
        tarifRS: tarifRSNumber,


        // Documents from checklist
        documents: [],

        // AI flags - check if there are any warnings
        aiRiskScore: 0,
        aiFlags: []
      };

      // Add diagnoses
      if (formData.diagnosisPrimary && formData.icd10Primary) {
        submitData.diagnoses.push({
          type: 'primary',
          name: formData.diagnosisPrimary,
          icd10: formData.icd10Primary
        });
      }
      if (formData.diagnosisSecondary && formData.icd10Secondary) {
        submitData.diagnoses.push({
          type: 'secondary',
          name: formData.diagnosisSecondary,
          icd10: formData.icd10Secondary
        });
      }
      if (formData.diagnosisTertiary && formData.icd10Tertiary) {
        submitData.diagnoses.push({
          type: 'tertiary',
          name: formData.diagnosisTertiary,
          icd10: formData.icd10Tertiary
        });
      }

      // Collect documents from checklist
      Object.values(documentChecklist).forEach(section => {
        section.items.forEach(item => {
          if (item.status === 'complete' && item.file) {
            submitData.documents.push({
              type: item.name,
              fileName: item.file.name || item.name,
              fileSize: item.file.size || null,
              verified: true
            });
          }
        });
      });

      // Submit to API
      const response = await fetch('/api/bpjs/claims/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Gagal mengirim klaim');
      }

      // Success!
      alert('✓ Klaim berhasil dikirim ke BPJS!\n\nKlaim ID: ' + result.data.claimId);

      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        window.location.href = '/rumah-sakit';
      }, 1500);

    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError(error.message);
      alert('✗ Gagal mengirim klaim:\n' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[#144782]"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-700">Memuat data klaim...</h2>
          <p className="text-gray-500">Silakan tunggu sebentar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RumahSakitNavbar />

      <div className="max-w-[1920px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/rumah-sakit"
            className="inline-flex items-center gap-2 text-[#144782] hover:text-[#03974a] mb-4 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Dashboard
          </Link>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#144782] to-[#03974a] rounded-2xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Pre-Check Klaim</h1>
                    <p className="text-gray-600 mt-1">Validasi kelengkapan dokumen sebelum kirim ke BPJS</p>
                  </div>
                </div>

                {/* Claim Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-[#144782]" />
                    <div>
                      <p className="text-xs text-gray-500">Pasien</p>
                      <p className="font-semibold text-gray-900">{claimData.patientName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#144782]" />
                    <div>
                      <p className="text-xs text-gray-500">Tanggal Rawat</p>
                      <p className="font-semibold text-gray-900">{claimData.admissionDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-[#144782]" />
                    <div>
                      <p className="text-xs text-gray-500">Diagnosa</p>
                      <p className="font-semibold text-gray-900">{claimData.diagnosis}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#144782]" />
                    <div>
                      <p className="text-xs text-gray-500">ID Klaim</p>
                      <p className="font-semibold text-gray-900 font-mono">(akan dibuat saat submit)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Readiness Score */}
              <div className="ml-8">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200 text-center min-w-[200px]">
                  <p className="text-sm text-gray-600 font-semibold mb-2">Skor Kelengkapan</p>
                  <div className={`text-5xl font-bold mb-2 ${getScoreColor(readiness.score)}`}>
                    {readiness.score}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <div
                      className={`h-3 rounded-full transition-all ${getScoreBgColor(readiness.score)}`}
                      style={{ width: `${readiness.score}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600">
                    {readiness.complete} dari {readiness.total} item lengkap
                  </p>
                  {readiness.readyToSubmit ? (
                    <div className="mt-4 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">
                      ✓ Siap Kirim ke BPJS
                    </div>
                  ) : (
                    <div className="mt-4 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg text-sm font-semibold">
                      ! Perlu Dilengkapi
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Issues Alert */}
            {issues.length > 0 && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-bold text-orange-900 mb-2">
                      {issues.length} Masalah Ditemukan
                    </h3>
                    <ul className="space-y-1">
                      {issues.slice(0, 3).map((issue, idx) => (
                        <li key={idx} className="text-sm text-orange-800">
                          • <strong>{issue.section}:</strong> {issue.message}
                        </li>
                      ))}
                      {issues.length > 3 && (
                        <li className="text-sm text-orange-700 font-semibold">
                          + {issues.length - 3} masalah lainnya
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: E-Klaim Form (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl border-2 border-[#03974a] p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-[#03974a]" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Form E-Klaim</h2>
                  <p className="text-sm text-gray-600">Upload dokumen ke AI Copilot untuk auto-fill form ini</p>
                </div>
              </div>
            </div>

            <EKlaimForm
              claimData={claimData}
              onFormChange={handleFormChange}
              aiFilledData={aiFilledData}
            />

            {/* Document Checklist */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-transparent">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  Checklist Kelengkapan Dokumen
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Pastikan semua dokumen di bawah ini lengkap sebelum kirim ke BPJS
                </p>
              </div>

              <div className="p-8 space-y-4">
                {Object.entries(documentChecklist).map(([key, section]) => (
                  <div key={key} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection(key)}
                      className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#144782]" />
                        <span className="font-bold text-gray-900">{section.title}</span>
                        <span className="text-sm text-gray-500">
                          ({section.items.filter(i => i.status === 'complete').length}/{section.items.filter(i => i.status !== 'na').length})
                        </span>
                      </div>
                      {expandedSections[key] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    {expandedSections[key] && (
                      <div className="p-6 bg-white space-y-3">
                        {section.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(item.status)}
                              <span className="text-sm text-gray-900">{item.name}</span>
                            </div>
                            {getStatusBadge(item.status)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Kirim Klaim ke BPJS</h3>
                  <p className="text-sm text-gray-600">
                    {readiness.readyToSubmit
                      ? 'Klaim Anda siap untuk dikirim ke BPJS'
                      : `Lengkapi ${readiness.total - readiness.complete} item lagi untuk mengirim`}
                  </p>
                </div>
                <button
                  onClick={handleSubmitToBPJS}
                  disabled={!readiness.readyToSubmit || submitting}
                  className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${ 
                    readiness.readyToSubmit && !submitting
                      ? 'bg-gradient-to-r from-[#03974a] to-[#144782] text-white hover:shadow-xl hover:scale-105'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {submitting ? (
                      <>
                        <Clock className="w-6 h-6 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6" />
                        Kirim ke BPJS
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: AI Copilot Chat (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ChatPanel
                claimData={claimData}
                onSuggestionApply={handleSuggestionApply}
                onDocumentUploaded={handleDocumentUploaded}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}