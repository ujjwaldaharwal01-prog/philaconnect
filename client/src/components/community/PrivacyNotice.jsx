/** Short list of the privacy protections of the chat. Shown above the chat window. */
export default function PrivacyNotice() {
  return (
    <div className="rounded-xl border border-gold-500/40 bg-gold-400/10 p-4 text-sm text-ink/80" data-testid="privacy-notice">
      <p className="font-semibold text-forest-900">Your privacy in this chat</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Only your chosen nickname is shown, never your real name or email.</li>
        <li>Phone numbers, email / UPI ids and links are hidden automatically.</li>
        <li>Messages are deleted after 7 days. You can delete your own any time.</li>
        <li>Never share OTPs, passwords or bank details with anyone.</li>
      </ul>
    </div>
  );
}
