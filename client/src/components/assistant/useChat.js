import { useCallback, useEffect, useRef, useState } from 'react';
import { GREETING, reply } from '../../utils/assistant';
import { useCart } from '../../context/CartContext';

/**
 * Chat state shared by the homepage chat box and the floating widget.
 * send(text) adds the user's message, shows "typing…" for a moment, then adds the assistant's reply.
 * The timer is cleared if the chat closes, so nothing updates an unmounted component.
 */
export default function useChat() {
  const { items } = useCart();
  const [messages, setMessages] = useState([{ id: 0, from: 'bot', text: GREETING }]);
  const [typing, setTyping] = useState(false);
  const nextId = useRef(1);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const send = useCallback(
    (raw) => {
      const text = String(raw || '').trim().slice(0, 300);
      if (!text || typing) return false;
      setMessages((m) => [...m, { id: nextId.current++, from: 'user', text }]);
      setTyping(true);
      timer.current = setTimeout(() => {
        let answer;
        try {
          answer = reply(text, items);
        } catch {
          answer = { text: 'Sorry, something went wrong on my side. Please try asking again.' };
        }
        setMessages((m) => [...m, { id: nextId.current++, from: 'bot', ...answer }]);
        setTyping(false);
      }, 450);
      return true;
    },
    [items, typing],
  );

  return { messages, typing, send };
}
