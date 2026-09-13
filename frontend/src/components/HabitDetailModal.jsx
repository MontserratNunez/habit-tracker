import React from 'react';
import { X, Flame, Trophy, Calendar, Repeat, Tag } from 'lucide-react';

const formatFrequency = (frequency) => {
  if (!frequency || !frequency.type) return 'Diaria';

  const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const WEEKS_ORDINAL = {
    1: 'primer',
    2: 'segundo',
    3: 'tercer',
    4: 'cuarto',
    5: 'último',
  };

  const formatList = (items) => {
    if (!items || items.length === 0) return '';
    if (items.length === 1) return items[0];
    return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
  };

  switch (frequency.type) {
    case 'daily':
      return 'Todos los días';

    case 'weekly':
      return 'Semanal (Cualquier día de la semana)';

    case 'monthly':
      return 'Mensual (Cualquier día del mes)';

    case 'weekly_target': {
      const count = frequency.targetCount || 1;
      return `${count} ${count === 1 ? 'vez' : 'veces'} por semana`;
    }

    case 'weekly_days': {
      const days = (frequency.daysOfWeek || []).map((d) => DAYS[d]);
      return days.length > 0
        ? `Solo los ${formatList(days)}`
        : 'Días específicos de la semana';
    }

    case 'interval_weeks': {
      const weeks = frequency.intervalWeeks || 1;
      return weeks === 1 ? 'Cada semana' : `Cada ${weeks} semanas`;
    }

    case 'monthly_days': {
      const days = frequency.daysOfMonth || [];
      return days.length > 0
        ? `Los días ${formatList(days)} de cada mes`
        : 'Días específicos del mes';
    }

    case 'monthly_pattern': {
      const { weekNumber, dayOfWeek } = frequency.monthlyPattern || {};
      const weekText = WEEKS_ORDINAL[weekNumber];
      const dayText = DAYS[dayOfWeek];
      if (weekText && dayText) {
        return `El ${weekText} ${dayText} de cada mes`;
      }
      return 'Patrón mensual';
    }

    default:
      return frequency.type;
  }
};

export const HabitDetailModal = ({ habit, onClose }) => {
  if (!habit) return null;

  const isActive = habit.isActive ?? habit.status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-brand-bg-light dark:bg-brand-bg-dark border border-brand-cream/60 dark:border-gray-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6 text-brand-brown dark:text-brand-cream relative">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-brand-cream/40 dark:bg-gray-800 hover:bg-brand-cream/70 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
            isActive 
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' 
              : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {isActive ? 'Activo' : 'Inactivo'}
          </span>
          <h2 className="text-2xl font-black mt-2">{habit.title}</h2>
          {habit.description && (
            <p className="text-sm opacity-80 mt-1 font-medium">{habit.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-brand-cream/30 dark:bg-gray-800/60 border border-brand-cream/50 dark:border-gray-700/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Flame className="w-6 h-6 fill-amber-500" />
            </div>
            <div>
              <p className="text-[11px] opacity-75 font-semibold uppercase">Racha Actual</p>
              <p className="text-lg font-black">{habit.currentStreak || 0} días</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-500">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] opacity-75 font-semibold uppercase">Racha Más Larga</p>
              <p className="text-lg font-black">{habit.longestStreak || 0} días</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-xs font-medium">
          <div className="flex items-start gap-2 text-brand-brown/80 dark:text-brand-cream/80">
            <Repeat className="w-4 h-4 text-brand-blue mt-0.5 flex-shrink-0" />
            <span>
              Frecuencia: <strong>{formatFrequency(habit.frequency)}</strong>
            </span>
          </div>

          {habit.category && (
            <div className="flex items-center gap-2 text-brand-brown/80 dark:text-brand-cream/80">
              <Tag className="w-4 h-4 text-brand-blue flex-shrink-0" />
              <span>Categoría: <strong>{habit.category}</strong></span>
            </div>
          )}

          {habit.createdAt && (
            <div className="flex items-center gap-2 text-brand-brown/80 dark:text-brand-cream/80">
              <Calendar className="w-4 h-4 text-brand-blue flex-shrink-0" />
              <span>Creado el: <strong>{new Date(habit.createdAt).toLocaleDateString('es-ES')}</strong></span>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-brand-blue text-white font-bold hover:bg-brand-blue/90 transition-all shadow-md"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};