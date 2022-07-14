const path = require("path");

const Autoprefixer = require("autoprefixer");

module.exports = {
    entry: "./src/index.ts",
    devtool: "inline-source-map",
    module: {
        rules: [
            // compile and bundle typescript with ts-loader
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            // bundle SASS by using style-loader to inject into JS
            {
                test: /\.s?css$/,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [Autoprefixer()],
                            },
                        },
                    },
                    {
                        loader: "sass-loader",
                        options: { implementation: require("sass") },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".scss"],
    },
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist"),
        libraryTarget: "commonjs2",
    },
};
