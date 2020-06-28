那么实现了上面的代码还是远远不够的，我们在使用`Vue`都会发现，在`Vue`中我们的数据都是响应式的，也就是我们改变了某一项数据，视图也是会响应式发生变化的，这也是我们这一章的内容，如何让数据变为响应式的

了解`Vue`的都清楚，在`Vue2.0`中是使用了[Object.defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)来对数据进行劫持的，在`Vue3.0`中使用了最新的[Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)，有兴趣的同学可以对比一下这两个方法的不同

那么我们如何对一个数据进行劫持呢

```javascript
 let obj = {};

let nameVal = 'Tom';
Object.defineProperty(obj, 'name', {
	configurable: true,
	enumerable: true,
	get() {
		console.log('获取值');
		return nameVal;
	},
	set(newVal) {
		console.log(`设置值为${newVal}`);
		nameVal = newVal;
	}
})

obj.name//获取值 Tom
obj.name='jack' //设置值为jack jack
```

这里我们就对`obj.name`进行了劫持，那么如果我们要对所有`data`中的数据都进行劫持，就遍历数据然后执行同样的操作就可以了

但是这里存在一个问题，我们这里需要一个外部的变量来保存我们的`name`的值，那么如果所有的数据都这么做就会设置大量的全局变量，那么我们同样可以封装一个函数，将这个外部的变量变成一个函数内部的变量，在函数内部的`get`、`set`方法调用的时候让这个参数作为一个**闭包**存在

那么这个函数的实现思路就很简单了

* 要接收的参数有
  * **target** 当前需要设置劫持的对象
  * **key** 劫持对象上的属性
  * **value** 作为闭包的属性值
  * **enumerable** 该属性是否可被枚举

```javascript
function defineReactive(target,key,value,enumerable){
	Object.defineProperty(target,key,{
		enumerable,
		configurable:true,
		get(){
			console.log(`获取${key}`);
			return value;
		},
		set(newValue){
			console.log(`设置${key}的值为${newValue}`);
			value=newValue;
		}
	})
}

let o={};
defineReactive(o,'name','Tom',true);
console.log(o.name); //获取name  Tom
o.name='jack';//设置name的值为jack
```

实现了这个之后我们接下来考虑一个问题，如果用户传入的多个数据，并且多个数据中包含多层嵌套的对象呢，很明显我们需要用到一个递归来对所有的数据进行劫持，我们来整理一下实现的思路

* 我们需要循环来遍历对象，将对象中所有的值都进行劫持
* 如果遇到对象的值是一个对象或者数组，那么需要递归处理
  * 如果是一个数组，那么需要调用自身
  * 如果是一个对象，那么需要调用`defineReactive`，如果此时数组中的是对象，那么我们需要在`defineReactive`中调用我们的递归方法对对象再进行遍历

```javascript
function reactify(obj) {
	let key = Object.keys(obj);
    
	key.forEach(item => {
		if (Array.isArray(obj[item])) {
			reactify(obj[item]);
		}
		else {
			defineReactive(obj, item, obj[item], true)
		}
	})
}
```

`reactify`就实现如果我们传入对象中如果有值是数组的时候就递归调用自身，但是如果我们传入的值是一个对象的话还是没有实现劫持，那么我们可以对`defineReactive`进行一下改造，改造的思路就是

* 如果传入的`value`值是一个对象，那么将`value`去调用作为参数去调用`reactify`，让`reactify`遍历对象中的所有属性，然后对数据进行劫持

```javascript
function defineReactive(target,key,value,enumerable){
    Object.prototype.toString.call(value) === "[object Object]"
            && reactify(value);
    
	Object.defineProperty(target,key,{
		enumerable,
		configurable:true,
		get(){
			console.log(`获取${key}`);
			return value;
		},
		set(newValue){
			console.log(`设置${key}的值为${newValue}`);
			value=newValue;
		}
	})
}
```

那么到这里我们就实现了对`data`中数据的劫持，在劫持了数据之后我们怎么实现每一次的数据改变都更改视图呢，很简单，只要我们在每一次`set`的时候重新渲染模板就可以了