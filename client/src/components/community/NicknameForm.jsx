import { useState } from 'react';
import FormField from '../ui/FormField';
import { saveNickname } from '../../services/chatService';
import PrivacyNotice from './PrivacyNotice';

const RULES_KEY = 'philaconnect_chat_rules_v1';
const readAgreed = () => {
  try {
    return localStorage.getItem(RULES_KEY) === 'yes';
  } catch {
    return false; // storage blocked: just ask again
  }
};

/**
 * First-time chat setup: choose a nickname and agree to the chat rules.
 * onDone(nickname) is called once the server has saved it.
 */
export default function NicknameForm({ onDone }) {
  const [nickname, setNickname] = useState('');
  const [agreed, setAgreed] = useState(readAgreed);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const nick = nickname.trim();
    if (!/^[A-Za-z0-9][A-Za-z0-9 _-]{2,19}$/.test(nick)) {
      setError('Use 3 to 20 letters, numbers, spaces, - or _.');
      return;
    }
    if (!agreed) {
      setError('Please agree to the chat rules to continue.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { nickname: saved } = await saveNickname(nick);
      try {
        localStorage.setItem(RULES_KEY, 'yes');
      } catch {
        /* ignore */
      }
      onDone(saved);
    } catch (ex) {
      setError(ex.fieldErrors?.nickname || ex.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate aria-label="Choose a chat nickname" className="space-y-5">
      <PrivacyNotice />
      <FormField
        id="chat-nickname"
        label="Choose a nickname"
        hint="This is the only name others will see. Do not use your real name if you prefer privacy."
        maxLength={20}
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="e.g. StampHunter"
        autoComplete="off"
      />
      <label className="flex items-start gap-3 text-sm text-ink/80">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-4 w-4 accent-forest-800" />
        <span>I agree to be respectful, avoid spam, and never ask for or share personal or payment details.</span>
      </label>
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className="rounded-full bg-forest-800 px-6 py-2.5 text-sm font-semibold text-gold-300 hover:bg-forest-700 disabled:opacity-60">
        {busy ? 'Saving…' : 'Join the chat'}
      </button>
    </form>
  );
}
