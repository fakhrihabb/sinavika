'use client';
import {
  Smartphone, MapPin, Building2, UserPlus,
  UserCircle, Settings, Stethoscope,
  Navigation, Wifi, Battery
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRoleModal } from '@/contexts/RoleModalContext';

export default function MobileJKNPage() {
  const { openModal } = useRoleModal();

  // Menu items data
  const menuItems = [
    {
      id: 1,
      title: 'Info Program JKN',
      icon: Smartphone,
      bgColor: 'bg-teal-100'
    },
    {
      id: 2,
      title: 'Info Lokasi Faskes',
      icon: MapPin,
      bgColor: 'bg-teal-100'
    },
    {
      id: 3,
      title: 'Info Ketersediaan Tempat Tidur',
      icon: Building2,
      bgColor: 'bg-teal-100'
    },
    {
      id: 4,
      title: 'Pendaftaran Peserta Baru',
      icon: UserPlus,
      bgColor: 'bg-teal-100'
    },
    {
      id: 5,
      title: 'Info Peserta',
      icon: UserCircle,
      bgColor: 'bg-blue-100'
    },
    {
      id: 6,
      title: 'Pendaftaran Pelayanan (Antrean)',
      icon: Settings,
      bgColor: 'bg-teal-100'
    },
    {
      id: 7,
      title: 'Konsultasi Dokter',
      icon: Stethoscope,
      bgColor: 'bg-teal-100'
    },
    {
      id: 8,
      title: 'SINAVIKA',
      icon: null,
      bgColor: 'bg-teal-100',
      isLogo: true
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-[#03974a] to-[#144782] pt-3 pb-20">
        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 text-white text-sm">
          <div className="flex items-center gap-1">
            <span className="font-semibold">09.05</span>
            <Navigation className="w-3 h-3" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <div className="w-1 h-3 bg-white"></div>
              <div className="w-1 h-3 bg-white"></div>
              <div className="w-1 h-3 bg-white"></div>
              <div className="w-1 h-3 bg-white opacity-50"></div>
            </div>
            <Wifi className="w-3 h-3" />
            <Battery className="w-3 h-3" />
          </div>
        </div>

        {/* Mobile JKN Logo */}
        <div className="flex items-center justify-between px-4 py-3">
          <Image
            src="/mobile-jkn/mobile-jkn-logo.png"
            alt="Mobile JKN"
            width={80}
            height={50}
            className="object-contain"
          />
          <button
            onClick={openModal}
            className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all text-xs font-medium border border-white/30"
          >
            Ganti Role
          </button>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 -mb-1">
          <svg viewBox="0 0 1440 120" className="w-full block">
            <path
              fill="#ffffff"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Greeting */}
      <div className="px-4 -mt-12 relative z-10 mb-6">
        <h1 className="text-2xl font-bold text-white">
          Hi, Budi
        </h1>
      </div>

      {/* Menu Grid */}
      <div className="px-4 mb-8">
        <div className="grid grid-cols-4 gap-4">
          {menuItems.map((item) => {
            // Only show content for SINAVIKA (id 8)
            const isSinavika = item.id === 8;

            if (isSinavika) {
              return (
                <Link
                  key={item.id}
                  href="/peserta/sinavika"
                  className="flex flex-col items-center gap-2 group relative"
                >
                  <div className="relative">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md p-2 border-2 border-[#03974a]">
                      <Image
                        src="/branding/sinavika-logo.png"
                        alt="SINAVIKA"
                        width={56}
                        height={56}
                        className="object-contain"
                      />
                    </div>
                    {/* NEW Badge */}
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                      NEW
                    </div>
                  </div>
                  <span className="text-xs text-center text-gray-900 leading-tight px-1 font-semibold">
                    {item.title}
                  </span>
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                className="flex flex-col items-center gap-2 group cursor-default"
              >
                <div className="w-16 h-16 bg-white border-2 border-[#03974a] rounded-full group-hover:scale-110 transition-transform" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Carousel Section */}
      <div className="px-4 mb-6">
        <div className="relative rounded-3xl overflow-hidden shadow-lg">
          <Image
            src="/mobile-jkn/jkn-banner.png"
            alt="BPJS Kesehatan Banner"
            width={600}
            height={300}
            className="w-full h-48 object-cover"
          />
          {/* Carousel dots */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {[0, 1, 2, 3, 4, 5].map((dot, idx) => (
              <div
                key={dot}
                className={`w-2 h-2 rounded-full ${
                  idx === 0 ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
