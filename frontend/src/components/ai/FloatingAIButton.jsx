import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi2';
import AIChatDrawer from './AIChatDrawer';

/**
 * Floating "Ask AI Health Assistant" action button (bottom-right, all user pages).
 * Opens the AI chat drawer.
 */
export default function FloatingAIButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 18 }}
        onClick={() => setOpen((o) => !o)}
        className="group fixed bottom-5 right-5 z-[110] flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-accent-500 px-4 py-3.5 text-white shadow-glow transition hover:scale-105 active:scale-95"
        aria-label="Ask AI Health Assistant"
      >
        {/* pulsing ring */}
        {!open && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-brand-500/40" />}
        {open ? <FiX size={22} /> : <HiOutlineSparkles size={22} />}
        <span className="hidden text-sm font-semibold sm:inline">
          {open ? 'Close' : 'Ask AI Health Assistant'}
        </span>
      </motion.button>

      <AIChatDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
