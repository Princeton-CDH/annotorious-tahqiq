import { AnnotationBlock } from "./AnnotationBlock";

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
        this.setAttribute("class", "delete");
        this.textContent = "Delete";

        this.addEventListener("click", this.handleClick.bind(this));
    }

    /**
     * Delete the annotation on click.
     */
    handleClick() {
        this.annotationBlock.onDelete(this.annotationBlock);
    }
}

export { DeleteButton };
