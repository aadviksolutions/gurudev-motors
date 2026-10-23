# Mobile Navigation and Showroom Photos: Plan

The user approved the written design on 2026-10-09. The writing-plans skill is not installed in this workspace; this focused plan records the implementation steps instead.

1. Update the existing mobile navigation labels, active semantics, icon containers, navy styling, safe-area spacing, and reserved page clearance. Preserve route exclusions and callbacks.
2. Add a shared, typed list of the four inspected local photos. Create a small image component with a failure state and a homepage photo section with the approved responsive layout.
3. Reuse the existing native Dialog component for photo viewing, adding next/previous controls and scoped keyboard handling in the photo section. Keep dialog behavior shared and unchanged.
4. Replace only the existing homepage photo section. Reuse the four-photo list in the design-preview gallery, leaving its real API path untouched.
5. Run TypeScript, focused ESLint, and showroom regression tests. Add asset metadata checks and verify responsive layouts and key interactions in the browser.
6. Save mobile/desktop screenshots and verification notes. Leave the local draft server running; do not deploy.
