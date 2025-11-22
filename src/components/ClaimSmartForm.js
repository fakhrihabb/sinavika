'use client';
import { useState, useEffect } from 'react';
import { FileText, AlertCircle, Check, Sparkles, Info } from 'lucide-react';

export default function ClaimSmartForm({ claimData, onFormChange, aiFilledData }) {
  const [formData, setFormData] = useState({
    // Data Pasien & Administrasi
    patientName: claimData?.patientName || '',
    patientId: claimData?.patientId || '',
    noRM: '',
    sepNumber: claimData?.sepNumber || '',
    birthDate: '',
    gender: '',

    // Data Rawat
    treatmentType: 'Rawat Jalan', // Rawat Jalan / Rawat Inap
    admissionDate: claimData?.admissionDate || '',
    dischargeDate: claimData?.dischargeDate || '',
    los: claimData?.los || '0',
    kelasRawat: '3', // 1, 2, 3
    caraPulang: 'Atas Persetujuan Dokter',
    beratLahir: '', // untuk bayi

    // DPJP
    dpjp: claimData?.doctor || '',

    // Diagnosa
    diagnosis: '',
    icd10Primary: '',
    icd10Secondary: '',

    // Prosedur/Tindakan
    procedures: '',
    icd9cm: '',

    // INA-CBG - KRUSIAL!
    inaCbgCode: '',
    inaCbgDescription: '',
    tarifInaCbg: '',

    // Tarif RS
    tarifRS: {
      prosedurNonBedah: '',
      prosedurBedah: '',
      konsultasi: '',
      tenagaAhli: '',
      keperawatan: '',
      penunjang: '',
      radiologi: '',
      laboratorium: '',
      pelayananDarah: '',
      rehabilitasi: '',
      kamar: '',
      rawatIntensif: '',
      obat: '',
      obatKronis: '',
      obatKemoterapi: '',
      alkes: '',
      bmhp: '',
      sewaAlat: ''
    },
    tarifType: 'TARIF RS KELAS A PEMERINTAH',
    totalTarifRS: ''
  });

  const [aiSuggestions, setAiSuggestions] = useState({
    icd10Primary: null,
    icd10Secondary: null,
    inaCbgCode: null,
    tarif: null
  });

  const [highlightedFields, setHighlightedFields] = useState([]);

  // Update form when AI fills data
  useEffect(() => {
    if (aiFilledData) {
      console.log("Received aiFilledData:", aiFilledData);
      const newFormData = { ...formData };
      const highlighted = [];
      const suggestions = { ...aiSuggestions };

      // Helper function to safely update form data and track highlights
      const updateField = (field, value) => {
        if (value !== undefined && value !== null) {
          newFormData[field] = value;
          highlighted.push(field);
        }
      };
      
      if (aiFilledData.patient) {
        updateField('patientName', aiFilledData.patient.name);
        updateField('noRM', aiFilledData.patient.medicalRecordNumber);
        updateField('sepNumber', aiFilledData.patient.sepNumber || aiFilledData.patient.bpjsNumber); // Also check bpjsNumber
        updateField('birthDate', aiFilledData.patient.dateOfBirth);
        updateField('gender', aiFilledData.patient.gender);
      }

      if (aiFilledData.treatment) {
        updateField('admissionDate', aiFilledData.treatment.admissionDate);
        updateField('dischargeDate', aiFilledData.treatment.dischargeDate);
        updateField('dpjp', aiFilledData.treatment.dpjp);
        updateField('kelasRawat', aiFilledData.treatment.kelasRawat);
        updateField('treatmentType', aiFilledData.treatment.type);
      }

      if (aiFilledData.diagnosis) {
        const primary = aiFilledData.diagnosis.primary;
        const secondary = aiFilledData.diagnosis.secondary;
        const tertiary = aiFilledData.diagnosis.tertiary;
        let fullDiagnosis = [];

        if (primary && primary.name) {
          updateField('icd10Primary', primary.icd10);
          suggestions.icd10Primary = primary.icd10 ? `AI: ${primary.icd10}` : null;
          fullDiagnosis.push(`Utama: ${primary.name} (${primary.icd10 || 'N/A'})`);
        }
        if (secondary && secondary.name) {
          updateField('icd10Secondary', secondary.icd10);
          suggestions.icd10Secondary = secondary.icd10 ? `AI: ${secondary.icd10}` : null;
          fullDiagnosis.push(`Sekunder: ${secondary.name} (${secondary.icd10 || 'N/A'})`);
        }
        if (tertiary && tertiary.name) {
            fullDiagnosis.push(`Penyerta: ${tertiary.name} (${tertiary.icd10 || 'N/A'})`);
        }
        
        if (fullDiagnosis.length > 0) {
            updateField('diagnosis', fullDiagnosis.join('\n'));
        }
      }

      if (aiFilledData.procedures && aiFilledData.procedures.length > 0) {
        const procedureNames = aiFilledData.procedures.map(p => p.name).join(', ');
        const procedureCodes = aiFilledData.procedures.map(p => p.icd9cm).filter(Boolean).join(', ');
        updateField('procedures', procedureNames);
        updateField('icd9cm', procedureCodes);
      }
      
      // Keep inaCbg and tarif logic if it exists
      if (aiFilledData.inaCbg) {
        updateField('inaCbgCode', aiFilledData.inaCbg);
        suggestions.inaCbgCode = `AI mapping: ${aiFilledData.inaCbg}`;
      }
      if (aiFilledData.tarif) {
        updateField('tarif', formatRupiah(aiFilledData.tarif));
        suggestions.tarif = `AI estimate: Rp ${formatNumber(aiFilledData.tarif)}`;
      }

      console.log("New form data:", newFormData);
      console.log("Highlighted fields:", highlighted);

      setFormData(newFormData);
      setAiSuggestions(suggestions);
      setHighlightedFields(highlighted);

      // Clear highlight after 5 seconds
      setTimeout(() => {
        setHighlightedFields([]);
      }, 5000);
    }
  }, [aiFilledData]);


  const formatRupiah = (number) => {
    if (typeof number === 'string') {
      number = parseFloat(number.replace(/[^0-9,-]+/g,""));
    }
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('id-ID').format(number);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('id-ID').format(number);
  };

  const handleChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    if (onFormChange) {
      onFormChange(newFormData);
    }
  };

  const isFieldHighlighted = (field) => {
    return highlightedFields.includes(field);
  };

  // Mock INA-CBG lookup data
  const inaCbgDatabase = {
    'E11.9': { code: 'N-4-10-I', description: 'Diabetes Mellitus Tanpa Komplikasi', tarif: '2500000-3200000' },
    'E11.65': { code: 'N-4-10-II', description: 'Diabetes Mellitus Dengan Komplikasi', tarif: '3500000-4200000' },
    'I10': { code: 'E-4-10-I', description: 'Hipertensi Esensial', tarif: '1800000-2400000' },
    'J18.9': { code: 'F-4-10-I', description: 'Pneumonia', tarif: '3000000-4000000' }
  };

  const lookupInaCbg = (icdCode) => {
    return inaCbgDatabase[icdCode] || null;
  };

  useEffect(() => {
    // Auto-lookup INA-CBG when ICD-10 primary changes
    if (formData.icd10Primary) {
      const inaCbgData = lookupInaCbg(formData.icd10Primary);
      if (inaCbgData) {
        setFormData(prev => ({
          ...prev,
          inaCbgCode: inaCbgData.code,
          inaCbgDescription: inaCbgData.description
        }));

        setAiSuggestions(prev => ({
          ...prev,
          inaCbgCode: `Auto-mapped dari ICD ${formData.icd10Primary}`,
          tarif: `Estimasi: Rp ${inaCbgData.tarif}`
        }));
      }
    }
  }, [formData.icd10Primary]);

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-green-50">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#144782]" />
          Form Data Klaim
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Isi manual atau biarkan AI mengisi otomatis dari dokumen
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Diagnosa Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Diagnosa & Tindakan</h3>
            {(isFieldHighlighted('diagnosis') || isFieldHighlighted('icd10Primary')) && (
              <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full animate-pulse">
                <Sparkles className="w-3 h-3" />
                AI Filled
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnosa (Nama Penyakit)
            </label>
            <textarea
              value={formData.diagnosis}
              onChange={(e) => handleChange('diagnosis', e.target.value)}
              placeholder="Contoh: Diabetes Mellitus Tipe 2 dengan Hipertensi"
              rows={3}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#144782] text-sm transition-all ${isFieldHighlighted('diagnosis')
                  ? 'border-green-400 bg-green-50 ring-2 ring-green-200'
                  : 'border-gray-300'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ICD-10 Diagnosa Utama *
                <span className="text-xs text-gray-500 ml-1">(Wajib)</span>
              </label>
              <input
                type="text"
                value={formData.icd10Primary}
                onChange={(e) => handleChange('icd10Primary', e.target.value.toUpperCase())}
                placeholder="Contoh: E11.9"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#144782] text-sm transition-all ${isFieldHighlighted('icd10Primary')
                    ? 'border-green-400 bg-green-50 ring-2 ring-green-200'
                    : 'border-gray-300'
                }`}
              />
              {aiSuggestions.icd10Primary && (
                <p className="mt-1 text-xs text-blue-600 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  {aiSuggestions.icd10Primary}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ICD-10 Diagnosa Sekunder
                <span className="text-xs text-gray-500 ml-1">(Opsional)</span>
              </label>
              <input
                type="text"
                value={formData.icd10Secondary}
                onChange={(e) => handleChange('icd10Secondary', e.target.value.toUpperCase())}
                placeholder="Contoh: I10"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#144782] text-sm transition-all ${isFieldHighlighted('icd10Secondary')
                    ? 'border-green-400 bg-green-50 ring-2 ring-green-200'
                    : 'border-gray-300'
                }`}
              />
               {aiSuggestions.icd10Secondary && (
                <p className="mt-1 text-xs text-blue-600 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  {aiSuggestions.icd10Secondary}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prosedur / Tindakan
            </label>
            <input
              type="text"
              value={formData.procedures}
              onChange={(e) => handleChange('procedures', e.target.value)}
              placeholder="Contoh: Konsultasi, Pemeriksaan Lab"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#144782] text-sm transition-all ${isFieldHighlighted('procedures')
                  ? 'border-green-400 bg-green-50 ring-2 ring-green-200'
                  : 'border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ICD-9-CM (Kode Prosedur)
              <span className="text-xs text-gray-500 ml-1">(Jika ada)</span>
            </label>
            <input
              type="text"
              value={formData.icd9cm}
              onChange={(e) => handleChange('icd9cm', e.target.value)}
              placeholder="Contoh: 99.15, 88.72"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#144782] text-sm transition-all ${isFieldHighlighted('icd9cm')
                  ? 'border-green-400 bg-green-50 ring-2 ring-green-200'
                  : 'border-gray-300'
              }`}
            />
          </div>
        </div>

        {/* INA-CBG Section - PALING PENTING! */}
        <div className="space-y-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                INA-CBG (Indonesian Case Base Groups)
                {isFieldHighlighted('inaCbgCode') && (
                  <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    AI Mapped
                  </span>
                )}
              </h3>
              <p className="text-xs text-orange-700 mb-3">
                ⚠️ Kode ini yang sering salah! Pastikan mapping dari ICD-10 benar untuk menghindari klaim ditolak BPJS.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Kode INA-CBG *
              </label>
              <input
                type="text"
                value={formData.inaCbgCode}
                onChange={(e) => handleChange('inaCbgCode', e.target.value.toUpperCase())}
                placeholder="Contoh: N-4-10-I"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm font-mono transition-all ${isFieldHighlighted('inaCbgCode')
                    ? 'border-green-400 bg-green-50 ring-2 ring-green-200'
                    : 'border-orange-300 bg-white'
                }`}
              />
              {aiSuggestions.inaCbgCode && (
                <p className="mt-1 text-xs text-green-600 flex items-center gap-1 font-medium">
                  <Check className="w-3 h-3" />
                  {aiSuggestions.inaCbgCode}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Deskripsi INA-CBG
              </label>
              <input
                type="text"
                value={formData.inaCbgDescription}
                onChange={(e) => handleChange('inaCbgDescription', e.target.value)}
                placeholder="Contoh: Diabetes Mellitus Tanpa Komplikasi"
                className="w-full px-4 py-2.5 border border-orange-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
              />
            </div>
          </div>

          {formData.icd10Primary && !formData.inaCbgCode && (
            <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-800">
                ICD-10 sudah diisi tapi INA-CBG belum! Upload resume medis ke AI untuk auto-mapping.
              </p>
            </div>
          )}
        </div>

        {/* Tarif Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 pb-2 border-b border-gray-200">
            Tarif Rumah Sakit
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Tarif
            </label>
            <select
              value={formData.tarifType}
              onChange={(e) => handleChange('tarifType', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#144782] text-sm"
            >
              <option>TARIF RS KELAS A PEMERINTAH</option>
              <option>TARIF RS KELAS B PEMERINTAH</option>
              <option>TARIF RS KELAS C PEMERINTAH</option>
              <option>TARIF RS SWASTA</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tarif (Rp)
              {isFieldHighlighted('tarif') && (
                <span className="ml-2 text-xs text-green-600 font-normal">
                  ✓ AI Calculated
                </span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                Rp
              </span>
              <input
                type="text"
                value={formData.tarif}
                onChange={(e) => handleChange('tarif', e.target.value)}
                placeholder="300,000"
                className={`w-full pl-12 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#144782] text-sm transition-all ${isFieldHighlighted('tarif')
                    ? 'border-green-400 bg-green-50 ring-2 ring-green-200'
                    : 'border-gray-300'
                }`}
              />
            </div>
            {aiSuggestions.tarif && (
              <p className="mt-1 text-xs text-blue-600 flex items-center gap-1">
                <Info className="w-3 h-3" />
                {aiSuggestions.tarif}
              </p>
            )}
          </div>
        </div>

        {/* DPJP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            DPJP (Dokter Penanggung Jawab Pelayanan)
          </label>
          <input
            type="text"
            value={formData.dpjp}
            onChange={(e) => handleChange('dpjp', e.target.value)}
            placeholder="Contoh: dr. Budi"
             className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#144782] text-sm transition-all ${isFieldHighlighted('dpjp')
                ? 'border-green-400 bg-green-50 ring-2 ring-green-200'
                : 'border-gray-300'
              }`}
          />
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Tips AI Copilot
          </h4>
          <ul className="text-xs text-blue-800 space-y-1 leading-relaxed">
            <li>• Upload <strong>resume medis</strong> untuk auto-fill diagnosa dan ICD-10</li>
            <li>• AI akan otomatis <strong>mapping ICD-10 ke INA-CBG</strong> yang benar</li>
            <li>• Review field yang diisi AI (ditandai hijau) sebelum submit</li>
            <li>• INA-CBG yang salah adalah penyebab utama klaim ditolak BPJS!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}