# MVVM

MVVM consists of the following three contents

* View: interface
* Model：Data model
* ViewModel：As a bridge responsible for communicating View and Model


In the JQuery period, if you need to refresh the UI, you need to get the corresponding DOM and then update the UI, so the data and business logic are strongly-coupled with the page.

In MVVM, the UI is driven by data. Once the data is changed, the corresponding UI will be refreshed. If the UI changes, the corresponding data will also be changed. In this way, we can only care about the data flow in business processing without dealing with the page directly. ViewModel only cares about the processing of data and business and does not care how View handles data. In this case, we can separate the View from the Model. If either party changes, it does not necessarily need to change the other party, and some reusable logic can be placed in a ViewModel, allowing multiple Views to reuse this ViewModel.

In MVVM, the core is the two-way binding of data, such as dirty checking by Angular and data hijacking in Vue.


## Dirty Checking

When the specified event is triggered, it will enter the dirty checking and call the `$digest` loop to walk through all the data observers to determine whether the current value is different from the previous value. If a change is detected, it will call the `$watch` function, and then call the `$digest` loop again until no changes are found. The cycle is at least two times, up to ten times.

Although dirty checking has inefficiencies, it can complete the task without caring about how the data is changed, but the two-way binding in `Vue` is problematic. And dirty checking can achieve batch detection of updated values, and then unified update UI, greatly reducing the number of operating DOM. Therefore, inefficiency is also relative, and this is what the benevolent sees the wise and sees wisdom.


## Data hijacking

Vue internally uses `Obeject.defineProperty()` to implement two-way binding, which allows you to listen for events of `set` and `get`.

```js
var data = { name: 'yck' }
observe(data)
let name = data.name // -> get value
data.name = 'yyy' // -> change value

function observe(obj) {
    // judge the type
  if (!obj || typeof obj !== 'object') {
    return
  }
  Object.keys(data).forEach(key => {
    defineReactive(data, key, data[key])
  })
}

function defineReactive(obj, key, val) {
    // recurse the properties of child
  observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      console.log('get value')
      return val
    },
    set: function reactiveSetter(newVal) {
      console.log('change value')
      val = newVal
    }
  })
}
```

The above code simply implements how to listen for the `set` and `get` events of the data, but that's not enough. You also need to add a Publish/Subscribe to the property when appropriate.

```html
<div>
    {{name}}
</div>
```

In the process of parsing the template code like above, when encountering `{{name}}`, add a publish/subscribe to the property `name` 

```js
// decouple by Dep
class Dep {
  constructor() {
    this.subs = []
  }
  addSub(sub) {
    // Sub is an instance of Watcher
    this.subs.push(sub)
  }
  notify() {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}
// Global property, configure Watcher with this property
Dep.target = null

function update(value) {
  document.querySelector('div').innerText = value
}

class Watcher {
  constructor(obj, key, cb) {
    // Point Dep.target to itself 
    // Then trigger the getter of the property to add the listener
    // Finally, set Dep.target as null 
    Dep.target = this
    this.cb = cb
    this.obj = obj
    this.key = key
    this.value = obj[key]
    Dep.target = null
  }
  update() {
    // get the new value
    this.value = this.obj[this.key]
    // update Dom with the update method
    this.cb(this.value)
  }
}
var data = { name: 'yck' }
observe(data)
// Simulate the action triggered by parsing the `{{name}}`
new Watcher(data, 'name', update)
// update Dom innerText
data.name = 'yyy' 
```

The above implements a simple two-way binding. The core idea is to manually trigger the getter of the property to add the Publish/Subscribe.



## Proxy vs. Obeject.defineProperty

Although  `Obeject.defineProperty` has been able to implement two-way binding, it is still flawed.

* It can only implement data hijacking on properties, so it needs deep traversal of the entire object
* it can't listen to changes in data for arrays

Although Vue can detect the changes in array data, it is actually a hack and is flawed.

```js
const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)
// hack the following functions
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
methodsToPatch.forEach(function (method) {
  // 获得原生函数
    // get the native function
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
      // call the native function
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
      // trigger the update
    ob.dep.notify()
    return result
  })
})
```

On the other hand, `Proxy` doesn't have the above problem. It natively supports listening to array changes and can intercept the entire object directly, so Vue will also replace `Obeject.defineProperty` with `Proxy` in the next big version.

```js
let onWatch = (obj, setBind, getLogger) => {
  let handler = {
    get(target, property, receiver) {
      getLogger(target, property)
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      setBind(value);
      return Reflect.set(target, property, value);
    }
  };
  return new Proxy(obj, handler);
};

let obj = { a: 1 }
let value
let p = onWatch(obj, (v) => {
  value = v
}, (target, property) => {
  console.log(`Get '${property}' = ${target[property]}`);
})
p.a = 2 // bind `value` to `2`
p.a // -> Get 'a' = 2
```



# NextTick principle analysis

`nextTick` allows us to defer the callback to be executed after the next DOM update cycle，to get the updated DOM.

Before version 2.4, Vue used Microtasks, but the priority of microtasks is too high, and in some cases, it may faster than event bubbling, but if you use macrotasks, there may be some issues of rendering performance. So in the new version, microtasks will be used by default, but macrotasks will be used in special cases, such as v-on.

For implementing macrotasks, you will first determine if  `setImmediate` can be used, if not, downgrade to `MessageChannel`. If not again, use `setTimeout`.


```js
if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  macroTimerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else if (
  typeof MessageChannel !== 'undefined' &&
  (isNative(MessageChannel) ||
    // PhantomJS
    MessageChannel.toString() === '[object MessageChannelConstructor]')
) {
  const channel = new MessageChannel()
  const port = channel.port2
  channel.port1.onmessage = flushCallbacks
  macroTimerFunc = () => {
    port.postMessage(1)
  }
} else {
  /* istanbul ignore next */
  macroTimerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
```

`nextTick` also supports the use of `Promise`, which will determine whether `Promise` is implemented.

```js
export function nextTick(cb?: Function, ctx?: Object) {
  let _resolve
  // Consolidate callback functions into an array
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    if (useMacroTask) {
      macroTimerFunc()
    } else {
      microTimerFunc()
    }
  }
    // Determine if Promise can be used
    // Assign _resolve if possible
    // This way the callback function can be called in the way of promise
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
```


# React Lifecycle analysis

The Fiber mechanism was introduced in the V16 release. The mechanism affects some of the lifecycle calls to a certain extent and introduces two new APIs to solve the problems.

In previous versions, if you had a very complex composite component and then changed the `state` of the topmost component, the call stack might be long.

![](https://user-gold-cdn.xitu.io/2018/6/25/164358b0310f476c?w=685&h=739&f=png&s=61462)

If the call stack is too long, and complicated operations are performed in the middle, it may cause the main thread to be blocked for a long time, resulting in a bad user experience. Fiber is born to solve this problem.

Fiber is essentially a virtual stack frame, and the new scheduler freely schedules these frames according to their priority, thereby changing the previous synchronous rendering to asynchronous rendering, and segmenting the update without affecting the experience.

![](https://user-gold-cdn.xitu.io/2018/6/25/164358f89595d56f?w=1119&h=600&f=png&s=330885)

React has its own set of logic on how to prioritize. For things that require high real-time performance, such as animation, which means it must be rendered once within 16 ms to ensure that it is not stuck, React pauses the update every 16 ms (within 16ms) and returns to continue rendering the animation.

For asynchronous rendering, there are now two stages of rendering: `reconciliation` and `commit`. The former process can be interrupted, while the latter cannot be suspended, and the interface will be updated until it is completed.


**Reconciliation** stage

- `componentWillMount`
- `componentWillReceiveProps`
- `shouldComponentUpdate`
- `componentWillUpdate`

**Commit** stage

- `componentDidMount`
- `componentDidUpdate`
- `componentWillUnmount`

Because the `reconciliation` phase can be interrupted, the lifecycle functions that will be executed in the `reconciliation` phase may be called multiple times, which may cause bugs. So for these functions, except for `shouldComponentUpdate`, should be avoided as much as possible, and a new API is introduced in V16 to solve this problem.

`getDerivedStateFromProps` is used to replace `componentWillReceiveProps` , which is called during initialization and update

```js
class ExampleComponent extends React.Component {
  // Initialize state in constructor,
  // Or with a property initializer.
  state = {};

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.someMirroredValue !== nextProps.someValue) {
      return {
        derivedData: computeDerivedState(nextProps),
        someMirroredValue: nextProps.someValue
      };
    }

    // Return null to indicate no change to state.
    return null;
  }
}
```

`getSnapshotBeforeUpdate` is used to replace `componentWillUpdate`, which is called after the `update` but before the DOM update to read the latest DOM data.


## The usage advice of  Lifecycle methods in React V16

```js
class ExampleComponent extends React.Component {
  // Used to initialize the state
  constructor() {}
  // Used to replace `componentWillReceiveProps` , which will be called when initializing and `update`
  // Because the function is static, you can't get `this`
  // If need to compare `prevProps`, you need to maintain it separately in `state`
  static getDerivedStateFromProps(nextProps, prevState) {}
  // Determine whether you need to update components, mostly for component performance optimization
  shouldComponentUpdate(nextProps, nextState) {}
  // Called after the component is mounted
  // Can request or subscribe in this function
  componentDidMount() {}
  // Used to get the latest DOM data
  getSnapshotBeforeUpdate() {}
  // Component is about to be destroyed
  // Can remove subscriptions, timers, etc. here
  componentWillUnmount() {}
  // Called after the component is destroyed
  componentDidMount() {}
  // Called after component update
  componentDidUpdate() {}
  // render component
  render() {}
  // The following functions are not recommended
  UNSAFE_componentWillMount() {}
  UNSAFE_componentWillUpdate(nextProps, nextState) {}
  UNSAFE_componentWillReceiveProps(nextProps) {}
}
```


# setState

`setState` is an API that is often used in React, but it has some problems that can lead to mistakes. The core reason is that the API is asynchronous.

First, calling  `setState` does not immediately cause a change to `state`, and if you call multiple `setState` at a time, the result may not be as you expect.

```js
handle() {
  // Initialize `count` to 0
  console.log(this.state.count) // -> 0
  this.setState({ count: this.state.count + 1 })
  this.setState({ count: this.state.count + 1 })
  this.setState({ count: this.state.count + 1 })
  console.log(this.state.count) // -> 0
}
```

First, both prints are 0, because `setState` is an asynchronous API and will only execute after the sync code has finished running. The reason for `setState` is asynchronous is that `setState` may cause repainting of the DOM. If the call is repainted immediately after the call, the call will cause unnecessary performance loss. Designed to be asynchronous, you can put multiple calls into a queue and unify the update process when appropriate.

Second, although `setState` is called three times, the value of `count` is still 1. Because multiple calls are merged into one, only `state` will change when the update ends, and three calls are equivalent to the following code.

```js
Object.assign(  
  {},
  { count: this.state.count + 1 },
  { count: this.state.count + 1 },
  { count: this.state.count + 1 },
)
```

Of course, you can also call `setState` three times by the following way  to make `count` 3

```js
handle() {
  this.setState((prevState) => ({ count: prevState.count + 1 }))
  this.setState((prevState) => ({ count: prevState.count + 1 }))
  this.setState((prevState) => ({ count: prevState.count + 1 }))
}
```

If you want to get the correct `state` after each call to `setState`, you can do it with the following code:

```js
handle() {
    this.setState((prevState) => ({ count: prevState.count + 1 }), () => {
        console.log(this.state)
    })
}
```

# Routing principle

The front-end routing is actually very simple to implement. The essence is to listen to changes in the URL, then match the routing rules, display the corresponding page, and no need to refresh. Currently, there are only two implementations of the route used by a single page.

- hash mode
- history mode


`www.test.com/#/` is the hash URL. When the hash value after `#` changes, no request will be sent to server. You can listen to the URL change through the `hashchange` event, and then jump to the corresponding page.

![](https://user-gold-cdn.xitu.io/2018/7/11/164888109d57995f?w=942&h=493&f=png&s=39581)

History mode is a new feature of HTML5, which is more beautiful than Hash URL.

![](https://user-gold-cdn.xitu.io/2018/7/11/164888478584a217?w=1244&h=585&f=png&s=59637)
