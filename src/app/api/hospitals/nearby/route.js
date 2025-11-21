import { NextResponse } from 'next/server';

// Dummy specialty and ER availability data
const DUMMY_SPECIALTIES = [
  'Kardiologi',
  'Penyakit Dalam',
  'Bedah',
  'Anak',
  'Ortopedi',
  'Neurologi',
  'Paru',
  'Kulit dan Kelamin',
];

function generateDummyAvailability(hospitalName, serviceType) {
  // Generate consistent dummy data based on hospital name hash
  const hash = hospitalName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const hasER = hash % 3 !== 0; // ~66% have ER
  const availableSpecialties = DUMMY_SPECIALTIES.slice(0, (hash % 5) + 3); // 3-7 specialties

  // Generate wait time estimation based on service type
  let estimatedWaitTime = '';
  let operationalHours = '';

  if (serviceType === 'IGD') {
    const waitMinutes = (hash % 4) * 15; // 0, 15, 30, or 45 minutes
    estimatedWaitTime = waitMinutes === 0 ? 'Kurang dari 15 menit' : `${waitMinutes}-${waitMinutes + 15} menit`;
    operationalHours = '24 Jam (Selalu Buka)';
  } else if (serviceType === 'Faskes Tingkat Pertama') {
    const waitMinutes = ((hash % 3) + 1) * 20; // 20, 40, or 60 minutes
    estimatedWaitTime = `${waitMinutes}-${waitMinutes + 20} menit`;
    operationalHours = 'Senin-Jumat: 08:00-16:00, Sabtu: 08:00-12:00';
  } else if (serviceType?.includes('Poli')) {
    const waitHours = (hash % 3) + 1; // 1, 2, or 3 hours
    estimatedWaitTime = `${waitHours}-${waitHours + 1} jam`;
    operationalHours = 'Senin-Sabtu: 08:00-14:00 (Pendaftaran sampai 12:00)';
  } else {
    estimatedWaitTime = '30-60 menit';
    operationalHours = 'Senin-Jumat: 08:00-16:00';
  }

  return {
    hasER,
    erAvailable: hasER && (hash % 2 === 0), // 50% of ER hospitals have it available now
    availableSpecialties,
    recommendedFor: serviceType,
    estimatedWaitTime,
    operationalHours,
  };
}

export async function POST(request) {
  try {
    const { latitude, longitude, serviceType } = await request.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    // Determine which types to search based on service type
    let includedTypes = ['hospital'];
    let searchRadius = 10000.0; // 10km default

    if (serviceType === 'Faskes Tingkat Pertama') {
      // Search for primary care facilities (Puskesmas, clinics, doctors)
      includedTypes = ['hospital', 'doctor', 'health'];
      searchRadius = 5000.0; // 5km for primary care (usually closer)
    } else if (serviceType === 'IGD') {
      // Only hospitals for emergency
      includedTypes = ['hospital'];
      searchRadius = 15000.0; // 15km for emergency
    }

    // Use Places API (New) to find nearby facilities
    const placesUrl = 'https://places.googleapis.com/v1/places:searchNearby';

    const placesResponse = await fetch(placesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.id,places.photos,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.types',
      },
      body: JSON.stringify({
        includedTypes,
        maxResultCount: 10,
        locationRestriction: {
          circle: {
            center: {
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude),
            },
            radius: searchRadius,
          },
        },
      }),
    });

    if (!placesResponse.ok) {
      const errorText = await placesResponse.text();
      console.error('Places API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch nearby hospitals', details: errorText },
        { status: placesResponse.status }
      );
    }

    const placesData = await placesResponse.json();
    const hospitals = placesData.places || [];

    if (hospitals.length === 0) {
      const facilityType = serviceType === 'Faskes Tingkat Pertama' ? 'faskes' : 'rumah sakit';
      return NextResponse.json(
        { error: `Tidak ada ${facilityType} ditemukan di sekitar lokasi Anda` },
        { status: 404 }
      );
    }

    // Build destinations for Distance Matrix API
    const destinations = hospitals
      .map((place) => `${place.location.latitude},${place.location.longitude}`)
      .join('|');

    // Get distances using Distance Matrix API
    const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${latitude},${longitude}&destinations=${destinations}&key=${apiKey}&units=metric`;

    const distanceResponse = await fetch(distanceUrl);
    const distanceData = await distanceResponse.json();

    if (distanceData.status !== 'OK') {
      console.error('Distance Matrix API error:', distanceData);
      return NextResponse.json(
        { error: 'Failed to calculate distances', details: distanceData.status },
        { status: 500 }
      );
    }

    // Combine hospital data with distance information
    const hospitalsWithDistance = hospitals.map((hospital, index) => {
      const element = distanceData.rows[0]?.elements[index];
      const distance = element?.distance;
      const duration = element?.duration;

      // Get photo reference if available
      let photoReference = null;
      if (hospital.photos && hospital.photos.length > 0) {
        photoReference = hospital.photos[0].name; // This is the photo resource name
      }

      // Generate dummy availability data
      const availability = generateDummyAvailability(hospital.displayName.text, serviceType);

      return {
        placeId: hospital.id,
        name: hospital.displayName.text,
        address: hospital.formattedAddress,
        location: {
          lat: hospital.location.latitude,
          lng: hospital.location.longitude,
        },
        photoReference,
        phone: hospital.nationalPhoneNumber || 'Tidak tersedia',
        rating: hospital.rating || null,
        userRatingsTotal: hospital.userRatingCount || 0,
        distance: {
          value: distance?.value || 0, // meters
          text: distance?.text || 'N/A',
          km: distance?.value ? (distance.value / 1000).toFixed(2) : 0,
        },
        duration: {
          value: duration?.value || 0, // seconds
          text: duration?.text || 'N/A',
        },
        // Dummy availability data
        availability,
      };
    });

    // Sort by distance (closest first)
    hospitalsWithDistance.sort((a, b) => a.distance.value - b.distance.value);

    return NextResponse.json({
      hospitals: hospitalsWithDistance,
      count: hospitalsWithDistance.length,
    });
  } catch (error) {
    console.error('Error fetching nearby hospitals:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
