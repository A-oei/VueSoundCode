class Dep {
  constructor() {
    this.subs = []; //存储与Dep关联的watcher（知道要渲染什么属性的watcher）
  }

  addSub(sub) {
    this.subs.push(sub);
  }

  removeSub(sub) {
    for (let i = this.subs.length; i >= 0; i--) {
      if (sub == this.subs[i]) {
        this.subs.splice(i, 1);
      }
    }
  }

  depend() { //当前dep与当前watcher互相关联，也就是讲当前watcher存储到当前deo的subs中
    Dep.target && this.addSub(Dep.target);
    Dep.target && Dep.target.addDep(this);
  }

  notify() {//触发与Dep关联的watcher的update方法，起到更新视图的作用
    let deps = this.subs.slice();

    deps.forEach(warcher => {
      warcher.update();
    })
  }
}

//全局容器渲染watcher
Dep.target = null;

let targetStack = [];

function pushTarget(target) {
  targetStack.unshift(Dep.target);
  Dep.target = target;
}

function popTargte() {
  Dep.target = targetStack.shift();
}
