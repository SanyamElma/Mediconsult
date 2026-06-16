import { useEffect, useRef, useState } from 'react';
import { FiMic } from 'react-icons/fi';
import { cn } from '../../utils';

/**
 * Speak-to-text button using the browser Web Speech API.
 * Renders nothing if the browser doesn't support speech recognition.
 */
export default function VoiceInput({ onResult, disabled }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    setSupported(true);
    const recognition = new SR();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(' ');
      onResult?.(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, [onResult]);

  if (!supported) return null;

  const toggle = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      try {
        rec.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      title="Speak your symptoms"
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition',
        listening
          ? 'animate-pulse border-rose-400 bg-rose-500 text-white'
          : 'border-slate-300 bg-white/60 text-slate-500 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300',
      )}
    >
      <FiMic size={18} />
    </button>
  );
}
