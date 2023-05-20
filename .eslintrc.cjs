/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  "ignorePatterns": ["src/__generated__/**/*"],
  "rules": {

  },
  "overrides": [
    {
      "files": ["*.gql"],
      "extends": "plugin:@graphql-eslint/schema-recommended",
      "parserOptions": {
        "schema": "./schema.gql",
      },
      "rules": {
        "@graphql-eslint/strict-id-in-types": ["error", {
          "exceptions": {
            "types": ["PageInfo"],
            "suffixes": ["Paginated", "Edge"],
          },
        }],
      },
    },
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
        "tsconfigRootDir": "./"
      },
      "plugins": [
        "@typescript-eslint",
        "import",
      ],
      "rules": {
        "semi": "off",
        "comma-dangle": "off",
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
            "project": "<root>/tsconfig.json"
          },
        },
        "import/parsers": {
          "@typescript-eslint/parser": [".ts", ".tsx"],
        },
      },
    },
  ],
}
