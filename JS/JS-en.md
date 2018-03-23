- [Built-in Types](#Built-in Types)

#### Built-in Types
There are seven built-in types in Javascript, which are divided into two major types: Basic Types and Objects.

There are six basic types: `null`,`undefined`,`boolean`,`number`,`string`,`symbol`.

It is to be noted that the number type of Javascript is a floating-point type, there is no integral type. What is more, some bugs are encountered in use because the floating-point type is implemented based on IEEE 754 standard. For details, please see here(0.1+0.2==0.3 TODO). `NaN` also belongs to the `number` type, and `NaN` is not equal to itself.

For a basic type, the variable is only a literal and is converted to the corresponding type only when necessary if you use it in a literal way.

```js
let a = 111 // this is only a literal，not a number type
a.toString() // convert to object type when used
```

Objects (object) are reference types and can encounter problems with shallow copies and deep copies when used (TODO).

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

As for `null` , it is always be treated as an  `object`  by `typeof`，although it is a primitive data type, and this  happening is a bug that has been around for a long time.
```js
typeof null // 'object'
```

PS：why does this happen ?  Because in JS, those whom’s top three bits of the binary are zero, will all be judged as the `object` type, and the binary bits of  `null`   are all  zero, so  `null`  is judged as  an `object`.

We can use `Object.prototype.toString.call(xx)`  if we wish to get the correct data type of a variable , and then we can get a string like `[Object Type]`


#### This

`This`, a concept that many people will confuse, is not difficult to understand ,as long as you remember the following rules

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

// In the above two situations, `this` only depends on the object before calling the function, and the second case has higher priority than the first case .

// the following situation has the highest priority，`this` will only be bound to c，and there's no way to change what `this` is bound to .

var c = new foo();
c.a = 3;
console.log(c.a);

// finally, using `call、apply、bind` to change what `this` is bound to , is another situation whom's priority is only second to `new`
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
Actually , the arrow function does not have `this` , `this` in the above function only depends on the `this` of the first function outside that is not arrow function . In above case , `this` is default to `window` because calling a matches the first situation in the above codes 。 And , what `this` is bound to will not be changed by any code once `this` is bound to the context

