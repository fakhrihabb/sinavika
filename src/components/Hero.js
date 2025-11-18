'use client';
import Image from 'next/image';
import { Sparkles, Shield, Zap } from 'lucide-react';
import { useRoleModal } from '@/contexts/RoleModalContext';

export default function Hero() {
  const { openModal } = useRoleModal();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-green-50 to-blue-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#03974a]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#144782]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-40 h-40 transform hover:scale-105 transition-transform duration-300">
            <Image
              src="/branding/sinavika-logo.png"
              alt="SINAVIKA Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#03974a] to-[#144782] bg-clip-text text-transparent">
          SINAVIKA
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
          Platform Digital Berbasis AI untuk Ekosistem JKN
        </p>
        
        <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
          Memperbaiki alur layanan dan klaim dari hulu ke hilir dengan Agentic AI dan Computer Vision
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={openModal}
            className="px-8 py-4 bg-gradient-to-r from-[#03974a] to-[#144782] text-white rounded-full text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Coba Demo Sekarang
          </button>
          <button className="px-8 py-4 bg-white text-gray-700 rounded-full text-lg font-semibold border-2 border-gray-200 hover:border-[#03974a] hover:text-[#03974a] transition-all duration-300">
            Pelajari Lebih Lanjut
          </button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-center mb-3">
              <Sparkles className="w-10 h-10 text-[#03974a]" />
            </div>
            <div className="text-3xl font-bold text-[#03974a] mb-2">3 Modul</div>
            <div className="text-gray-600">Peserta, Rumah Sakit, BPJS</div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-center mb-3">
              <Shield className="w-10 h-10 text-[#144782]" />
            </div>
            <div className="text-3xl font-bold text-[#144782] mb-2">AI Powered</div>
            <div className="text-gray-600">Computer Vision & NLP</div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-center mb-3">
              <Zap className="w-10 h-10 text-[#03974a]" />
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-[#03974a] to-[#144782] bg-clip-text text-transparent mb-2">End-to-End</div>
            <div className="text-gray-600">Triage hingga Verifikasi</div>
          </div>
        </div>
      </div>
    </section>
  );
}
