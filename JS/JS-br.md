<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Tipos incorporados](#tipos-incorporados)
- [Conversão de Tipos](#conversão-de-tipos)
  - [Convertendo para boleano](#convertendo-para-boleano)
  - [De objetos para tipos primitivos](#de-objetos-para-tipos-primitivos)
  - [Operadores aritméticos](#operadores-aritméticos)
  - [`==` operador](#-operador)
  - [Operador de comparação](#operador-de-comparação)
- [Typeof](#typeof)
- [New](#new)
- [This](#this)
- [Instanceof](#instanceof)
- [Scope](#scope)
- [Closure](#closure)
- [Prototypes](#prototypes)
- [Herança](#herança)
- [Cópia rasa e profunda](#cópia-rasa-e-profunda)
  - [Cópia rasa](#cópia-rasa)
  - [Cópia profunda](#cópia-profunda)
- [Modularização](#modularização)
  - [CommonJS](#commonjs)
  - [AMD](#amd)
- [A diferença entre call apply bind](#a-diferença-entre-call-apply-bind)
  - [simulação para implementar `call` e `apply`](#simulação-para-implementar--call-e--apply)
- [Implementação de Promise](#implementação-de-promise)
- [Implementação do Generator](#implementação-do-generator)
- [Debouncing](#debouncing)
- [Throttle](#throttle)
- [Map、FlatMap e Reduce](#mapflatmap-e-reduce)
- [Async e await](#async-e-await)
- [Proxy](#proxy)
- [Por que 0.1 + 0.2 != 0.3](#por-que-01--02--03)
- [Expressões regulares](#expressões-regulares)
  - [Metacaracteres](#metacaracteres)
  - [Flags](#flags)
  - [Character Shorthands](#character-shorthands)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Tipos incorporados
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

## De objetos para tipos primitivos

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

Adicões invocaram três tipos de conversões de tipos: para tipos primitivos, para números e string:

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

Por que isso acontece? Porque a versão inicial do JS era baseada em sistemas de 32-bits, do qual armazenava a informação do tipo de variável em bits mais baixos por considerações de performance. Essas começam com objetos `000`, e todos os bits de `null` são zero, então isso é erroneamente tratado como um objeto. Apesar do código atual verificar se os tipos internos mudaram, esse bug foi passado para baixo.

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

Cada função, além de `Function.prototype.bind()`, tem uma propriedade interna, denotado como `prototype`, do qual é uma referência para o prototype.

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

A herança de implementação com o método acima pode perfeitamente resolver a restrição no baixo nível do JS.


# Cópia rasa e profunda

```js
let a = {
    age: 1
}
let b = a
a.age = 2
console.log(b.age) // 2
```

A partir do exemplo acima, nós podemos ver que se você assinar um objeto para uma variável, então os valores dos dois vão ter a mesma referência, um muda o outro muda adequadamente.

Geralmente, nós não queremos que tal problema apareça durante o desensolvimento, portanto podemos usar a cópia rasa para resolver esse problema.

## Cópia rasa

Primeiramente podemos resolver o problema através do `Object.assign`:
```js
let a = {
    age: 1
}
let b = Object.assign({}, a)
a.age = 2
console.log(b.age) // 1
```

Certamente, podemos usar o spread operator (...) para resolver o problema:
```js
let a = {
    age: 1
}
let b = {...a}
a.age = 2
console.log(b.age) // 1
```

Geralmente, a cópia rasa pode resolver a maioria dos problemas, mas precisamos da cópia profunda quando encontrado a seguinte situação:
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
A cópia rasa resolve apenas o problema na primeira camada. Se o objeto contém objetos, então ele retorna para o topico inicial que os dois valores compartilham a mesma referência. Para resolver esse problema, precisamos introduzir a cópia profunda. 

## Cópia profunda

O problema pode geralmente ser resolvido por `JSON.parse(JSON.stringify(object))`

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

Mas esse método também tem seus limites:
* ignora `undefined`
* incapaz de serializar função
* incapaz de resolver referência circular de um objeto
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

Se um objto é uma referência circular como o exemplo acima, você vai encontrar o método `JSON.parse(JSON.stringify(object))` ele não pode fazer a cópia profunda desse objeto:

![](https://user-gold-cdn.xitu.io/2018/3/28/1626b1ec2d3f9e41?w=840&h=100&f=png&s=30123)

Quando lidando com uma função ou `undefined`, o objeto pode não ser serializado adequedamente.
```js
let a = {
    age: undefined,
    sex: Symbol('male'),
    jobs: function() {},
    name: 'yck'
}
let b = JSON.parse(JSON.stringify(a))
console.log(b) // {name: "yck"}
```

No caso acima, você pode perceber que o método ignora a função e `undefined`.

A maioria dos dados conseguem ser serializados, então esse método resolve a maioria dos problemas, e como uma função embutida, ele tem uma performance melhor quando lidando com a cópia profunda. Certamente, você pode usar [the deep copy function of `lodash` ](https://lodash.com/docs#cloneDeep) quando sues dados contém os três casos acima.

Se o objeto que você quer copiar contém um tipo embutido mas não contém uma função, você pode usar `MessageChannel`
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

// preste atenção que esse método é assíncrono
// ele consegue manipular `undefined` e referência circular do objeto
(async () => {
  const clone = await structuralClone(obj)
})()
```

# Modularização

Com o Babel, nós conseguimos usar a ES6 modularização:

```js
// arquivo a.js
export function a() {}
export function b() {}
// arquivo b.js
export default function() {}

import {a, b} from './a.js'
import XXX from './b.js'
```

## CommonJS

`CommonJS` é uma aspecto único do Node. É preciso `Browserify` para o `CommonJS` ser usado nos navegadores.

```js
// a.js
module.exports = {
    a: 1
}
// ou
exports.a = 1

// b.js
var module = require('./a.js')
module.a // -> log 1
```

No código acima, `module.exports` e `exports` podem causar confusão. Vamos dar uma olhada na implementação interna:

```js
var module = require('./a.js')
module.a
// esse é o empacotador atual de uma função a ser executada imediatamente, de modo que não precisamos bagunçar as variáveis globais.
// O que é importante aqui é que o módulo é apenas uma variável do Node.
module.exports = {
    a: 1
}
// implementação básica
var module = {
  exports: {} // exporta em um objeto vázio
}
// Esse é o por que o exports e module.exports tem usos similares.
var exports = module.exports
var load = function (module) {
    // to be exported
    var a = 1
    module.exports = a
    return module.exports
};
```

Vamos então falar sobre `module.exports` e `exports`, que tem uso similar, mas um não atribui um valor para `exports` diretamente. A tarefa seria um no-op.

A diferença entre as modularizações no `CommonJS` a no ES6 são:

- O antigo suporta importes dinamico, que é `require(${path}/xx.js)`; o último não suporta isso ainda, mas 
existem propostas.
- O antigo usa importes síncronos. Desde de que usado no servidor os arquivos são locais, não importa muito mesmo se o import síncrono bloqueia a main thread. O último usa importe assíncrono, porque ele é usado no navegador em que os arquivos baixados são precisos. O processo de renderização seria afetado muito se assíncrono importe for usado.
- O anterior copia os valores quando exportando. Mesmo se o valor exportado mudou, os valores importados não irão mudar. Portanto, se os valores devem ser atualizados, outro importe precisa acontecer. Contudo, o último usa ligações em tempo real, os valores importados são importados no mesmo endereço de memória, então o valor importado muda junto com os importados.
- Em execução o último é compilado para `require/exports`.

## AMD

AMD é apresentado por `RequireJS`.

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

# A diferença entre call apply bind

Primeiro, vamos falar a diferença entre os dois antigos.

Ambos `call` e `apply` são usados para mudar o que o `this` se refere. Seu papel é o mesmo, mas a maneira de passar os parâmetros é diferente.

Além do primeiro parâmetro, `call` também aceita uma lista de argumentos, enquanto `apply` aceita um único array de argumentos.

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

## simulação para implementar `call` e `apply`

Consideramos implementar eles a partir das seguintes regras:

* Se o primeiro parâmetro não foi passado, então o primeiro será o padrão `window`;

* Mude a referência do `this`, que faz um novo objeto capaz de executar a função. Então vamos pensar assim: adicione a função para um novo objeto e então delete ele depois da execução.

```js
Function.prototype.myCall = function (context) {
  var context = context || window
  // Adiciona uma propriedade ao `context`
  // getValue.call(a, 'yck', '24') => a.fn = getValue
  context.fn = this
  // pega os parâmentros do `context`
  var args = [...arguments].slice(1)
  // getValue.call(a, 'yck', '24') => a.fn('yck', '24')
  var result = context.fn(...args)
  // deleta fn
  delete context.fn
  return result
}
```

O exemplo acima é a idéia central da simulação do `call`, e a implementação do `apply` é similar.

```js
Function.prototype.myApply = function (context) {
  var context = context || window
  context.fn = this

  var result
  // Existe a necessidade de determinar se guarda o segundo parâmentro
  // Se o segundo parâmetro existir, espalhe ele
  if (arguments[1]) {
    result = context.fn(...arguments[1])
  } else {
    result = context.fn()
  }

  delete context.fn
  return result
}
```

A regra do `bind` é a mesma das outras duas, exceto que ela retorna uma função. E nós podemos implementar currying com o `bind`

vamos simular o `bind`:

```js
Function.prototype.myBind = function (context) {
  if (typeof this !== 'function') {
    throw new TypeError('Error')
  }
  var _this = this
  var args = [...arguments].slice(1)
  // retorna uma função
  return function F() {
    // Nós podemos usar `new F()` porque ele retorna uma função, então precisamos determinar
    if (this instanceof F) {
      return new _this(...args, ...arguments)
    }
    return _this.apply(context, args.concat(...arguments))
  }
}
```

# Implementação de Promise

`Promise` é a nova sintaxe introduzida pelo ES6, que resolve os problemas de callback hell.

Promise pode ser visto como um estado de máquina e o seu estado inicial é `pending`. Nós podemos mudar o estado para `resolved` ou `rejected` usando as funções `resolve` e `reject`. Uma vez que o state mudou, ele não pode mudar novamente.

A função `then` retorna uma instância da Promise, do qual é uma nova instância ao invés do anterior. E existe por que a especificação de estado da Promise que adiciona para o estado `pending`, outro estado não pode ser mudado, e multiplas chamadas a função `then` serão insignificantes se a mesma instância for retornada.

Para `then`, ele pode essencialmente ser visto como flatMap`:

```js
// árvore de estados
const PENDING = 'pending';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';
// promise aceita um argumento na função que será executada imediatamente.
function MyPromise(fn) {
  let _this = this;
  _this.currentState = PENDING;
  _this.value = undefined;
  // Save o callback do `then`, apenas em cache quando o estado da promise for pending,
  // no máximo será cacheado em cada instância
  _this.resolvedCallbacks = [];
  _this.rejectedCallbacks = [];

  _this.resolve = function(value) {
    // execute assícronamente para garantir a ordem de execução
    setTimeout(() => {
      if (value instanceof MyPromise) {
        // se o valor é uma Promise, execute recursivamente
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
    // execute assícronamente para garantir a ordem de execução
    setTimeout(() => {
      if (_this.currentState === PENDING) {
        _this.currentState = REJECTED;
        _this.value = reason;
        _this.rejectedCallbacks.forEach(cb => cb());
      }
    })
  }

  // para resolver o seguinte problema
  // `new Promise(() => throw Error('error))`
  try {
    fn(_this.resolve, _this.reject);
  } catch (e) {
    _this.reject(e);
  }
}

MyPromise.prototype.then = function(onResolved, onRejected) {
  const self = this;
  // especificação 2.2.7， `then` deve retornar uma nova promise
  let promise2;
  // especificação 2.2, ambos `onResolved` e `onRejected` são argumentos opcionais
  // isso deveria ser ignorado se `onResolved` ou `onRjected` não for uma função,
  // do qual implementa a penetrar a passagem desse valor
  // `Promise.resolve(4).then().then((value) => console.log(value))`
  onResolved = typeof onResolved === 'function' ? onResolved : v => v;
  onRejected = typeof onRejected === 'function' ? onRejected : r => throw r;

  if (self.currentState === RESOLVED) {
    return (promise2 = new MyPromise((resolve, reject) => {
      // especificação 2.2.4, encapsula eles com `setTimeout`,
      // em ordem para garantir que `onFulfilled` e `onRjected` executam assícronamente
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
      // execute `onRejected` assícronamente
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
         // Considerando que isso deve lançar um erro, encapsule eles com `try/catch`
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

// especificação 2.3
function resolutionProcedure(promise2, x, resolve, reject) {
  // especificação 2.3.1，`x` e  `promise2` não podem ser referenciados para o mesmo objeto,
  // evitando referência circular
  if (promise2 === x) {
    return reject(new TypeError('Error'));
  }

  // especificação 2.3.2, se `x` é uma Promise e o estado é `pending`,
  // a promisse deve permanecer, se não, ele deve ser executado.
  if (x instanceof MyPromise) {
    if (x.currentState === PENDING) {
      // chame a função `resolutionProcedure` novamente para 
      // confirmar o tipo de argumento que x resolve
      // Se for um tipo primitivo, irá ser resolvido novamente
      // passando o valor para o próximo `then`.
      x.then((value) => {
        resolutionProcedure(promise2, value, resolve, reject);
      }, reject)
    } else {
      x.then(resolve, reject);
    }
    return;
  }

  // especificação 2.3.3.3.3
  // se ambos `reject` e `resolve` forem executado, a primeira execução 
  // de sucesso tem precedência, e qualquer execução é ignorada
  let called = false;
  // especificação 2.3.3, determina se `x` é um objeto ou uma função 
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    // especificação 2.3.3.2, se não conseguir obter o `then`, execute o `reject`
    try {
      // especificação 2.3.3.1
      let then = x.then;
      // se `then` é uma função, chame o `x.then`
      if (typeof then === 'function') {
        // especificação 2.3.3.3
        then.call(x, y => {
          if (called) return;
          called = true;
          // especificação 2.3.3.3.1
          resolutionProcedure(promise2, y, resolve, reject);
        }, e => {
          if (called) return;
          called = true;
          reject(e);
        });
      } else {
        // especificação 2.3.3.4
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    // especificação 2.3.4, `x` pertence ao tipo primitivo de dados
    resolve(x);
  }
}
```

O código acima, que é implementado baseado em Promise / A+ especificação, pode passar os testes completos de `promises-aplus-tests`

![](https://user-gold-cdn.xitu.io/2018/3/29/162715e8e37e689d?w=1164&h=636&f=png&s=300285)

# Implementação do Generator

Generator é uma funcionalidade sintática adicionada no ES6. Similar a `Promise`, pode ser usado para programação assíncrona.

```js
// * significa que isso é uma função Generator
// yield dentro de um bloco pode ser usado para pausar a execução
// next consegue resumir a execução
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

Como podemos dizer no código acima, a função com um `*` teria a execução da função `next`. Em outras palavras, a execução de função retorna um objeto. Toda chamada a função `next` pode continuar a execução do código pausado. Um simples implementação da função Generator é mostrada abaixo:
```js
// cb é a função 'test' compilada
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
// Depois da compilação do babel's, a função 'test' retorna dentro dessa:
function test() {
  var a;
  return generator(function(_context) {
    while (1) {
      switch ((_context.prev = _context.next)) {
        // yield separa o código em diversos blocos
        // cada chamada 'next' executa um bloco de código
        // e indica o próximo bloco a ser executado
        case 0:
          a = 1 + 2;
          _context.next = 4;
          return 2;
        case 4:
          _context.next = 6;
          return 3;
        // execução completa
        case 6:
        case "end":
          return _context.stop();
      }
    }
  });
}
```

# Debouncing

Tendo você encontrado esse problema e seu dia-a-dia no desenvolvimento: como fazer uma computação complexa em um evento de scroll ou prevenir o "segundo clique acidental" no butão?

Esses requisitos podem ser alcançados com funcões debouncing. Especialmente para o primeiro, se uma computação complexa estiver sendo chamado em frequentes eventos de callbacks, existe uma grande chance que a página se torne lenta. É melhor combinar essas multiplas computações e uma, e apenas operar em determinado periodo de tempo. Desde que existe muitas bibliotecas que implementam debouncing, nós não construimos nosso próprio aqui e vamos pegar o código do underscore para explicar o debouncing:

```js
/**
 * função underscore debouncing. Quando a função callback é chamada em série, a funcão vai executar apenas quando o tempo ideal é maior ou igual ao `wait`.
 *
 * @param  {function} func        função callback
 * @param  {number}   wait        tamanho do intervalo de espera
 * @param  {boolean}  immediate   quando definido para true, func é executada imadiatamente
 * @return {function}             retorna a função a ser chamada pelo cliente
 */
_.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      // compara now para o último timestamp
      var last = _.now() - timestamp;
      // se o tempo de intervalo atual é menor então o set interval é maior que 0, então reinicie o timer.
      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        // senão é o momento de executar a função callback
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
      // obtendo o timestamp
      timestamp = _.now();
      // se o timer não existir então execute a função imediatamente
      var callNow = immediate && !timeout;
      // se o time não existe então crie um
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        // se a função imediata é precisa, use aplly para começar a função
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };
```

A implementação completa da ƒunção não é tão difícil.

- Para a implementação de proteger contra clicks acidentais: enquanto eu começar o time e o time existir, não importa quantas vezes eu clicar o butão, a função de callback não será executada. Contudo quando o time termina, é setado para `null`, outro click é permitido.
- Para a implementação da executação da função de atraso: toda chamada para a função debouncing vai disparar um tempo de intervalo equivalente entre a chamada tual e a última chamada. Se o intervalo é menor que o requerido, outro time será cirado, e o atraso é atribuido ao set interval menos o tempo anterior. Quando o tempo passa, a função de callback é executada.

# Throttle

`Debounce` e `Throttle` possuem naturezas diferentes. `Debounce` é para tornar multiplas execuções na última execução, e `Throttle` é para tornar multiplas execuções em uma execução de intervalos regulares.

```js
// Os dois primeiro parâmetros com debounce são a mesma função
// options: você pode passar duas propriedades
// trailing: o último tempo não é executado
// leading: o primeiro tempo não é executado
// As duas propriedades não coexistem, contudo a função não será executada
_.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    // timestamp anterior
    var previous = 0;
    // Defina vázio se as opções não forem passadas
    if (!options) options = {};
    // Função Timer callback
    var later = function() {
        // se você definiu `leading`, então defina `previous` para zero
        // O primeiro if da seguinte função é usada
        previous = options.leading === false ? 0 : _.now();
        // O primeiro é prevenindo memory leaks e o segundo é julgado os seguintes timers quando configurado `timeout` para null
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function() {
        // Obtenha o timestamp atual
        var now = _.now();
        // Deve ser verdado quando entrar pela primeira vez
        // Se você não precisa executar essa função na primeira vez
        // Defina o último timestamp para o atual
        // Então ele será maior que 0 quando o termo remanecente for calculado da próxima vez
        if (!previous && options.leading === false)
            previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        // Essa condição só será preenchida se definido para `trailing`
        // Essa condição só será preenchida no ínicio se não definido `leading`
        // Outro ponto, você deve pensar que essa condição não será preenchida se você ligar o timer
        // De fato, será assim até entrar porque o atraso do timer não é acurado
        // Isso é muito como se você setar a 2 segundos, mas ele precisa 2.2 segundos para disparar, então o tempo será preenchido nessa condição
        if (remaining <= 0 || remaining > wait) {
            // Limpe se existe um timer e ele chama a callback duas vezes
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            // Julge se o timer e trailing forem definidos
            // E você não pode defirnor leading e trailing no mesmo instante
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
};
```

# Map、FlatMap e Reduce

O efeito do `Map` é para gerar um novo array, iterando sobre o array original, tomando cada elemento para fazer alguma transformação, e então `append` para um novo array.

```js
[1, 2, 3].map((v) => v + 1)
// -> [2, 3, 4]
```

`Map` tem três parâmetros, nomeando o índice atual do elemento, o índice, o array original.

```js
['1','2','3'].map(parseInt)
//  parseInt('1', 0) -> 1
//  parseInt('2', 1) -> NaN
//  parseInt('3', 2) -> NaN
```

O efeito do `FlatMap` é quase o mesmo do `Map`, mas o array original será substituído para um array multidimensional. Você pode pensar no `FlatMap` com um `map` e um `flatten`, que atualmente não é suportado nos navegadores.

```js
[1, [2], 3].flatMap((v) => v + 1)
// -> [2, 3, 4]
```

Você pode alcançar isso quando você quer reduzir completamente dimensões de um array multidimensional:

```js
const flattenDeep = (arr) => Array.isArray(arr)
  ? arr.reduce( (a, b) => [...a, ...flattenDeep(b)] , [])
  : [arr]

flattenDeep([1, [[2], [3, [4]], 5]])
```

O efeito do `Reduce` é para combinar os valores em um array e pegar o valor final:

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


# Async e await

A função `async` vai retornar uma `Promise`:

```js
async function test() {
  return "1";
}
console.log(test()); // -> Promise {<resolved>: "1"}
```

Você pode pensar em `async` como uma função encapsuladora usando `Promise.resolve()`.

`await` pode ser usado apenas em funcões `async`:

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

O código acime vai exibir `finish` antes de exibir `object`. Porque `await` espera pela funcão `sleep` `resolve`, mesmo se a sincronização de código estiver seguida, ele não executa antes do código assíncrono ser executado.

A vantagem do `async` e `await` comparado ao uso direto da `Promise` mente em manipular a cadeia de chamada do `then`, que pode produzir código claro e acurado. A desvantagem é que uso indevido do `await` pode causar problemas de performance porque `await` bloqueia o código. Possivelmente o código assíncrono não depende do anterior, mas ele ainda precisa esperar o anterir ser completo, ocasionando perda de concorrência.

Vamos dar uma olhada em um código que usa `await`:

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

Você pode ter dúvidas sobre o código acima, aqui nós explicamos o príncipio:

- Primeiro a função `b` é executada. A variável `a` ainda é zero antes da execução do `await 10`, porque os `Generators` são implementados dentro do `await` e `Generators` matém as coisas na pilha, então nesse momento `a = 0` é salvo
- Porque `await` é uma operação assíncrona, `console.log('1', a)` será executada primeiro.
- Nesse ponto, o código síncrono é completado e o código assíncrono é iniciado. O valor salvo é usado. Nesse instante, `a = 10`
- Então chega a execução usual do código

# Proxy

Proxy é uma nova funcionalidade desde o ES6. Ele costuma ser usado para definir operações em objetos:

```js
let p = new Proxy(target, handler);
// `target` representa o objeto que precisamos adicionar o proxy
// `handler` operações customizadas no objeto
```

Proxy podem ser conveniente para implementação de data bindind e listening:

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
p.a = 2 // liga `value` para `2`
p.a // -> obtém 'a' = 2
```

# Por que 0.1 + 0.2 != 0.3

Porque JS usa a precisão-dupla do IEEE 754 versão (64-bit). Toda linguagem que usa esse padrão tem esse problema.

Como nós sabemos, computadores usam binários para representar decimais, então `0.1` em binário é representado como

```js
// (0011) representa o ciclo
0.1 = 2^-4 * 1.10011(0011)
```

Como nós chegamos a esse número binário? Podemos tentar computar ele como abaixo:

![](https://user-gold-cdn.xitu.io/2018/4/26/162ffcb7fc1ca5a9?w=800&h=1300&f=png&s=83139)

Computações binária em números flutuantes são diferentes daqueles em inteiros. Por multiplicação, apenas bits flutuantes são computados, enquanto bits do tipo inteiro são usados pelos binários para cada bit. Então o primeiro bit é usado como o bit mais significante. Assim sendo nós obtemos 0.1 = 2^-4 * 1.10011(0011)`.

`0.2` é similar. Nós apenas precisamos passear na primeira multiplicação e obter `0.2 = 2^-3 * 1.10011(0011)`

Voltando a precisão dupla pelo padrão IEE 754. Entre o 64 bits, um bit é usado para assinatura, 11 é usado para bits inteiros, e o outros 52 bits são floats. Uma vez que `0.1` e `0.2` são ciclos infinitos de binários, o último bit do float precisa indicar se volta (mesmo como o arredendomaneto em decimal).

Depois do arredondamento, `2^-4 * 1.10011...001` se torna `2^-4 * 1.10011(0011 * 12 vezes)010`. Depois de adicionado esses dois binários obtemos `2^-2 * 1.0011(0011 * 11 vezes)0100`, que é `0.30000000000000004` em decimal.

A solução nativa pra esse problema é mostrado abaixo:

```js
parseFloat((0.1 + 0.2).toFixed(10))
```

# Expressões Regulares

## Metacaracteres

| Metacaractere |                            Efeito                            |
| :-----------: | :----------------------------------------------------------: |
|       .       |     corresponde a qualquer caractere exceto de terminadores de linhas: \n, \r, \u2028 or \u2029.    |
|      []       | corresponde a qualquer coisa dentro dos colchetes. Por exemplo, [0-9] corresponde a qualquer número |
|       ^       | ^9 significa corresponder qualquer coisa que começa com '9'; [`^`9] significa não corresponder aos caracteres exceto '9' nos colchetes |
|    {1, 2}     |           corresponde 1 ou 2 caracteres digitais             |
|     (yck)     |         corresponde apenas strings com o mesmo 'yck'         |
|      \|       |     corresponde a qualquer caractere antes e depois \|       |
|       \       |                      caracter de escape                      |
|       *       |      corresponde a expressão precedente 0 ou mais vezes      |
|       +       |      corresponde a expressão precedente 1 ou mais vezes      |
|       ?       |             o caractere antes do '?' é opcional              |

## Bandeiras

| Bandeira | Efeito                  |
| :------: | :--------------:        |
| i        | pesquisa insensível a maiúsculas e minúsculas |
| g        | corresponde globalmente |
| m        | multilinha              |

## Caracteres Atalhos

| Atalho |            Efeito            |
| :--: | :------------------------: |
|  \w  | caracteres alfanuméricos, caracteres sublinhados |
|  \W  |         o oposto do acima         |
|  \s  |      qualquer caractere em branco      |
|  \S  |         o oposto do acima         |
|  \d  |          números          |
|  \D  |         o oposto do acima         |
|  \b  |    inicio ou fim da palavra    |
|  \B  |         o oposto do acima         |

