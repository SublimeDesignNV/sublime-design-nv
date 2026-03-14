# Content Workflow

## Local image sources
- Service seed images live in `public/seed-images/<service-slug>/`.
- Repo upload source images live in `content/portfolio/<service-slug>/`.
- Project pages use Cloudinary first, then service-tagged Cloudinary, then seed fallback.

## Upload flow
- Put the next batch of real photos into the matching `content/portfolio/<service-slug>/` folder.
- Run `npm run portfolio:upload` to push those repo images into Cloudinary.
- Recheck `/admin/content-audit` after upload to confirm Cloudinary counts replace seed fallback.

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
