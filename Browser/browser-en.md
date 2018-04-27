#### Event mechanism

##### The three phases of event triggered

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

##### Event Registration

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

##### Event Agent

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

#### cross domain

Because browsers have the same origin policy for security reasons. In other words, if the protocol, domain name, or port has a different that is cross-domain, the Ajax request will fail.

We can solve the cross-domain issues through following methods  

##### JSONP

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

##### CORS

CORS requires browser and backend support at the same time. Internet Explorer 8 and 9 expose CORS via the XDomainRequest object.

The browser will automatically perform CORS communication. The key to implementing CORS communication is the backend. As long as the back end implements CORS, it implements cross-domain.

The server sets `Access-Control-Allow-Origin` to enable CORS. This property means which domain can access the resource. If set wildcards, all websites can access resources.

##### document.domain

This can only be used for the same Second-level domain, For example, `a.test.com` and `b.test.com` suitable for this case.

Set `document.domain = 'test.com'` , as used by the same origin policy.

##### postMessage

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

- If the `poll` queue is not empty, the event loop will iterate through its queue of callbacks executing them synchronously until either the queue has been exhausted, or the system-dependent hard limit is reached.
- If the `poll` queue is empty, one of two more things will happen:
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

|        features         |                            cookie                            |               localStorage                |                        sessionStorage                        |                  indexDB                  |
| :---------------------: | :----------------------------------------------------------: | :---------------------------------------: | :----------------------------------------------------------: | :---------------------------------------: |
|   life cycle  of data   | generally generated by the server, but you can set the expiration time | unless cleared manually, it always exists | once the browser tab is closed, it will be cleaned up immediately | unless cleared manually, it always exists |
|  Storage size of data   |                              4K                              |                    5M                     |                              5M                              |                 unlimited                 |
| Communicate with server | it is carried in the header everytime, and has a performance impact on the request |            doesn't participate            |                     doesn't participate                      |            doesn't participate            |

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

#### Rendering mechanism

The browser's rendering mechanism is generally divided into the following steps

1. Process HTML and build a DOM tree.
2. Handle CSS to build the CSSOM tree.
3. Combine DOM and CSSOM into one render tree.
4. According to the layout of the render tree, calculate the position of each node.
5. Invoke GPU drawing, compose the layer, and display it.

![](https://user-gold-cdn.xitu.io/2018/4/11/162b2ab2ec70ac5b?w=900&h=352&f=png&s=49983)

The browser display content is displayed in blocks instead of waiting for the Redner Tree to be generated. Therefore, to optimize the speed of the first screen, you should provide the CSS file needed by the first screen as soon as possible.

##### Difference between Load and DOMContentLoaded

The Load event triggers the representation of the DOM, CSS, JS, and images on the page.

The DOMContentLoaded event fires on behalf of the initial HTML and is completely loaded and parsed without waiting for CSS, JS, and image loading.

##### Layers

In general, you can think of a common document stream as a layer. Specific properties can generate a new layer. **Different layer renderings do not affect each other **, so for some frequent suggestions need to be rendered separately to generate a new layer to improve performance. **However, it is not possible to generate too many layers, which will cause a reaction.**

New layers can be generated from the following common properties

- 3D translate: `translate3d` ,`translateZ`
- `will-change`
- `video`、`iframe` label
- Animation achieved through `opacity` animated transition
- `position: fixed`

##### Repaint and Reflow

Redrawing and reflowing is a subsection of the rendering step, but these two steps have a large impact on performance.

- Redraw when a node needs to change the appearance without affecting the layout of such change `color` is called is called redraw
- Reflow is the layout or geometry properties need to change is called reflow.

Reflow must be redrawn and redrawing does not necessarily lead to reflow. The cost of reflow is much higher, and changing deeper nodes is likely to result in a series of reflows to the parent node.

So the following actions may cause performance problems:

- Change the window size
- Change the font
- Add or remove styles
- Font change
- Positioning or floating
- Box model

What many people don't know is that redrawing and returning are actually related to the Event loop.

1. When the Event loop executes Microtasks, it will determine if the document needs to be updated. Because the browser is a 60Hz refresh rate, it is updated every 16ms.
2. And then determine whether there is `resize` or `scroll`, any, will go to trigger events, so `resize` and the `scroll` event is at least 16ms to trigger once, and comes with a throttle function.
3. Determine whether media query is triggered
4. Update animation and send event
5. Determine whether there is a full-screen operation event
6. Execute `requestAnimationFrame` the callback
7. Perform `IntersectionObserver` callback, the method for determining whether the element is visible, can be used for the lazy loading, but the compatibility is not good
8. Update the interface

The above content comes from an [HTML Document](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model)

##### Reduce redrawing and reflow

- Use `translate` replace to `top`

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
          // cause back-flow
  		document.querySelector('.test').style.top = '100px'
  	}, 1000)
  </script>
  ```

- Use `visibility` replace display: none, because the former would lead to redraw, which will lead to reflux (changing the layout)

- Take the DOM offline and modify it. For example: first give the DOM `display:none` (a Reflow once), then you modify it 100 times and then display it again.

- Don't put DOM node attribute values ​​in a loop as variables in loops

  ```js
  for(let i = 0; i < 1000; i++) {
      // get offsetTop will cause reflow, because it needs to get correct value
      console.log(document.querySelector('.test').style.offsetTop)
  }
  ```

- Do not use table layouts. A small change may cause a re-layout of the entire table.

- The choice of animation speed, the faster the animation, the more the times of reflow, you can also choose to use `requestAnimationFrame`

- CSS selectors match search from right to left, avoiding DOM depth too deep

- Turn frequently-running animations into layers. Layers can prevent the node from flowing back to affect other elements. For example, for `video` labels, the browser will automatically turn that node into layer.

  ![](https://user-gold-cdn.xitu.io/2018/3/29/1626fb6f33a6f9d7?w=1588&h=768&f=png&s=263260)