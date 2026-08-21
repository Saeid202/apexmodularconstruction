import { AddressSuggestion, AddressDetails } from "@/types/address";

export interface LocationServiceType {
  searchAddress(query: string): Promise<AddressSuggestion[]>;
  getAddressDetails(suggestion: AddressSuggestion): Promise<AddressDetails>;
}

// In-memory cache to avoid redundant API calls
const searchCache = new Map<string, { results: AddressSuggestion[]; ts: number }>();
const CACHE_TTL = 60_000; // 1 minute

const PHOTON_URL = "https://photon.komoot.io/api/";
const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

const PROVINCE_MAP: Record<string, string> = {
  'British Columbia': 'BC', 'B.C.': 'BC',
  'Alberta': 'AB', 'Alta.': 'AB',
  'Saskatchewan': 'SK', 'Sask.': 'SK',
  'Manitoba': 'MB', 'Man.': 'MB',
  'Ontario': 'ON', 'Ont.': 'ON',
  'Quebec': 'QC', 'Que.': 'QC', 'Québec': 'QC',
  'New Brunswick': 'NB', 'N.B.': 'NB',
  'Nova Scotia': 'NS', 'N.S.': 'NS',
  'Prince Edward Island': 'PE', 'P.E.I.': 'PE',
  'Newfoundland and Labrador': 'NL', 'Newfoundland': 'NL', 'N.L.': 'NL',
  'Yukon': 'YT', 'Yukon Territory': 'YT',
  'Northwest Territories': 'NT', 'N.W.T.': 'NT',
  'Nunavut': 'NU',
  'BC': 'BC', 'AB': 'AB', 'SK': 'SK', 'MB': 'MB', 'ON': 'ON',
  'QC': 'QC', 'NB': 'NB', 'NS': 'NS', 'PE': 'PE', 'NL': 'NL',
  'YT': 'YT', 'NT': 'NT', 'NU': 'NU',
};

function normalizeProvince(p: string): string {
  return PROVINCE_MAP[p] || p || '';
}

function formatPostalCode(raw: string): string {
  const clean = raw.replace(/\s/g, '').toUpperCase();
  if (/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(clean)) {
    return clean.slice(0, 3) + ' ' + clean.slice(3);
  }
  return raw;
}

export class LocationService implements LocationServiceType {
  private deduplicateResults(results: AddressSuggestion[]): AddressSuggestion[] {
    const seen = new Map<string, AddressSuggestion>();
    for (const result of results) {
      const parts = (result.text || '').split(', ');
      const city = parts[1] || '';
      const province = parts[2] || '';
      const street = parts[0] || '';
      const key = `${street.toLowerCase()}|${city.toLowerCase()}|${province.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.set(key, result);
      }
    }
    return Array.from(seen.values());
  }

  async searchAddress(query: string): Promise<AddressSuggestion[]> {
    if (!query || query.trim().length < 2) return [];

    const cacheKey = query.trim().toLowerCase();
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.results;

    try {
      const url = new URL(PHOTON_URL);
      url.searchParams.set('q', query.trim() + ' Canada');
      url.searchParams.set('limit', '10');
      url.searchParams.set('lang', 'en');
      url.searchParams.set('bbox', '-141,41,-52,84');

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Photon error: ${res.status}`);

      const data = await res.json();
      const features: any[] = data.features || [];
      
      let results: AddressSuggestion[] = features
        .filter((f: any) => f.properties.country_code === 'ca' || f.properties.country === 'Canada')
        .map((f: any) => {
          const p = f.properties;
          const [lng, lat] = f.geometry.coordinates;
          const parts: string[] = [];
          if (p.housenumber && p.street) parts.push(`${p.housenumber} ${p.street}`);
          else if (p.street) parts.push(p.street);
          else if (p.name) parts.push(p.name);

          const city = p.city || p.town || p.village || p.municipality || '';
          if (city) parts.push(city);

          const province = normalizeProvince(p.state || p.county || '');
          if (province) parts.push(province);

          if (p.postcode) parts.push(formatPostalCode(p.postcode));

          const text = parts.join(', ');
          return {
            id: `${lng}_${lat}`,
            text,
            place_name: `${text}, Canada`,
            center: [lng, lat] as [number, number],
            context: [],
          };
        })
        .filter(s => s.text.length > 0);

      results = this.deduplicateResults(results);
      searchCache.set(cacheKey, { results, ts: Date.now() });
      return results;
    } catch (err) {
      console.error('Address search error:', err);
      return [];
    }
  }

  async getAddressDetails(suggestion: AddressSuggestion): Promise<AddressDetails> {
    try {
      const [lng, lat] = suggestion.center;
      const url = new URL(NOMINATIM_REVERSE_URL);
      url.searchParams.set('lat', lat.toString());
      url.searchParams.set('lon', lng.toString());
      url.searchParams.set('format', 'json');
      url.searchParams.set('addressdetails', '1');

      const res = await fetch(url.toString(), {
        headers: { 'User-Agent': 'Apex Modular Construction/1.0' }
      });
      if (!res.ok) throw new Error(`Reverse geocode error: ${res.status}`);

      const data = await res.json();
      const addr = data.address || {};

      return {
        address: addr.house_number && addr.road ? `${addr.house_number} ${addr.road}` : addr.road || (suggestion.text || '').split(',')[0].trim(),
        city: (addr.city || addr.town || addr.municipality || addr.village || '').trim(),
        state: normalizeProvince(addr.state || addr.province || ''),
        zipCode: addr.postcode ? formatPostalCode(addr.postcode) : '',
        coordinates: { lat: parseFloat(data.lat), lng: parseFloat(data.lon) },
        place_name: suggestion.place_name,
      };
    } catch {
      const parts = (suggestion.text || '').split(',');
      return {
        address: parts[0]?.trim() || '',
        city: parts[1]?.trim() || '',
        state: parts[2]?.trim() || '',
        zipCode: parts[3]?.trim() || '',
        coordinates: { lat: suggestion.center[1], lng: suggestion.center[0] },
        place_name: suggestion.place_name,
      };
    }
  }
}

export const locationService = new LocationService();
