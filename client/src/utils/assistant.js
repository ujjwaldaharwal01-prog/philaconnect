// utils/assistant.js
// The brain of the PHILA Assistant. Pure functions (no React, no network), so they are easy to test.
//
// HOW IT WORKS (a built-in guide, not an online AI service):
//   1. Greetings / thanks / goodbye are answered directly.
//   2. If the message asks for stamps ("suggest bird stamps from the 1970s under 2000"), we pull out
//      the country, theme, era, condition and budget and rank the marketplace with recommend().
//   3. Otherwise we match keywords against a guide of philately questions (grading, identification,
//      forgeries, albums, storage, value...) and website help (payment, orders, community...).
//   4. If nothing matches, we say so and suggest things to ask.
// Later, this file can be swapped for a real AI model on the server without changing the chat window.

import { stamps } from '../data/stamps';
import { CONDITION_INFO } from '../data/stamps';
import { recommend, EMPTY_PREFS } from './recommend';
import { formatPrice } from './format';

export const SUGGESTIONS = ['How do I grade a stamp?', 'Spot a forged overprint', 'Best albums for beginners', 'Suggest bird stamps under ₹2,000', 'How do I pay?'];

export const GREETING =
  'Hello! I am the PHILA Assistant. Ask me about grading, identifying or storing stamps, or tell me what you collect and I will suggest stamps from the marketplace.';

// ---------- knowledge ----------
const COUNTRY_ALIASES = {
  uk: 'United Kingdom', britain: 'United Kingdom', england: 'United Kingdom', 'great britain': 'United Kingdom',
  usa: 'United States', us: 'United States', america: 'United States',
  russia: 'USSR', soviet: 'USSR', 'soviet union': 'USSR',
  holland: 'Netherlands',
};
const COUNTRIES = [...new Set(stamps.map((s) => s.country))];

const CATEGORY_WORDS = {
  'Birds & Wildlife': ['bird', 'birds', 'wildlife', 'animal', 'animals', 'kingfisher', 'tiger', 'fauna'],
  'Monuments & Heritage': ['monument', 'monuments', 'heritage', 'fort', 'temple', 'palace', 'architecture'],
  Flora: ['flower', 'flowers', 'flora', 'plant', 'plants', 'botanical', 'orchid'],
  'Railways & Transport': ['train', 'trains', 'railway', 'railways', 'locomotive', 'transport', 'steam'],
  Maritime: ['ship', 'ships', 'maritime', 'sailing', 'boat', 'navy', 'sea'],
  'Space & Science': ['space', 'rocket', 'rockets', 'science', 'satellite', 'astronaut', 'moon'],
};

const FAQ = [
  {
    id: 'grading',
    keys: ['grade', 'grading', 'condition', 'centering', 'centring', 'mint', 'hinged', 'mnh'],
    answer:
      `Grading means judging a stamp's condition. On PHILAConnect we use:\n` +
      Object.entries(CONDITION_INFO).map(([k, v]) => `• ${k}: ${v}`).join('\n') +
      `\nCheck four things: centring (is the picture evenly framed?), perforations (no short or missing teeth), gum (for unused stamps) and faults such as thins, creases, tears or stains. Look under a magnifier in good light.`,
  },
  {
    id: 'identify',
    keys: ['identify', 'identification', 'identifying', 'which stamp', 'what stamp', 'watermark', 'perforation', 'perforations', 'gauge', 'catalogue', 'catalog'],
    answer:
      `To identify a stamp: 1) read the country name or inscription and the denomination; 2) note the year or any commemoration text; 3) measure the perforations with a perforation gauge and look for a watermark (hold it to the light or use watermark fluid); 4) match it with a catalogue such as Stanley Gibbons, Scott or Michel, or an online catalogue. Still stuck? Post a clear photo on our Community board and collectors will help.`,
  },
  {
    id: 'forgery',
    keys: ['forged', 'forgery', 'fake', 'forgeries', 'overprint', 'genuine', 'authentic', 'authenticity', 'counterfeit'],
    answer:
      `Forged overprints are a known risk, especially on valuable stamps. How to protect yourself: compare with a reliable reference image of the genuine overprint (shape of letters, spacing, position, ink colour); look for signs such as a different typeface or an overprint that sits on top of the gum; buy from reputable dealers who give returns; and for expensive stamps ask for an expert certificate from a recognised expertising body. If a price looks too good to be true, be careful. I cannot judge a stamp from here, so treat this as general guidance.`,
  },
  {
    id: 'albums',
    keys: ['album', 'albums', 'stock book', 'stockbook', 'supplies', 'tongs', 'beginner', 'beginners', 'tools', 'equipment', 'magnifier'],
    answer:
      `A simple starter kit for beginners: a stock book (pages with strips to slide stamps into) is the cheapest way to begin; later you can move to a hingeless album for your best stamps. Also get stamp tongs (never touch stamps with fingers), a magnifying glass, a perforation gauge and clear mounts. Choose acid-free materials so stamps do not discolour.`,
  },
  {
    id: 'storage',
    keys: ['store', 'storage', 'storing', 'preserve', 'protect', 'damp', 'humidity', 'sunlight', 'handle', 'handling', 'clean', 'cleaning'],
    answer:
      `Keep stamps in a cool, dry, dark place; sunlight fades colours and humidity causes sticking and mould. Handle them only with tongs, keep them in acid-free mounts or albums, and never use ordinary tape or glue. Do not try to clean mint stamps: water can wash off gum and damage the paper.`,
  },
  {
    id: 'soak',
    keys: ['soak', 'soaking', 'remove', 'envelope', 'off paper', 'peel'],
    answer:
      `To remove a used stamp from an envelope, cut it out leaving a small border of paper, float it face-up in lukewarm water for 10 to 20 minutes until it slides off, then dry it flat between clean blotting paper under a light weight. Never peel it dry, and test unusual or brightly coloured stamps first because some inks run.`,
  },
  {
    id: 'value',
    keys: ['value', 'worth', 'price', 'valuable', 'rare', 'rarity', 'expensive', 'valuation', 'appraise'],
    answer:
      `A stamp's value depends on rarity, condition, demand and how many were printed. Catalogues give guide prices, but real value is what buyers actually pay, so compare recent sale prices. Mint, well-centred stamps usually cost more than used ones. Note: the prices in this marketplace are sample data for demonstration, so please do not treat them as real valuations.`,
  },
  {
    id: 'start',
    keys: ['start', 'starting', 'begin', 'new collector', 'how to collect', 'getting started', 'first stamp'],
    answer:
      `Welcome to the hobby! Pick a focus that excites you, such as one country, a theme like birds or trains, or an era. Start with affordable stamps, keep them in a stock book, learn grading basics and join other collectors in our Community. Tell me your interests and I will suggest stamps from the marketplace.`,
  },
  {
    id: 'pay',
    keys: ['pay', 'payment', 'cod', 'cash on delivery', 'upi', 'bank transfer', 'pay later', 'paylater', 'checkout', 'card'],
    answer:
      `At checkout you can choose Cash on Delivery or Pay later by bank / UPI transfer. No online card payment is taken on this website. After a pay-later order we contact you on your phone number with the transfer details.`,
    links: [{ label: 'Go to cart', to: '/cart' }],
  },
  {
    id: 'orders',
    keys: ['order', 'orders', 'track', 'tracking', 'delivery', 'deliver', 'shipping', 'ship', 'status', 'where is my'],
    answer:
      `You can see all your orders, with their status, in your profile (click "Hi, your name" in the menu). Open an order to see its items, payment and delivery address. Shipping charges and timing are confirmed when we contact you after you place the order. You must be logged in to see orders.`,
    links: [{ label: 'My orders', to: '/profile' }],
  },
  {
    id: 'account',
    keys: ['login', 'log in', 'register', 'signup', 'sign up', 'account', 'password'],
    answer: `Use Login in the menu to sign in or create an account. You need an account to place orders and to post in the Community. Browsing the marketplace and reading discussions is open to everyone.`,
    links: [{ label: 'Login', to: '/login' }],
  },
  {
    id: 'community',
    keys: ['community', 'forum', 'discussion', 'club', 'society', 'meet collectors', 'connect'],
    answer: `Our Community page has a discussion board where you can ask questions and show your finds, and a directory of real philatelic societies and forums around the world.`,
    links: [
      { label: 'Community board', to: '/community' },
      { label: 'Global communities', to: '/communities' },
    ],
  },
  {
    id: 'cart',
    keys: ['cart', 'basket', 'add to cart', 'quantity'],
    answer: `Use "Add to cart" on any stamp. You can change quantities (up to 5 of each stamp) in your cart, and your cart is remembered on this device.`,
    links: [{ label: 'Open cart', to: '/cart' }],
  },
  {
    id: 'about',
    keys: ['who made', 'who built', 'creator', 'developer', 'about this website', 'about philaconnect', 'who are you'],
    answer: `PHILAConnect was designed and developed by Ujjval Daharwal as a final-year academic project. I am a built-in guide that answers from the stamp marketplace and a philately knowledge base.`,
    links: [{ label: 'About', to: '/about' }],
  },
];

// ---------- helpers ----------
const norm = (s) => ` ${String(s).toLowerCase().replace(/[^a-z0-9₹'\s&.,]/g, ' ').replace(/\s+/g, ' ').trim()} `;
const has = (text, word) => text.includes(` ${word} `) || text.includes(` ${word}s `) || (word.includes(' ') && text.includes(word));

/** Pulls countries, themes, era, condition and budget out of a free-text message. */
export function parseCriteria(message) {
  const text = norm(message);
  const prefs = { ...EMPTY_PREFS, countries: [], categories: [], conditions: [] };

  COUNTRIES.forEach((c) => {
    if (text.includes(` ${c.toLowerCase()} `)) prefs.countries.push(c);
  });
  Object.entries(COUNTRY_ALIASES).forEach(([alias, c]) => {
    if (text.includes(` ${alias} `) && !prefs.countries.includes(c)) prefs.countries.push(c);
  });
  Object.entries(CATEGORY_WORDS).forEach(([cat, words]) => {
    if (words.some((w) => text.includes(` ${w} `))) prefs.categories.push(cat);
  });

  let outOfRange = false;
  const decade = text.match(/\b(19\d)0'?s\b/);
  const year = text.match(/\b(19\d\d|20\d\d)\b/);
  const d = decade ? Number(decade[1]) * 10 : year ? Math.floor(Number(year[1]) / 10) * 10 : null;
  if (d !== null) {
    if (d >= 1950 && d <= 1980) prefs.era = `${d}s`;
    else outOfRange = true;
  }

  if (text.includes(' mint hinged ')) prefs.conditions.push('Mint Hinged');
  else if (text.includes(' mint ')) prefs.conditions.push('Mint');
  if (text.includes(' very fine ')) prefs.conditions.push('Very Fine');
  if (text.includes(' fine used ')) prefs.conditions.push('Fine Used');
  else if (text.includes(' used ') && !prefs.conditions.length) prefs.conditions.push('Used');

  const money = message.match(/(?:under|below|less than|within|upto|up to|max(?:imum)?|budget(?: of)?|around)\s*(?:rs\.?|inr|₹)?\s*([\d,]{2,7})/i) || message.match(/₹\s*([\d,]{2,7})/);
  if (money) {
    const n = Number(money[1].replace(/,/g, ''));
    if (Number.isFinite(n) && n > 0) prefs.budget = n;
  }
  return { prefs, outOfRange };
}

const hasCriteria = (p) => p.countries.length || p.categories.length || p.conditions.length || p.era !== 'any' || p.budget > 0;
const REC_WORDS = /\b(recommend|suggest|suggestion|show me|find me|find|looking for|which stamps|i collect|i like|i love|i want|i need|stamps from|stamps of|any stamps|best stamps)\b/i;

function matchFaq(text) {
  let best = null;
  FAQ.forEach((f) => {
    const score = f.keys.reduce((n, k) => n + (has(text, k) ? (k.includes(' ') ? 2 : 1) : 0), 0);
    if (score > 0 && (!best || score > best.score)) best = { faq: f, score };
  });
  return best;
}

const describePrefs = (p) =>
  [
    p.categories.length ? `${p.categories.join(' and ')} stamps` : 'stamps',
    p.countries.length ? `from ${p.countries.join(' or ')}` : '',
    p.era !== 'any' ? `of the ${p.era}` : '',
    p.conditions.length ? `in ${p.conditions.join(' or ')} condition` : '',
    p.budget > 0 ? `under ${formatPrice(p.budget)}` : '',
  ]
    .filter(Boolean)
    .join(' ');

function recommendReply(prefs, outOfRange, cartItems) {
  const { picks } = recommend(stamps, prefs, cartItems, 3);
  const what = describePrefs(prefs);
  const note = outOfRange ? ' (Our sample collection covers the 1950s to the 1980s.)' : '';
  if (picks.length === 0) {
    return {
      text: `I could not find ${what}. Try a higher budget, another theme or a different era.${note}`,
    };
  }
  return {
    text: `Here ${picks.length === 1 ? 'is a pick' : `are ${picks.length} picks`}: ${what}.${note}`,
    picks: picks.map((p) => ({ stampId: p.stamp.id, reasons: p.reasons })),
    links: [{ label: 'See more recommendations', to: '/recommendations' }],
  };
}

// ---------- main ----------
/**
 * Returns the assistant's reply to `message`.
 * Reply shape: { text, picks?: [{stampId, reasons[]}], links?: [{label, to}] }
 * `cartItems` (from useCart) are only used to avoid suggesting stamps already in the cart.
 */
export function reply(message, cartItems = []) {
  const raw = String(message || '').trim().slice(0, 300);
  const text = norm(raw);
  if (!raw) return { text: 'Please type a question, for example "How do I grade a stamp?"' };

  if (/^ (hi|hello|hey|namaste|hii+|good (morning|afternoon|evening)) /.test(text) && text.split(' ').length <= 6) {
    return { text: GREETING };
  }
  if (/^ (thanks|thank you|thx|ok thanks|great|nice|awesome) /.test(text) && text.split(' ').length <= 5) {
    return { text: 'You are welcome! Ask me anything else about stamps or the website.' };
  }
  if (/^ (bye|goodbye|see you|good night) /.test(text)) {
    return { text: 'Goodbye, and happy collecting!' };
  }
  if (/\b(what can you do|help|what do you do)\b/i.test(raw) && text.split(' ').length <= 6) {
    return {
      text: 'I can explain grading, identification, forgeries, storage and albums; suggest stamps by country, theme, era, condition and budget; and help with payment, orders and the community.',
    };
  }

  // A specific stamp mentioned by name.
  const named = stamps.filter((s) => text.includes(` ${s.name.toLowerCase()} `));
  if (named.length > 0 && !REC_WORDS.test(raw)) {
    const s = named[0];
    return {
      text: `${s.name} is a ${s.condition} stamp from ${s.country}, ${s.year}, in the ${s.category} category, priced at ${formatPrice(s.price)}.`,
      picks: [{ stampId: s.id, reasons: [] }],
    };
  }

  const { prefs, outOfRange } = parseCriteria(raw);
  // Several clues at once (e.g. "mint ships under 500 from japan") means the person wants stamps.
  const clues = [prefs.countries.length, prefs.categories.length, prefs.era !== 'any', prefs.budget > 0].filter(Boolean).length;
  const wantsStamps = REC_WORDS.test(raw) || clues >= 2;
  const faq = matchFaq(text);

  if (/\b(cheapest|lowest price|least expensive)\b/i.test(raw)) {
    const s = [...stamps].sort((a, b) => a.price - b.price)[0];
    return { text: `The most affordable stamp right now is ${s.name} (${s.country}, ${s.year}) at ${formatPrice(s.price)}.`, picks: [{ stampId: s.id, reasons: [] }] };
  }
  if (/\b(most expensive|costliest|highest price)\b/i.test(raw)) {
    const s = [...stamps].sort((a, b) => b.price - a.price)[0];
    return { text: `The most valuable listing right now is ${s.name} (${s.country}, ${s.year}) at ${formatPrice(s.price)}.`, picks: [{ stampId: s.id, reasons: [] }] };
  }

  // FAQ wins unless the person clearly asks for stamps.
  if (faq && !wantsStamps) {
    return { text: faq.faq.answer, links: faq.faq.links };
  }
  if (wantsStamps || hasCriteria(prefs)) {
    if (!hasCriteria(prefs)) {
      return {
        text: 'Happy to suggest stamps! Tell me a theme (birds, flowers, trains, ships, space, monuments), a country, an era (1950s to 1980s) or a budget, for example "birds from the 1970s under ₹2,000".',
      };
    }
    return recommendReply(prefs, outOfRange, cartItems);
  }
  return {
    text: 'I am not sure about that one. I can help with grading, identifying stamps, forgeries, albums, storage, payment and orders, or suggest stamps if you tell me what you collect.',
  };
}
