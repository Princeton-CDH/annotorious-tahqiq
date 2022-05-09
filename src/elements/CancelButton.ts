import { Annotation } from "../types/Annotation";

/**
 * A button that cancels editing or creating an annotation on click.
 */
class CancelButton extends HTMLButtonElement {
    selection: Annotation;

    displayBlock: HTMLElement;

    makeReadOnly;

    cancelSelected;

    /**
     * Creates a cancel button.
     *
     * @param {Annotation} selection Selected Annotorious annotation.
     * @param {HTMLElement} displayBlock Display block associated with this cancel button.
     * @param {Function} makeReadOnly Function to make the display block read-only.
     * @param {Function} cancelSelected Function to clear the Annotorious selection.
     */
    constructor(
        selection: Annotation,
        displayBlock: HTMLElement,
        makeReadOnly: (displayBlock: HTMLElement, selection: Annotation) => void,
        cancelSelected: () => void,
    ) {
        super();

        this.selection = selection;
        this.displayBlock = displayBlock;
        this.makeReadOnly = makeReadOnly;
        this.cancelSelected = cancelSelected;

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
        this.cancelSelected();
        if (this.displayBlock.dataset.annotationId) {
            // if annotation was saved previously, restore and make read only
            this.makeReadOnly(this.displayBlock, this.selection);
        } else {
            // if this was a new annotation, remove the displayBlock
            this.displayBlock.remove();
        }
    }
}

export { CancelButton };
