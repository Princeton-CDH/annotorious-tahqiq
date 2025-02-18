# Change Log

## 1.5.0

### Breaking changes

- Reorder the editor initialization parameters to place the TinyMCE API key before the other optional parameters

### Features

- Add `italicEnabled` argument to the editor initialization parameters to allow users to opt in to that formatting option

## 1.4.0

### Features

- Add italic (using the `em` element) to list of formatting options

## 1.3.0

### Features

- Support grouping and editing of line-level annotations using textGranularity
- Support ETag/If-Match headers to prevent mid-air collisions

## 1.2.0

Support for polygonal annotation.

### Features

- Add toolbar with rectangle/polygon annotation tools

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
