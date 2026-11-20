/**
 * Card for one organisation or community. The link opens in a new tab with
 * rel="noopener noreferrer", so the other website gets no access to PHILAConnect.
 */
export default function OrgCard({ org }) {
  const host = (() => {
    try {
      return new URL(org.url).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  })();
  return (
    <li data-testid="org-card" className="flex flex-col rounded-2xl border border-forest-800/10 bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-forest-800 px-2.5 py-0.5 text-gold-300">{org.type}</span>
        <span className="rounded-full bg-gold-500/15 px-2.5 py-0.5 text-gold-600">{org.region}</span>
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug text-forest-900">{org.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">{org.description}</p>
      <a
        href={org.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${org.name} (opens in a new tab)`}
        className="mt-5 inline-flex items-center justify-between gap-2 rounded-full border border-forest-800/25 px-5 py-2 text-sm font-medium text-forest-800 transition hover:bg-forest-800 hover:text-cream"
      >
        <span>Visit {host}</span>
        <span aria-hidden="true">↗</span>
      </a>
    </li>
  );
}
