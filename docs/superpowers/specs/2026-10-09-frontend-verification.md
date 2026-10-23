# Frontend Trial Verification

Local preview: http://127.0.0.1:3001/ . The live Vercel website has not been changed.

## Implemented

- Five-brand rotating hero with local transparent images, sample prices, engine/fuel/gears, a 2-second front pause, fixed actions and accessible playback controls.
- Hero photo and model links open the current brand's filtered vehicle list.
- Existing intro remains available at `/?hero=classic`; rotating trial is development-preview only.
- Short vehicle-range, used-bike/exchange, service, showroom-photo and combined about/visit sections. Preview gallery displays the same two local showroom photos.
- Dark blue utility strip and matching footer. Footer-only transparent light/red logo variant; original header logo unchanged. The footer variant was derived from `public/images/logo.jpeg` using image generation and should be approved against official brand artwork before publication.
- Shared vehicle card places specs beside the name on the homepage, all catalog routes and related-vehicle lists.
- Small Staff login header link and scroll-independent staff access in the mobile menu.

## Automated Checks

- TypeScript: `node node_modules/typescript/bin/tsc --noEmit`, passed.
- Focused ESLint on eight changed TS/TSX modules: passed, no warnings.
- `node --test scripts/test-showroom.mjs`: 8 tests passed, including local asset/source presence and production preview isolation.

## Browser Checks

- Homepage width checks at 320, 360, 390, 430, 768 and 1440px: no horizontal overflow.
- Card checks across 14 homepage/catalog/detail routes at 320, 360, 430 and 1440px: 56 route/viewport combinations, no name/spec overlap or card overflow. Results: `docs/compact-card-audit.json`.
- Five hero images loaded; exactly one hero image in the DOM for each brand. The browser uses responsive optimized image sources.
- Measured front dwell: 2012ms, including browser observation latency, against a 2000ms implementation timer. Entry/exit movement follows the pause.
- Pause/resume and manual brand selection checked. Hover pause scoped to the image so the Play control works while hovered.
- Clicked every brand's hero image: each reached `/vehicles?brand=...` and displayed only matching-brand records.
- Suzuki hero enquiry prefilled `Suzuki Access 125`. No enquiry was submitted.
- Classic fallback renders the original intro with no rotating hero.
- Both gallery photos loaded; phone gallery has no horizontal overflow.
- Mobile navigation at 360x420: Staff login remains visible inside the dialog without scrolling the menu.
- Footer and utility strip both compute to `rgb(9, 23, 46)`.
- Mobile and desktop screenshots saved in `docs/hero-trial-mobile.jpg`, `docs/hero-trial-desktop.jpg` and `docs/footer-mobile.jpg`.

## Limits

Image-error fallback, reduced-motion handling and hidden-page pause were reviewed in code; failure injection and operating-system reduced-motion switching were not exercised. This is a frontend draft, not a stock, vehicle specification, pricing or brand-artwork approval. No backend changes or production deployment were performed.
