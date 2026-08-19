import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { specialty, location, availability, time } = await req.json();

    if (!specialty || !location) {
      return NextResponse.json({ error: 'Specialty and location are required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API key is not configured' }, { status: 500 });
    }

    let searchLocation = location;
    
    // Reverse geocode if location is an object with lat/lng
    if (typeof location === 'object' && location.lat && location.lng) {
      const geocodeRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${apiKey}`);
      if (geocodeRes.ok) {
        const geocodeData = await geocodeRes.json();
        if (geocodeData.results && geocodeData.results.length > 0) {
           // Find locality or administrative_area_level_2
           const addressComponents = geocodeData.results[0].address_components;
           const cityComponent = addressComponents.find((c: any) => c.types.includes('locality') || c.types.includes('administrative_area_level_2'));
           if (cityComponent) {
               searchLocation = cityComponent.long_name;
           } else {
               searchLocation = geocodeData.results[0].formatted_address;
           }
        }
      }
      // If geocoding fails, just fall back to generic Sri Lanka search or something
      if (typeof searchLocation !== 'string') searchLocation = 'Sri Lanka';
    }

    // Prepare the search query
    // E.g., "cardiologist in Colombo, Sri Lanka"
    let searchQuery = `${specialty} in ${searchLocation}`;
    if (!searchQuery.toLowerCase().includes('sri lanka')) {
      searchQuery += ', Sri Lanka';
    }

    // Append temporal filtering if availability is provided
    if (availability && availability !== 'Flexible') {
       searchQuery += ` open ${availability.toLowerCase()}`;
    }

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        // Request only the fields we need to save bandwidth and cost
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.primaryTypeDisplayName,places.types,places.location',
      },
      body: JSON.stringify({
        textQuery: searchQuery,
        languageCode: 'en',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Maps API error:', errorText);
      return NextResponse.json({ error: 'Failed to fetch doctors from Google Maps' }, { status: response.status });
    }

    const data = await response.json();

    // The API might return no places array if nothing is found
    const places = data.places || [];

    // Map the results to a cleaner format for our frontend
    const results = places.map((place: any) => ({
      id: place.id,
      name: place.displayName?.text || 'Unknown Clinic',
      specialty: place.primaryTypeDisplayName?.text || specialty,
      address: place.formattedAddress || 'Address not available',
      rating: place.rating || null,
      ratingCount: place.userRatingCount || 0,
      phone: place.nationalPhoneNumber || 'Phone not available',
      lat: place.location?.latitude || null,
      lng: place.location?.longitude || null,
    }));

    return NextResponse.json({ results, reverseGeocodedLocation: typeof location === 'object' ? searchLocation : undefined });

  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
