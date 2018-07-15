<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [NextTick principle analysis](#nexttick-principle-analysis)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# NextTick principle analysis

`nextTick` allows us to defer the callback to be executed after the next DOM update cycle，to get the updated DOM.

Before version 2.4, Vue used microtasks, but the priority of microtasks is too high, and in some cases, it may faster than event bubbling, but if you use macrotasks, there may be some issues of rendering performance. So in the new version, microtasks will be used by default, but macrotasks will be used in special cases, such as v-on.

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