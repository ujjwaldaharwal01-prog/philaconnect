/**
 * Helpers to find out who is logged in.
 *
 * The login page saves the server's token and user in localStorage. Instead of depending on the
 * exact key names, these helpers recognise them by their SHAPE:
 *   - a token looks like  eyJxxxx.yyyy.zzzz  (three base64 parts, a JWT)
 *   - a user is a JSON object with an "email"
 * Every read is wrapped in try/catch because localStorage can be blocked or contain junk.
 */

const JWT_PATTERN = /^eyJ[\w-]+\.[\w-]+\.[\w-]+$/;

/** Returns every localStorage value as [rawText, parsedJsonOrNull]. */
function storedValues() {
  const out = [];
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const raw = window.localStorage.getItem(window.localStorage.key(i));
      if (!raw) continue;
      let parsed = null;
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = null;
      }
      out.push([raw, parsed]);
    }
  } catch {
    // storage blocked: behave as logged out
  }
  return out;
}

/** The login token, or null when nobody is logged in. */
export function getToken() {
  for (const [raw, parsed] of storedValues()) {
    if (JWT_PATTERN.test(raw)) return raw;
    if (parsed && typeof parsed === 'object' && typeof parsed.token === 'string' && JWT_PATTERN.test(parsed.token)) {
      return parsed.token;
    }
  }
  return null;
}

/** The logged-in user's saved details ({ name, email }), or null. */
export function getStoredUser() {
  for (const [, parsed] of storedValues()) {
    const candidate = parsed && typeof parsed === 'object' ? parsed.user ?? parsed : null;
    if (candidate && typeof candidate.email === 'string') {
      return { name: typeof candidate.name === 'string' ? candidate.name : '', email: candidate.email };
    }
  }
  return null;
}
