import fetchMock, { enableFetchMocks } from "jest-fetch-mock";
enableFetchMocks();
import AnnotationServerStorage from "../src/storage";

// Mock the Annotorious client:
// Use an array of events to mock "on" and "emit" implementations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const eventArray: { name: string; fn: (...data: any) => any }[] = [];
const clientMock = {
    addAnnotation: jest.fn(),
    setAnnotations: jest.fn(),
    removeAnnotation: jest.fn(),
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

// settings object
const settings = {
    annotationEndpoint: "http://fakeEndpoint.com/",
    manifest: "fakeManifest",
    target: "fakeCanvas",
    csrf_token: "fakeToken",
    sourceUri: "https://fakesource.uri",
};

// a fake annotation
let fakeAnnotation = {
    id: "someId",
    "@context": "fakeContext",
    body: { value: "fake" },
    target: { source: "fakesource" },
    type: "Annotation",
};

describe("Storage instantiation", () => {
    beforeEach(() => {
        // Reset mocks before each test
        clientMock.on.mockClear();
        clientMock.setAnnotations.mockClear();
        fetchMock.resetMocks();
        fetchMock.mockResponse(
            JSON.stringify({ resources: [fakeAnnotation] }),
            {
                status: 200,
                statusText: "ok",
            },
        );
        fakeAnnotation = {
            id: "someId",
            "@context": "fakeContext",
            body: { value: "fake" },
            target: { source: "fakesource" },
            type: "Annotation",
        };
    });

    it("Should dispatch the anno load event", async () => {
        // spy on dispatch event to ensure it is called later
        const dispatchEventSpy = jest.spyOn(document, "dispatchEvent");

        // initialize the storage
        const storage = new AnnotationServerStorage(clientMock, settings);
        await storage.loadAnnotations();

        // Should dispatch the event "annotations-loaded" after 100ms
        await new Promise((res) => setTimeout(res, 100));
        expect(dispatchEventSpy).toHaveBeenCalledWith(
            new Event("annotations-loaded"),
        );
    });
    it("Should call setAnnotations with the fake annotation in an array", async () => {
        // initialize the storage
        const storage = new AnnotationServerStorage(clientMock, settings);
        await storage.loadAnnotations();

        expect(clientMock.setAnnotations).toHaveBeenCalled();
        expect(clientMock.setAnnotations.mock.calls[0][0]).toStrictEqual([
            fakeAnnotation,
        ]);
    });

    it("Should initialize the event listeners", async () => {
        // initialize the storage
        new AnnotationServerStorage(clientMock, settings);

        expect(clientMock.on).toHaveBeenCalledTimes(3);
    });

    it("Should set annotationCount to 0", () => {
        // initialize the storage
        const storage = new AnnotationServerStorage(clientMock, settings);

        expect(storage.annotationCount).toEqual(0);
    });
});

describe("Event handlers", () => {
    beforeEach(async () => {
        // Reset mocks before each test
        clientMock.on.mockClear();
        clientMock.emit.mockClear();
        fetchMock.resetMocks();
        fakeAnnotation = {
            id: "someId",
            "@context": "fakeContext",
            body: { value: "fake" },
            target: { source: "fakesource" },
            type: "Annotation",
        };
    });

    it("should respond to emitted createAnnotation event with handler", async () => {
        const originalAnnotation = { ...fakeAnnotation };
        // initialize the storage
        fetchMock.mockResponseOnce(
            JSON.stringify({ resources: [fakeAnnotation] }),
            {
                status: 200,
                statusText: "ok",
            },
        );
        const storage = new AnnotationServerStorage(clientMock, settings);

        fetchMock.mockResponseOnce(
            JSON.stringify({
                ...fakeAnnotation,
                id: "assignedId",
            }),
            {
                status: 200,
                statusText: "ok",
            },
        );
        const createSpy = jest.spyOn(AnnotationServerStorage.prototype, "create");
        await clientMock.emit("createAnnotation", fakeAnnotation);
        // should include dc:source in annotation passed to create method
        expect(createSpy).toHaveBeenCalledWith({
            ...fakeAnnotation,
            "dc:source": settings.sourceUri,
        });
        // should get new id from server
        const newAnnotation = {
            ...originalAnnotation,
            id: "assignedId",
            target: { source: "fakesource" },
        };
        // should call addAnnotation on client
        expect(clientMock.addAnnotation).toHaveBeenCalledWith(newAnnotation);

        // should increment annotationCount
        expect(storage.annotationCount).toEqual(1);
    });

    it("should respond to emitted updateAnnotation event with handler", async () => {
        const originalAnnotation = { ...fakeAnnotation };
        // initialize the storage
        fetchMock.mockResponseOnce(
            JSON.stringify({ resources: [fakeAnnotation] }),
            {
                status: 200,
                statusText: "ok",
            },
        );
        new AnnotationServerStorage(clientMock, settings);
        const annotation = {
            ...fakeAnnotation,
            id: "newId",
        };
        const previous = {
            "@context": "oldfakeContext",
            id: "oldId",
            body: { value: "fake" },
            target: { source: "oldfakesource" },
            type: "Annotation",
        };

        fetchMock.mockResponseOnce(
            JSON.stringify({
                ...fakeAnnotation,
                id: "oldId",
            }),
            {
                status: 200,
                statusText: "ok",
            },
        );
        const newAnnotation = {
            ...originalAnnotation,
            id: "assignedId",
            target: { source: "fakesource" },
        };
        clientMock.emit("updateAnnotation", annotation, previous);
        // should call addAnnotation on client
        expect(clientMock.addAnnotation).toHaveBeenCalledWith(newAnnotation);
    });

    it("should respond to emitted deleteAnnotation event with handler", async () => {
        // initialize the storage
        fetchMock.mockResponseOnce(
            JSON.stringify({ resources: [fakeAnnotation] }),
            {
                status: 200,
                statusText: "ok",
            },
        );
        const storage = new AnnotationServerStorage(clientMock, settings);

        fetchMock.mockResponseOnce(JSON.stringify({}), {
            status: 200,
            statusText: "ok",
        });

        clientMock.emit("deleteAnnotation", fakeAnnotation);
        // should call adapter.delete
        // expect(fetchMock).toHaveBeenCalledWith(fakeAnnotation.id);
        // should decrement annotationCount
        expect(storage.annotationCount).toEqual(0);
    });
});

describe("Load annotations", () => {
    beforeEach(() => {
        // Reset mocks before each test
        clientMock.on.mockClear();
        clientMock.setAnnotations.mockClear();
        fetchMock.resetMocks();
        fakeAnnotation = {
            id: "someId",
            "@context": "fakeContext",
            body: { value: "fake" },
            target: { source: "fakesource" },
            type: "Annotation",
        };
    });
    it("Should sort annotations by schema:position attribute, with nulls at the end", async () => {
        fetchMock.mockResponse(
            JSON.stringify([
                {
                    ...fakeAnnotation,
                    "schema:position": null,
                },
                {
                    ...fakeAnnotation,
                    "schema:position": 2,
                },
                {
                    ...fakeAnnotation,
                    "schema:position": 1,
                },
                {
                    ...fakeAnnotation,
                    "schema:position": 3,
                },
                {
                    ...fakeAnnotation,
                    "schema:position": 30,
                },
                {
                    ...fakeAnnotation,
                    "schema:position": undefined,
                },
            ]),
            {
                status: 200,
                statusText: "ok",
            },
        );
        const storage = new AnnotationServerStorage(clientMock, settings);
        const annotations = await storage.loadAnnotations();
        if (annotations && annotations.length) {
            expect(annotations.length).toEqual(6);
            expect(annotations[0]["schema:position"]).toEqual(1);
            expect(annotations[5]["schema:position"]).toEqual(null);
        }
    });
});

describe("Create annotations with secondary motivation", () => {
    beforeEach(() => {
        // Reset mocks before each test
        clientMock.on.mockClear();
        clientMock.setAnnotations.mockClear();
        fetchMock.resetMocks();
        fakeAnnotation = {
            id: "someId",
            "@context": "fakeContext",
            body: { value: "fake" },
            target: { source: "fakesource" },
            type: "Annotation",
        };
    });
    it("should add secondary motivation from settings to annotation", async () => {
        fetchMock.mockResponseOnce(
            JSON.stringify({ resources: [fakeAnnotation] }),
            {
                status: 200,
                statusText: "ok",
            },
        );

        // initialize the storage with secondaryMotivation
        const storage = new AnnotationServerStorage(clientMock, {
            ...settings,
            secondaryMotivation: "transcribing",
        });

        // mock client response
        fetchMock.mockResponseOnce(
            JSON.stringify({
                ...fakeAnnotation,
                id: "assignedId",
            }),
            {
                status: 200,
                statusText: "ok",
            },
        );
        const createSpy = jest.spyOn(storage, "create");
        await storage.handleCreateAnnotation(fakeAnnotation);

        // should add "transcribing" as secondary motivation
        expect(createSpy).toHaveBeenCalledWith({
            ...fakeAnnotation,
            "dc:source": settings.sourceUri,
            motivation: ["sc:supplementing", "transcribing"],
        });
    });
});