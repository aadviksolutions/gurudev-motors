# Raipur Road Hero Verification

Date: 2026-10-11

Story: sample inventory renders in the Raipur road hero; selecting a brand pauses motion, clicking a vehicle opens its brand-filtered list, and asking for a price opens the existing sample enquiry form with that model selected. No backend changes.

## Checks

- 18 tests pass: showroom safety and data behavior, hero timing constants, phase transitions, manual selection, pause/resume, empty/single inventories, sample-only assets and unchanged catalog records.
- TypeScript check passes. Targeted ESLint check passes without warnings.
- Production-mode Preview build passes. Existing unrelated admin/API lint warnings remain.
- Browser checked at measured CSS widths 320, 360, 390, 768, 1024 and 1440px: no horizontal overflow, loaded scenery and vehicle images, readable model/price and controls.
- All five brand selectors: one loaded right-facing vehicle, correct brand URL, manual selection paused at centre.
- Browser motion sampling: holds measured approximately 1.96 and 2.10 seconds at 100ms sampling intervals; 600ms exit and 650ms entry configured. Every sampled frame contained exactly one vehicle image.
- Clicking TVS bike opened `/vehicles?brand=TVS`, with TVS selected and two sample results.
- Bajaj enquiry prefilled `Bajaj Pulsar N160`; no form submission or real lead created.
- Small-phone Bajaj check: longest price fits; all hero buttons at least 44px (within subpixel rounding); actions finish above the fixed mobile navigation.
- Both fallbacks render after hydration: `?hero=oval` and `?hero=classic`.
- Browser console: no errors; existing Next.js smooth-scroll migration warning only.
- Reduced-motion, hidden-tab and off-screen guards reviewed in code. Reduced-motion state transitions tested; native OS reduced-motion emulation was not available in the browser tool.
- Failed-image state retains the animated wrapper and readable fallback so a broken vehicle image does not stall cycling.

## Art

Generated with the built-in image tool. Raipur scenery uses user-supplied landmark references. Bajaj is an AI-edited design sample; the catalog original is unchanged. All prompts and per-asset sources are in `public/images/hero/sources.json`. WebP assets are saved inside the project.

## Release Authorization

The user subsequently requested: "after fixing changes deploy in vercel and give me the link". This supersedes the earlier wait-for-local-review gate. Push only to `spaceoccupier/gurudev_motors`, then deploy to `gurudev-motors-preview` under `spaceoccupier-1939s-projects`. Keep deployment protection and the old live website unchanged.
