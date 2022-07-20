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
};

// a fake annotation
const fakeAnnotation = {
    id: "someId",
    "@context": "fakeContext",
    body: {},
    motivation: "commenting",
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
});

describe("Event handlers", () => {
    beforeEach(async () => {
        // Reset mocks before each test
        clientMock.on.mockClear();
        clientMock.emit.mockClear();
        fetchMock.resetMocks();
    });

    it("should respond to emitted createAnnotation event with handler", async () => {
        // initialize the storage
        fetchMock.mockResponseOnce(
            JSON.stringify({ resources: [fakeAnnotation] }),
            {
                status: 200,
                statusText: "ok",
            },
        );
        new AnnotationServerStorage(clientMock, settings);

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
        await clientMock.emit("createAnnotation", fakeAnnotation);
        // should get new id from server
        const newAnnotation = {
            ...fakeAnnotation,
            id: "assignedId",
            target: { source: "fakesource" },
        };
        // should call addAnnotation on client
        expect(clientMock.addAnnotation).toHaveBeenCalledWith(newAnnotation);
    });

    it("should respond to emitted updateAnnotation event with handler", async () => {
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
            body: {},
            motivation: "commenting",
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
            ...fakeAnnotation,
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
        new AnnotationServerStorage(clientMock, settings);

        fetchMock.mockResponseOnce(JSON.stringify({}), {
            status: 200,
            statusText: "ok",
        });

        clientMock.emit("deleteAnnotation", fakeAnnotation);
        // should call adapter.delete
        // expect(fetchMock).toHaveBeenCalledWith(fakeAnnotation.id);
    });
});
