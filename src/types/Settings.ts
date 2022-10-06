/**
 * Required settings for the SAS Annotorious plugin.
 */
interface Settings {
    annotationEndpoint: string;
    target: string;
    manifest: string;
    csrf_token: string;
    secondaryMotivation?: string;
    sourceUri?: string;
}

export { Settings };
