/**
 * @fileoverview Automatically update imports
 * @author Kriszyp
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var requireIndex = require("requireindex");
var autoImportRule = require('./rules/auto-import')
var autoConstRule = require('./rules/auto-const')

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

module.exports = {
  rules: {
    'auto-import': autoImportRule.create,
    'auto-const': autoConstRule
  }
}