import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const icons = {
    success: <FiCheckCircle className="text-green-500 w-5 h-5" />,
    error: <FiAlertCircle className="text-red-500 w-5 h-5" />,
    info: <FiInfo className="text-blue-500 w-5 h-5" />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm w-full bg-white backdrop-blur-md bg-opacity-90 ${bgColors[toast.type] || bgColors.info}`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type] || icons.info}</div>
      <div className="flex-1 text-sm font-medium text-gray-800">{toast.message}</div>
      <button
        onClick={onRemove}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <FiX className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
