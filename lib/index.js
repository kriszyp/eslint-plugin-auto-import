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

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

module.exports = {
  rules: {
    'auto-import': autoImportRule.create
  }
}