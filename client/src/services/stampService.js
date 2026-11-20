import { stamps } from '../data/stamps';

/**
 * Data access for stamp listings.
 *
 * TODAY: resolves the sample array after a short delay so the loading state is real.
 * LATER (backend step): replace the body with
 *     const res = await fetch('/api/stamps'); if (!res.ok) throw new Error(...); return res.json();
 * The marketplace page already handles loading and error states, so nothing else changes.
 *
 * Testing the error state: in development (npm run dev) open /marketplace?simulateError=1.
 */
export function fetchStamps() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const wantsError =
        import.meta.env.DEV && new URLSearchParams(window.location.search).has('simulateError');
      if (wantsError) {
        reject(new Error('Could not load stamps. Please check your connection and try again.'));
        return;
      }
      resolve(stamps);
    }, 350);
  });
}
