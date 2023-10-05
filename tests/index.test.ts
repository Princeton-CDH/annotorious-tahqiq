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
    _element: document.createElement("div"),
    disableEditor: false,
    addAnnotation: jest.fn(),
    removeAnnotation: jest.fn(),
    selectAnnotation: jest.fn(),
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

// Mock some of the Annotorious DOM tree
const osdCanvas = document.createElement("div");
osdCanvas.className = "openseadragon-canvas";
clientMock._element.appendChild(osdCanvas);
const annotationLayer = document.createElement("svg");
annotationLayer.className = "a9s-annotationlayer";
const annotoriousRectangle = document.createElement("g");
annotoriousRectangle.className = "a9s-annotation";
const handle = document.createElement("g");
handle.className = "a9s-handle";
annotoriousRectangle.appendChild(handle);
annotationLayer.appendChild(annotoriousRectangle);
const selectedRectangle = document.createElement("g");
selectedRectangle.classList.add("a9s-annotation", "editable", "selected");
annotationLayer.appendChild(selectedRectangle);
clientMock._element.appendChild(annotationLayer);

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
const toolbarContainer = document.createElement("fieldset");

describe("Plugin instantiation", () => {
    afterEach(() => {
        jest.clearAllMocks();  // clear counts after each test
    });

    it("Should attach event listeners on initialization", () => {
        const addEventListenerSpy = jest.spyOn(document, "addEventListener");
        new TranscriptionEditor(
            clientMock, storageMock, container, toolbarContainer, "fakeTinyMceKey",
        );
        expect(addEventListenerSpy).toBeCalledTimes(2);
        // should also attach even listeners to client events
        expect(clientMock.on).toBeCalledTimes(4);
    });
    it("Should define custom elements on initialization", () => {
        new TranscriptionEditor(
            clientMock, storageMock, container, toolbarContainer, "fakeTinyMceKey",
        );
        expect(customElements.get("annotation-block")).toBeDefined();
        expect(customElements.get("save-button")).toBeDefined();
        expect(customElements.get("delete-button")).toBeDefined();
        expect(customElements.get("cancel-button")).toBeDefined();
    });
    it("Should bind handlers for annotorious events on initialization", () => {
        new TranscriptionEditor(
            clientMock, storageMock, container, toolbarContainer, "fakeTinyMceKey",
        );
        expect(clientMock.on).toBeCalledTimes(4);
        // not sure how to compare bound functions;
        // collect the first arguments of all calls to check bound signals
        const boundSignals = clientMock.on.mock.calls.map(x => { return x[0]; } );
        const expectedBoundSignals = [
            "createSelection", "selectAnnotation", 
            "changeSelectionTarget",  "cancelSelected"];
        expect(boundSignals).toEqual(expectedBoundSignals);
    });

});

describe("Initialize toolbar", () => {
    it("Should add rectangle tool", () => {
        new TranscriptionEditor(
            clientMock, storageMock, container, toolbarContainer, "fakeTinyMceKey",
        );
        const rectangleTool = toolbarContainer.querySelector("label.rectangle-tool");
        expect(rectangleTool).toBeInstanceOf(HTMLLabelElement);
        // should be set active by default
        expect(rectangleTool?.classList?.contains("active-tool")).toBe(true);
        expect(rectangleTool?.querySelector("input")?.checked).toBe(true);
    });
    it("Should add polygon tool", () => {
        new TranscriptionEditor(
            clientMock, storageMock, container, toolbarContainer, "fakeTinyMceKey",
        );
        const polygonTool = toolbarContainer.querySelector("label.polygon-tool");
        expect(polygonTool).toBeInstanceOf(HTMLLabelElement);
        // should NOT be set active by default
        expect(polygonTool?.classList?.contains("active-tool")).toBe(false);
        expect(polygonTool?.querySelector("input")?.checked).toBe(false);
    });
});

describe("Set annotations draggable", () => {
    it("Should change the draggable property on all annotation blocks", () => {
        const editor = new TranscriptionEditor(
            clientMock, storageMock, container, toolbarContainer, "fakeTinyMceKey",
        );
        editor.handleAnnotationsLoaded(
            new CustomEvent("annotations-loaded", {
                detail: {
                    target: "canvas1",
                    annotations: [fakeAnnotation],
                },
            }),
        );
        editor.setAllInteractive(false);
        const blocks = editor.annotationContainer.querySelectorAll("annotation-block");
        blocks.forEach((block) => {
            if (block instanceof AnnotationBlock) {
                expect(block.draggable).toBe(false);
                expect(block.clickable).toBe(false);
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
            clientMock, storageMock, container, toolbarContainer, "fakeTinyMceKey",
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
            clientMock, storageMock, container, toolbarContainer, "fakeTinyMceKey",
        );
        const draggabilitySpy = jest.spyOn(editor, "setAllInteractive");
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
            clientMock, storageMock, container, toolbarContainer, "fakeTinyMceKey",
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

describe("Handle cancelSelection event", () => {
    it("Should emit cancel-annotation", () => {
        const editor = new TranscriptionEditor(
            clientMock, storageMock, container, toolbarContainer, "fakeTinyMceKey",
        );
        const dispatchEventSpy = jest.spyOn(document, "dispatchEvent");
        editor.handleCancelSelection(fakeAnnotation);
        expect(dispatchEventSpy).toHaveBeenCalledWith(
            new CustomEvent("cancel-annotation", { detail: fakeAnnotation }),
        );
    });
});

describe("Set annotorious pointer events", () => {
    it("Should set pointer-events to auto/all when enabled is set true", () => {
        const editor = new TranscriptionEditor(
            clientMock, storageMock, container, toolbarContainer, "fakeTinyMceKey",
        );
        editor.setAnnotoriousPointerEvents(true);
        expect(osdCanvas.style.pointerEvents).toBe("auto");
        expect(annotationLayer.style.pointerEvents).toBe("all");
        expect(annotoriousRectangle.style.pointerEvents).toBe("all");
    });
    it("Should set pointer-events to none when enabled is set false", () => {
        const editor = new TranscriptionEditor(
            clientMock, storageMock, container, toolbarContainer, "fakeTinyMceKey",
        );
        editor.setAnnotoriousPointerEvents(false);
        expect(osdCanvas.style.pointerEvents).toBe("none");
        expect(annotationLayer.style.pointerEvents).toBe("none");
        expect(annotoriousRectangle.style.pointerEvents).toBe("none");

        // should set selected rectangle pointer-events to "all"
        expect(selectedRectangle.style.pointerEvents).toBe("all");
    });
});

describe("Allow dragging selection handles", () => {
    it("Should add event listeners to handles", () => {
        const editor = new TranscriptionEditor(
            clientMock, storageMock, container, toolbarContainer, "fakeTinyMceKey",
        );
        const handleEventListenerSpy = jest.spyOn(handle, "addEventListener");
        editor.allowDragging(annotoriousRectangle);
        expect(handleEventListenerSpy).toHaveBeenCalledTimes(2);
    });
    it("Should respond to mousedown and mouseup with calls to setAnnotoriousPointerEvents", () => {
        const editor = new TranscriptionEditor(
            clientMock, storageMock, container, toolbarContainer, "fakeTinyMceKey",
        );
        const setPointerEventsSpy = jest.spyOn(editor, "setAnnotoriousPointerEvents");
        editor.allowDragging(annotoriousRectangle);
        let evt = new MouseEvent("mousedown");
        handle.dispatchEvent(evt);
        expect(setPointerEventsSpy).toHaveBeenCalled();
        evt = new MouseEvent("mouseup");
        handle.dispatchEvent(evt);
        expect(setPointerEventsSpy).toHaveBeenCalledTimes(2);
    });
});
