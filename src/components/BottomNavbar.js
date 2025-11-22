'use client';
import { Home, CreditCard, MessageCircle, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import RoleModal from './RoleModal';

export default function BottomNavbar() {
  const pathname = usePathname();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Only show bottom navbar on /peserta routes
  if (!pathname?.startsWith('/peserta')) {
    return null;
  }

  const isHome = pathname === '/peserta';
  const isSinavika = pathname?.startsWith('/peserta/sinavika');

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-[428px] mx-auto z-40">
      <div className="flex items-center justify-around py-2 relative">
        <Link
          href="/peserta"
          className={`flex flex-col items-center gap-1 px-4 py-2 ${
            isHome ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">Home</span>
        </Link>

        <div className="flex flex-col items-center gap-1 px-4 py-2 text-gray-400 cursor-not-allowed">
          <CreditCard className="w-6 h-6" />
          <span className="text-xs font-medium">Kartu Peserta</span>
        </div>

        {/* Center SINAVIKA Button */}
        <Link
          href="/peserta/sinavika"
          className="flex flex-col items-center gap-1 -mt-8 relative"
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg p-2 transition-transform hover:scale-110 ${
            isSinavika ? 'bg-gradient-to-br from-[#03974a] to-[#144782]' : 'bg-white border-2 border-[#03974a]'
          }`}>
            <div className="relative w-full h-full">
              <Image
                src="/branding/sinavika-logo.png"
                alt="SINAVIKA"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <span className={`text-xs font-semibold mt-1 ${
            isSinavika ? 'text-[#03974a]' : 'text-gray-700'
          }`}>
            SINAVIKA
          </span>
        </Link>

        <div className="flex flex-col items-center gap-1 px-4 py-2 text-gray-400 cursor-not-allowed">
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs font-medium">FAQ</span>
        </div>

        <button
          onClick={() => setIsRoleModalOpen(true)}
          className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <User className="w-6 h-6" />
          <span className="text-xs font-medium">Ganti Role</span>
        </button>
      </div>

      {/* iOS-style home indicator */}
      <div className="flex justify-center pb-2 pointer-events-none">
        <div className="w-32 h-1 bg-gray-900 rounded-full opacity-60"></div>
      </div>

      {/* Role Modal */}
      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />
    </div>
  );
}
