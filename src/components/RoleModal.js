'use client';
import { useRouter } from 'next/navigation';
import { X, User, Building2, FileSearch } from 'lucide-react';

export default function RoleModal({ isOpen, onClose }) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleRoleSelect = (path) => {
    router.push(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 md:p-12 animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-500" />
        </button>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#03974a] to-[#144782] bg-clip-text text-transparent">
            Pilih Peran Demo
          </h2>
          <p className="text-gray-600 text-lg">
            Pilih peran Anda untuk mencoba fitur SINAVIKA
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Peserta JKN */}
          <button
            onClick={() => handleRoleSelect('/peserta')}
            className="group relative bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-gray-200 hover:border-[#03974a] hover:shadow-xl transition-all duration-300 text-left"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-4 bg-white rounded-full group-hover:scale-110 transition-transform duration-300">
                <User className="w-8 h-8 text-[#03974a]" strokeWidth={2} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Peserta JKN</h3>
              <p className="text-sm text-gray-600">
                Triage keluhan dan navigasi layanan
              </p>
            </div>
          </button>

          {/* Rumah Sakit */}
          <button
            onClick={() => handleRoleSelect('/rumah-sakit')}
            className="group relative bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-6 border-2 border-gray-200 hover:border-[#144782] hover:shadow-xl transition-all duration-300 text-left"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-4 bg-white rounded-full group-hover:scale-110 transition-transform duration-300">
                <Building2 className="w-8 h-8 text-[#144782]" strokeWidth={2} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Rumah Sakit</h3>
              <p className="text-sm text-gray-600">
                Copilot klinis dan manajemen klaim
              </p>
            </div>
          </button>

          {/* BPJS Kesehatan */}
          <button
            onClick={() => handleRoleSelect('/bpjs')}
            className="group relative bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-gray-200 hover:border-[#03974a] hover:shadow-xl transition-all duration-300 text-left"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-4 bg-white rounded-full group-hover:scale-110 transition-transform duration-300">
                <FileSearch className="w-8 h-8 text-[#03974a]" strokeWidth={2} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">BPJS Kesehatan</h3>
              <p className="text-sm text-gray-600">
                Verifikasi klaim dan analitik
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
