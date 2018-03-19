# Front-End-Interview-Map

# JS



#### 内置类型

JS 中分为七种内置类型，七种内置类型又分为两大类型：基本类型和对象（Object）。

基本类型有六种： `null`，`undefined`，`boolean`，`number`，`string`，`symbol`。

其中 JS 的数字类型是浮点类型的，没有整型。并且浮点类型基于 IEEE 754标准实现，在使用中会遇到某些 Bug。详情请见此处（0.1+0.2==0.3 TODO）。

对象（Object）是引用类型，在使用过程中会遇到浅拷贝和深拷贝的问题（TODO）。

```js
let a = { name: 'FE' }
let b = a
b.name = 'EF'
console.log(a) // EF
```

