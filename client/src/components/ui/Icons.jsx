// Small inline SVG icon set (stroke icons, inherit colour via currentColor).
// Using inline SVG avoids an icon-library dependency.

function Icon({ children, className = 'h-5 w-5', ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const ArrowRight = (p) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
export const SearchIcon = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4-4" />
  </Icon>
);
export const CartIcon = (p) => (
  <Icon {...p}>
    <path d="M3 4h2.5l2 11h10l2-8H7" />
    <circle cx="9.5" cy="19.5" r="1.3" />
    <circle cx="17" cy="19.5" r="1.3" />
  </Icon>
);
export const MenuIcon = (p) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);
export const CloseIcon = (p) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);
export const TagIcon = (p) => (
  <Icon {...p}>
    <path d="M3 12V4h8l10 10-8 8L3 12z" />
    <circle cx="7.5" cy="8.5" r="1.2" />
  </Icon>
);
export const SparkleIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
    <path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" />
  </Icon>
);
export const UsersIcon = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
    <path d="M16 5.2a3 3 0 010 5.6M18 14.8c1.9.7 3 2.4 3 5.2" />
  </Icon>
);
export const ShieldIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3z" />
    <path d="M8.5 12l2.5 2.5L15.5 10" />
  </Icon>
);
export const ChatIcon = (p) => (
  <Icon {...p}>
    <path d="M4 5h16v11H9l-5 4V5z" />
  </Icon>
);
export const MessageIcon = ChatIcon;

// Lookup used by data-driven sections (features list) to pick an icon by name.
export const ICONS = {
  tag: TagIcon,
  sparkle: SparkleIcon,
  users: UsersIcon,
  shield: ShieldIcon,
};
