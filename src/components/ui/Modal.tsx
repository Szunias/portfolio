import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

const Modal = ({ isOpen, onClose, children, title }: ModalProps) => {
  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-secondary border border-accent/30 p-8 rounded-2xl max-w-md w-full shadow-[0_0_60px_rgba(56,189,248,0.3)] relative hover:border-accent/40 transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <Button 
                    onClick={onClose}
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-slate-500 hover:text-white"
                    aria-label="Close modal"
                >
                    <X size={24} />
                </Button>
                
                {title && <h3 id="modal-title" className="text-2xl font-bold text-white mb-2">{title}</h3>}
                {children}
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
