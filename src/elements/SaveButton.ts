import { AnnotationBlock } from "./AnnotationBlock";
import "@ungap/custom-elements";

/**
 * A button to save a selected annotation to the store.
 */
class SaveButton extends HTMLButtonElement {
    annotationBlock: AnnotationBlock;

    /**
     * Creates a new save button.
     *
     * @param {HTMLElement} annotationBlock Annotation block associated with this save button.
     */
    constructor(
        annotationBlock: AnnotationBlock,
    ) {
        super();

        this.annotationBlock = annotationBlock;

        // Set class and content
        this.classList.add("tahqiq-button", "tahqiq-save-button");
        this.textContent = "Save";

        // Attach click handler
        this.addEventListener("click", this.handleClick.bind(this));
    }

    /**
     * Calls the save function from the annotation block.
     *
     * @param {Event} evt Click event
     */
    async handleClick(evt: Event): Promise<void> {
        evt.stopPropagation(); // ensure parent onClick event isn't called
        await this.annotationBlock.onSave(this.annotationBlock);
    }
}

export { SaveButton };
