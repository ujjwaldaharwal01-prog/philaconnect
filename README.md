# PHILAConnect

A Smart Digital Platform for Philatelists with AI-Based Recommendation and Integrated E-Commerce.

**Stack:** React (Vite) · Tailwind CSS · Node.js · Express · PostgreSQL

## Build progress

| Step | Feature | Status |
|------|---------|--------|
| 1 | Frontend homepage (this step) | Done |
| 2 | Marketplace, search and filters | Next |
| 3 | Registration / login | Planned |
| 4 | Shopping cart | Planned |
| 5 | Profile and order history | Planned |
| 6 | Community discussions | Planned |
| 7 | AI chatbot + recommendations | Planned |
| 8 | Admin dashboard | Planned |
| 9 | Express + PostgreSQL backend | Planned |

## Run the frontend

```bash
cd client
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into client/dist
```

Requires Node 18+.

## Folder structure and file guide

```
client/
├─ index.html                      HTML shell, Google Fonts, favicon, meta tags
├─ package.json                    Dependencies and npm scripts
├─ vite.config.js                  Vite + React plugin; /api proxy to Express (port 5000) for later
├─ tailwind.config.js              Theme: cream/off-white/forest green/gold, fonts, shadows, float animation
├─ postcss.config.js               Runs Tailwind + Autoprefixer
└─ src/
   ├─ main.jsx                     Mounts React with BrowserRouter
   ├─ App.jsx                      Route table (home, placeholder routes, 404)
   ├─ index.css                    Tailwind layers, .container-page, .stamp-perf (perforation mask), .reveal animation, reduced-motion rules
   ├─ constants/site.js            Nav links, currency config, placeholder page titles
   ├─ utils/format.js              formatPrice(): INR formatting, safe against NaN/undefined
   ├─ hooks/useDocumentTitle.js    Sets the browser tab title per page
   ├─ data/
   │  ├─ stamps.js                 SAMPLE stamp listings + colour palettes (becomes DB data later)
   │  └─ home.js                   SAMPLE homepage copy: categories, steps, chat preview, discussions
   ├─ components/
   │  ├─ layout/
   │  │  ├─ Layout.jsx             Page shell: skip link, Navbar, <Outlet/>, Footer; scroll-to-top on route change
   │  │  ├─ Navbar.jsx             Sticky nav, active underline, cart badge, mobile menu (Escape closes it)
   │  │  └─ Footer.jsx             Brand blurb, link groups, academic-project note
   │  ├─ ui/                       Reusable primitives
   │  │  ├─ Button.jsx             Link or button with 4 variants
   │  │  ├─ SectionHeading.jsx     Eyebrow + title + ornament + description
   │  │  ├─ Reveal.jsx             Scroll-reveal wrapper (IntersectionObserver)
   │  │  ├─ StampFrame.jsx         Perforated stamp border around any content
   │  │  ├─ StampArt.jsx           Original SVG stamp illustrations (bird, monument, flower, train, ship, rocket)
   │  │  ├─ PostmarkSeal.jsx       Decorative circular postmark
   │  │  ├─ Logo.jsx               Brand mark and wordmark
   │  │  └─ Icons.jsx              Inline SVG icons
   │  ├─ stamps/StampCard.jsx      Product card: image, name, country, year, category, condition, price
   │  └─ home/                     Homepage sections: Hero, FeatureStrip, FeaturedStamps, CategoryGrid,
   │                               HowItWorks, AIPreview, CommunityPreview, CallToAction
   └─ pages/
      ├─ HomePage.jsx              Composes the homepage sections
      ├─ PlaceholderPage.jsx       "Coming soon" page so every nav link works for now
      └─ NotFoundPage.jsx          404 page
```

## Important functions

- `formatPrice(amount)` (utils/format.js): formats currency; returns "—" for invalid numbers.
- `Hero.handleSubmit` (components/home/Hero.jsx): trims the query, rejects over 80 characters with an accessible error, then navigates to `/marketplace?q=...`.
- `Reveal` (components/ui/Reveal.jsx): adds `is-visible` once the element enters the viewport; falls back to visible if IntersectionObserver is missing.
- `StampArt` scenes (components/ui/StampArt.jsx): each scene is a function of the palette returning SVG shapes in a 200x240 viewBox.
- `.stamp-perf` (index.css): five stacked CSS mask layers cut the perforation holes. The drop shadow sits on a parent wrapper because masks clip box-shadow.
- `StampCard`: returns `null` for a missing stamp, so one bad record cannot break a list.

## Testing the homepage

1. **Starts cleanly:** `npm run dev`, open http://localhost:5173. The browser console should show no errors.
2. **Navbar:** click Home, Marketplace, Community, Recommendations, About and Login. Each opens its page and the active link gets a gold underline. The Home logo returns to `/`.
3. **Mobile menu:** narrow the window below 1024px. A hamburger appears; open it, tap a link (it closes), and press Escape while open (it closes).
4. **Search:** type "birds" and press Enter. The URL becomes `/marketplace?q=birds`. An empty search goes to `/marketplace`. Paste 81+ characters and the error message appears.
5. **Popular chips and category tiles:** they open `/marketplace?q=...` and `/marketplace?category=...`.
6. **Featured cards:** each shows artwork, name, country, year, category, condition badge and price in ₹.
7. **Responsiveness:** check widths 375px, 768px and 1366px. Grids go 1, 2 and 4 columns.
8. **404:** visit `/nonsense`. The 404 page appears with a way home.
9. **Reduced motion:** enable "reduce motion" in your OS. Animations stop and content stays visible.
10. **Production build:** `npm run build` completes with no errors.

## Notes

- All stamps, discussions and chat text are **sample data**. Stamp artwork is original SVG drawn in code, not reproductions of real stamps.
- No payment integration exists yet; none will be faked.
- The AI chat on the homepage is a static, disabled preview.
- Currency is set in `constants/site.js` (`CURRENCY`); change it there to switch the whole site.
