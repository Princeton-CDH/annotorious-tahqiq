/**
 * A button that deletes an annotation from both Annotorious display and the annotation store.
 */
class DeleteButton extends HTMLButtonElement {
    displayBlock: HTMLElement;

    handleDeleteAnnotation: (annotationId: string) => void;
    
    /**
     * Instantiate a delete button.
     *
     * @param {HTMLElement} displayBlock The display block element containing this button.
     * @param {Function} handleDeleteAnnotation The editor function to delete an annotation given
     * its ID.
     */
    constructor(displayBlock: HTMLElement, handleDeleteAnnotation: (annotationId: string) => void) {
        super();

        this.displayBlock = displayBlock;
        this.handleDeleteAnnotation = handleDeleteAnnotation;

        // Class and content
        this.setAttribute("class", "delete");
        this.textContent = "Delete";

        this.addEventListener("click", this.handleClick.bind(this));
    }

    /**
     * Delete the annotation on click.
     */
    handleClick() {
        try {
            if (!this.displayBlock.dataset.annotationId) {
                throw new Error("No annotation ID associated with this display block.");
            } else {
                this.handleDeleteAnnotation(this.displayBlock.dataset.annotationId);
                // remove the edit/display displayBlock
                this.displayBlock.remove();
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(err.message);
        }
    }
}

export { DeleteButton };
