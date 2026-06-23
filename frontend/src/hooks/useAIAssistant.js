import { useCallback, useRef, useState } from 'react';
import { aiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AI_GREETING } from '../constants/ai';

let msgId = 0;
const nextId = () => ++msgId;

/**
 * Chat state machine for the AI Health Assistant.
 * Each user turn is appended to an accumulated symptom context so multi-turn
 * follow-up answers refine the analysis (mirrors the backend `answers` folding).
 */
export function useAIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { id: nextId(), role: 'assistant', type: 'text', text: AI_GREETING },
  ]);
  const [sending, setSending] = useState(false);
  const contextRef = useRef(''); // accumulated symptom text

  const send = useCallback(
    async (rawText) => {
      const text = (rawText || '').trim();
      if (!text || sending) return;

      setMessages((m) => [...m, { id: nextId(), role: 'user', type: 'text', text }]);
      setSending(true);

      // Accumulate context so follow-up answers build on the original complaint.
      contextRef.current = contextRef.current ? `${contextRef.current}. ${text}` : text;

      try {
        // Retry once: on free-tier hosting the backend can be cold-starting, so the
        // first attempt may be slow/fail before the server is awake. A short pause
        // then a second attempt recovers transparently.
        let analysis;
        try {
          analysis = await aiService.analyze(user.id, { message: contextRef.current });
        } catch {
          await new Promise((r) => setTimeout(r, 2000));
          analysis = await aiService.analyze(user.id, { message: contextRef.current });
        }
        setMessages((m) => [...m, { id: nextId(), role: 'assistant', type: 'analysis', analysis }]);
      } catch {
        setMessages((m) => [
          ...m,
          {
            id: nextId(),
            role: 'assistant',
            type: 'text',
            text: "I'm having trouble reaching the health service right now — it may be waking up. Please wait a few seconds and try again.",
            error: true,
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [sending, user?.id],
  );

  const reset = useCallback(() => {
    contextRef.current = '';
    setMessages([{ id: nextId(), role: 'assistant', type: 'text', text: AI_GREETING }]);
  }, []);

  return { messages, sending, send, reset };
}
