import { FiCpu } from 'react-icons/fi';
import { cn } from '../../utils';
import SymptomAnalysisResult from './SymptomAnalysisResult';

/** Left-aligned assistant bubble. Renders either plain text or a structured analysis. */
export default function AIMessage({ message, onNavigate }) {
  return (
    <div className="flex gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow">
        <FiCpu size={16} />
      </span>
      <div
        className={cn(
          'max-w-[88%] rounded-2xl rounded-tl-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm dark:border-white/10 dark:bg-slate-900/60',
          message.error && 'border-rose-300 text-rose-600 dark:border-rose-500/30',
        )}
      >
        {message.type === 'analysis' ? (
          <SymptomAnalysisResult analysis={message.analysis} onNavigate={onNavigate} />
        ) : (
          <p className="text-slate-700 dark:text-slate-200">{message.text}</p>
        )}
      </div>
    </div>
  );
}
