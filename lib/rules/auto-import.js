/**
 * @fileoverview Automatically update import or require statements
 * @author Kris Zyp
 */
"use strict";

var pathModule = require('path')
var fs = require('fs')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------


/**
 * Checks if the given node is the argument of a typeof operator.
 * @param {ASTNode} node The AST node being checked.
 * @returns {boolean} Whether or not the node is the argument of a typeof operator.
 */
function hasTypeOfOperator(node) {
    var parent = node.parent;

    return parent.type === "UnaryExpression" && parent.operator === "typeof";
}

function searchDirectory(path, name, except) {
    var files = fs.readdirSync(path)
    var directories = []
    for (var i = 0, l = files.length; i < l; i++) {
        var file = files[i]
        var basename = file.replace(/\..*/, '')
        if (basename) { // ignore .name directories
            var filePath = pathModule.join(path, file)
            if (basename === name) {
                return basename
            }
            if (file !== except) {
                var stats = fs.statSync(filePath)
                if (stats.isDirectory()) {
                    directories.push(file)
                }
            }
        }
    }

    for (var i = 0, l = directories.length; i < l; i++) {
        var directory = directories[i]
        var foundModule = searchDirectory(pathModule.join(path, directory), name)
        if (foundModule) {
            return directory + '/' + foundModule
        }
    }
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Auto import",
            category: "Variables",
            recommended: true
        },

        schema: [
            {
                type: "object",
                properties: {
                    typeof: {
                        type: "boolean"
                    }
                },
                additionalProperties: false
            }
        ]
    },

    create: function(context) {
        var options = context.options[0];
        var considerTypeOf = options && options.typeof === true || false;

        return {
            "Program:exit": function(/* node */) {
                var globalScope = context.getScope()
                var options = context.options[0]
//                console.log(context.eslint)
                var fixed = {}
//                console.log(globalScope.block.body[0].specifiers[0])
                globalScope.through.forEach(function(ref) {
                    var identifier = ref.identifier;

                    if (!considerTypeOf && hasTypeOfOperator(identifier)) {
                        return;
                    }
                    var undefinedIndentifier = identifier.name
                    context.report({
                        node: identifier,
                        message: '{{name}} is not defined.',
                        data: identifier,
                        fix: function(fixer) {
                            if (fixed[undefinedIndentifier]) {
                                return
                            }
                            if (identifier.parent.type === 'AssignmentExpression') {
                                return fixer.insertTextBefore(identifier, 'let ')
                            }
                            fixed[undefinedIndentifier] = true
                            console.log('running auto-import')
                            var filename = context.eslint.getFilename()
                            var path = pathModule.dirname(filename)
                            var lastPath
                            var foundModule
                            var isNotDefaultExport
                            var parentPrefix = ''
                            // go up the current directory tree
                            var rootPath = pathModule.resolve(__dirname, '../../../..', options.rootPath)
                            while (!foundModule && path.indexOf(rootPath) === 0) {
                                foundModule = searchDirectory(path, undefinedIndentifier, lastPath)
                                if (foundModule) {
                                    foundModule = (parentPrefix || './') + foundModule
                                } else {
                                    lastPath = path
                                    path = pathModule.dirname(path)
                                    parentPrefix = parentPrefix + '../'
                                }
                            }
                            if (!foundModule && options.packages) {
                                // next search configured packages
                                for (var packageName in options.packages) {
                                    var pckg = options.packages[packageName]
                                    var packageRef = pckg.as || (typeof pckg === 'string' ? pckg : packageName)
                                    if (packageRef === undefinedIndentifier) {
                                        foundModule = packageName
                                    } else if (pckg.hasExports && require(pathModule.resolve(__dirname, '../../../..', pckg.hasExports))[undefinedIndentifier]) {
                                        isNotDefaultExport = true
                                        foundModule = packageName
                                    } else if (pckg.modulesIn) {
                                        foundModule = searchDirectory(pathModule.resolve(__dirname, '../../../..', pckg.modulesIn), undefinedIndentifier)
                                        if (foundModule) {
                                            foundModule = packageName + '/' + foundModule
                                        }
                                    }
                                    if (foundModule) {
                                        break
                                    }
                                }
                            }

                            if (foundModule) {
                                var i = 0
                                var importDeclaration, node
                                while ((node = globalScope.block.body[i++]).type === 'ImportDeclaration') {
                                    importDeclaration = node
                                    if (node.source.value === foundModule) {
                                        if (isNotDefaultExport) {
                                            // add to the named imports of an existing import declaration
                                            return fixer.insertTextAfter(node.specifiers[node.specifiers.length - 1], ', ' + undefinedIndentifier) 
                                        } else {
                                            console.log(foundModule, 'already imported')
                                            return
                                        }
                                    }
                                }
                                var importStatement = (isNotDefaultExport ? 
                                    'import { ' + undefinedIndentifier + ' }' :
                                    'import ' + undefinedIndentifier) + " from '" + foundModule + "'"
                                if (importDeclaration) {
                                    return fixer.insertTextAfter(importDeclaration, '\n' + importStatement)
                                }
                                return fixer.insertTextAfterRange([0, 0], importStatement)
                            }
                        }
                    });
                });
            }
        };
    }
};