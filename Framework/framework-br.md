<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [MVVM](#mvvm)
  - [Verificação suja](#dirty-checking)
  - [Sequestro de dados](#data-hijacking)
  - [Proxy vs. Obeject.defineProperty](#proxy-vs-obejectdefineproperty)
- [Princípios de rota](#routing-principle)
- [Virtual Dom](#virtual-dom)
  - [Por que Virtual Dom é preciso](#why-virtual-dom-is-needed)
  - [Intrudução ao algoritmo do Virtual Dom](#virtual-dom-algorithm-introduction)
  - [Implementação do algoritimo do Virtual Dom](#virtual-dom-algorithm-implementation)
    - [recursão da árvore](#recursion-of-the-tree)
    - [varificando mudança de propriedades](#checking-property-changes)
    - [Implementação do algoritimo para detectar mudanças de lista](#algorithm-implementation-for-detecting-list-changes)
    - [Iterando e marcando elementos filhos](#iterating-and-marking-child-elements)
    - [Diferença de renderização](#rendering-difference)
  - [Fim](#the-end)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# MVVM

MVVM consiste dos três seguintes conceitos

* View: Interface
* Model：Modelo de dados
* ViewModel：Como uma ponte responsável pela comunicação entre a View e o Model

Na época do JQuery, se você precisar atualizar a UI, você precisar obter o DOM correspondente e então atualizar a UI, então os dados e as regras de negócio estão fortemente acoplados com a página.

No MVVM, o UI é condizudo pelos dados. Uma vez que o dado mudou, a UI correspondente será atualizada. Se a UI mudar, o dado correspondente também ira mudar. Dessas forma, nos preocupamos apenas com o fluxo de dados no processamento do negócio sem lidar com a página diretamente. ViewModel apenas se preocupa com o processamento de dados e regras de negócio e não se preocupa como a View manipula os dados. Nesse caso, nós podemos separar a View da Model. Se qualquer uma das partes mudarem, isso não necessariamente precisa mudar na outra parte, e qualquer lógica reusável pode ser colocado na ViewModel, permitindo multiplas View reusarem esse ViewModel.

No MVVM, o núcleo é two-way binding de dados, tal como a verificação suja do Angular e sequestro de dados no Vue.

## Verificação Suja

Quando o evento especificado é disparado, ele irá entrar na verificação suja e chamar o laço `$digest` caminhando através de todos os dados observados para determinar se o valor atual é diferente do valor anterior. Se a mudança é detectada, irá chamar a função `$watch`, e então chamar o laço `$digest` novamente até que nenhuma mudança seja encontrada. O ciclo vai de pelo menos de duas vezes até dez vezes.

Embora a verificação suja ser ineficiente, ele consegue completar a tarefa sem se preocupar sobre como o dado mudou, mas o two-way binding no `Vue` é problemático. E a verificação suja consegue alcançar detecção de lotes de valores atualizados, e então unificar atualizações na UI, com grandeza reduzindo o número de operações no DOM. Assim sendo, ineficiência é relativa, e é assim que o benevolente vê o sábio e a sabedoria.

## Sequesto de dados

Vue internamente usa `Obeject.defineProperty()` para implementar o two-way binding, do qual permite você escutar por eventos de `set` e `get`.

```js
var data = { name: 'yck' }
observe(data)
let name = data.name // -> ontém o valor
data.name = 'yyy' // -> muda o valor

function observe(obj) {
    // juiz do tipo
  if (!obj || typeof obj !== 'object') {
    return
  }
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key])
  })
}

function defineReactive(obj, key, val) {
    // recurse as propriedades dos filhos
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

O código acima é uma simples implementação de como escutar os eventos `set` e `get` dos dados, mas isso não é o suficiente. Você também precisa adicionar um Publish/Subscribe para as propriedades quando apropriado.

```html
<div>
    {{name}}
</div>
```

::: v-pre
Nesse processo, análisando o código do modelo, como acima, quando encontrando `{{name}}`, adicione um publish/subscribe para a propriedade `name` 
:::

```js
// dissociar por Dep
class Dep {
  constructor() {
    this.subs = []
  }
  addSub(sub) {
    // Sub é uma instância do observador
    this.subs.push(sub)
  }
  notify() {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}
// Propriedade global, configura o observador com essa propriedade
Dep.target = null

function update(value) {
  document.querySelector('div').innerText = value
}

class Watcher {
  constructor(obj, key, cb) {
    // Aponte Dep.target para se mesmo
    // Então dispare o getter para a propriedade adicionar o ouvinte
    // Finalmente, set Dep.target como null
    Dep.target = this
    this.cb = cb
    this.obj = obj
    this.key = key
    this.value = obj[key]
    Dep.target = null
  }
  update() {
    // obtenha o novo valor
    this.value = this.obj[this.key]
    // update Dom with the update method
    // atualize o DOM com o método de atualizar
    this.cb(this.value)
  }
}
var data = { name: 'yck' }
observe(data)
// Simulando a ação disparada analisando o `{{name}}`
new Watcher(data, 'name', update)
// atualiza o DOM innerText
data.name = 'yyy' 
```

Next, improve on the `defineReactive` function.

```js
function defineReactive(obj, key, val) {
  // recurse as propriedades do filho
  observe(val)
  let dp = new Dep()
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      console.log('get value')
      // Adiciona o Watcher para inscrição
      if (Dep.target) {
        dp.addSub(Dep.target)
      }
      return val
    },
    set: function reactiveSetter(newVal) {
      console.log('change value')
      val = newVal
      // Execute o método de atualização do Watcher
      dp.notify()
    }
  })
}
```

A implementação acima é um simples two-way binding. A idéia central é manualmente disparar o getter das propriedades para adicionar o Publish/Subscribe.


## Proxy vs. Obeject.defineProperty

Apesar do `Obeject.defineProperty` ser capaz de implementar o two-way binding, ele ainda é falho.

* Ele consegue implementar apenas o sequestro de dados nas propriedades,
* ele não consegue escutar a mudança de dados para arrays

Apesar de Vue conseguir detectar mudanças em um array de dados, é na verdade um hack e é falho.

```js
const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)
// hack as seguintes funções
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
    // obter a função nativa
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
      // chama a função nativa
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
      // dispara uma atualização
    ob.dep.notify()
    return result
  })
})
```

Por outro lado, `Proxy` não tem o problema acima. Ele suporta nativamente a escuta para mudança no array e consegue interceptar o objeto completo diretamente, então Vue irá também substituir `Obeject.defineProperty` por `Proxy` na próxima grande versão.


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
p.a = 2 // vincula `value` para `2`
p.a // -> obtém 'a' = 2
```

# Princípio de rotas

As rotas no front-end é atualmente simples de implementar. A essência é escutar as mudanças na URL, então coincidir com as regras de roteamento, exibindo a página correspondente, e não precisa atualizar. Atualmente, existe apenas duas implementações de rotas usados pela página única.

- modo hash
- modo history


`www.test.com/#/` é a hash URL. Quando o valor depois do hash `#` muda, nenhuma request será enviada ao servidor. Você pode escutar as mudanças na URL através do evento `hashchange`, e então pular para a página correspondente.

![](https://yck-1254263422.cos.ap-shanghai.myqcloud.com/blog/2019-06-01-042507.png)

O modo history é uma nova funcionalidade do HTML5, do qual é muito mais lindo que o Hash URL. 

![](https://yck-1254263422.cos.ap-shanghai.myqcloud.com/blog/2019-06-01-042508.png)

# Virtual Dom

[source code](https://github.com/KieSun/My-wheels/tree/master/Virtual%20Dom)

## Por que Virtual Dom é preciso

Como nós sabemos, modificar o DOM é uma tarefa custosa. Poderiamos considerar usar objetos JS para simular objetos DOM, desde de que operando em objetos JS é economizado muito mais tempo que operar no DOM.

Por exemplo

```js
// Vamos assumir que esse array simula um ul do qual cotém 5 li's.
[1, 2, 3, 4, 5]
// usando esse para substituir a ul acima.
[1, 2, 5, 4]
```

A partir do exemplo acima, é aparente que a terceira li foi removida, e a quarta e quinta mudaram suas posições

Se a operação anterior for aplicada no DOM, nós temos o seguinte código:

```js
// removendo a terceira li
ul.childNodes[2].remove()
// trocando internamente as posições do quarto e quinto elemento
let fromNode = ul.childNodes[4]
let toNode = node.childNodes[3]
let cloneFromNode = fromNode.cloneNode(true)
let cloenToNode = toNode.cloneNode(true)
ul.replaceChild(cloneFromNode, toNode)
ul.replaceChild(cloenToNode, fromNode)
```

De fato, nas operações atuais, nós precisamos de um identificador para cada nó, como um index para verificar se os dois nós são idênticos. Esse é o motivo de ambos Vue e React sugerirem na documentação oficial usar identificadores `key` para os nós em uma lista para garantir eficiência.

Elementos do DOM não só podem ser simulados, mas eles também podem ser renderizados por objetos JS.

Abaixo está uma simples implementação de um objeto JS simulando um elemento DOM.

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
  // renderização
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
  // criando um elemento
  _createElement(tag, props, child, key) {
    // criando um elemento com tag
    let el = document.createElement(tag)
    // definindo propriedades em um elemento
    for (const key in props) {
      if (props.hasOwnProperty(key)) {
        const value = props[key]
        el.setAttribute(key, value)
      }
    }
    if (key) {
      el.setAttribute('key', key)
    }
    // adicionando nós filhos recursivamente
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

## Introdução ao algoritmo de Virtual Dom

O próximo passo depois de usar JS para implementar elementos DOM é detectar mudanças no objeto.

DOM é uma árvore de multi-ramifacações. Se nós compararmos a antiga e a nova árvore completamente, o tempo de complexidade seria O(n ^ 3), o que é simplesmente inaceitável. Assim sendo, o time do React otimizou esse algoritimo para alcançar uma complexidade O(n) para detectar as mudanças.

A chave para alcançar O(n) é apenas comparar os
nós no mesmo nível em vez de através dos níveis. Isso funciona porque no uso atual nós raramente movemos elementos DOM através dos níveis.

Nós então temos dois passos do algoritmo.

- Do topo para fundo, da esquerda para direita itera o objeto, primeira pesquisa de profundidade. Nesse passo adicionamos um índice para cada nó, renderizando as diferenças depois. 
- sempre que um nó tiver um elemento filho, nós verificamos se o elemento filho mudou.

## Implementação do algoritmo do Virtual Dom

### recursão da árvore

Primeiro vamos implementar o algoritmo de recursão da árvore. Antes de fazer isso, vamos considerar os diferentes casos de comparar dois nós.

1. novos nós `tagName` ou `key` são diferentes do antigo. Isso significa que o nó antigo é substituido, e nós não temos que recorrer no nó mais porque a subárvore foi completamente removida.
2. novos nós `tagName` e `key` (talvez inexistente) são a mesma do antigo. Nós começamos a recursar na subárvore.
3. não aparece novo nó. Não é preciso uma operação.

```js
import { StateEnums, isString, move } from './util'
import Element from './element'

export default function diff(oldDomTree, newDomTree) {
  // para gravar mudanças
  let pathchs = {}
  // o índice começa no 0
  dfs(oldDomTree, newDomTree, 0, pathchs)
  return pathchs
}

function dfs(oldNode, newNode, index, patches) {
  // para salvar as mudanças na subárvore
  let curPatches = []
  // três casos
  // 1. não é novo nó, não faça nada
  // 2. novos nós tagName e `key` são diferentes dos antigos, substitua
  // 3. novos nós tagName e key são o mesmo do antigo, comece a recursão
  if (!newNode) {
  } else if (newNode.tag === oldNode.tag && newNode.key === oldNode.key) {
    // verifique se as propriedades mudaram
    let props = diffProps(oldNode.props, newNode.props)
    if (props.length) curPatches.push({ type: StateEnums.ChangeProps, props })
    // recurse a subárvore
    diffChildren(oldNode.children, newNode.children, index, patches)
  } else {
    // diferentes nós, substitua
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

### verificando mudança das propriedades

Nós temos também três passos para verificar por mudanças nas propriedades

1. itere a lista de propriedades antiga, verifique se a propriedade ainda existe na nova lista de propriedade.
2. itere a nova lista de propriedades, verifique se existe mudanças para propriedades existente nas duas listas.
3. no segundo passo, também verifique se a propriedade não existe na lista de propriedades antiga.

```js
function diffProps(oldProps, newProps) {
  // três passos para checar as props
  // itere oldProps para remover propriedades
  // itere newProps para mudar os valores das propriedades
  // por último verifique se novas propriedades foram adicionadas
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

### Implementação do Algoritmo de detecção de mudanças na lista

Esse algoritmo é o núcle do Virtual Dom. Vamos descer a lista.
O passo principal é similar a verificação de mudanças nas propriedades. Também existe três passos.

1. itere a antiga lista de nós, verifique se ao nó ainda existe na nova lista.
2. itere a nova lista de nós, verifiquen se existe algum novo nó.
3. para o seguindo passo, também verifique se o nó moveu.

PS: esse algoritmo apenas manipula nós com `key`s.

```js
function listDiff(oldList, newList, index, patches) {
  // para fazer a iteração mais conveniente, primeiro pegue todas as chaves de ambas as listas
  let oldKeys = getKeys(oldList)
  let newKeys = getKeys(newList)
  let changes = []

  // para salvar o dado do nó depois das mudanças
  // existe varia vantagem de usar esse array para salvar
  // 1. nós conseguimos obter corretamente o index de nós deletados
  // 2. precisamos apenas opera no DOM uma vez para interexchanged os nós 
  // 3. precisamos apenas iterar para verificar na função `diffChildren`
  // nós não precisamos verificar de novo para nós existente nas duas listas
  let list = []
  oldList &&
    oldList.forEach(item => {
      let key = item.key
      if (isString(item)) {
        key = item
      }
      // verificando se o novo filho tem o nó atual
      // se não, então delete
      let index = newKeys.indexOf(key)
      if (index === -1) {
        list.push(null)
      } else list.push(key)
    })
  // array depois de alterações iterativas
  let length = list.length
  // uma vez deletando um array de elementos, o índice muda
  // removemos de trás para ter certeza que os índices permanecem o mesmo 
  for (let i = length - 1; i >= 0; i--) {
    // verifica se o elemento atual é null, se sim então significa que precisamos remover ele
    if (!list[i]) {
      list.splice(i, 1)
      changes.push({
        type: StateEnums.Remove,
        index: i
      })
    }
  }
  // itere a nova lista, verificando se um nó é adicionado ou movido
  // também adicione ou mova nós para `list`
  newList &&
    newList.forEach((item, i) => {
      let key = item.key
      if (isString(item)) {
        key = item
      }
      // verifique se o filho antigo tem o nó atual
      let index = list.indexOf(key)
      // se não então precisamos inserir
      if (index === -1 || key == null) {
        changes.push({
          type: StateEnums.Insert,
          node: item,
          index: i
        })
        list.splice(i, 0, key)
      } else {
        // encontrado o nó, precisamos verificar se ele precisar ser movido.
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

### Iterando e marcando elementos filho

Para essa função, existe duas principais funcionalidades.

1. verificando diferenças entre duas listas
2. marcando nós

No geral, a implementação das funcionalidades são simples.

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
  // marcando o ultimo nó iterado
  let last = null
  oldChild &&
    oldChild.forEach((item, i) => {
      let child = item && item.children
      if (child) {
        index =
          last && last.children ? index + last.children.length + 1 : index + 1
        let keyIndex = list.indexOf(item.key)
        let node = newChild[keyIndex]
        // só itera nós existentes em ambas as listas
        // não precisamos visitar os adicionados ou removidos 
        if (node) {
          dfs(item, node, index, patches)
        }
      } else index += 1
      last = item
    })
}
```

### Renderizando diferenças

A partir dos algoritmos anteriores, nós já obtemos as diferenças entre duas árvores. Depois de saber as diferenças, precisamos atualizar o DOM localmente. Vamos dar uma olhada no último passo do algoritmo do Virtual Dom.

Há duas funcionalidades principais para isso

1. Busca profunda na árvore e extrair os nós que precisam ser modificados.
2. Atualize o DOM local

Esse pedaço de código é bastante fácil de entender como um todo.

```js
let index = 0
export default function patch(node, patchs) {
  let changes = patchs[index]
  let childNodes = node && node.childNodes
  // essa busca profunda é a mesma do algoritmo de diff
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

## Fim

A implementação dos algoritimos do Virtual Dom contém os três seguintes passos:

1. Simular a criação de objetos DOM através do JS
2. Verifica a diferança entre dois objetos
2. Renderiza a diferença

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

Embora a implementação atual seja simples, isso não é definitivamente o suficiente para ententer os algoritmos do Virtual Dom.