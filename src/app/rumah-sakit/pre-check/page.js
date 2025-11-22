'use client';
import { useState, useEffect } from 'react';
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
  const [documentChecklist, setDocumentChecklist] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Empty claim data - user starts fresh
  const claimData = {
    id: null, // Will be generated on submit
    patientName: '',
    patientId: '',
    sepNumber: '',
    hospital: 'RS Cipto Mangunkusumo',
    admissionDate: '',
    dischargeDate: '',
    los: '0 hari',
    diagnosis: '',
    treatmentType: 'Rawat Jalan',
    doctor: '',
    amount: ''
  };

  useEffect(() => {
    // Initialize empty document checklist
    const mockChecklist = {
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
    setDocumentChecklist(mockChecklist);
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChecklistUpdate = (categoryKey, itemId, newStatus, file = null) => {
    setDocumentChecklist(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        items: prev[categoryKey].items.map(item =>
          item.id === itemId
            ? { ...item, status: newStatus, file: file }
            : item
        )
      }
    }));
  };

  const handleDocumentUploaded = (documentType, fileName) => {
    console.log('📤 Document uploaded from AI Chatbot:', { documentType, fileName });

    // Map document type to checklist item
    const documentMapping = {
      'resume_medis': { category: 'resume', itemId: 'resume_lengkap' },
      'lab': { category: 'penunjang', itemId: 'lab_required' },
      'hasil_lab': { category: 'penunjang', itemId: 'lab_required' },
      'radiologi': { category: 'penunjang', itemId: 'radiologi' },
      'hasil_radiologi': { category: 'penunjang', itemId: 'radiologi' },
      'sep': { category: 'formulir', itemId: 'sep' },
      'surat_rujukan': { category: 'rujukan', itemId: 'rujukan_valid' },
      'rujukan': { category: 'rujukan', itemId: 'rujukan_valid' },
      'resep': { category: 'formulir', itemId: 'resep' },
      'resep_obat': { category: 'formulir', itemId: 'resep' }
    };

    // Auto-map from document type
    if (documentType && documentMapping[documentType]) {
      const mapping = documentMapping[documentType];
      const fileObj = { name: fileName || 'document.pdf' };

      console.log('✅ Auto-checking:', mapping.category, mapping.itemId, fileName);
      handleChecklistUpdate(mapping.category, mapping.itemId, 'complete', fileObj);
    } else {
      console.warn('⚠️ Unknown document type:', documentType);
    }
  };

  const handleSuggestionApply = (action, data) => {
    if (action === 'autofill-form' && data) {
      setAiFilledData(data);
    }
  };

  const handleFormChange = (newFormData) => {
    setFormData(newFormData);
  };

  // Generate unique claim ID
  const generateClaimId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    return `CLM-${year}${month}${day}-${hours}${minutes}${seconds}${random}`;
  };

  // Handle submit to BPJS
  const handleSubmitToBPJS = async () => {
    if (!formData) {
      alert('Silakan lengkapi form E-Klaim terlebih dahulu');
      return;
    }

    // Validate required fields
    if (!formData.patientName || !formData.patientId || !formData.sepNumber) {
      alert('Data wajib belum lengkap:\n- Nama Pasien\n- No. BPJS\n- No. SEP');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      // Generate new claim ID
      const newClaimId = generateClaimId();

      // Transform formData to API format
      const submitData = {
        // Basic info
        claimId: newClaimId,
        hospitalName: 'RS Cipto Mangunkusumo',
        hospitalCode: 'RS003',

        // Patient data
        patientName: formData.patientName,
        patientBpjsNumber: formData.patientId,
        sepNumber: formData.sepNumber,
        rmNumber: formData.nomorRM || null,
        patientDob: null,
        patientGender: null,

        // Treatment data
        treatmentType: formData.treatmentType || 'Rawat Jalan',
        admissionDate: formData.admissionDate || null,
        dischargeDate: formData.dischargeDate || null,
        careClass: formData.kelasRawat || '3',
        dpjp: formData.dpjp || null,

        // Diagnoses
        diagnoses: [],

        // Procedures
        procedures: formData.procedures || [],

        // GROUPER result
        inaCbgCode: formData.inaCbgCode || null,
        inaCbgDescription: formData.inaCbgDescription || null,
        tarifInaCbg: formData.tarifInaCbg || null,

        // Calculate total RS tariff
        tarifRS: Object.values(formData.tarifRS || {}).reduce((sum, val) => {
          const num = parseFloat(val) || 0;
          return sum + num;
        }, 0),

        // Documents from checklist
        documents: [],

        // AI flags
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
      Object.entries(documentChecklist).forEach(([category, section]) => {
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
      alert(`✓ Klaim berhasil dikirim ke BPJS!

Klaim ID: ${newClaimId}
Status: Menunggu Verifikasi

Klaim Anda akan direview oleh tim BPJS.`);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/rumah-sakit';
      }, 2000);

    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError(error.message);
      alert('✗ Gagal mengirim klaim:\n' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate readiness
  const readiness = {
    complete: 0,
    total: 0,
    readyToSubmit: false
  };

  Object.values(documentChecklist).forEach(section => {
    section.items.forEach(item => {
      if (item.status !== 'na') {
        readiness.total++;
        if (item.status === 'complete') {
          readiness.complete++;
        }
      }
    });
  });

  // Check if form has minimum required data
  const hasMinimumFormData = formData?.patientName && formData?.patientId && formData?.sepNumber;
  readiness.readyToSubmit = hasMinimumFormData && readiness.complete >= (readiness.total * 0.7); // 70% checklist

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
                    <h1 className="text-3xl font-bold text-gray-900">Pre-Check Klaim Baru</h1>
                    <p className="text-gray-600 mt-1">Validasi kelengkapan dokumen dan isi form E-Klaim sebelum mengirim ke BPJS</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Kelengkapan Dokumen</p>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#03974a] to-[#144782] transition-all duration-500"
                        style={{ width: `${readiness.total > 0 ? (readiness.complete / readiness.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {readiness.total > 0 ? Math.round((readiness.complete / readiness.total) * 100) : 0}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {readiness.complete} dari {readiness.total} item lengkap
                  </p>
                  {readiness.readyToSubmit ? (
                    <div className="mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-semibold">
                      ✓ Siap Kirim ke BPJS
                    </div>
                  ) : (
                    <div className="mt-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-lg text-xs font-semibold">
                      ! Perlu Dilengkapi
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form & Checklist (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* E-Klaim Form - MOVED TO TOP */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#144782] rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Form E-Klaim</h2>
                  <p className="text-sm text-gray-600">Lengkapi data klaim untuk dikirim ke BPJS</p>
                </div>
              </div>
              <EKlaimForm
                claimData={claimData}
                onFormChange={handleFormChange}
                aiFilledData={aiFilledData}
              />
            </div>

            {/* Document Checklist Sections - MOVED TO BOTTOM */}
            {Object.entries(documentChecklist).map(([categoryKey, category]) => (
              <div key={categoryKey} className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                <button
                  onClick={() => toggleSection(categoryKey)}
                  className="w-full px-8 py-6 border-b border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#144782] rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    {category.title}
                  </h2>
                  {expandedSections[categoryKey] ? (
                    <ChevronUp className="w-6 h-6 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-600" />
                  )}
                </button>

                {expandedSections[categoryKey] && (
                  <div className="p-8">
                    <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#144782]" />
                      Upload dokumen melalui <strong>AI Chatbot</strong> di sebelah kanan. Status akan otomatis tercentang.
                    </p>
                    <div className="space-y-3">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            item.status === 'complete'
                              ? 'bg-green-50 border-green-300'
                              : item.status === 'na'
                              ? 'bg-gray-50 border-gray-200'
                              : 'bg-orange-50 border-orange-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              {item.status === 'complete' ? (
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              ) : item.status === 'na' ? (
                                <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                              ) : (
                                <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{item.name}</p>
                                {item.file && (
                                  <p className="text-sm text-green-600 mt-1 font-medium flex items-center gap-1">
                                    <FileText className="w-4 h-4" />
                                    {item.file.name}
                                  </p>
                                )}
                                {!item.file && item.status !== 'na' && item.status !== 'complete' && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Belum ada dokumen
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.status === 'complete' && (
                                <span className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-semibold">
                                  ✓ Sudah Ada
                                </span>
                              )}
                              {item.status === 'incomplete' && (
                                <span className="px-3 py-1 bg-orange-600 text-white rounded-lg text-xs font-semibold">
                                  ! Belum Ada
                                </span>
                              )}
                              {item.status === 'na' && (
                                <span className="px-3 py-1 bg-gray-400 text-white rounded-lg text-xs font-semibold">
                                  N/A
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Submit Button */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Kirim Klaim ke BPJS</h3>
                  <p className="text-sm text-gray-600">
                    {readiness.readyToSubmit
                      ? 'Klaim Anda siap untuk dikirim ke BPJS'
                      : !hasMinimumFormData
                      ? 'Lengkapi data pasien, No. BPJS, dan No. SEP terlebih dahulu'
                      : `Lengkapi ${readiness.total - readiness.complete} item dokumen lagi`}
                  </p>
                  {submitError && (
                    <p className="text-sm text-red-600 mt-2">⚠️ {submitError}</p>
                  )}
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
