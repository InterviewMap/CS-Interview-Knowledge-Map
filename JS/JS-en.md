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

