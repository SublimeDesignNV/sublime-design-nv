# Portfolio Intake

## File Location

Place all portfolio images in:

`public/images/gallery/`

## Naming Convention

Use sequential JPG filenames:

- `1.jpg`
- `2.jpg`
- `3.jpg`
- ...

No gaps is preferred.

## Recommended Export Settings

- 2000px wide
- JPG format
- sRGB color profile

## How To Add More Than 12 Images

1. Drop new files into `public/images/gallery/` with the next number(s).
2. Extend `GALLERY_ITEMS` in `src/lib/gallery.ts`.

Only `src/lib/gallery.ts` needs to be updated for image metadata and service labels.

## Service Labeling

Each item in `GALLERY_ITEMS` has a `serviceSlug`.

`serviceSlug` controls which filter category the image appears under on `/gallery`.
