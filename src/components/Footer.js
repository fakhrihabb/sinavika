export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-[#03974a] to-[#144782] bg-clip-text text-transparent mb-4">
              SINAVIKA
            </h3>
            <p className="text-gray-400 mb-4 max-w-md">
              Platform Digital Berbasis AI untuk Ekosistem JKN. Memperbaiki alur layanan dan klaim dari hulu ke hilir.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors duration-300">
                <span className="text-xl">📧</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors duration-300">
                <span className="text-xl">💼</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors duration-300">
                <span className="text-xl">🐦</span>
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Platform</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-[#03974a] transition-colors duration-200">
                  Modul Peserta JKN
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#03974a] transition-colors duration-200">
                  Modul Rumah Sakit
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#03974a] transition-colors duration-200">
                  Modul BPJS
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#03974a] transition-colors duration-200">
                  Dokumentasi API
                </a>
              </li>
            </ul>
          </div>

          {/* Perusahaan */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Perusahaan</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-[#03974a] transition-colors duration-200">
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#03974a] transition-colors duration-200">
                  Karir
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#03974a] transition-colors duration-200">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#03974a] transition-colors duration-200">
                  Kontak
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 SINAVIKA. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-[#03974a] transition-colors duration-200">
              Kebijakan Privasi
            </a>
            <a href="#" className="text-gray-400 hover:text-[#03974a] transition-colors duration-200">
              Syarat & Ketentuan
            </a>
            <a href="#" className="text-gray-400 hover:text-[#03974a] transition-colors duration-200">
              Keamanan Data
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
