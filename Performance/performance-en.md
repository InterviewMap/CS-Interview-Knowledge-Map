
- [Network related](#%E7%BD%91%E7%BB%9C%E7%9B%B8%E5%85%B3)
  - [DNS Prefetching](#dns-%E9%A2%84%E8%A7%A3%E6%9E%90)
  - [Cache](#%E7%BC%93%E5%AD%98)
    - [strong cache](#%E5%BC%BA%E7%BC%93%E5%AD%98)
    - [negotiation cache](#%E5%8D%8F%E5%95%86%E7%BC%93%E5%AD%98)
      - [Last-Modified and If-Modified-Since](#last-modified-%E5%92%8C-if-modified-since)
      - [ETag and If-None-Match](#etag-%E5%92%8C-if-none-match)
    - [Choosing the suitable caching strategy](#%E9%80%89%E6%8B%A9%E5%90%88%E9%80%82%E7%9A%84%E7%BC%93%E5%AD%98%E7%AD%96%E7%95%A5)
  - [Use HTTP / 2.0](#%E4%BD%BF%E7%94%A8-http--20)
  - [Prefetch](#%E9%A2%84%E5%8A%A0%E8%BD%BD)
  - [Pre-render](#%E9%A2%84%E6%B8%B2%E6%9F%93)
- [Optimizing the rendering process](#%E4%BC%98%E5%8C%96%E6%B8%B2%E6%9F%93%E8%BF%87%E7%A8%8B)
  - [Lazy execution](#%E6%87%92%E6%89%A7%E8%A1%8C)
  - [Lazy load](#%E6%87%92%E5%8A%A0%E8%BD%BD)
- [File optimization](#%E6%96%87%E4%BB%B6%E4%BC%98%E5%8C%96)
  - [Img optimization](#%E5%9B%BE%E7%89%87%E4%BC%98%E5%8C%96)
    - [Calculate the size of image](#%E8%AE%A1%E7%AE%97%E5%9B%BE%E7%89%87%E5%A4%A7%E5%B0%8F)
    - [Image loading optimization](#%E5%9B%BE%E7%89%87%E5%8A%A0%E8%BD%BD%E4%BC%98%E5%8C%96)
  - [Optimization of other files](#%E5%85%B6%E4%BB%96%E6%96%87%E4%BB%B6%E4%BC%98%E5%8C%96)
  - [CDN](#cdn)
- [Others](#%E5%85%B6%E4%BB%96)
  - [Use Webpack to optimize the project](#%E4%BD%BF%E7%94%A8-webpack-%E4%BC%98%E5%8C%96%E9%A1%B9%E7%9B%AE)
  - [Monitor](#%E7%9B%91%E6%8E%A7)
  - [An interview question](#%E9%9D%A2%E8%AF%95%E9%A2%98)

### Network related
#### 1、DNS Prefetching
It takes time for DNS resolution. We can obtain the IP corresponding to the domain name in advance through DNS prefetching.
```html
<link rel="dns-prefetch" href="//yuchengkai.cn">
```
#### 2、Cache
Cache is a very important point for front-end performance optimization. A good caching strategy can reduce the repeated loading of resources and increase the overall loading speed of the websites.

Browser cache strategy is usually divided into two types: strong cache and negotiation cache

##### strong cache
Implementing strong caching can be achieved with two response headers: `Expires` and `Cache-Control`. Strong cache means that no request is required during caching, the  `state code`  is 200.

```js
Expires: Wed, 22 Oct 2018 08:41:00 GMT
```

`Expires` is a product of HTTP / 1.0, indicating that the resource expires after `Wed, 22 Oct 2018 08:41:00 GMT` and needs to be requested again. And `Expires` is limited by the local time, if the local time is modified, the cache may be invalidated.
```js
Cache-control: max-age=30
```
`Cache-Control` appears in HTTP/1.1 and takes precedence over `Expires`. This attribute indicates that the resource expires after 30 seconds and needs to be requested again.

##### negotiation cache
If the cache expires, we can use negotiation cache to solve the problem. Negotiation cache requires a request and returns 304 if the cache is valid.

Negotiation cache needs to be implemented by the client-side and server-side together. Like strong caching, there are two implementations.

###### `Last-Modified`  and  `If-Modified-Since`
`Last-Modified` indicates the last modified date of the local file. `If-Modified-Since` will send the value of  `Last-Modified` to the server, asking the server if the resource has been updated after that date, and if there is an update, the new resource will be sent back.

But if you open the cache file locally, it will cause `Last-Modified` to be modified, so `ETag` appears in HTTP / 1.1

###### `ETag` and `If-None-Match`
`ETag` is similar to the fingerprint of a file. `If-None-Match` sends the current `ETag` to the server and asks whether the `ETag` of the resource changes. If there is a change, the new resource will be sent back. And   `ETag` has a higher priority than `Last-Modified`

##### Choosing the suitable caching strategy
We can use strong cache with negotiation cache to solve most problems, but in some special cases, we may need to choose a special caching strategy.
* For some resources that do not need to be cached, we can use `Cache-control: no-store` to indicate that the resource does not need to be cached.
* For the resources that will be frequently changed, we can use `Cache-Control: no-cache` with `ETag` to indicate that the resource is cached, but each time it will send a request to ask if the resource is updated.
* For code files, we usually use `Cache-Control: max-age=31536000`  with the cache strategy, and then make the file fingerprinted. Once the name of the file changes, the new file will be downloaded immediately.

#### 3、Use HTTP / 2.0
Since browsers have limitations on concurrent requests, each request needs to be established and disconnected in the era of HTTP/1.1, which will consume several `RTT` times, and loading large files requires more time because `TCP` starts slowly.

Multiplexing was introduced in HTTP/2.0, allowing multiple requests to use the same TCP link, greatly speeding up the loading of websites. Header compression is also supported, further shortening the length of the request.

To know more detailed content,  you can view  [this section](../Network/Network-zh.md##http-20)


#### 4、Prefetch
In development, you may encounter such a situation. Some resources do not need to be used immediately, but you want to get it as soon as possible. At this point, you can use preloading.

Preloading is actually a declarative `fetch` that forces the browser to request resources and does not block the `onload` event. You can use the following code to enable preloading

```html
<link rel="prefetch" href="http://example.com">
```

Preloading can reduce the loading time of home screen to a certain degree because some important files that do not affect the home screen can be delayed for loading. The only disadvantage is that the compatibility is not good.

#### 5、Pre-render
The downloaded file can be pre-rendered in the background through pre-rendering. You can use the following code to enable pre-rendering.

```html
<link rel="prerender" href="http://example.com"> 
```

Although pre-rendering can improve the loading speed of a website, it must be 100 percent ensured that the page will be opened by the user, otherwise, it would waste resources to render.

### Optimizing the rendering process

As for the optimization about code, you can refer to [the relevant content](../Browser/browser-ch.md#渲染机制) in the browser series

#### 1、Lazy execution
Lazy execution delays some logic until it is used. This technique can be used for the home screen optimization.  Lazy execution can be used in some time-consuming logic that does not need to be used on the home screen. And lazy execution requires a wake-up, which can typically be awakened by a timer or event call.

#### 2、Lazy load
Lazy loading is to delay the loading of non-critical resources

The principle of lazy loading is to only load those that need to be loaded in the custom area (usually the visible area, but it can also be the visible area that will be entered soon). For the picture, firstly set the src attribute of the image tag to be a placeholder, then put the real picture resource into a custom attribute. When entering the custom area, replace the custom attribute with the src attribute., and the picture will go to download resources, which achieves lazy loading of the picture.

Lazy loading can be used not only for images but also for other resources. For example, start playing video after entering the visible area and so on.


### File optimization
#### 1、Img optimization
##### Calculate the size of image

There are 10,000 pixels on a 100 * 100-pixel image. If the value of each pixel is stored in the way of RGBA, then there are 4 channels per pixel and 1 byte per channel (8 bits = 1 byte), so the size of the image is about 39KB (10000 * 1 * 4 / 1024)

But in a real project, it may not need so many colors to display an image, we can reduce the size of the image by reducing the color palette of each pixel.

After knowing how to calculate the size of an image,  I guess that you may have 2 ways to optimize image:
* Reduce pixels
* Reduce the color that each pixel can display

##### Image loading optimization

1. No image. Sometimes we would use a lot of modified images, those can be completely replaced by CSS.
2. For the mobile side, since the screen width is so little, there is no need to load the original image, which wastes bandwidth. We should generally load images from CDN, firstly calculate the width of the adaptation screen, and then request the corresponding cropped images.
3. Use base64 for thumbnails
4. Integrate multiple icon files into one image (Sprite image)
5. Choose the correct image format
    * Use WebP format as much as possible for browsers that can display WebP format. Because the WebP format has a better image data compression algorithm, which can bring a smaller image volume, and there is no difference in image quality with the naked eye, the disadvantage is that the compatibility of WebP format is not good
    * The thumbnail uses PNG. In fact, for most of the icons, they can be completely replaced by SVG.
    * Photo use JPEG.

#### 2、Optimization of other files

* Put the CSS file in `head`
* Server opens the function of file compression
* Place the `script` tag at the bottom of the `body`, because the execution of JS file will block the process of rendering. Of course, you can put the `script` tag anywhere and add `defer` to indicate that the file will be downloaded in parallel, but it will be executed sequentially after the HTML parsing is completed. `async` can be added to the JS files that don’t have any dependencies, indicating that the process of loading and rendering subsequent document elements will be performed in parallel with the loading and execution of the JS file.
* The execution of the excessive JS code will block the process of rendering. For codes that take a lot of time to calculate, we can consider using `Webworker`. `Webworker`  will not effect the rendering process by allowing developers to open another thread to execute the script.

#### 3、CDN

Use CDN to load static resources as far as possible. Since the browser has a limit on concurrent requests for a single domain name, we can consider using multiple CDN domain names. And we should be careful that the CDN domain name must be different from the master station when loading static resources from CDN, otherwise, each request will carry the cookie of the master station.

### Others
#### 1、Use Webpack to optimize the project

* For Webpack4,  use `production` mode to packaged projects, which will automatically open code compression.
* Use the ES6 module to open `tree shaking`, which can remove unused code.
* Optimize the image, the thumbnail can be written to the file using base64.
* Split code In accordance with the route, to achieve on-demand loading.
* Add a hash to the name of the packaged file,  to implement the browser cache file


#### 2、Monitor

For the errors of code execution, the usual way is to use `window.onerror` to intercept the error. This method can intercept most of the detailed error information, but there are exceptions

* The execution error of cross-domain code will show `script error`. For this case, we need to add the `crossorigin` attribute to the `script` tag.
* Call stack information may not be displayed for some browsers. For this case, we can use  `arguments.callee.caller`  to implement stack recursion

For asynchronous code, we can use `catch` to catch errors. For example, `Promise` can use the `catch` function directly, and `async await `can use `try catch`.

However, it should be noted that the codes which are running online are compressed, and it is necessary to generate a `sourceMap` file to facilitate debugging.

The captured errors need to be uploaded to the server,  usually, we can implement that by sending a network request using the `src` attribute of the `ima` tag.


#### 3、An interview question
##### How to render tens of thousands of data without blocking the interface

The question examines how to render data without blocking the interface. It means that you cannot render tens of thousands at a time. Instead, you should render part of the DOM at once. Then you can use the `requestAnimationFrame` to refresh every 16 milliseconds.
```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <ul>控件</ul>
  <script>
    setTimeout(() => {
        // Insert 100,000 datas
      const total = 100000
        // Insert 20 at a time. If you feel that performance is not good, reduce it.
      const once = 20
        // Calculate the number of times it needs to render the all data
      const loopCount = total / once
      let countOfRender = 0
      let ul = document.querySelector("ul");
      function add() {
          // Optimize performance, inserting data does not cause reflow
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < once; i++) {
          const li = document.createElement("li");
          li.innerText = Math.floor(Math.random() * total);
          fragment.appendChild(li);
        }
        ul.appendChild(fragment);
        countOfRender += 1;
        loop();
      }
      function loop() {
        if (countOfRender < loopCount) {
          window.requestAnimationFrame(add);
        }
      }
      loop();
    }, 0);
  </script>
</body>
</html>
```