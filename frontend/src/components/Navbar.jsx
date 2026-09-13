import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import logo from '../assets/logo.svg';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-brand-cream/40 bg-brand-bg-light dark:bg-brand-bg-dark text-brand-brown dark:text-brand-cream transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2.5 font-black text-xl tracking-tight">
          <img src={logo} alt="Daytrack Logo" className="w-8 h-8 object-contain" />
          <span>Daytrack</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/habits"
            className="text-sm font-semibold hover:text-brand-blue transition-colors"
          >
            Todos los hábitos
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-brand-cream/30 dark:bg-gray-700 hover:bg-brand-cream/50 transition-colors flex items-center justify-center text-brand-brown dark:text-brand-cream"
            title="Cambiar tema"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          <span className="hidden sm:inline text-xs opacity-75 font-medium">
            {user?.name || user?.email}
          </span>

          <button
            onClick={logout}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-brand-red text-white hover:bg-brand-red/90 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
};