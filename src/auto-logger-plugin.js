const importModule = require('@babel/helper-module-imports');
const template = require('@babel/template');
const types = require('@babel/types');

const autoLoggerPlugin = (options) => {
  return {
    visitor: {
      Program: {
        enter(path, state) {
          let loggerID;
          path.traverse({
            ImportDeclaration(path) {
              const libName = path.node.source.value;
              if (libName === options.libName) {
                const specifierPath = path.node.specifiers[0];
                if (
                  specifierPath.isImportDefaultSpecifier() ||
                  specifierPath.isImportSpecifier() ||
                  specifierPath.isImportNamespaceSpecifier()
                ) {
                  loggerID = specifierPath.node.local.name;
                }
                path.stop();
              }
            }
          });

          if (!loggerID) {
            loggerID = importModule.addDefault(path, options.libName, {
              nameHint: path.scope.generateUid(options.libName)
            }).name;
          }
          state.loggerNode = template.statement(`LOGGER();`)({
            LOGGER: loggerID
          });
        }
      },
      'FunctionExpression|FunctionDeclaration|ArrowFunctionExpression|ClassMethod'(path, state) {
        const { node } = path;
        if (node.body.type !== 'BlockStatement') {
          node.body = types.blockStatement([
            state.loggerNode,
            types.expressionStatement(node.body)
          ]);
        } else {
          node.body.body.unshift(state.loggerNode);
        }
      }
    }
  };
};

module.exports = autoLoggerPlugin;
