# Front-End-Interview-Map

# JS



#### 内置类型

JS 中分为七种内置类型，七种内置类型又分为两大类型：基本类型和对象（Object）。

基本类型有六种： `null`，`undefined`，`boolean`，`number`，`string`，`symbol`。

其中 JS 的数字类型是浮点类型的，没有整型。并且浮点类型基于 IEEE 754标准实现，在使用中会遇到某些 Bug。详情请见此处（0.1+0.2==0.3 TODO）。

对于基本类型来说，如果使用字面量的方式，那么这个变量只是个字面量，只有在必要的时候才会转换为对应的类型

```js
let a = 111 // 这只是字面量，不是 number 类型
a.toString() // 使用时候才会转换类型
```

对象（Object）是引用类型，在使用过程中会遇到浅拷贝和深拷贝的问题（TODO）。

```js
let a = { name: 'FE' }
let b = a
b.name = 'EF'
console.log(a) // EF
```

#### Typeof 运算符

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

##### 比较运算符

1. 如果是对象，就通过 `toPrimitive` 转换对象
2. 如果是字符串，就通过 `unicode` 字符索引来比较