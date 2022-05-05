import type { Body } from "./Body";
import type { Target } from "./Target";

interface Annotation {
    "@context": string;
    body: Body | Body[];
    id?: string;
    motivation: string;
    target: Target;   
    type: string;
}

interface SavedAnnotation extends Annotation {
    id: string;
}

export { Annotation, SavedAnnotation };
