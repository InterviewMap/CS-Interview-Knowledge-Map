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


