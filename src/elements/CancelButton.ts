import { AnnotationBlock } from "./AnnotationBlock";
import { AnnotationLabel } from "./AnnotationLabel";
import "@ungap/custom-elements";

/**
 * A button that cancels editing or creating an annotation on click.
 */
class CancelButton extends HTMLButtonElement {
    annotationElement: AnnotationBlock | AnnotationLabel;

    /**
     * Creates a cancel button.
     *
     * @param {AnnotationBlock | AnnotationLabel} annotationElement Annotation element associated
     * with this cancel button.
     */
    constructor(annotationElement: AnnotationBlock | AnnotationLabel) {
        super();

        this.annotationElement = annotationElement;

        // Set class and content
        this.classList.add("tahqiq-button", "tahqiq-cancel-button");
        this.textContent = "Cancel";

        // Attach click handler
        this.addEventListener("click", this.handleCancel.bind(this));
        // Attach annotorious cancelSelected event handler
        document.addEventListener(
            "cancel-annotation",
            this.handleCancel.bind(this),
        );
    }

    /**
     * On click or cancel from Annotorious, cancel edit/create annotation.
     *
     * @param {Event|CustomEvent} evt Click event
     */
    handleCancel(evt: Event | CustomEvent) {
        // cancel the edit
        evt.stopPropagation(); // ensure parent onClick event isn't called

        // if a cancel is triggered but there are changes
        // in the editor, give the user a chance to keep editing.
        // NOTE: does not account for changes to label or annotation zone.
        if (window.tinymce?.activeEditor?.isDirty()) {
            if (
                confirm(
                    "You have unsaved changes. Do you want to keep editing?",
                ) == true
            ) {
                // if they click ok, return and don't process the cancellation
                return;
            }
        }
        // if there are no changes or user clicked cancel,
        // continue on to process the cancel

        // if this was cancelled by annotorious, should dispatch CustomEvent with a Selection in the
        // CustomEvent.details targeting the same canvas as this.annotationElement.annotation
        let thisSource = this.annotationElement.annotation.target.source;
        if (typeof thisSource !== "string") thisSource = thisSource.id;
        const cancelledByAnnotorious =
            evt instanceof CustomEvent &&
            // handle target source of types string and Source
            (
                evt.detail?.target?.source === thisSource ||
                evt.detail?.target?.source?.id === thisSource
            );
        // if this was a click event or it was cancelled by annotorious, cancel!
        if (!(evt instanceof CustomEvent) || cancelledByAnnotorious) {
            // clear the selection from the image
            this.annotationElement.onCancel();
            if (this.annotationElement.annotation.id) {
                // if annotation was saved previously, restore and make read only
                this.annotationElement.makeReadOnly(true);
            } else {
                // if this was a new annotation, remove the displayBlock
                this.annotationElement.remove();
            }
        }
    }
}

export { CancelButton };
