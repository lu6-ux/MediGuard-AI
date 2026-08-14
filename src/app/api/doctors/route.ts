import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { specialty, location, availability } = await req.json();

    if (!specialty || !location) {
      return NextResponse.json({ error: 'Specialty and location are required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API key is not configured' }, { status: 500 });
    }

    // Prepare the search query
    // E.g., "cardiologist in Colombo"
    const searchQuery = `${specialty} in ${location}`;

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

    return NextResponse.json({ results });

  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
