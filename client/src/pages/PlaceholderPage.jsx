import { useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { PLACEHOLDER_PAGES } from '../constants/site';

/**
 * Temporary page for routes that will be built in later steps, so every navbar link
 * works today. The title/blurb come from PLACEHOLDER_PAGES, keyed by URL path.
 * Delete the matching entry (and add a real route in App.jsx) as each feature is built.
 */
export default function PlaceholderPage() {
  const { pathname } = useLocation();
  const page = PLACEHOLDER_PAGES[pathname] ?? { title: 'Coming soon', blurb: 'This page is under construction.' };
  useDocumentTitle(page.title);

  return (
    <section className="bg-cream">
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">Coming soon</p>
        <h1 className="mt-3 text-4xl font-semibold text-forest-900">{page.title}</h1>
        <p className="mt-4 max-w-md text-ink/65">{page.blurb}</p>
        <Button to="/" variant="dark" className="mt-8">
          Back to home
        </Button>
      </div>
    </section>
  );
}
