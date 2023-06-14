import { AnnotationBlock } from "../../src/elements/AnnotationBlock";
import { CancelButton } from "../../src/elements/CancelButton";
jest.mock("@ungap/custom-elements");

// Mock annotationBlock
jest.mock("../../src/elements/AnnotationBlock");
const annoBlock = new (AnnotationBlock as jest.Mock<AnnotationBlock>)();
annoBlock.onCancel = jest.fn();
annoBlock.remove = jest.fn();
annoBlock.makeReadOnly = jest.fn();
annoBlock.annotation = {
    "@context": "fake context",
    body: { value: "text" },
    motivation: "commenting",
    target: { source: "fake source" },
    type: "Annotation",
};

describe("Element initialization", () => {
    beforeAll(() => {
        // register custom element
        customElements.define("cancel-button", CancelButton, {
            extends: "button",
        });
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("Should set class and text content", () => {
        const cancelButton = new CancelButton(annoBlock);
        expect(cancelButton.classList).toContain("tahqiq-cancel-button");
        expect(cancelButton.textContent).toBe("Cancel");
    });
});

describe("Click handler", () => {
    beforeEach(() => {
        // mock just the portion of tinymce we care about
        window.tinymce = { activeEditor: { isDirty: jest.fn() } };
        // mock global confirm method
        global.confirm = jest.fn();
        jest.clearAllMocks();
    });
    it("Should stop event propagation up to parent element", () => {
        const cancelButton = new CancelButton(annoBlock);
        const evt = new MouseEvent("click");
        const propagationSpy = jest.spyOn(evt, "stopPropagation");
        cancelButton.dispatchEvent(evt);
        expect(propagationSpy).toBeCalledTimes(1);
    });
    it("Should call remove if annotation.id is undefined", () => {
        const cancelButton = new CancelButton(annoBlock);
        const evt = new MouseEvent("click");
        cancelButton.dispatchEvent(evt);
        expect(annoBlock.remove).toBeCalledTimes(1);
    });
    it("Should call makeReadOnly if annotation.id is defined", () => {
        annoBlock.annotation.id = "test";
        const cancelButton = new CancelButton(annoBlock);
        const evt = new MouseEvent("click");
        cancelButton.dispatchEvent(evt);
        expect(annoBlock.makeReadOnly).toBeCalledWith(true);
    });
    it("Should prompt user to confirm when there are changes to text", () => {
        // simulate changes in editor
        window.tinymce.activeEditor.isDirty.mockReturnValueOnce(true);
        const cancelButton = new CancelButton(annoBlock);
        const evt = new MouseEvent("click");
        cancelButton.handleCancel(evt);
        expect(global.confirm).toHaveBeenCalledWith(
            "You have unsaved changes. Do you want to keep editing?",
        );
    });

    it("Should not cancel annotation if there are changes and user wants to keep editing",
        () => {
            // simulate changes
            window.tinymce.activeEditor.isDirty.mockReturnValueOnce(true);
            // simulate user says yes, keep editing
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            jest.spyOn(global, "confirm" as any).mockReturnValueOnce(true);
            const cancelButton = new CancelButton(annoBlock);
            const evt = new MouseEvent("click");
            cancelButton.handleCancel(evt);
            // should not cancel
            expect(annoBlock.onCancel).toBeCalledTimes(0);
        },
    );

    it("Should cancel if there are changes and user wants to cancel", () => {
        // simulate changes
        window.tinymce.activeEditor.isDirty.mockReturnValueOnce(true);
        // simulate user says no, realy cancel
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn(global, "confirm" as any).mockReturnValueOnce(false);
        const cancelButton = new CancelButton(annoBlock);
        const evt = new MouseEvent("click");
        cancelButton.handleCancel(evt);
        // should cancel
        expect(annoBlock.onCancel).toBeCalledTimes(1);
    });

});

describe("Canceled Annotorious selection event handler", () => {
    beforeEach(() => {
        // mock just the portion of tinymce we care about
        window.tinymce = { activeEditor: { isDirty: jest.fn() } };
        // mock global confirm method
        global.confirm = jest.fn();
        jest.clearAllMocks();
    });
    it("Should execute cancellation if target matches annotation", () => {
        // create new annotation block so the other one doesn't receive cancellation events
        const annoBlockToCancel = new (AnnotationBlock as jest.Mock<AnnotationBlock>)();
        annoBlockToCancel.onCancel = jest.fn();
        annoBlockToCancel.remove = jest.fn();
        annoBlockToCancel.makeReadOnly = jest.fn();
        annoBlockToCancel.annotation = {
            "@context": "fake context",
            body: { value: "text" },
            motivation: "commenting",
            target: { source: "real source" },
            type: "Annotation",
        };
        new CancelButton(annoBlockToCancel);
        const customEvt = new CustomEvent("cancel-annotation", {
            detail: { target: { source: "real source" } },
        });
        document.dispatchEvent(customEvt);
        expect(annoBlockToCancel.onCancel).toBeCalledTimes(1);
    });
    it("Should not execute cancellation if target does not match annotation", () => {
        new CancelButton(annoBlock);
        const badEvt = new CustomEvent("cancel-annotation", {
            // none of the annotation blocks match this target source
            detail: { target: { source: "wrong" } },
        });
        document.dispatchEvent(badEvt);
        expect(annoBlock.onCancel).toBeCalledTimes(0);
    });
});
