# Unified Payment, Exchange and Service Section

The user approved both the proposed layout and written scope on 2026-10-09.

- Combine the homepage's payment, used bikes/exchange, and workshop blocks in one full-width light-grey band. Remove the separate white workshop band and its extra vertical gap.
- Use three equal columns above 900px, with subtle vertical dividers. At 900px and below, use compact stacked rows with horizontal dividers.
- Match icon sizes, heading sizes, text alignment, and action spacing. Keep the existing descriptions and all four destinations: `/finance`, `/vehicles/pre-owned`, `/exchange`, and `/service-centre`.
- Use the existing icons and colours. No new photos, cards, prominent heading, animation, or dependencies.
- Scope edits to the homepage and its ownership-section styles. Keep shared service-banner styles unchanged because About and Services also use them.
- Preserve the hero, showroom photo section, bottom navigation, staff portal, and backend. Work locally only; do not deploy or start ngrok as part of this change.
- Verify the layout at 320, 360, 430, 768, 900, 1024, and 1440px; check text fit, divider direction, touch targets, and every action link. Run TypeScript, focused lint, and existing showroom tests.

Self-review: no unresolved placeholders, contradictory layouts, or unrelated changes. No Git repository is present, so this document cannot be committed here.
