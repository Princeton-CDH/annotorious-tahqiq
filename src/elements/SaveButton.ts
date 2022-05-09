import { Annotation } from "../types/Annotation";

/**
 * A button to save a selected annotation to the store.
 */
class SaveButton extends HTMLButtonElement {
    displayBlock: HTMLElement;

    selection: Annotation;

    textInput: HTMLDivElement;

    handleSaveAnnotation: (
        selection: Annotation,
        textInput: HTMLDivElement,
        displayBlock: HTMLElement
    ) => Promise<void>;

    /**
     * Creates a new save button.
     *
     * @param {Annotation} selection Selected Annotorious annotation.
     * @param {HTMLDivElement} textInput Text input associated with this save button.
     * @param {HTMLElement} displayBlock Display block associated with this save button.
     * @param {Function} handleSaveAnnotation Function from the editor instance to save
     * the annotation.
     */
    constructor(
        selection: Annotation,
        textInput: HTMLDivElement,
        displayBlock: HTMLElement,
        handleSaveAnnotation: (
            selection: Annotation,
            textInput: HTMLDivElement,
            displayBlock: HTMLElement
        ) => Promise<void>,
    ) {
        super();

        this.selection = selection;
        this.textInput = textInput;
        this.displayBlock = displayBlock;
        this.handleSaveAnnotation = handleSaveAnnotation;

        // Set class and content
        this.setAttribute("class", "save");
        this.textContent = "Save";

        // Attach click handler
        this.addEventListener("click", this.handleClick.bind(this));
    }

    /**
     * Calls the save function from the editor instance.
     */
    async handleClick(): Promise<void> {
        await this.handleSaveAnnotation(
            this.selection,
            this.textInput,
            this.displayBlock,
        );
    }
}

export { SaveButton };
