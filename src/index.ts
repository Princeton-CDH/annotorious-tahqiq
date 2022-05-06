// custom annotation editor for geniza project

import { CancelButton } from "./elements/CancelButton";
import { DeleteButton } from "./elements/DeleteButton";
import { SaveButton } from "./elements/SaveButton";
import { Annotation } from "./types/Annotation";

class TranscriptionEditor {
    anno;

    annotationContainer: HTMLElement;

    storage;

    // TODO: Add typedefs for the Annotorious client (anno) and storage plugin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(anno: any, storage: any, annotationContainer: HTMLElement) {
        this.anno = anno;
        this.storage = storage;
        // disable the default annotorious editor (headless mode)
        this.anno.disableEditor = true;
        this.annotationContainer = annotationContainer;

        // define custom elements
        customElements.define("save-button", SaveButton, { extends: "button" });
        customElements.define("cancel-button", CancelButton, { extends: "button" });
        customElements.define("delete-button", DeleteButton, { extends: "button" });

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

    handleAnnotationsLoaded() {
        // custom event triggered by storage plugin

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

    async handleCreateSelection(selection: Annotation) {
        // when a new selection is made, instantiate an editor
        const editorBlock = this.createEditorBlock(selection);
        if (editorBlock) this.annotationContainer.append(editorBlock);
    }

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

    makeEditable(container: HTMLElement, selection: Annotation) {
        // make an existing display container editable

        // if it's already editable, don't do anything
        if (container.getAttribute("class") == "annotation-edit-container") {
            return;
        }

        container.setAttribute("class", "annotation-edit-container");
        const textInput = container.querySelector("div");
        if (textInput) {
            textInput.setAttribute("class", "annotation-editor");
            textInput.setAttribute("contenteditable", "true");
            textInput.focus();
            // add save and cancel buttons
            container.append(
                new SaveButton(container, this, selection, textInput),
            );
            container.append(new CancelButton(container, this, selection));
        }

        // if this is a saved annotation, add delete button
        if (container.dataset.annotationId) {
            container.append(new DeleteButton(container, this));
        }

        return container;
    }

    makeReadOnly(container: HTMLElement, annotation?: Annotation) {
        // convert a container that has been made editable back to display format
        // annotation is optional; used to reset content if necessary
        container.setAttribute("class", "annotation-display-container");
        const textInput = container.querySelector("div");
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
        container.querySelectorAll("button").forEach((el) => el.remove());

        return container;
    }

    makeAllReadOnly() {
        // make sure no editor is active
        document
            .querySelectorAll(".annotation-edit-container")
            .forEach((container) => {
                if (container instanceof HTMLElement)
                    this.makeReadOnly(container);
            });
    }

    // method to create an editor block
    // container, editable div, buttons to save/cancel/delete
    createEditorBlock(selection: Annotation) {
        // create a new annotation editor block and return
        return this.makeEditable(this.createDisplayBlock(selection), selection);
    }
}

export default TranscriptionEditor;
