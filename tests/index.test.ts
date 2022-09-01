import { TranscriptionEditor } from "../src";
import { AnnotationBlock } from "../src/elements/AnnotationBlock";

// a fake annotation
const fakeAnnotation = {
    id: "someId",
    "@context": "fakeContext",
    body: {},
    motivation: "commenting",
    "schema:position": 1,
    target: { source: "fakesource" },
    type: "Annotation",
};

// Mock the Annotorious client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const eventArray: { name: string; fn: (...data: any) => any }[] = [];
const clientMock = {
    disableEditor: false,
    addAnnotation: jest.fn(),
    removeAnnotation: jest.fn(),
    getAnnotations: jest.fn().mockReturnValue([
        {
            ...fakeAnnotation,
            "schema:position": 3,
        },
        fakeAnnotation,
        {
            ...fakeAnnotation,
            "schema:position": 2,
        },
    ]),
    cancelSelected: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on: jest.fn().mockImplementation((evtName: string, handler: () => any) => {
        // add name/handler pair to events array
        eventArray.push({ name: evtName, fn: handler });
    }),
    emit: jest
        .fn()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockImplementation(async (evtName: string, ...data: any) => {
            // match event name to a handler in events array, pass data
            await eventArray.find((evt) => evt.name === evtName)?.fn(...data);
        }),
};
// Mock the storage plugin
const storageMock = {
    delete: jest.fn(),
    loadAnnotations: jest.fn(),
    update: jest.fn(),
};
const container = document.createElement("annotation-block");

describe("Plugin instantiation", () => {
    it("Should attach event listeners on initialization", () => {
        const addEventListenerSpy = jest.spyOn(document, "addEventListener");
        new TranscriptionEditor(clientMock, storageMock, container);
        expect(addEventListenerSpy).toBeCalledTimes(1);
        // should also attach even listeners to client events
        expect(clientMock.on).toBeCalledTimes(3);
    });
    it("Should define custom elements on initialization", () => {
        new TranscriptionEditor(clientMock, storageMock, container);
        expect(customElements.get("annotation-block")).toBeDefined();
        expect(customElements.get("save-button")).toBeDefined();
        expect(customElements.get("delete-button")).toBeDefined();
        expect(customElements.get("cancel-button")).toBeDefined();
    });
});

describe("Load annotations", () => {
    it("Should sort annotations by schema:position attribute", () => {
        const editor = new TranscriptionEditor(clientMock, storageMock, container);
        editor.handleAnnotationsLoaded();
        const blocks = editor.annotationContainer.querySelectorAll("annotation-block");
        blocks.forEach((block, index) => {
            if (block instanceof AnnotationBlock) {
                expect(block.annotation["schema:position"]).toEqual(index + 1);
            }
        });
    });
});

describe("Set annotations draggable", () => {
    it("Should change the draggable property on all annotation blocks", () => {
        const editor = new TranscriptionEditor(clientMock, storageMock, container);
        editor.handleAnnotationsLoaded();
        editor.setAllDraggability(false);
        const blocks = editor.annotationContainer.querySelectorAll("annotation-block");
        blocks.forEach((block) => {
            if (block instanceof AnnotationBlock) {
                expect(block.draggable).toBe(false);
            }
        });
    });
});

describe("Drag over annotation", () => {
    it("Should add drag target class to passed block and remove from all others", () => {
        const editor = new TranscriptionEditor(clientMock, storageMock, container);
        editor.handleAnnotationsLoaded();
        const blocks = editor.annotationContainer.querySelectorAll("annotation-block");
        const draggedOver = blocks[0];
        const other = blocks[1];
        if (draggedOver && draggedOver instanceof AnnotationBlock) {
            editor.handleDragOverAnnotationBlock(draggedOver);
            expect(draggedOver.classList.contains("tahqiq-drag-target")).toBe(true);
            if (other) {
                expect(other.classList.contains("tahqiq-drag-target")).toBe(false);
            }
        }
    });
    it("Should remove drag target class from all blocks if null passed", () => {
        const editor = new TranscriptionEditor(clientMock, storageMock, container);
        editor.handleAnnotationsLoaded();
        editor.handleDragOverAnnotationBlock(null);
        const blocks = editor.annotationContainer.querySelectorAll("annotation-block");
        blocks.forEach((block) => {
            expect(block.classList.contains("tahqiq-drag-target")).toBe(false);
        });
    });
});

// TODO: Test handleDropAnnotationBlock once DragEvent is implemented in jsdom
// https://github.com/jsdom/jsdom/blob/28ed5/test/web-platform-tests/to-run.yaml#L648-L654
