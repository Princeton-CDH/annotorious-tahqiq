import type { Selector } from "./Selector";
import type { Source } from "./Source";

interface Target {
    selector?: Selector | null | (Selector | null)[];
    source: Source | string;
}

export { Target };
