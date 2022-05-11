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

    onCancel: () => void;

    onClick: (annotationBlock: AnnotationBlock) => void;

    onDelete: (annotationBlock: AnnotationBlock) => void;

    onSave: (annotationBlock: AnnotationBlock) => Promise<void>;

    textInput: HTMLDivElement;

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

        // Create and append text input
        this.textInput = document.createElement("div");
        if (
            Array.isArray(this.annotation.body) &&
            this.annotation.body.length > 0
        ) {
            this.textInput.innerHTML = this.annotation.body[0].value;
        }
        this.append(this.textInput);

        // Set click event listener
        if (this.annotation.id) {
            this.dataset.annotationId = this.annotation.id;
            this.textInput.addEventListener("click", () => {
                this.onClick(this);
                // selection event not fired in this case, so make editable
                this.makeEditable();
            });
        }

        // Set editable if needed
        if (props.editable) {
            this.makeEditable();
        }
    }

    /**
     * Makes an existing annotation block editable by setting its contenteditable
     * property and adding Save, Cancel, and Delete buttons.
     */
    makeEditable(): void {
        if (this.getAttribute("class") == "annotation-edit-container") {
            return;
        }

        this.setAttribute("class", "annotation-edit-container");
        this.textInput.setAttribute("class", "annotation-editor");
        this.textInput.setAttribute("contenteditable", "true");
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
        this.textInput.setAttribute("class", "");
        this.textInput.setAttribute("contenteditable", "false");
        // restore the original content
        if (
            updateAnnotation &&
            Array.isArray(this.annotation.body) &&
            this.annotation.body.length > 0
        ) {
            this.textInput.innerHTML = this.annotation.body[0].value;
            // add the annotation again to update the image selection region,
            // in case the user has modified it and wants to cancel
            this.updateAnnotorious(this.annotation);
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
}

export { AnnotationBlock };
