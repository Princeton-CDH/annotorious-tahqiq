import { Annotation } from "../types/Annotation";
import { CancelButton } from "./CancelButton";
import { SaveButton } from "./SaveButton";

import "../styles/AnnotationBlock.scss";

/**
 * HTML div element associated with a block-level annotation grouping a list of line-level
 * annotations. Can be made editable to udpate its associated annotation's label ONLY.
 * Block-level annotations that group line-level annotations do not have editable content
 * themselves, only editable labels.
 */
class AnnotationLabel extends HTMLElement {
    annotation: Annotation;

    editorId?: string;

    labelElement: HTMLHeadingElement;

    clickable: boolean;

    onCancel: () => void;

    onClick: (label: AnnotationLabel) => void;

    onSave: (label: AnnotationLabel) => Promise<void>;

    /**
     * Instantiate an annotation label.
     *
     * @param {object} props Properties passed to this annotation label.
     * @param {Annotation} props.annotation Annotation to associate with this annotation label.
     * @param {boolean} props.editable True if this annotation label should be editable,
     * otherwise false.
     * @param {Function} props.onCancel Cancel annotation handler function.
     * @param {Function} props.onClick Click handler function.
     * @param {Function} props.onSave Save annotation handler function.
     * Annotorious display.
     */
    constructor(props: {
        annotation: Annotation;
        editable: boolean;
        onCancel: () => void;
        onClick: (label: AnnotationLabel) => void;
        onSave: (label: AnnotationLabel) => Promise<void>;
    }) {
        super();
        this.annotation = props.annotation;
        this.onCancel = props.onCancel;
        this.onClick = props.onClick;
        this.onSave = props.onSave;

        // Set class
        this.setAttribute("class", "tahqiq-block-display");

        // Create and append label element (div with text, contenteditable in edit mode)
        this.labelElement = document.createElement("h3");
        this.labelElement.setAttribute("class", "tahqiq-label-display");
        this.labelElement.setAttribute("data-placeholder", "Optional label");
        // Create and append body element (div with text in read-only, TinyMCE in edit mode)
        if (
            Array.isArray(this.annotation.body) &&
            this.annotation.body.length > 0 &&
            this.annotation.body[0].label
        ) {
            this.labelElement.innerHTML = this.annotation.body[0].label;
        } else {
            this.labelElement.innerHTML = "[no label]";
        }
        this.append(this.labelElement);

        if (this.annotation.id) {
            this.dataset.annotationId = this.annotation.id;
        }

        // Set click event listener
        this.clickable = true;
        this.addEventListener("click", () => {
            // bail out if clicking disabled
            if (!this.clickable) {
                return;
            }

            // if you click on this label, and it is in read-only mode, make editable
            if (!this.classList.contains("tahqiq-block-editor")) {
                this.onClick(this);
                // selection event not fired in this case, so make editable
                this.makeEditable();
            }
        });

        // Set editable if needed
        if (props.editable) {
            this.makeEditable();
        }
    }

    /**
     * Makes an existing annotation label editable by adding TinyMCE
     * and adding Save, Cancel, and Delete buttons.
     */
    makeEditable(): void {
        if (this.classList.contains("tahqiq-block-editor")) {
            return;
        }
        this.setAttribute("class", "tahqiq-block-editor");
        // make label editable
        this.labelElement.setAttribute("contenteditable", "true");
        this.labelElement.setAttribute("class", "tahqiq-label-editor");

        // add save and cancel buttons
        this.append(new SaveButton(this));
        this.append(new CancelButton(this));
    }

    /**
     * Converts an annotation label that has been made editable back to display format.
     *
     * @param {boolean} updateAnnotation True if this annotation label's annotation should be
     * updated in Annotorious, otherwise false.
     */
    makeReadOnly(updateAnnotation?: boolean): void {
        this.setAttribute("class", "tahqiq-block-display");
        this.labelElement.setAttribute("contenteditable", "false");
        this.labelElement.setAttribute(
            "class",
            "tahqiq-line-group-label tahqiq-label-display",
        );
        // restore the original content
        if (updateAnnotation) {
            if (
                Array.isArray(this.annotation.body) &&
                this.annotation.body.length > 0 &&
                this.annotation.body[0].label
            ) {
                this.labelElement.innerHTML = this.annotation.body[0].label;
            } else {
                this.labelElement.innerHTML = "[no label]";
            }
        }
        // remove buttons
        this.querySelectorAll("button").forEach((el) => el.remove());
    }

    /**
     * Update the annotation on this annotation label.
     *
     * @param {Annotation} annotation Updated annotation.
     */
    setAnnotation(annotation: Annotation) {
        this.annotation = annotation;
    }

    /**
     * Set the TinyMCE editor id on this annotation label.
     *
     * @param {any} editor The TinyMCE editor instance
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setEditorId(editor: any) {
        this.editorId = editor.id;
    }

    /**
     * Set whether or not this annotation label can be clicked
     * to select. Should not be clickable when another block or label is
     * being edited.
     *
     * @param {boolean} clickable Boolean indicating if this label is clickable
     */
    setClickable(clickable: boolean): void {
        this.clickable = clickable;
    }
}

export { AnnotationLabel };
