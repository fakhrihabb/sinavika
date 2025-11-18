import { Target, Hospital, Search, BarChart3, Link2, Zap } from 'lucide-react';

export default function WhySinavika() {
  const features = [
    {
      icon: Target,
      title: "Triage AI yang Cerdas",
      description: "Analisis keluhan dengan kuesioner dinamis dan computer vision untuk menentukan tingkat kegawatan dan rute layanan yang tepat"
    },
    {
      icon: Hospital,
      title: "Copilot Klinis & Klaim",
      description: "Bantu dokter dengan draft resume medis, rekomendasi ICD dan INA-CBG, serta pre-check kelengkapan berkas klaim"
    },
    {
      icon: Search,
      title: "Verifikasi Multimodal",
      description: "Analisis dokumen klaim dengan OCR, NLP, dan computer vision untuk deteksi anomali dan mempercepat verifikasi"
    },
    {
      icon: BarChart3,
      title: "Dashboard & Analytics",
      description: "Monitoring real-time status klaim, statistik, dan insight untuk perbaikan berkelanjutan"
    },
    {
      icon: Link2,
      title: "Ekosistem Terintegrasi",
      description: "Data mengalir dari peserta ke rumah sakit hingga BPJS dalam satu platform terpadu"
    },
    {
      icon: Zap,
      title: "Efisiensi Maksimal",
      description: "Kurangi pending klaim, fraud, dan beban IGD non-darurat secara signifikan"
    }
  ];

  return (
    <section id="kenapa" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#03974a] to-[#144782] bg-clip-text text-transparent">
            Kenapa SINAVIKA?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Solusi komprehensif untuk ekosistem JKN yang lebih efisien, akurat, dan terpercaya
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#03974a]/5 to-[#144782]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="mb-4 text-[#03974a]">
                    <Icon className="w-12 h-12" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
