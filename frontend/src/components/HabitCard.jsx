import { Flame, Check } from 'lucide-react';

export const HabitCard = ({ habit, isCompleted, onCheckIn, isNavigatingPast }) => {
  const streak = habit.currentStreak || 0;

  return (
    <div
      className={`p-5 rounded-2xl border transition-all flex items-center justify-between ${
        isCompleted
          ? 'border-brand-blue/30 bg-brand-blue/5 dark:bg-brand-blue/10'
          : 'border-brand-cream/60 dark:border-gray-700 bg-brand-bg-light dark:bg-brand-bg-dark'
      }`}
    >
      <div className="space-y-1">
        <h3 className={`font-bold text-lg ${isCompleted ? 'line-through opacity-70' : ''}`}>
          {habit.title}
        </h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-brand-cream/50 dark:bg-gray-700 font-medium capitalize">
            {habit.frequency?.type || 'diario'}
          </span>

            <span className="text-brand-yellow font-bold flex items-center gap-1">
                <Flame className="w-4 h-4 fill-brand-yellow" />
                {streak} {streak === 1 ? 'día' : 'días'} de racha
            </span>
        </div>
      </div>

      <div>
        {isCompleted ? (
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-blue text-white font-bold text-sm">
                <Check className="w-4 h-4 stroke-[3]" /> Completado
            </span>
        ) : (
          <button
            onClick={() => onCheckIn(habit._id)}
            disabled={isNavigatingPast}
            className={`px-4 py-2 rounded-xl text-white font-bold text-sm transition-all shadow-md ${
              isNavigatingPast
                ? 'bg-gray-400 cursor-not-allowed opacity-60'
                : 'bg-brand-blue hover:bg-brand-blue/90 active:scale-95'
            }`}
          >
            Marcar Hecho
          </button>
        )}
      </div>
    </div>
  );
};