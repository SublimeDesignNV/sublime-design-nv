# Admin Upload Mobile Layout

## What Changed
- Moved the `Files` picker to the top of the upload/classification form in `src/components/admin/AssetUploader.tsx`.
- Kept the intended mobile task order:
  1. choose files
  2. pick the primary service
  3. pick any secondary services
  4. complete the remaining metadata
- Reduced form spacing from `space-y-5` to `space-y-4` to tighten the mobile flow.

## Secondary Services Layout
- Secondary services now use the same compact mobile grid pattern as primary service selection:
  - `grid-cols-2` on mobile
  - `sm:grid-cols-4` on larger screens
- Secondary service options remain multi-select checkboxes.
- Selected state is now visually obvious with the same red active treatment used elsewhere in the uploader.

## Selection Behavior
- `Primary Service` remains single-select.
- `Secondary Services` remain multi-select.
- Upload, save, validation, and existing state wiring were not changed.

## Verification
- `npm run build`
  - passed
- Scenario A: mobile upload flow
  - file picker now appears first in the form
  - helper copy reinforces upload-first workflow
- Scenario B: primary service layout
  - still renders in a two-column mobile grid
  - still behaves as single-select
- Scenario C: secondary service layout
  - now renders in a two-column mobile grid
  - still behaves as multi-select
  - selected state is visually clearer
- Scenario D: reduced scrolling
  - mobile form is shorter because the upload control is first and secondary services no longer stack as a long one-column list
- Scenario E: desktop/tablet regression
  - larger screens still use a multi-column layout and build passed without layout/type regressions
