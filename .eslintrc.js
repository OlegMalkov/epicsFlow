module.exports = {
    "parser": "babel-eslint",
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": ["eslint:recommended", "plugin:flowtype/recommended", "plugin:react/recommended", "plugin:import/errors"],
    "plugins": [
      "flowtype", 
      "flow-vars",
      "import",
      "react"
    ],
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            "tab"
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "never"
        ],

        // global flow types: https://github.com/zertosh/eslint-plugin-flow-vars
        "flow-vars/define-flow-type": 1,
        "comma-dangle": [
            "error",
            "always-multiline"
        ],
        "flow-vars/use-flow-type": 1,
        "flowtype/delimiter-dangle": [
            "error",
            "always-multiline"
        ],
        "flowtype/boolean-style": [
            "error",
            "bool"
        ],
        "flowtype/require-exact-type": "error",
        "flowtype/semi": ["error", "never"],
        "flowtype/type-id-match": [
            "error",
            "^([A-Z][a-z0-9]*)+Type$"
        ],
        "flowtype/type-import-style": [
            "error",
            "identifier"
        ],
        "prefer-const": "error",
        "no-var": "error",
        "comma-style": ["error", "last"],
        "newline-after-var": ["error", "always"],
        "import/no-default-export": "error",
        "one-var": ["error", "never"],
        "one-var-declaration-per-line": "error",
        "import/no-mutable-exports": "error",
        "import/extensions": ["error", "never"],
        "import/group-exports": "error",
        "no-multiple-empty-lines": ["error", { "max": 2, "maxEOF": 1 }],
        "arrow-spacing": "error",
        "dot-notation": "error",
        "eol-last": "error",
        "no-buffer-constructor": "error",
        "no-multi-spaces": "error",
        "no-path-concat": "error",
        "no-self-compare": "error",
        "no-throw-literal": "error",
        "no-trailing-spaces": "error",
        "no-unused-expressions": "error",
        "no-useless-concat": "error",
        "padding-line-between-statements": [
            "error",
            { "blankLine": "always", "prev": "directive", "next": "*" }
        ],
        "prefer-promise-reject-errors": "error",
        "prefer-template": "error",
        "object-shorthand": "error",
        "strict": ["error", "global"],
        "yoda": "error",
        "keyword-spacing": "error",
        "space-before-blocks": "error",
        "no-param-reassign": 2
    },

    "settings": {
        "flowtype": {
            "onlyFilesWithFlowAnnotation": true
        }
    },
    "globals": {
        "process": true,
        "require": true,
        "describe": true,
        "it": true,
        "expect": true,
        "beforeEach": true,
        "__DEV__": true
    }
};