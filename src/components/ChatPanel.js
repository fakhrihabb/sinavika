'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Copy, Check, ChevronDown, ChevronUp, X, Minimize2, Upload, FileText, Image as ImageIcon, File, Loader2 } from 'lucide-react';

export default function ChatPanel({ claimData, onSuggestionApply, onDocumentUploaded }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Halo! Saya AI Copilot SINAVIKA untuk Rumah Sakit. Saya siap membantu Anda melengkapi dokumen klaim sebelum dikirim ke BPJS.\n\n**Saya bisa:**\n• 📤 Menganalisis resume medis & dokumen lainnya\n• 📸 Scan dokumen langsung dengan kamera (mobile)\n• 🔍 Auto-fill form dengan data yang terekstrak\n• 💡 Menyarankan kode ICD-10 dan INA-CBG\n• ⚠️ Mendeteksi masalah kelengkapan dokumen\n\nUpload dokumen, foto dengan kamera, atau tanya saya apa saja!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Quick suggestions
  const quickSuggestions = [
    "📤 Upload resume medis",
    "📸 Foto dokumen dengan kamera",
    "📤 Upload hasil lab/penunjang",
    "🔍 Cek kode ICD & INA-CBG"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === dropZoneRef.current) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      processFile(file);
    }
  };

  const processFile = async (file) => {
    const fileData = {
      name: file.name,
      size: file.size,
      type: file.type
    };

    // Add user message with file
    const userMessage = {
      role: 'user',
      content: `📎 Upload: ${file.name}`,
      file: fileData,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setUploadedFiles(prev => [...prev, fileData]);
    setIsTyping(true);
    setIsProcessing(true);

    try {
      // Call Gemini API to analyze document
      const formData = new FormData();
      formData.append('file', file);

      // Determine document type from filename
      let documentType = 'auto';
      const lowerName = file.name.toLowerCase();
      if (lowerName.includes('resume') || lowerName.includes('medis')) {
        documentType = 'resume_medis';
      } else if (lowerName.includes('lab') || lowerName.includes('darah')) {
        documentType = 'lab';
      }

      formData.append('documentType', documentType);

      console.log('📤 [DEBUG] Sending file to API:', { fileName: file.name, documentType, fileSize: file.size, fileType: file.type });

      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      console.log('📥 [DEBUG] API Response:', {
        success: result.success,
        hasData: !!result.data,
        error: result.error,
        dataKeys: result.data ? Object.keys(result.data) : []
      });

      if (result.success && result.data) {
        console.log('✅ [DEBUG] Processing successful response...');
        const aiResponse = processDocumentData(result.data, file.name);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: aiResponse.content,
          suggestion: aiResponse.suggestion,
          formData: aiResponse.formData,
          timestamp: new Date()
        }]);

        // Notify parent page about uploaded document type and path
        if (onDocumentUploaded && result.data.documentType) {
          onDocumentUploaded(result.data.documentType, file, result.uploadPath);
        }
      } else {
        // Handle API failure
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `⚠️ **Error: Analisis Dokumen Gagal**\n\nSaya tidak dapat memproses dokumen "${file.name}".\n\nPesan dari server: _${result.error || 'Tidak ada detail kesalahan.'}_\n\n**Saran:**\n- Pastikan file tidak rusak dan dalam format yang didukung (PDF, JPG, PNG).\n- Coba upload lagi.\n- Jika masalah berlanjut, hubungi dukungan teknis.`,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error processing document:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ **Error memproses dokumen**\n\nMaaf, terjadi kesalahan saat menganalisis dokumen "${file.name}". Silakan coba lagi atau pastikan file dalam format yang benar (PDF, JPG, PNG).\n\nError: ${error.message}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const file = files[0];
    await processFile(file);

    // Reset file input
    event.target.value = '';
  };

  const handleCameraCapture = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const file = files[0];
    await processFile(file);

    // Reset camera input
    event.target.value = '';
  };

  // Process extracted data from Gemini API
  const processDocumentData = (data, fileName) => {
    console.log('🔍 [DEBUG] processDocumentData called with:', { fileName, documentType: data.documentType });

    if (data.documentType === 'resume_medis') {
      const diagnosis = data.diagnosis || {};
      const treatment = data.treatment || {};
      const patient = data.patient || {};

      console.log('📋 [DEBUG] Resume Medis - Raw Data:', {
        patient: JSON.stringify(patient, null, 2),
        treatment: JSON.stringify(treatment, null, 2),
        diagnosis: JSON.stringify(diagnosis, null, 2),
        procedures: data.procedures
      });

      let content = `✅ **Resume medis berhasil diproses!**\n\nSaya telah mengekstrak informasi dari "${fileName}":\n\n`;

      if (patient.name) {
        content += `**Pasien:** ${patient.name}`;
        if (patient.gender) content += ` (${patient.gender}`;
        if (patient.age) content += `, ${patient.age} tahun`;
        content += ')\n';
      }

      if (treatment.admissionDate) {
        content += `**Tanggal:** ${treatment.admissionDate}`;
        if (treatment.dischargeDate && treatment.dischargeDate !== treatment.admissionDate) {
          content += ` - ${treatment.dischargeDate}`;
        }
        content += '\n';
      }

      if (treatment.type) {
        content += `**Jenis Rawat:** ${treatment.type}\n`;
      }

      if (treatment.dpjp) {
        content += `**DPJP:** ${treatment.dpjp}\n`;
      }

      content += '\n**DIAGNOSA:**\n';

      if (diagnosis.primary?.name) {
        content += `1️⃣ **Utama:** ${diagnosis.primary.name}\n`;
        if (diagnosis.primary.icd10) {
          content += `   → ICD-10: **${diagnosis.primary.icd10}**\n`;
        }
      }

      if (diagnosis.secondary?.name) {
        content += `\n2️⃣ **Sekunder:** ${diagnosis.secondary.name}\n`;
        if (diagnosis.secondary.icd10) {
          content += `   → ICD-10: **${diagnosis.secondary.icd10}**\n`;
        }
      }

      if (diagnosis.tertiary?.name) {
        content += `\n3️⃣ **Penyerta:** ${diagnosis.tertiary.name}\n`;
        if (diagnosis.tertiary.icd10) {
          content += `   → ICD-10: **${diagnosis.tertiary.icd10}**\n`;
        }
      }

      if (data.procedures && data.procedures.length > 0) {
        content += '\n**TINDAKAN:**\n';
        data.procedures.forEach((proc, idx) => {
          content += `• ${proc.name}`;
          if (proc.icd9cm) content += ` (${proc.icd9cm})`;
          content += '\n';
        });
      }

      if (data.medications && data.medications.length > 0) {
        content += '\n**OBAT:**\n';
        data.medications.forEach(med => {
          content += `• ${med}\n`;
        });
      }

      // Check for missing critical fields
      const missingFields = [];
      if (!patient.name) missingFields.push('Nama Pasien');
      if (!patient.bpjsNumber && !patient.nomorBPJS) missingFields.push('No. BPJS');
      if (!patient.sepNumber) missingFields.push('No. SEP');
      if (!patient.medicalRecordNumber) missingFields.push('No. Rekam Medis');
      if (!treatment.admissionDate) missingFields.push('Tanggal Masuk');
      if (!treatment.dischargeDate) missingFields.push('Tanggal Keluar');
      if (!treatment.dpjp) missingFields.push('DPJP');
      if (!diagnosis.primary?.name) missingFields.push('Diagnosa Utama');
      if (!diagnosis.primary?.icd10) missingFields.push('Kode ICD-10 Utama');

      if (missingFields.length > 0) {
        content += '\n\n⚠️ **Perhatian:** Beberapa field tidak ditemukan di dokumen:\n';
        missingFields.forEach(field => {
          content += `• ${field}\n`;
        });
        content += '\nAnda perlu mengisi field tersebut secara manual.';
      }

      content += '\n\n💡 Data ini siap untuk auto-fill form E-Klaim!\n\nApakah Anda ingin saya isi form otomatis dengan data ini?';

      // Prepare form data for auto-fill
      const formData = {
        // Patient data
        patientName: patient.name || '',
        patientId: patient.bpjsNumber || patient.nomorBPJS || '',
        sepNumber: patient.sepNumber || '',
        nomorRM: patient.medicalRecordNumber || '',

        // Treatment data
        treatmentType: treatment.type || 'Rawat Jalan',
        admissionDate: treatment.admissionDate || '',
        dischargeDate: treatment.dischargeDate || treatment.admissionDate || '',
        kelasRawat: treatment.kelasRawat || '3',
        dpjp: treatment.dpjp || '',

        // Diagnosis
        diagnosisPrimary: diagnosis.primary?.name || '',
        icd10Primary: diagnosis.primary?.icd10 || '',
        diagnosisSecondary: diagnosis.secondary?.name || '',
        icd10Secondary: diagnosis.secondary?.icd10 || '',
        diagnosisTertiary: diagnosis.tertiary?.name || '',
        icd10Tertiary: diagnosis.tertiary?.icd10 || '',

        // Procedures
        procedures: data.procedures || []
      };

      // Debug log - Detail setiap field
      console.log('📊 [DEBUG] AI Extracted Data (Full):', JSON.stringify(data, null, 2));
      console.log('👤 [DEBUG] Patient Fields Mapping:', {
        'patient.name': patient.name,
        '→ patientName': formData.patientName,
        'patient.bpjsNumber': patient.bpjsNumber,
        'patient.nomorBPJS': patient.nomorBPJS,
        '→ patientId': formData.patientId,
        'patient.sepNumber': patient.sepNumber,
        '→ sepNumber': formData.sepNumber,
        'patient.medicalRecordNumber': patient.medicalRecordNumber,
        '→ nomorRM': formData.nomorRM
      });
      console.log('🏥 [DEBUG] Treatment Fields Mapping:', {
        'treatment.type': treatment.type,
        '→ treatmentType': formData.treatmentType,
        'treatment.admissionDate': treatment.admissionDate,
        '→ admissionDate': formData.admissionDate,
        'treatment.dischargeDate': treatment.dischargeDate,
        '→ dischargeDate': formData.dischargeDate,
        'treatment.kelasRawat': treatment.kelasRawat,
        '→ kelasRawat': formData.kelasRawat,
        'treatment.dpjp': treatment.dpjp,
        '→ dpjp': formData.dpjp
      });
      console.log('💊 [DEBUG] Diagnosis Fields Mapping:', {
        'diagnosis.primary': diagnosis.primary,
        '→ diagnosisPrimary': formData.diagnosisPrimary,
        '→ icd10Primary': formData.icd10Primary,
        'diagnosis.secondary': diagnosis.secondary,
        '→ diagnosisSecondary': formData.diagnosisSecondary,
        '→ icd10Secondary': formData.icd10Secondary,
        'diagnosis.tertiary': diagnosis.tertiary,
        '→ diagnosisTertiary': formData.diagnosisTertiary,
        '→ icd10Tertiary': formData.icd10Tertiary
      });
      console.log('🔧 [DEBUG] Procedures:', formData.procedures);
      console.log('📝 [DEBUG] Final Form Data to Fill:', formData);

      return {
        content,
        suggestion: {
          text: '🚀 Auto-fill E-Klaim Form Sekarang',
          action: 'autofill-form'
        },
        formData
      };

    } else if (data.documentType === 'lab_result') {
      const patient = data.patient || {};

      console.log('🧪 [DEBUG] Lab Result - Raw Data:', {
        patient: JSON.stringify(patient, null, 2),
        testDate: data.testDate,
        tests: data.tests
      });

      let content = `✅ **Hasil laboratorium berhasil diproses!**\n\n`;

      if (patient.name) {
        content += `**Pasien:** ${patient.name}\n`;
      }

      if (data.testDate) {
        content += `**Tanggal:** ${data.testDate}\n\n`;
      }

      if (data.tests && data.tests.length > 0) {
        content += '**Hasil Pemeriksaan:**\n';
        data.tests.forEach(test => {
          const statusIcon = test.status === 'Tinggi' ? '⬆️' : test.status === 'Rendah' ? '⬇️' : '✓';
          content += `${statusIcon} **${test.name}:** ${test.value} ${test.unit || ''}`;
          if (test.normalRange) content += ` (Normal: ${test.normalRange})`;
          content += '\n';
        });
      }

      if (data.summary) {
        content += `\n**Analisis:** ${data.summary}\n`;
      }

      if (data.relevantFindings && data.relevantFindings.length > 0) {
        content += '\n**Temuan Penting:**\n';
        data.relevantFindings.forEach(finding => {
          content += `• ${finding}\n`;
        });
      }

      content += '\n💡 Data lab ini akan ditambahkan ke form E-Klaim.\n\nApakah Anda ingin saya update form dengan data lab ini?';

      // Prepare form data - merge mode (tidak overwrite data yang sudah ada)
      const formData = {
        // Patient data (jika belum ada di form)
        patientName: patient.name || '',
        patientId: patient.bpjsNumber || patient.nomorBPJS || '',
        nomorRM: patient.medicalRecordNumber || ''
      };

      console.log('🧪 [DEBUG] Lab Result Form Data:', formData);

      return {
        content,
        suggestion: {
          text: '➕ Tambahkan Data Lab ke Form',
          action: 'autofill-form'
        },
        formData
      };

    } else if (data.documentType === 'radiology') {
      const patient = data.patient || {};

      console.log('📸 [DEBUG] Radiology - Raw Data:', {
        patient: JSON.stringify(patient, null, 2),
        examType: data.examType,
        examDate: data.examDate,
        icd9cm: data.icd9cm
      });

      let content = `✅ **Hasil radiologi berhasil diproses!**\n\n`;

      if (patient.name) {
        content += `**Pasien:** ${patient.name}\n`;
      }

      if (data.examType) {
        content += `**Jenis:** ${data.examType}\n`;
      }
      if (data.examDate) {
        content += `**Tanggal:** ${data.examDate}\n`;
      }

      if (data.findings && data.findings.length > 0) {
        content += '\n**Hasil bacaan:**\n';
        data.findings.forEach(finding => {
          content += `• ${finding}\n`;
        });
      }

      if (data.conclusion) {
        content += `\n**Kesimpulan:** ${data.conclusion}\n`;
      }

      content += '\n💡 Data radiologi ini akan ditambahkan ke form E-Klaim.\n\nApakah Anda ingin saya tambahkan ke form?';

      // Prepare form data - add radiology procedure
      const formData = {
        // Patient data (jika belum ada di form)
        patientName: patient.name || '',
        patientId: patient.bpjsNumber || patient.nomorBPJS || '',
        nomorRM: patient.medicalRecordNumber || '',
        // Add procedure if has ICD-9-CM
        procedures: []
      };

      // Jika ada tindakan radiologi dengan kode ICD-9-CM
      if (data.examType && data.icd9cm) {
        formData.procedures.push({
          name: data.examType,
          icd9cm: data.icd9cm
        });
      }

      console.log('📸 [DEBUG] Radiology Form Data:', formData);

      return {
        content,
        suggestion: {
          text: '➕ Tambahkan Data Radiologi ke Form',
          action: 'autofill-form'
        },
        formData
      };
    } else if (data.documentType === 'surat_rujukan') {
      const patient = data.patient || {};
      const rujukan = data.rujukan || {};
      const diagnosis = data.diagnosis || {};

      console.log('📄 [DEBUG] Surat Rujukan - Raw Data:', {
        patient: JSON.stringify(patient, null, 2),
        rujukan: JSON.stringify(rujukan, null, 2),
        diagnosis: JSON.stringify(diagnosis, null, 2)
      });

      let content = `✅ **Surat rujukan berhasil diproses!**\n\n`;

      if (patient.name) {
        content += `**Pasien:** ${patient.name}\n`;
      }

      if (rujukan.nomorRujukan) {
        content += `**No. Rujukan:** ${rujukan.nomorRujukan}\n`;
      }

      if (rujukan.tanggalRujukan) {
        content += `**Tanggal Rujukan:** ${rujukan.tanggalRujukan}\n`;
      }

      if (rujukan.asalFaskes) {
        content += `**Dari:** ${rujukan.asalFaskes}\n`;
      }

      if (rujukan.tujuanFaskes) {
        content += `**Tujuan:** ${rujukan.tujuanFaskes}\n`;
      }

      if (rujukan.poliklinikTujuan) {
        content += `**Poli Tujuan:** ${rujukan.poliklinikTujuan}\n`;
      }

      if (diagnosis.name) {
        content += `\n**Diagnosa Rujukan:** ${diagnosis.name}`;
        if (diagnosis.icd10) content += ` (${diagnosis.icd10})`;
        content += '\n';
      }

      content += '\n💡 Data rujukan ini akan ditambahkan ke form E-Klaim.\n\nApakah Anda ingin saya tambahkan ke form?';

      // Prepare form data
      const formData = {
        // Patient data
        patientName: patient.name || '',
        patientId: patient.bpjsNumber || patient.nomorBPJS || '',
        nomorRM: patient.medicalRecordNumber || '',
        // Diagnosis from rujukan (jika belum ada di form)
        diagnosisPrimary: diagnosis.name || '',
        icd10Primary: diagnosis.icd10 || ''
      };

      console.log('📄 [DEBUG] Rujukan Form Data:', formData);

      return {
        content,
        suggestion: {
          text: '➕ Tambahkan Data Rujukan ke Form',
          action: 'autofill-form'
        },
        formData
      };

    } else if (data.documentType === 'resep_obat') {
      const patient = data.patient || {};
      const medications = data.medications || [];

      console.log('💊 [DEBUG] Resep Obat - Raw Data:', {
        patient: JSON.stringify(patient, null, 2),
        medications: medications.length
      });

      let content = `✅ **Resep obat berhasil diproses!**\n\n`;

      if (patient.name) {
        content += `**Pasien:** ${patient.name}\n`;
      }

      if (data.tanggalResep) {
        content += `**Tanggal:** ${data.tanggalResep}\n`;
      }

      if (data.dokter) {
        content += `**Dokter:** ${data.dokter}\n`;
      }

      if (medications.length > 0) {
        content += `\n**Obat-obatan (${medications.length} item):**\n`;
        medications.slice(0, 5).forEach(med => {
          content += `• ${med.name}`;
          if (med.dosage) content += ` - ${med.dosage}`;
          content += '\n';
        });
        if (medications.length > 5) {
          content += `... dan ${medications.length - 5} obat lainnya\n`;
        }
      }

      content += '\n💡 Data resep ini akan ditambahkan ke form E-Klaim.\n\nApakah Anda ingin saya tambahkan ke form?';

      // Prepare form data
      const formData = {
        // Patient data
        patientName: patient.name || '',
        patientId: patient.bpjsNumber || patient.nomorBPJS || '',
        nomorRM: patient.medicalRecordNumber || '',
        // DPJP from resep (jika belum ada di form)
        dpjp: data.dokter || ''
      };

      console.log('💊 [DEBUG] Resep Form Data:', formData);

      return {
        content,
        suggestion: {
          text: '➕ Tambahkan Data Resep ke Form',
          action: 'autofill-form'
        },
        formData
      };

    } else if (data.documentType === 'sep') {
      const patient = data.patient || {};
      const sep = data.sep || {};
      const pelayanan = data.pelayanan || {};
      const diagnosis = data.diagnosis || {};

      console.log('📄 [DEBUG] SEP - Raw Data:', {
        patient: JSON.stringify(patient, null, 2),
        sep: JSON.stringify(sep, null, 2),
        pelayanan: JSON.stringify(pelayanan, null, 2),
        diagnosis: JSON.stringify(diagnosis, null, 2)
      });

      let content = `✅ **Surat Eligibilitas Peserta (SEP) berhasil diproses!**\n\n`;

      if (sep.nomorSEP) {
        content += `**No. SEP:** ${sep.nomorSEP}\n`;
      }

      if (patient.name) {
        content += `**Nama Peserta:** ${patient.name}\n`;
      }

      if (patient.bpjsNumber) {
        content += `**No. BPJS:** ${patient.bpjsNumber}\n`;
      }

      if (sep.tanggalSEP) {
        content += `**Tanggal SEP:** ${sep.tanggalSEP}\n`;
      }

      if (pelayanan.ppkPelayanan) {
        content += `**PPK Pelayanan:** ${pelayanan.ppkPelayanan}\n`;
      }

      if (pelayanan.jenisPelayanan) {
        content += `**Jenis Pelayanan:** ${pelayanan.jenisPelayanan}\n`;
      }

      if (pelayanan.kelasRawat) {
        content += `**Kelas Rawat:** Kelas ${pelayanan.kelasRawat}\n`;
      }

      if (pelayanan.dpjp) {
        content += `**DPJP:** ${pelayanan.dpjp}\n`;
      }

      if (diagnosis.diagnosisAwal) {
        content += `\n**Diagnosa Awal:** ${diagnosis.diagnosisAwal}`;
        if (diagnosis.icd10) content += ` (${diagnosis.icd10})`;
        content += '\n';
      }

      content += '\n💡 Data SEP ini akan ditambahkan ke form E-Klaim.\n\nApakah Anda ingin saya tambahkan ke form?';

      // Prepare form data
      const formData = {
        // Patient data
        patientName: patient.name || '',
        patientId: patient.bpjsNumber || '',
        sepNumber: sep.nomorSEP || '',
        // Treatment data
        kelasRawat: pelayanan.kelasRawat || '3',
        dpjp: pelayanan.dpjp || '',
        // Diagnosis from SEP (jika belum ada di form)
        diagnosisPrimary: diagnosis.diagnosisAwal || '',
        icd10Primary: diagnosis.icd10 || ''
      };

      console.log('📄 [DEBUG] SEP Form Data:', formData);

      return {
        content,
        suggestion: {
          text: '➕ Tambahkan Data SEP ke Form',
          action: 'autofill-form'
        },
        formData
      };
    }

    // Fallback for unknown document types
    return {
      content: `✅ **Dokumen "${fileName}" berhasil dianalisis!**\n\nDokumen ini telah diproses dan akan disimpan sebagai lampiran klaim.\n\nUpload dokumen lain atau tanya saya jika butuh bantuan!`,
      suggestion: null,
      formData: null
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    const currentInput = input;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Call Gemini chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: currentInput,
          claimData: claimData,
          conversationHistory: messages
        })
      });

      const result = await response.json();

            if (result.success) {

              setMessages(prev => [...prev, {

                role: 'assistant',

                content: result.response,

                suggestion: result.suggestion,

                timestamp: new Date()

              }]);

            } else {

              // Handle API failure

              setMessages(prev => [...prev, {

                role: 'assistant',

                content: `⚠️ **Error: Gagal Menghubungi AI**\n\nMaaf, saya tidak dapat memproses permintaan Anda saat ini.\n\nPesan dari server: _${result.error || 'Tidak ada detail kesalahan.'}_\n\nSilakan coba lagi nanti.`,

                timestamp: new Date()

              }]);

            }

          } catch (error) {

            console.error('Error in chat:', error);

            setMessages(prev => [...prev, {

              role: 'assistant',

              content: `⚠️ **Error: Gagal Menghubungi Server**\n\nTidak dapat terhubung ke server chat. Periksa koneksi internet Anda dan coba lagi.\n\nError: ${error.message}`,

              timestamp: new Date()

            }]);

          } finally {

            setIsTyping(false);

          }

        };

  const handleQuickSuggestion = (suggestion) => {
    // Handle camera quick action
    if (suggestion.includes('📸 Foto dokumen')) {
      cameraInputRef.current?.click();
      return;
    }

    // Handle upload quick action
    if (suggestion.includes('📤 Upload')) {
      fileInputRef.current?.click();
      return;
    }

    // Default: set as chat input
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleCopy = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleApplySuggestion = (action, formData = null) => {
    if (onSuggestionApply) {
      onSuggestionApply(action, formData);
    }
  };

  return (
    <div
      ref={dropZoneRef}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-white rounded-2xl border-2 shadow-xl flex flex-col transition-all duration-300 ${
        isDragging ? 'border-4 border-dashed border-[#03974a] bg-green-50' : 'border-[#03974a]'
      } ${isMinimized ? 'h-16' : 'h-[calc(100vh-120px)]'}`}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && !isMinimized && (
        <div className="absolute inset-0 z-50 bg-[#03974a] bg-opacity-10 backdrop-blur-sm rounded-2xl flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <Upload className="w-20 h-20 text-[#03974a] mx-auto mb-4 animate-bounce" />
            <p className="text-2xl font-bold text-[#03974a]">Lepaskan file di sini</p>
            <p className="text-gray-600 mt-2">untuk upload dan analisis otomatis</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-[#03974a] to-[#144782] rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-[#03974a]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Copilot</h3>
            <p className="text-sm text-white/90">📸 Foto/Upload dokumen untuk auto-fill</p>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-white hover:bg-white/20 p-2.5 rounded-xl transition-colors"
        >
          {isMinimized ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-[#03974a] to-[#144782] text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content.split('**').map((part, i) =>
                        i % 2 === 0 ? (
                          <span key={i}>{part}</span>
                        ) : (
                          <strong key={i}>{part}</strong>
                        )
                      )}
                    </div>

                    {message.suggestion && (
                      <button
                        onClick={() => handleApplySuggestion(message.suggestion.action, message.formData)}
                        className="mt-3 w-full py-2 px-3 bg-white text-[#03974a] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        {message.suggestion.text}
                      </button>
                    )}
                  </div>

                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mt-2 px-2">
                      <button
                        onClick={() => handleCopy(message.content, index)}
                        className="text-xs text-gray-500 hover:text-[#03974a] flex items-center gap-1"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="w-3 h-3" />
                            Tersalin
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Salin
                          </>
                        )}
                      </button>
                      <span className="text-xs text-gray-400">
                        {message.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#03974a]" />
                      <span className="text-sm text-gray-600">Memproses dokumen dengan AI...</span>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 1 && (
            <div className="px-6 pb-4 bg-white border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3 mt-4">💡 Quick Actions:</p>
              <div className="grid grid-cols-2 gap-3">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSuggestion(suggestion)}
                    className="text-sm px-4 py-3 bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 text-gray-800 font-medium rounded-xl transition-all border border-gray-200 hover:border-[#03974a] hover:shadow-md"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-6 border-t-2 border-gray-200 bg-white rounded-b-2xl">
            <div
              className={`mb-3 p-4 border-2 border-dashed rounded-xl transition-all ${
                isDragging ? 'border-[#03974a] bg-green-50' : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="text-center text-sm text-gray-600">
                <Upload className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                <span className="font-medium">Drag & drop file di sini</span>
                <span className="text-gray-400"> atau klik tombol Upload/Kamera</span>
              </div>
            </div>
            <div className="flex gap-3">
              {/* Hidden file input for regular upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              {/* Hidden file input for camera capture */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                className="hidden"
              />
              {/* Upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-3 border-2 border-dashed border-[#03974a] rounded-xl hover:bg-green-50 transition-all group flex items-center gap-2"
                title="Upload dokumen dari galeri"
              >
                <Upload className="w-5 h-5 text-[#03974a]" />
                <span className="text-sm font-medium text-[#03974a] hidden sm:block">Upload</span>
              </button>
              {/* Camera button (mobile-friendly) */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="px-4 py-3 border-2 border-dashed border-[#144782] rounded-xl hover:bg-blue-50 transition-all group flex items-center gap-2"
                title="Foto dokumen dengan kamera"
              >
                <ImageIcon className="w-5 h-5 text-[#144782]" />
                <span className="text-sm font-medium text-[#144782] hidden sm:block">Kamera</span>
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ketik pertanyaan atau upload dokumen..."
                className="flex-1 px-5 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03974a] focus:border-[#03974a] text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`px-5 py-3 rounded-xl transition-all font-medium ${
                  input.trim()
                    ? 'bg-gradient-to-r from-[#03974a] to-[#144782] text-white hover:shadow-lg hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="mt-3 flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <FileText className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  {uploadedFiles.length} dokumen berhasil diupload
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
