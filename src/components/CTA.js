'use client';
import { useRoleModal } from '@/contexts/RoleModalContext';

export default function CTA() {
  const { openModal } = useRoleModal();

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#03974a]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-[#144782]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-br from-[#03974a] to-[#144782] rounded-3xl p-12 md:p-16 shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Siap Mencoba SINAVIKA?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Bergabunglah dalam revolusi digital ekosistem JKN. Coba demo SINAVIKA sekarang dan rasakan perbedaannya.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <button 
              onClick={openModal}
              className="px-8 py-4 bg-white text-[#03974a] rounded-full text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Coba Demo Gratis
            </button>
            <button className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-full text-lg font-semibold hover:bg-white hover:text-[#03974a] transition-all duration-300">
              Jadwalkan Presentasi
            </button>
          </div>

          {/* Role Selection */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-white/80 mb-6">Atau pilih peran langsung:</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={openModal}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/30 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Peserta JKN
              </button>
              <button 
                onClick={openModal}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/30 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                Rumah Sakit
              </button>
              <button 
                onClick={openModal}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/30 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                BPJS Kesehatan
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
