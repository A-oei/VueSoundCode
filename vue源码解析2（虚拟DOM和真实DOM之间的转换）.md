在上一篇中我们已经初步实现了将`html`中的占位符用`data`中的数据替代，那么我们接下来考虑一个问题，我们都知道在`Vue`中是通过用虚拟DOM也就是`VNode`转换为真正的DOM来进行编译的，我们如何实现这样一个过程呢，我们可以先看一下`VNode`的结构

我们可以看到`Vue`为了模拟真实的DOM，在虚拟DOM上添加了很多的节点，我们先不需要考虑那么多的属性，我们只简单的实现以下几个属性就好

|   属性   |   说明   |
| :------: | :------: |
|   tag    | 标签名称 |
|   data   |   属性   |
|  value   | 标签内容 |
|   type   | 元素节点 |
| children |  子节点  |

那么我们来实现一个函数来定义虚拟DOM，同样先来整理以下思路

* 函数需要具有我们上面列出的属性
* 函数需要有一个方法，用来将子元素添加到父元素的`chidlren`中

```javascript
function VNode(tag, data, value, type) {
	this.tag = tag&&tag.toLowerCase();
	this.data = data;
	this.value = value;
	this.type = type;
	this.children = [];
}

VNode.prototype.appendChild = function (vnode) {
	this.children.push(vnode);
}
```

然后我们需要一个方法，将虚拟的传入的元素转换为`VNode`格式的虚拟DOM，那么如何实现这个函数呢

* 函数需要判断传入的元素节点类型，区分处理元素节点和文本节点
* 函数需要递归处理元素节点中的子元素并调用`VNode`的`append`方法为添加子节点

这里需要注意一个点，在我们获取到元素的`attributes`后是以例如`id=root`的格式来展示的，我们可以直接通过`.name`的格式来获取到`id`，`.value`的格式来获取到`root`

```javascript
function getVNode(node) {
        let type = node.nodeType;
        let _vnode = null;

        if (type === 1) {
            let name = node.nodeName;
            let attrs = node.attributes;
            let _attrObj = {};

            for (const attr of attrs) {
                _attrObj[attr[name]] = attr.value;
            }


            _vnode = new VNode(name, _attrObj, undefined, type);

            let childrens = node.childNodes;
                    
            if (childrens.length >= 1) for (const child of childrens) {
                _vnode.appendChild(getVNode(child))
            }

        }
        else if (type === 3) {
            _vnode = new VNode(undefined, undefined, node.nodeValue, type)
        }
        return _vnode;
    }
```

那么到这里我们就实现了将一个DOM元素转换为虚拟DOM，那么接下的问题就是我们在对这个虚拟DOM渲染完成之后，需要我们再将虚拟DOM转换为真实的DOM添加到页面上，所以接下来我们需要继续实现一个方法

* 在虚拟DOM`type`值为`3`的时候通过`creteTextNode`创建一个文本节点的元素将`value`填充进去，在虚拟DOM为`type`值为`1`的时候通过`createElement`创建一个元素节点并添加属性
* 在创建文本节点的时候需要递归创建子元素

```javascript
function parseVNode(vnode) {
        
	let { type } = vnode;
	let _node = null;
        
	if (type === 1) {
		let { tag, data, children } = vnode;
		_node = document.createElement(tag);
           
		Object.keys(data).forEach(item => {
               
			let attrName = item;
			let attrValue = data[item];
                
			_node.setAttribute(attrName, attrValue);
	})

        if (children.length >= 1) for (const child of children) {
            _node.appendChild(parseVNode(child))
        }

	}
	else if (type === 3) {
		let { value } = vnode;
		_node = document.createTextNode(value)
	}
	return _node;
}
```

那么到这里就基本完成了虚拟DOM和真实DOM之间的相互转换，（￣▽￣）↗

