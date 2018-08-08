<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Análises do princípio NextTick](#nexttick-principle-analysis)
- [Análises do ciclo de vid](#lifecycle-analysis)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Análises do princípio NextTick

`nextTick` permiti-nos adiar a callback ser executada depois da próxima atualizada do clico do DOM, para obter a atualização.

Antes da versão 2.4, Vue usou micro tarefas, mas prioridade das micro tarefas é bem alta, e em alguns casos, isso deve ser mais rápido que o evento de bubbling, mas se você usar macro tarefas, pode haver alguns problemas de performance na renderização. Então na nova versão, micro tarefas são usadas por padrão, mas macro tarefas serão usadas em casos especiais, como v-on.

Para implementar macro tarefas, você primeiro deve determinar se o `setImmediate` pode ser usado, se não, abaixe para `MessageChannel`. Se não novamente, use `setTimeout`.

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

`nextTick` também suporta o uso de `Promise`, do qual ira determinar se a `Promise` está implementada.

```js
export function nextTick(cb?: Function, ctx?: Object) {
  let _resolve
  // Consolide funções de callback dentro do de um array
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
    // Determina se a Promisse pode ser usada
    // Atribuir _resolve se possivel
    // Desta maneira a função callback pode ser chamada em forma de promise
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
```

# Análise do Ciclo de Vida

A função do ciclo de vida é a função gancho que o componente vai disparar quando inicilaizar ou atualizar os dados.

![](https://user-gold-cdn.xitu.io/2018/7/12/1648d9df78201f07?w=1200&h=3039&f=png&s=50021)

O seguinte código irá ser chamado na inicialização, e o ciclo de vida vai ser chamado pelo `callHook`

```js
Vue.prototype._init = function(options) {
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate') // não consegue receber dados das props
    initInjections(vm) 
    initState(vm)
    initProvide(vm)
    callHook(vm, 'created')
}
```

Ele pode ser encontrado no código acima quando `beforeCreate` é chamado, o dado no `props` ou `data` não pode ser obtido porque a inicialização desse dado está no `initState`.

No próximo, a função motadora vai ser chamada

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

`beforeMount` vai ser executado antes de montar uma instância, então comece a criar o VDOM e substituir ele com o DOM real, e finalmente chame o gancho `mounted`. E há um julgamente lógico aqui, que se ele for um `new Vue({}) ` externo, `$vnode` não existe, então o gancho `mounted` será executado diretamente. Se existe um componente filho, ele vai ser montado recursivamente, apenas quando todos os componentes filhos forem montados, o gancho de montar o componente raíz vai ser executado.

Próximo, isso vem para a função gancho que vai ser chamada quando os dados forem atualizados.

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
