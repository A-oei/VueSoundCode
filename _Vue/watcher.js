class Watcher {
  /**
   *@params vm object _Vue实例
   *@params exOrFn 1 渲染watcher的话传入的函数 2 如果是计算watcher传入的是路径表达式
   */
  constructor(vm, expOrFn) {
    this.vm = vm;
    this.getter = expOrFn;

    this.deps = [];//依赖项

    this.get()//在初始化的时候渲染页面
  }

  //触发getter
  get() {
    pushTarget(this);
    this.getter.call(this.vm, this.vm);
    popTargte();
  }

  run() {
    this.get();
  }

  update() {
    this.run()
  }

  //清空依赖队列
  cleanupDep() {

  }

  addDep(dep) {
    //将当前dep与当前watcher关联
    this.deps.push(dep);
  }
}
