import { CancelButton } from "./elements/CancelButton";
import { DeleteButton } from "./elements/DeleteButton";
import { SaveButton } from "./elements/SaveButton";
import { Annotation } from "./types/Annotation";

/**
 * Custom annotation editor for Geniza project
 */
class TranscriptionEditor {
    anno;

    annotationContainer: HTMLElement;

    storage;

    // TODO: Add typedefs for the Annotorious client (anno) and storage plugin

    /**
     * Initialize an instance of the TranscriptionEditor.
     *
     * @param {any} anno Instance of Annotorious.
     * @param {any} storage Storage plugin to save Annotorious annotations.
     * @param {HTMLElement} annotationContainer Existing HTML element that the editor will be
     * placed into.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(anno: any, storage: any, annotationContainer: HTMLElement) {
        this.anno = anno;
        this.storage = storage;
        // disable the default annotorious editor (headless mode)
        this.anno.disableEditor = true;
        this.annotationContainer = annotationContainer;

        // define custom elements
        customElements.define("save-button", SaveButton, { extends: "button" });
        customElements.define("cancel-button", CancelButton, {
            extends: "button",
        });
        customElements.define("delete-button", DeleteButton, {
            extends: "button",
        });

        // attach event listeners
        document.addEventListener(
            "annotations-loaded",
            this.handleAnnotationsLoaded.bind(this),
        );
        this.anno.on("createSelection", this.handleCreateSelection.bind(this));
        this.anno.on(
            "selectAnnotation",
            this.handleSelectAnnotation.bind(this),
        );
    }

    /**
     * Handler for custom annotations loaded event triggered by storage plugin.
     */
    handleAnnotationsLoaded() {
        // remove any existing annotation displays, in case of update
        this.annotationContainer
            .querySelectorAll(".annotation-display-container")
            .forEach((el) => el.remove());
        // display all current annotations
        this.anno.getAnnotations().forEach((annotation: Annotation) => {
            this.annotationContainer.append(
                this.createDisplayBlock(annotation),
            );
        });
    }

    /**
     * Instantiates an editable display block when a new selection is made.
     *
     * @param {Annotation} selection Selected Annotorious annotation.
     */
    async handleCreateSelection(selection: Annotation) {
        const displayBlock = this.makeEditable(
            this.createDisplayBlock(selection),
            selection,
        );
        if (displayBlock) this.annotationContainer.append(displayBlock);
    }

    /**
     * Sets all display blocks to read-only when an existing annotation is selected,
     * and sets one display block to editable corresponding to the selected annotation.
     *
     * @param {Annotation} annotation Annotorious annotation.
     */
    handleSelectAnnotation(annotation: Annotation) {
        // The user has selected an existing annotation
        // make sure no other editor is active
        this.makeAllReadOnly();
        // find the display element by annotation id and swith to edit mode
        const displayContainer = document.querySelector(
            '[data-annotation-id="' + annotation.id + '"]',
        );
        if (displayContainer && displayContainer instanceof HTMLElement) {
            this.makeEditable(displayContainer, annotation);
        }
    }

    /**
     * Deletes an annotation from both Annotorious display and the annotation store.
     *
     * @param {string} annotationId The ID of the annotation to delete.
     */
    handleDeleteAnnotation(annotationId: string) {
        // remove the highlight zone from the image
        this.anno.removeAnnotation(annotationId);
        // calling removeAnnotation doesn't fire the deleteAnnotation,
        // so we have to trigger the deletion explicitly
        this.storage.adapter.delete(annotationId);
    }

    /**
     * Saves the passed annotation using the passed text input's value, and makes the associated
     * display block read only.
     *
     * @param {Annotation} selection Selected Annotorious annotation to save.
     * @param {HTMLDivElement} textInput Text input containing the text content of the annotation.
     * @param {HTMLElement} displayBlock Display block associated with this annotation.
     */
    async handleSaveAnnotation(
        selection: Annotation,
        textInput: HTMLDivElement,
        displayBlock: HTMLElement,
    ) {
        // add the content to the annotation
        selection.motivation = "supplementing";
        if (Array.isArray(selection.body) && selection.body.length == 0) {
            selection.body.push({
                type: "TextualBody",
                purpose: "transcribing",
                value: textInput.textContent || "",
                format: "text/html",
                // TODO: transcription motivation, language, etc.
            });
        } else if (Array.isArray(selection.body)) {
            // assume text content is first body element
            selection.body[0].value = textInput.textContent || "";
        }
        // update with annotorious, then save to storage backend
        console.log(selection);
        await this.anno.updateSelected(selection);
        this.anno.saveSelected();
        // make the editor inactive
        this.makeReadOnly(displayBlock);
    }

    /**
     * Creates a new display block with a text input, and if passed an existing annotation,
     * links the display block with that annotation.
     *
     * @param {Annotation} annotation Annotorious annotation.
     * @returns {HTMLElement} Display block div element.
     */
    createDisplayBlock(annotation: Annotation): HTMLElement {
        const container = document.createElement("div");
        container.setAttribute("class", "annotation-display-container");
        const textInput = document.createElement("div");

        if (Array.isArray(annotation.body) && annotation.body.length > 0) {
            textInput.innerHTML = annotation.body[0].value;
        }
        container.append(textInput);

        // existing annotation
        if (annotation.id !== undefined) {
            container.dataset.annotationId = annotation.id;

            // when this display is clicked, highlight the zone and make editable
            textInput.addEventListener("click", () => {
                this.anno.selectAnnotation(annotation.id);
                // make sure no other editors are active
                this.makeAllReadOnly();
                // selection event not fired in this case, so make editable
                this.makeEditable(container, annotation);
            });
        }
        return container;
    }

    /**
     * Makes an existing display block editable by setting its contenteditable
     * property and adding Save, Cancel, and Delete buttons.
     *
     * @param {HTMLElement} displayBlock Existing display block.
     * @param {Annotation} selection Selected Annotorious annotation.
     * @returns {HTMLElement} The passed display block, but editable.
     */
    makeEditable(
        displayBlock: HTMLElement,
        selection: Annotation,
    ): HTMLElement {
        //

        // if it's already editable, don't do anything
        if (displayBlock.getAttribute("class") == "annotation-edit-container") {
            return displayBlock;
        }

        displayBlock.setAttribute("class", "annotation-edit-container");
        const textInput = displayBlock.querySelector("div");
        if (textInput) {
            textInput.setAttribute("class", "annotation-editor");
            textInput.setAttribute("contenteditable", "true");
            textInput.focus();
            // add save and cancel buttons
            displayBlock.append(
                new SaveButton(
                    selection,
                    textInput,
                    displayBlock,
                    this.handleSaveAnnotation.bind(this),
                ),
            );
            displayBlock.append(
                new CancelButton(
                    selection,
                    displayBlock,
                    this.makeReadOnly.bind(this),
                    this.anno.cancelSelected,
                ),
            );
        }

        // if this is a saved annotation, add delete button
        if (displayBlock.dataset.annotationId) {
            displayBlock.append(
                new DeleteButton(
                    displayBlock,
                    this.handleDeleteAnnotation.bind(this),
                ),
            );
        }

        return displayBlock;
    }

    /**
     * Makes an existing display block read-only.
     *
     * @param {HTMLElement} displayBlock Existing display block.
     * @param {Annotation} [annotation] Annotorious annotation (optional).
     * @returns {HTMLElement} The passed display block, but read-only.
     */
    makeReadOnly(
        displayBlock: HTMLElement,
        annotation?: Annotation,
    ): HTMLElement {
        // convert a container that has been made editable back to display format
        // annotation is optional; used to reset content if necessary
        displayBlock.setAttribute("class", "annotation-display-container");
        const textInput = displayBlock.querySelector("div");
        if (textInput) {
            textInput.setAttribute("class", "");
            textInput.setAttribute("contenteditable", "false");
            // restore the original content
            if (
                annotation &&
                annotation.body !== undefined &&
                Array.isArray(annotation.body)
            ) {
                textInput.innerHTML = annotation.body[0].value;
                // add the annotation again to update the image selection region,
                // in case the user has modified it and wants to cancel
                this.anno.addAnnotation(annotation);
            }
        }
        // remove buttons (or should we just hide them?)
        displayBlock.querySelectorAll("button").forEach((el) => el.remove());

        return displayBlock;
    }

    /**
     * Sets all display blocks to read-only.
     */
    makeAllReadOnly() {
        // make sure no display block is editable
        document
            .querySelectorAll(".annotation-edit-container")
            .forEach((container) => {
                if (container instanceof HTMLElement)
                    this.makeReadOnly(container);
            });
    }
}

export default TranscriptionEditor;
