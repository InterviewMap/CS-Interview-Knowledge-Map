# Time Complexity

The worst time complexity is often used to measure the quality of an algorithm.

The constant time O(1) means that this operation has nothing to do with the amount of data. It is a fixed-time operation, such as arithmetic operation.

For an algorithm, it is possible to calculate the operation numbers of  `aN + 1`, N represents the amount of data. Then the time complexity of the algorithm is O(N). Because when we calculate the time complexity, the amount of data is usually very large, when low-order terms and constant terms are negligible.

Of course, it may happen that both algorithms are O(N) time complexity, then comparing the low-order terms and the constant terms of the two algorithms.

# Bit Operation

Bit operation is useful in algorithms and can be much faster than arithmetic operations.

Before learning bit operation, you should know how decimal converts to binary and how binary turns to decimal. Here is a simple calculation method.

- Decimal `33` can be seen as `32 + 1` and `33` should be six-bit binary (Because 33 is approximately 32, and 32 is the fifth power of 2, so it is six bit), so the decimal `33` is `100001`, as long as it is the power of 2, then it is 1 otherwise it is 0.
- Then binary `100001` is the same, the first is `2^5`, the last is `2^0`, and the sum is 33

## Shift Arithmetic Left <<

```js
10 << 1 // -> 20
```

Shift arithmetic left is to move all the binary to the left, `10` is represented as `1010` in binary, after shifting one bit to the left becomes `10100`, and converted to decimal is 20, so the left shift can be basically regarded as the following formula `a << b => a * (2 ^ b)`.

## Shift Arithmetic Right >>

```js
10 >> 1 // -> 5
```

The bitwise right shift moves all the binary digits to the right and remove the extra left digit. `10` is represented as `1010` in binary, and becomes `101` after shifting one bit to the right, and becomes 5 in decimal value, so the right shift is basically the following formula: `a >> b => a / (2 ^ b)`.

Right shift is very useful, for example, you can calculate the intermediate value in the binary algorithm.

```js
13 >> 1 // -> 6
```

## Bitwise Operation

**Bitwise And**

Each bit is 1, and the result is 1

```js
8 & 7 // -> 0
// 1000 & 0111 -> 0000 -> 0
```

**Bitwise Or**

One of bit is 1, and the result is 1

```js
8 | 7 // -> 15
// 1000 | 0111 -> 1111 -> 15
```

**Bitwise XOR**

Each bit is different, and the result is 1

```js
8 ^ 7 // -> 15
8 ^ 8 // -> 0
// 1000 ^ 0111 -> 1111 -> 15
// 1000 ^ 1000 -> 0000 -> 0
```

From the above code, we can find that the bitwise XOR is the not carry addition.

**Interview Question**：Not using arithmetic operation to get the sum of two numbers

This question can use bitwise XOR, because bitwise XOR is not carry addition, `8 ^ 8 = 0`, but if carry it will be 16 , so we only need to XOR the two numbers and then carry. So, if both bit is 1, and there should be a carry 1 on the left, so the following formula can be obtained `a + b = a ^ b + (a & b) << 1` , then simulate addition by recursive.

```js
function sum(a, b) {
    if (a == 0) return b
    if (b == 0) return a
    let newA = a ^ b
    let newB = (a & b) << 1
    return sum(newA, newB)
}
```

# Sort

The following two functions will be used in sorting commonly, so I don't write them one by one.

```js
function checkArray(array) {
    if (!array || array.length <= 2) return
}
function swap(array, left, right) {
    let rightValue = array[right]
    array[right] = array[left]
    array[left] = rightValue
}
```

## Bubble Sort

The principle of bubble sort is as follows, starting with the first element, and comparing the current element with the next index element. If the current element is larger, then swap them and repeat until the last element is compared, then the last element at this time is the largest number in the array. The above operation is repeated in the next round, but the last element is already the maximum number, so there is no need to compare the last element, only the position of `length - 1` is needed.

<div align="center">
<img src="https://user-gold-cdn.xitu.io/2018/4/12/162b895b452b306c?w=670&h=508&f=gif&s=282307" width="500" />
</div>

The following code is implement of the algorithm.

```js
function bubble(array) {
  checkArray(array);
  for (let i = array.length - 1; i > 0; i--) {
    // Traversing from 0 to `length - 1`
    for (let j = 0; j < i; j++) {
      if (array[j] > array[j + 1]) swap(array, j, j + 1)
    }
  }
  return array;
}
```

The operation numbers of the algorithm is an arithmetic progression `n + (n - 1) + (n - 2) + 1` . After removing the constant part, the time complexity is `O(n * n)`.

## Insert Sort

The principle of insert sort is as follows. The first element is default as the sorted element, taking the next element and comparing it to the current element, swapping them if the current element is larger. Then the first element is the minimum number at this time, so the next operation starts from the third element, and repeats the previous operation.

<div align="center"><img src="https://user-gold-cdn.xitu.io/2018/4/12/162b895c7e59dcd1?w=670&h=508&f=gif&s=609549" width="500" style="display:block;margin: 0 auto" /></div>

The following code is implement of the algorithm.

```js
function insertion(array) {
  checkArray(array);
  for (let i = 1; i < array.length; i++) {
    for (let j = i - 1; j >= 0 && array[j] > array[j + 1]; j--)
      swap(array, j, j + 1);
  }
  return array;
}
```

The operation numbers of the algorithm is an arithmetic progression `n + (n - 1) + (n - 2) + 1` . After removing the constant part, the time complexity is `O(n * n)`.

## Select Sort

The principle of select sort is as follows. Traverse the array, set the index of minimum to 0. If the extracted value is smaller than the current minimum, replace the minimum index. After the traversal is completed, the value on the first element and the minimum index are exchanged. After the above operation, the first element is the minimum value in the array, and the next operation starts from index 1 and repeats the previous opration.

<div align="center"><img src="https://user-gold-cdn.xitu.io/2018/4/13/162bc8ea14567e2e?w=670&h=508&f=gif&s=965636" width="500" style="display:block;margin: 0 auto" /></div>

The following code is implement of the algorithm.

```js
function selection(array) {
  checkArray(array);
  for (let i = 0; i < array.length - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < array.length; j++) {
      minIndex = array[j] < array[minIndex] ? j : minIndex;
    }
    swap(array, i, minIndex);
  }
  return array;
}
```

The operation numbers of the algorithm is an arithmetic progression `n + (n - 1) + (n - 2) + 1` . After removing the constant part, the time complexity is `O(n * n)`.

## Merge Sort

The principle of merge sort is as follows. Divide the array into two parts by recursion until one array contains at most two elements, then sort the array and merge them into a sorted array. Suppose I have a set of array `[3, 1, 2, 8, 9, 7, 6]`, the intermediate index is 3, and the array `[3, 1, 2, 8]` is sorted first. On this left array, continue splitting until the array becomes two elements (if the array length is odd, there will be a array containing only one element). Then sort the array `[3, 1]` and `[2, 8]`, and then sort the array `[1, 3, 2, 8]`, this time the left array is sorted, then sort the right array according to the above method, and finally sort the array `[1, 2, 3, 8]` and `[6, 7, 9]`.

<div align="center"><img src="https://user-gold-cdn.xitu.io/2018/4/13/162be13c7e30bd86?w=896&h=1008&f=gif&s=937952" width=500 /></div>

The following code is implement of the algorithm.

```js
function sort(array) {
  checkArray(array);
  mergeSort(array, 0, array.length - 1);
  return array;
}

function mergeSort(array, left, right) {
  // The left and right indexes are the same. 
  // means there is only one element.
  if (left === right) return;
  // Equivalent to `left + (right - left) / 2`
  // More secure than `(left + right) / 2`, 
  // and the index will not out of bounds
  // Bit operations are used because bit operations 
  // are faster than arithmetic operation
  let mid = parseInt(left + ((right - left) >> 1));
  mergeSort(array, left, mid);
  mergeSort(array, mid + 1, right);

  let help = [];
  let i = 0;
  let p1 = left;
  let p2 = mid + 1;
  while (p1 <= mid && p2 <= right) {
    help[i++] = array[p1] < array[p2] ? array[p1++] : array[p2++];
  }
  while (p1 <= mid) {
    help[i++] = array[p1++];
  }
  while (p2 <= right) {
    help[i++] = array[p2++];
  }
  for (let i = 0; i < help.length; i++) {
    array[left + i] = help[i];
  }
  return array;
}
```

The above algorithm uses the idea of recursion. The essence of recursion is pushed into stack. Whenever a function is executed recursively, the information of the function (such as parameters, internal variables, the number of rows has executed) is pushed into stack until a termination condition is encountered, then pop stack and continue execute the function. The call trajectory for the above recursive function is as follows.

```js
mergeSort(data, 0, 6) // mid = 3
  mergeSort(data, 0, 3) // mid = 1
    mergeSort(data, 0, 1) // mid = 0
      mergeSort(data, 0, 0) // return to the previous step
    mergeSort(data, 1, 1) // return to the previous step
    // Sort p1 = 0, p2 = mid + 1 = 1
    // Fall back to `mergeSort(data, 0, 3)` 
    // and perform the next recursion
  mergeSort(2, 3) // mid = 2
    mergeSort(3, 3) // return to the previous step
  // Sort p1 = 2, p2 = mid + 1 = 3
  // Fall back to `mergeSort(data, 0, 3)` and execution merge logic
  // Sort p1 = 0, p2 = mid + 1 = 2
  // Execution completed
  // The array on the left is sorted,
  // and the right side is also sorted like this
```

The operation numbers of the algorithm can be calculated as follows: recursively twice and each time the amount of data is half of the array, and finally the entire array is iterated once, so the expression `2T(N / 2) + T(N) `( T represent time and N represent data amount). According to the expression, the [formula](https://www.wikiwand.com/en/Master_theorem_(analysis_of_algorithms))  can be applied to get a time complexity of `O(N * logN)`.

## Quick Sort

The principle of quick sort is as follows. Randomly select a value in the array as the reference value, and compare the value with the reference value from left to right.Move the value to the left of the array if it is smaller than the reference value, and the larger one move to the right. The reference value is exchanged with the value which first larger than the reference value after the comparison completed. Then divide the array into two parts through the position of the reference value and continue the recursive operation.

<div align="center"><img src="https://user-gold-cdn.xitu.io/2018/4/16/162cd23e69ca9ea3?w=824&h=506&f=gif&s=867744" width=500 /></div>

The following code is implement of the algorithm.

```js
function sort(array) {
  checkArray(array);
  quickSort(array, 0, array.length - 1);
  return array;
}

function quickSort(array, left, right) {
  if (left < right) {
    swap(array, , right)
    // Randomly take values and then swap it with the end,
    // which is slightly less complex than take a fixed position
    let indexs = part(array, parseInt(Math.random() * (right - left + 1)) + left, right);
    quickSort(array, left, indexs[0]);
    quickSort(array, indexs[1] + 1, right);
  }
}
function part(array, left, right) {
  let less = left - 1;
  let more = right;
  while (left < more) {
    if (array[left] < array[right]) {
      // The current value is smaller than the reference value,
      // and both `less` and `left` are added one.
	   ++less;
       ++left;
    } else if (array[left] > array[right]) {
      // The current value is larger than the reference value, 
      // and the current value is exchanged with 
      // the value on the right.
      // And don't change `left`, because the current value
      // has not been judged yet.
      swap(array, --more, left);
    } else {
      // Same as the reference value, only move the index
      left++;
    }
  }
  // Exchange the reference value with the value 
  // which is first larger than the reference value.
  // Thus the array becomes `[less than the reference value, 
  // the reference value, larger than the reference value]`.
  swap(array, right, more);
  return [less, more];
}
```

The time complexity is same as merge sort, but the extra space complexity is less than the merge sort, only `O(logN)` is needed, and the constant time also smaller than the merge sort.

### Interview Question

**Sort Colors**：The topic is from [LeetCode](https://leetcode.com/problems/sort-colors/description/)，The problem requires us to sort `[2,0,2,1,1,0]` into `[0,0,1,1,2,2]`, and this problem can use the idea of three-way quicksort.

The following code is implement of the algorithm.

```js
var sortColors = function(nums) {
  let left = -1;
  let right = nums.length;
  let i = 0;
  // If the index encounters right, 
  // it indicates that the sort has been completed.
  while (i < right) {
    if (nums[i] == 0) {
      swap(nums, i++, ++left);
    } else if (nums[i] == 1) {
      i++;
    } else {
      swap(nums, i, --right);
    }
  }
};
```

**Kth Largest Element in an Array**：The topic is from [LeetCode](https://leetcode.com/problems/kth-largest-element-in-an-array/description/)，The problem needs to find the Kth largest element in the array. This problem can also use the idea of quicksort. And because it is to find out the Kth element, in the process of separating the array, you can find out which side of the element you need, and then just sort the corresponding side array.

The following code is implement of the algorithm.

```js
var findKthLargest = function(nums, k) {
  let l = 0
  let r = nums.length - 1
  // Get the index of the Kth largest element
  k = nums.length - k
  while (l < r) {
    // After separating the array, get the element
    // which first larger than the reference element
    let index = part(nums, l, r)
    // Compare the index with the k
    if (index < k) {
      l = index + 1
    } else if (index > k) {
      r = index - 1
    } else {
      break
    }
  }
  return nums[k]
};
function part(array, left, right) {
  let less = left - 1;
  let more = right;
  while (left < more) {
    if (array[left] < array[right]) {
	   ++less;
       ++left;
    } else if (array[left] > array[right]) {
      swap(array, --more, left);
    } else {
      left++;
    }
  }
  swap(array, right, more);
  return more;
}
```

## Heap Sort

Heap sort takes advantage of the characteristics with the binary heap, which is usually represented by an array, and the binary heap is a complete binary tree (all leaf nodes (the lowest node) are sorted from left to right, and others nodes are all full). The binary heap is divided into max-head and min-heap.

- A max-heap is all child nodes value smaller than the node value.
- A min-heap is all child nodes value larger than the node value.

The principle of heap sort is to compose a max-heap or a min-heap. Taking a min-heap as an example, the index of the left child node is `i * 2 + 1`, and the right node is `i * 2 + 2`, and the parent node is `(i - 1) / 2`.

1. First at all traverse the array to determine if the parent node is smaller than current node. If true, swap the position and continue to judge until his parent node is larger than him.
2. Repeat the above operation 1, until the first position of the array is the maximum.
3. Then swap the first and last position and minus 1with the length of the array, indicating that the end of the array is the maximum, it is no need to compare with it.
4. Compare with the left and right nodes, then remember the index of the larger node and compare it with the parent node. If the child node is larger, then swap them.
5. Repeat the above steps 3 - 4 until the whole array is a max-heap.

<div align="center"><img src="https://user-gold-cdn.xitu.io/2018/4/17/162d2a9ff258dfe1?w=1372&h=394&f=gif&s=1018181" width=500 /></div>

The following code is implement of the algorithm.

```js
function heap(array) {
  checkArray(array);
  // Exchange the maximum value to the first position
  for (let i = 0; i < array.length; i++) {
    heapInsert(array, i);
  }
  let size = array.length;
  // Exchange first and last position
  swap(array, 0, --size);
  while (size > 0) {
    heapify(array, 0, size);
    swap(array, 0, --size);
  }
  return array;
}

function heapInsert(array, index) {
  // Exchange them if current node larger than parent node
  while (array[index] > array[parseInt((index - 1) / 2)]) {
    swap(array, index, parseInt((index - 1) / 2));
    // Change the index to the parent node
    index = parseInt((index - 1) / 2);
  }
}
function heapify(array, index, size) {
  let left = index * 2 + 1;
  while (left < size) {
    // Judge the size of the left and right node
    let largest =
      left + 1 < size && array[left] < array[left + 1] ? left + 1 : left;
    // Judge the size of the child and parent node
    largest = array[index] < array[largest] ? largest : index;
    if (largest === index) break;
    swap(array, index, largest);
    index = largest;
    left = index * 2 + 1;
  }
}
```

The above code implements a min-heap. If you need to implement a max-heap, you only need to reverse the comparison.

The time complexity of the algorithm is `O(logN)`.

## System Comes With Sorting Implementation

The internal implementation of sorting for each language is different.

For JS, it will use quick sort if array length greater than 10, otherwise will use insert sort [Source implementation](https://github.com/v8/v8/blob/ad82a40509c5b5b4680d4299c8f08d6c6d31af3c/src/js/array.js#L760:7) . The insert sort is chosen because although the time complexity is very poor, it is almost the same as `O(N * logN)` when the amount of data is small, but the constant time required for insert sort is small, so it is faster than other sorts. 

For Java, the type of elements inside is also considered. For arrays that store objects, a stable algorithm is used. Stability means that the relative order cannot be changed for the same value.

<div align="center"><img src="https://user-gold-cdn.xitu.io/2018/4/18/162d7df247dcda00?w=440&h=727&f=png&s=38002" height=500 /></div>

# Linked List

## Reverse Singly Linked List

The topic is from [LeetCode](https://leetcode.com/problems/reverse-linked-list/description/)，The problem needs to reverse a singly linked list. The idea is very simple. Use three variables to represent the current node and the previous and next nodes of current node. Although this question is very simple, it is an regular interview question.

The following code is implement of the algorithm.

```js
var reverseList = function(head) {
    // Judge the problem of variable boundary
    if (!head || !head.next) return head
    // The initial setting is empty because the first node is the tail when it is inverted, and the tail node points to null
    let pre = null
    let current = head
    let next
    // Judge if the current node is empty
    // Get the next node of the current node if it is not empty
    // Then set the next node of current to the previous node.
    // Then set current to the next node and pre to the current node
    while(current) {
        next = current.next
        current.next = pre
        pre = current
        current = next
    }
    return pre
};
```



# Tree

## Preorder, Inorder, Postorder Traversal of Binary Tree

Preorder traversal means that the root node is accessed first, then the left node is accessed, and the right node is accessed last.

Inorder traversal means that the left node is accessed first, then the root node is accessed, and the right node is accessed last.

Postorder traversal means that the left node is accessed first, then the right node is accessed, and the root node is accessed last.

### Recursive Implementation

Recursive implementation is quite simple, the code is as follows.

```js
function TreeNode(val) {
  this.val = val;
  this.left = this.right = null;
}
var traversal = function(root) {
  if (root) {
    // Preorder
    console.log(root); 
    traversal(root.left);
    // Inorder
    // console.log(root); 
    traversal(root.right);
    // Postorder
    // console.log(root);
  }
};
```

For recursive implementation, you only need to understand that each node will be accessed three times so you will understand why this is done.

### Non-Recursive Implementation

The non-recursive implementation uses the structure of the stack, realize the recursive implementation by implementing the FILO of the stack.

The following code is implementation of the preorder traversal.

```js
function pre(root) {
  if (root) {
    let stack = [];
    // Push the root node first
    stack.push(root);
    // Determine if the stack is empty
    while (stack.length > 0) {
      // Pop the top element
      root = stack.pop();
      console.log(root);
      // Because the preorder traversal is first left and then right, 
      // the stack is a structure of FILO.
      // So push the right node and then push the left node.
      if (root.right) {
        stack.push(root.right);
      }
      if (root.left) {
        stack.push(root.left);
      }
    }
  }
}
```

The following code is implementation of the inorder traversal. 

```js
function mid(root) {
  if (root) {
    let stack = [];
    // The inorder traversal is first left, then root and last right node
    // So first should traverse the left node and push it to the stack.
    // When there is no node on the left,
    // the top node is printed and then find the right node.
    // For the leftmost leaf node, 
    // you can think of it as the parent of two null nodes.
    // If you can't print anything on the left, 
    // take the parent node out and print it, then look at the right node.
    while (stack.length > 0 || root) {
      if (root) {
        stack.push(root);
        root = root.left;
      } else {
        root = stack.pop();
        console.log(root);
        root = root.right;
      }
    }
  }
}
```

The following code is the postorder traversal implementation that uses two stacks to implement traversal, which is easier to understand than a stack traversal.

```js
function pos(root) {
  if (root) {
    let stack1 = [];
    let stack2 = [];
    // Postorder traversal is first left, then right and last root node
	// So for a stack, you should first push the root node
    // Then push the right node, and finally push the left node
    stack1.push(root);
    while (stack1.length > 0) {
      root = stack1.pop();
      stack2.push(root);
      if (root.left) {
        stack1.push(root.left);
      }
      if (root.right) {
        stack1.push(root.right);
      }
    }
    while (stack2.length > 0) {
      console.log(s2.pop());
    }
  }
}
```

## Predecessor and Successor Nodes of the Inorder Traversal

The premise of implementing this algorithm is that the node has a `parent` pointer to the parent node and a root node to `null` .

<div align="center"><img src="https://user-gold-cdn.xitu.io/2018/4/24/162f61ad8e8588b7?w=682&h=486&f=png&s=41027" width=400 /></div>

As shown, the tree's inorder traversal result is `4, 2, 5, 1, 6, 3, 7`

### Predecessor Node

For node `2`, his predecessor node is`4 `. According to the principle of inorder traversal, the following conclusions can be drawn.

1. If the left node of the selected node is not empty, look for the rightmost node of the left node. For node `1`, he has left node `2`, then the rightmost node of node `2` is `5`
2. If the left node is empty and the target node is the right node of the parent node, then the predecessor node is the parent node. For node `5`, there is no left node and it is the right node of node `2`, so node `2` is the precursor node.
3. If the left node is empty and the target node is the left node of the parent node, look up the first node that is the right node of the parent node. For node `6`, there is no left node, and it is the left node of node `3`. So look up to node `1` and find that node `3` is the right node of node `1`, so node `1` is the predecessor of node `6`.

The following code is implement of the algorithm.

```js
function predecessor(node) {
  if (!node) return 
  // Conclusion 1
  if (node.left) {
    return getRight(node.left)
  } else {
    let parent = node.parent
    // Conclusion 2 3 judgment
    while(parent && parent.right === node) {
      node = parent
      parent = node.parent
    }
    return parent
  }
}
function getRight(node) {
  if (!node) return 
  node = node.right
  while(node) node = node.right
  return node
}
```

### Successor Node

For node `2`, his successor is `5`, according to the principle of inorder traversal, you can draw the following conclusions.

1. If there is a right node, the leftmost node of the right node will be found. For node `1`, he has a right node `3`, then the leftmost node of node `3` is `6`.
2. If there is no right node, it traverses up until it finds a node that is the left node of the parent node. For node `5`, if there is no right node, it will look up to node `2`, which is the left node of parent node `1`, so node `1` is the successor node.

The following code is implement of the algorithm.

```js
function successor(node) {
  if (!node) return 
  // Conclusion 1
  if (node.right) {
    return getLeft(node.right)
  } else {
    // Conclusion 2
    let parent = node.parent
    // Judge parent if it is empty
    while(parent && parent.left === node) {
      node = parent
      parent = node.parent
    }
    return parent
  }
}
function getLeft(node) {
  if (!node) return 
  node = node.left
  while(node) node = node.left
  return node
}
```

## Depth of the Tree

**Maximum Depth of the Tree**：The topic comes from [Leetcode](https://leetcode.com/problems/maximum-depth-of-binary-tree/description/)，The problem needs to find the maximum depth of a binary tree.

The following code is implement of the algorithm.

```js
var maxDepth = function(root) {
    if (!root) return 0 
    return Math.max(maxDepth(root.left), maxDepth(root.right)) + 1
};
```

For this recursive function, you can understand that if you don't find the node, it will return 0. Each time you pop up, the recursive function will add one. If you have three layers, you will get 3.

# Dynamic Programming

The basic principle behind dynamic programming is very simple. It split a problem into sub-problems. Generally speaking, these sub-problems are very similar. Then we can reduce the amount of calculation by solving only one sub-problem once.

Once the solution for each sub-problem is derived, the result is stored for next use.

## Fibonacci Sequence

The Fibonacci sequence starts with 0 and 1, and the following numbers are the sum of the first two numbers.

0，1，1，2，3，5，8，13，21，34，55，89....

So obviously easy to see, we can complete the Fibonacci sequence by recursively.

```js
function fib(n) {
  if (n < 2 && n >= 0) return n
  return fib(n - 1) + fib(n - 2)
}
fib(10)
```

The above code has been able to solve the problem perfectly. However, the above solution has serious performance problems. When n is larger, the time required is exponentially increasing. At this time, dynamic programming can solve this problem.

The essence of dynamic programming is actually two points.

1. Bottom-up decomposition problem
2. Store the already calculated solution by variable

According to the above two points, the dynamic programming of our Fibonacci sequence is coming out.

1. The Fibonacci sequence starts with 0 and 1, then this is the bottom of the sub-problem
2. Store the value of the corresponding Fibonacci sequence for each bit through an array

```js
function fib(n) {
  let array = new Array(n + 1).fill(null)
  array[0] = 0
  array[1] = 1
  for (let i = 2; i <= n; i++) {
    array[i] = array[i - 1] + array[i - 2]
  }
  return array[n]
}
fib(10)
```

## 0 - 1 Backpack Problem

The problem can be described as: given a group of goods, each good has its own weight and price, How can we choose to make the highest total price of the good within a limited total weight. Each question can only be placed at most once.

Suppose we have the following goods.

| Goods ID / Weight | Value |
| :---------------: | :---: |
|         1         |   3   |
|         2         |   7   |
|         3         |  12   |

For a backpack with a total capacity of 5, we can put goods with weight 2 and 3 to achieve the highest total value of the goods in the backpack.

For this problem, there are two sub-problems, one is placing goods and another is not. You can use the following table to understand sub-questions.

| Goods ID / The remaining capacity |  0   |  1   |  2   |  3   |  4   |  5   |
| :-------------------------------: | :--: | :--: | :--: | :--: | :--: | :--: |
|                 1                 |  0   |  3   |  3   |  3   |  3   |  3   |
|                 2                 |  0   |  3   |  7   |  10  |  10  |  10  |
|                 3                 |  0   |  3   |  7   |  12  |  15  |  19  |

Directly analyze the situation where three goods can be placed, that is the last line.

- When the capacity is less than 3, only the data corresponding to the previous row is taken because the current capacity cannot accommodate the good 3
- When the capacity is 3, consider two cases, placing the good 3 and another is not placing the good 3
  - In the case of not placing good 3, the total value is 10
  - In the case of placing good 3, the total value is 12, so goods should be placed 3
- When the capacity is 4, consider two cases, placing goods 3 and another is not placing goods 3
  - In the case of not placing good 3, the total value is 10
  - In the case of placing good 3, add the value of good 1 to get the total value of 15, so it should be placed in good 3
- When the capacity is 5, consider two cases, placing the good 3 and not placing the good 3
  - In the case of not placing good 3, the total value is 10
  - In the case of placing good 3, add the value of good 2 to get the total value of 19, so it should be placed in good 3

It is easier to understand the following code with the above table.

```js
/**
 * @param {*} w Good weight
 * @param {*} v Good value
 * @param {*} C Total capacity
 * @returns
 */
function knapsack(w, v, C) {
  let length = w.length
  if (length === 0) return 0

  // Compare to the table, the generated two-dimensional array, 
  // the first dimension represents the good, 
  // and the second dimension represents the remaining capacity of the backpack.
  // The elements in the second dimension represent the total value of the backpack good
  let array = new Array(length).fill(new Array(C + 1).fill(null))

  // Complete the solution of the bottom sub-problem
  for (let i = 0; i <= C; i++) {
    // Compare to the first line of the table, array[0] represents the good 1
    // i represents the total remaining capacity
    // When the remaining total capacity is greater than the weight of the good 1, 
    // record the total value of the backpack good, otherwise the value is 0.
    array[0][i] = i >= w[0] ? v[0] : 0
  }

  // Solve sub-problems from bottom to up, starting with good 2
  for (let i = 1; i < length; i++) {
    for (let j = 0; j <= C; j++) {
      // Solve the sub-problems here, 
      // divided into not to put the current good and put the current good
      // First solve the total value of the backpack with not putting the current good. 
      // The value here is the value corresponding to the previous line in the corresponding table.
      array[i][j] = array[i - 1][j]
      // Determine whether the current remaining capacity can be placed in the current good.
      if (j >= w[i]) {
        // If you can put it, and then compare it.
        // Put the current item and not put the current item, 
        // which backpack has a max total value
        array[i][j] = Math.max(array[i][j], v[i] + array[i - 1][j - w[i]])
      }
    }
  }
  return array[length - 1][C]
}
```

## Longest Increasing Subsequence

The longest incrementing subsequence means finding out the longest incremental numbers in a set of numbers, such as

0, 3, 4, 17, 2, 8, 6, 10

For the above numbers, the longest increment subsequence is 0, 3, 4, 8, 10, which can be understood more clearly by the following table.

| Number |  0   |  3   |  4   |  17  |  2   |  8   |  6   |  10  |
| :----: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: |
| Length |  1   |  2   |  3   |  4   |  2   |  4   |  4   |  5   |

Through the above table, you can clearly find a rule, find out the number just smaller than the current number, and add one based on the length of the small number. 

The dynamic solution to this problem is very simple, directly on the code.

```js
function lis(n) {
  if (n.length === 0) return 0
  // Create an array of the same size as the parameter and fill it with a value of 1
  let array = new Array(n.length).fill(1)
  // Traversing from index 1, because the array has all been filled with 1
  for (let i = 1; i < n.length; i++) {
    // Traversing from index 0 to i
    // Determine if the value on index i is greater than the previous value
    for (let j = 0; j < i; j++) {
      if (n[i] > n[j]) {
        array[i] = Math.max(array[i], 1 + array[j])
      }
    }
  }
  let res = 1
  for (let i = 0; i < array.length; i++) {
    res = Math.max(res, array[i])
  }
  return res
}
```

# String Related

In the string correlation algorithm, Trie tree can solve many problems, and has good space and time complexity, such as the following problems.

- Word frequency statistics
- Prefix matching

If you don't know much about the Trie tree, you can go [here](../DataStruct/dataStruct-zh.md#trie)  to read
