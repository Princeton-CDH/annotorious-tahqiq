import { AnnotationBlock } from "./AnnotationBlock";
import { AnnotationLabel } from "./AnnotationLabel";
import "@ungap/custom-elements";

/**
 * A button to save a selected annotation to the store.
 */
class SaveButton extends HTMLButtonElement {
    annotationElement: AnnotationBlock | AnnotationLabel;

    /**
     * Creates a new save button.
     *
     * @param {HTMLElement} annotationElement Annotation element associated with this save button.
     */
    constructor(annotationElement: AnnotationBlock | AnnotationLabel) {
        super();

        this.annotationElement = annotationElement;

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
        if (this.annotationElement instanceof AnnotationBlock)
            await this.annotationElement.onSave(this.annotationElement);
        else if (this.annotationElement instanceof AnnotationLabel)
            await this.annotationElement.onSave(this.annotationElement);
    }
}

export { SaveButton };
