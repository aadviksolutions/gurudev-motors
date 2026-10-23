# Vercel Preview Implementation Plan

Approved design: `2026-10-11-vercel-preview-design.md`.

The writing-plans skill is not installed; this local plan records the same implementation and verification sequence.

1. Verify and link `spaceoccupier-1939s-projects/gurudev-motors-preview`.
2. Upgrade Next.js and ESLint configuration to 15.5.27, with compatible React 19 dependencies and types. Await cookies and dynamic API route parameters.
3. Embed Vercel's deployment environment in both bundles. Require an explicit sample flag and either local development or Vercel Preview; keep production sample mode disabled. Extend showroom regression tests.
4. Set the Next.js framework preset and Node 22 runtime. Exclude environment files, local build products, source mockups and QA artifacts from uploads.
5. Run showroom tests, TypeScript, lint and a production-mode Preview build. Do not connect a database.
6. Add the sample flag and a freshly generated, server-only JWT secret to this project's Preview environment. Preserve deployment protection.
7. Deploy the local source as a Preview, inspect completion, and verify the deployed UI, images, filters, vehicle details, staff entry and a simulated enquiry at desktop and phone sizes.
8. Record the deployment URL, target, test results and any limitations. Do not promote or change the old live site.
