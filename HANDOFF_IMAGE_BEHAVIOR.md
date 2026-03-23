# Image Cropping Fix

## Old Behavior

- Card thumbnails and project-page images were effectively using the same crop-heavy treatment.
- Project detail lead images and gallery images were rendered in fixed-height containers with `object-cover`.
- Cloudinary project-page images were still being forced through cover-style presentation, which cropped cabinetry, mantels, trim details, and edges too aggressively.

## New Behavior

- Card and thumbnail contexts still use a crop-friendly presentation.
- Project detail lead images and gallery images now use a less aggressive presentation that preserves more of the original photo.
- The image behavior split is explicit in code through a shared helper instead of being scattered across one-off class combinations.

## Behavior Split

Shared helper:

- [SitePhoto.tsx](/Users/brandon/Projects/sublime-design-nv/src/components/SitePhoto.tsx)
- [CloudinaryImage.tsx](/Users/brandon/Projects/sublime-design-nv/src/components/CloudinaryImage.tsx)

Modes:

- `card`
  - Cloudinary: `crop="fill"` with `gravity="auto:subject"`
  - CSS: `object-cover`
  - Purpose: clean, box-filling thumbnails
- `gallery`
  - Cloudinary: `crop="pad"`
  - CSS: `object-contain`
  - Purpose: show more of the full installed work with less aggressive cropping
- `hero`
  - Cloudinary: `crop="pad"`
  - CSS: `object-contain`
  - Purpose: stronger project lead image that shows more of the actual photo

## Files Changed

- [SitePhoto.tsx](/Users/brandon/Projects/sublime-design-nv/src/components/SitePhoto.tsx)
- [CloudinaryImage.tsx](/Users/brandon/Projects/sublime-design-nv/src/components/CloudinaryImage.tsx)
- [ProjectRecordCard.tsx](/Users/brandon/Projects/sublime-design-nv/src/components/projects/ProjectRecordCard.tsx)
- [ProjectCard.tsx](/Users/brandon/Projects/sublime-design-nv/src/components/projects/ProjectCard.tsx)
- [ServiceCards.tsx](/Users/brandon/Projects/sublime-design-nv/src/components/home/ServiceCards.tsx)
- [page.tsx](/Users/brandon/Projects/sublime-design-nv/src/app/services/page.tsx)
- [page.tsx](/Users/brandon/Projects/sublime-design-nv/src/app/areas/page.tsx)
- [page.tsx](/Users/brandon/Projects/sublime-design-nv/src/app/projects/[slug]/page.tsx)

## Project Page Presentation Changes

- Project lead image now uses a larger aspect-ratio-aware container with a light background and `object-contain`.
- Project gallery containers were changed from fixed-height crop boxes to aspect-ratio-aware containers that better preserve the source photo.
- Gallery images now use Cloudinary `c_pad` instead of the card-oriented `c_fill` path.

## Card Contexts Preserved

Card-style pages continue using crop-friendly cover behavior:

- homepage service cards
- `/services`
- `/projects`
- `/gallery`
- `/areas/[area]`

## Verification Results

- `npm run build` passed.
- Public card behavior:
  - `/projects` HTML still contains `object-cover`, `c_fill`, and `View Project`
  - `/gallery` HTML still contains `object-cover`, `c_fill`, and `View Project`
  - `/services` HTML still contains `object-cover`, `c_fill`, and service-card CTA text
  - `/areas/summerlin` HTML still contains cover-style `c_fill` service/project card media
- Project lead image:
  - checked `/projects/summerlin-laundry-cabinets`
  - hero now renders with `object-contain`
  - Cloudinary transform is now `c_pad`
- Project gallery:
  - checked `/projects/summerlin-laundry-cabinets`
  - gallery HTML contains `Project Gallery`, `object-contain`, and repeated `c_pad` transforms
- Regression checks:
  - no broken Cloudinary URLs observed in the tested routes
  - card pages still render cover-style thumbnails
  - production preview server rendered project and card pages without the earlier Cloudinary auto-gravity warnings
  - no admin photo-preview code paths were changed in this spec

## Commit

- Planned commit message:
  - `Refine image behavior for cards and project galleries`
