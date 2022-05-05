// custom annotation editor for geniza project

import { Annotation } from "./types/Annotation";

class TranscriptionEditor {
    anno;

    storage;

    // TODO: Add typedefs for the Annotorious client (anno) and storage plugin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(anno: any, storage: any, annotationContainer: HTMLElement) {
        this.anno = anno;
        this.storage = storage;
        // disable the default annotorious editor (headless mode)
        this.anno.disableEditor = true;
        this.injectIntoElement(annotationContainer);
    }

    injectIntoElement(annotationContainer: HTMLElement) {
        document.addEventListener("annotations-loaded", () => {
            // custom event triggered by storage plugin

            // remove any existing annotation displays, in case of update
            annotationContainer
                .querySelectorAll(".annotation-display-container")
                .forEach((el) => el.remove());
            // display all current annotations
            this.anno.getAnnotations().forEach((annotation: Annotation) => {
                annotationContainer.append(this.createDisplayBlock(annotation));
            });
        });

        // when a new selection is made, instantiate an editor
        this.anno.on("createSelection", async (selection: Annotation) => {
            const editorBlock = this.createEditorBlock(selection);
            if (editorBlock) annotationContainer.append(editorBlock);
        });

        this.anno.on("selectAnnotation", (annotation: Annotation) => {
            // The users has selected an existing annotation

            // make sure no other editor is active
            this.makeAllReadOnly();
            // find the display element by annotation id and swith to edit mode
            const displayContainer = document.querySelector(
                '[data-annotation-id="' + annotation.id + '"]',
            );
            if (displayContainer && displayContainer instanceof HTMLElement) {
                this.makeEditable(displayContainer, annotation);
            }
        });
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
        if (typeof annotation.id !== undefined) {
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
        }
        // add save and cancel buttons
        const saveButton = document.createElement("button");
        saveButton.setAttribute("class", "save");
        saveButton.textContent = "Save";
        const cancelButton = document.createElement("button");
        cancelButton.setAttribute("class", "cancel");
        cancelButton.textContent = "Cancel";
        container.append(saveButton);
        container.append(cancelButton);

        saveButton.onclick = async () => {
            // add the content to the annotation
            selection.motivation = "supplementing";
            if (Array.isArray(selection.body) && selection.body.length == 0) {
                selection.body.push({
                    type: "TextualBody",
                    purpose: "transcribing",
                    value: textInput?.textContent || "",
                    format: "text/html",
                    // TODO: transcription motivation, language, etc.
                });
            } else if (Array.isArray(selection.body)) {
                // assume text content is first body element
                selection.body[0].value = textInput?.textContent || "";
            }
            // update with annotorious, then save to storage backend
            await this.anno.updateSelected(selection);
            this.anno.saveSelected();
            // make the editor inactive
            this.makeReadOnly(container);
        };
        cancelButton.addEventListener("click", () => {
            // cancel the edit

            // clear the selection from the image
            this.anno.cancelSelected();
            // if annotation is unsaved, restore and make read only
            if (container.dataset.annotationId) {
                this.makeReadOnly(container, selection);
                // if this was a new annotation, remove the container
            } else {
                container.remove();
            }
        });

        // if this is a saved annotation, add delete button
        if (container.dataset.annotationId) {
            const deleteButton = document.createElement("button");
            deleteButton.setAttribute("class", "delete");
            deleteButton.textContent = "Delete";
            container.append(deleteButton);

            deleteButton.addEventListener("click", () => {
                // remove the highlight zone from the image
                this.anno.removeAnnotation(container.dataset.annotationId);
                // remove the edit/display container
                container.remove();
                // calling removeAnnotation doesn't fire the deleteAnnotation,
                // so we have to trigger the deletion explicitly
                this.storage.adapter.delete(container.dataset.annotationId);
            });
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
                typeof annotation.body !== undefined &&
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
