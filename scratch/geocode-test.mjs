import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const addresses = [
  '283 Spadina Rd, Toronto',
  '150 Laird Dr, Toronto',
  '100 Queen St W, Toronto'
];

async function geocode() {
  for (const address of addresses) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}&limit=1`;
    const response = await fetch(url);
    const data = await response.json();
    const feature = data.features?.[0];
    if (feature) {
      console.log(`Address: ${address}`);
      console.log(`  Mapbox Coordinates: Lon ${feature.center[0]}, Lat ${feature.center[1]}`);
      console.log(`  Name: ${feature.place_name}`);
    } else {
      console.log(`Failed to geocode: ${address}`);
    }
  }
}

geocode();
