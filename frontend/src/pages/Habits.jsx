import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { HabitDetailModal } from '../components/HabitDetailModal';
import { HabitFormModal } from '../components/HabitFormModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { 
  getAllHabits, 
  toggleHabitStatusRequest, 
  deleteHabitRequest 
} from '../api/habitApi';
import { 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square, 
  Search 
} from 'lucide-react';

export const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    variant: 'danger',
    action: null,
    isLoading: false,
  });

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const res = await getAllHabits();
      setHabits(res.data || res || []);
    } catch (err) {
      console.error('Error al obtener hábitos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const closeConfirmModal = () => {
    setConfirmConfig((prev) => ({ ...prev, isOpen: false, isLoading: false }));
  };

  const handleToggleActive = (e, habit) => {
    e.stopPropagation();
    const willActivate = !habit.status;

    setConfirmConfig({
      isOpen: true,
      title: willActivate ? '¿Activar hábito?' : '¿Desactivar hábito?',
      message: `¿Estás seguro de que deseas ${willActivate ? 'activar' : 'desactivar'} el hábito "${habit.title}"?`,
      confirmText: willActivate ? 'Activar' : 'Desactivar',
      variant: willActivate ? 'primary' : 'warning',
      action: () => executeToggleActive(habit._id),
      isLoading: false,
    });
  };

  const executeToggleActive = async (habitId) => {
    setConfirmConfig((prev) => ({ ...prev, isLoading: true }));
    try {
      await toggleHabitStatusRequest(habitId);
      setHabits((prev) =>
        prev.map((h) => (h._id === habitId ? { ...h, status: !h.status } : h))
      );
    } catch (err) {
      console.error('Error al cambiar el estado del hábito:', err);
    } finally {
      closeConfirmModal();
    }
  };

  const handleDelete = (e, habit) => {
    e.stopPropagation();

    setConfirmConfig({
      isOpen: true,
      title: '¿Eliminar hábito?',
      message: `¿Estás seguro de que deseas eliminar el hábito "${habit.title}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      variant: 'danger',
      action: () => executeDelete(habit._id),
      isLoading: false,
    });
  };

  const executeDelete = async (habitId) => {
    setConfirmConfig((prev) => ({ ...prev, isLoading: true }));
    try {
      await deleteHabitRequest(habitId);
      setHabits((prev) => prev.filter((h) => h._id !== habitId));
    } catch (err) {
      console.error('Error al eliminar el hábito:', err);
    } finally {
      closeConfirmModal();
    }
  };

  const filteredHabits = habits.filter((h) =>
    h.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-bg-light dark:bg-brand-bg-dark text-brand-brown dark:text-brand-cream transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">Todos los Hábitos</h1>
            <p className="text-sm opacity-75 font-medium mt-0.5">
              Administra, activa o desactiva la frecuencia de tus hábitos registrados.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-brand-blue text-white font-bold hover:bg-brand-blue/90 shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Nuevo Hábito
          </button>
        </div>

        <div className="relative max-w-md">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            placeholder="Buscar hábito..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-brand-cream/30 dark:bg-gray-800 border border-brand-cream/60 dark:border-gray-700 text-sm focus:outline-none focus:border-brand-blue font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm font-semibold animate-pulse">
            Cargando hábitos...
          </div>
        ) : filteredHabits.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-brand-cream/60 dark:border-gray-700 text-sm opacity-70">
            No se encontraron hábitos registrados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHabits.map((habit) => (
              <div
                key={habit._id}
                onClick={() => setSelectedHabit(habit)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 hover:shadow-md ${
                  habit.status
                    ? 'bg-brand-bg-light dark:bg-brand-bg-dark border-brand-cream/60 dark:border-gray-700'
                    : 'bg-gray-100/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 opacity-60'
                }`}
              >
                <h3 className="font-bold text-lg leading-snug line-clamp-2 flex-1">
                  {habit.title}
                </h3>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => handleToggleActive(e, habit)}
                    className="p-1.5 rounded-lg text-brand-blue hover:bg-brand-blue/10 transition-colors"
                    title={habit.status ? 'Desactivar hábito' : 'Activar hábito'}
                  >
                    {habit.status ? (
                      <CheckSquare className="w-6 h-6 stroke-[2.2]" />
                    ) : (
                      <Square className="w-6 h-6 opacity-40" />
                    )}
                  </button>

                  <button
                    onClick={(e) => handleDelete(e, habit)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Eliminar hábito"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <HabitDetailModal
        habit={selectedHabit}
        onClose={() => setSelectedHabit(null)}
      />

      <HabitFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onHabitCreated={fetchHabits}
      />

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmConfig.action}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
        isLoading={confirmConfig.isLoading}
      />
    </div>
  );
};