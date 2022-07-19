/**
 * A source for an annotation, in this case pointing to a IIIF manifest/canvas.
 */
interface Source {
    id: string;
    partOf: { id: string; type: string };
    type: string;
}

export { Source };
