var preferConst = require('eslint/lib/rules/prefer-const')

module.exports = function(context) {
  var originalReport = context.report
  return preferConst(Object.create(context, {
    report: {
      value: function(report) {
        report.fix = function(fixer) {
          var variableDeclarator = report.node.parent
          var variableDeclaration = variableDeclarator.parent
          if (variableDeclaration.declarations.length === 1) {
            var startOfLet = variableDeclaration.range[0]
            return fixer.replaceTextRange([startOfLet, startOfLet + 3], 'const')
          }
        }
        originalReport.call(context, report)
      }
    }
  }))
}