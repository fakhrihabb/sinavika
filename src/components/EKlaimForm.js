'use client';
import { useState, useEffect } from 'react';
import { FileText, AlertCircle, Check, Sparkles, Info, Plus, X, Calculator, Zap, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

export default function EKlaimForm({ claimData, onFormChange, aiFilledData }) {
  const [formData, setFormData] = useState({
    // Data Pasien
    patientName: claimData?.patientName || '',
    patientId: claimData?.patientId || '',
    sepNumber: claimData?.sepNumber || '',
    nomorRM: '',

    // Data Rawat
    treatmentType: 'Rawat Jalan',
    admissionDate: claimData?.admissionDate || '',
    dischargeDate: claimData?.dischargeDate || '',
    los: '0',
    kelasRawat: '3',
    caraPulang: 'Atas Persetujuan Dokter',
    beratLahir: '',

    // DPJP
    dpjp: claimData?.doctor || '',

    // Diagnosa
    diagnosisPrimary: '',
    icd10Primary: '',
    diagnosisSecondary: '',
    icd10Secondary: '',
    diagnosisTertiary: '',
    icd10Tertiary: '',

    // Prosedur/Tindakan (ICD-9-CM)
    procedures: [],

    // INA-CBG Results
    inaCbgCode: '',
    inaCbgDescription: '',
    tarifInaCbg: '',

    // Tarif RS Rinci (dari video E-Klaim)
    tarifRS: {
      prosedurBedah: '',
      tenagaAhli: '',
      keperawatan: '',
      penunjang: '',
      radiologi: '',
      laboratorium: '',
      rehabilitasi: '',
      kamarAkomodasi: '',
      rawatIntensif: '',
      obat: '',
      alkes: '',
      bmhp: '',
      konsultasi: ''
    }
  });

  // Helper function to ensure value is never null
  const safeValue = (value) => {
    return value === null || value === undefined ? '' : value;
  };

  const [highlightedFields, setHighlightedFields] = useState([]);
  const [grouperResult, setGrouperResult] = useState(null);
  const [isGrouping, setIsGrouping] = useState(false);

  // Collapsible sections state - default all open
  const [expandedSections, setExpandedSections] = useState({
    dataPasien: true,
    dataRawat: true,
    diagnosa: true,
    prosedur: true,
    tarifRS: true,
    grouper: true
  });

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Update form when AI fills data
  useEffect(() => {
    if (aiFilledData) {
      console.log('🎯 [DEBUG] Receiving AI Filled Data:', JSON.stringify(aiFilledData, null, 2));

      const newFormData = { ...formData };
      const highlighted = [];
      const fieldsUpdated = [];
      const fieldsSkipped = [];

      // Patient data
      if (aiFilledData.patientName) {
        newFormData.patientName = safeValue(aiFilledData.patientName);
        highlighted.push('patientName');
        fieldsUpdated.push(`patientName: "${aiFilledData.patientName}"`);
      } else {
        fieldsSkipped.push('patientName (empty/null)');
      }
      if (aiFilledData.patientId) {
        newFormData.patientId = safeValue(aiFilledData.patientId);
        highlighted.push('patientId');
        fieldsUpdated.push(`patientId: "${aiFilledData.patientId}"`);
      } else {
        fieldsSkipped.push('patientId (empty/null)');
      }
      if (aiFilledData.sepNumber) {
        newFormData.sepNumber = safeValue(aiFilledData.sepNumber);
        highlighted.push('sepNumber');
        fieldsUpdated.push(`sepNumber: "${aiFilledData.sepNumber}"`);
      } else {
        fieldsSkipped.push('sepNumber (empty/null)');
      }
      if (aiFilledData.nomorRM) {
        newFormData.nomorRM = safeValue(aiFilledData.nomorRM);
        highlighted.push('nomorRM');
        fieldsUpdated.push(`nomorRM: "${aiFilledData.nomorRM}"`);
      } else {
        fieldsSkipped.push('nomorRM (empty/null)');
      }

      // Treatment data
      if (aiFilledData.treatmentType) {
        newFormData.treatmentType = aiFilledData.treatmentType;
        highlighted.push('treatmentType');
        fieldsUpdated.push(`treatmentType: "${aiFilledData.treatmentType}"`);
      } else {
        fieldsSkipped.push('treatmentType (empty/null)');
      }
      if (aiFilledData.admissionDate) {
        newFormData.admissionDate = aiFilledData.admissionDate;
        highlighted.push('admissionDate');
        fieldsUpdated.push(`admissionDate: "${aiFilledData.admissionDate}"`);
      } else {
        fieldsSkipped.push('admissionDate (empty/null)');
      }
      if (aiFilledData.dischargeDate) {
        newFormData.dischargeDate = aiFilledData.dischargeDate;
        highlighted.push('dischargeDate');
        fieldsUpdated.push(`dischargeDate: "${aiFilledData.dischargeDate}"`);
      } else {
        fieldsSkipped.push('dischargeDate (empty/null)');
      }
      if (aiFilledData.kelasRawat) {
        newFormData.kelasRawat = aiFilledData.kelasRawat;
        highlighted.push('kelasRawat');
        fieldsUpdated.push(`kelasRawat: "${aiFilledData.kelasRawat}"`);
      } else {
        fieldsSkipped.push('kelasRawat (empty/null)');
      }
      if (aiFilledData.dpjp) {
        newFormData.dpjp = safeValue(aiFilledData.dpjp);
        highlighted.push('dpjp');
        fieldsUpdated.push(`dpjp: "${aiFilledData.dpjp}"`);
      } else {
        fieldsSkipped.push('dpjp (empty/null)');
      }

      // Diagnosa - ensure no null values
      if (aiFilledData.diagnosisPrimary) {
        newFormData.diagnosisPrimary = safeValue(aiFilledData.diagnosisPrimary);
        highlighted.push('diagnosisPrimary');
        fieldsUpdated.push(`diagnosisPrimary: "${aiFilledData.diagnosisPrimary}"`);
      } else {
        fieldsSkipped.push('diagnosisPrimary (empty/null)');
      }
      if (aiFilledData.icd10Primary) {
        newFormData.icd10Primary = safeValue(aiFilledData.icd10Primary);
        highlighted.push('icd10Primary');
        fieldsUpdated.push(`icd10Primary: "${aiFilledData.icd10Primary}"`);
      } else {
        fieldsSkipped.push('icd10Primary (empty/null)');
      }
      if (aiFilledData.diagnosisSecondary) {
        newFormData.diagnosisSecondary = safeValue(aiFilledData.diagnosisSecondary);
        highlighted.push('diagnosisSecondary');
        fieldsUpdated.push(`diagnosisSecondary: "${aiFilledData.diagnosisSecondary}"`);
      } else {
        fieldsSkipped.push('diagnosisSecondary (empty/null)');
      }
      if (aiFilledData.icd10Secondary) {
        newFormData.icd10Secondary = safeValue(aiFilledData.icd10Secondary);
        highlighted.push('icd10Secondary');
        fieldsUpdated.push(`icd10Secondary: "${aiFilledData.icd10Secondary}"`);
      } else {
        fieldsSkipped.push('icd10Secondary (empty/null)');
      }
      if (aiFilledData.diagnosisTertiary) {
        newFormData.diagnosisTertiary = safeValue(aiFilledData.diagnosisTertiary);
        highlighted.push('diagnosisTertiary');
        fieldsUpdated.push(`diagnosisTertiary: "${aiFilledData.diagnosisTertiary}"`);
      } else {
        fieldsSkipped.push('diagnosisTertiary (empty/null)');
      }
      if (aiFilledData.icd10Tertiary) {
        newFormData.icd10Tertiary = safeValue(aiFilledData.icd10Tertiary);
        highlighted.push('icd10Tertiary');
        fieldsUpdated.push(`icd10Tertiary: "${aiFilledData.icd10Tertiary}"`);
      } else {
        fieldsSkipped.push('icd10Tertiary (empty/null)');
      }

      // Procedures - MERGE mode (append new procedures, don't replace existing)
      if (aiFilledData.procedures && aiFilledData.procedures.length > 0) {
        const newProcedures = aiFilledData.procedures.map(proc => ({
          name: safeValue(proc.name),
          icd9cm: safeValue(proc.icd9cm)
        }));

        // Check if we already have procedures in form
        if (newFormData.procedures && newFormData.procedures.length > 0) {
          // Merge: add new procedures to existing ones (avoid duplicates by name)
          const existingNames = newFormData.procedures.map(p => p.name.toLowerCase());
          const uniqueNewProcedures = newProcedures.filter(
            newProc => !existingNames.includes(newProc.name.toLowerCase())
          );

          if (uniqueNewProcedures.length > 0) {
            newFormData.procedures = [...newFormData.procedures, ...uniqueNewProcedures];
            highlighted.push('procedures');
            fieldsUpdated.push(`procedures: +${uniqueNewProcedures.length} new items (merged)`);
          } else {
            fieldsSkipped.push('procedures (duplicates, not added)');
          }
        } else {
          // No existing procedures, just set the new ones
          newFormData.procedures = newProcedures;
          highlighted.push('procedures');
          fieldsUpdated.push(`procedures: ${newProcedures.length} items`);
        }
      } else {
        fieldsSkipped.push('procedures (empty/null)');
      }

      setFormData(newFormData);
      setHighlightedFields(highlighted);

      // Auto-calculate LOS
      if (newFormData.admissionDate && newFormData.dischargeDate) {
        const admission = new Date(newFormData.admissionDate);
        const discharge = new Date(newFormData.dischargeDate);
        const diffTime = Math.abs(discharge - admission);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        newFormData.los = diffDays.toString();
      }

      // Summary logging
      console.log(`✅ [DEBUG] Fields Updated (${fieldsUpdated.length}):`, fieldsUpdated);
      console.log(`⚠️ [DEBUG] Fields Skipped (${fieldsSkipped.length}):`, fieldsSkipped);
      console.log('📄 [DEBUG] Final Form State:', {
        patient: {
          patientName: newFormData.patientName,
          patientId: newFormData.patientId,
          sepNumber: newFormData.sepNumber,
          nomorRM: newFormData.nomorRM
        },
        treatment: {
          treatmentType: newFormData.treatmentType,
          admissionDate: newFormData.admissionDate,
          dischargeDate: newFormData.dischargeDate,
          kelasRawat: newFormData.kelasRawat,
          dpjp: newFormData.dpjp
        },
        diagnosis: {
          primary: `${newFormData.diagnosisPrimary} (${newFormData.icd10Primary})`,
          secondary: `${newFormData.diagnosisSecondary} (${newFormData.icd10Secondary})`,
          tertiary: `${newFormData.diagnosisTertiary} (${newFormData.icd10Tertiary})`
        },
        procedures: newFormData.procedures.length
      });

      setTimeout(() => setHighlightedFields([]), 3000);
    }
  }, [aiFilledData]);

  const handleChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };

    // Auto-calculate LOS
    if (field === 'admissionDate' || field === 'dischargeDate') {
      if (newFormData.admissionDate && newFormData.dischargeDate) {
        const admission = new Date(newFormData.admissionDate);
        const discharge = new Date(newFormData.dischargeDate);
        const diffTime = Math.abs(discharge - admission);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        newFormData.los = diffDays.toString();
      }
    }

    setFormData(newFormData);
    if (onFormChange) onFormChange(newFormData);
  };

  const handleTarifRSChange = (field, value) => {
    const newTarifRS = { ...formData.tarifRS, [field]: value };
    handleChange('tarifRS', newTarifRS);
  };

  const addProcedure = () => {
    const newProcedures = [...formData.procedures, { name: '', icd9cm: '' }];
    handleChange('procedures', newProcedures);
  };

  const removeProcedure = (index) => {
    const newProcedures = formData.procedures.filter((_, i) => i !== index);
    handleChange('procedures', newProcedures);
  };

  const updateProcedure = (index, field, value) => {
    const newProcedures = [...formData.procedures];
    newProcedures[index] = { ...newProcedures[index], [field]: value };
    handleChange('procedures', newProcedures);
  };

  useEffect(() => {
    // Auto-run grouper when critical data changes
    if(formData.icd10Primary && formData.kelasRawat) {
        runGrouper();
    }
  }, [formData.icd10Primary, formData.kelasRawat, formData.procedures]);

  // Simulate INA-CBG Grouper (simplified version based on video)
  const runGrouper = () => {
    setIsGrouping(true);

    setTimeout(() => {
      // Simplified grouper logic based on ICD-10 Primary
      let baseRate = 377000; // Default for rawat jalan
      let inaCbgCode = 'N/A';
      let description = '';

      if (formData.treatmentType === 'Rawat Inap') {
        baseRate = 1165600; // Base for rawat inap
        if (formData.kelasRawat === '1') baseRate *= 2.3;
        else if (formData.kelasRawat === '2') baseRate *= 1.5;
      }

      if (formData.icd10Primary) {
        if (formData.icd10Primary.startsWith('I10')) {
          inaCbgCode = 'K-3-10-I';
          description = 'Hipertensi Esensial';
          baseRate += 500000;
        } else if (formData.icd10Primary.startsWith('E11')) {
          inaCbgCode = 'O-2-15-I';
          description = 'Diabetes Mellitus Type 2';
          baseRate += 800000;
        } else if (formData.icd10Primary.startsWith('J18')) {
          inaCbgCode = 'E-4-10-I';
          description = 'Pneumonia';
          baseRate += 1200000;
        }
      }

      if (formData.icd10Secondary) baseRate += 800000;
      if (formData.icd10Tertiary) baseRate += 1500000;

      formData.procedures.forEach(proc => {
        if (proc.icd9cm?.includes('99.04')) baseRate += 500000; // Transfusi
        else if (proc.icd9cm?.includes('87.44')) baseRate += 150000; // Rontgen
        else if (proc.icd9cm?.includes('39.95')) baseRate += 1800000; // Cuci Darah
      });

      const finalTarifInaCbg = Math.round(baseRate);
      // Mock Tarif RS to be 115% of INA-CBG to have a value for fraud detection
      const mockTotalTarifRS = Math.round(finalTarifInaCbg * 1.15);

      setGrouperResult({
        code: inaCbgCode,
        description: description,
        tarif: finalTarifInaCbg
      });

      const newFormData = { 
          ...formData,
          inaCbgCode: inaCbgCode,
          inaCbgDescription: description,
          tarifInaCbg: finalTarifInaCbg.toString(),
          totalTarifRS: mockTotalTarifRS.toString(), // Set the total RS tariff
      };
      
      // To make it look more realistic, put the mock total into one of the sub-fields
      newFormData.tarifRS.obat = mockTotalTarifRS.toString();

      setFormData(newFormData);
       if (onFormChange) onFormChange(newFormData);


      setIsGrouping(false);
    }, 1000);
  };

  const isFieldHighlighted = (field) => highlightedFields.includes(field);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID').format(number);
  };

  const calculateTotalTarifRS = () => {
    let total = 0;
    Object.values(formData.tarifRS).forEach(value => {
      const num = parseInt(value) || 0;
      total += num;
    });
    return total;
  };

  return (
    <div className="space-y-8">
      {/* Section 1: Data Pasien */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <button
          onClick={() => toggleSection('dataPasien')}
          className="w-full px-8 py-6 border-b border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
        >
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#144782] rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            Data Pasien
          </h2>
          {expandedSections.dataPasien ? (
            <ChevronUp className="w-6 h-6 text-gray-600" />
          ) : (
            <ChevronDown className="w-6 h-6 text-gray-600" />
          )}
        </button>
        {expandedSections.dataPasien && (
          <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Pasien
              </label>
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) => handleChange('patientName', e.target.value)}
                placeholder="Nama lengkap pasien"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144782] ${
                  isFieldHighlighted('patientName')
                    ? 'border-green-400 bg-green-50 animate-pulse'
                    : 'border-gray-300'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                No. Peserta BPJS
              </label>
              <input
                type="text"
                value={formData.patientId}
                onChange={(e) => handleChange('patientId', e.target.value)}
                placeholder="Nomor peserta BPJS"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144782] font-mono ${
                  isFieldHighlighted('patientId')
                    ? 'border-green-400 bg-green-50 animate-pulse'
                    : 'border-gray-300'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                No. SEP
              </label>
              <input
                type="text"
                value={formData.sepNumber}
                onChange={(e) => handleChange('sepNumber', e.target.value)}
                placeholder="Nomor Surat Elegibilitas Peserta"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144782] font-mono ${
                  isFieldHighlighted('sepNumber')
                    ? 'border-green-400 bg-green-50 animate-pulse'
                    : 'border-gray-300'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                No. Rekam Medis
              </label>
              <input
                type="text"
                value={formData.nomorRM}
                onChange={(e) => handleChange('nomorRM', e.target.value)}
                placeholder="Nomor rekam medis"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144782] font-mono ${
                  isFieldHighlighted('nomorRM')
                    ? 'border-green-400 bg-green-50 animate-pulse'
                    : 'border-gray-300'
                }`}
              />
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Section 2: Data Rawat & Administrasi */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <button
          onClick={() => toggleSection('dataRawat')}
          className="w-full px-8 py-6 border-b border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
        >
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#144782] rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            Data Rawat & Administrasi
          </h2>
          {expandedSections.dataRawat ? (
            <ChevronUp className="w-6 h-6 text-gray-600" />
          ) : (
            <ChevronDown className="w-6 h-6 text-gray-600" />
          )}
        </button>
        {expandedSections.dataRawat && (
          <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jenis Rawat *
              </label>
              <select
                value={formData.treatmentType}
                onChange={(e) => handleChange('treatmentType', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144782] font-medium ${
                  isFieldHighlighted('treatmentType') ? 'border-green-400 bg-green-50' : 'border-gray-300'
                }`}
              >
                <option value="Rawat Jalan">Rawat Jalan</option>
                <option value="Rawat Inap">Rawat Inap</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tanggal Masuk *
              </label>
              <input
                type="date"
                value={formData.admissionDate}
                onChange={(e) => handleChange('admissionDate', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144782] ${
                  isFieldHighlighted('admissionDate') ? 'border-green-400 bg-green-50' : 'border-gray-300'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tanggal Pulang *
              </label>
              <input
                type="date"
                value={formData.dischargeDate}
                onChange={(e) => handleChange('dischargeDate', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144782] ${
                  isFieldHighlighted('dischargeDate') ? 'border-green-400 bg-green-50' : 'border-gray-300'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lama Rawat (LOS) - Hari
              </label>
              <input
                type="text"
                value={formData.los}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 font-bold text-lg text-center"
              />
              <p className="text-xs text-gray-500 mt-1">Otomatis terhitung</p>
            </div>

            {formData.treatmentType === 'Rawat Inap' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kelas Rawat *
                  </label>
                  <select
                    value={formData.kelasRawat}
                    onChange={(e) => handleChange('kelasRawat', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144782] font-medium ${
                      isFieldHighlighted('kelasRawat') ? 'border-green-400 bg-green-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="1">Kelas 1</option>
                    <option value="2">Kelas 2</option>
                    <option value="3">Kelas 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Berat Lahir (gram) - Untuk Bayi
                  </label>
                  <input
                    type="number"
                    value={formData.beratLahir}
                    onChange={(e) => handleChange('beratLahir', e.target.value)}
                    placeholder="Kosongkan jika bukan bayi"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144782]"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cara Pulang
              </label>
              <select
                value={formData.caraPulang}
                onChange={(e) => handleChange('caraPulang', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144782]"
              >
                <option>Atas Persetujuan Dokter</option>
                <option>Atas Permintaan Sendiri</option>
                <option>Meninggal</option>
                <option>Rujuk</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                DPJP (Dokter Penanggung Jawab Pelayanan) *
              </label>
              <input
                type="text"
                value={formData.dpjp}
                onChange={(e) => handleChange('dpjp', e.target.value)}
                placeholder="Contoh: dr. Budi Santoso, Sp.PD"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144782] ${
                  isFieldHighlighted('dpjp') ? 'border-green-400 bg-green-50' : 'border-gray-300'
                }`}
              />
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Section 3: Diagnosa */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <button
          onClick={() => toggleSection('diagnosa')}
          className="w-full px-8 py-6 border-b border-gray-100 bg-orange-50 hover:bg-orange-100 transition-colors flex items-center justify-between"
        >
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              Diagnosa & Kode ICD-10
            </h2>
            <p className="text-sm text-orange-800 mt-2 ml-14 font-medium">
              ⚠️ Bagian KRUSIAL! Kode yang menentukan INA-CBG dan tarif
            </p>
          </div>
          {expandedSections.diagnosa ? (
            <ChevronUp className="w-6 h-6 text-gray-600 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-6 h-6 text-gray-600 flex-shrink-0" />
          )}
        </button>
        {expandedSections.diagnosa && (
          <div className="p-8 space-y-6">
          {/* Diagnosa Utama */}
          <div className="p-6 bg-orange-50 rounded-xl border-2 border-orange-200">
            <h3 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">1</div>
              Diagnosa Utama (Primary) *
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Diagnosa
                </label>
                <input
                  type="text"
                  value={formData.diagnosisPrimary}
                  onChange={(e) => handleChange('diagnosisPrimary', e.target.value)}
                  placeholder="Contoh: Hipertensi Esensial"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                    isFieldHighlighted('diagnosisPrimary') ? 'border-green-400 bg-green-50' : 'border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode ICD-10 *
                </label>
                <input
                  type="text"
                  value={formData.icd10Primary}
                  onChange={(e) => handleChange('icd10Primary', e.target.value.toUpperCase())}
                  placeholder="Contoh: I10"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 font-mono font-bold ${
                    isFieldHighlighted('icd10Primary') ? 'border-green-400 bg-green-50' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Diagnosa Sekunder */}
          <div className="p-6 bg-yellow-50 rounded-xl border-2 border-yellow-200">
            <h3 className="font-bold text-yellow-900 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">2</div>
              Diagnosa Sekunder / Penyakit Penyerta (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Diagnosa
                </label>
                <input
                  type="text"
                  value={formData.diagnosisSecondary}
                  onChange={(e) => handleChange('diagnosisSecondary', e.target.value)}
                  placeholder="Contoh: Anemia"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                    isFieldHighlighted('diagnosisSecondary') ? 'border-green-400 bg-green-50' : 'border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode ICD-10
                </label>
                <input
                  type="text"
                  value={formData.icd10Secondary}
                  onChange={(e) => handleChange('icd10Secondary', e.target.value.toUpperCase())}
                  placeholder="Contoh: D64.9"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono ${
                    isFieldHighlighted('icd10Secondary') ? 'border-green-400 bg-green-50' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Diagnosa Penyerta / Tertiary */}
          <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200">
            <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">3</div>
              Diagnosa Penyerta Lainnya / Tertiary (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Diagnosa
                </label>
                <input
                  type="text"
                  value={formData.diagnosisTertiary}
                  onChange={(e) => handleChange('diagnosisTertiary', e.target.value)}
                  placeholder="Contoh: Pneumonia"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 ${
                    isFieldHighlighted('diagnosisTertiary') ? 'border-green-400 bg-green-50' : 'border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode ICD-10
                </label>
                <input
                  type="text"
                  value={formData.icd10Tertiary}
                  onChange={(e) => handleChange('icd10Tertiary', e.target.value.toUpperCase())}
                  placeholder="Contoh: J18.9"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 font-mono ${
                    isFieldHighlighted('icd10Tertiary') ? 'border-green-400 bg-green-50' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Section 4: Prosedur/Tindakan (ICD-9-CM) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <button
          onClick={() => toggleSection('prosedur')}
          className="w-full px-8 py-6 border-b border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
        >
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#144782] rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              Prosedur / Tindakan (ICD-9-CM)
            </h2>
            <p className="text-sm text-gray-600 mt-2 ml-14">
              Contoh: Transfusi (99.04), Rontgen (87.44), Cuci Darah (39.95)
            </p>
          </div>
          {expandedSections.prosedur ? (
            <ChevronUp className="w-6 h-6 text-gray-600 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-6 h-6 text-gray-600 flex-shrink-0" />
          )}
        </button>
        {expandedSections.prosedur && (
          <div className="p-8">
          {formData.procedures.map((procedure, index) => (
            <div key={index} className={`flex gap-4 mb-4 p-4 rounded-xl ${
              isFieldHighlighted('procedures') ? 'bg-green-50 border-2 border-green-400' : 'bg-gray-50'
            }`}>
              <input
                type="text"
                value={procedure.name}
                onChange={(e) => updateProcedure(index, 'name', e.target.value)}
                placeholder="Nama Tindakan (contoh: Transfusi Darah)"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                value={procedure.icd9cm}
                onChange={(e) => updateProcedure(index, 'icd9cm', e.target.value)}
                placeholder="ICD-9-CM (contoh: 99.04)"
                className="w-48 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
              />
              <button
                onClick={() => removeProcedure(index)}
                className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            onClick={addProcedure}
            className="w-full py-3 px-4 border-2 border-dashed border-blue-300 text-blue-700 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Tambah Tindakan
          </button>
        </div>
        )}
      </div>

      {/* Section 5: Tarif Rinci Rumah Sakit */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <button
          onClick={() => toggleSection('tarifRS')}
          className="w-full px-8 py-6 border-b border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
        >
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#144782] rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              Tarif Rinci Rumah Sakit
            </h2>
            <p className="text-sm text-gray-600 mt-2 ml-14">
              Seperti di video E-Klaim: Prosedur Bedah, Tenaga Ahli, Keperawatan, dll
            </p>
          </div>
          {expandedSections.tarifRS ? (
            <ChevronUp className="w-6 h-6 text-gray-600 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-6 h-6 text-gray-600 flex-shrink-0" />
          )}
        </button>
        {expandedSections.tarifRS && (
          <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'prosedurBedah', label: 'Prosedur Bedah' },
              { key: 'tenagaAhli', label: 'Tenaga Ahli' },
              { key: 'keperawatan', label: 'Keperawatan' },
              { key: 'penunjang', label: 'Penunjang' },
              { key: 'radiologi', label: 'Radiologi' },
              { key: 'laboratorium', label: 'Laboratorium' },
              { key: 'rehabilitasi', label: 'Rehabilitasi' },
              { key: 'kamarAkomodasi', label: 'Kamar & Akomodasi' },
              { key: 'rawatIntensif', label: 'Rawat Intensif' },
              { key: 'obat', label: 'Obat' },
              { key: 'alkes', label: 'Alat Kesehatan' },
              { key: 'bmhp', label: 'BMHP' },
              { key: 'konsultasi', label: 'Konsultasi' }
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {label}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                  <input
                    type="number"
                    value={safeValue(formData.tarifRS[key])}
                    onChange={(e) => handleTarifRSChange(key, e.target.value)}
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-green-100 rounded-xl border-2 border-green-300">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">Total Tarif RS:</span>
              <span className="text-2xl font-bold text-green-700">
                Rp {formatRupiah(calculateTotalTarifRS())}
              </span>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Section 6: GROUPER - INA-CBG */}
      <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl border-2 border-[#03974a] shadow-lg">
        <button
          onClick={() => toggleSection('grouper')}
          className="w-full px-8 py-6 border-b-2 border-[#03974a] bg-gradient-to-r from-[#144782]/5 to-[#03974a]/5 hover:from-[#144782]/10 hover:to-[#03974a]/10 transition-colors flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#144782] to-[#03974a] rounded-xl flex items-center justify-center shadow-lg">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              GROUPER - Hitung INA-CBG
            </h2>
            <p className="text-sm text-[#03974a] mt-2 font-semibold ml-16">
              ⚡ Klik tombol GROUPER untuk menghitung tarif INA-CBG berdasarkan diagnosa & tindakan
            </p>
          </div>
          {expandedSections.grouper ? (
            <ChevronUp className="w-7 h-7 text-gray-700 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-7 h-7 text-gray-700 flex-shrink-0" />
          )}
        </button>
        {expandedSections.grouper && (
          <div className="p-8">
          {!grouperResult ? (
            <div className="text-center py-12">
              <Zap className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900 mb-4">
                Klik tombol GROUPER untuk menghitung tarif
              </p>
              <button
                onClick={runGrouper}
                disabled={!formData.icd10Primary || isGrouping}
                className={`px-8 py-4 rounded-xl font-bold text-lg transition-all inline-flex items-center gap-3 ${
                  formData.icd10Primary && !isGrouping
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isGrouping ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    Menghitung...
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6" />
                    GROUPER
                  </>
                )}
              </button>
              {!formData.icd10Primary && (
                <p className="text-sm text-gray-600 mt-4">
                  Isi minimal <strong>Diagnosa Utama (ICD-10)</strong> untuk grouper
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-2xl border-2 border-purple-400 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Kode INA-CBG
                    </label>
                    <div className="text-4xl font-bold text-purple-600 font-mono bg-purple-100 p-4 rounded-xl text-center">
                      {grouperResult.code}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Tarif INA-CBG
                    </label>
                    <div className="text-4xl font-bold text-green-600 bg-green-100 p-4 rounded-xl text-center">
                      Rp {formatRupiah(grouperResult.tarif)}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <p className="text-lg text-gray-900 bg-gray-100 p-4 rounded-xl">
                    {grouperResult.description || 'N/A'}
                  </p>
                </div>
                <div className="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-xl flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-green-900">Hasil Grouper Berhasil!</p>
                    <p className="text-sm text-green-700 mt-1">
                      Berdasarkan: <strong>{formData.icd10Primary}</strong> • {formData.treatmentType} • Kelas {formData.kelasRawat}
                    </p>
                  </div>
                </div>

                <button
                  onClick={runGrouper}
                  disabled={isGrouping}
                  className="mt-6 w-full py-3 px-4 border-2 border-dashed border-purple-300 text-purple-700 rounded-xl hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <Zap className="w-5 h-5" />
                  Grouper Ulang
                </button>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
