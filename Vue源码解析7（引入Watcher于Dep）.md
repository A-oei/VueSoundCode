我们在写一个Vue页面的时候经常遇到的一种情况是我们在页面中会用到多个组件，每一个组件可能会存在`data`等属性，在这些组件更新数据的时候页面也会更新，那么这里就是利用了我们上一章的发布订阅模式来实现的。

在Vue中，每一次的更新和重新渲染都是由`watcher`来发起的，`watcher`相当于发布订阅模式中的`emit`，用来发射事件，通知Vue需要更新哪一部分的代码。每一个组件都会有一个对应的`watcher`，我们称之为**渲染watcher**，在组件中使用如`computed`、`watch`这些方法的时候也会创建一个`watcher`，我们称之为**计算watcher**。Vue中有一个**全局的watcher**用来存储所需要更新的组件或方法对应的`watcher`，只有存储在全局`watcher`中的`watcher`才会触发重新渲染

组件在改变数据时会将组件对应的`watcher`存入全局`watcher`，我们称之为**依赖收集**，在页面进行首次渲染的时候，所有的`watcher`都会被存入全局`watcher`

在数据变更的时候会将全局`watcher`中所有的`watcher`一一触发，在触发完成后清空全局`watcher`

所以如果在页面中只有某一个组件的数据发生了变更，那么只会有该组件的`watcher`会被存入到全局`watcher`中，所以Vue也会只重新渲染该组件

本来打算自己花张图的，发现还是Vue文档上的图就很好了，直接使用这张图吧

![watcher](https://cn.vuejs.org/images/data.png)

watcher是一个全局方法，该方法中有一个`vm`属性用来接收**Vue当前的实例**，除此之外还有以下几个方法

* get    用于进行计算或执行函数，区别在于我们传入的是渲染`watcher`还是计算`watcher`，渲染`watcher`传入的是一个函数而计算`watcher`则是一个为字符串额路径，例如`watch`方法中的监听路径`info.name`
* update    公共的外部方法，该方法会触发内部的`run`方法 
*  run    用来判断使用异步运行还是同步运行，会调用`get`方法
* cleanupDep    用来清空`watcher`队列



