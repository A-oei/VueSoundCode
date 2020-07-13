#### 拦截数组

我们在使用Vue的时候经常会有的一个操作，例如对某个数组进行`push`、`pop`等操作，在Vue的官方文档中也表示支持`push`等7个操作，但是原生`defineProperty`是不支持检测数组变化的，Vue能够对`push`等方法响应式的变化是因为对原生的数组方法进行了拦截，也就是官方文档中说的[Vue将被侦听的数组的变更方法进行了包裹](https://cn.vuejs.org/v2/guide/list.html#变更方法)。

我们知道数组之所以能够调用方法是因为在[原型链](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)中继承了`Array.prototype`中方法，我们可以大概将这条链理解为如下

```
arr=>Array.prototype=>Object.prototype
```

如果我们想要拦截原生的数组方法，我们需要将原型链改变为以下的解构

```
arr=>拦截的方法=>Array.prototype=>Object.prototype
```

这里我们需要用的一个方法[Object.create](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create)，该方法可以**创建一个新对象，使用现有的对象来提供新创建对象的`__proto__`**，举一个例子

```javascript
let a = {
  name: "a"
};
let b=Object.create(a);
console.log(b.__proto__);//{name:"a"}
```

我们可以通过该方法来对原生的方法进行拦截，如下

```javascript
let ARRAY_METHODS = [
  "push",
  "pop",
  "shift",
  "unshift",
  "reverse",
  "sort",
  "splice"
];

let arr = [],
  array_methods=Object.create(Array.prototype);

ARRAY_METHODS.forEach(method => {
    array_methods[method]=function () {
      console.log("调用的是拦截方法");
      
      let res=Array.prototype[method].apply(this,arguments);
      return res;
    }
})

arr.__proto__=array_methods;
arr.push(1); //调用的是拦截方法
console.log(arr);
```

我们可以看到`arr`在调用方法的时候回被先拦截，那么在这里我们就可以把响应式的方法添加到该方法

#### 代理

我们在使用Vue的时候都会发现这样一个问题，我们在使用`data`、`methods`等方法的时候是可以直接调用的，而不需要通过`this.$data.xx`这种方式来调用，这里就是Vue中使用代理来将我们定义在`data`、`methods`中的数据和方法代理到了Vue本身上。我们可以先看一下该方法需要实现一个什么样的效果

1. 将某一个对象的属性的成员的访问映射到对象上

该方法需要有以下参数

1. target 当前对象
2. prop 需要被代理的对象上的某个属性
3. key 需要被代理的对象的上的属性的成员的属性名称

我们可以通过`defineProperty`来实现这一功能

```javascript
function proxy(target,prop,key) {
  Object.defineProperty(target,key,{
    enumerable:true,
    configurable:true,
    get() {
      return target[prop][key];
    },
    set(val){
      target[prop][key]=val;
    }
  })
}
```

我们来测试一下

```javascript
let a = {
  _data: {
    name: "a",
    msg: "this's a msg"
  }
};

let keys = Object.keys(a._data);

keys.forEach(item => {
  proxy(a, '_data', item);
})

console.log(a.name);//a
console.log(a.msg); //this's a msg
```

到这里我们就基本实现了代理和数组方法拦截这两个方法了，（￣▽￣）↗