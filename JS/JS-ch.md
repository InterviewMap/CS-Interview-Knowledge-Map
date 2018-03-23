- [内置类型](#内置类型)
- [Typeof](#typeof)
- [类型转换](#类型转换)
- [原型](#原型)
- [new](#new)
- [instanceof](#instanceof)
- [this](#this)
- [作用域](#作用域)
- [闭包](#闭包)
- [深浅拷贝](#深浅拷贝)
- [模块化](#模块化)
- [节流](#节流)
- [防抖](#防抖)

#### 内置类型

JS 中分为七种内置类型，七种内置类型又分为两大类型：基本类型和对象（Object）。

基本类型有六种： `null`，`undefined`，`boolean`，`number`，`string`，`symbol`。

其中 JS 的数字类型是浮点类型的，没有整型。并且浮点类型基于 IEEE 754标准实现，在使用中会遇到某些 Bug。详情请见此处（0.1+0.2==0.3 TODO）。`NaN` 也属于 `number` 类型，并且 `NaN` 不等于自身。

对于基本类型来说，如果使用字面量的方式，那么这个变量只是个字面量，只有在必要的时候才会转换为对应的类型

```js
let a = 111 // 这只是字面量，不是 number 类型
a.toString() // 使用时候才会转换为对象类型
```

对象（Object）是引用类型，在使用过程中会遇到浅拷贝和深拷贝的问题（TODO）。

```js
let a = { name: 'FE' }
let b = a
b.name = 'EF'
console.log(a) // EF
```

#### Typeof

`typeof` 对于基本类型，除了 `null` 都可以显示正确的类型

```js
typeof 1 // 'number'
typeof '1' // 'string'
typeof undefined // 'undefined'
typeof true // 'boolean'
typeof Symbol() // 'symbol'
typeof b // b 没有声明，但是还会显示 undefined
```

`typeof` 对于对象，除了函数都会显示 `object`

```js
typeof [] // 'object'
typeof {} // 'object'
typeof console.log // 'function'
```

对于 `null` 来说，虽然它是基本类型，但是会显示 `object`，这是一个存在很久了的 Bug

```js
typeof null // 'object'
```

PS：为什么会出现这种情况呢？因为在 JS 中二进制前三位都为0的话会被判定为 `object` 类型，`null` 的二进制都为0，所以被判定为 `object`。

如果我们想获得一个变量的正确类型，可以通过 `Object.prototype.toString.call(xx)`。这样我们就可以获得类似 `[Object Type]` 的字符串。

#### 类型转换

##### 转Boolean

除了 `undefined`， `null`， `false`， `NaN`， `''`， `0`， `-0`，其他所有值都转为 `true`，包括所有对象。

##### 对象转基本类型

对象在转换基本类型时，首先会调用 `valueOf` 然后调用 `toString`。并且这两个方法你是可以重写的。

```js
let a = {
    valueOf() {
    	return 0
    }
}
```

##### 四则运算符

只有当加法运算时，其中一方是字符串类型，就会把另一个也转为字符串类型。其他运算只要其中一方是数字，那么另一方就转为数字。

```js
1 + '1' // '11'
2 * '2' // '4'
```

##### `==` 操作符

![687474703a2f2f7777312e73696e61696d672e636e2f6c617267652f6136363063616232677931666379387173316b79736a3231646b313171343875](/Users/yuchengkai/Desktop/687474703a2f2f7777312e73696e61696d672e636e2f6c617267652f6136363063616232677931666379387173316b79736a3231646b313171343875.jpeg)

上图中的 `toPrimitive` 就是对象转基本类型。

一般推荐使用 `===` 判断两个值，但是你如果想知道一个值是不是 `null` ，你可以通过 `xx == null` 来比较。

##### 比较运算符

1. 如果是对象，就通过 `toPrimitive` 转换对象
2. 如果是字符串，就通过 `unicode` 字符索引来比较

#### 原型

![prototype](https://camo.githubusercontent.com/71cab2efcf6fb8401a2f0ef49443dd94bffc1373/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031382f332f31332f313632316538613962636230383732643f773d34383826683d35393026663d706e6726733d313531373232)

每个函数都有 `prototype` 属性，除了 `Function.prototype.bind()`，该属性指向原型。

每个对象都有 `__proto__` 属性，指向了创建该对象的构造函数的原型。其实这个属性指向了 `[[prototype]]`，但是 `[[prototype]]` 是内部属性，我们并不能访问到，所以使用 `_proto_` 来访问。

对象可以通过 `__proto__` 来寻找不属性该对象的属性，`__proto__` 将对象连接起来组成了原型链。

如果你想更进一步的了解原型，可以仔细阅读 [深度解析原型中的各个难点](https://github.com/KieSun/Blog/issues/2)。

#### new

1. 新生成了一个对象
2. 链接到原型
3. 绑定 this
4. 返回新对象

在调用 `new` 的过程中会发生以上四件事情，我们也可以试着来自己实现一个 `new`

```js
function create() {
    // 创建一个空的对象
    let obj = new Object()
    // 获得构造函数
    let Con = [].shift.call(arguments)
    // 链接到原型
    obj.__proto__ = Con.prototype
    // 绑定 this，执行构造函数
    let result = Con.apply(obj, arguments)
    // 确保 new 出来的是个对象
    return typeof result === 'object' ? result : obj
}
```

对于实例对象来说，都是通过 `new` 产生的，无论是 `function Foo()` 还是 `let a = { b : 1 }` 。

对于创建一个对象来说，更推荐使用字面量的方式创建对象（无论性能上还是可读性）。因为你使用 `new Object()` 的方式创建对象需要通过作用域链一层层找到 `Object`，但是你使用字面量的方式就没这个问题。

```js
function Foo() {}
// function 就是个语法糖
// 内部等同于 new Function()
let a = { b: 1 }
// 这个字面量内部也是使用了 new Object()
```
#### instanceof

`instanceof` 可以正确的判断对象的类型，因为内部机制是通过判断对象的原型链中是不是能找到类型的 `prototype`。

我们也可以试着实现一下 `instanceof`

```js
function instanceof(left, right) {
    // 获得类型的原型
    let prototype = right.prototype
    // 获得对象的原型
    left = left.__proto__
    // 判断对象的类型是否等于类型的原型
    while (true) {
    	if (left === null)
    		return false
    	if (prototype === left)
    		return true
    	left = left.__proto__
    }
}
```

#### this

this 是很多人会混淆的概念，但是其实他一点都不难，你只需要记住几个规则就可以了。

```js
function foo() {
	console.log(this.a)
}
var a = 2
foo()

var obj = {
	a: 2,
	foo: foo
}
obj.foo()

// 以上两者情况 this 只依赖于调用函数前的对象，优先级是第二个情况大于第一个情况

// 以下情况是优先级最高的，this 只会绑定在 c 上，不会被任何方式修改 this 指向
var c = new foo()
c.a = 3
console.log(c.a)

// 还有种就是利用 call，apply，bind 改变 this，这个优先级仅次于 new
```

以上几种情况明白了，很多代码中的 this 应该就没什么问题了，下面让我们看看箭头函数中的 this

```js
function a() {
    return () => {
        return () => {
        	console.log(this)
        }
    }
}
console.log(a()()())
```

箭头函数其实是没有 this 的，这个函数中的 this 只取决于他外面的第一个不是箭头函数的函数的 this。在这个例子中，因为调用 a 符合前面代码中的第一个情况，所以 this 是 window。并且 this 一旦绑定了上下文，就不会被任何代码改变。

#### 作用域
当执行 JS 代码时，会生成执行环境，只要代码不是写在函数中的，就是在全局执行环境中，函数中的代码会产生函数执行环境，只此两种执行环境（还有个 eval，但是基本不会使用，所以可以认为只有两种环境）。

产生执行环境的第一阶段时，会生成 `[[Scope]]` 属性，这个属性是一个指针，对应的有一个作用域链表，JS 会通过这个链表来寻找变量直到全局环境。

接下来让我们看一个老生常谈的例子，`var`

```js
b() // call b
console.log(a) // undefined

var a = 'Hello world'

function b() {
	console.log('call b')
}
```

想必以上的输出大家肯定都已经明白了，这是因为函数和变量提升的原因。通常提升的解释是说将声明的代码移动到了顶部，这其实没有什么错误，便于大家理解。但是更准确的解释应该是：在生成执行环境时，会有两个阶段。第一个阶段是创建的阶段（具体是生成变量对象步骤），JS 解释器会找出需要提升的变量和函数，并且给他们提前在内存中开辟好空间，函数的话会将整个函数存入内存中，变量只声明并且赋值为 undefined，所以在第二个阶段，也就是代码执行阶段，我们可以直接提前使用。

在提升的过程中，相同的函数会覆盖上一个函数，并且函数优先于变量提升

```js
b() // call b second

function b() {
	console.log('call b fist')
}
function b() {
	console.log('call b second')
}
var b = 'Hello world'
```

`var` 会产生很多错误，所以在 ES6中引入了 `let`。`let` 不能在声明前使用，但是这并不是常说的 `let` 不会提升，`let` 提升了，在第一阶段内存也已经为他开辟好了空间，但是因为这个声明的特性导致了并不能在声明前使用。

#### 闭包

闭包的定义很简单：函数 A 返回了一个函数 B，并且函数 B 中使用了函数 A 的变量，函数 B 就被称为闭包。

```js
function A() {
    let a = 1
    function B() {
        console.log(a)
    }
    return B
}
```

你是否会疑惑，为什么函数 A 已经弹出调用栈了，为什么函数 B 还能引用到函数 A 中的变量。因为函数 A 中的变量这时候是存储在堆上的。现在的 JS 引擎可以通过逃逸分析辨别出哪些变量需要存储在堆上，哪些需要存储在栈上。

经典面试题，循环中使用闭包解决 `var` 定义函数的问题

```Js
for ( var i=1; i<=5; i++) { 
	setTimeout( function timer() { 
		console.log( i ); 
	}, i*1000 ); 
}˝
```

首先因为 `setTimeout` 是个异步函数，所有会先把循环全部执行完毕，这时候 `i` 就是 6 了，所以会输出一堆 6。

解决办法两种，第一种使用闭包

```js
for (var i = 1; i <= 5; i++) {
  (function(j) {
    setTimeout(function timer() {
      console.log(j);
    }, j * 1000);
  })(i);
}
```

第二种就是使用 `let` 定义  `i` 了

```js
for ( let i=1; i<=5; i++) { 
	setTimeout( function timer() { 
		console.log( i ); 
	}, i*1000 ); 
}
```

因为对于 `let` 来说，他会创建一个块级作用域，相当于

```js
{ // 形成块级作用域
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

#### 深浅拷贝

```js
let a = {
    age: 1
}
let b = a
a.age = 2
console.log(b.age) // 2
```

从上述例子中我们可以发现，如果给一个变量赋值一个对象，那么两者的值会是同一个引用，其中一方改变，另一方也会相应改变。

通常在开发中我们不希望出现这样的问题，我们可以使用浅拷贝来解决这个问题。

##### 浅拷贝

首先可以通过 `Object.assign` 来解决这个问题。

```js
let a = {
    age: 1
}
let b = Object.assign({}, a)
a.age = 2
console.log(b.age) // 1
```

当然我们也可以通过展开运算符（…）来解决

```js
let a = {
    age: 1
}
let b = {...a}
a.age = 2
console.log(b.age) // 1
```

通常浅拷贝就能解决大部分问题了，但是当我们遇到如下情况就需要使用到深拷贝了

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

浅拷贝只解决了第一层的问题，如果接下去的值中还有对象的话，那么就又回到刚开始的话题了，两者享有相同的引用。要解决这个问题，我们需要引入深拷贝。

##### 深拷贝

这个问题通常可以通过 `JSON.parse(JSON.stringify(object))` 来解决。

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

但是该方法也是有局限性的：

- 会忽略 `undefined`
- 不能序列化函数
- 不能解决循环引用的对象

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

如果你有这么一个循环引用对象，你会发现你不能通过该方法深拷贝

![屏幕快照 2018-03-22 上午11.30.22](/Users/yuchengkai/Desktop/屏幕快照 2018-03-22 上午11.30.22.png)

在遇到函数或者 `undefined` 的时候，该对象也不能正常的序列化

```js
let a = {
    age: undefined,
    jobs: function() {},
    name: 'yck'
}
let b = JSON.parse(JSON.stringify(a))
console.log(b) // {name: "yck"}
```

你会发现在上述情况中，该方法会忽略掉函数和 `undefined` 。

但是在通常情况下，复杂数据都是可以序列化的，所以这个函数可以解决大部分问题，当然如果你的数据中含有以上三种情况下，可以使用 [loadash 的深拷贝函数](https://lodash.com/docs#cloneDeep)。

#### 模块化

在有 Babel 的情况下，我们可以直接使用 ES6 的模块化

```js
// file a.js
export function a() {}
export function b() {}
// file b.js
export default function() {}

import {a, b} from './a.js'
import XXX from './b.js'
```

在 ES6 之前，我们一般使用 CMD 和 ADM 规范来解决这个问题。

##### CommonJS

浏览器这边表示没有模块化还行，就是写逻辑麻烦了点。但是搞服务端的必须得有这玩意啊，所以 Node.js 第一个搞出了 `CommonJS规范`。

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

上面的写法很好用，但是 `module.exports` 和 `exports` 是咋回事？为啥这几句代码就实现模块化了，让我们来看一下基础的实现

先说 `require` 吧
```js
var module = require('./a.js')
module.a 
// 这里其实就是包装了一层立即执行函数，这样就不会污染全局变量了，
// 重要的是 module 这里，module 是 Node 独有的一个变量
module.exports = {
    a: 1
}
// 基本实现
var module = {
  id: 'xxxx', // 我总得知道怎么去找到他吧
  exports: {} // exports 就是个空对象
}
// 这个是为什么 exports 和 module.exports 用法相似的原因
var exports = module.exports 
var load = function (module) {
    // 导出的东西
    var a = 1
    module.exports = a
    return module.exports
};
// 然后当我 require 的时候去找到独特的
// id，然后将要使用的东西用立即执行函数包装下，over
```

再来说说 `module.exports` 和 `exports`，用法其实基本是相似的，但是不能对 `exports`直接赋值，不会有任何效果，看了上面代码的同学肯定明白为什么了。

`CommonJS规范`是 Node 独有的，浏览器中使用就需要用到 `Browserify` 解析了。

##### ADM

AMD 是由 `RequireJS` 提出的

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
#### 防抖

你是否在日常开发中遇到一个问题，在滚动事件中需要做个复杂计算或者实现一个按钮的防二次点击操作。

这些需求都可以通过函数防抖动来实现。尤其是第一个需求，如果在频繁的事件回调中做复杂计算，很有可能导致页面卡顿，不如将多次计算合并为计算，只在一个精确点做操作。因为防抖动的轮子很多，这里也不重新自己造个轮子了，直接使用 understore 的源码来解释防抖动。

```js
// 参数含义依次为回调函数
// 等待时间
// 是否马上调用函数
_.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      // 现在和上一次时间戳比较
      var last = _.now() - timestamp;
      // 如果当前间隔时间少于设定时间且大于0就重新设置定时器
      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        // 否则的话就是时间到了执行回调函数
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
      // 获得时间戳
      timestamp = _.now();
      // 如果定时器不存在且立即执行函数
      var callNow = immediate && !timeout;
      // 如果定时器不存在就创建一个
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        // 如果需要立即执行函数的话 通过 apply 执行
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };
```

整体函数实现的不难，总结一下。

- 对于按钮防点击来说的实现：一旦我开始一个定时器，只要我定时器还在，不管你怎么点击都不会执行回调函数。一旦定时器结束并设置为 `null`，就可以再次点击了。
- 对于延时执行函数来说的实现：每次调用防抖动函数都会判断本次调用和之前的时间间隔，如果小于需要的时间间隔，就会重新创建一个定时器，并且定时器的延时为设定时间减去之前的时间间隔。一旦时间到了，就会执行相应的回调函数。

#### 节流

防抖动和节流本质是不一样的。防抖动是将多次执行变为最后一次执行，节流是将多次执行变成每隔一段时间执行。

```js
// 前两者参数和防抖动是相同函数
// options 可以传入两个属性
// trailing：最后次不执行
// leading：第一次不执行
// 两者不能共存，否则函数不能执行
_.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    // 之前的时间戳
    var previous = 0;
    // 如果 options 没传则设为空对象
    if (!options) options = {};
    // 定时器回调函数
    var later = function() {
      // 如果设置了 leading，就将 previous 设为 0
      // 用于下面函数的第一个 if 判断
      previous = options.leading === false ? 0 : _.now();
      // 置空一是为了防止内存泄漏，二是为了下面的定时器判断
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      // 获得当前时间戳
      var now = _.now();
      // 首次进入前者肯定为 true
	  // 如果需要第一次不执行函数
	  // 就将上次时间戳设为当前的
      // 这样在接下来计算 remaining 的值时会大于0
      if (!previous && options.leading === false) previous = now;
      // 计算剩余时间
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      // 如果当前调用已经大于上次调用时间 + wait
      // 或者用户手动调了时间
 	  // 如果设置了 trailing，只会进入这个条件
	  // 如果没有设置 leading，那么第一次会进入这个条件
	  // 还有一点，你可能会觉得开启了定时器那么应该不会进入这个 if 条件了
	  // 其实还是会进入的，因为定时器的延时
	  // 并不是准确的时间，很可能你设置了2秒
	  // 但是他需要2.2秒才触发，这时候就会进入这个条件
      if (remaining <= 0 || remaining > wait) {
        // 如果存在定时器就清理掉否则会调用二次回调
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        // 判断是否设置了定时器和 trailing
	    // 没有的话就开启一个定时器
        // 并且不能不能同时设置 leading 和 trailing
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };
```

call 继承 generator实现 promise 实现 装饰器原理 ES5的继承和ES6的继承有什么区别？