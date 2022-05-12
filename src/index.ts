import { AnnotationBlock } from "./elements/AnnotationBlock";
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
        customElements.define("annotation-block", AnnotationBlock, {
            extends: "div",
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
                new AnnotationBlock({
                    annotation,
                    editable: false,
                    onCancel: this.anno.cancelSelected,
                    onClick: this.handleClickAnnotationBlock.bind(this),
                    onDelete: this.handleDeleteAnnotation.bind(this),
                    onSave: this.handleSaveAnnotation.bind(this),
                    updateAnnotorious: this.anno.addAnnotation,
                }),
            );
        });
    }

    /**
     * Instantiates an editable annotation block when a new selection is made.
     *
     * @param {Annotation} selection Selected Annotorious annotation.
     */
    async handleCreateSelection(selection: Annotation) {
        this.annotationContainer.append(
            new AnnotationBlock({
                annotation: selection,
                editable: true,
                onCancel: this.anno.cancelSelected,
                onClick: this.handleClickAnnotationBlock.bind(this),
                onDelete: this.handleDeleteAnnotation.bind(this),
                onSave: this.handleSaveAnnotation.bind(this),
                updateAnnotorious: this.anno.addAnnotation,
            }),
        );
    }

    /**
     * Sets all annotation blocks to read-only when an existing annotation is selected,
     * and sets one annotation block to editable corresponding to the selected annotation.
     *
     * @param {Annotation} annotation Annotorious annotation.
     */
    handleSelectAnnotation(annotation: Annotation) {
        // The user has selected an existing annotation
        // find the display element by annotation id and swith to edit mode
        const annotationBlock = document.querySelector(
            '[data-annotation-id="' + annotation.id + '"]',
        );
        if (annotationBlock && annotationBlock instanceof AnnotationBlock) {
            // make sure no other editor is active
            this.makeAllReadOnlyExcept(annotationBlock);
            annotationBlock.makeEditable();
        }
    }

    /**
     * Deletes an annotation from both Annotorious display and the annotation store.
     *
     * @param {string} annotationBlock Annotation block associated with the annotation to delete.
     */
    handleDeleteAnnotation(annotationBlock: AnnotationBlock) {
        try {
            if (!annotationBlock.annotation.id) {
                // TODO: Better error handling
                throw new Error(
                    "No annotation ID associated with this display block.",
                );
            } else {
                // remove the highlight zone from the image
                this.anno.removeAnnotation(annotationBlock.annotation.id);
                // calling removeAnnotation doesn't fire the deleteAnnotation,
                // so we have to trigger the deletion explicitly
                this.storage.adapter.delete(annotationBlock.annotation.id);
                // remove the edit/display displayBlock
                annotationBlock.remove();
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(err.message);
        }
    }

    /**
     * Saves the passed annotation block's associated annotation using its
     * text input value, and makes the annotation block read only.
     *
     * @param {HTMLElement} annotationBlock Annotation block associated with the annotation to save.
     */
    async handleSaveAnnotation(annotationBlock: AnnotationBlock) {
        const annotation = annotationBlock.annotation;
        // add the content to the annotation
        annotation.motivation = "supplementing";
        if (Array.isArray(annotation.body) && annotation.body.length == 0) {
            annotation.body.push({
                type: "TextualBody",
                purpose: "transcribing",
                value: annotationBlock.textInput.textContent || "",
                format: "text/html",
                // TODO: transcription motivation, language, etc.
            });
        } else if (Array.isArray(annotation.body)) {
            // assume text content is first body element
            annotation.body[0].value =
                annotationBlock.textInput.textContent || "";
        }
        // update with annotorious, then save to storage backend
        await this.anno.updateSelected(annotation);
        this.anno.saveSelected();
        // update annotation block with new annotation and set inactive
        annotationBlock.setAnnotation(annotation);
        annotationBlock.makeReadOnly();
    }

    /**
     * On clicking an AnnotationBlock, selects the associated annotation in Annotorious
     * and makes all other AnnotationBlocks read-only.
     *
     * @param {Annotation} annotationBlock The AnnotationBlock that was clicked.
     */
    handleClickAnnotationBlock(annotationBlock: AnnotationBlock) {
        if (annotationBlock.annotation.id) {
            // highlight the zone
            this.anno.selectAnnotation(annotationBlock.annotation.id);
            // make sure no other annotation blocks are editable
            this.makeAllReadOnlyExcept(annotationBlock);
        }
    }

    /**
     * Sets all annotation blocks to read-only, except the passed one.
     *
     * @param {AnnotationBlock} annotationBlock The annotation block not to make read-only.
     */
    makeAllReadOnlyExcept(annotationBlock: AnnotationBlock) {
        document
            .querySelectorAll(".annotation-edit-container")
            .forEach((block) => {
                if (
                    block instanceof AnnotationBlock &&
                    block !== annotationBlock
                ) {
                    block.makeReadOnly();
                }
            });
    }
}

export default TranscriptionEditor;