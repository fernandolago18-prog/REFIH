import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, ShieldCheck, Activity, Globe } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

export default function Home() {
  const { user } = useAuth();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <motion.div 
        className="text-center max-w-4xl mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Plataforma Operativa
        </motion.div>

        <motion.h1 
          variants={itemVariants} 
          className="text-4xl md:text-6xl font-extrabold text-[#0F172A] tracking-tight mb-6 leading-tight"
        >
          Gestión Inteligente de <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-[#0F172A]">
            Excedentes Hospitalarios
          </span>
        </motion.h1>

        <motion.p 
          variants={itemVariants} 
          className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Sistema centralizado para la reubicación de fármacos próximos a caducar. Reduzca el impacto económico y garantice el suministro coordinado entre la red de centros hospitalarios.
        </motion.p>

        <motion.div variants={itemVariants} className="flex justify-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#0F172A] hover:bg-[#1E293B] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F172A]"
            >
              Acceder al Panel
              <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-md text-white bg-[#0F172A] hover:bg-[#1E293B] shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F172A]"
            >
              Acceso Institucional
            </Link>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="mt-20 pt-10 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center md:text-left">
              <div className="bg-gray-100 w-10 h-10 rounded flex items-center justify-center mb-4 mx-auto md:mx-0">
                <Globe className="h-5 w-5 text-gray-700" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">Cobertura Nacional</h3>
              <p className="text-sm text-gray-500">Visualice la red completa de centros y su stock disponible en tiempo real mediante geolocalización.</p>
            </div>
            <div className="text-center md:text-left">
              <div className="bg-gray-100 w-10 h-10 rounded flex items-center justify-center mb-4 mx-auto md:mx-0">
                <Activity className="h-5 w-5 text-gray-700" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">Reducción de Pérdidas</h3>
              <p className="text-sm text-gray-500">Identifique anticipadamente lotes con caducidad inferior a 3 meses e inicie protocolos de cesión.</p>
            </div>
            <div className="text-center md:text-left">
              <div className="bg-gray-100 w-10 h-10 rounded flex items-center justify-center mb-4 mx-auto md:mx-0">
                <ShieldCheck className="h-5 w-5 text-gray-700" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">Trazabilidad Absoluta</h3>
              <p className="text-sm text-gray-500">Cada transacción operada por los centros queda registrada bajo políticas de cero confianza (RLS).</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
