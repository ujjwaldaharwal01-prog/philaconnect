// Site-wide constants. Keeping them in one place means later features
// (cart, checkout, admin) all format money and build navigation the same way.

export const SITE_NAME = 'PHILAConnect';

// Currency settings used by utils/format.js. Change these to switch the whole site.
export const CURRENCY = { code: 'INR', locale: 'en-IN' };

// Primary navigation. `cta: true` renders the item as a highlighted button (Login).
export const NAV_LINKS = [
  { label: 'Quiz', to: '/quiz' },
  { label: 'Game', to: '/game' },
  { label: 'Spin & Win', to: '/spin' },
  { label: 'Home', to: '/' },
  { label: 'Marketplace', to: '/marketplace' },
  { label: 'Community', to: '/community' },
  { label: 'Recommendations', to: '/recommendations' },
  { label: 'About', to: '/about' },
  { label: 'Login', to: '/login', cta: true },
];

// Titles for pages that are not built yet (see PlaceholderPage).
export const PLACEHOLDER_PAGES = {
  
  '/community': {
    title: 'Community',
    blurb: 'Collector discussion boards. Coming in a later build step.',
  },
  '/recommendations': {
    title: 'Recommendations',
    blurb: 'Personalised stamp suggestions. Coming in a later build step.',
  },
  '/about': {
    title: 'About PHILAConnect',
    blurb: 'The story and mission behind the platform. Coming in a later build step.',
  },
  
  '/cart': {
    title: 'Shopping Cart',
    blurb: 'The cart will be built after the marketplace.',
  },
};
