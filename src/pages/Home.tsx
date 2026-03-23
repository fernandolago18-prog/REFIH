import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, ShieldCheck, Activity, Globe } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import NetworkMap from '../components/NetworkMap';

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
    <div className="flex flex-col items-center justify-center min-h-[85vh] pt-8 pb-16 overflow-hidden">
      <motion.div 
        className="w-full max-w-7xl mx-auto px-4 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center mb-20">
          {/* Columna Izquierda: Texto y CTA */}
          <div className="text-center lg:text-left z-10">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Plataforma Operativa Estatal
            </motion.div>

            <motion.h1 
              variants={itemVariants} 
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight mb-6 leading-tight"
            >
              Gestión Inteligente de <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-[#0F172A]">
                Excedentes Hospitalarios
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants} 
              className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              Un sistema centralizado para la reubicación de fármacos próximos a caducar. Conozca la red de centros, reduzca el impacto económico y garantice un suministro coordinado y sin desperdicios.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-[#0F172A] hover:bg-blue-900 shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F172A] transform hover:-translate-y-0.5"
                >
                  Acceder al Panel
                  <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-[#0F172A] hover:bg-blue-900 shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F172A] transform hover:-translate-y-0.5"
                >
                  Acceso Institucional
                </Link>
              )}
            </motion.div>
          </div>

          {/* Columna Derecha: Mapa Interactivo */}
          <motion.div variants={itemVariants} className="relative w-full h-[400px] lg:h-[550px] rounded-2xl shadow-2xl overflow-hidden border-[6px] border-white z-0">
            <NetworkMap />
          </motion.div>
        </div>

        {/* Cuadrícula de Características */}
        <motion.div variants={itemVariants} className="pt-12 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="bg-blue-50 group-hover:bg-blue-100 transition-colors w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                <Globe className="h-6 w-6 text-blue-800" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Cobertura Nacional</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Observe en el mapa interactivo la red completa de centros adheridos a la plataforma y acceda a su stock disponible en tiempo real.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="bg-blue-50 group-hover:bg-blue-100 transition-colors w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                <Activity className="h-6 w-6 text-blue-800" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Reducción de Pérdidas</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Identifique anticipadamente lotes con caducidad inferior a 3 meses e inicie protocolos inmediatos de cesión interhospitalaria.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="bg-blue-50 group-hover:bg-blue-100 transition-colors w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                <ShieldCheck className="h-6 w-6 text-blue-800" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Trazabilidad Absoluta</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Cada transacción queda estrictamente registrada en la base de datos bajo políticas RLS de máximo nivel de confianza y seguridad.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
