import { AnnotationBlock } from "./AnnotationBlock";

/**
 * A button that cancels editing or creating an annotation on click.
 */
class CancelButton extends HTMLButtonElement {
    annotationBlock: AnnotationBlock;

    /**
     * Creates a cancel button.
     *
     * @param {AnnotationBlock} annotationBlock Annotation block associated with this cancel button.
     */
    constructor(annotationBlock: AnnotationBlock) {
        super();

        this.annotationBlock = annotationBlock;

        // Set class and content
        this.setAttribute("class", "cancel");
        this.textContent = "Cancel";

        // Attach click handler
        this.addEventListener("click", this.handleClick.bind(this));
    }

    /**
     * On click, cancel edit/create annotation.
     */
    handleClick() {
        // cancel the edit
        // clear the selection from the image
        this.annotationBlock.onCancel();
        if (this.annotationBlock.annotation.id) {
            // if annotation was saved previously, restore and make read only
            this.annotationBlock.makeReadOnly(true);
        } else {
            // if this was a new annotation, remove the displayBlock
            this.annotationBlock.remove();
        }
    }
}

export { CancelButton };
