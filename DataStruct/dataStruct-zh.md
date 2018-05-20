# 栈

## 原理

栈是一个线性结构，在计算机中是一个相当常见的数据结构。

栈的特点是只能在某一端添加或删除数据，遵循先进后出的原则

![](https://user-gold-cdn.xitu.io/2018/5/20/1637b785d2d68735?w=640&h=460&f=png&s=6932)

## 实现

每种数据结构都可以用很多种方式来实现，其实可以把栈看成是数组的一个子集，所以这里使用数组来实现

```js
class Stack {
  constructor() {
    this.stack = []
  }
  push(item) {
    this.stack.push(item)
  }
  pop() {
    this.stack.pop()
  }
  peek() {
    return this.stack[this.getCount() - 1]
  }
  getCount() {
    return this.stack.length
  }
  isEmpty() {
    return this.getCount() === 0
  }
}
```

## 应用

选取了 [LeetCode 上序号为 20 的题目](https://leetcode.com/problems/valid-parentheses/submissions/1)

题意是匹配括号，可以通过栈的特性来完成这道题目

```js
var isValid = function (s) {
  let map = {
    '(': -1,
    ')': 1,
    '[': -2,
    ']': 2,
    '{': -3,
    '}': 3
  }
  let stack = []
  for (let i = 0; i < s.length; i++) {
    if (map[s[i]] < 0) {
      stack.push(s[i])
    } else {
      let last = stack.pop()
      if (map[last] + map[s[i]] != 0) return false
    }
  }
  if (stack.length > 0) return false
  return true
};
```

# 队列

## 原理

队列一个线性结构，特点是在某一端添加数据，在另一端删除数据，遵循先进先出的原则。

![](https://user-gold-cdn.xitu.io/2018/5/20/1637cba2a6155793?w=640&h=419&f=png&s=15737)

## 实现

这里会讲解两种实现队列的方式，分别是单链队列和循环队列。

### 单链队列

```js
class Queue {
  constructor() {
    this.queue = []
  }
  enQueue(item) {
    this.queue.push(item)
  }
  deQueue() {
    this.queue.shift()
  }
  getHeader() {
    return this.queue[0]
  }
  getLength() {
    return this.queue.length
  }
  isEmpty() {
    return this.getLength() === 0
  }
}
```

因为单链队列在出队操作的时候需要 O(n) 的时间复杂度，所以引入了循环队列。循环队列的出队操作平均是 O(1) 的时间复杂度。