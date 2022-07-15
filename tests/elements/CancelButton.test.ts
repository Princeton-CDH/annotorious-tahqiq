import { AnnotationBlock } from "../../src/elements/AnnotationBlock";
import { CancelButton } from "../../src/elements/CancelButton";

// Mock annotationBlock
jest.mock("../../src/elements/AnnotationBlock");

describe("Element initialization", () => {
    beforeAll(() => {
        // register custom element
        customElements.define("cancel-button", CancelButton, {
            extends: "button",
        });
    });
    beforeEach(() => {
        (AnnotationBlock as jest.Mock<AnnotationBlock>).mockClear();
    });
    it("Should set class and text content", () => {
        const annoBlock = new (AnnotationBlock as jest.Mock<AnnotationBlock>)();
        const cancelButton = new CancelButton(annoBlock);
        expect(cancelButton.classList).toContain("tahqiq-cancel-button");
        expect(cancelButton.textContent).toBe("Cancel");
    });
});
