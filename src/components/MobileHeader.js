'use client';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function MobileHeader({ title, showBackButton = true }) {
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-[#03974a] to-[#144782] shadow-md">
      <div className="relative flex items-center justify-center px-4 py-4">
        {/* Liquid Glass Back Button - Left Edge */}
        {showBackButton && (
          <Link
            href="/peserta/sinavika"
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 active:bg-white/40 transition-all shadow-lg"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
          </Link>
        )}

        {/* Centered Title */}
        <h1 className="text-xl font-bold text-white text-center">
          {title}
        </h1>
      </div>
    </div>
  );
}
