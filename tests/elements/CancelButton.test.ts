import { AnnotationBlock } from "../../src/elements/AnnotationBlock";
import { CancelButton } from "../../src/elements/CancelButton";

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
});
