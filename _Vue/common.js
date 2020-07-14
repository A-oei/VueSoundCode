//变量类型判断
const types = {
  "[object object]": 'object',
  "[object array]": 'array',
  "[object string]": 'string',
  "[object number]": 'number',
  "[object null]": 'null',
  "[object undefined]": 'undefined',
  "[object function]": 'function',
  "[object boolean]": 'boolean',

}

function variableType(variable) {
  let key = Object.prototype.toString.call(variable).toLowerCase();
  return types[key];
}
