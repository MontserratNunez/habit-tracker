import { Outlet } from 'react-router-dom';
import logo from '../assets/logo.svg';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-bgLight text-brand-brown">

      <div className="md:w-1/2 bg-brand-cream p-8 md:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-brand-cream/50">
        <div>
          <div className="flex items-center gap-2.5 mb-8">
            <img src={logo} alt="Daytrack Logo" className="w-9 h-9 object-contain" />
            <span className="text-2xl font-black tracking-tight text-brand-brown">Daytrack</span>
          </div>

          <div className="max-w-md my-auto">
            <h1 className="text-3xl md:text-5xl font-extrabold text-brand-brown leading-tight mb-6">
              Construye disciplina día a día.
            </h1>
            <p className="text-lg text-brand-brown/80 mb-8 leading-relaxed">
              Sigue tus hábitos, mide tu constancia con gráficos visuales y alcanza la mejor versión de ti mismo.
            </p>

            <ul className="space-y-4 font-medium text-brand-brown">
              <li className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-brand-blue inline-block"></span>
                Seguimiento diario, semanal y mensual.
              </li>
              <li className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-brand-yellow inline-block"></span>
                Mapa de calor de consistencia visual.
              </li>
              <li className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-brand-red inline-block"></span>
                Alertas de racha e historial detallado.
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 text-sm text-brand-brown/60">
          © {new Date().getFullYear()} Daytrack. Todos los derechos reservados.
        </div>
      </div>

      <div className="md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-brand-bgLight">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};