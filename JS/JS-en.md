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

As for `null` , it is always be treated as an  `object`  by `typeof` , although it is a primitive data type, and this  happening is a bug that has been around for a long time.
```js
typeof null // 'object'
```

PS：why does this happen ?  Because in JS, those whom’s first three bits of the binary are zero, will all be judged as the `object` type, and the binary bits of  `null`  are all  zero, so  `null`  is judged as  an `object`.

We can use `Object.prototype.toString.call(xx)`  if we wish to get the correct data type of a variable , and then we can get a string like `[Object Type]`


#### New

1.   Create a new object
2.   Chained to prototype
3.   Bind this
4.   Return a new object

The above four things will happen in the process of calling `new`,We can also try to implement a `new `by ourselves.

```js
function create() {
  //Create an empty object
  let obj = new Object()
  //Get the constructor
  let Con = [].shift.call(arguments)
  //Chained to prototype
  obj.__proto__ = Con.prototype
  //Bind this, Execute the constructor
  let result = Con.apply(obj, arguments)
  //Make sure the new one is an object
  return typeof result === 'object'? result : obj
}
```

Instance of object are created with `new`,Whether `function Foo()`, or `let a = { b: 1 }`.

For creating an object, It is recommended to create an object using literal(Whether performance or readability). Because you need to find `Object` by the scope chain when you create an object using `new Object()`, But you don't have this problem when you use literal.

```js
function Foo() {}
//function is a syntactical sugar
//Internally equivalent to new Function()
let a = { b: 1 }
//Inside this literal is also used new Object()
```


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
    // get the prototype of the type
    let prototype = right.prototype
    // get the prototype of the object
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

Using `var`  is more likely to make mistake , thus ES6 introduces a new keyword `let`  .  `let`  has an  important feature that it can’t be used before hoisting , which mismatches the often saying that `let` doesn’t  have the ability of hoisting . Indeed, `let`  hoists all it declared , and  the memory space for it has been allocated  in first stage , but it can’t be used before hoisting due to it’s feature mentioned above .