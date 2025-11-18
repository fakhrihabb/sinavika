import { X, Check, TrendingDown, TrendingUp, Zap } from 'lucide-react';

export default function Impact() {
  const beforeItems = [
    { icon: X, text: "Penumpukan kasus non-darurat di IGD" },
    { icon: X, text: "Resume medis manual, rawan error" },
    { icon: X, text: "Banyak klaim tertunda karena salah koding" },
    { icon: X, text: "Verifikasi lambat, cek manual satu per satu" },
    { icon: X, text: "Fraud susah terdeteksi secara manual" },
    { icon: X, text: "Tidak ada insight untuk perbaikan" }
  ];

  const afterItems = [
    { icon: Check, text: "Pasien diarahkan ke layanan yang tepat" },
    { icon: Check, text: "Draft otomatis dengan AI copilot" },
    { icon: Check, text: "Pre-check otomatis sebelum pengiriman" },
    { icon: Check, text: "Verifikasi cepat dengan risk scoring" },
    { icon: Check, text: "Deteksi anomali dengan AI multimodal" },
    { icon: Check, text: "Dashboard analytics real-time" }
  ];

  return (
    <section id="impact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#03974a] to-[#144782] bg-clip-text text-transparent">
            Dampak Nyata SINAVIKA
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Lihat perbedaan sebelum dan sesudah menggunakan SINAVIKA
          </p>
        </div>

        {/* Two Cards Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {/* Before Card */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 shadow-lg border border-red-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 rounded-full">
                <X className="w-8 h-8 text-red-600" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Tanpa SINAVIKA</h3>
            </div>
            <div className="space-y-4">
              {beforeItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <Icon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <p className="text-gray-700">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* After Card */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 shadow-lg border border-green-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-[#03974a] to-[#144782] rounded-full">
                <Check className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Dengan SINAVIKA</h3>
            </div>
            <div className="space-y-4">
              {afterItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <Icon className="w-6 h-6 text-[#03974a] flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <p className="text-gray-700">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Impact Stats - 3 Separate Cards */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-[#03974a] to-emerald-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="flex justify-center mb-4">
                <TrendingDown className="w-12 h-12" strokeWidth={2} />
              </div>
              <div className="text-5xl font-bold text-center mb-3">-50%</div>
              <div className="text-center text-white/90 text-lg">Kunjungan non-darurat ke IGD</div>
            </div>
            
            <div className="bg-gradient-to-br from-[#144782] to-blue-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="flex justify-center mb-4">
                <TrendingDown className="w-12 h-12" strokeWidth={2} />
              </div>
              <div className="text-5xl font-bold text-center mb-3">-70%</div>
              <div className="text-center text-white/90 text-lg">Klaim pending karena error</div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-600 to-[#144782] rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="flex justify-center mb-4">
                <TrendingUp className="w-12 h-12" strokeWidth={2} />
              </div>
              <div className="text-5xl font-bold text-center mb-3">3x</div>
              <div className="text-center text-white/90 text-lg">Kecepatan verifikasi klaim</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
