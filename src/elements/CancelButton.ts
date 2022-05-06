import { Annotation } from "../types/Annotation";

class CancelButton extends HTMLButtonElement {
    container: HTMLElement;

    editor: any;

    selection: Annotation;

    constructor(container: HTMLElement, editor: any, selection: Annotation) {
        super();

        this.container = container;
        this.editor = editor;
        this.selection = selection;

        // Set class and content
        this.setAttribute("class", "cancel");
        this.textContent = "Cancel";

        // Attach click handler
        this.addEventListener("click", this.handleClick.bind(this));
    }

    handleClick() {
        // cancel the edit
        // clear the selection from the image
        this.editor.anno.cancelSelected();
        // if annotation is unsaved, restore and make read only
        if (this.container.dataset.annotationId) {
            this.editor.makeReadOnly(this.container, this.selection);
            // if this was a new annotation, remove the container
        } else {
            this.container.remove();
        }
    }
}

export { CancelButton };
