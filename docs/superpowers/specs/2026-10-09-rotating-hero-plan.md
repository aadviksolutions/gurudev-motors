# Implementation Plan

The requested writing-plans skill is not installed. This local checklist follows the approved design using the existing Next.js and CSS patterns.

1. Save official side-view images locally and record sources. Verify transparency, complete vehicle framing and file sizes.
2. Add sample photo references only to development fixtures; make VehicleVisual render these without changing production inventory behavior.
3. Add a separate rotating hero component and scoped CSS. Use one rendered vehicle at a time, a 2-second dwell (updated by the user), curved entry/exit, reduced-motion support, manual controls and stable actions.
4. Keep the original homepage intro behind a reversible development-only query switch. Retain search and categories below the hero.
5. Add the understated Staff login header/menu/footer entries and dark utility strip. Improve card text, contrast and borders without changing data flow.
6. Test motion timing, controls, links, enquiry selection, image errors, hidden-page behavior and viewport boundaries. Run TypeScript, lint and showroom tests. Keep the preview server available and save screenshots.

Implemented and checked on 2026-10-09. See `2026-10-09-frontend-verification.md` for results and manual checks that remain.
