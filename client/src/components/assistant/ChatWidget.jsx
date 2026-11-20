import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ChatPanel from './ChatPanel';
import useChat from './useChat';
import { SparkleIcon } from '../ui/Icons';

/**
 * Floating assistant: a round button in the bottom-right corner that opens a chat window on every page.
 * It is hidden on the homepage, which already has the chat box built in. Escape closes it.
 * The conversation is kept while you move between pages (this component lives in the Layout).
 */
export default function ChatWidget() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const chat = useChat();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (pathname === '/') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <section
          aria-label="PHILA Assistant"
          className="flex w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-gold-400/30 bg-offwhite text-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]"
          data-testid="chat-widget"
        >
          <div className="flex items-center justify-between bg-forest-800 px-4 py-3 text-cream">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 text-forest-950">
                <SparkleIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="font-display text-base font-semibold leading-tight">PHILA Assistant</p>
                <p className="text-xs text-cream/65">Stamp guide and marketplace help</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded-full p-1.5 text-xl leading-none text-cream/80 hover:bg-cream/10">
              ×
            </button>
          </div>
          <ChatPanel {...chat} autoFocus heightClass="h-72 sm:h-80" />
        </section>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? 'Close PHILA Assistant' : 'Open PHILA Assistant'}
        data-testid="chat-toggle"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-800 text-gold-300 shadow-lg ring-2 ring-gold-500/60 transition hover:bg-forest-700 motion-safe:hover:-translate-y-0.5"
      >
        <SparkleIcon className="h-6 w-6" />
      </button>
    </div>
  );
}
