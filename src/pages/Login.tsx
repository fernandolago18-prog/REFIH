import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Network, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error de autenticación. Verifique sus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="max-w-md w-full"
      >
        <div className="bg-white p-10 rounded-xl shadow-sm border border-[#E2E8F0]">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-blue-700 to-[#0F172A] p-3 rounded-lg flex items-center justify-center shadow-sm">
                <Network className="h-6 w-6 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              Acceso REFIH
            </h2>
            <p className="mt-2 text-sm text-gray-500 font-medium uppercase tracking-wide">
              Credenciales de Centro Autorizado
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleLogin}>
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
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico Corporativo
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-4 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:border-transparent sm:text-sm transition-shadow"
                  placeholder="hospital@salud.gov.es"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Clave de Acceso
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-md relative block w-full px-4 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:border-transparent sm:text-sm transition-shadow"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-[#0F172A] hover:bg-[#1E293B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F172A] disabled:opacity-70 transition-all shadow-sm"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                {loading ? 'Verificando Identidad...' : 'Ingresar al Portal'}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center pt-2">
            <p className="text-sm text-gray-600 mb-4 font-medium block">
              ¿Tu centro aún no forma parte de la red?{' '}
              <Link to="/register" className="font-bold text-blue-800 hover:text-blue-900 underline underline-offset-2 transition-colors">
                Solicitar Alta Institucional
              </Link>
            </p>
            <p className="text-[11px] text-gray-400">
              Uso exclusivo para personal autorizado. Conexión cifrada TLS 1.3.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
