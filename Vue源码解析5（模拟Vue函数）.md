 

我们在模拟了Vue的基本实现方法后我们下一步来模拟实现一下Vue的构造函数，首先创造一个`_Vue`的构造函数，这个函数模拟Vue的格式

* 接收一个`options`参数
* 提供一个`initData`方法用来转化响应式数据
* 提供一个`mount`方法实现将数据挂载到模板
* 在初始化的时候调用实现下面的操作
  * 接收`options`转化为自身的参数
  * 获取需要渲染、替换的模板
  * 执行`initData`函数实现数的响应式转化
  * 执行`mount`方法实现数据的挂载

```javascript
function _Vue(options) {
  this._data = options.data;
  this._el = options.el;
  let ele = document.querySelector(options.el);
  this._template = ele;
  this._parent = ele.parentNode;

  //初始化数据
  this.initData();

  //挂载数据到模板
  this.mount();
}
```

## mount

下面我们模拟实现一下`mount`函数，实现`mount`函数首先要定义以下几个方法

* 用来接虚拟DOM的模板`VNode`
* 将HTML节点转为虚拟VNode的方法`getVNode`
* 将数据填充到虚拟DOM模板`VNode`中的方法`combine`
* 将虚拟DOM转换为真实DOM的方法`parseVNode`

### VNode

该函数主要实现一下的功能

* `tag`参数，用来表示标签类型，例如`div`
* `data`参数，用来表示标签属性，例如`{id:"app"}`
* `value`参数，如果是文本类型，那么`value`值表示文本内容；如果是元素节点，那么值为`undefined`
* `type`参数，表示元素类型
* `children`属性，用来接收子节点
* `appendChild`方法，接收参数存储到`children`中

```javascript
class VNode {
  constructor( tag, data, value, type ) {
    this.tag = tag && tag.toLowerCase();
    this.data = data;
    this.value = value;
    this.type = type;
    this.children = [];
  }

  appendChild ( vnode ) {
    this.children.push( vnode );
  }
}
```

### getVNode

该方法接收一个参数`node`，该参数为真实的DOM节点，在处理DOM节点时注意判断元素节点类型，如果是元素节点那么需要判断是否有子节点，如果有子节点那么需要递归调用自身来处理子节点

```javascript
function getVNode(node) {
  let nodeType = node.nodeType;
  let _vnode = null;

  if (nodeType == 1) {
    //元素
    let nodeName = node.nodeName,
      attrs = node.attributes;
    let _attrObj = {};
    //存储属性
    for (let i = 0; i < attrs.length; i++) {
      _attrObj[attrs[i].nodeName] = attrs[i].nodeValue;
    }

    _vnode = new VNode(nodeName, _attrObj, undefined, nodeType);

    //处理子节点
    let childNode = node.childNodes;
    for (let i = 0; i < childNode.length; i++) {
      _vnode.appendChild(getVNode(childNode[i]));
    }

  } else if (nodeType == 3) {
    //文本节点
    _vnode = new VNode(undefined, undefined, node.nodeValue, nodeType);
  }
  return _vnode;
}
```

### combine

该方法用于将`{{}}`占位符替换为数据，该方法接收两个参数

* `vnode`表示虚拟DOM模板
* `data`传入数据

在使用该方法时我们要先定义一个正则表达式来解析`{{}}`

```javascript
const r_brackets = /\{\{(.+?)\}\}/g;
```

同时还需要定义一个方法来根据路径解析数据用来进行填充

```javascript
function getValueByPath(obj,path){
  let paths=path.split("."),
      res=obj;
  let prop;
  while(prop=paths.shift()){
    res=res[prop]
  }
  return res;
}
```

在转化时需要注意一个问题如果是元素节点那么需要判断该机诶单是否有子节点，如果存在子节点那么需要遍历递归子节点，这个方法实际上只需要实现两个功能

* 将文本节点中的`{{}}`通过`getValueByPath`替换为`data`中的数据
* 遍历递归元素节点中文本节点继续执行上述方法

```javascript
function combine(vnode, data) {
  let _type = vnode.type,
    _data = data.data,
    _value = data.value,
    _tag = data.tag,
    _children = data.children;

  let _vnode = null;

  if (_type == 3) {//文本
    _value = _value.replace(rkuohao, function (_, g) {
        return getValueByPath(data,g.trim());
    })
    _vnode=new VNode(_tag,_data,_value,_type)
  }
  else if(_type==1){ //元素
    _vnode=new VNode(_tag,_data,_value,_type);
    if(_children){
      for (const child of _children){
        _vnode.appendChild(combine(child,data));
      }
    }
  }
  return _vnode;
}
```

### parseVNode

接下来我们将填充好数据的虚拟DOM转化为真实的DOM

```javascript
function parseVNode(vnode) {
  let type = vnode.type;
  let node=null;

  if(type===3){ //文本节点
    return document.createTextNode(vnode.value);
  }
  else if(type===1){
    node=document.createElement(vnode.tag);
    
    let data=vnode.data;
    
    Object.keys(data).forEach(attr=>{
      node.setAttribute(attr,data[attr])
    });
    
    let children=vnode.children;
    
    children.forEach(child=>{
      node.appendChild(parseVNode(child))
    });
    
    return  node;
  }
}
```

### 其它方法

#### render和函数柯里化

到这里mount所需要的方法基本都已已经写完了，到时为了模拟`Vue`的写法我们再在`_Vue`上添加几个方法

在Vue中所有的渲染实际上都是通过`render`函数来执行的，如果我们没有在Vue的构造函数上设定`render`方法，那么Vue会将`template`中的代码转化进行渲染，如果有`render`方法，那么会直接执行`render`方法忽略`template`模板中的内容，所以我们模拟一个`render`函数

```javascript
_vue.prototype.createRenderFn = function () {
  let ast = getVNode(this._template);
  return function render() {
    let _tmp = combine(ast, this._data);
    return _tmp;
  }
}
```

注意一个问题是这里用到了**函数柯里化**的写法，关于柯里化可以理解为如果一个函数内有部分代码需要被多次重复执行，那么我们可以将这部分代码作为一个闭包储存起来，例如在上面的代码中，原始的模板部分是不会变化的，不需要每一次在data改变的时候都去获取一次，我们可以将这部分作为闭包让它常驻内存。

关于柯里化我们可以结合一个更有代表性的例子，在Vue中我们会用到大量的组件，这些组件也是以标签的形式使用，那么在渲染的时候我们要区分出哪些是原生的标签，哪些是定义的组件，在Vue中大概是这么处理的

```javascript
let tags = 'div,p,a,img,ul,li'.split(',');

function makeMap( keys ) {
  let set = {}; 
  tags.forEach( key => set[ key ] = true );

  return function ( tagName ) {
    return !!set[ tagName.toLowerCase() ]
  }
}

let isHTMLTag = makeMap( tags ); 
```

这样我们只需要遍历一次，下次的时候就可以直接读取了，避免了大量的无意义的循环

#### update

该方法主要用于将虚拟DOM渲染到页面上，Vue中`diff`算法就在这里，我们这里只实现发生变化时候将页面整个替换掉

```javascript
JGVue.prototype.update = function (vnode) {
  let realDOM = parseVNode(vnode);

  this._parent.replaceChild(realDOM, document.querySelector('#root'));
}
```

#### mount和mountComponent

这两个方法主要是负责调用`createRenderFn`和为Vue添加`render`方法

```javascript
_Vue.prototype.mount = function () {
  this.render = this.createRenderFn() //为Vue添加render方法
  this.mountComponent();
}
_Vue.prototype.mountComponent = function () {
  let mount = () => { 
    this.update(this.render())
  }
  mount.call(this); 
}
```

到这里mount方法就基本完成了，下面我们来实现一下initData方法

## initData

由于总需要用到类型判断，我们这里先写一个公共方法`variableType`

```javascript
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
```



接下来我们模拟一下`initData`方法，该方法主要实现一下几个功能

* 对传入的数据进行响应式处理
* 对原生的数组方法进行拦截，保证数组方法能响应式的触发
* 实现数据代理

```javascript
_Vue.prototype.initData = function () {
  let keys = Object.keys(this._data);
  
  reactify(this._data, this);
    
  for (let i = 0; i < keys.length; i++) {
    proxy(this, '_data', keys[i]);
  }
  
};
```

### proxy

该方法主要实现数据的代理，用来将`_data`上的数据代理到Vue

```javascript
function proxy(target, prop, key) {
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get() {
      return target[prop][key];
    },
    set(newVal) {
      target[prop][key] = newVal;
    }
  });
}
```

### 数组方法拦截

由于`defineProperty`本身存在的缺陷不能对使用原生数组方法的数组进行响应式处理，所以需要我们对原生数组方法进行拦截对数据进行响应式处理

```javascript
let ARRAY_METHOD = [
  'push',
  'pop',
  'shift',
  'unshift',
  'reverse',
  'sort',
  'splice',
];
let array_methods = Object.create(Array.prototype);
ARRAY_METHOD.forEach(method => {
  array_methods[method] = function () {
    // 调用原来的方法
    console.log('调用的是拦截的 ' + method + ' 方法');

    // 将数据进行响应式化
   for (const argument of arguments) {
      observe(argument);
    }
    let res = Array.prototype[method].apply(this, arguments);
    return res;
  }
});
```

### defineReactive和observe

这两个方法主要实现对穿传入数据做响应式处理

```javascript
function defineReactive(target, key, value, enumerable) {
  let that = this;
  
  if (variableType(value) === "object" || variableType(value) === "array") observe(value);

  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: !!enumerable,

    get() {
      console.log(`获取了${key}，值为${value}`);
      return value;
    },
    set(v) {
      console.log(`设置了${key}，赋值为${v}`);
      if (value === v) return;
      if (variableType(v) === "object") observe(v);
      value = v;
      that.mountComponent();
    }
  });
}
```

```javascript
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

```

到这里基本就完成了`_Vue`函数了，也是对之前的所有知识的总结，（￣▽￣）↗
