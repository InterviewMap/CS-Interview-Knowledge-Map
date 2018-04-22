
#### Event loop

As we all know,  JS is a non-blocking and single-threaded language, because JS was born to interact with the browser in the beginning.  If JS is a multi-threaded language, we may have problems handling DOM in multiple threads (imagine adding nodes in a thread and deleting nodes in another thread in the same time),  certainly, we can introduce a read-write lock to solve this problem.

Execution context, generated during JS execution, will be pushed into call stack sequentially. Asynchronous codes encountered will be handed up and pushed into the Task queues (there are multiple tasks). Once the call stack is empty, the Event Loop will take out the codes that need to be executed from the Task queue and push it into the execution of the call stack, thus essentially speaking that the asynchronous behavior in JS is actually synchronous.

```js
console.log('script start');

setTimeout(function() {
  console.log('setTimeout');
}, 0);

console.log('script end');
```

The above code is asynchronous, even though the `setTimeout` delay is 0.  That’s because the HTML5 standard stipulates that the second parameter of the function  `setTimeout`  must not be less than 4 milliseconds, or it will increase automatically.  So `setTimeout` is  still logged after `script end`.

Different task sources are assigned to different Task queues. Task sources can be divided into `microtasks` and `macrotasks`. In the ES6 specification, `microtask` is called `jobs` and `macrotask` is called `task`.

```js
console.log('script start');

setTimeout(function() {
  console.log('setTimeout');
}, 0);

new Promise((resolve) => {
    console.log('Promise')
    resolve()
}).then(function() {
  console.log('promise1');
}).then(function() {
  console.log('promise2');
});

console.log('script end');
// script start => Promise => script end => promise1 => promise2 => setTimeout
```

Although  `setTimeout` is set before  `Promise`, the above printing still occurs because of that `Promise` belongs to microtask and `setTimeout` belongs to  macrotask

Microtasks include `process.nextTick`, `promise`, `Object.observe`, `MutationObserver`

Macrotasks include  `script` ， `setTimeout` ，`setInterval` ，`setImmediate` ，`I/O` ，`UI rendering`

Many people have a wrong misunderstanding that microtasks are faster than macrotasks. Because the macrotask includes `script`, the browser will perform a macrotask first, followed by microtasks if there is asynchronous code.

So the correct sequence of an event loop is like this: 

1、Execute synchronous codes, which belongs to macrotask
2、Once call stack is empty, query if any microtasks need to be executed
3、Execute all the microtasks
4、If necessary, render the UI
5、Then start the next round of the Event loop,  and execute the asynchronous codes in the macrotask

According to the above sequence of the Event loop, if the asynchronous codes in the macro task have a large number of calculations and need to operate the DOM, we can put the operation DOM into the microtask for faster interface response.

##### Event loop in Node 

The Event loop in Node is not the same as in the browser.

The Event loop in Node is divided into 6 phases,  and they will be executed in sequence.

```
┌───────────────────────┐
┌─>│        timers         │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     I/O callbacks     │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     idle, prepare     │
│  └──────────┬────────────┘      ┌───────────────┐
│  ┌──────────┴────────────┐      │   incoming:   │
│  │         poll          │<──connections───     │
│  └──────────┬────────────┘      │   data, etc.  │
│  ┌──────────┴────────────┐      └───────────────┘
│  │        check          │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
└──┤    close callbacks    │
   └───────────────────────┘
```

###### timer

The `timer` phase executes the callbacks of `setTimeout` and `setInterval`

`Timer` specifies the time that callbacks will run as early as they can be scheduled after the specified amount of time has passed rather than the exact time a person wants it to be executed.

The lower limit time has a range: `[1, 2147483647]`,  if the set time is not in this range, it will be set to 1.

###### I/O 

The `I/O` phase executes the callbacks of timers and  `setImmediate`, besides that for the close event

###### idle, prepare 

The `idle, prepare` phase is for internal implementation

###### poll 

The `poll` phase has two main functions:

1. Executing scripts for timers whose threshold has elapsed, then 
2. Processing events in the poll queue.

When the event loop enters the `poll` phase and there are no timers scheduled, one of two things will happen:

* If the `poll` queue is not empty, the event loop will iterate through its queue of callbacks executing them synchronously until either the queue has been exhausted, or the system-dependent hard limit is reached.

* If the `poll` queue is empty, one of two more things will happen:
    1. If scripts have been scheduled by `setImmediate`. the event loop will end the `poll` phase and continue to the check phase to execute those scheduled scripts.
    2. If scripts have not been scheduled by `setImmediate`, the event loop will wait for callbacks to be added to the queue, then execute them immediately.

Once the `poll` queue is empty the event loop will check for timers whose time thresholds have been reached. If one or more timers are ready, the event loop will wrap back to the timers phase to execute those timers' callbacks.

###### check

The `check` phase executes the callbacks of `setImmediate`

###### close callbacks

 The `close` event will be emitted in this phase.
And in Node, the order of execution of timers is random in some cases

```js
setTimeout(() => {
    console.log('setTimeout');
}, 0);
setImmediate(() => {
    console.log('setImmediate');
})
// Here, it may log setTimeout => setImmediate
// It is also possible to log the opposite result, which depends on performance
// Because it may take less than 1 millisecond to enter the event loop, `setImmediate` would be executed at this time.
// Otherwise it will execute `setTimeout`
```

Certainly, in this case, the execution order is the same

```js
var fs = require('fs')

fs.readFile(__filename, () => {
    setTimeout(() => {
        console.log('timeout');
    }, 0);
    setImmediate(() => {
        console.log('immediate');
    });
});
// Because the callback of `readFile` was executed in `poll` phase
// Founding `setImmediate`,it immediately jumps to the `check` phase to execute the callback 
// and then goes to the `timer` phase to execute `setTimeout`
// so the above output must be `setImmediate` => `setTimeout`
```

The above is the implementation of the macrotask.  The microtask will be executed immediately after each phase is completed.

```js
setTimeout(()=>{
    console.log('timer1')

    Promise.resolve().then(function() {
        console.log('promise1')
    })
}, 0)

setTimeout(()=>{
    console.log('timer2')

    Promise.resolve().then(function() {
        console.log('promise2')
    })
}, 0)
// The log result is different, when the above code is executed in browser and node
// In browser, it will log: timer1 => promise1 => timer2 => promise2
// In node, it will log: timer1 => timer2 => promise1 => promise2
```

`process.nextTick`  in Node will be executed before other microtasks.

```js
setTimeout(() => {
  console.log("timer1");

  Promise.resolve().then(function() {
    console.log("promise1");
  });
}, 0);

process.nextTick(() => {
  console.log("nextTick");
});
// nextTick => timer1 => promise1
```


#### Storage

##### cookie，localStorage，sessionStorage，indexDB

|     features     |                   cookie                   |       localStorage       | sessionStorage |         indexDB          |
| :----------: | :----------------------------------------: | :----------------------: | :------------: | :----------------------: |
| life cycle  of data |     generally generated by the server, but you can set the expiration time     | unless cleared manually, it always exists | once the browser tab is closed, it will be cleaned up immediately | unless cleared manually, it always exists |
| Storage size of data |                     4K                     |            5M            |       5M       |           unlimited           |
| Communicate with server | it is carried in the header everytime, and has a performance impact on the request |          doesn't participate          |     doesn't participate     |          doesn't participate          |


As we can see from the above table, cookies are no longer recommended for storage. We can use localStorage and sessionStorage if we don't have much data to storage. Use localStorage to storage the data that doesn't change much, otherwise sessionStorage can be used.

For cookies, we also need attention to security.

| attribute |                           function                           |
| :-------: | :----------------------------------------------------------: |
|   value   | the value should be encrypted if used to save the login state, and the cleartext user ID shouldn't be used |
| http-only | cookies cannot be assessed through JS, for reducing XSS attack |
|  secure   | cookies can only be carried in requests with HTTPS protocol  |
| same-site | browsers cannot carry cookies in cross-origin requests, for reducing CSRF attacks |


##### Service Worker

> Service workers essentially act as proxy servers that sit between web applications, the browser, and the network (when available). They are intended, among other things, to enable the creation of effective offline experiences, intercept network requests and take appropriate action based on whether the network is available, and update assets residing on the server. They will also allow access to push notifications and background sync APIs.

At present, this technology is usually used to cache files, increase the render speed of the first screen, wo can try to  implement this function.

```js
// index.js
if (navigator.serviceWorker) {
  navigator.serviceWorker
    .register("sw.js")
    .then(function(registration) {
      console.log("service worker register success");
    })
    .catch(function(err) {
      console.log("servcie worker register error");
    });
}
// sw.js
// Listen for the `install` event, and cache the required files in the callback
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("my-cache").then(function(cache) {
      return cache.addAll(["./index.html", "./index.js"]);
    })
  );
});

// intercept all the request events
// use the cache directly if the requested data already existed in the cache; otherwise, send requests for data
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      if (response) {
        return response;
      }
      console.log("fetch source");
    })
  );
});
```

Start the page, we can see that the Service Worker has started in the `Application` of the devTools

![](https://user-gold-cdn.xitu.io/2018/3/28/1626b1e8eba68e1c?w=1770&h=722&f=png&s=192277)

In the Cache, we can also find that the files we need have been cached

![](https://user-gold-cdn.xitu.io/2018/3/28/1626b20dfc4fcd26?w=1118&h=728&f=png&s=85610)

Refreshing the page, we can see that our cached data is read from the Service Worker

![](https://user-gold-cdn.xitu.io/2018/3/28/1626b20e4f8f3257?w=2818&h=298&f=png&s=74833)