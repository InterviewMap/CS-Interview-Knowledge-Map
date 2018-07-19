<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [NextTick principle analysis](#nexttick-principle-analysis)
- [Lifecycle analysis](#lifecycle-analysis)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# NextTick principle analysis

`nextTick` allows us to defer the callback to be executed after the next DOM update cycle, to get the updated DOM.

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

# Lifecycle analysis

The lifecycle function is the hook function that the component will trigger when it initializes or updates the data.

![](https://user-gold-cdn.xitu.io/2018/7/12/1648d9df78201f07?w=1200&h=3039&f=png&s=50021)

The following code will be called at initialization, and lifecycle is called by `callHook`

```js
Vue.prototype._init = function(options) {
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate') // can not get props data
    initInjections(vm) 
    initState(vm)
    initProvide(vm)
    callHook(vm, 'created')
}
```

It can be found that in the above code when `beforeCreate` is called, the data in `props` or `data` cannot be obtained because the initialization of these data is in `initState`.

Next, the mount function will be called

```js
export function mountComponent {
    callHook(vm, 'beforeMount')
    // ...
    if (vm.$vnode == null) {
        vm._isMounted = true
        callHook(vm, 'mounted')
    }
}
```

`beforeMount` will be executed before mounting the instance, then starts to create the VDOM and replace it with the real DOM, and finally call the `mounted` hook. And there’s a judgment logic here that if it is an external `new Vue({}) `,  `$vnode` doesn’t exist, so the `mounted` hook will be executed directly. If there are child components, they will be mounted recursively,  only when all the child components are mounted, the mount hooks of the root components will be executed. 

Next, it comes to the hook function that will be called when the data is updated.

```js
function flushSchedulerQueue() {
  // ...
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    if (watcher.before) {
      watcher.before() // call `beforeUpdate`
    }
    id = watcher.id
    has[id] = null
    watcher.run()
    // in dev build, check and stop circular updates.
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' +
            (watcher.user
              ? `in watcher with expression "${watcher.expression}"`
              : `in a component render function.`),
          watcher.vm
        )
        break
      }
    }
  }
  callUpdatedHooks(updatedQueue)
}

function callUpdatedHooks(queue) {
  let i = queue.length
  while (i--) {
    const watcher = queue[i]
    const vm = watcher.vm
    if (vm._watcher === watcher && vm._isMounted) {
      callHook(vm, 'updated')
    }
  }
}
```

There are two lifecycle functions that aren’t mentioned in the above diagram,  `activated` and `deactivated`, and only the `kee-alive` component has these two life cycles. Components wrapped with `keep-alive` will not be destroyed during the switch, but be cached in memory and execute the `deactivated` hook function, and execute the `actived` hook function after matching the cache and rendering.

Finally, let’s see the hook function that used to destroy the component.

```js
Vue.prototype.$destroy = function() {
  // ...
  callHook(vm, 'beforeDestroy')
  vm._isBeingDestroyed = true
  // remove self from parent
  const parent = vm.$parent
  if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
    remove(parent.$children, vm)
  }
  // teardown watchers
  if (vm._watcher) {
    vm._watcher.teardown()
  }
  let i = vm._watchers.length
  while (i--) {
    vm._watchers[i].teardown()
  }
  // remove reference from data ob
  // frozen object may not have observer.
  if (vm._data.__ob__) {
    vm._data.__ob__.vmCount--
  }
  // call the last hook...
  vm._isDestroyed = true
  // invoke destroy hooks on current rendered tree
  vm.__patch__(vm._vnode, null)
  // fire destroyed hook
  callHook(vm, 'destroyed')
  // turn off all instance listeners.
  vm.$off()
  // remove __vue__ reference
  if (vm.$el) {
    vm.$el.__vue__ = null
  }
  // release circular reference (#6759)
  if (vm.$vnode) {
    vm.$vnode.parent = null
  }
}
```

The `beforeDestroy` hook function will be called before the destroy operation is performed, and then a series of destruction operations are performed. If there are child components, they will be destroyed recursively, and only when all the child components are destroyed, the hook  `destroyed` of the root component will be executed.
