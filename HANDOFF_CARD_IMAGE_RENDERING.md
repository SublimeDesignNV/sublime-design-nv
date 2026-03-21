Public card image rendering handoff

Confirmed root cause
- This was a frontend thumbnail rendering bug, not an upload/data bug.
- The affected public card paths were still rendering valid Cloudinary images with:
  - fixed-height or aspect-ratio media wrappers
  - `crop="pad"`
  - `objectFit: "contain"` or `object-contain`
- The image URLs were already valid in the DOM, but the card-media presentation was using the wrong fit/crop behavior for thumbnail slots.
- The working homepage hero was already using `object-cover`, which is why it continued to render correctly.

Exact components changed
- `src/components/home/ServiceCards.tsx`
- `src/components/projects/ProjectRecordCard.tsx`
- `src/components/projects/ProjectCard.tsx`
- `src/app/services/page.tsx`
- `src/app/areas/page.tsx`
- `src/app/page.tsx`

Old rendering pattern vs new rendering pattern
- Old card pattern:
  - fixed-height or aspect-ratio wrapper
  - Cloudinary: `crop="pad"` + `objectFit: "contain"`
  - Next image fallback: `object-contain` with card padding
- New card pattern:
  - keep the existing deterministic wrapper sizing
  - Cloudinary thumbnails use `crop="fill"` + `gravity="auto:subject"`
  - card images use `h-full w-full object-cover`
  - Next image fallbacks use `fill` + `object-cover`

Pages verified
- `/`
  - homepage still rendered Cloudinary-backed media
  - homepage HTML no longer contained `object-contain` on the affected card path
  - homepage HTML still contained the hero media path and `object-cover`
- `/services`
  - service cards rendered Cloudinary-backed thumbnail media
  - no `object-contain` remained on that card path
- `/projects`
  - project cards rendered Cloudinary-backed thumbnail media
  - HTML showed `class="h-full w-full object-cover ..."` with `c_fill` Cloudinary URLs
- `/gallery`
  - shared project cards rendered through the same cover-based card pattern
- `/areas/summerlin`
  - shared project cards rendered through the same cover-based card pattern

DOM sanity confirmation
- Example `/projects` HTML after the fix included:
  - valid Cloudinary URL
  - `c_fill`
  - `g_auto:subject`
  - `class="h-full w-full object-cover ..."`
- The formerly broken public card path no longer rendered `object-contain`.

Hero compatibility
- No changes were made to the dedicated hero component.
- The homepage spotlight project image shared the broken card-media pattern, so it was aligned to the same cover-based thumbnail treatment.
- The main homepage hero remained on its existing working path.

No data/backfill work required
- No asset rows were changed.
- No Cloudinary assets were re-uploaded.
- No serializer or image-contract fields were changed.
- No admin, quote, or lead systems were touched.

Verification results
- `npm run build` passed.
- Local route checks confirmed:
  - homepage/service/project/gallery/area card HTML still contains valid Cloudinary URLs
  - affected public card paths no longer contain `object-contain`
  - affected public card paths now contain `object-cover`
  - homepage hero still renders through its existing working cover-based path

Commit
- Message: pending
- SHA: pending
