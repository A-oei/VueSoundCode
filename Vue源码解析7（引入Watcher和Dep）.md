我们在写一个Vue页面的时候经常遇到的一种情况是我们在页面中会用到多个组件，每一个组件可能会存在`data`等属性，在这些组件更新数据的时候页面也会更新，那么这里就是配合了我们上一章的发布订阅模式来实现的。

在Vue中分别定义了**Watcher、Dep**，每一个属性都会包含一个Dep实例用来记录参与渲染或计算的Watcher，在属性数据发生变化的时候通知Watcher来更新视图，我们可以将Dep理解为用于存储组件的属性，Watcher用于触发渲染页面

![watcher](https://cn.vuejs.org/images/data.png)

通过这张图我们可以很直观的看到在组件属性发生变化的时候，发生变化的变量都会被读取并存储到Dep中，我们称这个过程为**依赖收集**，当属性变化时Dep会通过调用`notify`方法去通知Watcher更新视图，我们之前收集了什么就更新什么，这个过程我们称之为**派发更新**，Vue在Observe方法中，为每一个属性的`get`方法中都添加了`dep.depend`方法，所以在读取的时候就会触发依赖收集，同时也将dep存储到全局watcher中。

在Vue中，每一次的更新和重新渲染都是由Watcher来发起的，Watcher相当于发布订阅模式中的`emit`，用来发射事件，根据收集到的Dep集合来通知Vue需要更新哪一部分的代码。每一个组件都会有一个对应的Watcher，我们称之为**渲染watcher**，在组件中使用如`computed`、`watch`方法的时候也会创建一个Watcher，看源码的时候我们会发现这两个方法实际上就是调用了`new Watcher`，这些Watcher我们称之为**计算watcher**。

组件在改变数据时会将组件对应的Watcher存入**全局Watcher（Dep.target）**，在数据变更的时候会将全局Watcher中所有的Watcher的Dep集合一一触发，在触发完成后清空全局Watcher，所以如果在页面中只有某一个组件的数据发生了变更，那么只会有该组件的Watcher会被存入到全局Watcher中，Vue也只会重新渲染该组件。

## Dep

Dep是一个全局方法，该方法中有一个`subs`来存储与当前Dep相关联的watcher，除此之外还有以下几个方法：

* addSub    用来添加一个Watcher
* removeSub    用来移除Watcher
* depend    将当前的Dep与Watcher相关联
* notify    触发与之关联的Watcher中的`update`方法，起到更新的方法

```javascript
class Dep {

  constructor() {
    this.subs = []; // 存储的是与当前Dep关联的watcher
  }

  addSub( sub ) {
    this.subs.push( sub );
  }
  
  removeSub( sub ) {
    for ( let i = this.subs.length - 1; i >= 0 ; i-- ) {
      if ( sub === this.subs[ i ] ) {
        this.subs.splice( i, 1 );
      }
    }
  }

  depend() {
    if ( Dep.target ) {
      this.addSub( Dep.target ); // 将当前的watcher关联到当前的dep上
      Dep.target.addDep( this ); // 将当前的dep与当前渲染watcher关联起来
    }
  }

  notify() {
    let deps = this.subs.slice();
    deps.forEach( watcher => {
      watcher.update();
    } );
  }
}


Dep.target = null;// 全局的容器存储渲染watcher

let targetStack = [];

//将当前操作的watcher存储到全局watcher中, 参数target就是当前watcher
function pushTarget( target ) {
  targetStack.unshift( Dep.target );
  Dep.target = target;
}

function popTarget() {
  Dep.target = targetStack.shift();
}

//在watcher调用get方法的时候, 调用pushTarget(this)在watcher的get方法结束的时候, 调用popTarget()

```

## Watcher

Watcher是一个全局方法，该方法中有一个`vm`属性用来接收**Vue当前的实例**，除此之外还有以下几个方法

* get    用于进行计算或执行函数，区别在于我们传入的是渲染Watcher还是计算Watcher，渲染Watcher传入的是一个函数而计算Watcher则是一个为字符串额路径，例如`watch`方法中的监听路径`info.name`
* addDep    将 当前的 Dep与当前的Watcher 关联
* update    公共的外部方法，该方法会触发内部的`run`方法 
*  run    用来判断使用异步运行还是同步运行，会调用`get`方法，我们这里只简化实现调用`get`
* cleanupDep    用来清空Watcher队列

```javascript
//Watcher 观察者, 用于 发射更新的行为
class Watcher {
  /**
   * @param {Object} vm JGVue 实例
   * @param {String|Function} expOrfn 
   	 如果是渲染 watcher, 传入的就是渲染函数, 如果是计算watcher传入的就是路径表达式, 暂时只考虑expOrFn为函数的情况.
   */
  constructor( vm, expOrfn ) {
    this.vm = vm;
    this.getter = expOrfn;
    this.deps = []; // 依赖项
    this.depIds = {}; // 是一个Set类型, 用于保证依赖项的唯一性 
    this.get();
  }

  get() {
    pushTarget( this );
    this.getter.call( this.vm, this.vm ); 
    popTarget();
    this.cleanupDep();
  }

  run() {
    this.get(); 
  }// 在真正的vue中是调用queueWatcher,来触发nextTick进行异步的执行

  update() {
    this.run(); 
  }

  cleanupDep() {} //清空deps，这里就先略过了

  addDep( dep ) {
    this.deps.push( dep );
  }
}
```

我们之前已经整合过代码，现在我们把Wacher和Dep整合到之前的代码中，这里我们就不再写一遍了，可以直接看链接，[代码整合](https://github.com/A-oei/VueSoundCode/tree/master/_Vue)。

实际上到这里Vue响应式的基本实现过程就大概实现了，当然我们这里略过了很多，比如我们这里没有diff算法，是直接替换掉了整个模板等等，但是大概实现了Vue的基本思路，相比与直接去看源码有了一个逐步渐进的过程，（￣▽￣）↗