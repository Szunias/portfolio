import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

import { Button } from './Button';
import { spring, noMotion } from '@/constants/motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

const Modal = ({ isOpen, onClose, children, title }: ModalProps) => {
  const prefersReducedMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle Escape key + focus trap
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && contentRef.current) {
        const focusable = contentRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, textarea, select'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
        >
            <motion.div
                ref={contentRef}
                initial={prefersReducedMotion ? noMotion.initial : { scale: 0.95, y: 8, opacity: 0 }}
                animate={prefersReducedMotion ? noMotion.animate : { scale: 1, y: 0, opacity: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { scale: 0.95, y: 8, opacity: 0 }}
                transition={prefersReducedMotion ? noMotion.transition : spring.interactive}
                className="bg-surface-raised border border-border p-8 rounded-xl max-w-md w-full relative"
                onClick={(e) => e.stopPropagation()}
            >
                <Button
                    onClick={onClose}
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
                    aria-label="Close modal"
                >
                    <X size={24} />
                </Button>

                {title && <h3 id="modal-title" className="text-2xl font-display text-text-primary mb-2">{title}</h3>}
                {children}
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
