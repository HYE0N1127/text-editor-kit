const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: "production",
  entry: "./src/index.ts",

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    library: "TextEditorKit",
    libraryTarget: "umd",
    globalObject: "this",
    clean: true,
  },

  externals: {
    react: "react",
    "react-dom": "react-dom",
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
    ],
  },

  resolve: { extensions: [".js", ".jsx", ".ts", ".tsx"] },

  plugins: [
    new MiniCssExtractPlugin({
      filename: "style.css",
    }),
  ],
};
