import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Map as MapIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-[#E2E8F0] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-[#0F172A] text-white p-2 rounded shadow-sm group-hover:bg-[#1E293B] transition-colors">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-[#0F172A] leading-none">REFIH</span>
                <span className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Sistema Nacional</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive('/dashboard')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-[#0F172A] hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Panel de Control
                </Link>
                <Link
                  to="/map"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive('/map')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-[#0F172A] hover:bg-gray-50'
                  }`}
                >
                  <MapIcon className="h-4 w-4" />
                  Mapa de Disponibilidad
                </Link>
                
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                  Salir
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center text-sm font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] px-5 py-2.5 rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F172A]"
              >
                Acceso Institucional
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
