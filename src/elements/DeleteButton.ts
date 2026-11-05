import { AnnotationBlock } from "./AnnotationBlock";
import "@ungap/custom-elements";

/**
 * A button that deletes an annotation from both Annotorious display and the annotation store.
 */
class DeleteButton extends HTMLButtonElement {
    annotationBlock: AnnotationBlock;
    
    /**
     * Instantiate a delete button.
     *
     * @param {AnnotationBlock} annotationBlock The display block element containing this button.
     * its ID.
     */
    constructor(annotationBlock: AnnotationBlock) {
        super();

        this.annotationBlock = annotationBlock;

        // Class and content
        this.classList.add("tahqiq-button", "tahqiq-delete-button");
        this.textContent = "Delete";

        this.addEventListener("click", this.handleClick.bind(this));
    }

    /**
     * Delete the annotation on click, after the user confirms.
     *
     * @param {Event} evt Click event
     */
    handleClick(evt: Event) {
        evt.stopPropagation(); // ensure parent onClick event isn't called
        if (
            !confirm(
                "Are you sure you want to delete this annotation? This cannot be undone.",
            )
        ) {
            return;
        }
        this.annotationBlock.onDelete(this.annotationBlock);
    }
}

export { DeleteButton };
