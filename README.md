# Vue源码解析

一入源码深似海  (/□＼*)

如果我们想要看懂`Vue`的源码，那么我们需要首先搞懂复杂的目录结构，然后需要弄清楚每个封装方法之间的相互调用，以及需要去揣摩作者这种写法的意图，所以往往很长时间不得其门而入。在看了蒋坤老师的视频后觉的是个很好的入门方法，下面试着按照这个思路对Vue的源码进行下分析，我们这里

* [将数据填充到模板](https://github.com/A-oei/VueSoundCode/blob/master/vue%E6%BA%90%E7%A0%81%E8%A7%A3%E6%9E%901%EF%BC%88%E5%B0%86%E6%95%B0%E6%8D%AE%E5%A1%AB%E5%85%85%E5%88%B0%E6%A8%A1%E6%9D%BF%EF%BC%89.md)
* [虚拟DOM和真实DOM之间的转换](https://github.com/A-oei/VueSoundCode/blob/master/vue%E6%BA%90%E7%A0%81%E8%A7%A3%E6%9E%902%EF%BC%88%E8%99%9A%E6%8B%9FDOM%E5%92%8C%E7%9C%9F%E5%AE%9EDOM%E4%B9%8B%E9%97%B4%E7%9A%84%E8%BD%AC%E6%8D%A2%EF%BC%89.md)
* [对数据进行劫持](https://github.com/A-oei/VueSoundCode/blob/master/Vue%E6%BA%90%E7%A0%81%E8%A7%A3%E6%9E%903%EF%BC%88%E5%AF%B9%E6%95%B0%E6%8D%AE%E8%BF%9B%E8%A1%8C%E5%8A%AB%E6%8C%81%EF%BC%89.md)
* [拦截原生数组方法、代理](https://github.com/A-oei/VueSoundCode/blob/master/vue%E6%BA%90%E7%A0%81%E8%A7%A3%E6%9E%904%EF%BC%88%E6%8B%A6%E6%88%AA%E5%8E%9F%E7%94%9F%E6%95%B0%E7%BB%84%E6%96%B9%E6%B3%95%E3%80%81%E4%BB%A3%E7%90%86%EF%BC%89.md)
* [模拟Vue函数](https://github.com/A-oei/VueSoundCode/blob/master/Vue%E6%BA%90%E7%A0%81%E8%A7%A3%E6%9E%905%EF%BC%88%E6%A8%A1%E6%8B%9FVue%E5%87%BD%E6%95%B0%EF%BC%89.md)
* [发布订阅模式](https://github.com/A-oei/VueSoundCode/blob/master/Vue%E6%BA%90%E7%A0%81%E8%A7%A3%E6%9E%906%EF%BC%88%E5%8F%91%E5%B8%83%E8%AE%A2%E9%98%85%E6%A8%A1%E5%BC%8F%EF%BC%89.md)
* [引入Watcher和Dep](https://github.com/A-oei/VueSoundCode/blob/master/Vue%E6%BA%90%E7%A0%81%E8%A7%A3%E6%9E%907%EF%BC%88%E5%BC%95%E5%85%A5Watcher%E4%BA%8EDep%EF%BC%89.md)

现在也有很多很好的对Vue源码解析的文章，可以作为参考

* [Vue源码分析](https://github.com/answershuto/learnVue)
* [Vue.js 技术揭秘](https://ustbhuangyi.github.io/vue-analysis/)

