# Raipur Road Hero

Date: 2026-10-11

## Direction

Use the desktop, tablet and phone concepts reviewed in this conversation as visual guidance. The user has asked to work locally first, then push to GitHub, then deploy to Vercel. This is a homepage hero change only; no backend, staff portal, navigation or other section redesign.

## Composition

- Keep the existing Gurudev Motors trademark, heading, vehicle information, brand links, sample-price disclaimer and quick actions.
- Add a light illustrated Raipur background, based on the user's Ghadi Chowk and Vivekananda Sarovar photos. Clock tower on the left; statue, palms and lake on the right. This is an illustrative composition, not a geographical map.
- Keep the road mostly horizontal and uninterrupted behind the vehicle. Both wheels must sit on the same road baseline without floating.
- Use separate background artwork and existing transparent vehicle images, rather than baking the vehicle or text into one picture. This supports readable live text, responsive composition and independent motion. A photographic collage is not selected.
- Keep the vehicle prominent and the central copy clear. Artwork may be simplified or independently framed on narrow phones so both landmarks remain recognizable.
- Preserve the current hero as a local fallback while testing the new design.

## Movement

- The five brands remain TVS, Honda, Suzuki, Hero and Bajaj.
- All hero vehicles face right. Normalize only their hero presentation; do not reverse text, brand logos, details, controls or vehicle catalog cards.
- Exactly one vehicle is rendered at a time. It enters from fully outside the left edge, reaches the centre, stays for 2 seconds, exits fully outside the right edge, and is then replaced by the next vehicle entering from the left.
- Replace the old shrinking oval movement with level horizontal travel. Use roughly 650ms for entry and 600ms for exit, with gentle easing.
- Keep previous, next, pause/play and brand selection. Manual selection displays the chosen vehicle at the centre and pauses automatic cycling.
- Respect reduced motion, keyboard interaction, a hidden tab and an off-screen hero. Failed vehicle/background images must leave useful readable content and controls.
- Clicking the vehicle or model keeps opening the brand-filtered vehicle list.

## Responsive Layout

- Desktop: full-width scene, clear heading above, vehicle centred, model/price and specs in readable areas that do not cover the landmarks or moving bike.
- Tablet: reflow metadata and controls as needed instead of shrinking the desktop layout.
- Phone: model and price above the scene, compact three-spec row below, stacked quick actions, existing navy bottom navigation unchanged. Preserve room for the beginning of the next section.
- Avoid horizontal page scrolling and text overlap at 320, 360, 390, 768, 1024 and 1440px widths. Keep touch controls at least 44px and no viewport-scaled fonts.

## Verification and Release

1. Generate and optimize the background artwork from the supplied references, saved inside the project. No real lead data or new database connection.
2. Implement within the existing hero component/styles and narrowly scoped helpers/assets. Keep unrelated local files untouched.
3. Run showroom tests, type checking and the production-mode preview build. Check desktop/tablet/mobile screenshots, image loading, all five facing directions, one-at-a-time movement, 2-second hold, brand navigation, pause/manual selection and reduced-motion behavior.
4. Start a local preview and provide its URL for review. Do not push or deploy the new hero before the local version has been reviewed by the user.
5. After local approval, push only to https://github.com/spaceoccupier/gurudev_motors.git using the verified spaceoccupier account, then deploy a protected Preview to gurudev-motors-preview in spaceoccupier-1939s-projects.
6. Leave gurudev-motors-eight.vercel.app and Vercel production settings unchanged. Automatic GitHub deployment is outside this change.

## Self-Review

The scope preserves the existing information and frontend-only sample behavior. Artwork, live text and vehicle motion are separated. Device-specific layout, motion/accessibility behavior, fallback and release order are explicit. The existing public-site deployment remains untouched until local review.
