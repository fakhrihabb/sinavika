'use client';
import { useState } from 'react';
import { User, Building2, FileSearch } from 'lucide-react';

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "1. Peserta JKN - Triage Awal",
      icon: User,
      description: "Peserta mengisi kuesioner keluhan dinamis dan upload foto (opsional)",
      details: [
        "Kuesioner keluhan yang adaptif",
        "Analisis visual dengan computer vision",
        "Penentuan tingkat kegawatan otomatis",
        "Rekomendasi rute layanan (IGD/Poli/FKTP)"
      ],
      color: "from-[#03974a] to-emerald-600"
    },
    {
      title: "2. Rumah Sakit - Pelayanan & Dokumentasi",
      icon: Building2,
      description: "Dokter menerima ringkasan klinis dan mendapat bantuan AI untuk dokumentasi",
      details: [
        "Terima ringkasan klinis dari triage",
        "Draft resume medis otomatis",
        "Rekomendasi kode ICD dan INA-CBG",
        "Pre-check kelengkapan berkas klaim"
      ],
      color: "from-[#144782] to-blue-600"
    },
    {
      title: "3. BPJS - Verifikasi & Analitik",
      icon: FileSearch,
      description: "Verifikator menerima klaim yang sudah dianalisis dengan AI multimodal",
      details: [
        "Ekstraksi dokumen dengan OCR & NLP",
        "Deteksi ketidaksesuaian dan anomali",
        "Scoring risiko otomatis",
        "Dashboard insight dan feedback ke RS"
      ],
      color: "from-emerald-600 to-[#144782]"
    }
  ];

  return (
    <section id="cara-kerja" className="py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#03974a] to-[#144782] bg-clip-text text-transparent">
            Bagaimana Cara Kerjanya?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Alur data yang terintegrasi dari peserta hingga verifikasi BPJS
          </p>
        </div>

        {/* Carousel Navigation */}
        <div className="flex justify-center mb-8 gap-4">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeStep === index
                  ? 'bg-gradient-to-r from-[#03974a] to-[#144782] w-12'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Carousel Content */}
        <div className="relative max-w-4xl mx-auto">
          <div className={`bg-gradient-to-br ${steps[activeStep].color} rounded-3xl p-8 md:p-12 shadow-2xl text-white transform transition-all duration-500`}>
            <div className="flex justify-center mb-6">
              {(() => {
                const Icon = steps[activeStep].icon;
                return <Icon className="w-16 h-16" strokeWidth={1.5} />;
              })()}
            </div>
            <h3 className="text-3xl font-bold mb-4 text-center">{steps[activeStep].title}</h3>
            <p className="text-lg mb-8 text-center text-white/90">{steps[activeStep].description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {steps[activeStep].details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl">✓</div>
                  <div className="text-white/95">{detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : steps.length - 1))}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-300"
          >
            <span className="text-2xl text-gray-700">‹</span>
          </button>
          <button
            onClick={() => setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : 0))}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-300"
          >
            <span className="text-2xl text-gray-700">›</span>
          </button>
        </div>

        {/* Timeline */}
        <div className="mt-16 flex justify-center items-center gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex items-center">
                <div
                  onClick={() => setActiveStep(index)}
                  className={`cursor-pointer transition-all duration-300 ${
                    activeStep === index
                      ? 'w-16 h-16 bg-gradient-to-br from-[#03974a] to-[#144782] text-white'
                      : 'w-12 h-12 bg-gray-200 text-gray-500 hover:bg-gray-300'
                  } rounded-full flex items-center justify-center font-bold shadow-lg`}
                >
                  <Icon className={activeStep === index ? 'w-8 h-8' : 'w-6 h-6'} strokeWidth={1.5} />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 md:w-16 h-1 ${index < activeStep ? 'bg-gradient-to-r from-[#03974a] to-[#144782]' : 'bg-gray-300'}`}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
