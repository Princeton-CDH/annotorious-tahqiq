import { AnnotationBlock } from "./AnnotationBlock";

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
     */
    async handleClick(): Promise<void> {
        await this.annotationBlock.onSave(this.annotationBlock);
    }
}

export { SaveButton };
