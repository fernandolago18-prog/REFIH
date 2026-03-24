import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, MapPin } from 'lucide-react';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

function MapClickHandler({ setPosition }: { setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

export default function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Center of Spain as default
  const defaultCenter: [number, number] = [40.4168, -3.7038];

  useEffect(() => {
    if (position) {
      onLocationSelect(position[0], position[1]);
    }
  }, [position, onLocationSelect]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery
        )}&format=json&countrycodes=es&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
      if (data.length === 0) {
        alert('No se encontraron resultados para esta búsqueda.');
      }
    } catch (err) {
      console.error('Error searching location:', err);
      alert('Error al buscar la ubicación.');
    } finally {
      setIsSearching(false);
    }
  };

  const selectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setPosition([lat, lon]);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  return (
    <div className="space-y-3 w-full">
      <div className="relative">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Buscar dirección, hospital o ciudad en España..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0F172A] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F172A] disabled:opacity-50 transition-colors"
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="absolute z-[1000] mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {searchResults.map((result, idx) => (
              <div
                key={idx}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 flex items-start gap-2 border-b border-gray-50 last:border-0"
                onClick={() => selectResult(result)}
              >
                <MapPin className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <span className="block truncate whitespace-normal text-xs text-gray-700">{result.display_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative w-full h-[300px] rounded-md overflow-hidden border border-gray-300 z-0 shadow-inner bg-gray-50">
        <MapContainer
          center={position || defaultCenter}
          zoom={position ? 14 : 5}
          className="w-full h-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <MapClickHandler setPosition={setPosition} />
          {position && (
            <>
              <Marker position={position} />
              <ChangeView center={position} />
            </>
          )}
        </MapContainer>
      </div>
      
      {position ? (
        <div className="text-xs text-gray-500 flex justify-between items-center bg-green-50 px-3 py-2 rounded border border-green-100">
          <span className="font-medium text-green-800 flex items-center gap-1">
            <MapPin className="h-3 w-3" /> Ubicación guardada
          </span>
          <span className="font-mono bg-white px-2 py-1 rounded shadow-sm border border-green-200 text-green-900">
            {position[0].toFixed(5)}, {position[1].toFixed(5)}
          </span>
        </div>
      ) : (
        <div className="text-xs text-gray-500 bg-amber-50 px-3 py-2 rounded border border-amber-100 flex items-center gap-1 text-amber-800">
          <MapPin className="h-3 w-3" /> Seleccione una ubicación en el mapa o realice una búsqueda
        </div>
      )}
    </div>
  );
}
