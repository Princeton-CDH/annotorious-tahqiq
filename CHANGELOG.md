# Change Log

## 1.1.0

Support for filtering search on motivation, improvements to cancellation.

### Features

- Add support for filtering search on secondaryMotivation
- Add optional textDirection initialization parameter
- Give user a chance to stop cancel event when there are changes
- Raise a new custom event on cancel (tahqiq-cancel)

## 1.0.1

Bug fixes and minor improvements.

### Bug fixes

- Prevent a race condition on saving and retrieving annotations

### Features

- Raise alert events for info, error, and success statuses

## 1.0.0

Initial public release of annotorious-tahqiq.

### Features

- Block-level annotation of images with Annotorious, conforming to the IIIF standard and the W3C Web Annotation Data Model
- Rich text editing of annotations with numbered lines, language tags, strikethrough, and superscript
- Storage and retrieval of annotations via an annotation store
- Drag-and-drop reordering annotations within a canvas, or moving them between canvases within a manifest
