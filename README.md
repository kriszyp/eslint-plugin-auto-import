# eslint-plugin-auto-import

This is an ESLint plugin that will automatically add (ES6) imports to your modules, when there are undefined references that can be resolved to existing modules in your defined paths, when ESLint is run in `--fix` mode.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-auto-import`:

```
$ npm install eslint-plugin-auto-import --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-auto-import` globally.

## Usage

Add `auto-import` to the plugins section of your `.eslintrc` configuration file, and then add an `auto-import` rule with the configuration of your modules. Here is an example:

```json
{
  "plugins": [
      "auto-import"
  ],
  "rules": {
    "auto-import/auto-import": [2, {
        "rootPath": "./src",
        "packages": {
          "d3": "d3",
          "bloodhound": "Bloodhound",
          "moment": "moment",
          "alkali": {
            "hasExports": "module-path/to/alkali"
          },
          "dgrid": {
            "modulesIn": "./bower_components/dgrid"
          },
          "dstore": {
            "modulesIn": "./bower_components/dstore"
          }
        }
      }]
  }
}
```

To use auto-import, simply write some code with undefined variables named after modules, and then run eslint in fix mode (it must be run in fix mode to modify your code), and the plugin will search through your paths to find any modules or module exports that match your variables, and add corresponding imports for them. The import will look like:
```
import MyVariable from '../path/to/MyVariable'
```

If no module is found, the undefined variable (and warning) will be left in place.

## Configuration

There are several parts of configuration that can be used to define the lookup of modules to satisfy undefined referneces:
* `rootPath` - This defines the root path of where your modules that you are writing reside. The first thing this plugin will do to try to resolve a module, is it will search through the current directory, then the parent directory, then the children of the parent directory, then the grandparent directory, and so forth. If it finds a module with the same name as your undefined variable, it will import it using a relative path.
* `packages` - These are packages and package modules that can be referenced. There are several types of packages that can be listed for resolution of undefined variables:
  * A String - If the package is simply a string, and the string matches the name of the variable, the package will be imported as the variable name. For example, if we specify `"lodash": "_"`, and an undefined variable `_` is found in your code, auto-import will add `import _ from 'lodash'`
  * An object with `modulesIn` - In this case it will search the given directory for modules that match the undefined variable name. This will result in an import like `import List from 'dgrid/List'`
  * An object with `exports` - In this case it will load the module given by the value of the property, and look at all the exports of module for a match for the undefined variable name. This will result in an import like `import { Div } from 'alkali'`
