import { useState } from 'react';
import { createHabitRequest } from '../api/habitApi';

const DAYS_OF_WEEK = [
  { id: 1, label: 'L', name: 'Lunes' },
  { id: 2, label: 'M', name: 'Martes' },
  { id: 3, label: 'X', name: 'Miércoles' },
  { id: 4, label: 'J', name: 'Jueves' },
  { id: 5, label: 'V', name: 'Viernes' },
  { id: 6, label: 'S', name: 'Sábado' },
  { id: 0, label: 'D', name: 'Domingo' },
];

export const HabitFormModal = ({ isOpen, onClose, onHabitCreated }) => {
  const [title, setTitle] = useState('');
  const [frequencyType, setFrequencyType] = useState('daily');

  const [targetCount, setTargetCount] = useState(3);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState([]);
  const [daysOfMonthInput, setDaysOfMonthInput] = useState('');
  const [intervalWeeks, setIntervalWeeks] = useState(2);
  const [weekNumber, setWeekNumber] = useState(1);
  const [dayOfWeekPattern, setDayOfWeekPattern] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle('');
    setFrequencyType('daily');
    setTargetCount(3);
    setSelectedDaysOfWeek([]);
    setDaysOfMonthInput('');
    setIntervalWeeks(2);
    setWeekNumber(1);
    setDayOfWeekPattern(1);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleDayOfWeek = (dayId) => {
    if (selectedDaysOfWeek.includes(dayId)) {
      setSelectedDaysOfWeek(selectedDaysOfWeek.filter((d) => d !== dayId));
    } else {
      setSelectedDaysOfWeek([...selectedDaysOfWeek, dayId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (frequencyType === 'weekly_days' && selectedDaysOfWeek.length === 0) {
      setError('Debes seleccionar al menos un día de la semana.');
      return;
    }

    let parsedDaysOfMonth = [];
    if (frequencyType === 'monthly_days') {
      parsedDaysOfMonth = daysOfMonthInput
        .split(',')
        .map((val) => parseInt(val.trim(), 10))
        .filter((val) => !isNaN(val) && val >= 1 && val <= 31);

      if (parsedDaysOfMonth.length === 0) {
        setError('Ingresa días del mes válidos (entre 1 y 31). Ej: 5, 20');
        return;
      }
    }

    setLoading(true);
    setError('');

    const frequencyData = { type: frequencyType };

    if (frequencyType === 'weekly_target') {
      frequencyData.targetCount = Number(targetCount);
    } else if (frequencyType === 'weekly_days') {
      frequencyData.daysOfWeek = selectedDaysOfWeek;
    } else if (frequencyType === 'interval_weeks') {
      frequencyData.intervalWeeks = Number(intervalWeeks);
    } else if (frequencyType === 'monthly_days') {
      frequencyData.daysOfMonth = parsedDaysOfMonth;
    } else if (frequencyType === 'monthly_pattern') {
      frequencyData.monthlyPattern = {
        weekNumber: Number(weekNumber),
        dayOfWeek: Number(dayOfWeekPattern),
      };
    }

    try {
      await createHabitRequest({
        title,
        frequency: frequencyData,
      });
      resetForm();
      onHabitCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el hábito');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md bg-brand-bg-light dark:bg-brand-bg-dark text-brand-brown dark:text-brand-cream rounded-2xl p-6 shadow-2xl border border-brand-cream/30 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-extrabold">Nuevo Hábito</h2>
          <button
            onClick={handleClose}
            className="text-lg font-bold opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Título del hábito</label>
            <input
              type="text"
              required
              placeholder="Ej: Meditar 10 minutos"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-cream/60 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Tipo de Frecuencia</label>
            <select
              value={frequencyType}
              onChange={(e) => {
                setFrequencyType(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-cream/60 dark:border-gray-700 bg-brand-bg-light dark:bg-brand-bg-dark focus:outline-none focus:ring-2 focus:ring-brand-blue text-sm"
            >
              <option value="daily">Cada día (Todos los días)</option>
              <option value="weekly">Semanal (Cualquier día de la semana)</option>
              <option value="monthly">Mensual (Cualquier día del mes)</option>
              <option value="weekly_target">X veces por semana</option>
              <option value="weekly_days">Días específicos de la semana</option>
              <option value="interval_weeks">Cada N semanas</option>
              <option value="monthly_days">Días específicos del mes</option>
              <option value="monthly_pattern">Patrón mensual (Ej: 3er Lunes)</option>
            </select>
          </div>

          {frequencyType === 'weekly_target' && (
            <div>
              <label className="block text-sm font-bold mb-1">
                ¿Cuántas veces por semana?
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-brand-cream/60 dark:border-gray-700 bg-transparent"
              />
            </div>
          )}

          {frequencyType === 'weekly_days' && (
            <div>
              <label className="block text-sm font-bold mb-2">
                Selecciona los días:
              </label>
              <div className="flex justify-between gap-1">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = selectedDaysOfWeek.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDayOfWeek(day.id)}
                      className={`w-9 h-9 rounded-xl font-bold text-xs transition-all ${
                        isSelected
                          ? 'bg-brand-blue text-white shadow-md'
                          : 'border border-brand-cream/60 dark:border-gray-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {frequencyType === 'interval_weeks' && (
            <div>
              <label className="block text-sm font-bold mb-1">
                Repetir cada cuántas semanas:
              </label>
              <input
                type="number"
                min="1"
                value={intervalWeeks}
                onChange={(e) => setIntervalWeeks(e.target.value)}
                placeholder="Ej: 2 para cada dos semanas"
                className="w-full px-4 py-2 rounded-xl border border-brand-cream/60 dark:border-gray-700 bg-transparent"
              />
            </div>
          )}

          {frequencyType === 'monthly_days' && (
            <div>
              <label className="block text-sm font-bold mb-1">
                Días del mes (separados por comas):
              </label>
              <input
                type="text"
                value={daysOfMonthInput}
                onChange={(e) => setDaysOfMonthInput(e.target.value)}
                placeholder="Ej: 5, 20"
                className="w-full px-4 py-2 rounded-xl border border-brand-cream/60 dark:border-gray-700 bg-transparent"
              />
              <p className="text-xs opacity-60 mt-1">
                Ingresa los números de día del 1 al 31.
              </p>
            </div>
          )}

          {frequencyType === 'monthly_pattern' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">Semana del mes</label>
                <select
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-cream/60 dark:border-gray-700 bg-brand-bg-light dark:bg-brand-bg-dark text-sm"
                >
                  <option value={1}>1ª semana</option>
                  <option value={2}>2ª semana</option>
                  <option value={3}>3ª semana</option>
                  <option value={4}>4ª semana</option>
                  <option value={5}>Última semana</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Día de la semana</label>
                <select
                  value={dayOfWeekPattern}
                  onChange={(e) => setDayOfWeekPattern(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-cream/60 dark:border-gray-700 bg-brand-bg-light dark:bg-brand-bg-dark text-sm"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-brand-cream/20">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl border border-brand-cream/60 dark:border-gray-700 font-semibold text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-brand-blue text-white font-bold hover:bg-brand-blue/90 disabled:opacity-50 text-sm"
            >
              {loading ? 'Guardando...' : 'Crear Hábito'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};