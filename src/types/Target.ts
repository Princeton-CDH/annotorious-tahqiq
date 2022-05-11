import type { Selector } from "./Selector";

/**
 * W3C Annotation Target (does not meet the full specification).
 * https://www.w3.org/TR/annotation-model/#bodies-and-targets
 */
interface Target {
    selector?: Selector | null | (Selector | null)[];
    source: string;
}

export { Target };
