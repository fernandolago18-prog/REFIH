import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '../lib/supabase';
import { Building2 } from 'lucide-react';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Hospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  autonomous_community: string;
}

export default function NetworkMap() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('hospitals')
          .select('id, name, latitude, longitude, autonomous_community');

        if (error) throw error;
        setHospitals(data || []);
      } catch (err) {
        console.error('Error fetching hospitals for the network map:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  // Center of Spain
  const position: [number, number] = [40.4168, -3.7038];

  return (
    <div className="relative w-full h-[500px] md:h-full min-h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-md">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="animate-pulse flex items-center space-x-2 text-blue-800 font-semibold bg-blue-50 px-4 py-2 rounded-full shadow-sm">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span className="ml-2">Cargando red de hospitales...</span>
          </div>
        </div>
      )}
      
      <MapContainer center={position} zoom={5} className="w-full h-full z-0" scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        {hospitals.filter(h => h.latitude && h.longitude).map((hospital) => (
          <Marker 
            key={hospital.id} 
            position={[hospital.latitude, hospital.longitude]}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-2">
                  <Building2 className="w-4 h-4 text-blue-800" />
                  <h3 className="font-bold text-gray-900 text-sm m-0 leading-tight">{hospital.name}</h3>
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <span className="inline-block w-2- h-2 bg-green-500 rounded-full mr-1.5" />
                  Centro adherido activo
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
