'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRoleModal } from '@/contexts/RoleModalContext';

export default function Navbar() {
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
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#kenapa" className="text-gray-700 hover:text-[#03974a] transition-colors">
              Kenapa SINAVIKA?
            </Link>
            <Link href="#cara-kerja" className="text-gray-700 hover:text-[#03974a] transition-colors">
              Cara Kerja
            </Link>
            <Link href="#impact" className="text-gray-700 hover:text-[#03974a] transition-colors">
              Impact
            </Link>
            <Link href="#faq" className="text-gray-700 hover:text-[#03974a] transition-colors">
              FAQ
            </Link>
            <button 
              onClick={openModal}
              className="px-6 py-2 bg-gradient-to-r from-[#03974a] to-[#144782] text-white rounded-full hover:shadow-lg transition-all duration-300"
            >
              Coba Demo
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-[#03974a] focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="#kenapa" className="block px-3 py-2 text-gray-700 hover:text-[#03974a] hover:bg-gray-50 rounded-md">
              Kenapa SINAVIKA?
            </Link>
            <Link href="#cara-kerja" className="block px-3 py-2 text-gray-700 hover:text-[#03974a] hover:bg-gray-50 rounded-md">
              Cara Kerja
            </Link>
            <Link href="#impact" className="block px-3 py-2 text-gray-700 hover:text-[#03974a] hover:bg-gray-50 rounded-md">
              Impact
            </Link>
            <Link href="#faq" className="block px-3 py-2 text-gray-700 hover:text-[#03974a] hover:bg-gray-50 rounded-md">
              FAQ
            </Link>
            <button 
              onClick={openModal}
              className="w-full mt-2 px-6 py-2 bg-gradient-to-r from-[#03974a] to-[#144782] text-white rounded-full"
            >
              Coba Demo
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
