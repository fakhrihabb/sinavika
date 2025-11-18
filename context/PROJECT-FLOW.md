Jadi SIVANIKA punya 3 sisi:

1. Peserta JKN  
2. Rumah sakit  
3. BPJS Kesehatan

Lalu tiap sisi punya page dan alur masing masing.

## **1\. Struktur umum aplikasi**

1. *Landing Page*  
   * If Click Demo: Pilihan peran  
     * Peserta JKN  
     * Rumah Sakit  
     * BPJS  
   * Sekilas apa itu SINAVIKA (Bikin kayak BKN sebelumnya aja)

## **2\. Flow sisi Peserta JKN (Mobile view UInya mirip aplikasi JKN Mobile)**

1. Beranda Peserta  
   * Ringkasan status: hasil triage terakhir, rekomendasi faskes  
   * Tombol utama  
     * Mulai cek keluhan  
     * Lihat riwayat triage  
   * Tips singkat pemanfaatan JKN  
2. Halaman Triage AI  
   * Kuesioner keluhan generatif  
     * Pilih keluhan utama  
     * Pertanyaan lanjutan adaptif  
   * Upload foto atau video singkat (opsional)  
   * Tombol Kirim untuk dianalisis  
3. Hasil Triage dan Navigasi Layanan  
   * Kategori kegawatan  
     * Gawat darurat  
     * Perlu dokter hari ini  
     * Bisa dijadwalkan  
   * Rekomendasi rute layanan  
     * IGD terdekat  
     * Poli di RS  
     * Faskes tingkat pertama  
   * Estimasi waktu tunggu dan jam operasional  
   * Ringkasan klinis singkat yang akan dikirim ke RS  
   * Tombol Simpan dan Bagikan ke RS  
4. Riwayat Triage  
   * Daftar riwayat pengecekan keluhan  
   * Setiap item berisi tanggal, kesimpulan, dan rute layanan  
   * Bisa dilihat ulang saat konsultasi dengan dokter  
5. Edukasi Hak dan Panduan JKN  
   * Hak di IGD dan rawat inap  
   * Kapan sebaiknya ke IGD vs poli  
   * FAQ singkat dalam bentuk tanya jawab AI

## **3\. Flow sisi Rumah Sakit**

1. Dashboard RS  
   * Statistik ringkas  
     * Jumlah pasien masuk dari SINAVIKA hari ini  
     * Jumlah klaim siap kirim  
     * Jumlah klaim pending dan alasannya  
   * Notifikasi  
     * Pasien baru dari modul triage  
     * Klaim yang harus diperbaiki  
2. Halaman Antrian Triage Terintegrasi  
   * Daftar pasien yang datang dengan hasil triage SINAVIKA  
   * Untuk tiap pasien  
     * Nama dan identitas singkat  
     * Tingkat kegawatan yang disarankan  
     * Rekomendasi rute (IGD, poli, FKTK)  
     * Tombol Buka Ringkasan Klinis  
3. Detail Pasien dan Ringkasan Klinis  
   * Hasil kuesioner dan analisis AI  
   * Data vital yang dimasukkan tenaga kesehatan  
   * Kolom catatan dokter  
   * Tombol Kirim ke modul klaim setelah pasien selesai dirawat  
4. AI Clinical and Claim Copilot  
   * Draft resume medis yang dihasilkan AI  
   * Rekomendasi diagnosis ICD  
   * Rekomendasi kelompok INA CBG  
   * Penanda hal yang masih kurang  
     * Tidak ada hasil penunjang  
     * Tidak ada indikasi medis tertulis  
   * Dokter bisa edit lalu Setujui  
5. Pre Check Klaim  
   * Checklist kelengkapan berkas  
     * Surat rujukan  
     * Resume medis  
     * Hasil penunjang  
     * Formulir lain  
   * Claim readiness score  
   * Daftar alasan yang harus diperbaiki kalau skor rendah  
   * Tombol Kirim ke BPJS  
6. Monitoring Klaim dan Pembayaran  
   * Status klaim  
     * Diterima  
     * Pending dan alasan  
     * Ditolak  
   * Estimasi waktu pembayaran  
   * Riwayat perubahan dokumen  
7. Pengaturan RS  
   * Manajemen user dokter dan admin  
   * Pengaturan hak akses  
   * Template catatan dan resume medis yang dipakai copilot

## **4\. Flow sisi BPJS Kesehatan**

1. Dashboard BPJS  
   * Statistik nasional atau per cabang  
     * Jumlah klaim masuk  
     * Persentase klaim pending  
     * Estimasi potensi fraud yang terdeteksi  
   * Grafik klaim per RS  
   * Peringkat RS berdasarkan tingkat klaim bermasalah  
2. Antrian Verifikasi Klaim  
   * Daftar klaim yang perlu diverifikasi  
   * Untuk tiap klaim  
     * Identitas pasien  
     * Rumah sakit  
     * Nilai klaim  
     * Risk score dari modul fraud  
3. Detail Klaim dan Analisis Multimodal  
   * Resume medis terstruktur  
   * Lampiran dokumen teks dan hasil scan yang sudah dibaca OCR  
   * Highlight ketidaksesuaian  
     * Diagnosa tidak cocok dengan tindakan  
     * Hasil scan dicurigai reuse atau edit  
   * Rekomendasi verifikasi  
     * Terima  
     * Minta klarifikasi  
     * Tolak  
   * Kolom catatan verifikator untuk dikirim balik ke RS  
4. Fraud Analytics dan Case Management  
   * Daftar klaim dengan risk score tinggi  
   * Pola anomali per RS atau per jenis layanan  
   * Fitur buka kasus investigasi  
     * Gabung beberapa klaim dalam satu kasus  
     * Catatan investigasi  
     * Status kasus  
5. Dashboard Insight dan Feedback ke RS  
   * Rekap alasan klaim pending per RS  
   * Contoh  
     * Porsi salah koding  
     * Porsi dokumen tidak lengkap  
   * Tombol kirim laporan feedback ke RS  
     * Digunakan untuk pelatihan atau perbaikan internal