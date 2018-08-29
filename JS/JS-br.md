<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Tipos incorporados](#built-in-types)
- [Conversão de tipo](#type-conversion)
  - [Convertendo para boleano](#converting-to-boolean)
  - [De objetos para tipos primitivos](#objects-to-primitive-types)
  - [Operadores aritméticos](#arithmetic-operators)
  - [`==` operador](#-operator)
  - [Operador de comparação](#comparison-operator)
- [Typeof](#typeof)
- [New](#new)
- [This](#this)
- [Instanceof](#instanceof)
- [Scope](#scope)
- [Closure](#closure)
- [Prototypes](#prototypes)
- [Herança](#inheritance)
- [Cópia rasa e profunda](#deep-and-shallow-copy)
  - [Cópia rasa](#shallow-copy)
  - [Deep copy](#deep-copy)
- [Modularização](#modularization)
  - [CommonJS](#commonjs)
  - [AMD](#amd)
- [A diferença entre call, apply, bind](#the-differences-between-call-apply-bind)
  - [simulação para implementar `call` e  `apply`](#simulation-to-implement--call-and--apply)
- [Implementação de Promise](#promise-implementation)
- [Implementação do Generator](#generator-implementation)
- [Debouncing](#debouncing)
- [Throttle](#throttle)
- [Map、FlatMap e Reduce](#mapflatmap-and-reduce)
- [Async e await](#async-and-await)
- [Proxy](#proxy)
- [Por que 0.1 + 0.2 != 0.3](#why-01--02--03)
- [Expressões regulares](#regular-expressions)
  - [Metacaracteres](#metacharacters)
  - [Flags](#flags)
  - [Character Shorthands](#character-shorthands)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Tipos incorparados
O JavaScript define sete tipos incorporados, dos quais podem ser divididos em duas categorias `Primitive Type` e `Object`.

Existem seis tipos primitivos: `null`, `undefined`, `boolean`, `number`, `string` e `symbol `.

Em JavaScript, não existe inteiros de verdade, todos os números são implementados em dupla-precisão 64-bit em formato binário IEEE 754. Quando nós usamos números de pontos flutuantes, iremos ter alguns efeitos colaterais. Aqui está um exemplo desses efeitos colaterais.

```js
0.1 + 0.2 == 0.3 // false
```

Para tipos primitivos, quando usamos literais para inicializar uma variável, ela tem apenas um valor literal, ela não tem um tipo. Isso será convertido para o tipo correspondente apenas quando necessário.

```js
let a = 111 // apenas literais, não um número
a.toString() // convertido para o objeto quando necessário
```

Objeto é um tipo de referência. Nós iremos encontrar problemas sobre cópia rasa e cópia profunda quando usando ele.

```js
let a = { name: 'FE' }
let b = a
b.name = 'EF'
console.log(a.name) // EF
```

# Conversão de Tipos

## Convertendo para Boleano

Quando a condição é julgada, que não seja `undefined`, `null`, `false`, `NaN`, `''`, `0`, `-0`, os esses valores, incluindo objetos, são convertidos para `true`.

## Objeto para tipos primitivos

Quando objetos são convertidos, `valueOf` e `toString` serão chamados, respectivamente em ordem. Esses dois métodos também são sobrescritos.

```js
let a = {
    valueOf() {
        return 0
    }
}
```

## Operadores Aritméticos

Apenas para adicão, se um dos parâmentros for uma string, o outro será convertido para uma string também. Para todas as outras operações, enquanto se um dos parâmetros for um número, o outro será convertido para um número.

Adicões invocaram três tipos de conversões de tipos: para timos primitivos, para números e string:

```js
1 + '1' // '11'
2 * '2' // 4
[1, 2] + [2, 1] // '1,22,1'
// [1, 2].toString() -> '1,2'
// [2, 1].toString() -> '2,1'
// '1,2' + '2,1' = '1,22,1'
```

Observe a expressão `'a' + + 'b'` para adição:

```js
'a' + + 'b' // -> "aNaN"
// uma vez que + 'b' -> NaN
// Você deve ter visto + '1' -> 1
```

## `==` operador

![](https://user-gold-cdn.xitu.io/2018/3/30/16275cb21f5b19d7?w=1630&h=1208&f=png&s=496784)

`toPrimitive` na figura acima é convertido objetos para tipos primitivos.

`===` é geralmente recomendado para comparar valores. Contudo, se você gostaria de checar o valor `null`, você pode usar `xx == null`.

Vamos dar uma olhada no exemplo `[] == ![] // -> true`. O processo seguinte explica por que a expressão é `true`:

```js
// [] convertendo para true, então pegue o oposto para false
[] == false
// com #8
[] == ToNumber(false)
[] == 0
// com #10
ToPrimitive([]) == 0
// [].toString() -> ''
'' == 0
// com #6
0 == 0 // -> true
```

## Operador de comparação

1. Se for um objeto, `toPrimitive` é usado.
2. Se for uma string, o caractere índice `unicode` é usado.

# Typeof

`typeof` também permite exibir o tipo correto de tipos primitivos, exceto `null`:
```js
typeof 1 // 'number'
typeof '1' // 'string'
typeof undefined // 'undefined'
typeof true // 'boolean'
typeof Symbol() // 'symbol'
typeof b // b não foi declarado, mas ainda pode ser exibido como undefined
```

Para objeto, `typeof` irá sempre exibir `object`, exceto **function**:
```js
typeof [] // 'object'
typeof {} // 'object'
typeof console.log // 'function'
```

Quanto a `null`, ele é sempre tratado como um `object` pelo `typeof`， apesar de ser um tipo primitivo, e esse é um bug que que existe a um bom tempo.
```js
typeof null // 'object'
```

Por que isso acontece? Porque a versão inicial do JS era baseada em sistemas de 32-bits, do qual armazenava a informação do tipo de variável em bits mais baixos para considerações de performance. Essas começam com objetos `000`, e todos os bits de `null` são zero, então isso é erroneamente tratado como um objeto. Apesar do código atual verificar se os tipos internos mudaram, esse bug foi passado para baixo.

Nós podemos usar `Object.prototype.toString.call(xx)` se quisermos pegar o tipo de dado correto da variável, e então obtemos uma string como `[object Type]`:

```js
let a
// Podemos declarar `undefined` da seguinte maneira
a === undefined
// mas a palavra não reservada `undefined` pode ser re assinada em versões antigas dos browsers
let undefined = 1
// vai dar errado declarar assim
// então nós podemos usar o seguinte método, com menos código
// ele sempre vai retornar `undefined`, tanto faz vir seguido de `void`
a === void 0
```

# New

1.   Crie um novo objeto
2.   Encadei o prototype
3.   Ligue o this
4.   Retorne um novo objeto

Os quatro passos acima vão acontecer no processo chamado `new`. Podemos também tentar implementar o `new ` nós mesmos:

```js
function create() {
  // Crie um objeto vázio
  let obj = new Object()
  // Obtenha o construtor
  let Ctor = [].shift.call(arguments)
  // Encadeie para o prototype
  obj.__proto__ = Ctor.prototype
  // Ligue o this, execute o construtor
  let result = Con.apply(obj, arguments)
  // Tenha certeza que o novo é um objeto
  return typeof result === 'object'? result : obj
}
```

Instância de um novo objeto são todas criadas com `new`, seja ele `function Foo()`, ou `let a = { b: 1 }` .

É recomendado criar os objetos usando notação literal (seja por questões de performance ou legibilidade), uma vez que é necessário um look-up para `Object` atravessar o escopo encadeado quando criando um objeto usando `new Object()`, mas você não precisa ter esse tipo de probelma quando usando literais.

```js
function Foo() {}
// Função são sintáticamente amigáveis
// Internamente é equivalente a new Function() 
let a = { b: 1 }
// Dentro desse lireal, `new Object()` também é usado
```

Para `new`, também precisamos prestar atenção ao operador precedente:

```js
function Foo() {
    return this;
}
Foo.getName = function () {
    console.log('1');
};
Foo.prototype.getName = function () {
    console.log('2');
};

new Foo.getName();   // -> 1
new Foo().getName(); // -> 2
```

![](https://user-gold-cdn.xitu.io/2018/4/9/162a9c56c838aa88?w=2100&h=540&f=png&s=127506)

Como você pode ver na imagem acima, `new Foo()` possui uma alta prioridade sobre `new Foo`, então podemos dividir a ordem de execução do código acima assim:

```js
new (Foo.getName());
(new Foo()).getName();
```

Para a primeira função, `Foo.getName()` é executado primeiro, então o resultado é 1;
Para mais tarte, ele primeiro executa `new Foo()` para criar uma instância, então encontrar a função `getName` no `Foo` via cadeia de prototype, então o resultado é 2.

# This

`This`, um conceito que é confuso para maioria das pessoas, atualmente não é difícil de entender enquanto você lembrar as seguintes regras:

```js
function foo() {
  console.log(this.a);
}
var a = 1;
foo();

var obj = {
  a: 2,
  foo: foo
};
obj.foo();

// Nas duas situações acima, `this` depende apenas do objeto ser chamado antes da função,
// e o segundo caso tem uma alta prioriade sobre o primeiro caso.

// o seguinte cenário tem uma alta prioridade, `this` só ficará ligado para c,
// e não existe uma maneira de mudar o que `this` está limitado

var c = new foo();
c.a = 3;
console.log(c.a);

// finalmente, usando `call`, `apply`, `bind` para mudar o que o `this` é obrigado,
// em outro cenário onde essa prioridade é apenas o segundo `new`
```

Entendendo sobre as várias situações acima, nós não vamos ser confundidos pelo `this` na maioria dos casos. Depois, vamos dar uma olhada no `this` nas arrow functions:

```js
function a() {
  return () => {
    return () => {
      console.log(this);
    };
  };
}
console.log(a()()());
```
Atualmente, as arrow function não tem o `this`, `this` na função acima apenas depende da primeira função externa que não é uma arrow function. Nesse caso, `this` é o padrão para `window` porque chamando `a` iguala a primeira condição nos códigos acima. Também, o que o `this` está ligado não ira ser mudado por qualquer código uma vez que o `this` estiver ligado em um contexto.


# Instanceof

O operador `instanceof` consegue checar corretamente o tipo dos objetos, porque o seu mecanismo interno encontra se o tipo do `prototype` pode ser encontrado na cadeia de prototype do objeto.

vamos tentar implementar ele:
```js
function instanceof(left, right) {
    // obtenha o type do `prototype`
    let prototype = right.prototype
    // obtenha o `prototype` do objeto
    left = left.__proto__
    // verifique se o tipo do objeto é igual ao prototype do tipo
    while (true) {
    	if (left === null)
    		return false
    	if (prototype === left)
    		return true
    	left = left.__proto__
    }
}
```

# Scope

Executar código JS deveria gerar execução do contexto, enquanto o código não é escrito na função, ele faz parte da execução do contexto global. O código na função vai gerar executação do contexto da função. Existe também uma execução do contexto do `eval`, do qual basicamente não é mais usado, então você pode pensar apenas em duas execuções de contexto.

O atributo `[[Scope]]` é gerado no primeiro estágio de geração de contexto, que é um ponteiro, corresponde a linked list do escopo, e o JS vai procurar variáveis através dessas linked list no contexto global.

Vamos olhar um exemplo common, `var`:

```js
b() // chama b
console.log(a) // undefined

var a = 'Hello world'

function b() {
	console.log('call b')
}
```

Ele sabe que funcões e variáveis são içadas acima em relação aos outputs. A explicação usual para o hoisting diz que as declarações são ‘movidas’ para o topo do código, e não existe nada de errado com isso e é fácil de todo mundo entender. Mas para um explicação mais precisa deveria ser algo como:

Haveria dois estágios quando a execução do contexto é gerada. O primeiro estágio é o estágio de criação(para ser mais epecífico, o passo de geração variáveis objeto), no qual o interpretador de JS deveria encontrar variáveis e funções que precisam ser içadas, e aloca memória para eles atecipadamente, então as funções deveriam ser guardadas na memória internamente, mas variáveis seriam apenas declaradas e assinadas para `undefined`, assim sendo, nós podemos usar elas adiante no segundo estágio (a execução do código no estágio)

No processo de içar, a mesma função deveria sobrescrever a última função, e funções tem alta prioridade sobre variáveis içadas.

```js
b() // chama segundo b

function b() {
	console.log('chama b primeiro')
}
function b() {
	console.log('chama b segundo')
}
var b = 'Hello world'
```

Usando `var` é mais provável error-prone, portanto ES6 introduziu uma nova palava-chave `let`. `let` tem uma característica importante que ela não pode ser usada antes de declarada, que conflita com o ditado comum que `let` não tem a habilidade de içar. De fato, `let` iça a declaracão, mas não é assinada, por causa da **temporal dead zone**.


# Closure

A definição de closure é simples: a função A retorna a função B, e a função b consegue acessar as variáveis da função A, portanto a função B é chamada de closure.

```js
function A() {
  let a = 1
  function B() {
      console.log(a)
  }
  return B
}
```

Se você estiver se perguntando por que a função B também consegue se referenciar as variáveis da função A enquanto a função A aparece a partir da stack de chamadas? Porque as variáveis na função A são guardadas na pilha nesse momento. O motor atual do JS consegue indentificar quais variáveis precisam ser salvas na heap e quais precisam ser salvas na stack por análise de fuga.

Uma pergunta classica de entrevista é usando closure em loops para resolver o problema de usar `var` para definir funções:

```js
for ( var i=1; i<=5; i++) {
    setTimeout( function timer() {
        console.log( i );
    }, i*1000 );
)
```

Em primeirio lugar, todos os loops vão ser executados completamente porque `setTimeout` é uma função assíncrona, e nesse momento `i` é 6, então isso vai exibir um bando de 6.

Existe três soluções, closure é a primeira:

```js
for (var i = 1; i <= 5; i++) {
  (function(j) {
    setTimeout(function timer() {
      console.log(j);
    }, j * 1000);
  })(i);
}
```

A segunda é fazer o uso do terceiro parâmetro do `setTimeout`:

```js
for ( var i=1; i<=5; i++) {
    setTimeout( function timer(j) {
        console.log( j );
    }, i*1000, i);
}
```

A terceira é definir o `i` usando `let`:

```js
for ( let i=1; i<=5; i++) {
    setTimeout( function timer() {
        console.log( i );
    }, i*1000 );
}
```

Para `let`, ele vai criar um escopo de block-level, do qual é equivalente a:

```js
{
    // Forma o escopo block-level
  let i = 0
  {
    let ii = i
    setTimeout( function timer() {
        console.log( i );
    }, i*1000 );
  }
  i++
  {
    let ii = i
  }
  i++
  {
    let ii = i
  }
  ...
}
```

# Prototypes

![](https://camo.githubusercontent.com/71cab2efcf6fb8401a2f0ef49443dd94bffc1373/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031382f332f31332f313632316538613962636230383732643f773d34383826683d35393026663d706e6726733d313531373232)

Cada função, além de `Function.prototype.bind()`, tem uma propriedade interna, detonado como `prototype`, do qual é uma referência para o prototype.

Cada objeto tem uma propriedade interna, denotada como `__proto__`, que é uma referência para o prototype do construtor que criou o objeto. Essa propriedade é atualmente referenciada ao `[[prototype]]`, mas o `[[prototype]]` é uma propriedade interna que nós não podemos acessar, então usamos o `__proto__` para acessar ele.

Objetos podem usar `__proto__` para procurar propriedade que não fazem parte do objeto, e `__proto__` conecta os objetos juntos para formar uma cadeida de prototype.

# Herança

No ES5, podemos resolve os problema de herança usando os seguintes passos:

```js
function Super() {}
Super.prototype.getNumber = function() {
  return 1
}

function Sub() {}
let s = new Sub()
Sub.prototype = Object.create(Super.prototype, {
  constructor: {
    value: Sub,
    enumerable: false,
    writable: true,
    configurable: true
  }
})
```

A idéia de herança implementada acima é para definir o `prototype` da classe filho como o `prototype` da classe pai.

No ES6, podemos facilmente resolver esse problema com a sintaxe `class`:

```js
class MyDate extends Date {
  test() {
    return this.getTime()
  }
}
let myDate = new MyDate()
myDate.test()
```

Contudo, ES6 não é compátivel com todos os navegadores, então usamos o Babel para compilar esser código.

Se chamar `myDate.test()` com o código compilado, você vai ficar surpreso de ver que existe um erro:

![](https://user-gold-cdn.xitu.io/2018/3/28/1626b1ecb39ab20d?w=678&h=120&f=png&s=32812)

Porque existem restrições no baixo nível do JS, se a instância não for construida pelo `Date`, ele não pode chamar funções no `Date`, que também explica a partir de outro aspecto que herança de `Class` no ES6 é diferente das heranças gerais na sintaxe do ES5.

Uma vez o baixo nível dos limites do JS que a instância deve ser construido pelo `Date`, nós podemos tentar outra maneira de implementar herança:

```js
function MyData() {

}
MyData.prototype.test = function () {
  return this.getTime()
}
let d = new Date()
Object.setPrototypeOf(d, MyData.prototype)
Object.setPrototypeOf(MyData.prototype, Date.prototype)
```

A implementação da idéia acima sobre herança: primeiro cria uma instância da classe do pai => muda o original `__proto__` de instância, conectado ao `prototype` da classe do filho => muda o `__proto__` da classe do filho `prototype` para o `prototype` da classe do pai.

A herança de implementação com o método acima pode perfeitamente resolve a restrição no baixo nível do JS.


# Cópia profunda e rasa

```js
let a = {
    age: 1
}
let b = a
a.age = 2
console.log(b.age) // 2
```

A partir do exemplo acima, nós podemos ver que se você assinar um objeto para uma variável, então os valores dos dois vão ter a mesma referência, um muda o outro muda adequadamente.

From the above example, we can see that if you assign an object to a variable,  then the values of both will be the same reference, one changes, the other changes accordingly.

Usually, we don't want such problem to appear during development, thus we can use shallow copy to solve this problem.

## Shallow copy

Firstly we can solve the problem by `Object.assign`:
```js
let a = {
    age: 1
}
let b = Object.assign({}, a)
a.age = 2
console.log(b.age) // 1
```

Certainly, we can use the spread operator (...) to solve the problem:
```js
let a = {
    age: 1
}
let b = {...a}
a.age = 2
console.log(b.age) // 1
```

Usually, shallow copy can solve most problems, but we need deep copy when encountering the following situation:
```js
let a = {
    age: 1,
    jobs: {
        first: 'FE'
    }
}
let b = {...a}
a.jobs.first = 'native'
console.log(b.jobs.first) // native
```
The shallow copy only solves the problem of the first layer. If the object contains objects, then it returns to the beginning topic that both values share the same reference. To solve this problem, we need to introduce deep copy.

## Deep copy

The problem can usually be solved by  `JSON.parse(JSON.stringify(object))`

```js
let a = {
    age: 1,
    jobs: {
        first: 'FE'
    }
}
let b = JSON.parse(JSON.stringify(a))
a.jobs.first = 'native'
console.log(b.jobs.first) // FE
```

But this method also has its limits:
* ignore `undefined`
* unable to serialize function
* unable to resolve circular references in an object
```js
let obj = {
  a: 1,
  b: {
    c: 2,
    d: 3,
  },
}
obj.c = obj.b
obj.e = obj.a
obj.b.c = obj.c
obj.b.d = obj.b
obj.b.e = obj.b.c
let newObj = JSON.parse(JSON.stringify(obj))
console.log(newObj)
```

If an object is circularly referenced like the above example, you’ll find the method `JSON.parse(JSON.stringify(object))`  can’t make a deep copy of this object:

![](https://user-gold-cdn.xitu.io/2018/3/28/1626b1ec2d3f9e41?w=840&h=100&f=png&s=30123)

When dealing with function or `undefined`,  the object can also not be serialized properly.
```js
let a = {
    age: undefined,
    jobs: function() {},
    name: 'yck'
}
let b = JSON.parse(JSON.stringify(a))
console.log(b) // {name: "yck"}
```

In above case, you can see that the method ignores function and `undefined`.

Most often complex data can be serialized, so this method can solve most problems, and as a built-in function, it has the fastest performance when dealing with deep copy. Certainly, you can use [the deep copy function of `lodash` ](https://lodash.com/docs#cloneDeep) when your data contains the above three cases.

If the object you want to copy contains a built-in type but doesn’t contain a function, you can use `MessageChannel`
```js
function structuralClone(obj) {
  return new Promise(resolve => {
    const {port1, port2} = new MessageChannel();
    port2.onmessage = ev => resolve(ev.data);
    port1.postMessage(obj);
  });
}

var obj = {a: 1, b: {
    c: b
}}
// pay attention that this method is asynchronous
// it can handle `undefined` and circular reference object
const clone = await structuralClone(obj);
```

# Modularization

With Babel, we can directly use ES6's modularization:

```js
// file a.js
export function a() {}
export function b() {}
// file b.js
export default function() {}

import {a, b} from './a.js'
import XXX from './b.js'
```

## CommonJS

`CommonJS` is Node's unique feature. `Browserify` is needed for `CommonJS` to be used in browsers.

```js
// a.js
module.exports = {
    a: 1
}
// or
exports.a = 1

// b.js
var module = require('./a.js')
module.a // -> log 1
```

In the code above, `module.exports` and `exports` can cause confusions. Let us take a peek at the internal implementations:

```js
var module = require('./a.js')
module.a
// this is actually a wrapper of a function to be executed immediately so that we don't mess up the global variables.
// what's important here is that module is a Node only variable.
module.exports = {
    a: 1
}
// basic implementation
var module = {
  exports: {} // exports is an empty object
}
// This is why exports and module.exports have similar usage.
var exports = module.exports
var load = function (module) {
    // to be exported
    var a = 1
    module.exports = a
    return module.exports
};
```

Let's then talk about `module.exports` and `exports`, which have similar usage, but one cannot assign a value to `exports` directly. The assignment would be a no-op.

The differences between the modularizations in `CommonJS` and in ES6 are:

- The former supports dynamic imports, which is `require(${path}/xx.js)`; the latter doesn't support it yet, but there have been proposals.
- The former uses synchronous imports. Since it is used on the server end and files are local, it doesn't matter much even if the synchronous imports block the main thread. The latter uses asynchronous imports, because it is used in browsers in which file downloads are needed. Rendering process would be affected much if asynchronous import was used.
- The former copies the values when exporting. Even if the values exported change, the values imported will not change. Therefore, if values shall be updated, another import needs to happen. However, the latter uses realtime bindings, the values imported and exported point to the same memory addresses, so the imported values change along with the exported ones.
- In execution the latter is compiled to `require/exports`.

## AMD

AMD is brought forward by `RequireJS`.

```js
// AMD
define(['./a', './b'], function(a, b) {
    a.do()
    b.do()
})
define(function(require, exports, module) {
    var a = require('./a')  
    a.doSomething()   
    var b = require('./b')
    b.doSomething()
})
```

# The differences between call, apply, bind

Firstly, let’s tell the difference between the former two.

Both `call` and `apply` are used to change what `this` refers to. Their role is the same, but the way to pass parameters is different.

In addition to the first parameter,  `call` can accept an argument list, while `apply` accepts a single array of arguments.

```js
let a = {
  value: 1
}
function getValue(name, age) {
  console.log(name)
  console.log(age)
  console.log(this.value)
}
getValue.call(a, 'yck', '24')
getValue.apply(a, ['yck', '24'])
```

## simulation to implement  `call` and  `apply`

We can consider how to implement them from the following rules:

* If the first parameter isn’t passed, then the first parameter will default to  `window`;
* Change what `this` refers to, which makes new object capable of executing the function. Then let’s think like this: add a function to a new object and then delete it after the execution.

```js
Function.prototype.myCall = function (context) {
  var context = context || window
  // Add an property to the `context`
  // getValue.call(a, 'yck', '24') => a.fn = getValue
  context.fn = this
  // take out the rest parameters of `context`
  var args = [...arguments].slice(1)
  // getValue.call(a, 'yck', '24') => a.fn('yck', '24')
  var result = context.fn(...args)
  // delete fn
  delete context.fn
  return result
}
```

The above is the main idea of simulating  `call`, and the implementation of  `apply` is similar.

```js
Function.prototype.myApply = function (context) {
  var context = context || window
  context.fn = this

  var result
  // There's a need to determine whether to store the second parameter
  // If the second parameter exists, spread it
  if (arguments[1]) {
    result = context.fn(...arguments[1])
  } else {
    result = context.fn()
  }

  delete context.fn
  return result
}
```

The role of `bind` is the same as the other two, except that it returns a function. And we can implement currying with `bind`

let’s simulate `bind`:

```js
Function.prototype.myBind = function (context) {
  if (typeof this !== 'function') {
    throw new TypeError('Error')
  }
  var _this = this
  var args = [...arguments].slice(1)
  // return a function
  return function F() {
    // we can use `new F()` because it returns a function, so we need to determine
    if (this instanceof F) {
      return new _this(...args, ...arguments)
    }
    return _this.apply(context, args.concat(...arguments))
  }
}
```

# Promise implementation

`Promise` is a new syntax introduced by ES6, which resolves the problem of callback hell.

Promise can be seen as a state machine and it's initial state is `pending`. We can change the state to `resolved` or `rejected` by using the `resolve` and `reject` functions. Once the state is changed, it cannot be changed again.

The function `then` returns a Promise instance, which is a new instance instead of the previous one. And that's because the Promise specification states that in addition to the `pending` state, other states cannot be changed, and multiple calls of function `then`  will be meaningless if the same instance is returned.

For `then`, it can essentially be seen as `flatMap`:

```js
// three states
const PENDING = 'pending';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';
// promise accepts a function argument that will execute immediately.
function MyPromise(fn) {
  let _this = this;
  _this.currentState = PENDING;
  _this.value = undefined;
  // To save the callback of `then`，only cached when the state of the promise is pending,
  //  at most one will be cached in every instance
  _this.resolvedCallbacks = [];
  _this.rejectedCallbacks = [];

  _this.resolve = function(value) {
    // execute asynchronously to guarantee the execution order
    setTimeout(() => {
      if (value instanceof MyPromise) {
        // if value is a Promise, execute recursively
        return value.then(_this.resolve, _this.reject)
      }
      if (_this.currentState === PENDING) {
        _this.currentState = RESOLVED;
        _this.value = value;
        _this.resolvedCallbacks.forEach(cb => cb());
      }
    })
  }

  _this.reject = function(reason) {
    // execute asynchronously to guarantee the execution order
    setTimeout(() => {
      if (_this.currentState === PENDING) {
        _this.currentState = REJECTED;
        _this.value = reason;
        _this.rejectedCallbacks.forEach(cb => cb());
      }
    })
  }

  // to solve the following problem
  // `new Promise(() => throw Error('error))`
  try {
    fn(_this.resolve, _this.reject);
  } catch (e) {
    _this.reject(e);
  }
}

MyPromise.prototype.then = function(onResolved, onRejected) {
  const self = this;
  // specification 2.2.7， `then` must return a new promise
  let promise2;
  // specification 2.2, both `onResolved` and `onRejected` are optional arguments
  // it should be ignored if `onResolved` or `onRjected` is not a function,
  // which implements the penetrate pass of it's value
  // `Promise.resolve(4).then().then((value) => console.log(value))`
  onResolved = typeof onResolved === 'function' ? onResolved : v => v;
  onRejected = typeof onRejected === 'function' ? onRejected : r => throw r;

  if (self.currentState === RESOLVED) {
    return (promise2 = new MyPromise((resolve, reject) => {
      // specification 2.2.4, wrap them with `setTimeout`,
      // in order to insure that `onFulfilled` and `onRjected` execute asynchronously
      setTimeout(() => {
        try {
          let x = onResolved(self.value);
          resolutionProcedure(promise2, x, resolve, reject);
        } catch (reason) {
          reject(reason);
        }
      });
    }));
  }

  if (self.currentState === REJECTED) {
    return (promise2 = new MyPromise((resolve, reject) => {
      // execute `onRejected` asynchronously
      setTimeout(() => {
        try {
          let x = onRejected(self.value);
          resolutionProcedure(promise2, x, resolve, reject);
        } catch (reason) {
          reject(reason);
        }
      });
    }))
  }

  if (self.currentState === PENDING) {
    return (promise2 = new MyPromise((resolve, reject) => {
      self.resolvedCallbacks.push(() => {
         // Considering that it may throw error, wrap them with `try/catch`
        try {
          let x = onResolved(self.value);
          resolutionProcedure(promise2, x, resolve, reject);
        } catch (r) {
          reject(r);
        }
      });

      self.rejectedCallbacks.push(() => {
        try {
          let x = onRejected(self.value);
          resolutionProcedure(promise2, x, resolve, reject);
        } catch (r) {
          reject(r);
        }
      })
    }))
  }
}

// specification 2.3
function resolutionProcedure(promise2, x, resolve, reject) {
  // specification 2.3.1，`x` and  `promise2` can't refer to the same object,
  // avoiding the circular references
  if (promise2 === x) {
    return reject(new TypeError('Error'));
  }

  // specification 2.3.2, if `x` is a Promise and the state is `pending`,
  // the promise must remain, If not, it should execute.
  if (x instanceof MyPromise) {
    if (x.currentState === PENDING) {
      // call the function `resolutionProcedure` again to
      // confirm the type of the argument that x resolves
      // If it's a primitive type, it will be resolved again to
      // pass the value to next `then`.
      x.then((value) => {
        resolutionProcedure(promise2, value, resolve, reject);
      }, reject)
    } else {
      x.then(resolve, reject);
    }
    return;
  }

  // specification 2.3.3.3.3
  // if both `reject` and `resolve` are executed, the first successful
  // execution takes precedence, and any further executions are ignored
  let called = false;
  // specification 2.3.3, determine whether `x` is an object or a function
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    // specification 2.3.3.2, if can't get `then`, execute the `reject`
    try {
      // specification 2.3.3.1
      let then = x.then;
      // if `then` is a function, call the `x.then`
      if (typeof then === 'function') {
        // specification 2.3.3.3
        then.call(x, y => {
          if (called) return;
          called = true;
          // specification 2.3.3.3.1
          resolutionProcedure(promise2, y, resolve, reject);
        }, e => {
          if (called) return;
          called = true;
          reject(e);
        });
      } else {
        // specification 2.3.3.4
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    // specification 2.3.4, `x` belongs to primitive data type
    resolve(x);
  }
}
```

The above codes, which is implemented based on the Promise / A+ specification,  can pass the full test of  `promises-aplus-tests`

![](https://user-gold-cdn.xitu.io/2018/3/29/162715e8e37e689d?w=1164&h=636&f=png&s=300285)

# Generator Implementation

Generator is an added syntactic feature in ES6. Similar to `Promise`, it can be used for asynchronous programming.

```js
// * means this is a Generator function
// yield within the block can be used to pause the execution
// next can resume execution
function* test() {
  let a = 1 + 2;
  yield 2;
  yield 3;
}
let b = test();
console.log(b.next()); // >  { value: 2, done: false }
console.log(b.next()); // >  { value: 3, done: false }
console.log(b.next()); // >  { value: undefined, done: true }
```

As we can tell from the above code, a function with a `*` would have the `next` function execution. In other words, the execution of the function returns an object. Every call to the `next` function can resume executing the paused code. A simple implementation of the Generator function is shown below:

```js
// cb is the compiled 'test' function
function generator(cb) {
  return (function() {
    var object = {
      next: 0,
      stop: function() {}
    };

    return {
      next: function() {
        var ret = cb(object);
        if (ret === undefined) return { value: undefined, done: true };
        return {
          value: ret,
          done: false
        };
      }
    };
  })();
}
// After babel's compilation, 'test' function turns into this:
function test() {
  var a;
  return generator(function(_context) {
    while (1) {
      switch ((_context.prev = _context.next)) {
        // yield splits the code into several blocks
        // every 'next' call executes one block of clode
        // and indicates the next block to execute
        case 0:
          a = 1 + 2;
          _context.next = 4;
          return 2;
        case 4:
          _context.next = 6;
          return 3;
        // execution complete
        case 6:
        case "end":
          return _context.stop();
      }
    }
  });
}
```

# Debouncing

Have you ever encountered this problem in your development: how to do a complex computation in a scrolling event or to prevent the "second accidental click" on a button?

These requirements can be achieved with function debouncing. Especially for the first one, if complex computations are carried out in frequent event callbacks, there's a large chance that the page becomes laggy. It's better to combine multiple computations into a single one, and only operate at particular time. Since there are many libraries that implement debouncing, we won't build our own here and will just take underscore's source code to explain debouncing:

```js
/**
 * underscore's debouncing function. When the callback function is called in series, func will only execute when the idel time is larger or equal to `wait`.
 *
 * @param  {function} func        callback function
 * @param  {number}   wait        length of waiting intervals
 * @param  {boolean}  immediate   when set to true, func is executed immediately
 * @return {function}             returns the function to be called by the client
 */
_.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      // compare now to the last timestamp
      var last = _.now() - timestamp;
      // if the current time interval is smaller than the set interval and larger than 0, then reset the timer.
      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        // otherwise it's time to execute the callback function
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      // obtain the timestamp
      timestamp = _.now();
      // if the timer doesn't exist then execute the function immediately
      var callNow = immediate && !timeout;
      // if the timer doesn't exist then create one
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        // if the immediate execution is needed, use apply to start the function
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };
```

The complete function implementation is not too difficult. Let's summarize here.

- For the implementation of protecting against accidental clicks: as long as I start a timer and the timer is there, no matter how you click the button, the callback function won't be executed. Whenever the timer ends and is set to `null`, another click is allowed.
- For the implementation of a delayed function execution: every call to the debouncing function will trigger an evaluation of time interval between the current call and the last one. If the interval is less than the required, another timer will be created, and the delay is set to the set interval minus the previous elapsed time. When the time's up, the corresponding callback function is executed.

# Throttle

`Debounce` and `Throttle` are different in nature. `Debounce` is to turn multiple executions into one last execution, and `Throttle` is to turn multiple executions into executions at regular intervals.

```js
// The first two parameters with debounce are the same function
// options: You can pass two properties
// trailing: Last time does not execute
// leading: First time does not execute
// The two properties cannot coexist, otherwise the function cannot be executed
_.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    // Previous timestamp
    var previous = 0;
    // Set empty if options is not passed
    if (!options) options = {};
    // Timer callback function
    var later = function() {
        // If you set `leading`, then set `previous` to zero
        // The first `if` statement of the following function is used
        previous = options.leading === false ? 0 : _.now();
        // The first is prevented memory leaks and the second is judged the following timers when setting `timeout` to null
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function() {
        // Get current timestamp
        var now = _.now();
        // It must be true when it entering firstly
        // If you do not need to execute the function firstly
        // Set the last timestamp to current
        // Then it will be greater than 0 when the remaining time is calculated next
        if (!previous && options.leading === false)
            previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        // This condition will only be entered if it set `trailing`
        // This condition will be entered firstly if it not set `leading`
        // Another point, you may think that this condition will not be entered if you turn on the timer
        // In fact, it will still enter because the timer delay is not accurate
        // It is very likely that you set 2 seconds, but it needs 2.2 seconds to trigger, then this time will enter this condition
        if (remaining <= 0 || remaining > wait) {
            // Clean up if there exist a timer otherwise it call twice callback
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            // Judgment whether timer and trailing are set
            // And you can't set leading and trailing at the same time
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
};
```

# Map、FlatMap and Reduce

The effect of `Map` is to generate a new array, iterate over the original array, take each element out to do some transformation, and then `append` to the new array.

```js
[1, 2, 3].map((v) => v + 1)
// -> [2, 3, 4]
```

`Map` has three parameters, namely the current index element, the index, the original array.

```js
['1','2','3'].map(parseInt)
//  parseInt('1', 0) -> 1
//  parseInt('2', 1) -> NaN
//  parseInt('3', 2) -> NaN
```

The effect of `FlatMap` is almost the same with a `Map`, but the original array will be flatten for multidimensional arrays. You can think of `FlatMap` as a `map` and a `flatten`, which is currently not supported in browsers.

```js
[1, [2], 3].flatMap((v) => v + 1)
// -> [2, 3, 4]
```

You can achieve this when you want to completely reduce the dimensions of a multidimensional array:

```js
const flattenDeep = (arr) => Array.isArray(arr)
  ? arr.reduce( (a, b) => [...a, ...flattenDeep(b)] , [])
  : [arr]

flattenDeep([1, [[2], [3, [4]], 5]])
```

The effect of `Reduce` is to combine the values in the array and get a final value:

```js
function a() {
    console.log(1);
}

function b() {
    console.log(2);
}

[a, b].reduce((a, b) => a(b()))
// -> 2 1
```


# Async and await

`async` function will return a `Promise`:

```js
async function test() {
  return "1";
}
console.log(test()); // -> Promise {<resolved>: "1"}
```

You can think of `async` as wrapping a function using `Promise.resolve()`.

`await` can only be used in `async` functions:

```js
function sleep() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('finish')
      resolve("sleep");
    }, 2000);
  });
}
async function test() {
  let value = await sleep();
  console.log("object");
}
test()
```

The above code will print `finish` before printing `object`. Because `await` waits for the `sleep` function `resolve`, even if the synchronization code is followed, it is not executed before the asynchronous code is executed.

The advantage of `async` and `await` compared to the direct use of `Promise` lies in handling the call chain of `then`, which can produce clear and accurate code. The downside is that misuse of `await` can cause performance problems because `await` blocks the code. Perhaps the asynchronous code does not depend on the former, but it still needs to wait for the former to complete, causing the code to lose concurrency.

Let's look at a code that uses `await`:

```js
var a = 0
var b = async () => {
  a = a + await 10
  console.log('2', a) // -> '2' 10
  a = (await 10) + a
  console.log('3', a) // -> '3' 20
}
b()
a++
console.log('1', a) // -> '1' 1
```

You may have doubts about the above code, here we explain the principle:

- First the function `b` is executed. The variable `a` is still 0 before execution  `await 10`, Because the `Generators` are implemented inside `await` and  `Generators` will keep things in the stack, so at this time `a = 0` is saved
- Because `await` is an asynchronous operation, `console.log('1', a)` will be executed first.
- At this point, the synchronous code is completed and asynchronous code is started. The saved value is used. At this time, `a = 10`
- Then comes the usual code execution

# Proxy

Proxy is a new feature since ES6. It can be used to define operations in objects:

```js
let p = new Proxy(target, handler);
// `target` represents the object of need to add the proxy
// `handler` customizes operations in the object
```

Proxy can be handy for implementation of data binding and listening:

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

# Why 0.1 + 0.2 != 0.3

Because JS uses the IEEE 754 double-precision version (64-bit). Every language that uses this standard has this problem.

As we know, computers use binaries to represent decimals, so `0.1` in binary is represented as

```js
// (0011) represents cycle
0.1 = 2^-4 * 1.10011(0011)
```

How do we come to this binary number? We can try computing it as below:

![](https://user-gold-cdn.xitu.io/2018/4/26/162ffcb7fc1ca5a9?w=800&h=1300&f=png&s=83139)

Binary computations in float numbers are different from those in integers. For multiplications, only the float bits are computed, while the integer bits are used for the binaries for each bit. Then the first bit is used as the most significant bit. Therefore we get `0.1 = 2^-4 * 1.10011(0011)`.

`0.2` is similar. We just need to get rid of the first multiplcation and get `0.2 = 2^-3 * 1.10011(0011)`.

Back to the double float for IEEE 754 standard. Among the 64 bits, one bit is used for signing, 11 used for integer bits, and the rest 52 bits are floats. Since `0.1` and `0.2` are infinitely cycling binaries, the last bit of the floats needs to indicate whether to round (same as rounding in decimals).

After rounding, `2^-4 * 1.10011...001` becomes `2^-4 * 1.10011(0011 * 12 times)010`. After adding these two binaries we get `2^-2 * 1.0011(0011 * 11 times)0100`, which is `0.30000000000000004` in decimals.

The native solution to this problem is shown below:

```js
parseFloat((0.1 + 0.2).toFixed(10))
```

# Regular Expressions

## Metacharacters

| Metacharacter |                            Effect                            |
| :-----------: | :----------------------------------------------------------: |
|       .       |     matches any character except line terminators: \n, \r, \u2028 or \u2029.    |
|      []       | matches anything within the brackets. For example, [0-9] can match any number |
|       ^       | ^9 means matching anything that starts with '9'; [`^`9] means not matching characters except '9' in between brackets |
|    {1, 2}     |               matches 1 or 2 digit characters                |
|     (yck)     |            only matches strings the same as 'yck'            |
|      \|       |          matches any character before and after \|           |
|       \       |                       escape character                       |
|       *       |       matches the preceding expression 0 or more times       |
|       +       |       matches the preceding expression 1 or more times       |
|       ?       |             the character before '?' is optional             |

## Flags

| Flag | Effect           |
| :------: | :--------------: |
| i        | case-insensitive search |
| g        | matches globally |
| m        | multiline        |

## Character Shorthands

| shorthand |            Effect            |
| :--: | :------------------------: |
|  \w  | alphanumeric characters, underline character |
|  \W  |         the opposite of the above         |
|  \s  |      any blank character      |
|  \S  |         the opposite of the above         |
|  \d  |          numbers          |
|  \D  |         the opposite of the above         |
|  \b  |    start or end of a word    |
|  \B  |         the opposite of the above         |

