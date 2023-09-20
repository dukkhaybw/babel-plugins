const { transformSync } = require('@babel/core');
const autoLoggerPlugin = require('./auto-logger-plugin');
const sourceCode = `
function sum(a,b){return a+b;}
const multiply = function(a,b){return a*b;};
const minus = (a,b)=>a-b
class Calculator{divide(a,b){return a/b}}
`;
const { code } = transformSync(sourceCode, {
  plugins: [autoLoggerPlugin({ libName: 'logger' })]
});
console.log(code);
