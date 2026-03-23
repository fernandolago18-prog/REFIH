import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Building2, Package, Send } from 'lucide-react';

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
}

interface Offer {
  id: string;
  medication_name: string;
  quantity: number;
  expiration_date: string;
  hospitals: Hospital; 
}

interface GroupedHospital {
  hospital: Hospital;
  offers: Offer[];
}

export default function MapView() {
  const { user } = useAuth();
  const [groupedData, setGroupedData] = useState<GroupedHospital[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medication_offers')
        .select(`
          id, medication_name, quantity, expiration_date,
          hospitals (
            id, name, latitude, longitude
          )
        `)
        .eq('status', 'available')
        .neq('hospital_id', user?.id || '');

      if (error) throw error;

      const grouped = (data as any[]).reduce((acc: Record<string, GroupedHospital>, curr: Offer) => {
        const hId = curr.hospitals.id;
        if (!curr.hospitals.latitude || !curr.hospitals.longitude) return acc;

        if (!acc[hId]) {
          acc[hId] = {
            hospital: curr.hospitals,
            offers: [],
          };
        }
        acc[hId].offers.push(curr);
        return acc;
      }, {});

      setGroupedData(Object.values(grouped));
    } catch (err: any) {
      console.error(err);
      toast.error('Excepción de red al sincronizar cartografía.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [user]);

  const requestLoan = async (offerId: string, quantity: number) => {
    if (!user) return;
    toast.loading('Iniciando protocolo de cesión...', { id: 'request-loan' });
    try {
      const { error } = await supabase
        .from('medication_exchanges')
        .insert({
          offer_id: offerId,
          requesting_hospital_id: user.id,
          requested_quantity: quantity,
          status: 'pending'
        });

      if (error) throw error;
      
      toast.success('Petición formal registrada y notificada al centro emisor.', { id: 'request-loan' });
      fetchOffers();
    } catch (err: any) {
      toast.error(err.message || 'Fallo en la emisión de la solicitud', { id: 'request-loan' });
    }
  };

  const position: [number, number] = [40.4168, -3.7038];

  return (
    <div className="flex flex-col h-[82vh]">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Visor Cartográfico de Excedentes</h1>
          <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wide">Red Nacional Asistencial</p>
        </div>
        {loading && (
          <div className="mt-2 sm:mt-0 flex items-center text-xs px-3 py-1.5 bg-blue-50 text-blue-800 rounded shadow-sm border border-blue-100 font-semibold animate-pulse">
            Sincronizando Nodos Cartográficos...
          </div>
        )}
      </div>
      
      <div className="flex-1 rounded-md overflow-hidden border border-gray-300 shadow-sm relative z-0">
        <MapContainer center={position} zoom={6} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          
          {groupedData.map((group) => (
            <Marker 
              key={group.hospital.id} 
              position={[group.hospital.latitude, group.hospital.longitude]}
            >
              <Popup className="w-80 custom-popup">
                <div className="p-0.5">
                  <div className="flex items-center gap-2 mb-3 border-b border-gray-200 pb-2">
                    <Building2 className="w-4 h-4 text-[#0F172A]" />
                    <h3 className="font-bold text-[#0F172A] m-0 text-sm">{group.hospital.name}</h3>
                  </div>
                  
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {group.offers.map(offer => (
                      <div key={offer.id} className="bg-gray-50 p-2.5 rounded border border-gray-200 shadow-sm">
                        <div className="flex items-start justify-between mb-1.5">
                          <span className="font-bold text-[#0F172A] text-xs leading-tight">{offer.medication_name}</span>
                          <span className="bg-[#E2E8F0] text-[#0F172A] text-[10px] px-2 py-0.5 rounded font-bold ml-2">
                            x{offer.quantity} u.
                          </span>
                        </div>
                        <div className="flex items-center text-[11px] text-gray-600 mb-2 font-medium">
                          <Package className="w-3 h-3 mr-1" />
                          Cad.: {new Date(offer.expiration_date).toLocaleDateString()}
                        </div>
                        <button
                          onClick={() => requestLoan(offer.id, offer.quantity)}
                          className="w-full mt-1 flex items-center justify-center gap-1.5 bg-white border border-[#0F172A] text-[#0F172A] hover:bg-[#0F172A] hover:text-white px-3 py-1.5 rounded transition-colors text-[11px] font-bold shadow-sm uppercase tracking-wider"
                        >
                          <Send className="w-3 h-3" />
                          Iniciar Cese
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
