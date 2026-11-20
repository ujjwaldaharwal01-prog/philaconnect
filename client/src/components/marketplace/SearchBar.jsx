import { useEffect, useState } from 'react';
import { SearchIcon, CloseIcon } from '../ui/Icons';
import { MAX_QUERY_LENGTH } from '../../utils/stampFilters';

/**
 * Marketplace search box.
 * - Keeps its own text while typing and applies it to the URL only on submit (Enter/Search),
 *   so the grid does not jump around on every keystroke.
 * - Validates length and shows an accessible error message.
 * - Re-syncs when the URL changes elsewhere (e.g. "Clear all" or a homepage link).
 */
export default function SearchBar({ value, onSearch }) {
  const [text, setText] = useState(value);
  const [error, setError] = useState('');

  useEffect(() => {
    setText(value);
    setError('');
  }, [value]);

  const submit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed.length > MAX_QUERY_LENGTH) {
      setError(`Please keep your search under ${MAX_QUERY_LENGTH} characters.`);
      return;
    }
    setError('');
    onSearch(trimmed);
  };

  const clear = () => {
    setText('');
    setError('');
    onSearch('');
  };

  return (
    <form onSubmit={submit} role="search" noValidate className="w-full">
      <label htmlFor="market-search" className="sr-only">
        Search stamps by name, country, category or year
      </label>
      <div className="flex items-center gap-2 rounded-full border border-forest-800/15 bg-white p-1.5 pl-5 shadow-card focus-within:ring-2 focus-within:ring-gold-500">
        <SearchIcon className="h-5 w-5 shrink-0 text-forest-800/60" />
        <input
          id="market-search"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search by name, country, category or year (try 1960s)…"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'market-search-error' : undefined}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-ink placeholder:text-ink/45 focus:outline-none"
        />
        {text && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="rounded-full p-2 text-forest-800/60 transition hover:bg-forest-800/5"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          className="rounded-full bg-forest-800 px-6 py-3 text-sm font-semibold text-gold-300 transition hover:bg-forest-700"
        >
          Search
        </button>
      </div>
      {error && (
        <p id="market-search-error" role="alert" className="mt-2 pl-5 text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
