import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { FiX, FiClock, FiMessageSquare, FiPlus, FiCpu, FiArrowLeft } from 'react-icons/fi';
import AIChatWindow from './AIChatWindow';
import ChatHistory from './ChatHistory';
import { AI_DISCLAIMER } from '../../constants/ai';
import { cn } from '../../utils';

/**
 * Right-side drawer hosting the AI Health Assistant.
 * Plain conditional render (no AnimatePresence) so it always unmounts cleanly on close.
 */
export default function AIChatDrawer({ open, onClose }) {
  const [tab, setTab] = useState('chat'); // 'chat' | 'history'
  const [chatKey, setChatKey] = useState(0); // bump to start a fresh chat
  const [historyView, setHistoryView] = useState(null); // a selected past conversation

  if (!open) return null;

  const newChat = () => {
    setHistoryView(null);
    setTab('chat');
    setChatKey((k) => k + 1);
  };

  const presetMessages = historyView
    ? [
        { id: 'h-user', role: 'user', type: 'text', text: historyView.message },
        { id: 'h-ai', role: 'assistant', type: 'analysis', analysis: historyView.response },
      ]
    : null;

  return createPortal(
    <div className="fixed inset-0 z-[120]">
      <div onClick={onClose} className="absolute inset-0 animate-fade-in bg-slate-900/50 backdrop-blur-sm" />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="glass-strong absolute right-0 top-0 flex h-full w-full max-w-md flex-col sm:w-[28rem]"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-200/70 px-4 py-3 dark:border-white/10">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow">
            <FiCpu size={18} />
          </span>
          <div className="flex-1">
            <p className="font-display text-sm font-bold text-slate-800 dark:text-white">AI Health Assistant</p>
            <p className="text-[11px] text-slate-400">Informational guidance · not a diagnosis</p>
          </div>
          <button onClick={newChat} title="New chat" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10">
            <FiPlus size={18} />
          </button>
          <button onClick={onClose} title="Close" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10">
            <FiX size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-3 pt-2">
          {[
            { key: 'chat', label: 'Chat', icon: FiMessageSquare },
            { key: 'history', label: 'History', icon: FiClock },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setHistoryView(null);
              }}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-semibold transition',
                tab === t.key ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5',
              )}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1">
          {tab === 'history' && !historyView ? (
            <ChatHistory onSelect={(e) => setHistoryView(e)} />
          ) : historyView ? (
            <div className="flex h-full flex-col">
              <button
                onClick={() => setHistoryView(null)}
                className="m-3 flex w-fit items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
              >
                <FiArrowLeft size={13} /> Back to history
              </button>
              <div className="min-h-0 flex-1">
                <AIChatWindow presetMessages={presetMessages} onNavigate={onClose} />
              </div>
            </div>
          ) : (
            <AIChatWindow key={chatKey} onNavigate={onClose} />
          )}
        </div>

        {/* Persistent mini-disclaimer */}
        <p className="border-t border-slate-200/70 px-4 py-2 text-[10px] leading-tight text-slate-400 dark:border-white/10">
          {AI_DISCLAIMER}
        </p>
      </motion.aside>
    </div>,
    document.body,
  );
}
