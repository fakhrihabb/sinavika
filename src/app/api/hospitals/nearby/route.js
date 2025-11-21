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

  return {
    hasER,
    erAvailable: hasER && (hash % 2 === 0), // 50% of ER hospitals have it available now
    availableSpecialties,
    recommendedFor: serviceType,
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

    // Use Places API (New) to find nearby hospitals
    const placesUrl = 'https://places.googleapis.com/v1/places:searchNearby';

    const placesResponse = await fetch(placesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.id,places.photos,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.types',
      },
      body: JSON.stringify({
        includedTypes: ['hospital'],
        maxResultCount: 10,
        locationRestriction: {
          circle: {
            center: {
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude),
            },
            radius: 10000.0, // 10km radius
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
      return NextResponse.json(
        { error: 'No hospitals found nearby' },
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
