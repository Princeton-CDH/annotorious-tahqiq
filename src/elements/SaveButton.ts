import { Annotation } from "../types/Annotation";

class SaveButton extends HTMLButtonElement {
    container: HTMLElement;

    editor;

    selection: Annotation;

    textInput: HTMLDivElement;

    constructor(
        container: HTMLElement,
        editor: any,
        selection: Annotation,
        textInput: HTMLDivElement,
    ) {
        super();

        this.container = container;
        this.editor = editor;
        this.selection = selection;
        this.textInput = textInput;

        // Set class and content
        this.setAttribute("class", "save");
        this.textContent = "Save";

        // Attach click handler
        this.addEventListener("click", this.handleClick.bind(this));
    }

    async handleClick(): Promise<void> {
        // add the content to the annotation
        this.selection.motivation = "supplementing";
        if (
            Array.isArray(this.selection.body) &&
            this.selection.body.length == 0
        ) {
            this.selection.body.push({
                type: "TextualBody",
                purpose: "transcribing",
                value: this.textInput.textContent || "",
                format: "text/html",
                // TODO: transcription motivation, language, etc.
            });
        } else if (Array.isArray(this.selection.body)) {
            // assume text content is first body element
            this.selection.body[0].value = this.textInput.textContent || "";
        }
        // update with annotorious, then save to storage backend
        console.log(this.selection);
        await this.editor.anno.updateSelected(this.selection);
        this.editor.anno.saveSelected();
        // make the editor inactive
        this.editor.makeReadOnly(this.container);
    }
}

export { SaveButton };
