- [Built-in Types](#Built-in Types)
- [Typeof](#Typeof)
- [New](#New)
- [This](#This)
- [instanceof](#instanceof)
- [scope](#scope)
- [Prototypes](#Prototypes)

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

As for `null` , it is always be treated as an  `object`  by `typeof` , although it is a primitive data type, and this  happening is a bug that has been around for a long time.
```js
typeof null // 'object'
```

PS：why does this happen?  Because in JS, those whom’s first three bits of the binary are zero, will all be judged as the `object` type, and the binary bits of  `null`  are all  zero, so  `null`  is judged as  an `object`.

We can use `Object.prototype.toString.call(xx)`  if we wish to get the correct data type of a variable , and then we can get a string like `[Object Type]`


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

For `new`, we also need to pay attention to the operator precedence.

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

#### Prototypes

![](https://camo.githubusercontent.com/71cab2efcf6fb8401a2f0ef49443dd94bffc1373/68747470733a2f2f757365722d676f6c642d63646e2e786974752e696f2f323031382f332f31332f313632316538613962636230383732643f773d34383826683d35393026663d706e6726733d313531373232)

Each function, besides `Function.prototype.bind()` , has an internal property, denoted as `prototype` , which is a reference to the prototype.

Each object has an internal property, denoted as `__proto__` , which is a reference to the prototype of the constructor that created the object. This property actually references to `[[prototype]]` , but `[[prototype]]` is an internal property that we can’t access, so we use `__proto__` to access it.

Objects can use `__proto__` to find properties that do not belong to the object, and `__proto__` connects objects together to form a prototype chain.


#### Promise implementation

`Promise` is a new syntax introduced by ES6, which resolves the problem of  callback hell.

Promise can be seen as a state machine and it's initial state is `pending`. We can change the state to `resolved` or `rejected` by using the `resolve` and `reject` functions. Once the state is changed, it cannot be changed again.

The function `then` returns a Promise instance, which is a new instance instead of the previous one. And that's because the Promise specification states that in addition to the `pending` state, other states cannot be changed, and multiple calls of function `then`  will be meaningless if the same instance is returned.

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