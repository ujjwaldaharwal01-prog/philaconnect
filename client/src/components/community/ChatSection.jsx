import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getToken } from '../../utils/auth';
import { fetchMyNickname } from '../../services/chatService';
import ChatRoom from './ChatRoom';
import NicknameForm from './NicknameForm';
import PrivacyNotice from './PrivacyNotice';

/**
 * "Live chat" block of the Community page. Decides what to show:
 *   not logged in         -> a login prompt (nobody can read the chat without an account)
 *   no nickname yet       -> the nickname + rules form
 *   nickname chosen       -> the chat window
 */
export default function ChatSection() {
  const [loggedIn, setLoggedIn] = useState(() => Boolean(getToken()));
  const [nickname, setNickname] = useState(null);
  const [state, setState] = useState(loggedIn ? 'loading' : 'guest'); // loading | guest | setup | ready | error
  const [error, setError] = useState('');

  const load = useCallback(() => {
    let cancelled = false;
    setState('loading');
    fetchMyNickname()
      .then((d) => {
        if (cancelled) return;
        setNickname(d.nickname);
        setState(d.nickname ? 'ready' : 'setup');
      })
      .catch((ex) => {
        if (cancelled) return;
        if (ex.status === 401) {
          setLoggedIn(false);
          setState('guest');
        } else {
          setError(ex.message);
          setState('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loggedIn) return load();
    return undefined;
  }, [loggedIn, load]);

  const expired = useCallback(() => {
    setLoggedIn(false);
    setState('guest');
  }, []);

  return (
    <section aria-label="Live chat" className="mt-12">
      <h2 className="text-3xl font-semibold text-forest-900">Live chat</h2>
      <p className="mt-1 text-sm text-ink/60">Chat with other collectors in real time. Private by design.</p>

      <div className="mt-6">
        {state === 'guest' && (
          <div className="space-y-4" data-testid="chat-guest">
            <PrivacyNotice />
            <p className="text-sm text-ink/70">
              <Link to="/login" className="font-semibold text-forest-800 underline">Log in</Link> to join the live chat. You will choose a nickname, so
              your real name stays private.
            </p>
          </div>
        )}
        {state === 'loading' && <p className="py-8 text-center text-ink/60">Loading chat…</p>}
        {state === 'error' && (
          <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-800">{error}</p>
            <button type="button" onClick={load} className="mt-3 rounded-full bg-red-800 px-5 py-2 text-sm font-semibold text-white">
              Try again
            </button>
          </div>
        )}
        {state === 'setup' && <NicknameForm onDone={(n) => { setNickname(n); setState('ready'); }} />}
        {state === 'ready' && <ChatRoom nickname={nickname} onSessionExpired={expired} onNeedNickname={() => setState('setup')} />}
      </div>
    </section>
  );
}
