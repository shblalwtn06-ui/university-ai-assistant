import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function Chat({ courseId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setInput('');
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: question },
      { role: 'assistant', text: '', citations: [], streaming: true },
    ]);
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(`${API_BASE_URL}/chat?stream=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ question, courseId: courseId || null }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'فشل الاتصال بالخادم.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop(); // keep incomplete tail

        for (const evt of events) {
          const line = evt.replace(/^data:\s*/, '').trim();
          if (!line) continue;
          const payload = JSON.parse(line);

          if (payload.type === 'delta') {
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              last.text += payload.text;
              return next;
            });
          } else if (payload.type === 'done') {
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              last.citations = payload.citations || [];
              last.streaming = false;
              return next;
            });
          } else if (payload.type === 'error') {
            throw new Error(payload.message);
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: 'assistant',
          text: `⚠️ ${err.message}`,
          citations: [],
          streaming: false,
        };
        return next;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll px-6 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-brand-muted text-sm">
            اطرح سؤالك حول المقررات الدراسية وسيجيبك المساعد بناءً على المواد المرفوعة.
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-brand-panel border border-brand-border'
                  : 'bg-brand-accent/15 border border-brand-accent/30'
              }`}
            >
              {m.text || (m.streaming && <TypingIndicator />)}

              {m.citations?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-brand-border/60 space-y-1.5">
                  <p className="text-xs text-brand-muted font-semibold">المصادر:</p>
                  {m.citations.map((c, ci) => (
                    <div key={ci} className="text-xs text-brand-muted">
                      📄 <span className="font-medium">{c.file_name}</span> — {c.snippet}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="border-t border-brand-border p-4 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب سؤالك الأكاديمي هنا..."
          disabled={loading}
          className="flex-1 bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-accent disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-brand-accent hover:bg-brand-accentSoft transition rounded-xl px-5 py-3 text-sm font-semibold disabled:opacity-60"
        >
          إرسال
        </button>
      </form>
    </div>
  );
}

function TypingIndicator() {
  return (
    <span className="inline-flex gap-1">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-muted animate-bounce [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-brand-muted animate-bounce [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-brand-muted animate-bounce" />
    </span>
  );
}
