import { AnnotationBlock } from "./elements/AnnotationBlock";
import { CancelButton } from "./elements/CancelButton";
import { DeleteButton } from "./elements/DeleteButton";
import { SaveButton } from "./elements/SaveButton";
import { Annotation } from "./types/Annotation";
import { Target } from "./types/Target";
import { Editor } from "@tinymce/tinymce-webcomponent";
import AnnotationServerStorage from "./storage";

declare global {
    /**
     * Exposing new namespace to window, needed to set tinyMCE config
     */
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tinyConfig: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tinymce: any;
    }
}

/**
 * Custom annotation editor for Geniza project
 */
class TranscriptionEditor {
    anno;

    annotationContainer: HTMLElement;

    storage;

    currentAnnotationBlock: AnnotationBlock | null;

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
        this.currentAnnotationBlock = null;

        // define custom elements
        if (!customElements.get("save-button"))
            customElements.define("save-button", SaveButton, {
                extends: "button",
            });
        if (!customElements.get("cancel-button"))
            customElements.define("cancel-button", CancelButton, {
                extends: "button",
            });
        if (!customElements.get("delete-button"))
            customElements.define("delete-button", DeleteButton, {
                extends: "button",
            });
        if (!customElements.get("annotation-block"))
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
        this.anno.on(
            "changeSelectionTarget",
            this.handleChangeSelectionTarget.bind(this),
        );

        // Prepare tinyMCE editor custom element and config
        if (!customElements.get("tinymce-editor")) {
            Editor();
        }
        if (!window.tinyConfig) {
            window.tinyConfig = {
                height: 500,
                plugins: "lists",
                toolbar:
                    "language | numlist | strikethrough superscript | undo redo | ",
                directionality: "rtl",
                formats: {
                    strikethrough: { inline: "del" },
                    // A custom format for insertion element
                    ins: { inline: "ins" },
                },
                content_langs: [
                    { title: "English", code: "en" },
                    { title: "Hebrew", code: "he" },
                    { title: "Arabic", code: "ar" },
                ],
                content_style:
                    "::marker {direction: ltr; margin-left: 1em; }\
                li { padding-right: 1em; } ins { color: gray; }",
                menubar: {}, // disable menu bar
            };
        }
    }

    /**
     * Handler for custom annotations loaded event triggered by storage plugin.
     */
    handleAnnotationsLoaded() {
        // remove any existing annotation blocks, in case of update
        this.annotationContainer
            .querySelectorAll(".tahqiq-block-display")
            .forEach((el) => el.remove());
        // display all current annotations
        this.anno
            .getAnnotations()
            // sort by position attribute if present on both annotations
            .sort((a: Annotation, b: Annotation) =>
                (a["schema:position"] && b["schema:position"])
                    ? a["schema:position"] - b["schema:position"]
                    : 0,
            )
            .forEach((annotation: Annotation) => {
                this.annotationContainer.append(
                    new AnnotationBlock({
                        annotation,
                        editable: false,
                        onCancel: this.handleCancel.bind(this),
                        onClick: this.handleClickAnnotationBlock.bind(this),
                        onDelete: this.handleDeleteAnnotation.bind(this),
                        onDragOver: this.handleDragOverAnnotationBlock.bind(this),
                        onReorder: this.handleDropAnnotationBlock.bind(this),
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
                onCancel: this.handleCancel.bind(this),
                onClick: this.handleClickAnnotationBlock.bind(this),
                onDelete: this.handleDeleteAnnotation.bind(this),
                onDragOver: this.handleDragOverAnnotationBlock.bind(this),
                onReorder: this.handleDropAnnotationBlock.bind(this),
                onSave: this.handleSaveAnnotation.bind(this),
                updateAnnotorious: this.anno.addAnnotation,
            }),
        );
    }

    /**
     * On cancellation, cancel with annotorious and set all draggable
     */
    handleCancel() {
        // cancel with annotorious
        this.anno.cancelSelected();
        // make all annotations draggable
        this.setAllDraggability(true);
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
            // set current annotation block
            this.currentAnnotationBlock = <AnnotationBlock>annotationBlock;
            // ensure no annotation block is draggable
            this.setAllDraggability(false);
        }
    }

    /**
     *
     * Update the cached annotation on the currently selected annotation block
     * when the target changes.
     *
     * @param {Target} target updated target from an Annotorious annotation.
     */
    handleChangeSelectionTarget(target: Target) {
        // if there is an annotation block currently active,
        // update the cached annotation with the changed target
        if (this.currentAnnotationBlock != null) {
            this.currentAnnotationBlock.annotation.target = target;
        }
    }

    /**
     * Deletes an annotation from both Annotorious display and the annotation store.
     *
     * @param {string} annotationBlock Annotation block associated with the annotation to delete.
     */
    async handleDeleteAnnotation(annotationBlock: AnnotationBlock) {
        try {
            if (!annotationBlock.annotation.id) {
                // TODO: Better error handling
                throw new Error(
                    "No annotation ID associated with this display block.",
                );
            } else {
                // remove the highlight zone from the image
                this.anno.removeAnnotation(annotationBlock.annotation.id);
                // decrement annotation count
                this.storage.setAnnotationCount(this.storage.annotationCount - 1);
                // remove the edit/display displayBlock
                annotationBlock.remove();
                // calling removeAnnotation doesn't fire the deleteAnnotation,
                // so we have to trigger the deletion explicitly
                await this.storage.delete(annotationBlock.annotation);
                // reload positions of all annotation blocks except this one
                const blocks = this.annotationContainer.querySelectorAll(".tahqiq-block-display");
                const blockArray = Array.from(blocks).filter((block) => 
                    block instanceof AnnotationBlock 
                    && block.annotation.id !== annotationBlock.annotation.id,
                );
                await this.reloadPositions(blockArray);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(err.message);
        }
    }

    /**
     * Saves the passed annotation block's associated annotation using its editor
     * content (and label if present), and makes the annotation block read only.
     *
     * @param {HTMLElement} annotationBlock Annotation block associated with the annotation to save.
     */
    async handleSaveAnnotation(annotationBlock: AnnotationBlock) {
        const annotation = annotationBlock.annotation;
        const editorContent = window.tinymce.get(annotationBlock.editorId).getContent();
        // add the content to the annotation
        annotation.motivation = "supplementing";
        if (Array.isArray(annotation.body) && annotation.body.length == 0) {
            annotation.body.push({
                type: "TextualBody",
                purpose: "transcribing",
                value: editorContent || "",
                format: "text/html",
                label: annotationBlock.labelElement.textContent || undefined,
                // TODO: transcription motivation, language, etc.
            });
        } else if (Array.isArray(annotation.body)) {
            // assume text content is first body element
            annotation.body[0].value = editorContent || "";
            if (annotationBlock.labelElement.textContent) {
                annotation.body[0].label = annotationBlock.labelElement.textContent;
            }
        }
        // update with annotorious, then save to storage backend
        await this.anno.updateSelected(annotation);
        this.anno.saveSelected();
        // update annotation block with new annotation and set inactive
        annotationBlock.setAnnotation(annotation);
        annotationBlock.makeReadOnly();
        // make all annotations draggable again
        this.setAllDraggability(true);
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
            // ensure no annotation block is draggable
            this.setAllDraggability(false);
        }
    }

    /**
     * Sets the passed annotation to "dragged over" state, and all others to not dragged over.
     *
     * @param {AnnotationBlock | null} annotationBlock The annotation block to set dragged over.
     * If null is passed, will set all annotation blocks to "not dragged over" state.
     */
    handleDragOverAnnotationBlock(annotationBlock: AnnotationBlock | null) {
        this.annotationContainer
            .querySelectorAll(".tahqiq-block-display")
            .forEach((block) => {
                if (
                    block instanceof AnnotationBlock &&
                    block === annotationBlock
                ) {
                    block.setDraggedOver(true);
                } else if (block instanceof AnnotationBlock) {
                    block.setDraggedOver(false);
                }
            });
    }

    /**
     * When an annotation block is dropped, set its position and check its neighbors' positions
     * for changes. If any positions changed, save changed annotations.
     *
     * @param {DragEvent} evt The "drop" event that triggered this handler
     */
    async handleDropAnnotationBlock(evt: DragEvent) {
        evt.preventDefault();
        const blocks = this.annotationContainer.querySelectorAll(".tahqiq-block-display");
        const blockArray = Array.from(blocks);
        const draggedBlockId = evt.dataTransfer?.getData("text");
        const draggedBlock = blockArray.find((block: Element) =>
            block instanceof AnnotationBlock &&
            block.dataset?.annotationId === draggedBlockId,
        );
        if (draggedBlock && evt.currentTarget instanceof AnnotationBlock) {
            const draggedIndex = blockArray.indexOf(draggedBlock);
            const droppedIndex = blockArray.indexOf(evt.currentTarget);
            // move the dragged block to the correct index
            blockArray.splice(draggedIndex, 1);
            blockArray.splice(droppedIndex, 0, draggedBlock);
            await this.reloadPositions(blockArray);
        }
    }

    /**
     * Given an array of annotation blocks, set all position properties and
     * save if changed. Used for annotation reordering and deletion.
     *
     * @param {Element[]} annotationBlocks Array of annotation blocks.
     */
    async reloadPositions(annotationBlocks: Element[]) {
        // turn off draggability for all blocks while loading
        this.setAllDraggability(false);
        await Promise.all(annotationBlocks.map(async (block, i) => {
            const position = i + 1;
            if (
                block instanceof AnnotationBlock &&
                block.annotation["schema:position"] !== position
            ) {
                // if position changed, set schema:position and save
                block.setAnnotation({
                    ...block.annotation,
                    "schema:position": position,
                });
                // save block
                await this.storage.update(block.annotation);
            }
            return Promise.resolve();
        }));
        // reload all annotations (and rebind event listeners, turn draggability
        // back on)
        return this.storage.loadAnnotations();
    }

    /**
     * Sets all annotation blocks to read-only, except the passed one.
     *
     * @param {AnnotationBlock} annotationBlock The annotation block not to make read-only.
     */
    makeAllReadOnlyExcept(annotationBlock: AnnotationBlock) {
        this.annotationContainer
            .querySelectorAll(".tahqiq-block-editor")
            .forEach((block) => {
                if (
                    block instanceof AnnotationBlock &&
                    block !== annotationBlock
                ) {
                    block.makeReadOnly();
                }
            });
    }

    /**
     * Set draggability on or off for all blocks.
     * 
     * @param {boolean} draggable Whether or not blocks should be draggable.
     */
    setAllDraggability(draggable: boolean) {
        this.annotationContainer
            .querySelectorAll("div")
            .forEach((block) => {
                if (block instanceof AnnotationBlock) {
                    block.setDraggable(draggable);
                }
            });
    }
}

export default TranscriptionEditor;

export { TranscriptionEditor, AnnotationServerStorage };
