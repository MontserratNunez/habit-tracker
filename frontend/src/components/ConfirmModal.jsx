import React from 'react';
import { X, AlertTriangle, Info, Trash2 } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: 'bg-red-500/10 text-red-500',
      icon: <Trash2 className="w-6 h-6" />,
      btnBg: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
      iconBg: 'bg-amber-500/10 text-amber-500',
      icon: <AlertTriangle className="w-6 h-6" />,
      btnBg: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    primary: {
      iconBg: 'bg-brand-blue/10 text-brand-blue',
      icon: <Info className="w-6 h-6" />,
      btnBg: 'bg-brand-blue hover:bg-brand-blue/90 text-white',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-brand-bg-light dark:bg-brand-bg-dark border border-brand-cream/60 dark:border-gray-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-brand-brown dark:text-brand-cream relative">
        
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 p-2 rounded-xl bg-brand-cream/40 dark:bg-gray-800 hover:bg-brand-cream/70 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${currentVariant.iconBg} flex-shrink-0`}>
            {currentVariant.icon}
          </div>
          <h3 className="text-xl font-black">{title}</h3>
        </div>

        <p className="text-sm opacity-80 font-medium leading-relaxed">
          {message}
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 rounded-xl border border-brand-cream/60 dark:border-gray-700 font-bold hover:bg-brand-cream/30 dark:hover:bg-gray-800 transition-colors text-sm disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold transition-all shadow-md text-sm flex items-center justify-center gap-2 ${currentVariant.btnBg} disabled:opacity-50`}
          >
            {isLoading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};