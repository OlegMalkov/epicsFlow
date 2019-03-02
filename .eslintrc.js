module.exports = {
    "parser": "babel-eslint",
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": ["eslint:recommended", "plugin:flowtype/recommended"],
    "plugins": [
      "flowtype", 
      "flow-vars"
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
        "flow-vars/use-flow-type": 1,
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
        "beforeEach": true
    }
};