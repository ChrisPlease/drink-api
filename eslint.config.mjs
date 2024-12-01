import graphqlPlugin from "@graphql-eslint/eslint-plugin";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import _import from "eslint-plugin-import";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["functions/graphql/src/__generated__/**/*", "coverage/**/*", "**/dist/"],
}, {
    rules: {},
}, {
    files: ["**/*.graphql", "**/*.gql"],

    plugins: {
        "@graphql-eslint": graphqlPlugin,
    },

    languageOptions: {
        parser: graphqlPlugin.parser,
    },

    rules: {
        "@graphql-eslint/known-type-names": "error",
    },
}, ...fixupConfigRules(compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
)).map(config => ({
    ...config,
    files: ["**/*.ts"],
})), {
    files: ["**/*.ts"],

    plugins: {
        "@typescript-eslint": fixupPluginRules(typescriptEslint),
        import: fixupPluginRules(_import),
    },

    languageOptions: {
        globals: {
            ...globals.node,
        },

        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",

        parserOptions: {
            tsConfigRootDir: "./",

            project: [
                "./packages/tsconfig/base.json",
                "./packages/*/tsconfig.json",
                "./functions/*/tsconfig.json",
                "./layers/*/nodejs/tsconfig.json"
            ],
        },
    },

    settings: {
        "import/resolver": {
            typescript: {
                alwaysTryTypes: true,

                project: [
                    "./packages/tsconfig/base.json",
                    "./packages/*/tsconfig.json",
                    "./functions/*/tsconfig.json",
                    "./layers/*/nodejs/tsconfig.json",
                ],
            },
        },

        "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"],
        },
    },

    rules: {
        semi: "off",
        "comma-dangle": "off",
        "import/namespace": "off",
        "import/order": ["error"],

        quotes: ["error", "single", {
            avoidEscape: true,
        }],

        // "@typescript-eslint/semi": ["error", "never"],

        // "@typescript-eslint/member-delimiter-style": ["error", {
        //     multiline: {
        //         delimiter: "comma",
        //         requireLast: true,
        //     },

        //     overrides: {
        //         interface: {
        //             multiline: {
        //                 delimiter: "semi",
        //                 requireLast: true,
        //             },
        //         },
        //     },
        // }],

        "@typescript-eslint/no-unused-vars": ["warn", {
            destructuredArrayIgnorePattern: "^_",
            ignoreRestSiblings: true,
        }],

        "@typescript-eslint/no-explicit-any": "off",
        // "@typescript-eslint/comma-dangle": ["error", "always-multiline"],
    },
}];
