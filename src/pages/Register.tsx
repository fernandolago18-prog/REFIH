import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Building2, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import LocationPicker from '../components/LocationPicker';

const COMUNIDADES = [
  'Andalucía', 'Aragón', 'Asturias', 'Islas Baleares', 'Canarias', 
  'Cantabria', 'Castilla y León', 'Castilla-La Mancha', 'Cataluña', 
  'Comunidad Valenciana', 'Extremadura', 'Galicia', 'Madrid', 
  'Murcia', 'Navarra', 'País Vasco', 'La Rioja', 'Ceuta', 'Melilla'
];

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [autonomousCommunity, setAutonomousCommunity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat.toString());
    setLongitude(lng.toString());
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setError('La latitud y longitud deben ser números con formato válido (ej. 40.4168).');
      setLoading(false);
      return;
    }

    try {
      // 1. Crear el auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error('No se pudo crear la credencial de usuario.');

      // 2. Crear el perfil en hospitals
      const { error: profileError } = await supabase.from('hospitals').insert({
        id: user.id,
        name,
        latitude: lat,
        longitude: lng,
        autonomous_community: autonomousCommunity
      });

      if (profileError) {
        // En caso de fallo en el perfil, lo ideal sería borrar el user, pero Supabase 
        // no permite a usuarios comunes borrar su propia cuenta directamente sin una Edge Function.
        // Simulamos un rollback asintiendo el error.
        throw new Error(profileError.message || 'Error al guardar los datos del hospital.');
      }

      // 3. Todo OK, ir al panel
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error de registro. Verifique sus datos y vuelva a intentarlo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="max-w-xl w-full"
      >
        <div className="bg-white p-8 sm:p-10 rounded-xl shadow-lg border border-[#E2E8F0]">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-blue-700 to-[#0F172A] p-3 rounded-lg flex items-center justify-center shadow-md">
                <Network className="h-6 w-6 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              Alta Institucional
            </h2>
            <p className="mt-2 text-sm text-gray-500 font-medium uppercase tracking-wide">
              Adhesión a la red REFIH
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 border-l-4 border-red-600 text-red-800 px-4 py-3 rounded-r text-sm font-medium" 
                role="alert"
              >
                {error}
              </motion.div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Nombre Oficial del Centro <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full px-4 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F172A] sm:text-sm"
                  placeholder="Ej: Hospital Universitario Rey Juan Carlos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-4 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F172A] sm:text-sm"
                  placeholder="farmacia@hospital.es"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Contraseña Segura <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="appearance-none rounded-md relative block w-full px-4 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F172A] sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Ubicación del Centro <span className="text-red-500">*</span>
                </label>
                <div className="mb-2">
                  <LocationPicker onLocationSelect={handleLocationSelect} />
                </div>
                {(!latitude || !longitude) && (
                  <p className="text-sm text-red-500 mt-1">
                    Debe seleccionar la ubicación de su centro en el mapa.
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Comunidad Autónoma <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="appearance-none rounded-md relative block w-full px-4 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F172A] sm:text-sm bg-white"
                  value={autonomousCommunity}
                  onChange={(e) => setAutonomousCommunity(e.target.value)}
                >
                  <option value="" disabled>Seleccione una comunidad...</option>
                  {COMUNIDADES.map(comunidad => (
                    <option key={comunidad} value={comunidad}>{comunidad}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-[#0F172A] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F172A] disabled:opacity-70 transition-all shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Building2 className="h-5 w-5" />
                )}
                {loading ? 'Procesando Integración...' : 'Completar Registro Institucional'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-600 mb-3 font-medium">
              ¿Tu centro ya está registrado?{' '}
              <Link to="/login" className="font-bold text-blue-800 hover:text-blue-900 underline underline-offset-2 transition-colors">
                Regresar al Login
              </Link>
            </p>
            <p className="text-[11px] text-gray-400">
              Al registrar la entidad, usted declara ser un agente autorizado de dicho centro con competencias para la gestión de farmacia hospitalaria.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
