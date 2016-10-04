var preferConst = require('eslint/lib/rules/prefer-const')

module.exports = function(context) {
  var originalReport = context.report
  return preferConst(Object.create(context, {
    report: {
      value: function(report) {
        var variableDeclarator = report.node.parent
        var variableDeclaration = variableDeclarator.parent
        if (variableDeclaration.declarations && variableDeclaration.declarations.length === 1) {
          report.fix = function(fixer) {
            var startOfLet = variableDeclaration.range[0]
            return fixer.replaceTextRange([startOfLet, startOfLet + 3], 'const')
          }
        } else {
          report.message += ' This can\'t be fixed'
        }
        originalReport.call(context, report)
      }
    }
  }))
}