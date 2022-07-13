import { Annotation } from "../types/Annotation";
import { CancelButton } from "./CancelButton";
import { DeleteButton } from "./DeleteButton";
import { SaveButton } from "./SaveButton";

/**
 * HTML div element associated with an annotation, which can be made editable to udpate
 * or delete its associated annotation.
 */
class AnnotationBlock extends HTMLDivElement {
    annotation: Annotation;

    textInput: HTMLDivElement;

    editorId?: string;

    labelElement: HTMLHeadingElement;

    onCancel: () => void;

    onClick: (annotationBlock: AnnotationBlock) => void;

    onDelete: (annotationBlock: AnnotationBlock) => void;

    onSave: (annotationBlock: AnnotationBlock) => Promise<void>;

    updateAnnotorious: (annotation: Annotation) => void;

    /**
     * Instantiate an annotation block.
     *
     * @param {object} props Properties passed to this annotation block.
     * @param {Annotation} props.annotation Annotation to associate with this annotation block.
     * @param {boolean} props.editable True if this annotation block should be editable,
     * otherwise false.
     * @param {Function} props.onClick Click handler function.
     * @param {Function} props.onSave Save annotation handler function.
     * @param {Function} props.onDelete Delete annotation handler function.
     * @param {Function} props.onCancel Cancel annotation handler function.
     * @param {Function} props.updateAnnotorious Function that updates this annotation in the
     * Annotorious display.
     */
    constructor(props: {
        annotation: Annotation;
        editable: boolean;
        onCancel: () => void;
        onClick: (annotationBlock: AnnotationBlock) => void;
        onDelete: (annotationBlock: AnnotationBlock) => void;
        onSave: (annotationBlock: AnnotationBlock) => Promise<void>;
        updateAnnotorious: (annotation: Annotation) => void;
    }) {
        super();
        this.annotation = props.annotation;
        this.onCancel = props.onCancel;
        this.onClick = props.onClick;
        this.onDelete = props.onDelete;
        this.onSave = props.onSave;
        this.updateAnnotorious = props.updateAnnotorious;

        // Set class
        this.setAttribute("class", "annotation-display-container");

        // Create and append label element (div with text, contenteditable in edit mode)
        this.labelElement = document.createElement("h3");
        if (this.annotation.label) {
            this.labelElement.innerHTML = this.annotation.label;
        }
        this.append(this.labelElement);

        // Create and append body element (div with text in read-only, TinyMCE in edit mode)
        this.textInput = document.createElement("div");
        if (
            Array.isArray(this.annotation.body) &&
            this.annotation.body.length > 0
        ) {
            this.textInput.innerHTML = this.annotation.body[0].value;
        }
        this.append(this.textInput);

        // Set click event listeners
        if (this.annotation.id) {
            this.dataset.annotationId = this.annotation.id;
            this.textInput.addEventListener("click", () => {
                this.onClick(this);
                // selection event not fired in this case, so make editable
                this.makeEditable();
            });
            this.labelElement.addEventListener("click", () => {
                this.onClick(this);
                this.makeEditable();
            });
        }

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
        if (this.getAttribute("class") == "annotation-edit-container") {
            return;
        }

        this.setAttribute("class", "annotation-edit-container");

        // make label editable
        this.labelElement.setAttribute("contenteditable", "true");

        // add TinyMCE
        window.tinyConfig.init_instance_callback = this.setEditorId.bind(this);
        const editor = document.createElement("tinymce-editor");
        editor.setAttribute("config", "tinyConfig");
        editor.innerHTML = this.encodeHTML(this.textInput.innerHTML);
        this.textInput.setAttribute("class", "annotation-editor");
        this.textInput.innerHTML = "";
        this.textInput.append(editor);
        this.textInput.focus();

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
        this.setAttribute("class", "annotation-display-container");
        this.labelElement.setAttribute("contenteditable", "false");
        this.textInput.setAttribute("class", "");
        // restore the original content
        if (updateAnnotation) {
            if (Array.isArray(this.annotation.body) && this.annotation.body.length > 0) {
                this.textInput.innerHTML = this.annotation.body[0].value;
            }
            if (this.annotation.label) {
                this.labelElement.innerHTML = this.annotation.label;
            }
            // add the annotation again to update the image selection region,
            // in case the user has modified it and wants to cancel
            this.updateAnnotorious(this.annotation);
        } else {
            // otherwise, set the content to TinyMCE editor's content
            const editorContent = window.tinymce.get(this.editorId).getContent();
            this.textInput.innerHTML = editorContent;
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
}

export { AnnotationBlock };
