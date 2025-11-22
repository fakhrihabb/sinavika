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
      router.push('/peserta/sinavika/janji-temu?success=true');
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
        <MobileHeader title="Pilih Faskes" />
        <div className="px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
              <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-10 h-10 text-[#03974a] animate-spin" />
              </div>
              <p className="text-gray-900 font-semibold mb-2">Mencari faskes terdekat...</p>
              <p className="text-gray-500 text-sm">Mohon tunggu sebentar</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader title="Pilih Faskes" />
        <div className="px-4 py-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 rounded-full p-3 mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="font-bold text-red-800 mb-2 text-lg">Terjadi Kesalahan</h3>
              <p className="text-red-700 text-sm mb-6">{error}</p>
              <button
                onClick={() => router.push('/peserta')}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-xl font-semibold active:scale-[0.98] transition-all"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title={serviceType === 'Faskes Tingkat Pertama' ? 'Pilih Faskes' : 'Pilih Rumah Sakit'} />
      
      {/* Mobile-Centric Container */}
      <div className="px-4 py-4">
        {/* Summary Card */}
        <div className="mb-4 bg-gradient-to-br from-[#03974a] to-[#027a3d] rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 rounded-xl p-2.5">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-white/80 mb-1">Rekomendasi untuk Anda</p>
              <p className="font-bold text-base mb-2">
                {getServiceTypeLabel(serviceType)}
              </p>
              <div className="flex items-center gap-2 text-xs text-white/90">
                <MapPin className="w-3.5 h-3.5" />
                <span>{hospitals.length} {serviceType === 'Faskes Tingkat Pertama' ? 'faskes' : 'rumah sakit'} terdekat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hospital Cards */}
        <div className="space-y-3">
          {hospitals.map((hospital) => (
            <div
              key={hospital.placeId}
              className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
            >
              {/* Hospital Image - Mobile First */}
              <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                {hospital.photoReference ? (
                  <img
                    src={getPhotoUrl(hospital.photoReference)}
                    alt={hospital.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                {/* Distance Badge */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
                  <div className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#03974a]" />
                    <span className="text-sm font-bold text-[#03974a]">{hospital.distance.km} km</span>
                  </div>
                </div>
                {/* Rating Badge */}
                {hospital.rating && (
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-lg">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold text-gray-900">{hospital.rating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Hospital Info */}
              <div className="p-4">
                {/* Header */}
                <div className="mb-3">
                  <h3 className="text-base font-bold text-gray-900 mb-1.5 leading-tight">
                    {hospital.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    {hospital.rating && (
                      <span className="flex items-center gap-1">
                        {hospital.userRatingsTotal} ulasan
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>{hospital.duration.text}</span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="mb-3 pb-3 border-b border-gray-100">
                  <div className="flex items-start gap-2 text-xs text-gray-600">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gray-400" />
                    <span className="line-clamp-2">{hospital.address}</span>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {hospital.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg px-2.5 py-2">
                      <Phone className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                      <span className="truncate">{hospital.phone}</span>
                    </div>
                  )}
                  {hospital.availability?.estimatedWaitTime && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg px-2.5 py-2">
                      <Clock className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                      <span className="truncate">{hospital.availability.estimatedWaitTime}</span>
                    </div>
                  )}
                </div>

                {/* Why Recommended - Compact */}
                <div className="mb-4 p-3 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-[#03974a]" />
                    Direkomendasikan karena
                  </h4>
                  <ul className="space-y-1.5">
                    {/* Service availability */}
                    {serviceType === 'IGD' && hospital.availability.hasER && (
                      <li className="flex items-start gap-1.5 text-xs text-gray-700">
                        <Check className="w-3 h-3 text-[#03974a] flex-shrink-0 mt-0.5" />
                        <span>Layanan IGD tersedia</span>
                      </li>
                    )}
                    {serviceType === 'Poli Spesialis' && hospital.availability.availableSpecialties.length > 0 && (
                      <li className="flex items-start gap-1.5 text-xs text-gray-700">
                        <Check className="w-3 h-3 text-[#03974a] flex-shrink-0 mt-0.5" />
                        <span>Dokter spesialis tersedia</span>
                      </li>
                    )}

                    {/* Distance */}
                    <li className="flex items-start gap-1.5 text-xs text-gray-700">
                      <Check className="w-3 h-3 text-[#03974a] flex-shrink-0 mt-0.5" />
                      <span>Lokasi terdekat ({hospital.distance.km} km)</span>
                    </li>

                    {/* Rating */}
                    {hospital.rating && hospital.rating >= 4.0 && (
                      <li className="flex items-start gap-1.5 text-xs text-gray-700">
                        <Check className="w-3 h-3 text-[#03974a] flex-shrink-0 mt-0.5" />
                        <span>Rating {hospital.rating.toFixed(1)}/5.0 dari pasien</span>
                      </li>
                    )}

                    {/* Quick access */}
                    {parseFloat(hospital.distance.km) < 5 && (
                      <li className="flex items-start gap-1.5 text-xs text-gray-700">
                        <Check className="w-3 h-3 text-[#03974a] flex-shrink-0 mt-0.5" />
                        <span>Akses cepat dalam radius 5 km</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Action Buttons - Mobile Touch Friendly */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleBookAppointment(hospital)}
                    disabled={bookingInProgress === hospital.placeId}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-[#03974a] to-[#027a3d] text-white rounded-xl font-bold text-sm shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingInProgress === hospital.placeId ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Buat Janji Temu</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenInMaps(hospital)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#03974a] text-[#03974a] rounded-xl font-semibold text-sm active:scale-[0.98] transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Lihat di Google Maps</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {hospitals.length === 0 && !error && (
          <div className="text-center py-16">
            <Building2 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-sm">Tidak ada {serviceType === 'Faskes Tingkat Pertama' ? 'faskes' : 'rumah sakit'} ditemukan</p>
            <p className="text-gray-400 text-xs mt-1">Coba perluas radius pencarian</p>
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
