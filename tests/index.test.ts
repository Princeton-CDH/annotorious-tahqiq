import TranscriptionEditor from "../src";

// Mock the Annotorious client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const eventArray: { name: string; fn: (...data: any) => any }[] = [];
const clientMock = {
    disableEditor: false,
    addAnnotation: jest.fn(),
    removeAnnotation: jest.fn(),
    getAnnotations: jest.fn(),
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
    adapter: {
        delete: jest.fn(),
    },
};
const container = document.createElement("div");

// mock custom elements definition; required to prevent naming conflicts
const customElementsSpy = jest.spyOn(customElements, "define");
customElementsSpy.mockImplementation(() => jest.fn());

describe("Plugin instantiation", () => {
    beforeEach(() => {
        // ensure call count is reset
        customElementsSpy.mockReset();
    });

    it("Should attach event listeners on initialization", () => {
        const addEventListenerSpy = jest.spyOn(document, "addEventListener");
        new TranscriptionEditor(clientMock, storageMock, container);
        expect(addEventListenerSpy).toBeCalledTimes(1);
        // should also attach even listeners to client events
        expect(clientMock.on).toBeCalledTimes(3);
    });
    it("Should define custom elements on initialization", () => {
        new TranscriptionEditor(clientMock, storageMock, container);
        expect(customElementsSpy).toBeCalledTimes(4);
    });
});
