'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRoleModal } from '@/contexts/RoleModalContext';
import { User, FileText, BookOpen, Menu, X, CalendarCheck } from 'lucide-react';

export default function PesertaNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { openModal } = useRoleModal();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image
                  src="/branding/sinavika-logo.png"
                  alt="SINAVIKA Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#03974a] to-[#144782] bg-clip-text text-transparent">
                SINAVIKA
              </span>
            </Link>
            <span className="ml-3 px-3 py-1 bg-green-50 text-[#03974a] text-sm font-semibold rounded-full">
              Peserta
            </span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/peserta" className="flex items-center gap-2 text-gray-700 hover:text-[#03974a] transition-colors">
              <User className="w-4 h-4" />
              <span>Beranda</span>
            </Link>
            <Link href="/peserta/sinavika/triage" className="flex items-center gap-2 text-gray-700 hover:text-[#03974a] transition-colors">
              <FileText className="w-4 h-4" />
              <span>Cek Keluhan</span>
            </Link>
            <Link href="/peserta/sinavika/riwayat" className="flex items-center gap-2 text-gray-700 hover:text-[#03974a] transition-colors">
              <BookOpen className="w-4 h-4" />
              <span>Riwayat Keluhan</span>
            </Link>
            <Link href="/peserta/sinavika/janji-temu" className="flex items-center gap-2 text-gray-700 hover:text-[#03974a] transition-colors">
              <CalendarCheck className="w-4 h-4" />
              <span>Janji Temu</span>
            </Link>
            <button
              onClick={openModal}
              className="px-4 py-2 bg-gradient-to-r from-[#03974a] to-[#144782] text-white rounded-full hover:shadow-lg transition-all duration-300 text-sm"
            >
              Ganti Peran
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-[#03974a] focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/peserta" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-[#03974a] hover:bg-gray-50 rounded-md">
              <User className="w-4 h-4" />
              <span>Beranda</span>
            </Link>
            <Link href="/peserta/sinavika/triage" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-[#03974a] hover:bg-gray-50 rounded-md">
              <FileText className="w-4 h-4" />
              <span>Cek Keluhan</span>
            </Link>
            <Link href="/peserta/sinavika/riwayat" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-[#03974a] hover:bg-gray-50 rounded-md">
              <BookOpen className="w-4 h-4" />
              <span>Riwayat Keluhan</span>
            </Link>
            <Link href="/peserta/sinavika/janji-temu" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-[#03974a] hover:bg-gray-50 rounded-md">
              <CalendarCheck className="w-4 h-4" />
              <span>Janji Temu</span>
            </Link>
            <button
              onClick={openModal}
              className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-[#03974a] to-[#144782] text-white rounded-full text-sm"
            >
              Ganti Peran
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
