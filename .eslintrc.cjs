/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  "ignorePatterns": [
    "functions/graphql/src/__generated__/**/*",
    "coverage/**/*"
  ],
  "rules": {},
  "overrides": [
    {
      "files": ["**/*.ts"],
      "env": {
        "es2021": true,
        "node": true,
      },
      "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
      ],
      "parser": "@typescript-eslint/parser",
      "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "tsConfigRootDir": "./",
        "project": ["./packages/tsconfig/base.json", "./functions/*/tsconfig.json"]
      },
      "plugins": [
        "@typescript-eslint",
        "import",
      ],
      "rules": {
        "semi": "off",
        "comma-dangle": "off",
        "import/namespace": "off",

        "import/order": ["error"],

        "quotes": ["error", "single", { "avoidEscape": true }],

        // Typescript rules
        "@typescript-eslint/semi": ["error", "never"],
        "@typescript-eslint/member-delimiter-style": ["error", {
          "multiline": {
            "delimiter": "comma",
            "requireLast": true,
          },
          "overrides": {
            "interface": {
              "multiline": {
                "delimiter": "semi",
                "requireLast": true,
              },
            },
          },

        }],
        "@typescript-eslint/no-unused-vars": ["warn", {
          "destructuredArrayIgnorePattern": "^_",
          "ignoreRestSiblings": true,
        }],
        "@typescript-eslint/no-explicit-any": ["off"],
        "@typescript-eslint/comma-dangle": ["error", "always-multiline"],
      },
      "settings": {
        "import/resolver": {
          "typescript": {
            "alwaysTryTypes": true,
            "project": ["./packages/tsconfig/base.json", "./functions/*/tsconfig.json"]
          },
        },
        "import/parsers": {
          "@typescript-eslint/parser": [".ts", ".tsx"],
        },
      },
    },
  ],
}
