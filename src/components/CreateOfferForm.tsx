import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { AlertCircle, Tag } from 'lucide-react';

interface CreateOfferFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateOfferForm({ onSuccess, onCancel }: CreateOfferFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form states
  const [medicationName, setMedicationName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [valuePerUnit, setValuePerUnit] = useState('');

  const isExpiringSoon = () => {
    if (!expirationDate) return false;
    const expDate = new Date(expirationDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expDate <= threeMonthsFromNow;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate date > today
    const expDate = new Date(expirationDate);
    if (expDate <= new Date()) {
      toast.error('La fecha de caducidad debe ser posterior a la fecha actual.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('medication_offers').insert({
        hospital_id: user.id,
        medication_name: medicationName,
        batch_number: batchNumber,
        expiration_date: expirationDate,
        quantity: parseInt(quantity, 10),
        value_per_unit: parseFloat(valuePerUnit),
        status: 'available',
      });

      if (error) throw error;

      toast.success('Lote registrado en el directorio nacional.');
      
      // Reset form
      setMedicationName('');
      setBatchNumber('');
      setExpirationDate('');
      setQuantity('');
      setValuePerUnit('');

      if (onSuccess) onSuccess();

    } catch (error: any) {
      toast.error(error.message || 'Error técnico al registrar la oferta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
        <div className="bg-gray-100 p-2 rounded text-gray-700">
          <Tag className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">Registro de Fármacos</h2>
          <p className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">Ingreso al Sistema Nacional de Excedentes</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Denominación Común Internacional (DCI)
            </label>
            <input
              type="text"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0F172A] focus:border-[#0F172A] sm:text-sm transition-colors"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              placeholder="Ej. Trastuzumab 150 mg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Identificador de Lote
            </label>
            <input
              type="text"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0F172A] focus:border-[#0F172A] sm:text-sm transition-colors"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="Ej. B3491-A"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Fecha Límite de Viabilidad
            </label>
            <input
              type="date"
              required
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0F172A] focus:border-[#0F172A] sm:text-sm transition-colors ${
                isExpiringSoon() ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-gray-300 text-gray-900'
              }`}
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
            {expirationDate && isExpiringSoon() && (
              <p className="mt-1.5 flex items-center text-xs text-amber-700 font-bold">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                Vida útil &lt; 3 meses. Marcado como urgente.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Volumen Disponible (Unidades)
            </label>
            <input
              type="number"
              required
              min="1"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0F172A] focus:border-[#0F172A] sm:text-sm transition-colors"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Valor Contable por Unidad (€)
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0F172A] focus:border-[#0F172A] sm:text-sm transition-colors"
              value={valuePerUnit}
              onChange={(e) => setValuePerUnit(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F172A] transition-colors"
            >
              Cerrar Registro
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F172A] disabled:opacity-75 transition-all"
          >
            {loading ? 'Procesando inserción...' : 'Aprobar e Inscribir Lote'}
          </button>
        </div>
      </form>
    </div>
  );
}
