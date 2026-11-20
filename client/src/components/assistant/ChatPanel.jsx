import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SUGGESTIONS } from '../../utils/assistant';
import ChatStampCard from './ChatStampCard';

/**
 * The chat window itself (messages, quick questions, input). It is "dumb": the parent passes
 * `messages`, `typing` and `send` (from useChat), so the same panel works on the homepage and in the
 * floating widget. Messages are plain text (never HTML), so nothing typed can inject code.
 */
export default function ChatPanel({ messages, typing, send, autoFocus = false, heightClass = 'h-80' }) {
  const [text, setText] = useState('');
  const endRef = useRef(null);
  const inputRef = useRef(null);

  // Keep the newest message in view (scrolls only the chat box, not the page).
  useEffect(() => {
    const el = endRef.current;
    if (el && el.parentElement) el.parentElement.scrollTop = el.parentElement.scrollHeight;
  }, [messages, typing]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const submit = (e) => {
    e.preventDefault();
    if (send(text)) setText('');
  };

  return (
    <>
      <div className={`${heightClass} space-y-3 overflow-y-auto bg-cream/60 p-4`} role="log" aria-live="polite" aria-label="Conversation with PHILA Assistant" data-testid="chat-log">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`} data-testid={`msg-${m.from}`}>
            <div className={`max-w-[88%] ${m.from === 'user' ? '' : 'w-full'}`}>
              <p
                className={`whitespace-pre-line break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.from === 'user' ? 'ml-auto w-fit rounded-br-md bg-forest-800 text-cream' : 'rounded-bl-md bg-white text-ink shadow-sm ring-1 ring-forest-800/10'
                }`}
              >
                {m.text}
              </p>
              {m.picks?.map((p) => <ChatStampCard key={p.stampId} stampId={p.stampId} reasons={p.reasons} />)}
              {m.links?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {m.links.map((l) => (
                    <Link key={l.to} to={l.to} className="rounded-full border border-gold-500/60 bg-offwhite px-3 py-1 text-xs font-medium text-forest-800 hover:bg-gold-500/15">
                      {l.label} →
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <p className="w-fit rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-sm text-ink/60 shadow-sm ring-1 ring-forest-800/10" data-testid="typing">
            Typing…
          </p>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto border-t border-forest-800/10 bg-offwhite px-4 pt-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={typing}
            onClick={() => send(s)}
            className="rounded-full border border-gold-500/50 bg-offwhite px-3 py-1 text-xs text-forest-800 transition hover:bg-gold-500/15 disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 bg-offwhite p-3">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={300}
          aria-label="Type your question"
          placeholder="Ask about stamps…"
          className="min-w-0 flex-1 rounded-full bg-cream px-4 py-2.5 text-sm placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-gold-500/60"
        />
        <button type="submit" disabled={typing || !text.trim()} className="rounded-full bg-forest-800 px-4 py-2.5 text-sm font-semibold text-cream transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-40">
          Send
        </button>
      </form>
    </>
  );
}
