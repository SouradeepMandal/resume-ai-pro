import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { FiAlertTriangle } from 'react-icons/fi';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, isLoading }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={!isLoading ? onCancel : undefined}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
                  <FiAlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 px-6 py-4 flex justify-end gap-3 border-t border-gray-700">
              <Button 
                variant="ghost" 
                onClick={onCancel}
                disabled={isLoading}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={onConfirm}
                isLoading={isLoading}
              >
                Confirm
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
