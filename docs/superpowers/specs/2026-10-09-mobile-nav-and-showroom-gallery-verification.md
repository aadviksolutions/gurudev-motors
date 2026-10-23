# Mobile Navigation and Showroom Photos: Verification

Implemented locally on 2026-10-09 after approval of the written design.

## Automated Checks

- TypeScript: `node node_modules/typescript/bin/tsc --noEmit --incremental false` passed.
- Next ESLint: all six changed TypeScript/TSX files passed without warnings or errors.
- Showroom tests: 9 passed, including a new check that the four photo files exist, have captions, and are not duplicate images.

## Browser Checks

- Homepage tested at 320, 360, 430, 768, and 1440px widths. No horizontal overflow, clipped photo captions, or clipped mobile navigation labels.
- All four photos loaded. Desktop responsive-image upgrades were rechecked after loading.
- Mobile navigation items exceed 44px in both dimensions; the bar is hidden at tablet/desktop widths.
- Home, Vehicles, Service, and Visit us navigate correctly and update active state. Ask price opens the existing enquiry dialog; no form was submitted.
- Vehicle category routes identify Vehicles as the current location. Vehicle details retain their separate contact controls and hide the new bar; admin login also has no customer bar.
- Footer links remain above the bottom bar at maximum scroll. At 360x800, the footer ends at about 710px and the bar starts at 724px.
- Photo viewer tested by pointer and keyboard: open, close, next/previous, wrapping, arrow keys, Escape, forward/reverse Tab loops, and focus return to the opening photo.
- Photo viewer fits a short 360x480 viewport, including its close and previous/next controls.
- See all photos opens `/gallery`. Preview filters correctly return one showroom photo, two vehicle photos, one workshop photo, or all four.
- The Instagram link points to the supplied account. No Instagram media was embedded or downloaded.
- Browser viewport overrides were reset after testing.

## Evidence

- `docs/qa/nav-gallery/mobile.png`
- `docs/qa/nav-gallery/desktop.png`
- `docs/qa/nav-gallery/responsive-checks.json`
- `docs/qa/nav-gallery/interaction-checks.json`

## Boundaries

Backend, real gallery fetch path, enquiry submission logic, hero, inventory cards, and staff portal are unchanged. This was a focused frontend check, not a repeat of the earlier full-site mobile audit. Native hardware safe areas were handled in CSS but not tested on a physical device. Image-failure fallback was code-reviewed, not network-fault injected in the browser. An existing hero-image LCP priority warning remains outside this change.

The local draft server remains at `http://127.0.0.1:3001/`. Nothing was deployed.
