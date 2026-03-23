import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PackageOpen, Activity, Send, Plus, AlertCircle, Check, X, Building } from 'lucide-react';
import CreateOfferForm from '../components/CreateOfferForm';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Offer {
  id: string;
  medication_name: string;
  batch_number: string;
  expiration_date: string;
  quantity: number;
  status: string;
}

interface IncomingRequest {
  id: string;
  requested_quantity: number;
  status: string;
  requested_at: string;
  medication_offers: {
    medication_name: string;
    batch_number: string;
  };
  hospitals: {
    name: string;
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [showOfferForm, setShowOfferForm] = useState(false);
  
  const [offers, setOffers] = useState<Offer[]>([]);
  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [stats, setStats] = useState({ activeOffers: 0, activeRequests: 0, completedLoans: 0 });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: myOffers, error: offersError } = await supabase
        .from('medication_offers')
        .select('*')
        .eq('hospital_id', user.id)
        .order('created_at', { ascending: false });

      if (offersError) throw offersError;

      const { data: myRequests, error: requestsError } = await supabase
        .from('medication_exchanges')
        .select('id')
        .eq('requesting_hospital_id', user.id)
        .eq('status', 'pending');

      if (requestsError) throw requestsError;

      const { data: incomingReqs, error: incomingError } = await supabase
        .from('medication_exchanges')
        .select(`
          id, requested_quantity, status, requested_at,
          medication_offers!inner(id, medication_name, batch_number, hospital_id),
          hospitals(name)
        `)
        .eq('medication_offers.hospital_id', user.id)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (incomingError) throw incomingError;

      const offerIds = myOffers?.map(o => o.id) || [];
      let completedCount = 0;
      if (offerIds.length > 0) {
        const { count, error: countError } = await supabase
          .from('medication_exchanges')
          .select('*', { count: 'exact', head: true })
          .in('offer_id', offerIds)
          .eq('status', 'accepted'); 
        
        if (!countError && count) completedCount = count;
      }

      setOffers(myOffers || []);
      setRequests(incomingReqs as any || []);
      setStats({
        activeOffers: myOffers?.filter(o => o.status === 'available').length || 0,
        activeRequests: myRequests?.length || 0,
        completedLoans: completedCount
      });
    } catch (error: any) {
      console.error(error);
      toast.error('Fallo de conexión al sincronizar datos del centro.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleOfferCreated = () => {
    setShowOfferForm(false);
    fetchDashboardData();
  };

  const handleRequestAction = async (exchangeId: string, newStatus: string) => {
    toast.loading(`Registrando decisión...`, { id: 'req-action' });
    try {
      const { error } = await supabase
        .from('medication_exchanges')
        .update({ status: newStatus })
        .eq('id', exchangeId);
        
      if (error) throw error;
      
      toast.success(`Operación asentada en el registro de auditoría.`, { id: 'req-action' });
      fetchDashboardData();
    } catch(e: any) {
      toast.error(e.message || 'Error de procesamiento.', { id: 'req-action' });
    }
  };

  const isExpiringSoon = (dateStr: string) => {
    const expDate = new Date(dateStr);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expDate <= threeMonthsFromNow;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Panel de Control Operativo</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión centralizada de stock y comunicaciones inter-hospitalarias.</p>
        </div>
        <button 
          onClick={() => setShowOfferForm(!showOfferForm)}
          className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            showOfferForm ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500' : 'bg-[#0F172A] text-white hover:bg-[#1E293B] focus:ring-[#0F172A]'
          }`}
        >
          {showOfferForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showOfferForm ? 'Cerrar Registro' : 'Registrar Excedente'}
        </button>
      </div>

      <AnimatePresence>
        {showOfferForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-4">
              <CreateOfferForm onSuccess={handleOfferCreated} onCancel={() => setShowOfferForm(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-50 p-2 rounded text-blue-700">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Excedentes Activos</h3>
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">{loading ? '--' : stats.activeOffers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-indigo-50 p-2 rounded text-indigo-700">
              <Send className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Peticiones Enviadas</h3>
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">{loading ? '--' : stats.activeRequests}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-emerald-50 p-2 rounded text-emerald-700">
              <PackageOpen className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Cesiones Autorizadas</h3>
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">{loading ? '--' : stats.completedLoans}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide">Peticiones Entrantes</h2>
            {requests.length > 0 && (
              <span className="bg-red-50 text-red-700 border border-red-200 text-xs py-0.5 px-2.5 rounded-full font-bold">
                {requests.length} Pendientes
              </span>
            )}
          </div>
          
          <div className="p-6 flex-1 flex flex-col">
            {loading ? (
              <div className="flex-1 flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F172A]"></div>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                <Building className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-900">Bandeja Vacía</p>
                <p className="text-xs text-gray-500 mt-1">No hay requerimientos pendientes de otros centros.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map(req => (
                  <div key={req.id} className="border border-gray-200 rounded-md p-4 bg-white flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-[#0F172A] text-sm flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-gray-400" />
                          {req.hospitals.name}
                        </p>
                        <p className="text-sm text-gray-700 mt-2 border-l-2 border-primary-light pl-2">
                          Requiere <span className="font-bold underline decoration-indigo-200">{req.requested_quantity} unidades</span> de <span className="font-semibold">{req.medication_offers.medication_name}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-2 flex gap-3">
                          <span>Ref. Lote: {req.medication_offers.batch_number}</span>
                          <span>Emisión: {new Date(req.requested_at).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-3 border-t border-gray-100">
                      <button 
                        onClick={() => handleRequestAction(req.id, 'accepted')}
                        className="flex-1 flex justify-center items-center gap-1.5 bg-white border border-gray-300 text-gray-700 hover:border-emerald-600 hover:text-emerald-700 px-3 py-2 rounded text-xs font-bold transition-colors shadow-sm"
                      >
                        <Check className="w-4 h-4" /> Autorizar Cesión
                      </button>
                      <button 
                        onClick={() => handleRequestAction(req.id, 'rejected')}
                        className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-500 hover:text-red-600 hover:border-red-300 px-3 py-2 rounded text-xs font-semibold transition-colors shadow-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide">Registro Logístico (Mis Ofertas)</h2>
          </div>
          
          <div className="p-0 flex-1 flex flex-col">
            {loading ? (
              <div className="flex-1 flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F172A]"></div>
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-12 flex-1 flex flex-col items-center justify-center px-6">
                <Activity className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-900">Inventario Vacío</p>
                <p className="text-xs text-gray-500 mt-1 text-center">Registrar excedentes próximos a caducar ayuda a mitigar las pérdidas globales del sistema nacional de salud.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Identificador Cínico</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Caducidad</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dcto. Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {offers.map((offer) => (
                      <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-[#0F172A]">{offer.medication_name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">Lote: {offer.batch_number} &bull; Vol: {offer.quantity} u.</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                            {new Date(offer.expiration_date).toLocaleDateString()}
                            {isExpiringSoon(offer.expiration_date) && (
                              <span title="Alarma de Caducidad Inminente" className="flex items-center text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-xs ml-1">
                                <AlertCircle className="w-3 h-3 mr-1" /> Riesgo
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-4 font-bold rounded shadow-sm border ${
                            offer.status === 'available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                            offer.status === 'claimed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}>
                            {offer.status === 'available' ? 'LIBERADO' : offer.status === 'claimed' ? 'EN TRÁNSITO' : 'OBSOLETO'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
