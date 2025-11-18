'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRoleModal } from '@/contexts/RoleModalContext';
import { LayoutDashboard, FileSearch, TrendingUp, AlertTriangle, Menu, X } from 'lucide-react';

export default function BPJSNavbar() {
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
              BPJS Kesehatan
            </span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/bpjs" className="flex items-center gap-2 text-gray-700 hover:text-[#03974a] transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link href="/bpjs/verifikasi" className="flex items-center gap-2 text-gray-700 hover:text-[#03974a] transition-colors">
              <FileSearch className="w-4 h-4" />
              <span>Verifikasi Klaim</span>
            </Link>
            <Link href="/bpjs/fraud" className="flex items-center gap-2 text-gray-700 hover:text-[#03974a] transition-colors">
              <AlertTriangle className="w-4 h-4" />
              <span>Fraud Analytics</span>
            </Link>
            <Link href="/bpjs/insight" className="flex items-center gap-2 text-gray-700 hover:text-[#03974a] transition-colors">
              <TrendingUp className="w-4 h-4" />
              <span>Insight & Feedback</span>
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
            <Link href="/bpjs" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-[#03974a] hover:bg-gray-50 rounded-md">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link href="/bpjs/verifikasi" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-[#03974a] hover:bg-gray-50 rounded-md">
              <FileSearch className="w-4 h-4" />
              <span>Verifikasi Klaim</span>
            </Link>
            <Link href="/bpjs/fraud" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-[#03974a] hover:bg-gray-50 rounded-md">
              <AlertTriangle className="w-4 h-4" />
              <span>Fraud Analytics</span>
            </Link>
            <Link href="/bpjs/insight" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-[#03974a] hover:bg-gray-50 rounded-md">
              <TrendingUp className="w-4 h-4" />
              <span>Insight & Feedback</span>
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
