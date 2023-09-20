// 已经测试过，可以在create-react-app中使用
const types = require('@babel/types');

function printPlugin() {
  return {
    visitor: {
      CallExpression(path, state) {
        const { node } = path;
        if (types.isMemberExpression(node.callee)) {
          if (node.callee.object.name === 'console') {
            if (['log', 'info', 'warn', 'error', 'debug'].includes(node.callee.property.name)) {
              const { line, column } = node.loc.start;
              const filename = state.filename.split(path.sep).pop();
              const message = filename + ' ' + line + ':' + column;
              const args = types.stringLiteral(message);
              node.arguments.unshift(args);
            }
          }
        }
      }
    }
  };
}

module.exports = printPlugin;
