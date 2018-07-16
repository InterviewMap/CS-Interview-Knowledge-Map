<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [React Lifecycle analysis](#react-lifecycle-analysis)
  - [The usage advice of  Lifecycle methods in React V16](#the-usage-advice-of--lifecycle-methods-in-react-v16)
- [setState](#setstate)
- [Redux Source Code Analysis](#redux-source-code-analysis)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

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
  componentDidUnMount() {}
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