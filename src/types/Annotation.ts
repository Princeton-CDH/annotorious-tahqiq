import type { Body } from "./Body";
import type { Target } from "./Target";

/**
 * W3C Annotation (does not meet the full specification) of the type used by Annotorious.
 * https://www.w3.org/TR/annotation-model/#annotations
 */
interface Annotation {
    "@context": string;
    body: Body | Body[];
    id?: string;
    motivation: string;
    target: Target;
    type: string;
    label?: string;
}

/**
 * Saved W3C Annotation, which will have received an ID from the annotation store.
 */
interface SavedAnnotation extends Annotation {
    id: string;
}

export { Annotation, SavedAnnotation };
