import { TranscriptionEditor } from "../src";
import { AnnotationBlock } from "../src/elements/AnnotationBlock";

// a fake annotation
const fakeAnnotation = {
    id: "someId",
    "@context": "fakeContext",
    body: {
        value: "fake value",
    },
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
        fakeAnnotation,
        {
            ...fakeAnnotation,
            "schema:position": 2,
        },
        {
            ...fakeAnnotation,
            "schema:position": 3,
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
    settings: {
        target: "canvas1",
    },
    alert: jest.fn(),
};
const container = document.createElement("annotation-block");

describe("Plugin instantiation", () => {
    it("Should attach event listeners on initialization", () => {
        const addEventListenerSpy = jest.spyOn(document, "addEventListener");
        new TranscriptionEditor(clientMock, storageMock, container, "fakeTinyMceKey");
        expect(addEventListenerSpy).toBeCalledTimes(2);
        // should also attach even listeners to client events
        expect(clientMock.on).toBeCalledTimes(4);
    });
    it("Should define custom elements on initialization", () => {
        new TranscriptionEditor(clientMock, storageMock, container, "fakeTinyMceKey");
        expect(customElements.get("annotation-block")).toBeDefined();
        expect(customElements.get("save-button")).toBeDefined();
        expect(customElements.get("delete-button")).toBeDefined();
        expect(customElements.get("cancel-button")).toBeDefined();
    });
});

describe("Set annotations draggable", () => {
    it("Should change the draggable property on all annotation blocks", () => {
        const editor = new TranscriptionEditor(
            clientMock, storageMock, container, "fakeTinyMceKey",
        );
        editor.handleAnnotationsLoaded(
            new CustomEvent("annotations-loaded", {
                detail: {
                    target: "canvas1",
                    annotations: [fakeAnnotation],
                },
            }),
        );
        editor.setAllDraggability(false);
        const blocks = editor.annotationContainer.querySelectorAll("annotation-block");
        blocks.forEach((block) => {
            if (block instanceof AnnotationBlock) {
                expect(block.draggable).toBe(false);
            }
        });
    });
});

const fakeAnnotationList = [
    { ...fakeAnnotation, id: "first", "schema:position": 2 },
    { ...fakeAnnotation, id: "second" },
    { ...fakeAnnotation, id: "third", "schema:position": 3 },
    { ...fakeAnnotation, id: "fourth", "schema:position": null },
];

describe("Update annotations sequence", () => {
    it("Should set schema:position on all passed annotations to their list indices", async () => {
        const updateSpy = jest.spyOn(storageMock, "update");
        const editor = new TranscriptionEditor(
            clientMock, storageMock, container, "fakeTinyMceKey",
        );
        await editor.updateSequence(fakeAnnotationList);
        // should only be called 3 times, as only 3/4 need to be updated
        expect(updateSpy).toBeCalledTimes(3);
        expect(updateSpy).toBeCalledWith({
            ...fakeAnnotation, id: "first", "schema:position": 1,
        });
        expect(updateSpy).toBeCalledWith({
            ...fakeAnnotation, id: "second", "schema:position": 2,
        });
        expect(updateSpy).toBeCalledWith({
            ...fakeAnnotation, id: "fourth", "schema:position": 4,
        });
    });
    it("Should set all draggability to false and reload all annotations", async () => {
        const editor = new TranscriptionEditor(
            clientMock, storageMock, container, "fakeTinyMceKey",
        );
        const draggabilitySpy = jest.spyOn(editor, "setAllDraggability");
        storageMock.loadAnnotations.mockClear();
        await editor.updateSequence(fakeAnnotationList);
        expect(draggabilitySpy).toBeCalledWith(false);
        expect(storageMock.loadAnnotations).toBeCalledTimes(1);
    });
});

describe("Reload all positions", () => {
    beforeEach(() => {
        storageMock.loadAnnotations.mockClear();
    });

    it("Should retrieve annotations from storage, then run updateSequence", async () => {
        const editor = new TranscriptionEditor(
            clientMock, storageMock, container, "fakeTinyMceKey",
        );
        const loadAnnotationsSpy = jest.spyOn(storageMock, "loadAnnotations");
        const updateSequenceSpy = jest.spyOn(editor, "updateSequence");
        const resolvedAnnos = [
            { ...fakeAnnotation, id: "first", "schema:position": 4 },
            { ...fakeAnnotation, id: "second", "schema:position": 2 },
        ];
        storageMock.loadAnnotations.mockResolvedValueOnce(resolvedAnnos);
        await editor.handleReloadAllPositions();
        // called once by handleReloadAllPositions, and once by updateSequence
        expect(loadAnnotationsSpy).toBeCalledTimes(2);
        // should reorder the returned annotations
        expect(updateSequenceSpy).toBeCalledWith(resolvedAnnos);
    });
});