# Gurudev Motors Rotating Hero Trial

## Approved Direction

Build a reversible, frontend-only homepage experiment. Show one new vehicle from each of TVS, Honda, Suzuki, Hero and Bajaj. Use internet-sourced side-view manufacturer images with transparent backgrounds. Keep the existing dealership logo unchanged.

## Layout And Motion

- A compact, unframed hero with the Gurudev Motors heading and simple supporting words.
- One vehicle visible at a time. It enters along a shallow oval-shaped path, stays still at the front for 2 seconds, and leaves before the next vehicle appears. The user shortened the original 2.5-second pause on 2026-10-09.
- Show the current vehicle's sample price, engine size, fuel and gears in stable, readable positions, as requested on 2026-10-09.
- Keep the heading, vehicle information and buttons stationary. Animate only the vehicle image.
- Five brand choices, previous/next and pause controls, with keyboard access and at least 44px touch targets.
- Pause when the hero is out of view, the page is hidden or a visitor interacts with it. Respect reduced-motion preferences by disabling automatic movement.
- Use fixed responsive dimensions so image changes never move the content below.
- On phones, fit the whole vehicle without cropping and leave a hint of the next section visible. Use an image area above the action buttons, rather than a text/media card layout.

## Quick Actions

- Explore vehicles opens the existing vehicle list.
- Visit showroom opens the existing contact/directions page.
- Ask for price opens the existing enquiry dialog for the current sample vehicle.
- Clicking the current vehicle photo or model name opens `/vehicles?brand=<current brand>` with that brand selected. Brand tabs continue to select the hero vehicle.
- On narrow phones, the first button occupies one row; the other two share the next row. All remain stationary and usable during animation.

## Header And Staff Access

Use a narrow dark information strip above the white header. Keep copy short on phones. Add a small neutral Staff login header link, also available in the menu and footer. Do not place staff access in the customer bottom navigation. Keep customer actions visually stronger.

## Data And Images

Reuse the existing eight development-only vehicle fixtures. Attach matching sample photos where available and improve their simple descriptions without inventing real stock or offers. Keep price and sample labels visible. Do not use motorcycle imagery for the used-car fixture.

Prefer official transparent manufacturer side views. Record the original source and attribution information locally. If a suitable image has a background, remove only its background and preserve the vehicle. Do not create imaginary branded models. Do not connect sample images or prices to production stock.

## Implementation Boundaries

Improve card visibility with darker text, stronger borders, clear prices and larger feature labels. Use restrained red actions, blue finance information and green only where it indicates actual availability. Keep two-column phone browsing readable without shrinking labels below practical sizes.

Use a separate hero component and scoped stylesheet. Keep a reversible switch between the current intro and the rotating trial. Leave business logic, authentication, APIs and database records unchanged. The existing preview submission guard must remain intact.

If an image fails to load, keep usable text and actions with a static fallback; never leave an empty hero. Keep the current intro available for an immediate fallback.

## Verification

Check 320, 360, 390, 430, 768 and 1440px widths. Verify no overflow, full vehicle framing, readable text, stable buttons, all five images, one visible vehicle, pause and navigation controls, correct enquiry selection, and mobile menu/staff access. Run TypeScript, focused lint and existing showroom tests. Save mobile and desktop screenshots.

## Workflow Status

- [x] Explore the current homepage and local assets.
- [x] Clarify motion, pause timing, quick actions, image sources and mobile priority.
- [x] Compare compact animated cutouts with a heavier 3D carousel; use lightweight cutouts for this trial.
- [x] Present the direction in chat and incorporate user choices.
- [x] Write and review this specification for scope and contradictions.
- [x] User review of this written specification: "Yes, build this trial" on 2026-10-09.
- [x] Implementation plan and reversible changes.
- [x] Browser verification and automated checks. See `2026-10-09-frontend-verification.md`.

No Git repository is present in this downloaded workspace, so this specification cannot be committed here. No site deployment is requested.
