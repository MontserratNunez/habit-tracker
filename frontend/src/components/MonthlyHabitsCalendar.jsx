import React from 'react';
import { DayHabitCard } from './DayHabitCard';

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const MonthlyHabitsCalendar = ({ monthData }) => {
  if (!monthData || !monthData.calendar) return null;

  const { monthName, year, calendar } = monthData;

  const firstDay = calendar[0];
  
  const firstDayOfWeek = firstDay.dayOfWeek === 0 ? 7 : firstDay.dayOfWeek;
  const paddingDays = firstDayOfWeek - 1;

  return (
    <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold text-brand-brown dark:text-brand-cream capitalize">
            {monthName} {year}
        </h2>

        <div className="flex flex-wrap gap-2 text-xs font-medium">
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border dark:border-emerald-800/60 rounded">
            Completado
            </span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:border dark:border-amber-800/60 rounded">
            Pendiente
            </span>
            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 dark:border dark:border-rose-800/60 rounded">
            No hecho
            </span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:border dark:border-slate-700 rounded">
            Próximo
            </span>
        </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
        {DAYS_OF_WEEK.map((day) => (
            <div
            key={day}
            className="text-center font-bold text-xs sm:text-sm text-brand-brown dark:text-brand-cream/80 py-1.5 bg-brand-cream/30 dark:bg-gray-800 rounded-lg"
            >
            {day}
            </div>
        ))}

        {Array.from({ length: paddingDays }).map((_, index) => (
            <div
            key={`padding-${index}`}
            className="min-h-[120px] bg-brand-cream/10 dark:bg-gray-800/20 rounded-2xl border border-dashed border-brand-cream/40 dark:border-gray-800"
            />
        ))}

        {calendar.map((day) => (
            <div key={day.date} className="min-h-[140px]">
            <DayHabitCard dayData={day} isCompact={true} />
            </div>
        ))}
        </div>
    </div>
    );
};