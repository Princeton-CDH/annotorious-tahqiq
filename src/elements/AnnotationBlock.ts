import { Annotation } from "../types/Annotation";
import { CancelButton } from "./CancelButton";
import { DeleteButton } from "./DeleteButton";
import { SaveButton } from "./SaveButton";

import "../styles/AnnotationBlock.scss";

/**
 * HTML div element associated with an annotation, which can be made editable to udpate
 * or delete its associated annotation.
 */
class AnnotationBlock extends HTMLElement {
    annotation: Annotation;

    bodyElement: HTMLDivElement;

    editorId?: string;

    labelElement: HTMLHeadingElement;

    clickable: boolean;

    onCancel: () => void;

    onClick: (annotationBlock: AnnotationBlock) => void;

    onDelete: (annotationBlock: AnnotationBlock) => void;

    onDrag: (start: boolean) => void;

    onReorder: (evt: DragEvent) => void;

    onSave: (annotationBlock: AnnotationBlock) => Promise<void>;

    updateAnnotorious: (annotation: Annotation) => void;

    /**
     * Instantiate an annotation block.
     *
     * @param {object} props Properties passed to this annotation block.
     * @param {Annotation} props.annotation Annotation to associate with this annotation block.
     * @param {boolean} props.editable True if this annotation block should be editable,
     * otherwise false.
     * @param {Function} props.onCancel Cancel annotation handler function.
     * @param {Function} props.onClick Click handler function.
     * @param {Function} props.onDelete Delete annotation handler function.
     * @param {Function} props.onDrag Drag start/end handler function.
     * @param {Function} props.onSave Save annotation handler function.
     * @param {Function} props.onReorder Drop event handler function.
     * @param {Function} props.updateAnnotorious Function that updates this annotation in the
     * Annotorious display.
     */
    constructor(props: {
        annotation: Annotation;
        editable: boolean;
        onCancel: () => void;
        onClick: (annotationBlock: AnnotationBlock) => void;
        onDelete: (annotationBlock: AnnotationBlock) => void;
        onDrag: (start: boolean) => void;
        onReorder: (evt: DragEvent) => void;
        onSave: (annotationBlock: AnnotationBlock) => Promise<void>;
        updateAnnotorious: (annotation: Annotation) => void;
    }) {
        super();
        this.annotation = props.annotation;
        this.onCancel = props.onCancel;
        this.onClick = props.onClick;
        this.onDelete = props.onDelete;
        this.onDrag = props.onDrag;
        this.onReorder = props.onReorder;
        this.onSave = props.onSave;
        this.updateAnnotorious = props.updateAnnotorious;

        // Set class
        this.setAttribute("class", "tahqiq-block-display");

        // Create and append label element (div with text, contenteditable in edit mode)
        this.labelElement = document.createElement("h3");
        this.labelElement.setAttribute("class", "tahqiq-label-display");
        this.labelElement.setAttribute("data-placeholder", "Optional label");
        // Create and append body element (div with text in read-only, TinyMCE in edit mode)
        this.bodyElement = document.createElement("div");
        this.bodyElement.setAttribute("class", "tahqiq-body-display");
        if (
            Array.isArray(this.annotation.body) &&
            this.annotation.body.length > 0
        ) {
            this.labelElement.innerHTML = this.annotation.body[0].label || "";
            this.bodyElement.innerHTML = this.annotation.body[0].value;
        }
        if (this.annotation.textGranularity !== "line") {
            // line-level annotations do not have labels
            this.append(this.labelElement);
        }
        this.append(this.bodyElement);

        if (this.annotation.id) {
            this.dataset.annotationId = this.annotation.id;
        }

        // Set click event listener
        this.clickable = true;
        this.addEventListener("click", () => {
            // bail out if clicking disabled
            if (! this.clickable) { return; }

            // if you click on this block, and it is in read-only mode, make editable
            if (!this.classList.contains("tahqiq-block-editor")) {
                this.onClick(this);
                // selection event not fired in this case, so make editable
                this.makeEditable();
            }
        });

        // Set drag event listeners
        this.draggable = true;
        this.addEventListener("dragstart", this.startDrag.bind(this));
        this.addEventListener("dragover", (evt) => {
            evt.preventDefault(); // required to allow drop
        });
        this.addEventListener("dragend", () => {
            this.onDrag(false); // Hide drop zones
        });
        this.addEventListener("dragenter", (evt) => {
            if (evt.currentTarget instanceof AnnotationBlock)
                this.classList.add("tahqiq-drag-target");
        });
        this.addEventListener("dragleave", (evt) => {
            if (evt.currentTarget instanceof AnnotationBlock)
                this.classList.remove("tahqiq-drag-target");
        });
        this.addEventListener("drop", this.onReorder);

        // Set editable if needed
        if (props.editable) {
            this.makeEditable();
        }
    }

    /**
     * Utility function to encode HTML into entities for use in TinyMCE.
     *
     * @param {string} content The HTML content to be encoded.
     * @returns {string} Content with encoded HTML entities.
     */
    encodeHTML(content: string): string {
        return content.replace(/[&<>'"]/g, 
            (tag: string) => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                '"': "&quot;",
            }[tag] || tag));
    }


    /**
     * Makes an existing annotation block editable by adding TinyMCE
     * and adding Save, Cancel, and Delete buttons.
     */
    makeEditable(): void {
        if (this.getAttribute("class") == "tahqiq-block-editor") {
            return;
        }

        this.setAttribute("class", "tahqiq-block-editor");
        this.draggable = false;

        // make label editable
        this.labelElement.setAttribute("contenteditable", "true");
        this.labelElement.setAttribute("class", "tahqiq-label-editor");

        // add TinyMCE
        window.tinyConfig.init_instance_callback = this.setEditorId.bind(this);
        const editor = document.createElement("tinymce-editor");
        editor.setAttribute("config", "tinyConfig");
        editor.setAttribute("api-key", window.tinyApiKey);
        editor.innerHTML = this.encodeHTML(this.bodyElement.innerHTML);
        this.bodyElement.setAttribute("class", "tahqiq-body-editor");
        this.bodyElement.innerHTML = "";
        this.bodyElement.append(editor);
        this.bodyElement.focus();

        // add save and cancel buttons
        this.append(new SaveButton(this));
        this.append(new CancelButton(this));

        // if this is a saved annotation, add delete button
        if (this.annotation.id) {
            this.append(new DeleteButton(this));
        }
    }

    /**
     * Converts an annotation block that has been made editable back to display format.
     *
     * @param {boolean} updateAnnotation True if this annotation block's annotation should be
     * updated in Annotorious, otherwise false.
     */
    makeReadOnly(updateAnnotation?: boolean): void {
        this.setAttribute("class", "tahqiq-block-display");
        this.draggable = true;
        this.labelElement.setAttribute("contenteditable", "false");
        this.labelElement.setAttribute("class", "tahqiq-label-display");
        this.bodyElement.setAttribute("class", "tahqiq-body-display");
        // restore the original content
        if (updateAnnotation) {
            if (Array.isArray(this.annotation.body) && this.annotation.body.length > 0) {
                this.bodyElement.innerHTML = this.annotation.body[0].value;
                this.labelElement.innerHTML = this.annotation.body[0].label || "";
            }
            // add the annotation again to update the image selection region,
            // in case the user has modified it and wants to cancel
            this.updateAnnotorious(this.annotation);
        } else {
            // otherwise, set the content to TinyMCE editor's content
            const editorContent = window.tinymce.get(this.editorId).getContent();
            this.bodyElement.innerHTML = editorContent;
        }
        // remove buttons (or should we just hide them?)
        this.querySelectorAll("button").forEach((el) => el.remove());
    }

    /**
     * Update the annotation on this annotation block.
     *
     * @param {Annotation} annotation Updated annotation.
     */
    setAnnotation(annotation: Annotation) {
        this.annotation = annotation;
    }

    /**
     * Set the TinyMCE editor id on this annotation block.
     *
     * @param {any} editor The TinyMCE editor instance
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setEditorId(editor:any) {
        this.editorId = editor.id;
    }

    /**
     * On drag start, set the drag data to the dragged item's ID, and show drop zones.
     *
     * @param {DragEvent} evt The "dragstart" DragEvent
     */
    startDrag(evt: DragEvent) {
        const target = evt.target as AnnotationBlock;
        evt.dataTransfer?.setData("text", target?.dataset?.annotationId || "");
        this.onDrag(true);
    }

    /**
     * When a block is dragged over, give it "tahqiq-drag-target" style; else, remove that style.
     *
     * @param {boolean} draggedOver Boolean indicating whether this block is being dragged over.
     */
    setDraggedOver(draggedOver: boolean): void {
        if (draggedOver) {
            this.classList.add("tahqiq-drag-target");
        } else {
            this.classList.remove("tahqiq-drag-target");
        }
    }

    /**
     * Set whether or not this annotation block can be drag and dropped.
     * Should not be draggable during editing or loading.
     * 
     * @param {boolean} draggable Boolean indicating if this block is draggable.
     */
    setDraggable(draggable: boolean): void {
        this.draggable = draggable;
    }

    /**
     * Set whether or not this annotation block can be clicked
     * to select. Should not be clickable when another block is
     * being edited.
     *
     * @param {boolean} clickable Boolean indicating if this block is clickable
     */
    setClickable(clickable: boolean): void {
        this.clickable = clickable;
    }
}

export { AnnotationBlock };
