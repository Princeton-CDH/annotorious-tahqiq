import type { Annotation, SavedAnnotation } from "./types/Annotation";
import type { Source } from "./types/Source";
import type { Settings } from "./types/Settings";

// TODO: Add a typedef for the Annotorious client (anno)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
/**
 * Annotorious plugin to use W3C protocol storage
 */
class AnnotationServerStorage {
    anno;

    annotationCount: number;

    settings: Settings;

    /**
     * Instantiate the storage plugin.
     *
     * @param {any} anno Instance of the Annotorious client.
     * @param {Settings} settings Settings object for the storage plugin.
     */
    constructor(
        anno: any, // eslint-disable-line @typescript-eslint/no-explicit-any
        settings: Settings,
    ) {
        this.anno = anno;
        this.settings = settings;
        this.annotationCount = 0;

        // bind event handlers
        this.anno.on(
            "createAnnotation",
            this.handleCreateAnnotation.bind(this),
        );
        this.anno.on(
            "updateAnnotation",
            this.handleUpdateAnnotation.bind(this),
        );
        this.anno.on(
            "deleteAnnotation",
            this.handleDeleteAnnotation.bind(this),
        );

        // load annotations from the server and signal for display
        this.loadAnnotations();
    }

    /**
     * Helper function to load annotations asynchronously once the plugin
     * is initialized.
     */
    async loadAnnotations() {
        const annotations: void | SavedAnnotation[] = await this.search(this.settings.target);
        await this.anno.setAnnotations(annotations);
        if (annotations instanceof Array) {
            this.annotationCount = annotations.length;
        }
        setTimeout(() => document.dispatchEvent(
            // include target with annotations-loaded event to match canvases
            new CustomEvent("annotations-loaded", { detail: this.settings.target }),
        ), 100);
        return annotations;
    }

    /**
     * Event handler for the createAnnotation event; adjusts the source if
     * needed, saves the annotation to the store and Annotorious, then returns
     * the stored annotation retrieved from storage in a Promise.
     *
     * @param {Annotation} annotation V3 (W3C) annotation
     */
    async handleCreateAnnotation(annotation: Annotation): Promise<Annotation> {
        annotation.target.source = this.adjustTargetSource(
            annotation.target.source,
        );
        // save source URI to dc:source attribute on annotation
        if (this.settings.sourceUri) {
            annotation["dc:source"] = this.settings.sourceUri;
        }

        // save primary and secondary (if applicable) motivation on annotation
        annotation.motivation = this.settings.secondaryMotivation
            ? ["sc:supplementing", this.settings.secondaryMotivation]
            : "sc:supplementing";

        // increment annotation count and set position attribute
        this.setAnnotationCount(this.annotationCount + 1);
        if (!annotation["schema:position"]) {
            annotation["schema:position"] = this.annotationCount;
        }

        // wait for adapter to return saved annotation from storage
        const newAnnotation: Annotation = await this.create(
            annotation,
        );
        // remove the annotation with the provisional ID from Annotorious display
        this.anno.removeAnnotation(annotation.id);
        // add the saved annotation returned by storage to Annotorious display
        this.anno.addAnnotation(newAnnotation);

        // reload annotations
        document.dispatchEvent(
            // include target with annotations-loaded event to match canvases
            new CustomEvent("annotations-loaded", { detail: this.settings.target }),
        );
        return Promise.resolve(newAnnotation);
    }

    /**
     * Event handler for the updateAnnotation event; adjusts the source if
     * needed, then updates the annotation in the store and in Annotorious,
     *
     * @param {SavedAnnotation} annotation Updated annotation.
     * @param {SavedAnnotation} previous Previously saved annotation.
     */
    async handleUpdateAnnotation(
        annotation: SavedAnnotation,
        previous: SavedAnnotation,
    ): Promise<void> {
        // The posted annotation should have an @id which exists in the store
        // we want to keep the same id, so we update the new annotation with
        // the previous id before saving.
        annotation.id = previous.id;
        // target needs to be updated if the image selection has changed
        annotation.target.source = this.adjustTargetSource(
            annotation.target.source,
        );
        const updatedAnnotation: SavedAnnotation = await this.update(annotation);
        // redisplay the updated annotation in annotorious
        this.anno.addAnnotation(updatedAnnotation);
    }

    /**
     * Event handler for the deleteAnnotation event; deletes the annotation
     * from the store.
     *
     * @param {SavedAnnotation} annotation Annotation to delete; must have an
     * id property that matches its id property in the store.
     */
    handleDeleteAnnotation(annotation: SavedAnnotation) {
        this.setAnnotationCount(this.annotationCount - 1);
        this.delete(annotation);
    }

    /**
     * Set the annotation count, for use in calculating position
     *
     * @param {number} count The new count
     */
    setAnnotationCount(count: number) {
        this.annotationCount = count;
    }

    /**
     * Save a new annotation to storage.
     *
     * @param {Annotation} annotation V3 (W3C) annotation to save.
     */
    async create(annotation: Annotation) : Promise<SavedAnnotation> {
        return fetch(`${this.settings.annotationEndpoint}`, {
            body: JSON.stringify(annotation),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-CSRFToken": this.settings.csrf_token,
            },
            method: "POST",
        })
            .then((annotationResponse: Response) => annotationResponse.json());
        //.catch(() => this.all());
    }

    /**
     * Update an existing annotation in storage.
     *
     * @param {SavedAnnotation} annotation V3 (W3C) annotation to update.
     */
    async update(annotation: SavedAnnotation) : Promise<SavedAnnotation> {
        // post the revised annotation to its URI
        return fetch(annotation.id, {
            body: JSON.stringify(annotation),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-CSRFToken": this.settings.csrf_token,
            },
            method: "POST",
        })
            .then((annotationResponse: Response) => annotationResponse.json());
        // .then(() => this.all())
        // .catch(() => this.all());
    }

    /**
     *
     * Delete an existing annotation from storage.
     *
     * @param {SavedAnnotation} annotation to delete
     */
    async delete(annotation: SavedAnnotation) {
        return fetch(annotation.id, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-CSRFToken": this.settings.csrf_token,
            },
            method: "DELETE",
        });
        //     .then(() => this.all())
        //     .catch(() => this.all());
    }

    /**
     *
     * Search for annotations on the specified target, ordered by schema:position attribute.
     * 
     * @param {string} targetUri URI of the target to search for
     */
    async search(targetUri: string): Promise<void | SavedAnnotation[]> {
        const { annotationEndpoint, sourceUri } = this.settings;
        const sourceQuery = sourceUri ? `&source=${sourceUri}` : "";
        return fetch(`${annotationEndpoint}search/?uri=${targetUri}${sourceQuery}`, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-CSRFToken": this.settings.csrf_token,
            },
        })
            .then(response => response.json())
            .then(data => <SavedAnnotation[]>data.resources);
        //     .catch(() => this.all());
    }


    /**
     * Utility function to change a source string (Annotorious output) into a
     * Source object, in order to to add canvas/manifest info.
     *
     * @param {Source|string} source Source to be adjusted
     * @returns {Source} Source object with set target and manifest
     */
    adjustTargetSource(source: Source | string): Source {
        if (typeof source == "string") {
            // add manifest id to annotation
            source = {
                // use the configured target (should be canvas id)
                id: this.settings.target,
                // link to containing manifest
                partOf: {
                    id: this.settings.manifest,
                    type: "Manifest",
                },
                type: "Canvas",
            };
        }
        return source;
    }

}



export default AnnotationServerStorage;
