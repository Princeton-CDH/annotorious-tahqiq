import { AnnotationBlock } from "../../src/elements/AnnotationBlock";

// define props to pass to constructor
const props = {
    annotation: {
        "@context": "fake context",
        body: { value: "text" },
        motivation: "commenting",
        target: { source: "fake source" },
        type: "Annotation",
    },
    editable: false,
    onCancel: jest.fn(),
    onClick: jest.fn(),
    onDelete: jest.fn(),
    onSave: jest.fn(),
    updateAnnotorious: jest.fn(),
};

describe("Element initialization", () => {
    beforeAll(() => {
        // register custom element
        customElements.define("annotation-block", AnnotationBlock, {
            extends: "div",
        });
    });
    it("Should set display class", () => {
        const block = new AnnotationBlock(props);
        expect(block.className).toBe("annotation-display-container");
    });
    it("Should create and append body and label elements", () => {
        const createElementSpy = jest.spyOn(document, "createElement");
        const block = new AnnotationBlock(props);
        expect(createElementSpy).toBeCalledTimes(2);
        expect(block.childNodes.length).toBe(2);
    });
    it("Should set editable when editable prop is true", () => {
        const makeEditableSpy = jest.spyOn(
            AnnotationBlock.prototype,
            "makeEditable",
        ).mockImplementation(() => jest.fn());
        new AnnotationBlock(props);
        expect(makeEditableSpy).toBeCalledTimes(0);
        new AnnotationBlock({
            ...props,
            editable: true,
        });
        expect(makeEditableSpy).toBeCalledTimes(1);
    });
});
