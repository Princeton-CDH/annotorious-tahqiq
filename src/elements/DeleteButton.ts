class DeleteButton extends HTMLButtonElement {
    container: HTMLElement;

    editor: any;
    
    constructor(container: HTMLElement, editor: any) {
        super();

        this.container = container;
        this.editor = editor;

        // Class and content
        this.setAttribute("class", "delete");
        this.textContent = "Delete";

        this.addEventListener("click", this.handleClick.bind(this));
    }

    handleClick() {
        // remove the highlight zone from the image
        this.editor.anno.removeAnnotation(this.container.dataset.annotationId);
        // remove the edit/display container
        this.container.remove();
        // calling removeAnnotation doesn't fire the deleteAnnotation,
        // so we have to trigger the deletion explicitly
        this.editor.storage.adapter.delete(this.container.dataset.annotationId);
    }
}

export { DeleteButton };
