import Button from '../ui/Button';

/** Friendly "please log in" panel shown on pages that need an account (checkout, profile, orders). */
export default function LoginPrompt({ title = 'Please log in to continue', message }) {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-forest-800/10 bg-offwhite px-6 py-14 text-center shadow-card" data-testid="login-prompt">
      <h2 className="font-display text-2xl font-semibold text-forest-900">{title}</h2>
      {message && <p className="mt-3 text-ink/65">{message}</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button to="/login" variant="dark">
          Log in
        </Button>
        <Button to="/register" variant="outlineDark">
          Create an account
        </Button>
      </div>
    </div>
  );
}
