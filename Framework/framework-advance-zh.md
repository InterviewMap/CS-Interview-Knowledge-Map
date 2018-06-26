<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Virtual Dom](#virtual-dom)
- [为什么需要 Virtual Dom](#%E4%B8%BA%E4%BB%80%E4%B9%88%E9%9C%80%E8%A6%81-virtual-dom)
- [Virtual Dom 算法简述](#virtual-dom-%E7%AE%97%E6%B3%95%E7%AE%80%E8%BF%B0)
- [Virtual Dom 算法实现](#virtual-dom-%E7%AE%97%E6%B3%95%E5%AE%9E%E7%8E%B0)
- [树的递归](#%E6%A0%91%E7%9A%84%E9%80%92%E5%BD%92)
- [判断属性的更改](#%E5%88%A4%E6%96%AD%E5%B1%9E%E6%80%A7%E7%9A%84%E6%9B%B4%E6%94%B9)
- [判断列表差异算法实现](#%E5%88%A4%E6%96%AD%E5%88%97%E8%A1%A8%E5%B7%AE%E5%BC%82%E7%AE%97%E6%B3%95%E5%AE%9E%E7%8E%B0)
- [遍历子元素打标识](#%E9%81%8D%E5%8E%86%E5%AD%90%E5%85%83%E7%B4%A0%E6%89%93%E6%A0%87%E8%AF%86)
- [渲染差异](#%E6%B8%B2%E6%9F%93%E5%B7%AE%E5%BC%82)
- [最后](#%E6%9C%80%E5%90%8E)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Virtual Dom

[代码地址](https://github.com/KieSun/My-wheels/tree/master/Virtual%20Dom)

## 为什么需要 Virtual Dom

众所周知，操作 DOM 是很耗费性能的一件事情，既然如此，我们可以考虑通过 JS 对象来模拟 DOM 对象，毕竟操作 JS 对象比操作 DOM 省时的多。

举个例子

```js
// 假设这里模拟一个 ul，其中包含了 5 个 li
[1, 2, 3, 4, 5]
// 这里替换上面的 li
[1, 2, 5, 4]
```

从上述例子中，我们一眼就可以看出先前的 ul 中的第三个 li 被移除了，四五替换了位置。

如果以上操作对应到 DOM 中，那么就是以下代码

```js
// 删除第三个 li
ul.childNodes[2].remove()
// 将第四个 li 和第五个交换位置
let fromNode = ul.childNodes[4]
let toNode = node.childNodes[3]
let cloneFromNode = fromNode.cloneNode(true)
let cloenToNode = toNode.cloneNode(true)
ul.replaceChild(cloneFromNode, toNode)
ul.replaceChild(cloenToNode, fromNode)
```

当然在实际操作中，我们还需要给每个节点一个标识，作为判断是同一个节点的依据。所以这也是 Vue 和 React 中官方推荐列表里的节点使用唯一的 `key` 来保证性能。

那么既然 DOM 对象可以通过 JS 对象来模拟，反之也可以通过 JS 对象来渲染出对应的 DOM

以下是一个 JS 对象模拟 DOM 对象的简单实现

```js
export default class Element {
/**
* @param {String} tag 'div'
* @param {Object} props { class: 'item' }
* @param {Array} children [ Element1, 'text']
* @param {String} key option
*/
constructor(tag, props, children, key) {
this.tag = tag
this.props = props
if (Array.isArray(children)) {
this.children = children
} else if (isString(children)) {
this.key = children
this.children = null
}
if (key) this.key = key
}
// 渲染
render() {
let root = this._createElement(
this.tag,
this.props,
this.children,
this.key
)
document.body.appendChild(root)
return root
}
create() {
return this._createElement(this.tag, this.props, this.children, this.key)
}
// 创建节点
_createElement(tag, props, child, key) {
// 通过 tag 创建节点
let el = document.createElement(tag)
// 设置节点属性
for (const key in props) {
if (props.hasOwnProperty(key)) {
const value = props[key]
el.setAttribute(key, value)
}
}
if (key) {
el.setAttribute('key', key)
}
// 递归添加子节点
if (child) {
child.forEach(element => {
let child
if (element instanceof Element) {
child = this._createElement(
element.tag,
element.props,
element.children,
element.key
)
} else {
child = document.createTextNode(element)
}
el.appendChild(child)
})
}
return el
}
}
```

## Virtual Dom 算法简述

既然我们已经通过 JS 来模拟实现了 DOM，那么接下来的难点就在于如何判断旧的对象和新的对象之间的差异。

DOM 是多叉树的结构，如果需要完整的对比两颗树的差异，那么需要的时间复杂度会是 O(n ^ 3)，这个复杂度肯定是不能接受的。于是 React 团队优化了算法，实现了 O(n) 的复杂度来对比差异。

实现 O(n) 复杂度的关键就是只对比同层的节点，而不是跨层对比，这也是考虑到在实际业务中很少会去跨层的移动 DOM 元素。

所以判断差异的算法就分为了两步

- 首先从上至下，从左往右遍历对象，也就是树的深度遍历，这一步中会给每个节点添加索引，便于最后渲染差异
- 一旦节点有子元素，就去判断子元素是否有不同

## Virtual Dom 算法实现

### 树的递归

首先我们来实现树的递归算法，在实现该算法前，先来考虑下两个节点对比会有几种情况

1. 新的节点的 `tagName` 或者 `key` 和旧的不同，这种情况代表需要替换旧的节点，并且也不再需要遍历新旧节点的子元素了，因为整个旧节点都被删掉了
2. 新的节点的 `tagName` 和 `key`（可能都没有）和旧的相同，开始遍历子树
3. 没有新的节点，那么什么都不用做

```js
import { StateEnums, isString, move } from './util'
import Element from './element'

export default function diff(oldDomTree, newDomTree) {
// 用于记录差异
let pathchs = {}
// 一开始的索引为 0
dfs(oldDomTree, newDomTree, 0, pathchs)
return pathchs
}

function dfs(oldNode, newNode, index, patches) {
// 用于保存子树的更改
let curPatches = []
// 需要判断三种情况
// 1.没有新的节点，那么什么都不用做
// 2.新的节点的 tagName 和 `key` 和旧的不同，就替换
// 3.新的节点的 tagName 和 key（可能都没有） 和旧的相同，开始遍历子树
if (!newNode) {
} else if (newNode.tag === oldNode.tag && newNode.key === oldNode.key) {
// 判断属性是否变更
let props = diffProps(oldNode.props, newNode.props)
if (props.length) curPatches.push({ type: StateEnums.ChangeProps, props })
// 遍历子树
diffChildren(oldNode.children, newNode.children, index, patches)
} else {
// 节点不同，需要替换
curPatches.push({ type: StateEnums.Replace, node: newNode })
}

if (curPatches.length) {
if (patches[index]) {
patches[index] = patches[index].concat(curPatches)
} else {
patches[index] = curPatches
}
}
}
```

### 判断属性的更改

判断属性的更改也分三个步骤

1. 遍历旧的属性列表，查看每个属性是否还存在于新的属性列表中
2. 遍历新的属性列表，判断两个列表中都存在的属性的值是否有变化
3. 在第二步中同时查看是否有属性不存在与旧的属性列列表中

```js
function diffProps(oldProps, newProps) {
// 判断 Props 分以下三步骤
// 先遍历 oldProps 查看是否存在删除的属性
// 然后遍历 newProps 查看是否有属性值被修改
// 最后查看是否有属性新增
let change = []
for (const key in oldProps) {
if (oldProps.hasOwnProperty(key) && !newProps[key]) {
change.push({
prop: key
})
}
}
for (const key in newProps) {
if (newProps.hasOwnProperty(key)) {
const prop = newProps[key]
if (oldProps[key] && oldProps[key] !== newProps[key]) {
change.push({
prop: key,
value: newProps[key]
})
} else if (!oldProps[key]) {
change.push({
prop: key,
value: newProps[key]
})
}
}
}
return change
}
```

### 判断列表差异算法实现

这个算法是整个 Virtual Dom 中最核心的算法，且让我一一为你道来。
这里的主要步骤其实和判断属性差异是类似的，也是分为三步

1. 遍历旧的节点列表，查看每个节点是否还存在于新的节点列表中
2. 遍历新的节点列表，判断是否有新的节点
3. 在第二步中同时判断节点是否有移动

PS：该算法只对有 `key` 的节点做处理

```js
function listDiff(oldList, newList, index, patches) {
// 为了遍历方便，先取出两个 list 的所有 keys
let oldKeys = getKeys(oldList)
let newKeys = getKeys(newList)
let changes = []

// 用于保存变更后的节点数据
// 使用该数组保存有以下好处
// 1.可以正确获得被删除节点索引
// 2.交换节点位置只需要操作一遍 DOM
// 3.用于 `diffChildren` 函数中的判断，只需要遍历
// 两个树中都存在的节点，而对于新增或者删除的节点来说，完全没必要
// 再去判断一遍
let list = []
oldList &&
oldList.forEach(item => {
let key = item.key
if (isString(item)) {
key = item
}
// 寻找新的 children 中是否含有当前节点
// 没有的话需要删除
let index = newKeys.indexOf(key)
if (index === -1) {
list.push(null)
} else list.push(key)
})
// 遍历变更后的数组
let length = list.length
// 因为删除数组元素是会更改索引的
// 所有从后往前删可以保证索引不变
for (let i = length - 1; i >= 0; i--) {
// 判断当前元素是否为空，为空表示需要删除
if (!list[i]) {
list.splice(i, 1)
changes.push({
type: StateEnums.Remove,
index: i
})
}
}
// 遍历新的 list，判断是否有节点新增或移动
// 同时也对 `list` 做节点新增和移动节点的操作
newList &&
newList.forEach((item, i) => {
let key = item.key
if (isString(item)) {
key = item
}
// 寻找旧的 children 中是否含有当前节点
let index = list.indexOf(key)
// 没找到代表新节点，需要插入
if (index === -1  || key == null) {
changes.push({
type: StateEnums.Insert,
node: item,
index: i
})
list.splice(i, 0, key)
} else {
// 找到了，需要判断是否需要移动
if (index !== i) {
changes.push({
type: StateEnums.Move,
from: index,
to: i
})
move(list, index, i)
}
}
})
return { changes, list }
}

function getKeys(list) {
let keys = []
let text
list &&
list.forEach(item => {
let key
if (isString(item)) {
key = [item]
} else if (item instanceof Element) {
key = item.key
}
keys.push(key)
})
return keys
}
```

### 遍历子元素打标识

对于这个函数来说，主要功能就两个

1. 判断两个列表差异
2. 给节点打上标记

总体来说，该函数实现的功能很简单

```js
function diffChildren(oldChild, newChild, index, patches) {
let { changes, list } = listDiff(oldChild, newChild, index, patches)
if (changes.length) {
if (patches[index]) {
patches[index] = patches[index].concat(changes)
} else {
patches[index] = changes
}
}
// 记录上一个遍历过的节点
let last = null
oldChild &&
oldChild.forEach((item, i) => {
let child = item && item.children
if (child) {
index =
last && last.children ? index + last.children.length + 1 : index + 1
let keyIndex = list.indexOf(item.key)
let node = newChild[keyIndex]
// 只遍历新旧中都存在的节点，其他新增或者删除的没必要遍历
if (node) {
dfs(item, node, index, patches)
}
} else index += 1
last = item
})
}
```

### 渲染差异

通过之前的算法，我们已经可以得出两个树的差异了。既然知道了差异，就需要局部去更新 DOM 了，下面就让我们来看看 Virtual Dom 算法的最后一步骤

这个函数主要两个功能

1. 深度遍历树，将需要做变更操作的取出来
2. 局部更新 DOM

整体来说这部分代码还是很好理解的

```js
let index = 0
export default function patch(node, patchs) {
let changes = patchs[index]
let childNodes = node && node.childNodes
// 这里的深度遍历和 diff 中是一样的
if (!childNodes) index += 1
if (changes && changes.length && patchs[index]) {
changeDom(node, changes)
}
let last = null
if (childNodes && childNodes.length) {
childNodes.forEach((item, i) => {
index =
last && last.children ? index + last.children.length + 1 : index + 1
patch(item, patchs)
last = item
})
}
}

function changeDom(node, changes, noChild) {
changes &&
changes.forEach(change => {
let { type } = change
switch (type) {
case StateEnums.ChangeProps:
let { props } = change
props.forEach(item => {
if (item.value) {
node.setAttribute(item.prop, item.value)
} else {
node.removeAttribute(item.prop)
}
})
break
case StateEnums.Remove:
node.childNodes[change.index].remove()
break
case StateEnums.Insert:
let dom
if (isString(change.node)) {
dom = document.createTextNode(change.node)
} else if (change.node instanceof Element) {
dom = change.node.create()
}
node.insertBefore(dom, node.childNodes[change.index])
break
case StateEnums.Replace:
node.parentNode.replaceChild(change.node.create(), node)
break
case StateEnums.Move:
let fromNode = node.childNodes[change.from]
let toNode = node.childNodes[change.to]
let cloneFromNode = fromNode.cloneNode(true)
let cloenToNode = toNode.cloneNode(true)
node.replaceChild(cloneFromNode, toNode)
node.replaceChild(cloenToNode, fromNode)
break
default:
break
}
})
}
```

## 最后

Virtual Dom 算法的实现也就是以下三步

1. 通过 JS 来模拟创建 DOM 对象
2. 判断两个对象的差异
3. 渲染差异

```js
let test4 = new Element('div', { class: 'my-div' }, ['test4'])
let test5 = new Element('ul', { class: 'my-div' }, ['test5'])

let test1 = new Element('div', { class: 'my-div' }, [test4])

let test2 = new Element('div', { id: '11' }, [test5, test4])

let root = test1.render()

let pathchs = diff(test1, test2)
console.log(pathchs)

setTimeout(() => {
console.log('开始更新')
patch(root, pathchs)
console.log('结束更新')
}, 1000)
```

当然目前的实现还略显粗糙，但是对于理解 Virtual Dom 算法来说已经是完全足够的了。

# Redux 源码分析

首先让我们来看下 `combineReducers` 函数

```js
// 传入一个 object
export default function combineReducers(reducers) {
 // 获取该 Object 的 key 值
  const reducerKeys = Object.keys(reducers)
  // 过滤后的 reducers
  const finalReducers = {}
  // 获取每一个 key 对应的 value
  // 在开发环境下判断值是否为 undefined
  // 然后将值类型是函数的值放入 finalReducers
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i]

    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        warning(`No reducer provided for key "${key}"`)
      }
    }

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key]
    }
  }
  // 拿到过滤后的 reducers 的 key 值
  const finalReducerKeys = Object.keys(finalReducers)
  
  // 在开发环境下判断，保存不期望 key 的缓存用以下面做警告  
  let unexpectedKeyCache
  if (process.env.NODE_ENV !== 'production') {
    unexpectedKeyCache = {}
  }
    
  let shapeAssertionError
  try {
  // 该函数解析在下面
    assertReducerShape(finalReducers)
  } catch (e) {
    shapeAssertionError = e
  }
// combineReducers 函数返回一个函数，也就是合并后的 reducer 函数
// 该函数返回总的 state
// 并且你也可以发现这里使用了闭包，函数里面使用到了外面的一些属性
  return function combination(state = {}, action) {
    if (shapeAssertionError) {
      throw shapeAssertionError
    }
    // 该函数解析在下面
    if (process.env.NODE_ENV !== 'production') {
      const warningMessage = getUnexpectedStateShapeWarningMessage(
        state,
        finalReducers,
        action,
        unexpectedKeyCache
      )
      if (warningMessage) {
        warning(warningMessage)
      }
    }
    // state 是否改变
    let hasChanged = false
    // 改变后的 state
    const nextState = {}
    for (let i = 0; i < finalReducerKeys.length; i++) {
    // 拿到相应的 key
      const key = finalReducerKeys[i]
      // 获得 key 对应的 reducer 函数
      const reducer = finalReducers[key]
      // state 树下的 key 是与 finalReducers 下的 key 相同的
      // 所以你在 combineReducers 中传入的参数的 key 即代表了 各个 reducer 也代表了各个 state
      const previousStateForKey = state[key]
      // 然后执行 reducer 函数获得该 key 值对应的 state
      const nextStateForKey = reducer(previousStateForKey, action)
      // 判断 state 的值，undefined 的话就报错
      if (typeof nextStateForKey === 'undefined') {
        const errorMessage = getUndefinedStateErrorMessage(key, action)
        throw new Error(errorMessage)
      }
      // 然后将 value 塞进去
      nextState[key] = nextStateForKey
      // 如果 state 改变
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    // state 只要改变过，就返回新的 state
    return hasChanged ? nextState : state
  }
}
```

`combineReducers` 函数总的来说很简单，总结来说就是接收一个对象，将参数过滤后返回一个函数。该函数里有一个过滤参数后的对象 finalReducers，遍历该对象，然后执行对象中的每一个 reducer 函数，最后将新的 state 返回。

接下来让我们来看看 combinrReducers 中用到的两个函数

```js
// 这是执行的第一个用于抛错的函数
function assertReducerShape(reducers) {
// 将 combineReducers 中的参数遍历
  Object.keys(reducers).forEach(key => {
    const reducer = reducers[key]
    // 给他传入一个 action
    const initialState = reducer(undefined, { type: ActionTypes.INIT })
    // 如果得到的 state 为 undefined 就抛错
    if (typeof initialState === 'undefined') {
      throw new Error(
        `Reducer "${key}" returned undefined during initialization. ` +
          `If the state passed to the reducer is undefined, you must ` +
          `explicitly return the initial state. The initial state may ` +
          `not be undefined. If you don't want to set a value for this reducer, ` +
          `you can use null instead of undefined.`
      )
    }
    // 再过滤一次，考虑到万一你在 reducer 中给 ActionTypes.INIT 返回了值
    // 传入一个随机的 action 判断值是否为 undefined
    const type =
      '@@redux/PROBE_UNKNOWN_ACTION_' +
      Math.random()
        .toString(36)
        .substring(7)
        .split('')
        .join('.')
    if (typeof reducer(undefined, { type }) === 'undefined') {
      throw new Error(
        `Reducer "${key}" returned undefined when probed with a random type. ` +
          `Don't try to handle ${
            ActionTypes.INIT
          } or other actions in "redux/*" ` +
          `namespace. They are considered private. Instead, you must return the ` +
          `current state for any unknown actions, unless it is undefined, ` +
          `in which case you must return the initial state, regardless of the ` +
          `action type. The initial state may not be undefined, but can be null.`
      )
    }
  })
}

function getUnexpectedStateShapeWarningMessage(
  inputState,
  reducers,
  action,
  unexpectedKeyCache
) {
  // 这里的 reducers 已经是 finalReducers
  const reducerKeys = Object.keys(reducers)
  const argumentName =
    action && action.type === ActionTypes.INIT
      ? 'preloadedState argument passed to createStore'
      : 'previous state received by the reducer'
  
  // 如果 finalReducers 为空
  if (reducerKeys.length === 0) {
    return (
      'Store does not have a valid reducer. Make sure the argument passed ' +
      'to combineReducers is an object whose values are reducers.'
    )
  }
    // 如果你传入的 state 不是对象
  if (!isPlainObject(inputState)) {
    return (
      `The ${argumentName} has unexpected type of "` +
      {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] +
      `". Expected argument to be an object with the following ` +
      `keys: "${reducerKeys.join('", "')}"`
    )
  }
    // 将参入的 state 于 finalReducers 下的 key 做比较，过滤出多余的 key
  const unexpectedKeys = Object.keys(inputState).filter(
    key => !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]
  )

  unexpectedKeys.forEach(key => {
    unexpectedKeyCache[key] = true
  })

  if (action && action.type === ActionTypes.REPLACE) return

// 如果 unexpectedKeys 有值的话
  if (unexpectedKeys.length > 0) {
    return (
      `Unexpected ${unexpectedKeys.length > 1 ? 'keys' : 'key'} ` +
      `"${unexpectedKeys.join('", "')}" found in ${argumentName}. ` +
      `Expected to find one of the known reducer keys instead: ` +
      `"${reducerKeys.join('", "')}". Unexpected keys will be ignored.`
    )
  }
}
```

接下来让我们先来看看 `compose` 函数

```js
// 这个函数设计的很巧妙，通过传入函数引用的方式让我们完成多个函数的嵌套使用，术语叫做高阶函数
// 通过使用 reduce 函数做到从右至左调用函数
// 对于上面项目中的例子
compose(
    applyMiddleware(thunkMiddleware),
    window.devToolsExtension ? window.devToolsExtension() : f => f
) 
// 经过 compose 函数变成了 applyMiddleware(thunkMiddleware)(window.devToolsExtension()())
// 所以在找不到 window.devToolsExtension 时你应该返回一个函数
export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
```

然后我们来解析 `createStore` 函数的部分代码

```js
export default function createStore(reducer, preloadedState, enhancer) {
  // 一般 preloadedState 用的少，判断类型，如果第二个参数是函数且没有第三个参数，就调换位置
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }
  // 判断 enhancer 是否是函数
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }
    // 类型没错的话，先执行 enhancer，然后再执行 createStore 函数
    return enhancer(createStore)(reducer, preloadedState)
  }
  // 判断 reducer 是否是函数
  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }
  // 当前 reducer
  let currentReducer = reducer
  // 当前状态
  let currentState = preloadedState
  // 当前监听函数数组
  let currentListeners = []
  // 这是一个很重要的设计，为的就是每次在遍历监听器的时候保证 currentListeners 数组不变
  // 可以考虑下只存在 currentListeners 的情况，如果我在某个 subscribe 中再次执行 subscribe
  // 或者 unsubscribe，这样会导致当前的 currentListeners 数组大小发生改变，从而可能导致
  // 索引出错
  let nextListeners = currentListeners
  // reducer 是否正在执行
  let isDispatching = false
  // 如果 currentListeners 和 nextListeners 相同，就赋值回去
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }
  // ......
}
```

接下来先来介绍 `applyMiddleware` 函数

在这之前我需要先来介绍一下函数柯里化，柯里化是一种将使用多个参数的一个函数转换成一系列使用一个参数的函数的技术。

```js
function add(a,b) { return a + b }   
add(1, 2) => 3
// 对于以上函数如果使用柯里化可以这样改造
function add(a) {
    return b => {
        return a + b
    }
}
add(1)(2) => 3
// 你可以这样理解函数柯里化，通过闭包保存了外部的一个变量，然后返回一个接收参数的函数，在该函数中使用了保存的变量，然后再返回值。
```

```js
// 这个函数应该是整个源码中最难理解的一块了
// 该函数返回一个柯里化的函数
// 所以调用这个函数应该这样写 applyMiddleware(...middlewares)(createStore)(...args)
export default function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
   // 这里执行 createStore 函数，把 applyMiddleware 函数最后次调用的参数传进来
    const store = createStore(...args)
    let dispatch = () => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. ` +
          `Other middleware would not be applied to this dispatch.`
      )
    }
    let chain = []
    // 每个中间件都应该有这两个函数
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    // 把 middlewares 中的每个中间件都传入 middlewareAPI
    chain = middlewares.map(middleware => middleware(middlewareAPI))
    // 和之前一样，从右至左调用每个中间件，然后传入 store.dispatch
    dispatch = compose(...chain)(store.dispatch)
    // 这里只看这部分代码有点抽象，我这里放入 redux-thunk 的代码来结合分析
    // createThunkMiddleware返回了3层函数，第一层函数接收 middlewareAPI 参数
    // 第二次函数接收 store.dispatch
    // 第三层函数接收 dispatch 中的参数
{function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => next => action => {
  // 判断 dispatch 中的参数是否为函数
    if (typeof action === 'function') {
    // 是函数的话再把这些参数传进去，直到 action 不为函数，执行 dispatch({tyep: 'XXX'})
      return action(dispatch, getState, extraArgument);
    }

    return next(action);
  };
}
const thunk = createThunkMiddleware();

export default thunk;}
// 最后把经过中间件加强后的 dispatch 于剩余 store 中的属性返回，这样你的 dispatch
    return {
      ...store,
      dispatch
    }
  }
}
```

好了，我们现在将困难的部分都攻克了，来看一些简单的代码

```js 
// 这个没啥好说的，就是把当前的 state 返回，但是当正在执行 reducer 时不能执行该方法
function getState() {
    if (isDispatching) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing. ' +
          'The reducer has already received the state as an argument. ' +
          'Pass it down from the top reducer instead of reading it from the store.'
      )
    }

    return currentState
}
// 接收一个函数参数
function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.')
    }
// 这部分最主要的设计 nextListeners 已经讲过，其他基本没什么好说的
    if (isDispatching) {
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing. ' +
          'If you would like to be notified after the store has been updated, subscribe from a ' +
          'component and invoke store.getState() in the callback to access the latest state. ' +
          'See http://redux.js.org/docs/api/Store.html#subscribe for more details.'
      )
    }

    let isSubscribed = true

    ensureCanMutateNextListeners()
    nextListeners.push(listener)

// 返回一个取消订阅函数
    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }

      if (isDispatching) {
        throw new Error(
          'You may not unsubscribe from a store listener while the reducer is executing. ' +
            'See http://redux.js.org/docs/api/Store.html#subscribe for more details.'
        )
      }

      isSubscribed = false

      ensureCanMutateNextListeners()
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
    }
  }
 
function dispatch(action) {
// 原生的 dispatch 会判断 action 是否为对象
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
          'Use custom middleware for async actions.'
      )
    }

    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
          'Have you misspelled a constant?'
      )
    }
// 注意在 Reducers 中是不能执行 dispatch 函数的
// 因为你一旦在 reducer 函数中执行 dispatch，会引发死循环
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }
// 执行 combineReducers 组合后的函数
    try {
      isDispatching = true
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }
// 然后遍历 currentListeners，执行数组中保存的函数
    const listeners = (currentListeners = nextListeners)
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }

    return action
  }
 // 然后在 createStore 末尾会发起一个 action dispatch({ type: ActionTypes.INIT });
 // 用以初始化 state
```


