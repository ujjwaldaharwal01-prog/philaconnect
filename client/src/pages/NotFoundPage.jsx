import Button from '../components/ui/Button';
import useDocumentTitle from '../hooks/useDocumentTitle';

/** Shown for any URL that does not match a route (a basic 404 error state). */
export default function NotFoundPage() {
  useDocumentTitle('Page not found');

  return (
    <section className="bg-cream">
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="font-display text-7xl font-semibold text-gold-500">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-forest-900">This page has gone astray</h1>
        <p className="mt-3 max-w-md text-ink/65">
          Like a stamp without postage, we could not deliver that page. Let's get you back on track.
        </p>
        <Button to="/" variant="dark" className="mt-8">
          Return home
        </Button>
      </div>
    </section>
  );
}
