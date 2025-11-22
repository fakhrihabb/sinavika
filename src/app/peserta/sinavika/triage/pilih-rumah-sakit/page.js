'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PesertaNavbar from '@/components/PesertaNavbar';
import MobileHeader from '@/components/MobileHeader';
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  Star,
  ExternalLink,
  Loader2,
  AlertCircle,
  Building2,
  Check,
  Stethoscope,
  Activity,
  CheckCircle,
} from 'lucide-react';

function HospitalSelectionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const triageId = searchParams.get('triageId');
  const serviceType = searchParams.get('serviceType');

  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState(null);

  useEffect(() => {
    if (!triageId || !serviceType) {
      setError('Data triage tidak lengkap');
      setLoading(false);
      return;
    }

    getUserLocationAndFetchHospitals();
  }, [triageId, serviceType]);

  const getUserLocationAndFetchHospitals = () => {
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung oleh browser Anda');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(location);
        await fetchNearbyHospitals(location);
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Gagal mendapatkan lokasi Anda. Pastikan Anda mengizinkan akses lokasi.');
        setLoading(false);
      }
    );
  };

  const fetchNearbyHospitals = async (location) => {
    try {
      const response = await fetch('/api/hospitals/nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          serviceType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengambil data rumah sakit');
      }

      setHospitals(data.hospitals || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInMaps = (hospital) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${hospital.location.lat},${hospital.location.lng}&query_place_id=${hospital.placeId}`;
    window.open(mapsUrl, '_blank');
  };

  const handleBookAppointment = async (hospital) => {
    setBookingInProgress(hospital.placeId);

    try {
      const response = await fetch('/api/janji-temu/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'demo-user', // TODO: Replace with actual user ID from auth
          triageId,
          hospitalName: hospital.name,
          hospitalAddress: hospital.address,
          hospitalPlaceId: hospital.placeId,
          hospitalLat: hospital.location.lat,
          hospitalLng: hospital.location.lng,
          hospitalPhotoReference: hospital.photoReference,
          hospitalPhone: hospital.phone,
          distanceKm: hospital.distance.km,
          distanceText: hospital.distance.text,
          durationText: hospital.duration.text,
          appointmentType: serviceType,
          specialty: hospital.availability.availableSpecialties?.[0] || null,
          estimatedWaitTime: hospital.availability?.estimatedWaitTime || null,
          operationalHours: hospital.availability?.operationalHours || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat janji temu');
      }

      // Redirect to Janji Temu list page
      router.push('/peserta/janji-temu?success=true');
    } catch (err) {
      alert(`Gagal membuat janji temu: ${err.message}`);
      setBookingInProgress(null);
    }
  };

  const getPhotoUrl = (photoReference) => {
    if (!photoReference) return null;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    return `https://places.googleapis.com/v1/${photoReference}/media?maxHeightPx=400&maxWidthPx=400&key=${apiKey}`;
  };

  const getServiceTypeLabel = (type) => {
    const labels = {
      'IGD': 'Instalasi Gawat Darurat (IGD)',
      'Poli Spesialis': 'Poli Spesialis',
      'Poli Umum': 'Poli Umum',
      'Faskes Tingkat Pertama': 'Fasilitas Kesehatan Tingkat Pertama',
      'Perawatan Mandiri': 'Perawatan Mandiri',
    };
    return labels[type] || type;
  };

  const getFacilityTypeLabel = (type) => {
    if (type === 'Faskes Tingkat Pertama') {
      return 'faskes';
    }
    return 'rumah sakit';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="md:block hidden">
          <PesertaNavbar />
        </div>
        <div className="md:hidden">
          <MobileHeader title="Pilih Faskes" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:pt-24">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-[#03974a] animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Mencari {serviceType === 'Faskes Tingkat Pertama' ? 'faskes' : 'rumah sakit'} terdekat...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="md:block hidden">
          <PesertaNavbar />
        </div>
        <div className="md:hidden">
          <MobileHeader title="Pilih Faskes" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:pt-24">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Terjadi Kesalahan</h3>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={() => router.push('/peserta')}
                  className="mt-4 text-red-700 underline hover:text-red-800"
                >
                  Kembali ke Beranda
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="md:block hidden">
        <PesertaNavbar />
      </div>
      <div className="md:hidden">
        <MobileHeader title={serviceType === 'Faskes Tingkat Pertama' ? 'Pilih Faskes' : 'Pilih Rumah Sakit'} />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:pt-24">
        {/* Header - Hidden on mobile, shown on desktop */}
        <div className="mb-8 hidden md:block">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {serviceType === 'Faskes Tingkat Pertama' ? 'Pilih Faskes' : 'Pilih Rumah Sakit'}
          </h1>
          <p className="text-gray-600">
            Berdasarkan hasil triage, Anda direkomendasikan untuk:{' '}
            <span className="font-semibold text-[#03974a]">
              {getServiceTypeLabel(serviceType)}
            </span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Menampilkan {hospitals.length} {serviceType === 'Faskes Tingkat Pertama' ? 'faskes' : 'rumah sakit'} terdekat
          </p>
        </div>

        {/* Mobile Summary */}
        <div className="mb-6 md:hidden bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Rekomendasi untuk Anda:</p>
          <p className="font-semibold text-[#03974a] mb-2">
            {getServiceTypeLabel(serviceType)}
          </p>
          <p className="text-xs text-gray-500">
            {hospitals.length} {serviceType === 'Faskes Tingkat Pertama' ? 'faskes' : 'rumah sakit'} terdekat
          </p>
        </div>

        {/* Hospital List */}
        <div className="space-y-6">
          {hospitals.map((hospital) => (
            <div
              key={hospital.placeId}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div className="md:flex">
                {/* Hospital Image */}
                <div className="md:w-64 h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                  {hospital.photoReference ? (
                    <img
                      src={getPhotoUrl(hospital.photoReference)}
                      alt={hospital.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-20 h-20 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Hospital Details */}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {hospital.name}
                      </h3>
                      {hospital.rating && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{hospital.rating.toFixed(1)}</span>
                          <span>({hospital.userRatingsTotal} ulasan)</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-[#03974a] font-semibold">
                        <Navigation className="w-4 h-4" />
                        <span>{hospital.distance.km} km</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{hospital.duration.text}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{hospital.address}</span>
                    </div>
                    {hospital.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{hospital.phone}</span>
                      </div>
                    )}
                    {hospital.availability?.estimatedWaitTime && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>Estimasi tunggu: <span className="font-semibold">{hospital.availability.estimatedWaitTime}</span></span>
                      </div>
                    )}
                    {hospital.availability?.operationalHours && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Jam operasional: {hospital.availability.operationalHours}</span>
                      </div>
                    )}
                  </div>

                  {/* Why This Hospital is Recommended */}
                  <div className="mb-4 p-5 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-xl">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-[#03974a]" />
                      Mengapa {serviceType === 'Faskes Tingkat Pertama' ? 'faskes' : 'rumah sakit'} ini direkomendasikan
                    </h4>
                    <ul className="space-y-2.5 text-sm">
                      {/* Service availability */}
                      {serviceType === 'IGD' && hospital.availability.hasER && (
                        <li className="flex items-start gap-2 text-gray-800">
                          <Check className="w-4 h-4 text-[#03974a] flex-shrink-0 mt-0.5" />
                          <span><span className="font-semibold">Layanan IGD tersedia</span> untuk penanganan darurat Anda</span>
                        </li>
                      )}
                      {serviceType === 'Poli Spesialis' && hospital.availability.availableSpecialties.length > 0 && (
                        <li className="flex items-start gap-2 text-gray-800">
                          <Check className="w-4 h-4 text-[#03974a] flex-shrink-0 mt-0.5" />
                          <span><span className="font-semibold">Dokter spesialis tersedia</span> ({hospital.availability.availableSpecialties.slice(0, 3).join(', ')})</span>
                        </li>
                      )}

                      {/* Distance */}
                      <li className="flex items-start gap-2 text-gray-800">
                        <Check className="w-4 h-4 text-[#03974a] flex-shrink-0 mt-0.5" />
                        <span><span className="font-semibold">Lokasi terdekat</span> dari Anda ({hospital.distance.km} km, sekitar {hospital.duration.text})</span>
                      </li>

                      {/* Rating */}
                      {hospital.rating && hospital.rating >= 4.0 && (
                        <li className="flex items-start gap-2 text-gray-800">
                          <Check className="w-4 h-4 text-[#03974a] flex-shrink-0 mt-0.5" />
                          <span><span className="font-semibold">Rating tinggi</span> dari pasien ({hospital.rating.toFixed(1)}/5.0 dari {hospital.userRatingsTotal} ulasan)</span>
                        </li>
                      )}

                      {/* Quick access */}
                      {parseFloat(hospital.distance.km) < 5 && (
                        <li className="flex items-start gap-2 text-gray-800">
                          <Check className="w-4 h-4 text-[#03974a] flex-shrink-0 mt-0.5" />
                          <span><span className="font-semibold">Akses cepat</span> dalam radius 5 km untuk penanganan segera</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleOpenInMaps(hospital)}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 border-2 border-[#03974a] text-[#03974a] rounded-xl hover:bg-green-50 transition-all font-semibold"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Buka di Maps</span>
                    </button>
                    <button
                      onClick={() => handleBookAppointment(hospital)}
                      disabled={bookingInProgress === hospital.placeId}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#03974a] to-[#027a3d] text-white rounded-xl hover:shadow-md transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bookingInProgress === hospital.placeId ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Buat Janji</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hospitals.length === 0 && !error && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Tidak ada rumah sakit ditemukan di sekitar Anda</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PilihRumahSakitPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <PesertaNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 text-[#03974a] animate-spin" />
          </div>
        </div>
      </div>
    }>
      <HospitalSelectionContent />
    </Suspense>
  );
}
