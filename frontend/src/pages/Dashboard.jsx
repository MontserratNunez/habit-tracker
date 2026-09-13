import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-brand-bgLight text-brand-brown p-8">
      <header className="flex justify-between items-center mb-8 border-b border-brand-cream pb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Hola, {user?.name || 'Usuario'}</span>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm bg-brand-red text-white font-semibold rounded-lg hover:bg-brand-red/90 transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="p-6 bg-brand-cream/30 border border-brand-cream rounded-xl">
        <p className="text-lg font-medium text-brand-brown">Dashboard</p>
      </div>
    </div>
  );
};