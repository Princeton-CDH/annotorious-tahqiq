# annotorious-tahqiq

`annotorious-tahqiq` is a custom annotation editor implemented as a plugin for ][Annotorious](https://recogito.github.io/annotorious/). It is being developed as part of the [Princeton Geniza Project](http://geniza.princeton.edu) (https://github.com/Princeton-CDH/geniza) to support transcription editing and management with IIIF/W3C annotation.

The name taḥqīq (tah-KEEK) comes from the Arabic for text edition.

## Requirements

- Node.JS v16.x
- NPM v8.x
- TinyMCE v5 (recommended to use script tag pointing to Tiny CDN)
- Annotorious
- An annotation store supported by an Annotorious plugin

This project uses [Volta](https://volta.sh/) to pin Node and NPM versions.

## Usage

This plugin can be installed with NPM:

```sh
npm install --save https://github.com/Princeton-CDH/annotorious-tahqiq.git
```

Then, to use alongside Annotorious and a storage plugin:

```js
const client = Annotorious(annotoriousSettings);
const storagePlugin = StoragePlugin(); // An Annotorious plugin for storing annotations
const annotationContainer = document.getElementById("annotation"); // An empty HTML element that the editor will be placed into.
new TranscriptionEditor(client, storagePlugin, annotationContainer);
```

An instance of TinyMCE v5 must also be available on the `window` object. It is recommended to simply use a script tag that pulls TinyMCE from the official CDN. For example:

```html
<script src="https://cdn.tiny.cloud/1/API_KEY/tinymce/5/tinymce.min.js" referrerpolicy="origin"></script>
```

## Development

### Getting started

To start developing on this project, first install the dependencies with NPM:

```sh
npm install
```

Then you can start editing TypeScript code. When you have made changes, you can rebuild the package by running:

```sh
npm run build
```

This will place transpiled and minified JavaScript (via webpack) into the `/dist` directory.

To use your modified code in other projects locally, after running the build script, install with NPM in your other projects by pointing it to the project root directory:

```sh
npm install --save /path/to/annotorious-tahqiq/
```

Then, follow the remaining steps in the [Usage](#usage) section.

### Organization

This project is written in TypeScript, and organized according to the following scheme:

- `/src` contains the source code of the repository
    - `/src/elements` contains custom HTML elements
    - `/src/types` contains type definitions used in the TypeScript code
    - `/src/index.ts` is the entrypoint for the TypeScript code
- `/tests` contains Jest unit tests, and should mirror the structure of `/src`
- `/dist` contains the build outputs and should not be directly modified
    - `/dist/index.js` is the entrypoint for the built JavaScipt code

### Code style and linting

This project uses ESLint to manage code style and enforce consistency.

If you are using VSCode, you will need to install the [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint). Then, your editor should pick up the settings from `.vscode/settings.json`, which specify that ESLint will auto-fix any style errors on saving a file.

You may also use the following scripts to check for and fix linter errors:

```sh
npm run lint
```

```sh
npm run lint:fix
```

### Testing

This project uses Jest for unit tests, stored in the `/tests` directory. Tests can be run with the following command:

```sh
npm test
```
