import React from 'react';

const HabitBadge = ({ habit, statusType }) => {
  const styles = {
    completed:
        'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    pending:
        'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    missed:
        'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    upcoming:
        'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700',
    };

  return (
    <div
      className={`text-xs px-2 py-1 rounded border mb-1 truncate ${styles[statusType]}`}
      title={habit.title}
    >
      {habit.title}
    </div>
  );
};

export const DayHabitCard = ({ dayData, isCompact = false }) => {
  const { dayName, dayOfMonth, habits, summary } = dayData;

  const totalHabits =
    habits.completed.length +
    habits.pending.length +
    habits.missed.length +
    habits.upcoming.length;

    return (
    <div className="border border-brand-cream/60 dark:border-gray-700 rounded-2xl bg-brand-bg-light dark:bg-brand-bg-dark p-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all h-full">

        <div className="border-b border-brand-cream/40 dark:border-gray-700/60 pb-2 mb-2 flex justify-between items-center">
        <span className="font-bold text-brand-brown dark:text-brand-cream capitalize text-sm">
            {dayName}
        </span>
        <span className="text-xs font-semibold px-2 py-0.5 bg-brand-cream/40 dark:bg-gray-800 text-brand-brown dark:text-brand-cream/80 rounded-full">
            {dayOfMonth}
        </span>
        </div>

        <div className="flex-1 overflow-y-auto max-h-48 space-y-2">
        {totalHabits === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic text-center py-4">
            Sin hábitos
            </p>
        ) : (
            <>
            {habits.completed.map((habit) => (
                <HabitBadge key={habit._id} habit={habit} statusType="completed" />
            ))}

            {habits.pending.map((habit) => (
                <HabitBadge key={habit._id} habit={habit} statusType="pending" />
            ))}

            {habits.missed.map((habit) => (
                <HabitBadge key={habit._id} habit={habit} statusType="missed" />
            ))}

            {habits.upcoming.map((habit) => (
                <HabitBadge key={habit._id} habit={habit} statusType="upcoming" />
            ))}
            </>
        )}
        </div>

        {!isCompact && (
        <div className="mt-2 pt-2 border-t border-brand-cream/40 dark:border-gray-700/60 text-[10px] text-gray-500 dark:text-gray-400 flex justify-between font-medium">
            <span>
            Progreso: {summary.completedCount}/{summary.totalScheduled}
            </span>
        </div>
        )}
    </div>
    );
};