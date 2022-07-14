import { AnnotationBlock } from "../../src/elements/AnnotationBlock";
import { DeleteButton } from "../../src/elements/DeleteButton";

// Mock annotationBlock
jest.mock("../../src/elements/AnnotationBlock");

describe("Element initialization", () => {
    beforeAll(() => {
        // register custom element
        customElements.define("delete-button", DeleteButton, {
            extends: "button",
        });
    });
    beforeEach(() => {
        (AnnotationBlock as jest.Mock<AnnotationBlock>).mockClear();
    });
    it("Should set class and text content", () => {
        const annoBlock = new (AnnotationBlock as jest.Mock<AnnotationBlock>)();
        const deleteButton = new DeleteButton(annoBlock);
        expect(deleteButton.classList).toContain("tahqiq-delete-button");
        expect(deleteButton.textContent).toBe("Delete");
    });
});
