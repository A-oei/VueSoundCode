我们先抛开源码，想这样一个问题，如果让我实现一个特别简陋版的`Vue`，比如像下面这个例子，我们该如何去实现

```html
<body>
    <div id="root">
        <div>
            <p>{{name}}</p>
        </div>
        <p>{{message}}</p>
    </div>
</body>
```

```javascript
let data = {
        name: 'Tom',
        message: 'this is Tom'
    }
```

首先我们先整理思路，如果要我们实现用`data`中的数据替换标签中对应的占位符，我们就需要拿到占位符中的值去和`data`数据中的值做比较，那么我们就首先需要获取标签，在`Vue`中我们都是传入一个最外层的根节点的类名或者ID值，然后就可以渲染模板，那么我们仿照这个思路，我们可以获取到`root`，再去拿到它的根节点，然后通过遍历这些根节点中的占位符去和`data`数据一一比较并进行填充，那么思路有了，我们接下来就按照这个思路来写代码

首先我们要有一个正则来匹配文本节点中的`{{}}`里的内容

```javascript
const r_brackets = /\{\{(.+?)\}\}/g;
```

在完成方法之前我们要有下面的概念

* [节点类型](https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType)，在`javascript`中以`nodeType`返回节点类型，其中`1`代表元素节点，`3`代表文本节点，**文本节点有nodeValue，而元素节点有nodeName**
* [replace](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace)，该方法第二个参数可以是一个函数，函数的参数是匹配的返回结果

接下来开始写我们的函数，这个函数需要接收两个参数

* 传入的模板
* 传入的数据

这个函数要有以下的功能

* 获取传入模板的所有子节点
* 判断子节点的类型，如果是文本节点，匹配替换占位符的数据，如果是元素节点，递归查找其下的文本节点

```javascript
   function compiler(template, data) {
        const childNodes = template.childNodes;
        for (const node of childNodes) {
            let type = node.nodeType;

            if (type === 3) {
                let txt = node.nodeValue;

                txt = txt.replace(r_brackets, (_, g) => {
                    let value = data[g.trim()];
                    return value;
                })

                node.nodeValue = txt;
            }
            else if (type === 1) {
                compiler(node, data)
            }
        }
    }
```

然后们就可以获取到`root`模板并对其进行替换，但是我们这里考虑到一个问题，在`Vue`中我们的`data`中的值是会变化然后模板结构也会变化，那么说明在`Vue`中是保留了存在占位符的模板的，那我们这里也做一下相应的处理

```javascript
let generateNode = temNode.cloneNode(true);
compiler(generateNode, data);
root.parentNode.replaceChild(generateNode, root)
```

那么到这里我们的第一步就完成了，接下来我们要进行一点优化，这里我们的`data`值是没有嵌套的，所以可以通过`data[g.trim()]`的方式直接进行匹配，如果`data`的值是经过嵌套的呢，那么我们就需要在这里进行一些优化，我们需要一个方法来处理`data`，在即使多层嵌套的情况下也能正确找到对应的值，那么我们来看一下如何处理

同样，我们首先举一个例子，例如`data`是下面的格式

```javascript
let data={
    a:{
        b:{
            c:'c'
        }
    }
}
```

在模板中我们要渲染出`Tom`需要的格式就是`a.b.c`，那么我们拿到的`g`的值就是`a.b.c`，我们要正确渲染的话需要我们来写一个函数

还是先整理一下思路，这个函数需要两个参数

* data
* 传入的路径

这个函数需要实现

* 拆分`a.b.c`

* 记录下`a`的值，然后记录下`a.b`的值，然后记录下`a.b.c`的值，

```javascript
function getValueByPath(data, path) {
        let paths = path.split('.');
        let prop;

        while (prop = paths.shift()) {
            data = data[prop];
        }
        return data;
}
```

然后我们就可以愉快地将上面的代码中的`data[g.trim()]`进行替换了，这里我们就不重复写代码了，摘出其中这段，改为如下格式

```javascript
txt = txt.replace(r_brackets, (_, g) => {
	let value = getValueByPath(data,g)
	return value;
})
```

那么我们的第一就完成了，（￣▽￣）↗

