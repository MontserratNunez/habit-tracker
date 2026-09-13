import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-brand-brown mb-2">Iniciar Sesión</h2>
      <p className="text-brand-brown/70 mb-8">Ingresa tus datos para continuar tu progreso.</p>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-brand-red/10 border border-brand-red text-brand-red text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-brand-brown mb-1">Correo Electrónico</label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 rounded-lg border border-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white text-brand-brown"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-brown mb-1">Contraseña</label>
          <input
            type="password"
            required
            className="w-full px-4 py-3 rounded-lg border border-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white text-brand-brown"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold rounded-lg transition duration-200 disabled:opacity-50"
        >
          {isSubmitting ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-brand-brown/80">
        ¿No tienes una cuenta?{' '}
        <Link to="/signup" className="font-bold text-brand-blue hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
};