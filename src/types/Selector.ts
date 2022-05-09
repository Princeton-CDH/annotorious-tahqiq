/**
 * W3C Annotation Selector (does not meet the full specification).
 * https://www.w3.org/TR/annotation-model/#selectors
 */
interface Selector {
    value: string;
    type: string;
    conformsTo?: string;
}

export { Selector };
