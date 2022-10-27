require("@rushstack/eslint-patch/modern-module-resolution")

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  reportUnusedDisableDirectives: true,
  plugins: ["simple-import-sort", "prettier"],
  parserOptions: {
    ecmaFeatures: { jsx: true },
  },
  env: {
    es2017: true,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  extends: [
    "alloy",
    "alloy/react",
    "alloy/typescript",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:promise/recommended",
    "plugin:security/recommended",
    "prettier",
  ],
  rules: {
    // Configure the plugins that don't have base configs.
    "simple-import-sort/imports": [
      "error",
      {
        // See https://github.com/lydell/eslint-plugin-simple-import-sort/#custom-grouping.
        groups: [
          ["^\\u0000"], // Side effect imports (the plugin inserts '\\u0000' for us to match).
          // Node builtins.
          [
            "^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)",
          ],
          ["^(?!@sargunv)@?\\w"], // Packages NOT in @sargunv scope.
          ["^@sargunv"], // Packages in @sargunv scope.
          ["^\\."], // Relative imports.
          ["^"], // Catchall uncovered by the rest. IRL this shouldn't ever match?
        ],
      },
    ],
    "simple-import-sort/exports": "error",
    "prettier/prettier": "error",

    // Override presets from the base configs
    "no-void": "off",
    "@typescript-eslint/no-parameter-properties": "off",
    "react/no-unescaped-entities": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        vars: "all",
        args: "all",
        caughtErrors: "all",
        varsIgnorePattern: "^_",
        argsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parserOptions: {
        // Evaluated relative to tsconfigRootDir or CWD.
        // TS projects should set tsconfigRootDir to make this work properly.
        project: "./tsconfig.json",
      },
    },
    {
      files: ["*.js", "*.jsx"],
      rules: {
        "@typescript-eslint/no-require-imports": "off",
      },
    },
    {
      files: ["*.{test,spec}.*", "test/**/*"],
      extends: ["plugin:jest/recommended", "plugin:jest/style"],
    },
    {
      files: ["*.d.ts"],
      rules: {
        "spaced-comment": "off",
      },
    },
  ],
}
