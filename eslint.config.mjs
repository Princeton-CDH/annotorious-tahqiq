import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import { flatConfigs as importX } from "eslint-plugin-import-x";
import jsdoc from "eslint-plugin-jsdoc";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

const jsdocContexts = [
    "ArrowFunctionExpression",
    "ClassDeclaration",
    "ClassExpression",
    "FunctionDeclaration",
    "FunctionExpression",
    "MethodDefinition",
    "TSInterfaceDeclaration",
    "TSMethodSignature",
];

export default defineConfig(
    { ignores: ["dist/**", "*.config.js", "*.config.mjs"] },
    {
        files: ["src/**/*.ts"],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            importX.recommended,
            importX.typescript,
            jsdoc.configs["flat/recommended"],
        ],
        plugins: { "@stylistic": stylistic },
        languageOptions: {
            parserOptions: { project: "./tsconfig.json" },
        },
        settings: {
            jsdoc: { mode: "typescript" },
            "import-x/resolver-next": [createTypeScriptImportResolver()],
        },
        rules: {
            "import-x/named": "off",
            "import-x/no-named-as-default-member": "off",
            "import-x/no-unresolved": "off",
            "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
            "@stylistic/comma-dangle": ["error", {
                arrays: "always-multiline",
                objects: "always-multiline",
                imports: "always-multiline",
                exports: "always-multiline",
                functions: "always-multiline",
                enums: "always-multiline",
                generics: "always-multiline",
                tuples: "always-multiline",
            }],
            "@stylistic/comma-spacing": ["error", { before: false, after: true }],
            "@stylistic/function-call-spacing": ["error", "never"],
            "@stylistic/indent": ["error", 4],
            "@stylistic/keyword-spacing": ["error", { before: true, after: true }],
            "@stylistic/lines-between-class-members": [
                "error",
                "always",
                { exceptAfterSingleLine: false },
            ],
            "@stylistic/max-len": ["error", { code: 100, tabWidth: 4 }],
            "@stylistic/no-mixed-spaces-and-tabs": "error",
            "@stylistic/no-extra-semi": "error",
            "@stylistic/object-curly-spacing": ["error", "always"],
            "@stylistic/quotes": ["error", "double", { avoidEscape: true }],
            "@stylistic/semi": ["error", "always"],
            "@stylistic/space-before-blocks": "error",
            "@stylistic/space-before-function-paren": [
                "error",
                { anonymous: "always", named: "never", asyncArrow: "always" },
            ],
            "@stylistic/space-infix-ops": "error",
            "@typescript-eslint/adjacent-overload-signatures": "error",
            "@typescript-eslint/no-inferrable-types": "error",
            "@typescript-eslint/no-non-null-assertion": "warn",

            "@typescript-eslint/default-param-last": "error",
            "@typescript-eslint/dot-notation": "error",
            "@typescript-eslint/naming-convention": [
                "error",
                { selector: "variable", format: ["camelCase", "PascalCase", "UPPER_CASE"] },
                { selector: "function", format: ["camelCase", "PascalCase"] },
                { selector: "typeLike", format: ["PascalCase"] },
            ],
            "@typescript-eslint/no-dupe-class-members": "error",
            "@typescript-eslint/no-empty-function": [
                "error",
                { allow: ["arrowFunctions", "functions", "methods"] },
            ],
            "@typescript-eslint/no-implied-eval": "error",
            "@typescript-eslint/no-redeclare": "error",
            "@typescript-eslint/no-shadow": "error",
            "@typescript-eslint/no-unused-expressions": "error",
            "@typescript-eslint/no-unused-vars": [
                "error",
                { vars: "all", args: "after-used", ignoreRestSiblings: true },
            ],
            "@typescript-eslint/no-use-before-define": [
                "error",
                { functions: true, classes: true, variables: true },
            ],
            "@typescript-eslint/no-useless-constructor": "error",
            "@typescript-eslint/only-throw-error": "error",
            "@typescript-eslint/return-await": ["error", "in-try-catch"],
            "import-x/extensions": ["error", "ignorePackages", {
                js: "never",
                mjs: "never",
                jsx: "never",
                ts: "never",
                tsx: "never",
            }],
            "import-x/no-extraneous-dependencies": ["error", { devDependencies: false }],
            "no-loop-func": "error",

            // JSDoc
            "jsdoc/require-jsdoc": ["warn", { contexts: jsdocContexts }],
            "jsdoc/require-description": ["warn", { contexts: jsdocContexts }],
            "jsdoc/tag-lines": ["warn", "any", { startLines: 1 }],
            "jsdoc/reject-any-type": "off",
            "jsdoc/reject-function-type": "off",
        },
    },
);
