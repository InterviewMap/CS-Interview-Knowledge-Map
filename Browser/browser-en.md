<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Event mechanism](#event-mechanism)
  - [The three phases of event triggered](#the-three-phases-of-event-triggered)
  - [Event Registration](#event-registration)
  - [Event Agent](#event-agent)
- [cross domain](#cross-domain)
  - [JSONP](#jsonp)
  - [CORS](#cors)
  - [document.domain](#documentdomain)
  - [postMessage](#postmessage)
- [Event loop](#event-loop)
  - [Event loop in Node](#event-loop-in-node)
    - [timer](#timer)
    - [I/O](#io)
    - [idle, prepare](#idle-prepare)
    - [poll](#poll)
    - [check](#check)
    - [close callbacks](#close-callbacks)
- [Storage](#storage)
  - [cookie，localStorage，sessionStorage，indexDB](#cookielocalstoragesessionstorageindexdb)
  - [Service Worker](#service-worker)
- [Rendering machanism](#rendering-machanism)
  - [Difference between Load & DOMContentLoaded](#difference-between-load--domcontentloaded)
  - [Layers](#layers)
  - [Repaint & Reflow](#repaint--reflow)
  - [Reduce Repaint & Reflow](#reduce-repaint--reflow)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Event mechanism

## The three phases of event triggered

Event triggered has three phases:

- `document` propagate to the event trigger and the registered capture event will trigger.
- The event that triggers registration when propagated to the event trigger.
- From the event trigger to the `document` propagation, the bubbling event that is registered will trigger.

Event triggers generally follow the above sequence, but there are exceptions. If a target node is registered for both bubble and capture events, event triggering is performed in the order in which it was registered.

```js
// The following code will print bubbling first and then trigger capture events
node.addEventListener('click',(event) =>{
	console.log('bubble')
},false);
node.addEventListener('click',(event) =>{
	console.log('capture ')
},true)
```

## Event Registration

Usually, we use `addEventListener` to register an event, the `useCapture` is a function parameter, which receives a Boolean value, the default value is `false`. `useCapture` determines whether the registered event is a capture event or a bubbling event. For the object parameters, you can use the following properties

- `capture` Boolean value, same as `useCapture`
- `once`, Boolean value, `true` indicating that the callback is only called once, after calling the listener will be removed
- `passive`, Boolean, means never call `preventDefault`

Generally speaking, we only want the event to trigger only on the target, this time can be used `stopPropagation` to prevent the spread of the event. Usually, we think that `stopPropagation` is used to stop the event bubbling, in fact, this function can also prevent the capture events. `stopImmediatePropagation` blocking events can also be implemented and this function can also prevent the event target from performing other registration events.

```js
node.addEventListener('click',(event) =>{
	event.stopImmediatePropagation()
	console.log('bubbling')
},false);
// Clicking node will only execute the above function, this function will not execute
node.addEventListener('click',(event) => {
	console.log('capture ')
},true)
```

## Event Agent

If a child node in a parent node is dynamically generated, the child node should to be registered on the parent node if it needs to register an event.

```html
<ul id="ul">
	<li>1</li>
    <li>2</li>
	<li>3</li>
	<li>4</li>
	<li>5</li>
</ul>
<script>
	let ul = document.querySelector('#ul')
	ul.addEventListener('click', (event) => {
		console.log(event.target);
	})
</script>
```

The event agent approach has the following advantages over the direct registration event on child node:

- Save memory
- Child nodes don't need remove event listener

# cross domain

Because browsers have the same origin policy for security reasons. In other words, if the protocol, domain name, or port has a different that is cross-domain, the Ajax request will fail.

We can solve the cross-domain issues through following methods  

## JSONP

The principle of JSONP is very simple, that is to use the `<script>` tag vulnerabilities that not limit cross-domain. Use the `src` attribute of `<script>` tag and provide a callback function to receive data.

```js
<script src="http://domain/api?param1=a&param2=b&callback=jsonp"></script>
<script>
    function jsonp(data) {
    	console.log(data)
	}
</script>    
```

JSONP is simple to use and has good compatibility, but is limited to `get` requests.

You may encounter the same callback name in multiple JSONP requests, this time you need to package a JSONP, the following is a simple implementation

```js
function jsonp(url, jsonpCallback, success) {
  let script = document.createElement("script");
  script.src = url;
  script.async = true;
  script.type = "text/javascript";
  window[jsonpCallback] = function(data) {
    success & success(data);
  };
  document.body.appendChild(script);
}
jsonp(
  "http://xxx",
  "callback",
  function(value) {
    console.log(value);
  }
);
```

## CORS

CORS requires browser and backend support at the same time. Internet Explorer 8 and 9 expose CORS via the XDomainRequest object.

The browser will automatically perform CORS communication. The key to implementing CORS communication is the backend. As long as the back end implements CORS, it implements cross-domain.

The server sets `Access-Control-Allow-Origin` to enable CORS. This property means which domain can access the resource. If set wildcards, all websites can access resources.

## document.domain

This can only be used for the same Second-level domain, For example, `a.test.com` and `b.test.com` suitable for this case.

Set `document.domain = 'test.com'` , as used by the same origin policy.

## postMessage

This method is usually used to get data for third-party page. One page sends a message, another page judges the source and receives the message

```js
// send of page
window.parent.postMessage('message', 'http://test.com');
// receive of page
var mc = new MessageChannel();
mc.addEventListener('message', (event) => {
    var origin = event.origin || event.originalEvent.origin;
    if (origin === 'http://test.com') {
        console.log('success')
    }
});
```

# Event loop

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

1. Execute synchronous codes, which belongs to macrotask
2. Once call stack is empty, query if any microtasks need to be executed
3. Execute all the microtasks
4. If necessary, render the UI
5. Then start the next round of the Event loop,  and execute the asynchronous codes in the macrotask

According to the above sequence of the Event loop, if the asynchronous codes in the macrotask have a large number of calculations and need to operate the DOM, we can put the operation DOM into the microtask for faster interface response.

## Event loop in Node

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

### timer

The `timer` phase executes the callbacks of `setTimeout` and `setInterval`

`Timer` specifies the time that callbacks will run as early as they can be scheduled after the specified amount of time has passed rather than the exact time a person wants it to be executed.

The lower limit time has a range: `[1, 2147483647]`,  if the set time is not in this range, it will be set to 1.

### I/O

The `I/O` phase executes the callbacks of timers and  `setImmediate`, besides that for the close event

### idle, prepare

The `idle, prepare` phase is for internal implementation

### poll

The `poll` phase has two main functions:

1. Executing scripts for timers whose threshold has elapsed, then
2. Processing events in the poll queue.

When the event loop enters the `poll` phase and there are no timers scheduled, one of two things will happen:

- If the `poll` queue is not empty, the event loop will iterate through its queue of callbacks executing them synchronously until either the queue has been exhausted, or the system-dependent hard limit is reached.
- If the `poll` queue is empty, one of two more things will happen:
  1. If scripts have been scheduled by `setImmediate`. the event loop will end the `poll` phase and continue to the check phase to execute those scheduled scripts.
  2. If scripts have not been scheduled by `setImmediate`, the event loop will wait for callbacks to be added to the queue, then execute them immediately.

Once the `poll` queue is empty the event loop will check for timers whose time thresholds have been reached. If one or more timers are ready, the event loop will wrap back to the timers phase to execute those timers' callbacks.

### check

The `check` phase executes the callbacks of `setImmediate`

### close callbacks

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

# Storage

## cookie，localStorage，sessionStorage，indexDB

|        features         |                            cookie                            |               localStorage                |                        sessionStorage                        |                  indexDB                  |
| :---------------------: | :----------------------------------------------------------: | :---------------------------------------: | :----------------------------------------------------------: | :---------------------------------------: |
|   life cycle  of data   | generally generated by the server, but you can set the expiration time | unless cleared manually, it always exists | once the browser tab is closed, it will be cleaned up immediately | unless cleared manually, it always exists |
|  Storage size of data   |                              4K                              |                    5M                     |                              5M                              |                 unlimited                 |
| Communicate with server | it is carried in the header everytime, and has a performance impact on the request |            doesn't participate            |                     doesn't participate                      |            doesn't participate            |

As we can see from the above table, `cookies` are no longer recommended for storage. We can use `localStorage` and `sessionStorage` if we don't have much data to storage. Use `localStorage` to storage the data that doesn't change much, otherwise `sessionStorage` can be used.

For `cookies`, we also need attention to security.

| attribute |                            effect                            |
| :-------: | :----------------------------------------------------------: |
|   value   | the value should be encrypted if used to save the login state, and the cleartext user ID shouldn't be used |
| http-only | cookies cannot be accessed through JS, for reducing XSS attack |
|  secure   | cookies can only be carried in requests with HTTPS protocol  |
| same-site | browsers cannot carry cookies in cross-origin requests, for reducing CSRF attacks |

## Service Worker

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

Open the page, we can see that the Service Worker has started in the `Application` of the devTools

![](https://user-gold-cdn.xitu.io/2018/3/28/1626b1e8eba68e1c?w=1770&h=722&f=png&s=192277)

In the Cache, we can also find that the files we need have been cached

![](https://user-gold-cdn.xitu.io/2018/3/28/1626b20dfc4fcd26?w=1118&h=728&f=png&s=85610)

Refreshing the page, we can see that our cached data is read from the Service Worker

![](https://user-gold-cdn.xitu.io/2018/3/28/1626b20e4f8f3257?w=2818&h=298&f=png&s=74833)

# Rendering machanism

The machanism of the browser engine usually has the following steps:

1. Parsing HTML to construct the DOM tree

2. Parsing CSS to construct the CSSOM

3. create the render tree by merging the SOM tree & CSS tree

4. layout based on the render tree, calculate each node's exact coordinates on the screen

5. painting elements by GPU in the way of layers, and display on the screen

![](https://user-gold-cdn.xitu.io/2018/4/11/162b2ab2ec70ac5b?w=900&h=352&f=png&s=49983)

When building the CSSOM tree, the rendering is blocked until the CSSOM tree is built. And building the CSSOM tree is a very cost-intensive process, so you should try to ensure that the level is flat, reduce excessive cascading, the more specific CSS selector, the slower the execution.

When the HTML is parsed the script tag, the DOM is paused and will restart from the paused position. In other words, if you want to render the first screen faster, the less you should load the JS file on the first screen. And CSS will also affect the execution of JS. JS will only be executed when the stylesheet is parsed. Therefore, it can be considered that CSS will also suspend the DOM in this case.

![](https://user-gold-cdn.xitu.io/2018/7/8/1647838a3b408372?w=1676&h=688&f=png&s=154480)

![](https://user-gold-cdn.xitu.io/2018/7/8/16478388e773b16a?w=1504&h=760&f=png&s=123231)


## Difference between Load & DOMContentLoaded

**Load** event occurs when all the resources (e.g. DOM、CSS、JS、pictures) had been loaded

**DOMContentLoaded** event occurs  as soon as the HTML of the pages has been loaded, no matter whether the other resources had been loaded

## Layers

Generally，we can treate the documents flow as a single layer. Some special attributes alse could create a new layer. **Different Layers are separate**. So, it is recommed to create a new layer to rendeing some elements which changed frequently. **But it is also a bad idea to create too much layers.**

the following attributes usually can create a new layer:

- 3Dtranslate: `translate3d`, `translateZ`

- `will-change`

- tags like: `video`, `iframe`

- `opacity` animation translate

- `position: fixed`

## Repaint & Reflow

Repaint and Reflow are a little steps in the main rendering flow, but they have a great influence of the performance.

- Repaint occurs when the node change but that dosn't affect the layout, e.g. `color`

- Reflow occurs when the node change that caused by layout or the geometry attributes

The Repaint must appear while the Reflow occured. Otherwise not certain。Reflow is much heaver than Repaint . The changes of the deep node's attributes may cause a series of changes  of ancestral nodes.

Actions like the following may cause the performance problems

- change window's  size

- change font-family

- add or delete styles

- change texts

- position & float

- box

You may not know that Repaint and Reflow have somthing to do with the **Event Loop**

- In a event loop, when a Microtasks finished, the engine will determine whether the document need update. As the  refresh rate of the browse is 60Hz, which means it will update every 16ms

- then determine whether there is events like `resize` or `scroll` occurs, if true, trigger the handlers. So the handlers of resize and scroll will trigger every 16 ms, which means automatic throttle

- determine whether trigger the media query

- update the animation and send event

- determine whether this is a full-screen event

- excute ``requestAnimationFrame`` callback

- excute `IntersectionObserver` callbak, which used to determine whether an element shoud be display, usually in lazy-load , but with poor compatibility

- update the screen

- the aboves may occur in every frame. If there is rest time, the `requestIdleCallback` callback will be called.

All above are from [HTML Documents](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model)

## Reduce Repaint & Reflow

- use `translate` instead of `top`

```html
<div class="test"></div>
<style>
	.test {
		position: absolute;
		top: 10px;
		width: 100px;
		height: 100px;
		background: red;
	}
</style>
<script>
	setTimeout(() => {
        // occurs reflow
		document.querySelector('.test').style.top = '100px'
	}, 1000)
</script>
```

- use `visibility` instead of `display: none`, because the former will only cause Repaint while the latter will cause the Reflow which change the layout.

- change the DOM when it is offline, e.g. change the DOM 100 times after set it `display: none` and then show it on screen. Among this process there is only one Relow.

- do not put an attribute of a node to the loop

```js
for(let i = 0; i < 1000; i++) {
    // it will cause the reflow to get offsetTop, because it need to calculate the right value
    console.log(document.querySelector('.test').style.offsetTop)
}
```

- do not use table to construct the layout, because event a little change will cause the re-construct.

- the choice of the speed of the animation's realization, the faster the more Reflow, you can shoose the `requestAnimationFrame`

- the css selector will search to match from right to left, so you'd  better to avoid that the DOM is too deep.

- As we konw that the layer will prevent the node which has changed from affecting others, so it is good to change the animation that run high frequency to a layer.

![](https://user-gold-cdn.xitu.io/2018/3/29/1626fb6f33a6f9d7?w=1588&h=768&f=png&s=263260)
