<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Built-in Types](#built-in-types)
- [Typeof](#typeof)
- [Type Conversion](#type-conversion)
  - [Converting to Boolean](#converting-to-boolean)
  - [Objects to Primitive Types](#objects-to-primitive-types)
  - [Arithmetic Operators](#arithmetic-operators)
  - [`==` operator](#-operator)
  - [Comparison Operator](#comparison-operator)
- [New](#new)
- [This](#this)
- [instanceof](#instanceof)
- [scope](#scope)
- [Closure](#closure)
- [Prototypes](#prototypes)
- [inheritance](#inheritance)
- [Deep and Shallow Copy](#deep-and-shallow-copy)
  - [shallow copy](#shallow-copy)
  - [deep copy](#deep-copy)
- [the differences between call, apply, bind](#the-differences-between-call-apply-bind)
  - [simulation to implement   `call` and  `apply`](#simulation-to-implement---call-and--apply)
- [Promise implementation](#promise-implementation)
- [Throttle](#throttle)
- [Map、FlapMap and Reduce](#mapflapmap-and-reduce)
- [async and await](#async-and-await)
- [Proxy](#proxy)
- [Why 0.1 + 0.2 != 0.3](#why-01--02--03)
- [Regular Expressions](#regular-expressions)
  - [Metacharacters](#metacharacters)
  - [Modifiers](#modifiers)
  - [Character Shorthands](#character-shorthands)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

#### Built-in Types
JavaScript defines seven built-in types, which can be broken down into two categories: `Primitive Type` and `Object`.

There are six primitive types: `null` , `undefined` , `boolean` , `number` , `string` , `symbol `.

In JavaScript, there are no true integers, all numbers are implemented in double-precision 64-bit binary format IEEE 754. When we use binary floating-point numbers, it will have some side effects. Here is an example of these side effects.

```js
0.1 + 0.2 == 0.3 // false
```

For the primitive data types, when we use literals to initialize a variable, the variable only has the literals as its value, it doesn’t have a type. It will be converted to the corresponding type only when necessary.

```js
let a = 111 // only literals, not a number
a.toString() // converted to object when nucessary
```

Object is a reference type. We will encouter the problems about shallow copy and deep copy when using it.

```js
let a = { name: 'FE' }
let b = a
b.name = 'EF'
console.log(a) // EF
```


#### Typeof

 `typeof` can always display the correct type of the primitive types, except `null`
```js
typeof 1 // 'number'
typeof '1' // 'string'
typeof undefined // 'underfined'
typeof true // 'boolean'
typeof Symbol() // 'symbol'
typeof b // b is not declared,but it still can be displayed as underfined
```

For object,  `typeof`  will always display  `object`  except **function**
```js
typeof [] // 'object'
typeof {} // 'object'
typeof console.log // 'function'
```

As for `null`, it is always be treated as an  `object`  by `typeof`，although it is a primitive data type, and this happening is a bug that has been around for a long time.
```js
typeof null // 'object'
```

Why does this happen? Because the initial version of JS was based on the 32-bit systems, which stored the type information of variables in the lower bits for performance considerations. Those start with `000`  were objects, but all the bits of  `null`  are zero, so it is erroneously judged as an object. Although the current code of judging internal type has changed, but this bug has been passed down.

We can use `Object.prototype.toString.call(xx)`  if we wish to get the correct data type of a variable, and then we can get a string like `[Object Type]`

```js
let a
// We can also judge `undefined` like this
a === undefined
// But the reserved word `undefined` can be re-assigned in a lower version browser
let undefined = 1
// it will go wrong to judge like this
// So we can use the following method, with less code
// it will always return `undefined`, whatever follows `void `
a === void 0
```

#### Type Conversion

##### Converting to Boolean

Other than `undefined`， `null`， `false`， `NaN`， `''`， `0`， `-0`, all of the values, including objects, are converted to `true`.

##### Objects to Primitive Types

When objects are converted, `valueOf` and `toString` will be called, respectively in order. These two methods can also be overridden.

```js
let a = {
    valueOf() {
    	return 0
    }
}
```

##### Arithmetic Operators

Only for additions, if one of the parameters is a string, the other will be converted to string as well. For all other operations, as long as one of the parameters is a number, the other will be converted to a number.

Additions will invoke three types of type conversions: to primitive types, to numbers, and to string.

```js
1 + '1' // '11'
2 * '2' // 4
[1, 2] + [2, 1] // '1,22,1'
// [1, 2].toString() -> '1,2'
// [2, 1].toString() -> '2,1'
// '1,2' + '2,1' = '1,22,1'
```

Note the expression `'a' + + 'b'` for addition.

```js
'a' + + 'b' // -> "aNaN"
// since ++ 'b' -> NaN
// You might have seen + '1' -> 1
```

##### `==` operator

![](https://user-gold-cdn.xitu.io/2018/3/30/16275f89ebf931e9)

`toPrimitive` in the above figure is converting objects to primitive types.

`===` is usually recommeded to compare to values. However, if you would like to know if a value is `null`, you can use `xx == null`.

Let's take a look at an example `[] == ![] // -> true`. The following explains why the expression evaluates to `true`.

```js
// [] converting to true, then take the opposite to false
[] == false
// with #8
[] == ToNumber(false)
[] == 0
// with #10
ToPrimitive([]) == 0
// [].toString() -> ''
'' == 0
// with #6
0 == 0 // -> true
```

##### Comparison Operator

1. If it's an object, `toPrimitive` is used.
2. If it's a string, `unicode` character index is used to compare.
3. 

#### New

1.   Create a new object
2.   Chained to prototype
3.   Bind this
4.   Return a new object

The above four things will happen in the process of calling `new`, We can also try to implement a `new ` by ourselves.

```js
function create() {
  // Create an empty object
  let obj = new Object()
  // Get the constructor
  let Con = [].shift.call(arguments)
  // Chained to prototype
  obj.__proto__ = Con.prototype
  // Bind this, Execute the constructor
  let result = Con.apply(obj, arguments)
  // Make sure the new one is an object
  return typeof result === 'object'? result : obj
}
```

Instance of object are created with `new` , Whether `function Foo()` , or `let a = { b: 1 }` .

For creating an object , It is recommended to create an object using literal(Whether performance or readability). Because you need to find `Object` by the scope chain when you create an object using `new Object()` , But you don't have this problem when you use literal.

```js
function Foo() {}
// function is a syntactical sugar
// Internally equivalent to new Function()
let a = { b: 1 }
// Inside this literal is also used `new Object()`
```

For `new`, we also need attention to the operator precedence.

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

As you can see from the above image, `new Foo()` has a higher priority than `new Foo`, so we can divide the execution order of the above code like this:


```js
new (Foo.getName());
(new Foo()).getName();
```

For the first function, `Foo.getName()` is executed first, so the result is 1;
As for the latter, it firstly executes `new Foo()` to create an instance, then finds the `getName` function on `Foo` via the prototype chain, so the result is 2.

#### This

`This`, a concept that many people will confuse, is not difficult to understand, as long as you remember the following rules

```js
function foo() {
  console.log(this.a);
}
var a = 2;
foo();

var obj = {
  a: 2,
  foo: foo
};
obj.foo();

// In the above two situations, `this` only depends on the object before calling the function,
// and the second case has higher priority than the first case .

// the following situation has the highest priority，`this` will only be bound to c，
// and there's no way to change what `this` is bound to .

var c = new foo();
c.a = 3;
console.log(c.a);

// finally, using `call、apply、bind` to change what `this` is bound to ,
// is another situation whom's priority is only second to `new`
```

Understanding the above several situstions ,  we won’t be confused by `this`  in a lot of codes，then let’s take a look at `this` of arrow function
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
Actually , the arrow function does not have `this` , `this` in the above function only depends on the first function outside that is not arrow function . In above case , `this` is default to `window` because calling `a` matches the first situation in the above codes . And , what `this` is bound to will not be changed by any code once `this` is bound to the context


#### instanceof

The  `instanceof`  operator  can  correctly judge the type of the object , bacause  it’s  internal  mechanism is to find out  if `prototype` of this type  can be found in the prototype chain of the object
let’s try to implement it
```js
function instanceof(left, right) {
    // get the `prototype` of the type
    let prototype = right.prototype
    // get the `prototype` of the object
    left = left.__proto__
    // judge if the type of the object is equal to the prototype of the type
    while (true) {
    	if (left === null)
    		return false
    	if (prototype === left)
    		return true
    	left = left.__proto__
    }
}
```

#### scope

Executing JS code would generate execution environment , as long as the code is not written in a function , it belongs to the global execution environment . The code in a function will generate function execution environments , but only two (there’s an `eval`, which basically will not be used, so you can think of only two execution environments))

The `[[Scope]]`  attribute is generated in the first stage of generating execution environment , which is a pointer , corresponding to a linked list of scope , And JS will look up the variable through this linked list until the global environment .

Let's look at a common example , `var`

```js
b() // call b
console.log(a) // undefined

var a = 'Hello world'

function b() {
	console.log('call b')
}
```

It’s known that function and variable hoisting is the real reason for the above outputs . The usual explanation for hoisting says that the declarations are ‘moved’ to the top of the code , there is nothing wrong with that and it’s easy for everyone to understand . But a more accurate explanation should be like this :

There would bo two stages when the execution environment is generated  . The first stage is the stage of creation(to be specific , the step of generating variable objects ) , in which the JS interpreter would find out the variables and functions that need to be hoisted, and allocate memory for them in advance , then the functions would be deposited into memory entirely , but the variables would only be declared and assigned to  `undefined`, therefore , we can use them in advance in the second stage (the code execution stage)

In the process of hoisting , the same function would overwrite the last function , and function has the higher priority than variable hoisting .

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

Using `var`  is more likely to make mistake , thus ES6 introduces a new keyword `let`  .  `let`  has an  important feature that it can’t be used before declared , which mismatches the often saying that `let` doesn’t  have the ability of hoisting . Indeed, `let`  hoists declared , but does not assign a value, because the temporary dead zone.

#### Closure

The definition of a closure is simple: Function A returns a function B, and function B uses a variable of function A, and the function B is called a closure.

```js
function A() {
  let a = 1
  function B() {
      console.log(a)
  }
  return B
}
```

Are you wondering why function B can also refer to a variable in function A while function A has been popped up from the call stack?  Because the variables in function A are stored on the heap at this time. The current JS engine can identify which variables need to be stored on the heap and which need to be stored on the stack by escape analysis.

A classic question of interview,  using closures in loops to solve the problem of using `var` to define functions

```Js
for ( var i=1; i<=5; i++) {
    setTimeout( function timer() {
        console.log( i );
    }, i*1000 );
}˝
```

First of all, all loops will be executed completely because `setTimeout` is an asynchronous function, and at this time `i` is 6, so there will print a bunch of 6

There are three solutions，closure is the first one

```js
for (var i = 1; i <= 5; i++) {
  (function(j) {
    setTimeout(function timer() {
      console.log(j);
    }, j * 1000);
  })(i);
}
```

The second one is to use the third parameter of `setTimeout`

```js
for ( var i=1; i<=5; i++) {
    setTimeout( function timer(j) {
        console.log( j );
    }, i*1000, i);
}
```

The third is to define `i` using `let`

```js
for ( let i=1; i<=5; i++) {
    setTimeout( function timer() {
        console.log( i );
    }, i*1000 );
}
```

For `let`, it will create a block-level scope, which is equivalent to:

```js
{
    // Form block-level scope
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

#### Prototypes

![](https://camo.githubusercontent.com/71cab2efcf6fb8401a2f0ef49443dd94bffc1373/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031382f332f31332f313632316538613962636230383732643f773d34383826683d35393026663d706e6726733d313531373232)

Each function, besides `Function.prototype.bind()` , has an internal property, denoted as `prototype` , which is a reference to the prototype.

Each object has an internal property, denoted as `__proto__` , which is a reference to the prototype of the constructor that created the object. This property actually references to `[[prototype]]` , but `[[prototype]]` is an internal property that we can’t access, so we use `__proto__` to access it.

Objects can use `__proto__` to find properties that do not belong to the object, and `__proto__` connects objects together to form a prototype chain.


#### inheritance

In ES5, we can solve the problems of inheritance by using the following ways.

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

The above idea of inheritance implementation is to set the `prototype` of the child class as the `prototype` of the parent class.

In ES6, we can easily solve this problem with the `class`  syntax.

```js
class MyDate extends Date {
  test() {
    return this.getTime()
  }
}
let myDate = new MyDate()
myDate.test()
```

However, ES6 is not compatible with all browsers, so we need to use Babel to compile this code.

If call `myDate.test()` with compiled code, you’ll be surprised to see that there’s an error

![](https://user-gold-cdn.xitu.io/2018/3/28/1626b1ecb39ab20d?w=678&h=120&f=png&s=32812)

Because there are restrictions on the low-level of JS, if the instance isn’t constructed by `Date` , it can’t call the function in `Date`, which also explains on the side:  `Class` inheritance in ES6 is different from the general inheritance in ES5 syntax.

Since the low-level of JS limits that the instance must be constructed by `Date` , we can try another way to implement inheritance.

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

The Implement ideas of the above inheritance: firstly create the instance of parent class => change the original `__proto__` of the instance, connect it to the `prototype` of child class => change the `__proto__` of child class’s `prototype`  to the `prototype` of parent class.

The inheritance implement with the above method can perfectly solve the restriction on low-level of JS.


#### Deep and Shallow Copy

```js
let a = {
    age: 1
}
let b = a
a.age = 2
console.log(b.age) // 2
```

From the above example, we can see that if you assign an object to a variable,  then the values of both will be the same reference, one changes, the other changes accordingly.

Usually, we don't want such problem to appear during development, thus we can use shallow copy to solve this problem.

##### shallow copy

Firstly we can solve the problem by `Object.assign`
```js
let a = {
    age: 1
}
let b = Object.assign({}, a)
a.age = 2
console.log(b.age) // 1
```

Certainly, we can use the spread operator (...) to solve the problem
```js
let a = {
    age: 1
}
let b = {...a}
a.age = 2
console.log(b.age) // 1
```

Usually, shallow copy can solve most of the problems, but we need the deep copy when encountering the following situations
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
The shallow copy only solves the problem of the first layer. If the object contains objects, then it returns to the beginning topic that the values of both share the same reference. To solve the problem, we need to introduce deep copy.

##### deep copy

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

But this method also has its limits
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

If the object is circularly referenced like the above example, you’ll find the method `JSON.parse(JSON.stringify(object))`  can’t make a deep copy of this object

![](https://user-gold-cdn.xitu.io/2018/3/28/1626b1ec2d3f9e41?w=840&h=100&f=png&s=30123)

Encountering function or `undefined`,  the object can also not be serialized properly.
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

But usually, complex data can be serialized, so this method can solve most problems, and as a built-in function, it has the fastest performance when dealing with the deep copy. Certainly, you can use [the deep copy function of `loadash` ](https://lodash.com/docs#cloneDeep) when your data contains the above three cases.

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

#### the differences between call, apply, bind

Firstly, let’s tell the difference between the former two.

Both `call`  and `apply`  are used to change what `this` refers to.Their role is the same, but the way to pass the parameters is different.

In addition to the first parameter,  `call` can accept an argument list, while  `apply` accepts a single array of arguments.

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

##### simulation to implement   `call` and  `apply`

We can consider how to implement them from the following points

* If the first parameter isn’t passed, then the first parameter will default to  `window`
* Change what  `this` refers to, which makes new object capable of executing the function. Then let’s think like this: add a function to a new object and then delete it after the execution.

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

let’s simulate `bind`

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
      return new _this(args, ...arguments)
    }
    return _this.apply(context, args.concat(arguments))
  }
}
```

#### Promise implementation

`Promise` is a new syntax introduced by ES6, which resolves the problem of  callback hell.

Promise can be seen as a state machine and it's initial state is `pending`. We can change the state to `resolved` or `rejected` by using the `resolve` and `reject` functions. Once the state is changed, it cannot be changed again.

The function `then` returns a Promise instance, which is a new instance instead of the previous one. And that's because the Promise specification states that in addition to the `pending` state, other states cannot be changed, and multiple calls of function `then`  will be meaningless if the same instance is returned.

For `then`, it can essentially be seen as `flatMap`

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


#### Throttle

`Debounce` and `Throttle` are different in nature. `Debounce` is to turn multiple executions into the last execution, and `Throttle` is to turn multiple executions into execution at regular intervals.

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

#### Map、FlapMap and Reduce

The effect of the `Map` is to generate a new array, iterate over the original array, take each element out to do some transformation, and then `append` to the new array.

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

The effect of `FlapMap` is almost the same with a `Map`, but the original array will be dimensioned for multidimensional arrays. You can think of `FlapMap` as a `map` and a `flatten`, which is currently not supported in browsers.

```js
[1, [2], 3].flatMap((v) => v + 1)
// -> [2, 3, 4]
```

You can achieve this when you want to completely reduce the dimensions of a multidimensional array.

```js
const flattenDeep = (arr) => Array.isArray(arr)
  ? arr.reduce( (a, b) => [...flattenDeep(a), ...flattenDeep(b)] , [])
  : [arr]

flattenDeep([1, [[2], [3, [4]], 5]])
```

The effect of `Reduce` is to combine the values in the array and finally get a value

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


#### async and await

A function with `async`, then the function will return a `Promise`.

```js
async function test() {
  return "1";
}
console.log(test()); // -> Promise {<resolved>: "1"}
```

You can think of `async` as wrapping a function using `Promise.resolve()`.

`await` can only be used in `async` functions.

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

The above code will print `finish` before printing `object`. Because `await` waits for the `sleep` function `resolve`, even if the synchronization code is followed, synchronization code is not executed before the asynchronization code is executed.

The advantage of `async` and `await` compared to the direct use of `Promise` lies in handling the call chain of `then`, which can write code more clearly and accurately. The downside is that misuse of `await` can cause performance problems because `await` blocks the code. Perhaps the asynchronous code does not depend on the former, but it still needs to wait for the former to complete, causing the code to lose concurrency.

Let's look at a code that uses `await`.

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

You may have doubts about the above code, here explain the principle

- First the function `b` is executed. The variable `a` is still 0 before execution  `await 10`, Because the `generators` are implemented inside `await` and  `Generators` will keep things in the stack, so at this time `a = 0` is saved
- Because `await` is an asynchronous operation, `console.log('1', a)` will be executed first.
- At this point, the synchronization code is executed and asynchronous code is started. The saved value is used. At this time, `a = 10`
- Then comes the usual code execution

#### Proxy

Proxy is a new feature since ES6. It can be used to define operations in objects.

```js
let p = new Proxy(target, handler);
// `target` represents the object to add the proxy to
// `handler` customizes operations in the object
```

Proxy can be handly for the implementation of data binding and listening.

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

#### Why 0.1 + 0.2 != 0.3

Because JS incorporated IEEE 754 for double float numbers (64 bits). Every language that uses this standard has this problem.

As you know, computers uses binaries to represent decimals, so `0.1` in binary is represented as

```js
// (0011) represents cycle
0.1 = 2^-4 * 1.10011(0011)
```

How did we come to this binary number? We can try computing it as below:

![](https://user-gold-cdn.xitu.io/2018/4/26/162ffcb7fc1ca5a9?w=800&h=1300&f=png&s=83139)

Binary computations in float numbers are different from those in integers. For multiplications, only the float bits are computed, while the integer bits are used for the binaries for each bit. Then the first bit is used as the most significant bit. Therefore we get `0.1 = 2^-4 * 1.10011(0011)`.

`0.2` is similar. We just need to get rid of the first multiplcation and get `0.2 = 2^-3 * 1.10011(0011)`.

Back to the double float for IEEE 754 standard. Among the 64 bits, one bit is used for signing, 11 used for integer bits, and the rest 52 bits are floats. Since `0.1` and `0.2` are infinitely cycling binaries, the last bit of the floats needs to indicate whether to round (same as rounding in decimals).

After rounding, `2^-4 * 1.10011...001` becomes `2^-4 * 1.10011(0011 * 12次)010`. After adding these two binaries we get `2^-2 * 1.0011(0011 * 11次)0100`, which is `0.30000000000000004` in decimals.

The native solution to this problem is shown below:

```js
parseFloat((0.1 + 0.2).toFixed(10))
```

#### Regular Expressions

##### Metacharacters

| Metacharacter | Effect                                                                                                                   |
| :-----------: | :----------------------------------------------------------------------------------------------------------------------: |
| .             | Matches any character other than the new line character                                                                  |
| []            | matches anything within the brackets. For example, [0-9] can match any number                                            |
| ^             | ^9 means matching anything that starts with '9'; [`^`9] means not matching characters other than '9' in between brackets |
| {1, 2}        | matches 1 or 2 digit characters                                                                                          |
| (yck)         | only matches strings the same as 'yck'                                                                                   |
| \|            | matches any character before of after \|                                                                                 |
| \             | escape character                                                                                                         |
| *             | only matches character before '*' appearing -1 times or above                                                            |
| +             | only matches character before '+' appearing 0 times or above                                                             |
| ?             | the character before '?' is optional                                                                                     |

##### Modifiers

| Modifier | Effect           |
| :------: | :--------------: |
| i        | ignores casing   |
| g        | matches globally |
| m        | multiline        |

##### Character Shorthands

| shorthand |            Effect            |
| :--: | :------------------------: |
|  \w  | alphanumeric characters, underline character or Chinese characters |
|  \W  |         the opposite of the above         |
|  \s  |      any blank character      |
|  \S  |         the opposite of the above         |
|  \d  |          numbers          |
|  \D  |         the opposite of the above         |
|  \b  |    start or end of a word    |
|  \B  |         the opposite of the above         |

