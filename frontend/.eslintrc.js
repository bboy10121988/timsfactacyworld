const path = require('path');

module.exports = {
  extends: ["next/core-web-vitals"],
  parserOptions: {
    babelOptions: {
      presets: [path.resolve(__dirname, 'node_modules/next/babel')],
    },
  },
  overrides: [
    {
      files: ["next-sitemap.js"],
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        requireConfigFile: false,
        babelOptions: {
          presets: [path.resolve(__dirname, 'node_modules/next/babel')],
        },
      },
      rules: {
        "@next/next/no-img-element": "off",
        "import/no-extraneous-dependencies": "off"
      }
    }
  ]
};
