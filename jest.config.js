/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    moduleNameMapper: {
        "\\.(css|scss)$": "identity-obj-proxy",
    },
    automock: false,
    resetMocks: false,
};
