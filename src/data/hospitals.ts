/**
 * Map pins for the hospital map page.
 *
 * `verified: false` means the coordinates are a placeholder position and not
 * the real location of the facility. Replace them with surveyed coordinates
 * and set `verified: true` once they are confirmed.
 */
export interface MapPin {
  id: string;
  name: string;
  kind: 'city' | 'hospital';
  lat: number;
  lng: number;
  verified: boolean;
  details: string[];
}

/** City center from the Wikipedia article on Urdaneta: 15°58′34″N 120°34′16″E */
export const CITY_CENTER = { lat: 15.97611, lng: 120.57111 };

export const mapPins: MapPin[] = [
  {
    id: 'city-center',
    name: 'Urdaneta City (city center)',
    kind: 'city',
    lat: CITY_CENTER.lat,
    lng: CITY_CENTER.lng,
    verified: true,
    details: ['Coordinates: 15°58′34″N 120°34′16″E (Wikipedia)'],
  },
  {
    id: 'urdaneta-sacred-heart-hospital',
    name: 'Urdaneta Sacred Heart Hospital',
    kind: 'hospital',
    // PLACEHOLDER position: not the real location.
    lat: CITY_CENTER.lat,
    lng: CITY_CENTER.lng - 0.004,
    verified: false,
    details: [
      '15 MacArthur Highway, Urdaneta City, Pangasinan 2428',
      'Telephone: (075) 203 1000',
      'Private hospital, 128 beds, emergency room open 24 hours',
    ],
  },
  {
    id: 'urdaneta-district-hospital',
    name: 'Urdaneta District Hospital',
    kind: 'hospital',
    // PLACEHOLDER position: not the real location.
    lat: CITY_CENTER.lat + 0.006,
    lng: CITY_CENTER.lng + 0.004,
    verified: false,
    details: [
      'Barangay Dilan Paurido, Urdaneta City (reported in public listings)',
      'Emergency room: (075) 632-6248',
      'Provincial government hospital',
    ],
  },
];
