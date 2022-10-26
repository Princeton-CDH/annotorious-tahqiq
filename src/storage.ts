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
        try {
            const annotations: void | SavedAnnotation[] = await this.search(
                this.settings.target,
            );
            await this.anno.setAnnotations(annotations);
            if (annotations instanceof Array) {
                this.annotationCount = annotations.length;
            }
            document.dispatchEvent(
                new CustomEvent("annotations-loaded", {
                    detail: {
                        // include target with event to match canvases
                        target: this.settings.target,
                        // include annotations here (annotorious might be briefly out of sync)
                        annotations,
                    },
                }),
            );
            return annotations;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            this.alert(err.message, "error");
        }
    }

    /**
     * Event handler for the createAnnotation event; adjusts the source if
     * needed, saves the annotation to the store and Annotorious, then returns
     * the stored annotation retrieved from storage in a Promise.
     *
     * @param {Annotation} annotation V3 (W3C) annotation
     */
    async handleCreateAnnotation(
        annotation: Annotation,
    ): Promise<Annotation | void> {
        try {
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
            const newAnnotation: Annotation = await this.create(annotation);
            // remove the annotation with the provisional ID from Annotorious display
            this.anno.removeAnnotation(annotation.id);
            // add the saved annotation returned by storage to Annotorious display
            this.anno.addAnnotation(newAnnotation);

            // reload annotations
            // TODO: Avoid extra network request here
            await this.loadAnnotations();
            this.alert("Annotation created", "success");
            return await Promise.resolve(newAnnotation);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            this.alert(err.message, "error");
        }
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
    ): Promise<Annotation | void> {
        // The posted annotation should have an @id which exists in the store
        // we want to keep the same id, so we update the new annotation with
        // the previous id before saving.
        annotation.id = previous.id;
        // target needs to be updated if the image selection has changed
        annotation.target.source = this.adjustTargetSource(
            annotation.target.source,
        );
        try {
            const updatedAnnotation: SavedAnnotation = await this.update(
                annotation,
            );
            // redisplay the updated annotation in annotorious
            this.anno.addAnnotation(updatedAnnotation);
            // reload annotations from storage (for post-save effects e.g. html sanitization)
            await this.loadAnnotations();
            this.alert("Annotation saved", "success");
            return await Promise.resolve(updatedAnnotation);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            this.alert(err.message, "error");
        }
    }

    /**
     * Event handler for the deleteAnnotation event; deletes the annotation
     * from the store.
     *
     * @param {SavedAnnotation} annotation Annotation to delete; must have an
     * id property that matches its id property in the store.
     */
    async handleDeleteAnnotation(annotation: SavedAnnotation): Promise<void> {
        try {
            this.setAnnotationCount(this.annotationCount - 1);
            await this.delete(annotation);
            await this.loadAnnotations();
            this.alert("Annotation deleted", "success");
            return await Promise.resolve();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            this.alert(err.message, "error");
        }
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
    async create(annotation: Annotation): Promise<SavedAnnotation> {
        const res = await fetch(`${this.settings.annotationEndpoint}`, {
            body: JSON.stringify(annotation),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-CSRFToken": this.settings.csrf_token,
            },
            method: "POST",
        });
        // fetch won't automatically throw error on bad HTTP code, so check for ok
        if (res.ok) {
            return res.json();
        } else {
            throw new Error(
                `Error creating annotation: ${res.status} ${res.statusText}`,
            );
        }
    }

    /**
     * Update an existing annotation in storage.
     *
     * @param {SavedAnnotation} annotation V3 (W3C) annotation to update.
     */
    async update(annotation: SavedAnnotation): Promise<SavedAnnotation> {
        // post the revised annotation to its URI
        const res = await fetch(annotation.id, {
            body: JSON.stringify(annotation),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-CSRFToken": this.settings.csrf_token,
            },
            method: "POST",
        });
        if (res.ok) {
            return res.json();
        } else {
            throw new Error(
                `Error updating annotation: ${res.status} ${res.statusText}`,
            );
        }
    }

    /**
     *
     * Delete an existing annotation from storage.
     *
     * @param {SavedAnnotation} annotation to delete
     */
    async delete(annotation: SavedAnnotation) {
        const res = await fetch(annotation.id, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-CSRFToken": this.settings.csrf_token,
            },
            method: "DELETE",
        });
        if (res.ok) {
            return res;
        } else {
            throw new Error(
                `Error deleting annotation: ${res.status} ${res.statusText}`,
            );
        }
    }

    /**
     *
     * Search for annotations on the specified target, ordered by schema:position attribute.
     *
     * @param {string} targetUri URI of the target to search for
     */
    async search(targetUri: string): Promise<void | SavedAnnotation[]> {
        const { annotationEndpoint, sourceUri, manifest } = this.settings;
        const sourceQuery = sourceUri ? `&source=${sourceUri}` : "";
        const manifestQuery = manifest ? `&manifest=${manifest}` : "";
        const res = await fetch(
            `${annotationEndpoint}search/?uri=${targetUri}${sourceQuery}${manifestQuery}`,
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-CSRFToken": this.settings.csrf_token,
                },
            },
        );
        if (res.ok) {
            const data = await res.json();
            return <SavedAnnotation[]>data.resources;
        } else {
            throw new Error(
                `Error retrieving annotations: ${res.status} ${res.statusText}`,
            );
        }
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

    /**
     * Raises a custom event, tahqiq-alert, with passed message/status and the
     * target (i.e. canvas) with which this instance is associated.
     *
     * @param {string} message Message for the alert.
     * @param {string} status Optional alert status.
     */
    alert(message: string, status?: string) {
        document.dispatchEvent(
            new CustomEvent("tahqiq-alert", {
                detail: {
                    message,
                    status: status || "info",
                    target: this.settings.target,
                },
            }),
        );
    }
}

export default AnnotationServerStorage;
