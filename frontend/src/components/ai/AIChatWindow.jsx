import { useEffect, useRef, useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { useQueryClient } from '@tanstack/react-query';
import { useAIAssistant } from '../../hooks/useAIAssistant';
import UserMessage from './UserMessage';
import AIMessage from './AIMessage';
import VoiceInput from './VoiceInput';
import { SYMPTOM_EXAMPLES } from '../../constants/ai';

/** The interactive chat surface: message list, example chips, text + voice input. */
export default function AIChatWindow({ onNavigate, presetMessages }) {
  const { messages, sending, send } = useAIAssistant();
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const qc = useQueryClient();

  // When the assistant finishes, refresh history list.
  useEffect(() => {
    if (!sending) qc.invalidateQueries({ queryKey: ['ai-history'] });
  }, [sending, qc]);

  const view = presetMessages || messages;
  const showExamples = !presetMessages && messages.length <= 1;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [view, sending]);

  const submit = (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    send(input);
    setInput('');
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {view.map((m) =>
          m.role === 'user' ? (
            <UserMessage key={m.id} text={m.text} />
          ) : (
            <AIMessage key={m.id} message={m} onNavigate={onNavigate} />
          ),
        )}

        {showExamples && (
          <div className="pl-10">
            <p className="mb-2 text-xs text-slate-400">Try one of these:</p>
            <div className="flex flex-wrap gap-1.5">
              {SYMPTOM_EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => send(ex)}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-brand-400 hover:text-brand-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {sending && (
          <div className="flex items-center gap-2 pl-10 text-sm text-slate-400">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400" />
            </span>
            Analyzing your symptoms…
          </div>
        )}
      </div>

      {/* Composer (hidden when viewing a historical conversation) */}
      {!presetMessages && (
        <form onSubmit={submit} className="flex items-center gap-2 border-t border-slate-200/70 p-3 dark:border-white/10">
          <VoiceInput onResult={(t) => setInput((v) => (v ? `${v} ${t}` : t))} disabled={sending} />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your symptoms…"
            className="input flex-1"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="btn btn-primary !px-3.5 disabled:opacity-50"
            aria-label="Send"
          >
            <FiSend size={17} />
          </button>
        </form>
      )}
    </div>
  );
}
