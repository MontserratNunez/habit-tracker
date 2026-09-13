import React from 'react';
import { DayHabitCard } from './DayHabitCard';

export const WeeklyHabitsGrid = ({ weekData }) => {
  const days = weekData?.days || weekData?.calendar;
  const startDate = weekData?.range?.startDate || weekData?.period?.startDate;
  const endDate = weekData?.range?.endDate || weekData?.period?.endDate;

  if (!weekData || !days) return null;

  const orderedDays = [...days].sort((a, b) => {
    const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
    const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
    return dayA - dayB;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-brand-cream">
          Resumen Semanal
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {startDate} al {endDate}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {orderedDays.map((day) => (
          <DayHabitCard key={day.date} dayData={day} />
        ))}
      </div>
    </div>
  );
};