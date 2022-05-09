/**
 * W3C Annotation Body (does not meet the full specification).
 * https://www.w3.org/TR/annotation-model/#bodies-and-targets
 */
interface Body {
    value: string;
    type?: string;
    id?: string;
    purpose?: string;
    format?: string;
    language?: string;
}

export { Body };
