<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Análises do princípio NextTick](#nexttick-principle-analysis)
- [Análises do ciclo de vid](#lifecycle-analysis)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Análises do princípio NextTick

`nextTick` permiti-nos adiar a callback ser executada depois da próxima atualizada do ciclo do DOM, para obter a atualização.

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

A função do ciclo de vida é a função gancho que o componente vai disparar quando inicializar ou atualizar os dados.

![](https://yck-1254263422.cos.ap-shanghai.myqcloud.com/blog/2019-06-01-042532.png)

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

No próximo, a função montadora vai ser chamada

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
      watcher.before() // chama `beforeUpdate`
    }
    id = watcher.id
    has[id] = null
    watcher.run()
    // no dev build, verifca e para check and stop circular updates.
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

Existem duas funções do ciclo de vida que não são mencionada no diagrama acima, `activated` e `deactivated`, e apenas o componente `kee-alive` possui esses dois ciclos. Componente encapsulado com `keep-alive` não serão destruídos durante o switch, mas sera cacheado em memória e executado a função gancho `deactivated`, e executar a função `actived` depois de coincidir o cache e a renderização.

Finalmente, vamos olhar a função gancho usada para destruir o componente.

```js
Vue.prototype.$destroy = function() {
  // ...
  callHook(vm, 'beforeDestroy')
  vm._isBeingDestroyed = true
  // remove-se mesmo a partir do pai
  const parent = vm.$parent
  if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
    remove(parent.$children, vm)
  }
  // destroi watchers
  if (vm._watcher) {
    vm._watcher.teardown()
  }
  let i = vm._watchers.length
  while (i--) {
    vm._watchers[i].teardown()
  }
  // remove a referência a partir do dado ob
  // objeto congelados não devem ter um observador.
  if (vm._data.__ob__) {
    vm._data.__ob__.vmCount--
  }
  // chame o último gancho...
  vm._isDestroyed = true
  // invoque ganchos destruídos na árvore atualmente renderizada
  // dispare o gancho destruído
  callHook(vm, 'destroyed')
  // desligo todos os ouvintes da instância.
  vm.$off()
  // remove __vue__ reference
  // remove __vue__ reference
  if (vm.$el) {
    vm.$el.__vue__ = null
  }
  // lance uma referência circular (#6759)
  if (vm.$vnode) {
    vm.$vnode.parent = null
  }
}
```

A função `beforeDestroy` será chamada antes da operação de destruir ser desempenhada, e então uma série de operações de destruição são desempenhadas. Se existe um componente filho, eles serão destruidos recursivamente, e apenas quando todos os componente filhos são destruídos, o gancho `destroyed` do componente raíz será executado.
