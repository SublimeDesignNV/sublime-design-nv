# Content Workflow

## Local image sources
- Service seed images live in `public/seed-images/<service-slug>/`.
- Repo upload source images live in `content/portfolio/<service-slug>/`.
- Project pages use Cloudinary first, then service-tagged Cloudinary, then seed fallback.

## Upload flow
- Put the next batch of real photos into the matching `content/portfolio/<service-slug>/` folder.
- Run `npm run portfolio:upload` to push those repo images into Cloudinary.
- Recheck `/admin/content-audit` after upload to confirm Cloudinary counts replace seed fallback.

## Fastest live service-proof workflow
- Sign in at `/admin`.
- Use the `Upload Assets` box when the goal is to populate a public service page quickly.
- Select the canonical service tag that matches the page:
  - `barn-doors`
  - `floating-shelves`
  - `mantels`
  - `media-walls`
  - `faux-beams`
  - `cabinets`
  - `trim`
- Add alt text when helpful.
- Turn on `Publish immediately` if the image is ready for public display.
- After upload, confirm the asset appears in the admin asset list.
- If `Publish immediately` was left off, switch the asset to published in the asset table.
- Open the matching public service page and confirm the image appears above fallback proof.

## Public visibility rules
- Public service pages only show assets that have a database asset record.
- The asset must be marked `published`.
- The asset must be tagged to the matching canonical service slug.
- Project-folder uploads can also surface through direct Cloudinary `service:<slug>` tags, but the DB-backed asset uploader is the clearest operator path for service proof activation.

## Repeat upload checklist
- Choose the correct canonical service tag.
- Upload the strongest finished photo first.
- Verify the asset is published.
- Verify it appears in the admin asset list.
- Verify it appears on the matching public service page.
- Confirm the page still shows the quote CTA after proof appears.

## Flagship image priority
- Flagship projects can pin a hero image with `preferredHeroPublicId`.
- Flagship projects can control gallery order with `preferredGalleryPublicIds` or `preferredGalleryFirstPublicId`.
- Use `heroAlt`, `galleryAltPrefix`, `heroCaption`, and `galleryCaptions` in `src/content/projects.ts` when the top proof pages need stronger share/presentation polish.

## How to spot seed fallback
- `/admin/content-audit` shows service fallback status and next action guidance.
- `/admin/content-audit` flagship rows show Cloudinary count, seed count, hero source, and suggested next upload action.
- `/admin/launch-audit` shows which pages are promotion-ready versus still thin or improving.

## What to upload next
- Prioritize rows marked `thin` or `improving`.
- If the audit says `Upload hero image`, add the strongest finished photo first.
- If the audit says `Upload X more gallery images`, fill out real process/detail/finished shots.
- If the audit says `Replace seed fallback with real project photos`, upload real Cloudinary-backed images before promoting the page.
