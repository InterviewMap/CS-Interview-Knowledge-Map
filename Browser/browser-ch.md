Eventloop 与 node.js 对比，渲染机制，存储，重拍重绘

#### 事件机制

##### 事件触发三阶段

事件触发有三个阶段

- `document` 往事件触发处传播，遇到注册的捕获事件会触发
- 传播到事件触发处时触发注册的事件
- 从事件触发处往 `document` 传播，遇到注册的冒泡事件会触发

事件触发一般来说会按照上面的顺序进行，但是也有特例，如果给一个节点同时注册冒泡和捕获事件，事件触发会按照注册的顺序执行。

```js
// 以下会先打印冒泡然后是捕获
node.addEventListener('click',(event) =>{
	console.log('冒泡')
},false);
node.addEventListener('click',(event) =>{
	console.log('捕获 ')
},true)
```

##### 注册事件

通常我们使用 `addEventListener` 注册事件，该函数有一个 `useCapture` 参数，该参数接收一个布尔值，默认值为 `false` 。`useCapture` 决定了注册的事件是捕获事件还是冒泡事件。

一般来说，我们只希望事件只触发在目标上，这时候可以使用 `stopPropagation` 来阻止事件的进一步传播。通常我们认为 `stopPropagation` 是用来阻止事件冒泡的，其实该函数也可以阻止捕获事件。`stopImmediatePropagation` 同样也能实现阻止事件，但是还能阻止该事件目标执行别的注册事件。

```js
node.addEventListener('click',(event) =>{
	event.stopImmediatePropagation()
	console.log('冒泡')
},false);
// 点击 node 只会执行上面的函数，该函数不会执行
node.addEventListener('click',(event) => {
	console.log('捕获 ')
},true)
```

##### 事件代理

如果一个节点中的子节点是动态生成的，那么子节点需要注册事件的话需要注册在父节点上

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

事件代理的方式相对于直接给目标注册事件来说，有以下优点

- 节省内存
- 不需要给子节点注销事件

#### 跨域

因为浏览器出于安全考虑，有同源策略。也就是说，如果协议、域名或者端口有一个不同就是跨域，请求会失败。

我们可以通过以下几种常用方法解决跨域的问题

##### JSONP

JSONP 的原理很简单，就是利用 `<script>` 标签没有跨域限制的漏洞。通过 `<script>` 标签指向一个需要访问的地址并提供一个回调函数来接收数据当需要通讯时。

```js
<script src="http://domain/api?param1=a&param2=b&callback=jsonp"></script>
<script>
    function jsonp(data) {
    	console.log(data)
	}
</script>    
```

JSONP 使用简单且兼容性不错，但是只限于 `get` 请求。

##### CORS

CORS需要浏览器和后端同时支持，目前浏览器除了 IE10 以下，其他都支持该功能。

浏览器会自动进行 CORS 通信，实现CORS通信的关键是后端。只要后端实现了 CORS，就实现了跨域。