import { AnnotationBlock } from "./elements/AnnotationBlock";
import { CancelButton } from "./elements/CancelButton";
import { DeleteButton } from "./elements/DeleteButton";
import { SaveButton } from "./elements/SaveButton";
import { Annotation } from "./types/Annotation";
import { Target } from "./types/Target";
import { Editor } from "@tinymce/tinymce-webcomponent";
import AnnotationServerStorage from "./storage";
import "@ungap/custom-elements";

import "./styles/index.scss";

declare global {
    /**
     * Exposing new namespace to window, needed to set tinyMCE config
     */
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tinyConfig: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tinymce: any;
        tinyApiKey: string;
    }
}

// define a custom event to indicate that annotations should have positions recalculated
const ReloadPositionsEvent = new Event("reload-all-positions");

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
     * @param {string} tinyApiKey API key for the TinyMCE rich text editor.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(anno: any, storage: any, annotationContainer: HTMLElement, tinyApiKey?: string) {
        this.anno = anno;
        this.storage = storage;
        // disable the default annotorious editor (headless mode)
        this.anno.disableEditor = true;
        this.annotationContainer = annotationContainer;
        this.currentAnnotationBlock = null;

        // define custom elements

        // FIXME: "extends" setting does not work on Safari, nor does inheritance
        // of element types other than HTMLElement. Buttons will not display.
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
            customElements.define("annotation-block", AnnotationBlock);

        // attach event listeners
        document.addEventListener(
            "annotations-loaded",
            this.handleAnnotationsLoaded.bind(this),
        );
        document.addEventListener(
            "reload-all-positions",
            this.handleReloadAllPositions.bind(this),
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
                menubar: false, // disable menu bar
            };
        }
        if (!window.tinyApiKey) {
            window.tinyApiKey = tinyApiKey || "no-api-key";
        }
    }

    /**
     * Handler for custom annotations loaded event triggered by storage plugin.
     */
    async handleAnnotationsLoaded() {
        // remove any existing annotation blocks and drop zones, in case of update
        this.annotationContainer
            .querySelectorAll(".tahqiq-block-display")
            .forEach((el) => el.remove());
        this.annotationContainer.querySelector(".tahqiq-drop-zone")?.remove();
        // display all current annotations
        const currentAnnotations = await this.anno.getAnnotations();
        currentAnnotations.forEach((annotation: Annotation) => {
            this.annotationContainer.append(
                new AnnotationBlock({
                    annotation,
                    editable: false,
                    onCancel: this.handleCancel.bind(this),
                    onClick: this.handleClickAnnotationBlock.bind(this),
                    onDelete: this.handleDeleteAnnotation.bind(this),
                    onDrag: this.handleDrag.bind(this),
                    onReorder: this.handleDropAnnotationBlock.bind(this),
                    onSave: this.handleSaveAnnotation.bind(this),
                    updateAnnotorious: this.anno.addAnnotation,
                }),
            );
        });
        // if no annotations returned, append a drop zone here so we can drop annotations
        // from other canvases onto this one
        if (!currentAnnotations?.length) {
            const dropZone = document.createElement("div");
            dropZone.className = "tahqiq-drop-zone";
            // add drag and drop event listeners to drop zone
            dropZone.addEventListener("dragover", (evt) => {
                evt.preventDefault();
            });
            dropZone.addEventListener("dragenter", (evt) => {
                if (evt.currentTarget instanceof HTMLDivElement) {
                    evt.currentTarget.classList.add("tahqiq-drag-target");
                }
            });
            dropZone.addEventListener("dragleave", (evt) => {
                if (evt.currentTarget instanceof HTMLDivElement) {
                    evt.currentTarget.classList.remove("tahqiq-drag-target");
                }
            });
            dropZone.addEventListener("drop", (evt) => {
                if (evt.currentTarget instanceof HTMLDivElement) {
                    evt.currentTarget.classList.remove("tahqiq-drag-target");
                }
                this.handleDropAnnotationBlock(evt);
            });
            this.annotationContainer.append(dropZone);
        }
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
                onDrag: this.handleDrag.bind(this),
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
                const annotations = Array.from(blocks).map((block) => {
                    if (block instanceof AnnotationBlock 
                    && block.annotation.id !== annotationBlock.annotation.id)
                        return block.annotation;
                });
                await this.updateSequence(annotations);
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
        // remove any drop zones if present
        this.annotationContainer.querySelector(".tahqiq-drop-zone")?.remove();
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
     * On drag start of any annotation, show drop zones as targetable. Do the opposite
     * on drag end.
     *
     * @param {boolean} start Boolean to indicate whether this is dragstart or dragend
     */
    handleDrag(start: boolean) {
        const dropZones = document.querySelectorAll(".tahqiq-drop-zone");
        dropZones.forEach((dropZone) => {
            if (start) {
                dropZone.classList.add("tahqiq-drag-targetable");
            } else {
                dropZone.classList.remove("tahqiq-drag-targetable");
            }
        });
    }

    /**
     * When an annotation block is dropped, set its position and check its neighbors' positions
     * for changes. If any positions changed, save changed annotations.
     *
     * TODO: Test once DragEvent is implemented in jsdom
     * https://github.com/jsdom/jsdom/blob/28ed5/test/web-platform-tests/to-run.yaml#L648-L654
     * 
     * @param {DragEvent} evt The "drop" event that triggered this handler
     */
    async handleDropAnnotationBlock(evt: DragEvent) {
        evt.preventDefault();
        // set loading style to prepare for network requests
        this.annotationContainer
            .querySelectorAll("annotation-block")
            .forEach((block) => {
                if (block instanceof AnnotationBlock) {
                    block.classList.add("tahqiq-loading");
                }
            });
        const blocks = this.annotationContainer.querySelectorAll("annotation-block");
        const annotations = Array.from(blocks).map((block) => {
            if (block instanceof AnnotationBlock) {
                return block.annotation;
            }
        });
        const draggedId = evt.dataTransfer?.getData("text");
        const draggedAnnotation = annotations.find((anno: Annotation | undefined) =>
            anno?.id === draggedId,
        );
        if (draggedAnnotation && evt.currentTarget instanceof AnnotationBlock) {
            // dragged block found in current tahqiq instance
            const draggedIndex = annotations.indexOf(draggedAnnotation);
            const droppedIndex = annotations.indexOf(evt.currentTarget.annotation);
            // move the dragged block to the correct index
            annotations.splice(draggedIndex, 1);
            annotations.splice(droppedIndex, 0, draggedAnnotation);
            await this.updateSequence(annotations);
        } else {
            // dragged block is from another tahqiq instance on the document
            const draggedBlock = document.querySelector(
                `[data-annotation-id="${draggedId}"]`,
            );
            if (draggedBlock instanceof AnnotationBlock) {
                // adjust the target of the dragged block to point to this canvas
                const newAnnotation = {
                    ...draggedBlock.annotation,
                    target: {
                        ...draggedBlock.annotation.target,
                        source: {
                            ...this.storage.adjustTargetSource(
                                draggedBlock.annotation.target.source,
                            ),
                            id: this.storage.settings.target,
                        },
                    },
                    "schema:position": null,
                };
                // update the dragged block in storage
                await this.storage.update(newAnnotation);
                // recalculate positions in both this and origin tahqiq instances
                document.dispatchEvent(ReloadPositionsEvent);
            }
        }
    }

    /**
     * Event handler for the reload-all-positions event: loads all annotations from storage,
     * then recalculates their positions.
     */
    async handleReloadAllPositions() {
        const annotations = await this.storage.loadAnnotations();
        await this.updateSequence(annotations);
    }

    /**
     * Given an array of annotations, set all position properties and
     * save if changed. Used for annotation reordering and deletion.
     *
     * @param {(Annotation | undefined)[]} annotations Array of annotations.
     */
    async updateSequence(annotations: (Annotation | undefined)[]) {
        // turn off draggability for all blocks while loading
        this.setAllDraggability(false);
        await Promise.all(annotations.map(async (anno, i) => {
            const position = i + 1;
            if (
                anno && anno["schema:position"] !== position
            ) {
                // if position changed, set schema:position and save
                const newAnnotation = {
                    ...anno,
                    "schema:position": position,
                };
                // save block
                await this.storage.update(newAnnotation);
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
            .querySelectorAll("annotation-block")
            .forEach((block) => {
                if (block instanceof AnnotationBlock) {
                    block.setDraggable(draggable);
                }
            });
    }
}

export default TranscriptionEditor;

export { TranscriptionEditor, AnnotationServerStorage };
