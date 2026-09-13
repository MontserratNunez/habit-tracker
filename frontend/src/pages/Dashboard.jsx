import { Plus, ChevronLeft, ChevronRight, Clock, XCircle, CheckCircle2 } from 'lucide-react';

import { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { HabitCard } from '../components/HabitCard';
import { HabitFormModal } from '../components/HabitFormModal';
import { WeeklyHabitsGrid } from '../components/WeeklyHabitsGrid';
import { MonthlyHabitsCalendar } from '../components/MonthlyHabitsCalendar';
import {
  getTodayHabits,
  getWeeklyHabits,
  getMonthlyHabits,
  getHabitsHistory,
  checkInHabitRequest,
} from '../api/habitApi';

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const Dashboard = () => {
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('daytrack_view') || 'today';
  });

  const [periodOffset, setPeriodOffset] = useState(0);

  const [habitsData, setHabitsData] = useState({ completed: [], pending: [] });
  const [statsData, setStatsData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewChange = (mode) => {
    setViewMode(mode);
    setPeriodOffset(0);
    localStorage.setItem('daytrack_view', mode);
  };

  const fetchHabits = useCallback(async () => {
  setLoading(true);
  try {
    if (periodOffset === 0) {
      if (viewMode === 'today') {
        const res = await getTodayHabits();
        setHabitsData(res.data || { completed: [], pending: [] });
        setSummary(res.summary);
        setStatsData(null);
      } else if (viewMode === 'week') {
        const res = await getWeeklyHabits();
        setStatsData(res);
        setSummary(res.summary);
      } else if (viewMode === 'month') {
        const res = await getMonthlyHabits();
        setStatsData(res);
        setSummary(res.summary);
      }
    } else {
      const now = new Date();
      let start = new Date();
      let end = new Date();

      if (viewMode === 'today') {
        start.setDate(now.getDate() + periodOffset);
        end.setDate(now.getDate() + periodOffset);
      } else if (viewMode === 'week') {
        const currentDay = now.getDay();
        const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
        
        start.setDate(now.getDate() - distanceToMonday + periodOffset * 7);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
      } else if (viewMode === 'month') {
        start = new Date(now.getFullYear(), now.getMonth() + periodOffset, 1);
        end = new Date(now.getFullYear(), now.getMonth() + periodOffset + 1, 0);
      }

      const startDateStr = formatLocalDate(start);
      const endDateStr = formatLocalDate(end);

      const res = await getHabitsHistory(startDateStr, endDateStr);
      setStatsData(res);
      setSummary(res.summary);

      if (viewMode === 'today') {
        const dayHabits = res.calendar?.[0]?.habits || { completed: [], pending: [], missed: [] };

        const completed = dayHabits.completed || [];
        const pending = [...(dayHabits.pending || []), ...(dayHabits.missed || [])];

        setHabitsData({ completed, pending });
      }
    }
  } catch (err) {
    console.error('Error al obtener hábitos:', err);
  } finally {
    setLoading(false);
  }
}, [viewMode, periodOffset]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleCheckIn = async (habitId) => {
    try {
      await checkInHabitRequest(habitId);
      fetchHabits();
    } catch (err) {
      console.error('Error al realizar check-in:', err);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg-light dark:bg-brand-bg-dark text-brand-brown dark:text-brand-cream transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black capitalize">
              {viewMode === 'today' && 'Hoy'}
              {viewMode === 'week' && 'Esta Semana'}
              {viewMode === 'month' && 'Este Mes'}
            </h1>
            <p className="text-sm opacity-75 font-medium">
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-brand-blue text-white font-bold hover:bg-brand-blue/90 shadow-lg transition-all flex items-center justify-center gap-2"
            >
            <Plus className="w-5 h-5" /> Nuevo Hábito
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 p-2 mb-8 rounded-2xl bg-brand-cream/30 dark:bg-gray-800 border border-brand-cream/40 dark:border-gray-700">
          <div className="flex gap-1">
            {['today', 'week', 'month'].map((mode) => (
              <button
                key={mode}
                onClick={() => handleViewChange(mode)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-brand-blue text-white shadow'
                    : 'hover:bg-brand-cream/50 dark:hover:bg-gray-700 opacity-80'
                }`}
              >
                {mode === 'today' ? 'Hoy' : mode === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
                <button
                    onClick={() => setPeriodOffset((prev) => prev - 1)}
                    className="px-3 py-1.5 rounded-lg border border-brand-cream/60 dark:border-gray-600 hover:bg-brand-cream/40 dark:hover:bg-gray-700 flex items-center gap-1"
                >
                    <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <span>{periodOffset === 0 ? 'Actual' : `Offset: ${periodOffset}`}</span>
                <button
                    onClick={() => setPeriodOffset((prev) => prev + 1)}
                    disabled={periodOffset >= 0}
                    className="px-3 py-1.5 rounded-lg border border-brand-cream/60 dark:border-gray-600 hover:bg-brand-cream/40 dark:hover:bg-gray-700 disabled:opacity-40 flex items-center gap-1"
                >
                    Siguiente <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm font-semibold animate-pulse">
            Cargando hábitos...
          </div>
        ) : (
          <>
            {viewMode === 'today' && (
            <div className="space-y-8 max-w-4xl mx-auto">
                {habitsData.pending?.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {periodOffset < 0 ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                        ) : (
                            <Clock className="w-5 h-5 text-amber-500" />
                        )}
                        {periodOffset < 0 ? 'Incompletos' : 'Pendientes'} ({habitsData.pending.length})
                    </h2>

                    <div className="grid gap-4">
                    {habitsData.pending.map((habit) => (
                        <HabitCard
                        key={habit._id}
                        habit={habit}
                        isCompleted={false}
                        onCheckIn={handleCheckIn}
                        isNavigatingPast={periodOffset < 0}
                        />
                    ))}
                    </div>
                </section>
                )}

                {habitsData.completed?.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-brand-blue">
                        <CheckCircle2 className="w-5 h-5" /> Completados ({habitsData.completed.length})
                    </h2>

                    <div className="grid gap-4">
                    {habitsData.completed.map((habit) => (
                        <HabitCard
                        key={habit._id}
                        habit={habit}
                        isCompleted={true}
                        onCheckIn={handleCheckIn}
                        isNavigatingPast={periodOffset < 0}
                        />
                    ))}
                    </div>
                </section>
                )}

                {habitsData.pending?.length === 0 && habitsData.completed?.length === 0 && (
                <div className="p-8 text-center rounded-2xl border border-dashed border-brand-cream/60 dark:border-gray-700 text-sm opacity-70">
                    No hay registros de hábitos para este día.
                </div>
                )}
            </div>
            )}

            {viewMode === 'week' && <WeeklyHabitsGrid weekData={statsData} />}
            {viewMode === 'month' && <MonthlyHabitsCalendar monthData={statsData} />}
          </>
        )}
      </main>

      <HabitFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onHabitCreated={fetchHabits}
      />
    </div>
  );
};