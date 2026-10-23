# Vercel Design Preview Deployment

Date: 2026-10-11

## Approved Target

- Vercel account: `spaceoccupier-1939`.
- Team: `spaceoccupier-1939s-projects`.
- New project: `gurudev-motors-preview`, created with the user's approval.
- Source: the current local `gurudev-motors-main` folder.
- GitHub destination: `https://github.com/spaceoccupier/gurudev_motors.git`. The CLI identity is verified as `spaceoccupier`, with admin access to this empty repository.
- Deployment environment: Preview, not Production.
- Do not change `gurudev-motors-eight.vercel.app`.
- Subsequent user instruction: push to the user's Spaceoccupier GitHub account before deployment. Verify the exact owner first; never push to `bikramsinghal007`, `by-matrix`, or another account.

## Approaches

1. Recommended: deploy the existing design preview with sample data, a supported security-patched Next.js release, and existing Vercel deployment protection retained.
2. Deferred: launch a production customer site with real inventory, real lead submissions and a configured database. This exceeds the current frontend-only scope.

## Necessary Compatibility Work

The application uses Next.js 14.2.15. Vercel's May 2026 security advisory identifies all Next.js 14 versions as affected and recommends upgrading. Use the latest verified Next.js 15 maintenance release, currently 15.5.27, with a matching ESLint configuration. Make only the request-API and route-typing changes required by that upgrade. Keep the design and existing domain logic unchanged.

The current sample-mode check deliberately rejects every production build, including Vercel Preview builds. Extend it to allow sample mode when both the explicit design-preview flag and Vercel's Preview environment are present. Convey the environment consistently to server and browser bundles. A Vercel Production deployment must still ignore the sample flag.

## Data and Access

- Preserve sample vehicles, prices, photographs, the rotating hero and design-preview notices.
- Public enquiry and test-ride forms remain simulated; they must not submit real leads.
- Do not provision, migrate, seed, or connect any real database.
- Do not copy production credentials or local environment files into the deployment.
- Generate a fresh server-only JWT secret for this preview project's Preview environment; never print it or put it in browser configuration.
- Keep Vercel's deployment protection unchanged. Do not make the preview publicly accessible by disabling protection.
- Staff design screens remain available as they are; this is not a production authentication or backend launch.

## Deployment Packaging

Link the local folder explicitly to the approved project and verify the resolved team and project before deploying. Exclude local logs, QA artifacts, design-source folders, environment files and dependencies from source upload. Upload only the application source, runtime assets, dependency manifests, Prisma schema and required configuration.

## Verification

- Tests cover local preview, Vercel Preview with and without opt-in, and Vercel Production refusing sample mode.
- TypeScript, lint, showroom tests and a production-mode preview build pass.
- Verify the Vercel deployment reaches READY and record its URL and environment.
- Check homepage, vehicle filters, vehicle details and the staff design entry point.
- Check desktop and mobile rendering, hero assets, and a simulated enquiry without a backend write.
- If deployment protection prevents unauthenticated access, use supported authenticated verification and report the access requirement; do not disable protection.

## Boundaries

No UI redesign, new business features, database integration, live-domain promotion, purchases, or changes to other Vercel projects. GitHub publishing is now requested, but only after the exact Spaceoccupier account and destination are verified. Stop and report a concrete issue if it requires expanding these boundaries.

## Self-Review

The target is explicit, sample behavior is separated from Vercel Production, credentials remain server-only, and the scope excludes real customer data and unrelated refactors. The user approved implementation on 2026-10-11, then requested a Spaceoccupier-only GitHub push before deployment. GitHub authentication and the exact destination were verified before publishing.

## Reference

https://vercel.com/changelog/next-js-may-2026-security-release
