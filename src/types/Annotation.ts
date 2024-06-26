import type { Body } from "./Body";
import type { Target } from "./Target";

/**
 * Constants for text granularity.
 */
enum TextGranularity {
    LINE = "line",
    BLOCK = "block",
}

/**
 * W3C Annotation (does not meet the full specification) of the type used by Annotorious.
 * https://www.w3.org/TR/annotation-model/#annotations
 */
interface Annotation {
    "@context": string;
    body: Body | Body[];
    "dc:source"?: string;
    id?: string;
    motivation?: string | string[];
    partOf?: string;
    "schema:position"?: number | null;
    target: Target;
    textGranularity?: TextGranularity;
    type: string;
}

/**
 * Saved W3C Annotation, which will have received an ID and etag from the annotation store.
 */
interface SavedAnnotation extends Annotation {
    id: string;
    etag: string;
}

export { Annotation, SavedAnnotation, TextGranularity };
