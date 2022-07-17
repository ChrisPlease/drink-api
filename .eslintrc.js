module.exports = {
    "env": {
        "es2021": true,
        "node": true
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
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
      "semi": "off",
      "comma-dangle": "off",

      // Typescript rules
      "@typescript-eslint/semi": ["error", "never"],
      "@typescript-eslint/member-delimiter-style": [{
        "delimiter": "semi",
        "requireLast": true,
      }],
      "@typescript-eslint/no-explicit-any": ["off"],
      "@typescript-eslint/comma-dangle": ["error"]
    },
    "settings": {
      "import/resolver": {
        "typescript": {
          "alwaysTryTypes": true,
        }
      },
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
    },
}
