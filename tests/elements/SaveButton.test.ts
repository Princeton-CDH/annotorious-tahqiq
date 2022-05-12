import { AnnotationBlock } from "../../src/elements/AnnotationBlock";
import { SaveButton } from "../../src/elements/SaveButton";

// Mock annotationBlock
jest.mock("../../src/elements/AnnotationBlock");

describe("Element initialization", () => {
    beforeAll(() => {
        // register custom element
        customElements.define("save-button", SaveButton, {
            extends: "button",
        });
    });
    beforeEach(() => {
        (AnnotationBlock as jest.Mock<AnnotationBlock>).mockClear();
    });
    it("Should set class and text content", () => {
        const annoBlock = new (AnnotationBlock as jest.Mock<AnnotationBlock>)();
        const saveButton = new SaveButton(annoBlock);
        expect(saveButton.className).toBe("save");
        expect(saveButton.textContent).toBe("Save");
    });
});
