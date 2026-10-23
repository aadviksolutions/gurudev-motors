# Mobile Navigation and Showroom Photos

Date: 2026-10-09
Status: Visual directions and written scope approved by the user.

## Scope

Apply the user's selected Option B navigation and approved mixed-size showroom photo layout to the local frontend. Keep the hero, vehicle cards, enquiry submission behavior, staff portal, and backend unchanged. Do not deploy.

## Mobile Navigation

- Use the existing header/footer navy, `#09172e`, in an inset bottom bar with an 8px corner radius and a red price action.
- Keep five visible icon-and-text actions: Home, Vehicles, Ask price, Service, Visit us.
- Preserve current destinations: `/`, `/vehicles`, existing enquiry callback, `/service-centre`, and `/contact`.
- Replace Explore and Enquire with the simpler labels above; use existing Lucide icons.
- Highlight the current destination visibly and with `aria-current`. Give every action at least a 44px touch target, clear keyboard focus, and readable labels at 320px width.
- Respect device safe-area insets and reserve page space so the bar cannot cover the last content or form controls.
- Keep the bar hidden on desktop, admin routes, and vehicle detail pages. Vehicle detail pages retain their separate contact actions.
- Staff login stays in its existing quiet header/menu/footer positions, not in the bottom bar.

## Inside Gurudev Motors

Keep the existing heading: "INSIDE GURUDEV MOTORS / Take a look around."

Use four distinct existing assets with captions based on their visible content, not their filenames:

| Asset | Caption |
| --- | --- |
| `/images/showroom-1.jpeg` | Our showroom |
| `/images/showroom-2.jpeg` | Bikes on display |
| `/images/bikes-1.jpeg` | Scooters |
| `/images/desk.jpeg` | Bike service |

- Desktop: a tall showroom card on the left, bikes and scooters side by side above a wide service card on the right.
- Mobile: a tall showroom card on the left, bikes and scooters stacked on the right, and a full-width service card below.
- Use restrained borders, corner radii no greater than 8px, short captions, and clear photo-opening icons. Do not overlap, tilt, or automatically rotate the cards.
- Preserve the full photos with contain sizing; do not crop away the showroom or vehicles. Keep stable media dimensions to avoid layout shifts.
- Tapping a photo opens an accessible full-photo dialog with a close button, previous/next controls, photo count, Escape dismissal, trapped focus, and focus returned to the opening card. On phones, fit the image and controls within the visible viewport.
- Keep "See all photos" linked to `/gallery`; the isolated prototype used the photo viewer for this control only as a demonstration.
- Add a small "Watch on Instagram" link to `https://www.instagram.com/gurudevmotorsraipur/reels/`. Do not embed, autoplay, or download Instagram media. Individual reels were login-gated during inspection.
- Leave the existing About/showroom address/opening hours section below the gallery intact. The abbreviated visit block in the prototype is context, not an approved replacement.

## Implementation Boundaries

- Update `MobileBottomNav` and its scoped responsive styles, retaining the existing enquiry integration.
- Extract the homepage photo section into a focused client component using the project's existing Next Image and dialog patterns where suitable.
- Share a small photo metadata list between the homepage and design-preview gallery so `/gallery` shows the same four photos locally. Preserve the real gallery API and its loading/error states.
- Failed images should retain their layout and caption, with a plain "Photo unavailable" state rather than a broken icon.
- All changes remain frontend-only. No new database records, lead submissions, authentication changes, external media integrations, or extra dependencies are required.

## Verification

- Check 320px, 360px, 430px, tablet, and desktop layouts for horizontal overflow, caption clipping, image loading, and bottom-bar obstruction.
- Verify all five navigation actions, active states, enquiry opening/closing, and detail/admin exclusions.
- Verify the photo viewer with pointer and keyboard, including Escape, next/previous, focus return, and mobile viewport fit.
- Check `/gallery` preview photos and filters; ensure real-data fetch behavior remains unchanged.
- Run TypeScript, focused lint/tests, and capture mobile/desktop screenshots of the local app.

## Review Notes

The user chose Option B and approved the photo arrangement in the browser preview. This written scope has been checked for contradictory requirements and unrelated changes. The downloaded project has no Git repository, so this document cannot be committed here.
