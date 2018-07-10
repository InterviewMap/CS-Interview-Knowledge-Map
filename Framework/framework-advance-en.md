<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Virtual Dom](#virtual-dom)
  - [Why Virtual Dom is needed](#why-virtual-dom-is-needed)
  - [Virtual Dom algorithm introduction](#virtual-dom-algorithm-introduction)
  - [Virtual Dom algorithm implementation](#virtual-dom-algorithm-implementation)
    - [recursion of the tree](#recursion-of-the-tree)
    - [checking property changes](#checking-property-changes)
    - [Algorithm Implementation for Detecting List Changes](#algorithm-implementation-for-detecting-list-changes)
    - [Iterating and Marking Child Elements](#iterating-and-marking-child-elements)
    - [Rendering Difference](#rendering-difference)
  - [The End](#the-end)
- [Redux Source Code Analysis](#redux-source-code-analysis)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Virtual Dom

[source code](https://github.com/KieSun/My-wheels/tree/master/Virtual%20Dom)

## Why Virtual Dom is needed

As we know, modifying DOM is a costly task. We could consider using JS objects to simulate DOM objects, since operating on JS objects is much more time saving than operating on DOM.

For example

```js
// Let's assume this array simulates a ul which contains five li's.
[1, 2, 3, 4, 5]
// using this to replace the ul above.
[1, 2, 5, 4]
```

From the above example, it's apparent that the first ul's 3rd li is removed, and the 4th and the 5th are exchanged positions.

If the previous operation is applied to DOM, we have the following code:

```js
// removing the 3rd li
ul.childNodes[2].remove()
// interexchanging positions between the 4th and the 5th
let fromNode = ul.childNodes[4]
let toNode = node.childNodes[3]
let cloneFromNode = fromNode.cloneNode(true)
let cloenToNode = toNode.cloneNode(true)
ul.replaceChild(cloneFromNode, toNode)
ul.replaceChild(cloenToNode, fromNode)
```

Of course, in actual operations, we need an indentifier for each node, as an index for checking if two nodes are identical. This is why both Vue and React's official documentation suggests using a unique identifier `key` for nodes in a list to ensure efficiency.

DOM element can not only be simulated, but they can also be rendered by JS objects.

Below is a simple implementation of a JS object simulating a DOM element.

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
  // render
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
  // create an element
  _createElement(tag, props, child, key) {
    // create an element with tag
    let el = document.createElement(tag)
    // set properties on the element
    for (const key in props) {
      if (props.hasOwnProperty(key)) {
        const value = props[key]
        el.setAttribute(key, value)
      }
    }
    if (key) {
      el.setAttribute('key', key)
    }
    // add children nodes recursively
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

## Virtual Dom algorithm introduction

The next step after using JS to implement DOM element is to detect object changes.

DOM is a multi-branching tree. If we were to compare the old and the new trees thoroughly, the time complexity would be O(n ^ 3), which is simply unacceptable. Therefore, the React team optimized their algorithm to achieve an O(n) complexity for detecting changes.

The key to achieving O(n) is to only compare the nodes on the same level rather than across levels. This works because in actual usage we rarely move DOM elements across levels.

We then have two steps of the algorithm.

- from top to bottom, from left to right to iterate the object, aka depth first search. This step adds an index to every node, for rendering the differences later.
- whenever a node has a child element, we check whether the child element changed.

## Virtual Dom algorithm implementation

### recursion of the tree

First let's implement the recursion algorithm of the tree. Before doing that, let's consider the different cases of comparing two nodes.

1. new nodes's `tagName` or `key` is different from that of the old one. This menas the old node is replaced, and we don't have to recurse on the node any more because the whole subtree is removed.
2. new node's `tagName` and `key` (maybe nonexistent) are the same as the old's. We start recursing on the subtree.
3. no new node appears. No operation needed.

```js
import { StateEnums, isString, move } from './util'
import Element from './element'

export default function diff(oldDomTree, newDomTree) {
  // for recording changes
  let pathchs = {}
  // the index starts at 0
  dfs(oldDomTree, newDomTree, 0, pathchs)
  return pathchs
}

function dfs(oldNode, newNode, index, patches) {
  // for saving the subtree changes
  let curPatches = []
  // three cases
  // 1. no new node, do nothing
  // 2. new nodes' tagName and `key` are different from the old one's, replace
  // 3. new nodes' tagName and key are the same as the old one's, start recursing
  if (!newNode) {
  } else if (newNode.tag === oldNode.tag && newNode.key === oldNode.key) {
    // check whether properties changed
    let props = diffProps(oldNode.props, newNode.props)
    if (props.length) curPatches.push({ type: StateEnums.ChangeProps, props })
    // recurse the subtree
    diffChildren(oldNode.children, newNode.children, index, patches)
  } else {
    // different node, replace
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

### checking property changes

We also have three steps for checking for property changes

1. iterate the old property list, check if the property still exists in the new property list.
2. iterate the new property list, check if there are changes for properties existing in both lists.
3. for the second step, also check if a property doesn't exist in the old property list.

```js
function diffProps(oldProps, newProps) {
  // three steps for checking for props
  // iterate oldProps for removed properties
  // iterate newProps for chagned property values
  // lastly check if new properties are added
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

### Algorithm Implementation for Detecting List Changes

This algorithm is the core of the Virtual Dom. Let's go down the list.
The main steps are similar to checking property changes. There are also three steps.

1. iterate the old node list, check if the node still exists in the new list.
2. iterate the new node list, check if there is any new node.
3. for the second step, also check if a node moved.

PS: this algorithm only handles nodes with `key`s.

```js
function listDiff(oldList, newList, index, patches) {
  // to make the iteration more convenient, first take all keys from both lists
  let oldKeys = getKeys(oldList)
  let newKeys = getKeys(newList)
  let changes = []

  // for saving the node daa after changes
  // there are several advantages of using this array to save
  // 1. we can correctly obtain the index of the deleted node
  // 2. we only need to operate on the DOM once for interexchanged nodes
  // 3. we only need to iterate for the checking in the `diffChildren` function
  //    we don't need to check again for nodes existing in both lists
  let list = []
  oldList &&
    oldList.forEach(item => {
      let key = item.key
      if (isString(item)) {
        key = item
      }
      // checking if the new children has the current node
      // if not then delete
      let index = newKeys.indexOf(key)
      if (index === -1) {
        list.push(null)
      } else list.push(key)
    })
  // array after iterative changes
  let length = list.length
  // since deleting array elements changes the indices
  // we remove from the back to make sure indices stay the same
  for (let i = length - 1; i >= 0; i--) {
    // check if the current element is null, if so then it means we need to remove it
    if (!list[i]) {
      list.splice(i, 1)
      changes.push({
        type: StateEnums.Remove,
        index: i
      })
    }
  }
  // iterate the new list, check if a node is added or moved
  // also add and move nodes for `list`
  newList &&
    newList.forEach((item, i) => {
      let key = item.key
      if (isString(item)) {
        key = item
      }
      // check if the old children has the current node
      let index = list.indexOf(key)
      // if not then we need to insert
      if (index === -1 || key == null) {
        changes.push({
          type: StateEnums.Insert,
          node: item,
          index: i
        })
        list.splice(i, 0, key)
      } else {
        // found the node, need to check if it needs to be moved.
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

### Iterating and Marking Child Elements

For this function, there are two main functionalities.

1. checking differences between two lists
2. marking nodes

In general, the functionalities impelemented are simple.

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
  // marking last iterated node
  let last = null
  oldChild &&
    oldChild.forEach((item, i) => {
      let child = item && item.children
      if (child) {
        index =
          last && last.children ? index + last.children.length + 1 : index + 1
        let keyIndex = list.indexOf(item.key)
        let node = newChild[keyIndex]
        // only iterate nodes existing in both lists
        // no need to visit the added or removed ones
        if (node) {
          dfs(item, node, index, patches)
        }
      } else index += 1
      last = item
    })
}
```

### Rendering Difference

From the earlier algorithms, we can already get the differences between two trees. After knowing the differences, we need to locally update DOM. Let's take a look at the last step of Virtual Dom algorithms.

Two main functionalities for this function

1. Deep search the tree and extract the nodes needing modifications
2. Locally update DOM

This code snippet is pretty easy to understand as a whole.

```js
let index = 0
export default function patch(node, patchs) {
  let changes = patchs[index]
  let childNodes = node && node.childNodes
  // this deep search is the same as the one in diff algorithm
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

## The End

The implementation of the Virtual Dom algorithms contains the following three steps:

1. Simulate the creation of DOM objects through JS
2. Check differences between two objects
3. Render the differences

```js
let test4 = new Element('div', { class: 'my-div' }, ['test4'])
let test5 = new Element('ul', { class: 'my-div' }, ['test5'])

let test1 = new Element('div', { class: 'my-div' }, [test4])

let test2 = new Element('div', { id: '11' }, [test5, test4])

let root = test1.render()

let pathchs = diff(test1, test2)
console.log(pathchs)

setTimeout(() => {
  console.log('start updating')
  patch(root, pathchs)
  console.log('end updating')
}, 1000)
```

Although the current implementation is simple, it's definitely enough for understanding Virtual Dom algorithms.

# Redux Source Code Analysis

Let's take a look at the `combineReducers` function first.

```js
// pass an object
export default function combineReducers(reducers) {
 // get this object's keys
  const reducerKeys = Object.keys(reducers)
  // reducers after filtering
  const finalReducers = {}
  // get the values corresponding to every key
  // in dev environment, check if the value is undefined
  // then put function type values into finalReducers
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
  // get the keys of the reducers after filtering
  const finalReducerKeys = Object.keys(finalReducers)
  
  // in dev environment check and save unexpected key to cache for warnings later
  let unexpectedKeyCache
  if (process.env.NODE_ENV !== 'production') {
    unexpectedKeyCache = {}
  }
    
  let shapeAssertionError
  try {
  // explanations of the function is below
    assertReducerShape(finalReducers)
  } catch (e) {
    shapeAssertionError = e
  }
// combineReducers returns another function, which is reducer after merging
// this function returns the root state
// also notice a closure is used here. The function uses some outside properties
  return function combination(state = {}, action) {
    if (shapeAssertionError) {
      throw shapeAssertionError
    }
    // explanations of the function is below
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
    // if state changed
    let hasChanged = false
    // state after changes
    const nextState = {}
    for (let i = 0; i < finalReducerKeys.length; i++) {
    // get the key with index
      const key = finalReducerKeys[i]
      // get the corresponding reducer function with key
      const reducer = finalReducers[key]
      // the key in state tree is the same as the key in finalReducers
      // so the key of the parameter passed to combineReducers represents each reducer as well as each state
      const previousStateForKey = state[key]
      // execute reducer function to get the state corresponding to the key
      const nextStateForKey = reducer(previousStateForKey, action)
      // check the value of state, report error if it's undefined
      if (typeof nextStateForKey === 'undefined') {
        const errorMessage = getUndefinedStateErrorMessage(key, action)
        throw new Error(errorMessage)
      }
      // put the value into nextState
      nextState[key] = nextStateForKey
      // if state changed
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    // as long as state changed, return the new state
    return hasChanged ? nextState : state
  }
}
```

`combineReducers` is simple in general. In short, it accepts an object and return a function after processing the parameters. This function has an object finalReducers that stores the processed parameters. The object is then itereated on, each reducer function in it is executed, and the new state is returned.

Let's then take a look at the two functions used in combineReducers.

```js
// the first function used to throw errors
function assertReducerShape(reducers) {
// iterate on the parameters in combineReducers
  Object.keys(reducers).forEach(key => {
    const reducer = reducers[key]
    // pass an action
    const initialState = reducer(undefined, { type: ActionTypes.INIT })
    // throw an error if the state is undefined
    if (typeof initialState === 'undefined') {
      throw new Error(
        `Reducer "${key}" returned undefined during initialization. ` +
          `If the state passed to the reducer is undefined, you must ` +
          `explicitly return the initial state. The initial state may ` +
          `not be undefined. If you don't want to set a value for this reducer, ` +
          `you can use null instead of undefined.`
      )
    }
    // process again, considering the case that the user returned a value for ActionTypes.INIT in the reducer
    // pass a random action and check if the value is undefined
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
  // here the reducers is already finalReducers
  const reducerKeys = Object.keys(reducers)
  const argumentName =
    action && action.type === ActionTypes.INIT
      ? 'preloadedState argument passed to createStore'
      : 'previous state received by the reducer'
  
  // if finalReducers is empty
  if (reducerKeys.length === 0) {
    return (
      'Store does not have a valid reducer. Make sure the argument passed ' +
      'to combineReducers is an object whose values are reducers.'
    )
  }
  // if the state passed is not an object
  if (!isPlainObject(inputState)) {
    return (
      `The ${argumentName} has unexpected type of "` +
      {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] +
      `". Expected argument to be an object with the following ` +
      `keys: "${reducerKeys.join('", "')}"`
    )
  }
  // compare the keys of the state and of finalReducers and filter out the extra keys
  const unexpectedKeys = Object.keys(inputState).filter(
    key => !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]
  )

  unexpectedKeys.forEach(key => {
    unexpectedKeyCache[key] = true
  })

  if (action && action.type === ActionTypes.REPLACE) return

// if unexpectedKeys is not empty
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

Let's then take a look at `compose` function

```js
// This function is quite elegant. It let us stack several functions via passing the references of functions. The term is called Higher-order function.
// call functions from the right to the left with reduce function
// for the example in the project above
compose(
    applyMiddleware(thunkMiddleware),
    window.devToolsExtension ? window.devToolsExtension() : f => f
) 
// with compose it turns into applyMiddleware(thunkMiddleware)(window.devToolsExtension()())
// so you should return a function when window.devToolsExtension is not found
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

Let's then analyze part of the source code of `createStore` function

```js
export default function createStore(reducer, preloadedState, enhancer) {
  // normally preloadedState is rarely used
  // check type, is the second parameter is a function and there is no third parameter, then exchange positions
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }
  // check if enhancer is a function
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }
    // if there is no type error, first execute enhancer, then execute createStore
    return enhancer(createStore)(reducer, preloadedState)
  }
  // check if reducer is a function
  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }
  // current reducer
  let currentReducer = reducer
  // current state
  let currentState = preloadedState
  // current listener array
  let currentListeners = []
  // this is a very important design. The purpose is that currentListeners array is an invariant when the listeners are iterated every time
  // we can consider if only currentListeners exists. If we execute subscribe again in some subscribe execution, or unsubscribe, it would change the length of the currentListeners array, so there might be an index error
  let nextListeners = currentListeners
  // if reducer is executing
  let isDispatching = false
  // if currentListeners is the same as nextListeners, assign the value back
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }
  // ......
}
```

We look at `applyMiddleware` function next

Before that I need to introduce a concept called function Currying. Currying is a technology for changing a function with multiple parameters to a series of functions with a single parameter.

```js
function add(a,b) { return a + b }   
add(1, 2) => 3
// for the above function, we can use Currying like so
function add(a) {
    return b => {
        return a + b
    }
}
add(1)(2) => 3
// you can understand Currying like this:
// we store an outside variable with a closure, and return a function that takes a parameter. In this function, we use the stored variable and return the value.
```

```js
// this function should be the most abstruse part of the whole source code
// this function returns a function Curried
// therefore the funciton should be called like so: applyMiddleware(...middlewares)(createStore)(...args)
export default function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    // here we execute createStore, and pass the parameters passed lastly to the applyMiddleware function
    const store = createStore(...args)
    let dispatch = () => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. ` +
          `Other middleware would not be applied to this dispatch.`
      )
    }
    let chain = []
    // every middleware should have these two functions
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    // pass every middleware in middlewares to middlewareAPI
    chain = middlewares.map(middleware => middleware(middlewareAPI))
    // same as before, calle very middleWare from right to left, and pass to store.dispatch
    dispatch = compose(...chain)(store.dispatch)
    // this piece is a little abstract, we'll analyze together with the code of redux-thunk
    // createThunkMiddleware returns a 3-level function, the first level accepts a middlewareAPI parameter
    // the second level accepts store.dispatch
    // the third level accepts parameters in dispatch
{function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => next => action => {
    // check if the parameters in dispatch is a function
    if (typeof action === 'function') {
      // if so, pass those parameters, until action is no longer a function, then execute dispatch({type: 'XXX'})
      return action(dispatch, getState, extraArgument);
    }

    return next(action);
  };
}
const thunk = createThunkMiddleware();

export default thunk;}
// return the middleware-empowered dispatch and the rest of the properties in store.
    return {
      ...store,
      dispatch
    }
  }
}
```

Now we've passed the hardest part. Let's take a look at some easier pieces.

```js 
// Not much to say here, return the current state, but we can't call this function when reducer is running
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
// accept a function parameter
function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.')
    }
    // the major design of this part is already covered in the description of nextListeners. Not much to talk about otherwise
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

// return a cancel subscription function
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
  // the prototype dispatch will check if action is an object
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
    // note that you can't call dispatch function in reducers
    // it would cause a stack overflow
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }
    // execute the composed function after combineReducers
    try {
      isDispatching = true
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }
    // iterate on currentListeners and execute saved functions in the array
    const listeners = (currentListeners = nextListeners)
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }

    return action
  }
  // at the end of createStore, invoke an action dispatch({ type: ActionTypes.INIT });
  // to initialize state
```