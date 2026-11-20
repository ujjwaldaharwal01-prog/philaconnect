/**
 * Reusable labelled form field with error and hint text.
 * - `id` links the <label> to the input and is also used as the input's name.
 * - `as`: 'input' (default) or 'textarea'.
 * - `error`: message shown in red under the field; also sets aria-invalid for screen readers.
 * Any other props (value, onChange, type, placeholder, maxLength...) go straight to the input.
 */
export default function FormField({ id, label, error, hint, required = false, as: Tag = 'input', className = '', ...rest }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-forest-900">
        {label}
        {required && (
          <span className="text-red-700" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      <Tag
        id={id}
        name={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-gold-500/60 ${
          error ? 'border-red-500' : 'border-forest-800/20 focus:border-gold-500'
        }`}
        {...rest}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-red-700">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink/50">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
