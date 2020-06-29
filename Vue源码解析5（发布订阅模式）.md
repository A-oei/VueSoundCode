在Vue中，对于响应式的处理是通过`defineProperty`和发布订阅模式配合来使用的，对于`defineProperty`我们在前面已经了解了如何将数据转化为响应式的，那么我接下来看一下发布订阅模式是什么以及如何实现一个发布订阅模式的方法。

在网上我们会看到很多的关于发布订阅模式的比喻，例如我们在淘宝购物，可能现在商家的某一款商品现在还没有上架，但是已经发布了预售信息，我们可以提前在网站上预订我们想要的商品，在商家有商品以后，商家会根据我们预订的订单信息为我们提供相应的商品，这样的概念在代码中的运用就是我们说的发布订阅模式。相比这些类比来说，我反而觉得还是直接说代码会比较直观，发布订阅模式要实现的功能就是

1. 我们提供一个全局的`event`对象，该对象需要提供一个用来存储事件的容器
2. 在`event`对象上需要提供绑定的方法`on`，我们可以通过`on`方法来绑定自定义的事件，并且可以进行连续的绑定
3. `event`对象需要提供一个用来发射事件的`emit`方法，该方法可以指定要发射的事件，还可以进行传参
4. `event`对象需要提供一个`off`方法用来解绑事件，通过参数的控制可以选择移除某一个事件函数或者移除某一类事件

那么我们就按照这样的一个思路来实现一个发布订阅方法：

##### event

* `event`需要是一个全局的对象，并且`event`内需要有一个能存储我们通过`on`绑定的事件的容器`eventHandle`，所以`event`对象是一个闭包
* `event`对象需要返回`on`、`off`、`emit`方法

```javascript
let event=(function(){
	eventHandles={}//存储事件的容器
	return{
		on:function(){},
		emit:function(){},
		off:function(){}
		}
}())  
```

##### on

* `on`方法需要能够将方法添加到容器`evenHandles`中，`on`方法接收两个参数，第一个是方法的名称`type`，第二个是方法的函数`handle`
* 由于`on`方法是可以连续注册的，所以`on`在注册事件的时候，如果发现`eventHandles`中已存在`type`，那么添加`handle`，如果不存在，那么创建`eventHandles[type]`

```javascript
on(type, handle) {
  (eventHandles[type] || (eventHandles[type] = [])).push(handle)
}
```

##### off

* `off`可以移除`eventHandles`上已经绑定的方法，`off`方法接收两个个参数
  * 如果没有传参，表示清空所有的已绑定的方法
  * 如果只传一个参数，表示移除指定的某一类方法
  * 如果传两个参，表示移除指定的某一类方法中的某一个函数

```javascript
off(type, handle) {
  if (arguments.length == 0) {
    eventHandles = {}
  } else if (arguments.length == 1) {
    eventHandles[type] = [];
  } else if (arguments.length == 2) {
    let _events = eventHandles[type];
    if (!_events) return new Error(`${type}事件不存在`);
    let i = _events.length - 1;
    for (; i >= 0; i--) {
      if (_events[i] == handle) _events.splice(i, 1);
    }
  }
}
```

注意，`off`只能解除`handle`为具名函数的方法，参考下面的例子

```javascript
event.on('click',()=>{
  console.log('click_1')
})

const click_2=function () {
  console.log('click_2')
};

event.on('click',click_2);

event.on('test',function () {
  console.log(11)
})

//只能解除click_2事件,不能解除不具名函数绑定的事件
event.off('click',click_2);
event.off('click');
event.off();
```

这里涉及到`javaScript`在对数据比较时的逻辑，基本类型比较的是值，复杂类型比较的是地址，基本类型和复杂类型的比较如果是`==`那么是比较转换后比较值，如果是`===`会比较值，而且由于`javaScript`是一个解释型的语言，所以在进行比较判断的时候，如果是两个没有定义的进行比较，会从左向右依次定义然后进行比较，举例来说下面的代码

```javascript
[]==[]//false
```

如果是上面的代码，执行的时候会从左到右先创建一个`[]`然后再创建一个`[]`，由于两个`[]`的地址不同，比较结果为`false`。

```
let arr=[];
arr==arr;//true
```

如果是上面的情况，由于已经创建了`arr`，所以都是一个地址，所以结果为true。

在执行

##### emit

* `emit`方法可以发射通过`on`绑定的方法





