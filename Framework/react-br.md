<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [React Lifecycle analysis](#react-lifecycle-analysis)
  - [The usage advice of  Lifecycle methods in React V16](#the-usage-advice-of--lifecycle-methods-in-react-v16)
- [setState](#setstate)
- [Redux Source Code Analysis](#redux-source-code-analysis)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Análise do Ciclo de vida React

O Fiber foi introduzido no lançamento da V16. O mecanismo afeta alguma das chamadas do ciclo de vida até certo ponto e foi introduzida duas novas APIs para resolver problemas.

Nas versões anteriores, se eu tiver um componente composto complexo e então mudar o `state` na camada mais alta do componente, a pilha de chamada poderia ser grande.

![](https://yck-1254263422.cos.ap-shanghai.myqcloud.com/blog/2019-06-01-042529.png)

Se a pilha de chamada for muito longa, e complicadas operações estiverem no meio, isso pode causar um bloqueio a thread principal por um longe tempo, resultando em uma experiência ruim para o usuário. Fiber nasceu para resolver esse problema. 

Fiber é na essência uma pilha virtual de quadros, e o novo agendador espontaneamente agenda esses quadros de acordo
com sua prioridade, desse modo, mudando a renderização síncrona anterior para renderização assíncrona, e segmentando a atualização sem afetar a experiência.

![](https://yck-1254263422.cos.ap-shanghai.myqcloud.com/blog/2019-06-01-042530.png)

React tem seu proprio conjunto de lógica sobre como priorizar. Para coisas que requerem alta performance em tempo-real, tal como animação, que significa isso deve ser renderizado uma vez dentro de 16 ms para garantir que não está emperrando, React pausa o update a cada 16 ms (dentro de 16 ms) e retorna para continuar renderizando a animação.

Para renderização assíncrona, existe agora dois estagios de renderização: `reconciliation` e `commit`. O primeiro processo pode ser interrompido, enquanto o último não poder ser suspenso, e a interface será atualizada até isso ser completo.

**Reconciliation** etapa

- `componentWillMount`
- `componentWillReceiveProps`
- `shouldComponentUpdate`
- `componentWillUpdate`

**Commit** etapa

- `componentDidMount`
- `componentDidUpdate`
- `componentWillUnmount`

Pelo fato que a fase de `reconciliation` pode ser interrompida, as funções do ciclo de vida que executaram na fase de `reconciliation` podem ser chamadas multiplas vezes, o que pode causar vários bugs. Então para essas funções, exceto para `shouldComponentUpdate`, devemos evitar assim que possivel, e uma nova API está introduzida na V16 para resolver esse problema.

`getDerivedStateFromProps` é usado para substituir `componentWillReceiveProps`, do qual é chamado durando a inicialização e atualização

```js
class ExampleComponent extends React.Component {
  // Inicializa o state no construtor,
  // Ou com a propriedade initializer.
  state = {};

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.someMirroredValue !== nextProps.someValue) {
      return {
        derivedData: computeDerivedState(nextProps),
        someMirroredValue: nextProps.someValue
      };
    }

    // Retorna nulo para indicar que não há mudança no state.
    return null;
  }
}
```

`getSnapshotBeforeUpdate` é usado para substituir o `componentWillUpdate`, do qual é chamado depois do `update` mas antes do DOM atualizar para leitura o último dado do DOM.

## O conselho usado nos métodos do ciclo de vida no React V16

```js
class ExampleComponent extends React.Component {
  // Usado para iniciar o state
  constructor() {}
  // Usado para substituir o `componentWillReceiveProps`, do qual ira ser chamado quando inicializado e `update`
  // Porque a função é estática, você não pode acessar o `this`
  // Se você precisar comparar `prevProps`, você precisa manter ele separado no `state`
  static getDerivedStateFromProps(nextProps, prevState) {}
  // Determina se você precisa atualizar os componentes, usado na maioria das vezes para otimização de performance do componente
  shouldComponentUpdate(nextProps, nextState) {}
  // Chamado depois do componente ser montado
  // Pode requisitar ou subscrever nessa função
  componentDidMount() {}
  // Obter o último dado do DOM
  getSnapshotBeforeUpdate() {}
  // É sobre o componente ser destruido
  // Pode remover subscrições, timers, etc.
  componentWillUnmount() {}
  // Chamado depois do componente ser destruido
  componentDidUnMount() {}
  // Chamado depois da atualização do componente
  componentDidUpdate() {}
  // renderiza o componente
  render() {}
  // As seguintes funções não são recomendadas
  UNSAFE_componentWillMount() {}
  UNSAFE_componentWillUpdate(nextProps, nextState) {}
  UNSAFE_componentWillReceiveProps(nextProps) {}
}
```

# setState

`setState` é uma API que é frequentemente usada no React, mas ele tem alguns problemas que podem levar a erros. O centro das razões é que a API é assíncrona.

Primeiro, chamando `setState` não casa mudança imediata no `state`, e se você chamar multiplos `setState` de uma vez, o resultado pode não ser como o esperado.

```js
handle() {
  // Iniciado o `count` em 0
  console.log(this.state.count) // -> 0
  this.setState({ count: this.state.count + 1 })
  this.setState({ count: this.state.count + 1 })
  this.setState({ count: this.state.count + 1 })
  console.log(this.state.count) // -> 0
}
```

Primeiro, ambos os prints são 0, porque o `setState` é uma API assíncrona e irá apenas executar depois do código síncrono terminar sua execução. O motivo para o `setState` ser assíncrono é que `setState` pode causar repintar no DOM. Se a chamada repintar imediatamente depois da chamada, a chamada vai causar uma perca de performance desnecessária. Desenhando para ser assíncrono, você pode colocar multiplas chamadas dentro da fila e unificar os processos de atualização quando apropriado.

Segundo, apesar do `setState` ser chamado três vezes, o valor do `count` ainda é 1. Porque multiplas chamadas são fundidas em uma, o `state` só vai mudar quando a atualização terminar, e três chamadas são equivalente para o seguinte código.


```js
Object.assign(  
  {},
  { count: this.state.count + 1 },
  { count: this.state.count + 1 },
  { count: this.state.count + 1 },
)
```

De fato, você pode também chamar `setState` três vezes da seguinte maneira para fazer `count` 3

```js
handle() {
  this.setState((prevState) => ({ count: prevState.count + 1 }))
  this.setState((prevState) => ({ count: prevState.count + 1 }))
  this.setState((prevState) => ({ count: prevState.count + 1 }))
}
```

Se você quer acessar o `state` correto depois de cada chamada ao `setState`, você pode fazer isso com o seguinte código:


```js
handle() {
    this.setState((prevState) => ({ count: prevState.count + 1 }), () => {
        console.log(this.state)
    })
}
```
# Análise de código do Redux

Vamos dar uma olhada na função `combineReducers` primeiro.

```js
// passe um objeto
export default function combineReducers(reducers) {
 // capture as chaves desse objeto
  const reducerKeys = Object.keys(reducers)
  // reducers depois filtrados
  const finalReducers = {}
  // obtenha os valores correspondentes para cada chave
  // no ambiente de desenvolvimento, verifique se o valor é undefined
  // então coloque os valores do tipo de função dentro do finalReducers
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
  // obtenha as chaves dos reducers depois de filtrado
  const finalReducerKeys = Object.keys(finalReducers)
  
  // no ambiente de desenvolvimento verifique e salvo as chaves inesperadas em cache para alertas futuros
  let unexpectedKeyCache
  if (process.env.NODE_ENV !== 'production') {
    unexpectedKeyCache = {}
  }
    
  let shapeAssertionError
  try {
  // explicações de funções estão abaixo
    assertReducerShape(finalReducers)
  } catch (e) {
    shapeAssertionError = e
  }
// combineReducers retorna outra função, que é reduzido depois de fundido
// essa função retorna o state raiz
// também percena que um encerramento é usado aqui. A função usa algumas propriedades externas
  return function combination(state = {}, action) {
    if (shapeAssertionError) {
      throw shapeAssertionError
    }
    // explicações das funções estão abaixo
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
    // state depois das mudanças
    const nextState = {}
    for (let i = 0; i < finalReducerKeys.length; i++) {
    // obter a chave com index
      const key = finalReducerKeys[i]
      // obter a função de reducer correspondente com a chave
      const reducer = finalReducers[key]
      // a chave na arvore do state é a mesma chave no finalReducers
      // então a chave passada nos parametros para o combineReducers representa cada reducer assim como cada state
      const previousStateForKey = state[key]
      // execute as funções reducer para pegar o state correspondente a chave
      const nextStateForKey = reducer(previousStateForKey, action)
      // verifique o valor do state, reporte erros se ele não estiver undefined
      if (typeof nextStateForKey === 'undefined') {
        const errorMessage = getUndefinedStateErrorMessage(key, action)
        throw new Error(errorMessage)
      }
      // coloque o valor dentro do nextState
      nextState[key] = nextStateForKey
      // se o state mudaou
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    // enquanto o state mudar, retorne um novo state
    return hasChanged ? nextState : state
  }
}
```
`combineReducers` é simples e generico. Resumindo, ele aceita um objeto e retorna uma função depois processado os parâmetros. Essa função tem um objeto finalReducers que armazena os parametros processados. O objeto é então iterado, cada função reducer nela é executada, e o novo state é executado.

Vamos então olhar as duas funções usadas no combineReducers.

```js
// a primeira função usada para lançar os erros
function assertReducerShape(reducers) {
// iterar nós paramêtros no combineReducers
  Object.keys(reducers).forEach(key => {
    const reducer = reducers[key]
    // passar uma ação
    const initialState = reducer(undefined, { type: ActionTypes.INIT })
    // lança um erro se o state estiver undefined
    if (typeof initialState === 'undefined') {
      throw new Error(
        `Reducer "${key}" retorna undefined durante a inicialização. ` +
          `Se o state passado para o reducer for undefined, você deve ` +
          `explicitamente retornar o state inicial. O state inicial não deve ` +
          `ser undefined. Se você não quer definir um valor para esse reducer, ` +
          `você pode user null ao invés de undefined.`
      )
    }
    // processe novamente, considerando o caso que o usuário retornou um valor para ActionTypes.INIT no reducer
    // passa uma ação aleatória e verificar se o valor é undefined
    const type =
      '@@redux/PROBE_UNKNOWN_ACTION_' +
      Math.random()
        .toString(36)
        .substring(7)
        .split('')
        .join('.')
    if (typeof reducer(undefined, { type }) === 'undefined') {
      throw new Error(
        `Reducer "${key}" retorna undefined quando sondado com um tipo aleatório. ` +
          `Não tente manipular ${
            ActionTypes.INIT
          } ou outras ações no "redux/*" ` +
          `namespace.Eles são considerados privado. Ao invés, você deve retornar o ` +
          `state atual para qualquer action desconhecida, a menos que esteja undefined, ` +
          `nesse caso você deve retorna o state inicial, independemente do ` +
          `tipo da ação. O state inicial não deve ser undefined, mas pode ser null.`
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
  // aqui os reducers já estão no finalReducers
  const reducerKeys = Object.keys(reducers)
  const argumentName =
    action && action.type === ActionTypes.INIT
      ? 'preloadedState argumento passado para o createStore'
      : 'state anterior recebido pelo reducer'
  
  // se finalReducers estiver vázio
  if (reducerKeys.length === 0) {
    return (
      'Store não tem um reducer válido. Certifique-se de que um argumento foi passado ' +
      'para o combineReducers é um objeto do qual os valores são reducers.'
    )
  }
  // se o state passado não é um objeto
  if (!isPlainObject(inputState)) {
    return (
      `O ${argumentName} tem um tipo inesperado de "` +
      {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] +
      `". O argumento esperado deve ser um objeto com as seguintes ` +
      `chaves: "${reducerKeys.join('", "')}"`
    )
  }
  // compara as chaves do state a do finalReducers e filtra as chaves extras
  const unexpectedKeys = Object.keys(inputState).filter(
    key => !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]
  )

  unexpectedKeys.forEach(key => {
    unexpectedKeyCache[key] = true
  })

  if (action && action.type === ActionTypes.REPLACE) return

// se unexpectedKeys não estiver vázia
  if (unexpectedKeys.length > 0) {
    return (
      `Inesperada ${unexpectedKeys.length > 1 ? 'chaves' : 'chave'} ` +
      `"${unexpectedKeys.join('", "')}" encontrada em ${argumentName}. ` +
      `Esperado encontrar uma das chaves do reducer conhecida ao invés: ` +
      `"${reducerKeys.join('", "')}". Chaves inesperadas serão ignoradas.`
    )
  }
}
```

Vamos então dar uma olhada na função `compose`

```js
// Essa função é bem elegante. Ela nos permite empilhar diversas funções passando a
// referências da função. O termo é chamado de Higher-order function.
// chama funções a partir da direita para esquerda com funções reduce
// por exemplo, no objeto acima
compose(
    applyMiddleware(thunkMiddleware),
    window.devToolsExtension ? window.devToolsExtension() : f => f
)
// Com compose ele retorna dentro do applyMiddleware(thunkMiddleware)(window.devToolsExtension()())
// então você deveria retorna uma função quando window.devToolsExtension não for encontrada
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

Vamos então analisar pare do código da função `createStore`

```js
export default function createStore(reducer, preloadedState, enhancer) {
  // normalmente preloadedState é raramente usado
  // verificar o tipo, é o segundo parâmetro da função e não existe terceiro parâmetro, então troque as posições
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }
  // verifique se enhancer é uma função
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('É esperado que enhancer seja uma função.')
    }
    // se não existe um tipo error, primeiro execute o enhancer, então execute o createStore
    return enhancer(createStore)(reducer, preloadedState)
  }
  // verifique se o reducer é uma função
  if (typeof reducer !== 'function') {
    throw new Error('É esperado que o reducer seja uma função.')
  }
  // reducer atual
  let currentReducer = reducer
  // state atual
  let currentState = preloadedState
  // atual listener array
  let currentListeners = []
  // esse é um design muito importante. O proposito é que o currentListeners array seja invariante quando os listeners estiverem sendo interado
  // Nós podemos considerar se apenas um currentListeners existe. Se nós executarmos o subscribe novamente em alguma execução do subscribe, ou unsubscribe isso mudaria o tamanho do currentListeners array, então devemos ter um index erro
  let nextListeners = currentListeners
  // se o reducer está executando
  let isDispatching = false
  // se o currentListeners é o mesmo que o nextListeners, atribua o valor de volta
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }
  // ......
}
```

Vamos dar uma olhada na função `applyMiddleware`

Antes eu preciso introduzir um conceito chamado Currying. Currying é uma tecnologia para mudar uma função com multiplos parâmetros em uma série de funções com um único parâmetro.

```js
function add(a,b) { return a + b }   
add(1, 2) => 3
// para a função abaixo, nós usamos Currying igual a
function add(a) {
    return b => {
        return a + b
    }
}
add(1)(2) => 3
// você pode entender Currying como:
// nós armazenamos uma variável do lado de fora com um closure, e retornamos uma função que leva um parâmetro. Nessa função, nós usamos a variável armazenada e retornamos um valor.
```

```js
// essa função deve ser a parte mais obstrusa de todo código
// essa função retorna um função Curried
// assim sendo a função deve se chamada como: applyMiddleware(...middlewares)(createStore)(...args)
export default function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    // aqui nós executamos createStore, e passamos o parâmetro passado por último a função applyMiddleware
    const store = createStore(...args)
    let dispatch = () => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. ` +
          `Other middleware would not be applied to this dispatch.`
      )
    }
    let chain = []
    // todo middleware deve ter essas duas funções
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    // passar cada middleware nos middlewares para o middlewareAPI
    chain = middlewares.map(middleware => middleware(middlewareAPI))
    // assim como antes, chame cada middleware da esquerda para direita, e passo para o store.dispatch
    dispatch = compose(...chain)(store.dispatch)
    // essa parte é um pouco abstrata, nós iremos analisar juntos com o código do redux-thunk
    // createThunkMiddleware retorna uma função de 3-nível, o primeiro nível aceita um parâmetro middlewareAPI
    // o segundo nível aceita store.dispatch
    // o terceiro nível aceita parâmentros no dispatch
{function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => next => action => {
    // verifique se o parâmetro no dispatch é uma função
    if (typeof action === 'function') {
      // se assim for, passe esses parâmetros, até as acões não sejam mais uma função, então execute dispatch({type: 'XXX'})
      return action(dispatch, getState, extraArgument);
    }

    return next(action);
  };
}
const thunk = createThunkMiddleware();

export default thunk;}
// retorn o middleware-empowered dispatch e o resto das propriedades no store.
    return {
      ...store,
      dispatch
    }
  }
}
```

Agora nós passamos a parte difícil. Vamos olhar uma parte mais fácil.

```js 
// Não há muito para dizer aqui, retorne o state atual, mas nós não podemos chamar essa função quando o reducer estiver executando
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
// aceita uma função parâmetro
function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.')
    }
    // a maior parte desse design já foi coberto na descrição sobre nextListeners. Não há muito para falar sobre.
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

// retorne a função de cancelar a subscription
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
  // o prototype dispatch vai verificar se a ação é um objeto
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
    // perceba que você não pode chamar uma função dispatch nos reducers
    // isso causaria um estouro de pilha
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }
    // execute a função composta depois do combineReducers
    try {
      isDispatching = true
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }
    // itere nos currentListeners e execute as funções salvas no array de funções
    const listeners = (currentListeners = nextListeners)
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }

    return action
  }
  // no fim do createStore, invoce uma ação dispatch({ type: ActionTypes.INIT });
  // para inicializar o state
```