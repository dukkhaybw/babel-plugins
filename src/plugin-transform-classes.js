const core = require('@babel/core'); // Babel 的核心模块
const types = require('@babel/types'); // 类型定义模块

// babel插件
const transformClassesPlugin = {
  // 访问者模式的 visitor 对象
  visitor: {
    // 处理 ClassDeclaration AST 节点的函数
    ClassDeclaration(path) {
      // 从路径对象 path 中提取出节点 node
      const { node } = path;

      // 类的标识符 id 和方法 methods
      const id = node.id;
      const methods = node.body.body;

      // 保存转换后的节点
      const nodes = [];

      // 遍历类的每个方法
      methods.forEach((method) => {
        // 方法是构造函数
        if (method.kind === 'constructor') {
          // 创建一个函数声明节点，函数名为类的标识符，参数和函数体均取自构造函数的定义，并把创建的节点添加到 nodes 数组中
          const constructorFunction = types.functionDeclaration(
            id,
            method.params,
            method.body,
            method.generator,
            method.async
          );
          nodes.push(constructorFunction);
        } else {
          // 创建一个成员表达式节点，表示 id.prototype.method.key，然后创建一个函数表达式节点，参数和函数体取自方法的定义，
          // 最后创建一个赋值表达式节点，左侧为成员表达式，右侧为函数表达式，并把创建的节点添加到 nodes 数组中
          const memberExpression = types.memberExpression(
            types.memberExpression(id, types.identifier('prototype')),
            method.key
          );
          let functionExpression = types.functionExpression(null, method.params, method.body);
          let assignmentExpression = types.assignmentExpression(
            '=',
            memberExpression,
            functionExpression
          );
          nodes.push(assignmentExpression);
        }
      });

      if (nodes.length === 1) {
        //单节点用replaceWith
        //path代表路径，用nodes[0]这个新节点替换旧path上现有老节点node ClassDeclaration
        path.replaceWith(nodes[0]);
      } else {
        //多节点用replaceWithMultiple
        path.replaceWithMultiple(nodes);
      }
    }
  }
};

let sourceCode = `
class Person{
    constructor(name){
        this.name = name;
    }
    sayName(){
        console.log(this.name);
    }
}
`;

const target = core.transform(sourceCode, {
  plugins: [transformClassesPlugin]
});

console.log(target.code);
