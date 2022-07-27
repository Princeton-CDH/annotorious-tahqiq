import { AnnotationBlock } from "../../src/elements/AnnotationBlock";
import { SaveButton } from "../../src/elements/SaveButton";

// Mock annotationBlock
jest.mock("../../src/elements/AnnotationBlock");
const annoBlock = new (AnnotationBlock as jest.Mock<AnnotationBlock>)();
annoBlock.onSave = jest.fn();
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
        customElements.define("save-button", SaveButton, {
            extends: "button",
        });
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("Should set class and text content", () => {
        const saveButton = new SaveButton(annoBlock);
        expect(saveButton.classList).toContain("tahqiq-save-button");
        expect(saveButton.textContent).toBe("Save");
    });
});

describe("Click handler", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("Should stop event propagation up to parent element", () => {
        const saveButton = new SaveButton(annoBlock);
        const evt = new MouseEvent("click");
        const propagationSpy = jest.spyOn(evt, "stopPropagation");
        saveButton.dispatchEvent(evt);
        expect(propagationSpy).toBeCalledTimes(1);
    });
    it("Should call onSave", () => {
        const saveButton = new SaveButton(annoBlock);
        const evt = new MouseEvent("click");
        saveButton.dispatchEvent(evt);
        expect(annoBlock.onSave).toBeCalledWith(annoBlock);
    });
});
