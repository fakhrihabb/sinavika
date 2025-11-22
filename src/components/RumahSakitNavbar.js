'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRoleModal } from '@/contexts/RoleModalContext';
import { LayoutDashboard, Users, FileCheck, Bell, Menu, X } from 'lucide-react';

export default function RumahSakitNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { openModal } = useRoleModal();

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(
          '/api/notifications?userId=rumah-sakit-demo&recipientType=rumah_sakit&countOnly=true'
        );
        const data = await response.json();
        setUnreadCount(data.count || 0);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

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
            <span className="ml-3 px-3 py-1 bg-blue-50 text-[#144782] text-sm font-semibold rounded-full">
              Rumah Sakit
            </span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/rumah-sakit" className="flex items-center gap-2 text-gray-700 hover:text-[#144782] transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link href="/rumah-sakit/antrian" className="flex items-center gap-2 text-gray-700 hover:text-[#144782] transition-colors">
              <Users className="w-4 h-4" />
              <span>Antrian</span>
            </Link>
            <Link href="/rumah-sakit/pre-check" className="flex items-center gap-2 text-gray-700 hover:text-[#144782] transition-colors">
              <FileCheck className="w-4 h-4" />
              <span>Klaim</span>
            </Link>
            <Link href="/rumah-sakit/notifikasi" className="flex items-center gap-2 text-gray-700 hover:text-[#144782] transition-colors relative">
              <div className="relative">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span>Notifikasi</span>
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
              className="text-gray-700 hover:text-[#144782] focus:outline-none"
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
            <Link href="/rumah-sakit" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-[#144782] hover:bg-gray-50 rounded-md">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link href="/rumah-sakit/antrian" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-[#144782] hover:bg-gray-50 rounded-md">
              <Users className="w-4 h-4" />
              <span>Antrian</span>
            </Link>
            <Link href="/rumah-sakit/pre-check" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-[#144782] hover:bg-gray-50 rounded-md">
              <FileCheck className="w-4 h-4" />
              <span>Klaim</span>
            </Link>
            <Link href="/rumah-sakit/notifikasi" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-[#144782] hover:bg-gray-50 rounded-md relative">
              <div className="relative">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span>Notifikasi</span>
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
