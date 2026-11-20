import { useCallback, useEffect, useRef, useState } from 'react';
import { CHAT_ROOMS, deleteMessage, fetchMessages, reportMessage, sendMessage } from '../../services/chatService';

const POLL_MS = 4000;
const timeOf = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * One chat window: room tabs, the message list (refreshes every 4 seconds while the tab is visible),
 * and the send box. Messages are shown as plain text (never HTML).
 * `nickname` is the name this user chats under; `onSessionExpired` is called on a 401.
 */
export default function ChatRoom({ nickname, onSessionExpired, onNeedNickname }) {
  const [room, setRoom] = useState(CHAT_ROOMS[0].id);
  const [messages, setMessages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [offline, setOffline] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const listRef = useRef(null);
  const stick = useRef(true); // true = keep the list scrolled to the newest message
  const roomRef = useRef(room);
  roomRef.current = room;

  const load = useCallback(async () => {
    const wanted = roomRef.current;
    try {
      const data = await fetchMessages(wanted);
      if (roomRef.current !== wanted) return; // the person switched rooms meanwhile
      setMessages(data.messages);
      setLoaded(true);
      setOffline(false);
    } catch (ex) {
      if (ex.status === 401) onSessionExpired();
      else setOffline(true);
    }
  }, [onSessionExpired]);

  // Load now and then every few seconds, only while this browser tab is visible.
  useEffect(() => {
    setLoaded(false);
    setMessages([]);
    stick.current = true;
    load();
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, POLL_MS);
    return () => clearInterval(t);
  }, [room, load]);

  useEffect(() => {
    const el = listRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onScroll = () => {
    const el = listRef.current;
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  };

  const submit = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError('');
    setNotice('');
    try {
      const r = await sendMessage(room, body);
      setText('');
      if (r.notice) setNotice(r.notice);
      stick.current = true;
      await load();
    } catch (ex) {
      if (ex.status === 401) return onSessionExpired();
      if (ex.code === 'NO_NICKNAME') return onNeedNickname();
      setError(ex.message);
    } finally {
      setSending(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteMessage(id);
      load();
    } catch (ex) {
      setError(ex.message);
    }
  };

  const report = async (id) => {
    if (!window.confirm('Report this message to the moderators? Messages reported by 3 people are hidden.')) return;
    try {
      await reportMessage(id);
      setNotice('Thanks, the message was reported.');
      load();
    } catch (ex) {
      setError(ex.message);
    }
  };

  const current = CHAT_ROOMS.find((r) => r.id === room);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Chat rooms">
        {CHAT_ROOMS.map((r) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            aria-selected={room === r.id}
            onClick={() => setRoom(r.id)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              room === r.id ? 'border-forest-800 bg-forest-800 text-gold-300' : 'border-forest-800/25 bg-white text-forest-800 hover:bg-forest-800/5'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-ink/60">
        {current.blurb} You are chatting as <strong className="text-forest-900" data-testid="my-nickname">{nickname}</strong>.
      </p>

      <div className="mt-3 overflow-hidden rounded-2xl border border-forest-800/10 bg-white shadow-card">
        <div ref={listRef} onScroll={onScroll} role="log" aria-live="polite" aria-label={`${current.label} chat`} className="h-80 space-y-3 overflow-y-auto bg-cream/50 p-4" data-testid="chat-messages">
          {!loaded && <p className="py-10 text-center text-sm text-ink/60">Loading messages…</p>}
          {loaded && messages.length === 0 && (
            <p className="py-10 text-center text-sm text-ink/60" data-testid="chat-empty">
              No messages yet. Say hello!
            </p>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`} data-testid="chat-message">
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${m.mine ? 'rounded-br-md bg-forest-800 text-cream' : 'rounded-bl-md bg-white text-ink shadow-sm ring-1 ring-forest-800/10'}`}>
                <p className={`text-xs font-semibold ${m.mine ? 'text-gold-300' : 'text-gold-600'}`}>
                  {m.nickname} <span className={`font-normal ${m.mine ? 'text-cream/60' : 'text-ink/40'}`} title={new Date(m.createdAt).toLocaleString()}>· {timeOf(m.createdAt)}</span>
                </p>
                <p className="mt-0.5 whitespace-pre-wrap break-words">{m.body}</p>
                <button
                  type="button"
                  onClick={() => (m.mine ? remove(m.id) : report(m.id))}
                  className={`mt-1 text-[11px] underline-offset-2 hover:underline ${m.mine ? 'text-cream/60' : 'text-ink/40'}`}
                >
                  {m.mine ? 'Delete' : 'Report'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {offline && (
          <p role="status" className="bg-amber-50 px-4 py-1.5 text-xs text-amber-800">
            Reconnecting…
          </p>
        )}
        {(notice || error) && (
          <p role={error ? 'alert' : 'status'} className={`px-4 py-1.5 text-xs ${error ? 'bg-red-50 text-red-800' : 'bg-gold-400/10 text-forest-900'}`} data-testid="chat-feedback">
            {error || notice}
          </p>
        )}

        <form onSubmit={submit} className="flex items-center gap-2 border-t border-forest-800/10 bg-offwhite p-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={300}
            aria-label="Type a chat message"
            placeholder="Type a message…"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-full bg-cream px-4 py-2.5 text-sm placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-gold-500/60"
          />
          <span className="hidden text-xs text-ink/40 sm:inline">{text.length}/300</span>
          <button type="submit" disabled={sending || !text.trim()} className="rounded-full bg-forest-800 px-5 py-2.5 text-sm font-semibold text-gold-300 hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-40">
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
