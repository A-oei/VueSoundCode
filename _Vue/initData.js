//数组方法拦截
const ARRAY_METHODS = [
  "push",
  "pop",
  "unshift",
  "shift",
  "reverse",
  "splice",
  "sort"
];
let array_methods = Object.create(Array.prototype);

ARRAY_METHODS.forEach(method => {
  array_methods[method] = function () {
    for (const argument of arguments) {
      observe(argument);
    }
    let res = Array.prototype[method].apply(this, arguments);
    return res;
  }
})

//转化响应式数据
function defineReactive(target, key, value, enumerable) {

  if (variableType(value) === "object" || variableType(value) === "array") observe(value);

  let dep = new Dep();

  Object.defineProperty(target, key, {
    configurable: true,
    enumerable,
    get() {
      console.log(`获取了${key}，值为${value}`);
      dep.depend();
      return value;
    },
    set(v) {
      console.log(`设置了${key}，赋值为${v}`);
      if (value === v) return;
      if (variableType(v) === "object") observe(v);
      value = v;
      dep.notify();
    }
  })
}

//响应式转化时处理对象、数组等情况
function observe(obj) {
  if (variableType(obj) === "array") {
    obj.__proto__ = array_methods;
    for (const arr of obj) {
      observe(arr)
    }
  } else {
    let keys = Object.keys(obj);
    keys.forEach(key => {
      defineReactive(obj, key, obj[key], true);
    })
  }
}

//数据代理
function proxy(target, prop, key) {
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    get() {
      return target[prop][key];
    },
    set(v) {
      target[prop][key] = v;
    }
  })
}


