//html => vnode
function getVnode(node) {
  let type = node.nodeType;
  let vnode = null;

  if (type === 3) {//文本节点
    vnode = new VNode(undefined, undefined, node.nodeValue, type);
  } else if (type === 1) {
    let attrs = node.attributes,
      nodeName = node.nodeName;
    let _attrObj = {};
    for (let i = 0; i < attrs.length; i++) {
      _attrObj[attrs[i].nodeName] = attrs[i].nodeValue;
    }
    vnode = new VNode(nodeName, _attrObj, undefined, type);
    let children = node.childNodes;
    for (let i = 0; i < children.length; i++) {
      vnode.appendChild(getVnode(children[i]))
    }
  }
  return vnode;
}

// 将数据填充到虚拟dom中
let r_brackets = /\{\{(.+?)\}\}/g; //匹配文本节点中的{{}}

function getValueByPath(data, path) {
  let paths = path.split(".");
  let res = data;
  let prop;
  while (prop = paths.shift()) {
    res = res[prop];
  }
  return res;
} //根据传入变量获取data对应数据

function combine(vnode, data) {
  let _tag = vnode.tag,
    _data = vnode.data,
    _value = vnode.value,
    _type = vnode.type,
    _children = vnode.children;

  let _vnode = null;

  if (_type === 3) {//文本
    _value = _value.replace(r_brackets, function (_, g) {
      return getValueByPath(data, g.trim());
    })
    _vnode = new VNode(undefined, undefined, _value, _type);
  } else if (_type === 1) {
    _vnode = new VNode(_tag, _data, undefined, _type)
    _children.forEach(subvnode => _vnode.appendChild(combine(subvnode, data)))
  }
  return _vnode;
}

//将虚拟DOM转化为HTML
function parseVNode(vnode) {
  let type = vnode.type;
  let node = null;

  if (type === 3) {//文本
    node = document.createTextNode(vnode.value)
  } else if (type === 1) {
    node = document.createElement(vnode.tag);
    let data = vnode.data;
    Object.keys(data).forEach(attr => {
      node.setAttribute(attr, data[attr]);
    })
    let children = vnode.children;
    children.forEach(child => {
      node.appendChild(parseVNode(child));
    })
  }
  return node;
}
