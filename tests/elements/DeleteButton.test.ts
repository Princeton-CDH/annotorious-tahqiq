import { AnnotationBlock } from "../../src/elements/AnnotationBlock";
import { DeleteButton } from "../../src/elements/DeleteButton";
jest.mock("@ungap/custom-elements");

// Mock annotationBlock
jest.mock("../../src/elements/AnnotationBlock");

// mock an annotation block for this button
const annoBlock = new (AnnotationBlock as jest.Mock<AnnotationBlock>)();
annoBlock.onDelete = jest.fn();
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
        customElements.define("delete-button", DeleteButton, {
            extends: "button",
        });
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("Should set class and text content", () => {
        const deleteButton = new DeleteButton(annoBlock);
        expect(deleteButton.classList).toContain("tahqiq-delete-button");
        expect(deleteButton.textContent).toBe("Delete");
    });
});

describe("Click handler", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("Should stop event propagation up to parent element", () => {
        const deleteButton = new DeleteButton(annoBlock);
        const evt = new MouseEvent("click");
        const propagationSpy = jest.spyOn(evt, "stopPropagation");
        deleteButton.dispatchEvent(evt);
        expect(propagationSpy).toBeCalledTimes(1);
    });
    it("Should call onDelete", () => {
        const deleteButton = new DeleteButton(annoBlock);
        const evt = new MouseEvent("click");
        deleteButton.dispatchEvent(evt);
        expect(annoBlock.onDelete).toBeCalledWith(annoBlock);
    });
});
