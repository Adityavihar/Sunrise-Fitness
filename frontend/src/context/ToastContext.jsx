import React, { createContext, useContext, useState, useCallback } from 'react';
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove toast after specified duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Dynamic Toast Alerts Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full px-4 md:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start justify-between p-4 rounded-xl shadow-2xl border backdrop-blur-xl transition-all duration-300 transform animate-bounce-short ${
              toast.type === 'success'
                ? 'bg-gym-gray/90 border-gold-500/50 text-white'
                : toast.type === 'error'
                ? 'bg-gym-gray/90 border-red-500/50 text-white'
                : 'bg-gym-gray/90 border-blue-500/50 text-white'
            }`}
          >
            <div className="flex gap-3 items-start">
              {toast.type === 'success' && (
                <FiCheckCircle className="text-gold-500 text-xl mt-0.5 flex-shrink-0 animate-pulse" />
              )}
              {toast.type === 'error' && (
                <FiAlertCircle className="text-red-500 text-xl mt-0.5 flex-shrink-0 animate-pulse" />
              )}
              {toast.type === 'info' && (
                <FiInfo className="text-blue-400 text-xl mt-0.5 flex-shrink-0" />
              )}
              <span className="text-sm font-medium tracking-wide leading-relaxed">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-white transition-colors ml-3 p-0.5 hover:bg-white/5 rounded-full"
            >
              <FiX className="text-base" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
