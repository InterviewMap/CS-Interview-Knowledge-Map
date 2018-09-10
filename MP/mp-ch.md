<!-- TOC -->

- [小程序-登录](#小程序-登录)
    - [unionid和openid](#unionid和openid)
    - [关键Api](#关键api)
    - [登录流程设计](#登录流程设计)
        - [利用现有登录体系](#利用现有登录体系)
        - [利用OpenId 创建用户体系](#利用openid-创建用户体系)
        - [利用 Unionid 创建用户体系](#利用-unionid-创建用户体系)
        - [注意事项](#注意事项)
- [小程序-图片导出](#小程序-图片导出)
    - [基本原理](#基本原理)
    - [如何优雅实现](#如何优雅实现)
    - [注意事项](#注意事项-1)
- [小程序-数据统计](#小程序-数据统计)
    - [设计一个埋点sdk](#设计一个埋点sdk)
    - [分析接口](#分析接口)
    - [微信自定义数据分析](#分析接口)
- [小程序-工程化](#小程序-工程化)
    - [工程化做什么](#工程化做什么)
    - [方案选型](#方案选型)
    - [具体开发思路](#具体开发思路)
- [小程序-持续集成](#小程序-持续集成)
    - [规范化的开发流程](#规范化的开发流程)
    - [如何做小程序的持续集成](#如何做小程序的持续集成)
        - [准备工作](#准备工作)
        - [开发小程序的集成脚本](#开发小程序的集成脚本可以使用各种语言shell-js-python)
        - [集成](#集成)
    - [总结](#总结)
- [小程序架构](#小程序架构)
    - [下载小程序完整包](#下载小程序完整包)
    - [App Service - Life Cylce](#app-service---life-cylce)
    - [面试题](#面试题)
- [View - WXML](#view---wxml)
- [View - WXSS](#view---wxss)
    - [支持大部分CSS特性](#支持大部分css特性)
    - [尺寸单位 rpx](#尺寸单位-rpx)
    - [样式导入](#样式导入)
    - [内联样式](#内联样式)
    - [全局样式与局部样式](#全局样式与局部样式)
    - [iconfont](#iconfont)
- [View - Component](#view---component)
- [View - Native Component](#view---native-component)
- [目前小程序的问题或限制](#目前小程序的问题或限制)
    - [小程序HTTP2支持情况](#小程序http2支持情况)
        - [HTTP2支持情况：模拟器与真机均不支持](#http2支持情况模拟器与真机均不支持)
        - [HTTP2服务器需要对小程序做兼容性适配](#http2服务器需要对小程序做兼容性适配)
- [授权获取用户信息流程](#授权获取用户信息流程)
- [性能优化](#性能优化)
    - [加载优化](#加载优化)
        - [使用分包加载优化](#使用分包加载优化)
    - [渲染性能优化](#渲染性能优化)
- [官方小程序技术能力规划](#官方小程序技术能力规划)
    - [自定义组件2.0](#自定义组件20)
    - [npm支持](#npm支持)
    - [官方自定义组件](#官方自定义组件)
    - [添加体验评分](#添加体验评分)
    - [原生组件同层渲染](#原生组件同层渲染)
- [wepy vs mpvue](#wepy-vs-mpvue)
    - [数据流管理](#数据流管理)
    - [组件化](#组件化)
    - [工程化](#工程化)
    - [综合比较](#综合比较)
    - [选型的个人看法](#选型的个人看法)
- [mpvue](#mpvue)
  - [框架原理](#框架原理)
     - [mpvue-loader](#mpvue-loader)
     - [compiler](#compiler)
     - [runtime](#runtime)
  - [Class和Style为什么暂不支持组件](#class和style为什么暂不支持组件)
  - [分包加载](#分包加载)
  - [问题与展望](#问题与展望)
- [小程序-学习](#小程序-学习)
    - [学习建议](#学习建议)
    - [如何解决遇到的问题](#如何解决遇到的问题)
    - [总结](#总结-1)
- [参考链接](#参考链接)

<!-- /TOC -->

# 小程序-登录

## unionid和openid

了解小程序登录之前，我们写了解下小程序/公众号登录涉及到两个最关键的用户标识：

- `OpenId` 是一个用户对于一个小程序／公众号的标识，开发者可以通过这个标识识别出用户。
- `UnionId` 是一个用户对于同主体微信小程序／公众号／APP的标识，开发者需要在微信开放平台下绑定相同账号的主体。开发者可通过UnionId，实现多个小程序、公众号、甚至APP 之间的数据互通了。

## 关键Api

- [`wx.login`](https://developers.weixin.qq.com/miniprogram/dev/api/api-login.html) 官方提供的登录能力

- [`wx.checkSession`](https://developers.weixin.qq.com/miniprogram/dev/api/signature.html#wxchecksessionobject) 校验用户当前的session_key是否有效

- [`wx.authorize`](https://developers.weixin.qq.com/miniprogram/dev/api/authorize.html) 提前向用户发起授权请求

- [`wx.getUserInfo`](https://developers.weixin.qq.com/miniprogram/dev/api/api-login.html) 获取用户基本信息


## 登录流程设计

  以下从笔者接触过的几种登录流程来做阐述:

### 利用现有登录体系

  直接复用现有系统的登录体系，只需要在小程序端设计用户名，密码/验证码输入页面，便可以简便的实现登录，只需要保持良好的用户体验即可。

### 利用OpenId 创建用户体系

👆提过，`OpenId` 是一个小程序对于一个用户的标识，利用这一点我们可以轻松的实现一套基于小程序的用户体系，值得一提的是这种用户体系对用户的打扰最低，可以实现静默登录。具体步骤如下：

    1. 小程序客户端通过 `wx.login` 获取 code

    2. 传递 code 向服务端，服务端拿到 code 调用微信登录凭证校验接口，微信服务器返回 `openid` 和会话密钥 `session_key` ，此时开发者服务端便可以利用 `openid` 生成用户入库，再向小程序客户端返回自定义登录态

    3. 小程序客户端缓存 （通过`storage`）自定义登录态（token），后续调用接口时携带该登录态作为用户身份标识即可

### 利用 Unionid 创建用户体系

如果想实现多个小程序，公众号，已有登录系统的数据互通，可以通过获取到用户 unionid 的方式建立用户体系。因为 unionid 在同一开放平台下的所所有应用都是相同的，通过 `unionid` 建立的用户体系即可实现全平台数据的互通，更方便的接入原有的功能，那如何获取 `unionid` 呢，有以下两种方式：

      1. 如果户关注了某个相同主体公众号，或曾经在某个相同主体App、公众号上进行过微信登录授权，通过 `wx.login` 可以直接获取 到 `unionid`

      2. 结合 `wx.getUserInfo` 和 `<button open-type="getUserInfo"><button/>` 这两种方式引导用户主动授权，主动授权后通过返回的信息和服务端交互 (这里有一步需要服务端解密数据的过程，很简单，微信提供了示例代码) 即可拿到 `unionid` 建立用户体系， 然后由服务端返回登录态，本地记录即可实现登录，附上微信提供的最佳实践：

      - 调用 wx.login 获取 code，然后从微信后端换取到 session_key，用于解密 getUserInfo返回的敏感数据。

      - 使用 wx.getSetting 获取用户的授权情况
        - 如果用户已经授权，直接调用 API wx.getUserInfo 获取用户最新的信息；
        - 用户未授权，在界面中显示一个按钮提示用户登入，当用户点击并授权后就获取到用户的最新信息。

      - 获取到用户数据后可以进行展示或者发送给自己的后端。

### 注意事项

1. 需要获取 `unionid` 形式的登录体系，在以前（18年4月之前）是通过以下这种方式来实现，但后续微信做了调整（因为一进入小程序，主动弹起各种授权弹窗的这种形式，比较容易导致用户流失），调整为必须使用按钮引导用户主动授权的方式，这次调整对开发者影响较大，开发者需要注意遵守微信的规则，并及时和业务方沟通业务形式，不要存在侥幸心理，以防造成小程序不过审等情况。

```
   wx.login(获取code) ===> wx.getUserInfo(用户授权) ===> 获取 unionid
```

2. 因为小程序不存在 `cookie` 的概念， 登录态必须缓存在本地，因此强烈建议为登录态设置过期时间

3. 值得一提的是如果需要支持风控安全校验，多平台登录等功能，可能需要加入一些公共参数，例如platform，channel，deviceParam等参数。在和服务端确定方案时，作为前端同学应该及时提出这些合理的建议，设计合理的系统。

4. `openid` ， `unionid` 不要在接口中明文传输，这是一种危险的行为，同时也很不专业。


# 小程序-图片导出

经常开发和使用小程序的同学对这个功能一定不陌生，这是一种常见的引流方式，一般同时会在图片中附加一个小程序二维码。

## 基本原理

1. 借助 `canvas` 元素，将需要导出的样式首先在 `canvas` 画布上绘制出来 （api基本和h5保持一致，但有轻微差异，使用时注意即可）

2. 借助微信提供的 `canvasToTempFilePath` 导出图片，最后再使用 `saveImageToPhotosAlbum` （需要授权）保存图片到本地


## 如何优雅实现

根据上述的原理来看，实现是很简单的，只不过就是设计稿的提取，绘制即可，但是作为一个常用功能，每次都这样写一坨代码岂不是非常的难受。那小程序如何设计一个通用的方法来帮助我们导出图片呢？思路如下：

1. 绘制出需要的样式这一步是省略不掉的。但是我们可以封装一个绘制库，包含常见图形的绘制，例如矩形，圆角矩形，圆， 扇形， 三角形， 文字，图片减少绘制代码，只需要提炼出样式信息，便可以轻松的绘制，最后导出图片存入相册。笔者觉得以下这种方式绘制更为优雅清晰一些，其实也可以使用加入一个type参数来指定绘制类型，传入的一个是样式数组，实现绘制。

2. 结合上一步的实现，如果对于同一类型的卡片有多次导出需求的场景，也可以使用自定义组件的方式，封装同一类型的卡片为一个通用组件，在需要导出图片功能的地方，引入该组件即可。


```js
    
  class CanvasKit {
    constructor() {
    }
    drawImg(option = {}) {
      ...
      return this
    }
    drawRect(option = {}) {
      return this
    }
    drawText(option = {}) {
      ...
      return this
    }
    static exportImg(option = {}) {
      ...
    }
  }

  let drawer = new CanvasKit('canvasId').drawImg(styleObj1).drawText(styleObj2)
  drawer.exportImg()

```


## 注意事项

1. 小程序中无法绘制网络图片到canvas上，需要通过downLoadFile 先下载图片到本地临时文件才可以绘制
2. 通常需要绘制二维码到导出的图片上，有[一种方式](https://developers.weixin.qq.com/miniprogram/dev/api/qrcode.html)导出二维码时，需要携带的参数必须做编码，而且有具体的长度（32可见字符）限制，可以借助服务端生成 `短链接` 的方式来解决




# 小程序-数据统计

数据统计作为目前一种常用的分析用户行为的方式，小程序端也是必不可少的。小程序采取的曝光，点击数据埋点其实和h5原理是一样的。但是埋点作为一个和业务逻辑不相关的需求，我们如果在每一个点击事件，每一个生命周期加入各种埋点代码，则会干扰正常的业务逻辑，和使代码变的臃肿，笔者提供以下几种思路来解决数据埋点：

## 设计一个埋点sdk

小程序的代码结构是，每一个 Page 中都有一个 Page 方法，接受一个包含生命周期函数，数据的 `业务逻辑对象` 包装这层数据，借助小程序的底层逻辑实现页面的业务逻辑。通过这个我们可以想到思路，对Page进行一次包装，篡改它的生命周期和点击事件，混入埋点代码，不干扰业务逻辑，只要做一些简单的配置即可埋点，简单的代码实现如下：

```js
  
  代码仅供理解思路
  page = function(params) {
    let keys = params.keys()
    keys.forEach(v => {
        if (v === 'onLoad') {
          params[v] = function(options) {
            stat()   //曝光埋点代码
            params[v].call(this, options)
          }
        }
        else if (v.includes('click')) {
          params[v] = funciton(event) { 
            let data = event.dataset.config
            stat(data)  // 点击埋点
            param[v].call(this)
          }
        }
    })
  }
```

 这种思路不光适用于埋点，也可以用来作全局异常处理，请求的统一处理等场景。



## 分析接口

对于特殊的一些业务，我们可以采取 `接口埋点`，什么叫接口埋点呢？很多情况下，我们有的api并不是多处调用的，只会在某一个特定的页面调用，通过这个思路我们可以分析出，该接口被请求，则这个行为被触发了，则完全可以通过服务端日志得出埋点数据，但是这种方式局限性较大，而且属于分析结果得出过程，可能存在误差，但可以作为一种思路了解一下。

## [微信自定义数据分析](https://developers.weixin.qq.com/miniprogram/analysis/index.html?t=18081011)

微信本身提供的数据分析能力，微信本身提供了常规分析和自定义分析两种数据分析方式，在小程序后台配置即可。借助`小程序数据助手`这款小程序可以很方便的查看。



# 小程序-工程化

## 工程化做什么

目前的前端开发过程，工程化是必不可少的一环，那小程序工程化都需要做些什么呢，先看下目前小程序开发当中存在哪些问题需要解决：

1. 不支持 css预编译器,作为一种主流的 css解决方案，不论是 less,sass,stylus 都可以提升css效率
2. 不支持引入npm包 （这一条，从微信公开课中听闻，微信准备支持）
3. 不支持ES7等后续的js特性，好用的async await等特性都无法使用
4. 不支持引入外部字体文件，只支持base64
5. 没有 eslint 等代码检查工具

## 方案选型

对于目前常用的工程化方案，webpack，rollup，parcel等来看，都常用与单页应用的打包和处理，而小程序天生是 “多页应用” 并且存在一些特定的配置。根据要解决的问题来看，无非是文件的编译，修改，拷贝这些处理，对于这些需求，我们想到基于流的 `gulp`非常的适合处理，并且相对于webpack配置多页应用更加简单。所以小程序工程化方案推荐使用 `gulp`

## 具体开发思路

通过 gulp 的 task 实现：
    
1. 实时编译 less 文件至相应目录
2. 引入支持async，await的运行时文件
3. 编译字体文件为base64 并生成相应css文件，方便使用
4. 依赖分析哪些地方引用了npm包，将npm包打成一个文件，拷贝至相应目录
5. 检查代码规范

上述实现起来其实并不是很难，但是这样的话就是一份纯粹的 gulp 构建脚本和 约定好的目录而已，每次都有一个新的小程序都来拷贝这份脚本来处理吗？显然不合适，那如何真正的实现 `小程序工程化` 呢？
我们可能需要一个简单的脚手架，脚手架需要支持的功能：

1. 支持新建项目，创建Page，创建Component
2. 支持内置构建脚本
3. 支持发布小程序，也可以想办法接入Jenkins等工具做持续集成
  ...

限于篇幅，没有将完整的代码贴上来，如果感兴趣，可以参考笔者公司实现和在生产环境实践过的一整套小程序工程化方案[pandora-cli](https://github.com/pandolajs/pandora-cli)。


# 小程序-持续集成

很多成熟的公司的软件开发流程中为了规范化和保证产品质量，都有 `持续集成` 这个环节。在小程序这一侧，由于依赖微信开发者平台，和以往的web开发有一定的区别，本节主要介绍如何自动化的做小程序的预览，发布，提审，以实现规范化的开发，上线。

## 规范化的开发流程

小程序在提审之前，开发者可以通过二维码测试，预览。在这种情况下，如果没有规范化的流程，开发测试流程就会比较混乱，也会存在一些问题(例如不同同学的功能测试，手动提供二维码给测试同学，二维码失效)，所以在开发时笔者建议采用如下开发流程（未接入持续集成）：

1. 不同的开发同学根据开发任务拉分支在本地开发，自测
2. 开发完成后提交到远端，经过 `review` 或者 `代码审核` 之后，合并到develop分支并上传体验包，作为可提测的版本
3. 告知测试同学可以测试，测试同学可以通过[小程序开发助手](https://developers.weixin.qq.com/miniprogram/dev/devtools/mydev.html)打开体验版本来测试
4. 测试完成之后，合并 `develop` 代码至 `master` 分支，并提审上线，上线完成后删除无用分支，打上版本`tag`


## 如何做小程序的持续集成

### 准备工作

1. 操作系统为 `windows` 或者 `macOS` 的服务器
2. 服务端安装小程序开发者工具 [下载地址](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
3. 准备一个通用打包构建角色微信号，并将改微信号添加到所有小程序的开发者中，提供开发者权限

### 开发小程序的集成脚本（可以使用各种语言`shell`, `js`, `python`...）

开发者工具根据提供了 [cli](https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html 和 [http](https://developers.weixin.qq.com/miniprogram/dev/devtools/http.html)两种方式供外部调用来实现登录，预览，上传，下面介绍下 `http` 调用，`cli` 方式也很类似。
开发者工具打开之后，本地会启动一个 `http` 服务，端口号在用户目录的 `.ide` 文件中，并且提供以下几个接口供开发者调用：

- `/open` 打开指定路径项目
- `/login` 登录
- `/preview` 预览指定项目
- `/upload` 上传指定项目
- `/test` 提交项目

根据提供的这些能力，我们可以编写出发布脚本(以下是简单示例)：


```js

  function getPort () {
    const home = os.homedir()
    const portPath = process.platform === 'win32' 
      ? path.join(home, '/AppData/Local/微信web开发者工具/User Data/Default/.ide') 
      : path.join(home, '/Library/Application Support/微信web开发者工具/Default/.ide')
    if (!fs.existsSync(portPath)) {
      this.log.error('error')
    } else {
      const port = fs.readFileSync(portPath, { encoding: 'utf8' })
      return +port
    }
  }

  function release() {
      http.get(`http://127.0.0.1:${port}/upload?projectpath=${encodeURIComponent(path)}&version=${version}&desc=${encodeURIComponent(message)}`, res => {
      const { statusCode } = res
      if (statusCode === 200) {
        // success
      } else {
        // fail
      }
    })
  }

```

### 集成

不同公司使用的工具有一些区别，下面简单介绍一下常见的两种(一般是运维同学来执行，笔者不是特别熟悉，所以只是简单介绍)：

- gitlab

  安装[gitlab runner](https://docs.gitlab.com.cn/runner/register/index.html)，搭配gitlab提供的CI
  编写CI文件，这份文件会包含构建命令，将上一步编写的脚本集成进执行命令即可

- Jenkis

  安装[Jenkis](https://jenkins.io/download/)后新建构建任务，配置任务(指定代码仓库，分支，构建参数)，指明构建方式（可以选择shell，然后编写shell来执行你的脚本）

做完集成后，就可以优化上面介绍的开发流程，将`打测试包`和`发布`的权利交给测试同学，开发者安心的开发啦。

## 总结

以上是笔者实践过的对小程序持续集成的整个流程，不管公司有没有接入持续集成，上面的方式都可以方便开发者自动化的预览，发布，也可以集成到工程化流程中，使用起来会更加方便。具体的实现可以参考[pandora-cli](https://github.com/pandolajs/pandora-cli)。


# 小程序架构

![architecture](https://user-images.githubusercontent.com/2350193/44563914-ff97c380-a792-11e8-8e77-6d0970891e24.png)

微信小程序的框架包含两部分 View 视图层、App Service逻辑层。View 层用来渲染页面结构，AppService 层用来逻辑处理、数据请求、接口调用。

它们在**两个线程里**运行。

它们在**两个线程里**运行。

它们在**两个线程里**运行。

视图层和逻辑层通过系统层的 JSBridage 进行通信，逻辑层把数据变化通知到视图层，触发视图层页面更新，视图层把触发的事件通知到逻辑层进行业务处理。

补充

![one-context](https://user-images.githubusercontent.com/2350193/44186238-db146980-a14a-11e8-8096-bcb8fa6d28b2.png)

**视图层使用 WebView 渲染，iOS 中使用自带 WKWebView，在 Android 使用腾讯的 x5 内核（基于 Blink）运行。**

**逻辑层使用在 iOS 中使用自带的 JSCore 运行，在 Android 中使用腾讯的 x5 内核（基于 Blink）运行。**

**开发工具使用 nw.js 同时提供了视图层和逻辑层的运行环境。**



在 Mac下 使用 js-beautify 对微信开发工具 @v1.02.1808080代码批量格式化：

```Shell
cd /Applications/wechatwebdevtools.app/Contents/Resources/package.nw
find . -type f -name '*.js' -not -path "./node_modules/*" -not -path -exec js-beautify -r -s 2 -p -f '{}' \;
```

在 `js/extensions/appservice/index.js` 中找到：

```js
  267: function(a, b, c) {
    const d = c(8),
      e = c(227),
      f = c(226),
      g = c(228),
      h = c(229),
      i = c(230);
    var j = window.__global.navigator.userAgent,
      k = -1 !== j.indexOf('game');
    k || i(), window.__global.getNewWeixinJSBridge = (a) => {
      const {
        invoke: b
      } = f(a), {
        publish: c
      } = g(a), {
        subscribe: d,
        triggerSubscribeEvent: i
      } = h(a), {
        on: j,
        triggerOnEvent: k
      } = e(a);
      return {
        invoke: b,
        publish: c,
        subscribe: d,
        on: j,
        get __triggerOnEvent() {
          return k
        },
        get __triggerSubscribeEvent() {
          return i
        }
      }
    }, window.WeixinJSBridge = window.__global.WeixinJSBridge = window.__global.getNewWeixinJSBridge('global'), window.__global.WeixinJSBridgeMap = {
      __globalBridge: window.WeixinJSBridge
    }, __devtoolsConfig.online && __devtoolsConfig.autoTest && setInterval(() => {
      console.clear()
    }, 1e4);
    try {
      var l = new window.__global.XMLHttpRequest;
      l.responseType = 'text', l.open('GET', `http://${window.location.host}/calibration/${Date.now()}`, !0), l.send()
    } catch (a) {}
  }
```

在 `js/extensions/gamenaitveview/index.js` 中找到：

```js
  299: function(a, b, c) {
    'use strict';
    Object.defineProperty(b, '__esModule', {
      value: !0
    });
    var d = c(242),
      e = c(241),
      f = c(243),
      g = c(244);
    window.WeixinJSBridge = {
      on: d.a,
      invoke: e.a,
      publish: f.a,
      subscribe: g.a
    }
  },
```

在 `js/extensions/pageframe/index.js `中找到：

```js
317: function(a, b, c) {
    'use strict';

    function d() {
      window.WeixinJSBridge = {
        on: e.a,
        invoke: f.a,
        publish: g.a,
        subscribe: h.a
      }, k.a.init();
      let a = document.createEvent('UIEvent');
      a.initEvent('WeixinJSBridgeReady', !1, !1), document.dispatchEvent(a), i.a.init()
    }
    Object.defineProperty(b, '__esModule', {
      value: !0
    });
    var e = c(254),
      f = c(253),
      g = c(255),
      h = c(256),
      i = c(86),
      j = c(257),
      k = c.n(j);
    'complete' === document.readyState ? d() : window.addEventListener('load', function() {
      d()
    })
  },
```



我们都看到了 WeixinJSBridge 的定义。分别都有 `on`、`invoke`、`publish`、`subscribe` 这个几个关键方法。

拿 `invoke` 举例，在 `js/extensions/appservice/index.js `中发现这段代码：

```js
f (!r) p[b] = s, f.send({
    command: 'APPSERVICE_INVOKE',
    data: {
        api: c,
        args: e,
        callbackID: b
    }
});
```

在 `js/extensions/pageframe/index.js` 中发现这段代码：

```js
g[d] = c, e.a.send({
    command: 'WEBVIEW_INVOKE',
    data: {
        api: a,
        args: b,
        callbackID: d
    }
})

```

简单的分析得知：字段 `command` 用来区分行为，`invoke` 用来调用 Native 的 Api。在不同的来源要使用不同的前缀。`data` 里面包含 Api 名，参数。另外 `callbackID` 指定接受回调的方法句柄。Appservice 和 Webview 使用的通信协议是一致的。

我们不能在代码里使用 BOM 和 DOM 是因为根本没有，另一方面也不希望 JS 代码直接操作视图。

在开发工具中 `remote-helper.js` 中找到了这样的代码：

```js
const vm = require("vm");

const vmGlobal = {
    require: undefined,
    eval: undefined,
    process: undefined,
    setTimeout(...args) {
        //...省略代码
        return timerCount;
    },
    clearTimeout(id) {
        const timer = timers[id];
        if (timer) {
            clearTimeout(timer);
            delete timers[id];
        }
    },
    setInterval(...args) {
        //...省略代码
        return timerCount;
    },
    clearInterval(id) {
        const timer = timers[id];
        if (timer) {
            clearInterval(timer);
            delete timers[id];
        }
    },
    console: (() => {
        //...省略代码
        return consoleClone;
    })()
};
const jsVm = vm.createContext(vmGlobal);
// 省略大量代码...
function loadCode(filePath, sourceURL, content) {
    let ret;
    try {
        const script = typeof content === 'string' ? content : fs.readFileSync(filePath, 'utf-8').toString();
        ret = vm.runInContext(script, jsVm, {
            filename: sourceURL,
        });
    }
    catch (e) {
        // something went wrong in user code
        console.error(e);
    }
    return ret;
}
```

这样的分层设计显然是有意为之的，它的中间层完全控制了程序对于界面进行的操作， 同时对于传递的数据和响应时间也能做到监控。一方面程序的行为受到了极大限制， 另一方面微信可以确保他们对于小程序内容和体验有绝对的控制。

这样的结构也说明了小程序的动画和绘图 API 被设计成生成一个最终对象而不是一步一步执行的样子， 原因就是  Json 格式的数据传递和解析相比与原生 API 都是损耗不菲的，如果频繁调用很可能损耗过多性能，进而影响用户体验。

## 下载小程序完整包

![download](https://user-images.githubusercontent.com/2350193/44563929-13432a00-a793-11e8-976e-e3040deded70.png)

## App Service - Life Cylce

![lifecycle](https://user-images.githubusercontent.com/2350193/44563935-1b02ce80-a793-11e8-88d1-a89b7c93d4da.png)

## 面试题
**1.动画需要绑定在 data 上，而绘图却不用。你觉得是为什么呢？**

```js
var context = wx.createCanvasContext('firstCanvas')
    
context.setStrokeStyle("#00ff00")
context.setLineWidth(5)
context.rect(0, 0, 200, 200)
context.stroke()
context.setStrokeStyle("#ff0000")
context.setLineWidth(2)
context.moveTo(160, 100)
context.arc(100, 100, 60, 0, 2 * Math.PI, true)
context.moveTo(140, 100)
context.arc(100, 100, 40, 0, Math.PI, false)
context.moveTo(85, 80)
context.arc(80, 80, 5, 0, 2 * Math.PI, true)
context.moveTo(125, 80)
context.arc(120, 80, 5, 0, 2 * Math.PI, true)
context.stroke()
context.draw()
```

```Js
Page({
  data: {
    animationData: {}
  },
  onShow: function(){
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    this.animation = animation
    
    animation.scale(2,2).rotate(45).step()
    
    this.setData({
      animationData:animation.export()
    })
  }
})
```

**2.小程序的 Http Rquest 请求是不是用的浏览器 Fetch API?**

知识点考察

- 知道 Request 是由 Native 实现的
- JSCore 是不带 Http Request、Websocket、Storage等功能的，那是 Webkit 带的
- 小程序的 `wx.request` 是不是遵循 fetch API 规范实现的呢？答案，显然不是。因为没有 `Promise`

# View - WXML

WXML（WeiXin Markup Language）

- 支持数据绑定
- 支持逻辑算术、运算
- 支持模板、引用
- 支持添加事件（bindtap）

![WXML](https://pic3.zhimg.com/80/v2-e0a34d00890cab73c79d137edd1377a3_hd.jpg)

Wxml编译器：Wcc  把 Wxml文件 转为 JS

执行方式：Wcc index.wxml

**使用 Virtual DOM，进行局部更新**



# View - WXSS

WXSS(WeiXin Style Sheets)

![WXSS](https://pic2.zhimg.com/80/v2-3829f8c15260cd0cbcbadfab3446ad65_hd.jpg)

wxss编译器：wcsc 把wxss文件转化为 js 

执行方式： wcsc index.wxss



## 支持大部分CSS特性

亲测包含但不限于如下内容：

- Transition
- Animation
  - Keyframes
- border-radius
- calc()
- 选择器，除了[官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxss.html)列出的，其实还支持
  - element>element
  - element+element
  - element element
  - element:first-letter
  - element:first-line
  - element:first-child
  - element:last-child
  - element~element
  - element:first-of-type
  - element:last-of-type
  - element:only-of-type
  - element:only-child
  - element:nth-child(n)
  - element:nth-last-child(n)
  - element:nth-of-type(n)
  - element:nth-last-of-type(n)
  - :root
  - element:empty
  - :not(element)
- iconfont


建议 Css3 的特性都可以做一下尝试。



## 尺寸单位 rpx

rpx（responsive pixel）: 可以根据屏幕宽度进行自适应。规定屏幕宽为 750rpx。公式：

```Js
const dsWidth = 750

export const screenHeightOfRpx = function () {
  return 750 / env.screenWidth * env.screenHeight
}

export const rpxToPx = function (rpx) {
  return env.screenWidth / 750 * rpx
}

export const pxToRpx = function (px) {
  return 750 / env.screenWidth * px
}

```

| 设备         | rpx换算px (屏幕宽度/750) | px换算rpx (750/屏幕宽度) |
| ------------ | ------------------------ | ------------------------ |
| iPhone5      | 1rpx = 0.42px            | 1px = 2.34rpx            |
| iPhone6      | 1rpx = 0.5px             | 1px = 2rpx               |
| iPhone6 Plus | 1rpx = 0.552px           | 1px = 1.81rpx            |

可以了解一下 [pr2rpx-loader ](https://github.com/mpvue/px2rpx-loader)这个库。

## 样式导入

使用 `@import `语句可以导入外联样式表，`@import `后跟需要导入的外联样式表的相对路径，用 `;` 表示语句结束。



## 内联样式

静态的样式统一写到 class 中。style 接收动态的样式，在运行时会进行解析，**请尽量避免将静态的样式写进 style 中，以免影响渲染速度**。



## 全局样式与局部样式

定义在 app.wxss 中的样式为全局样式，作用于每一个页面。在 page 的 wxss 文件中定义的样式为局部样式，只作用在对应的页面，并会覆盖 app.wxss 中相同的选择器。

## iconfont
**截止20180810**

小程序未来有计划支持字体。参考[微信公开课](http://daxue.qq.com/content/content/id/4113)。

小程序开发与平时 Web开发类似，也可以使用字体图标，但是 `src:url()` 无论本地还是远程地址都不行，base64 值则都是可以显示的。

将 ttf 文件转换成 base64。打开这个平台 transfonter.org/。点击 Add fonts 按钮，加载ttf格式的那个文件。将下边的 base64 encode 改为 on。点击 Convert 按钮进行转换，转换后点击 download 下载。

复制下载的压缩文件中的 stylesheet.css 的内容到 font.wxss ，并且将 icomoon 中的 style.css 除了 @font-face 所有的代码也复制到 font.wxss 并将i选择器换成 .iconfont，最后：

```html
<text class="iconfont icon-home" style="font-size:50px;color:red"></text>
```

# View - Component

小程序提供了一系列组件用于开发业务功能，按照功能与HTML5的标签进行对比如下：

![Component](https://pic3.zhimg.com/80/v2-480318a5bae828e51e8f05c1ea1921fa_hd.jpg)

小程序的组件基于Web Component标准

使用Polymer框架实现Web Component



# View - Native Component

目前Native实现的组件有

- canvas

- video

- map

- textarea

  ![Native Component](https://pic1.zhimg.com/80/v2-f0e838350357658699aeeed7dad74048_hd.jpg)

Native组件层在 WebView 层之上。这目前带来了一些问题：
- Native 实现的组件会遮挡其他组件
- WebView 渲染出来的视图在滚动时，Native 实现的组件需要更新位置，这会带来性能问题，在安卓机器上比较明显
- 小程序原生组件 `cover-view` 可以覆盖 canvas video 等，但是也有一下弊端，比如在 canvas 上覆盖 `cover-view`，就会发现坐标系不统一处理麻烦


# 目前小程序的问题或限制
**截止20180810**

包含但不限于：

- 小程序仍然使用 WebView 渲染，并非原生渲染。（部分原生）

- 服务端接口返回的头无法执行，比如：Set-Cookie。

- 依赖浏览器环境的 JS 库不能使用。

- 不能使用 npm，但是可以自搭构建工具或者使用 mpvue。（未来官方有计划支持）

- 不能使用 ES7，可以自己用babel+webpack自搭或者使用 mpvue。

- 不支持使用自己的字体（未来官方计划支持）。

- 可以用 base64 的方式来使用 iconfont。

- 小程序不能发朋友圈（可以通过保存图片到本地，发图片到朋友前。二维码可以使用[B接口](https://developers.weixin.qq.com/miniprogram/dev/api/qrcode.html)）。

- 获取[二维码/小程序](https://developers.weixin.qq.com/miniprogram/dev/api/qrcode.html)接口的限制。

  - B 接口 scene 最大32个可见字符。
  - AC 接口总共生成的码数量限制为 100,000，请谨慎调用。
  - 真机扫描二维码只能跳转到线上版本，所以测试环境下只可通过开发者工具的通过二维码编译进行调试。
  - 没有发布到线上版本的小程序页面路径会导致生成二维码失败，需要先将添加了页面的小程序发布到线上版本。

- 小程序推送只能使用“服务通知” 而且需要用户主动触发提交 formId，formId 只有7天有效期。（现在的做法是在每个页面都放入form并且隐藏以此获取更多的 formId。后端使用原则为：优先使用有效期最短的）

- 小程序大小限制 2M，分包总计不超过 8M

- 转发（分享）小程序不能拿到成功结果，原来可以。[链接](https://mp.weixin.qq.com/s?__biz=MjM5NDAwMTA2MA==&mid=2695730124&idx=1&sn=666a448b047d657350de7684798f48d3&chksm=83d74a07b4a0c311569a748f4d11a5ebcce3ba8f6bd5a4b3183a4fea0b3442634a1c71d3cdd0&scene=21#wechat_redirect)（小游戏造的孽）

- 拿到相同的 unionId 必须绑在同一个开放平台下。开放平台绑定限制：

  - 50个移动应用
  - 10个网站
  - 50个同主体公众号
  - 5个不同主体公众号
  - 50个同主体小程序
  - 5个不同主体小程序

- 公众号关联小程序，[链接](https://developers.weixin.qq.com/miniprogram/introduction/#%E5%85%AC%E4%BC%97%E5%8F%B7%E5%85%B3%E8%81%94%E5%B0%8F%E7%A8%8B%E5%BA%8F)

  - 所有公众号都可以关联小程序。
  - 一个公众号可关联10个同主体的小程序，3个不同主体的小程序。
  - 一个小程序可关联500个公众号。
  - 公众号一个月可新增关联小程序13次，小程序一个月可新增关联500次。

- 一个公众号关联的10个同主体小程序和3个非同主体小程序可以互相跳转

- 品牌搜索不支持金融、医疗

- 小程序授权需要用户主动点击

- 小程序不提供测试 **access_token**

- 安卓系统下，小程序授权获取用户信息之后，删除小程序再重新获取，并重新授权，得到旧签名，导致第一次授权失败

- 开发者工具上，授权获取用户信息之后，如果清缓存选择全部清除，则即使使用了wx.checkSession，并且在session_key有效期内，授权获取用户信息也会得到新的session_key

## 小程序HTTP2支持情况
### HTTP2支持情况：模拟器与真机均不支持
为了验证小程序对HTTP的支持适配情况，我找了两个服务器做测试，一个是网上搜索到支持HTTP2的服务器，一个是我本地起的一个HTTP2服务器。测试中所有请求方法均使用 `wx.request`。

1. 网上支持HTTP2的服务器：`HTTPs://www.snel.com:443`
2. 在Chrome上查看该服务器为 HTTP2

    ![WechatIMG11](https://user-images.githubusercontent.com/17850400/44331323-d11c9e80-a49b-11e8-9a52-5be0e17a016b.jpeg)

3. 在模拟器上请求该接口，`请求头`的HTTP版本为HTTP1.1，模拟器不支持HTTP2

    ![WechatIMG12](https://user-images.githubusercontent.com/17850400/44331316-cfeb7180-a49b-11e8-83fb-f18ad4ff0bab.jpeg)


4. 由于小程序线上环境需要在项目管理里配置请求域名，而这个域名不是我们需要的请求域名，没必要浪费一个域名位置，所以打开不验证域名，TSL 等选项请求该接口，通过抓包工具表现与模拟器相同

    ![WechatIMG14](https://user-images.githubusercontent.com/17850400/44331317-d0840800-a49b-11e8-854d-20c704b5da56.png)


### HTTP2服务器需要对小程序做兼容性适配
由上可以看出，在真机与模拟器都不支持 HTTP2，但是都是成功请求的，并且 `响应头` 里的 HTTP 版本都变成了HTTP1.1 版本，说明服务器对 HTTP1.1 做了兼容性适配。

1. 本地新启一个 node 服务器，返回 JSON 为请求的 HTTP 版本

    ![WechatIMG16](https://user-images.githubusercontent.com/17850400/44331322-d0840800-a49b-11e8-9f4b-85a31458d32d.jpeg)

2. 如果服务器只支持 HTTP2，在模拟器请求时发生了一个 `ALPN` 协议的错误。并且提醒使用适配 HTTP1

    ![WechatIMG8](https://user-images.githubusercontent.com/17850400/44331314-cfeb7180-a49b-11e8-98a7-2baff8de63b4.jpeg)

3. 当把服务器的 `allowHTTP1`，设置为 `true`，并在请求时处理相关相关请求参数后，模拟器能正常访问接口，并打印出对应的 HTTP 请求版本

    ![WechatIMG15](https://user-images.githubusercontent.com/17850400/44331318-d0840800-a49b-11e8-9931-a95c1fe2b0c4.jpeg)

# 授权获取用户信息流程
<img src="https://user-images.githubusercontent.com/35895755/44379940-fa403c00-a53a-11e8-9165-21b217496aad.png" width="70%" height="70%" />

- session_key 有有效期，有效期并没有被告知开发者，只知道用户越频繁使用小程序，session_key 有效期越长
- 在调用 wx.login 时会直接更新 session_key，导致旧 session_key 失效
- 小程序内先调用 wx.checkSession 检查登录态，并保证没有过期的 session_key 不会被更新，再调用 wx.login 获取 code。接着用户授权小程序获取用户信息，小程序拿到加密后的用户数据，把加密数据和 code 传给后端服务。后端通过 code 拿到 session_key 并解密数据，将解密后的用户信息返回给小程序

**面试题：先授权获取用户信息再 login 会发生什么？**

<img src="https://user-images.githubusercontent.com/35895755/44244965-268d4d00-a209-11e8-8ef4-b80cc7a78af7.png" width="70%" height="70%" />
<img src="https://user-images.githubusercontent.com/35895755/44379952-0af0b200-a53b-11e8-86be-640bf651bc9e.png" width="50%" height="50%" />

- 用户授权时，开放平台使用旧的 session_key 对用户信息进行加密。调用 wx.login 重新登录，会刷新 session_key，这时后端服务从开放平台获取到新 session_key，但是无法对老 session_key 加密过的数据解密，用户信息获取失败
- 在用户信息授权之前先调用 wx.checkSession 呢？wx.checkSession 检查登录态，并且保证 wx.login 不会刷新 session_key，从而让后端服务正确解密数据。但是这里存在一个问题，如果小程序较长时间不用导致 session_key 过期，则 wx.login 必定会重新生成 session_key，从而再一次导致用户信息解密失败。

# 性能优化

**我们知道view部分是运行在webview上的，所以前端领域的大多数优化方式都有用。**

**我们知道view部分是运行在webview上的，所以前端领域的大多数优化方式都有用。**

**我们知道view部分是运行在webview上的，所以前端领域的大多数优化方式都有用。**




## 加载优化

![preload](https://user-images.githubusercontent.com/2350193/44184904-d8624600-a143-11e8-8ab9-c932573bd243.png)

代码包的大小是最直接影响小程序加载启动速度的因素。代码包越大不仅下载速度时间长，业务代码注入时间也会变长。所以最好的优化方式就是减少代码包的大小。

![load-time-series](https://user-images.githubusercontent.com/2350193/44184987-4c9ce980-a144-11e8-9f28-764209b37341.png)

小程序加载的三个阶段的表示。


**优化方式**

- 代码压缩。
- 及时清理无用代码和资源文件。
- 减少代码包中的图片等资源文件的大小和数量。
- 分包加载。

**首屏加载的体验优化建议**

- 提前请求: 异步数据请求不需要等待页面渲染完成。
- 利用缓存: 利用 storage API 对异步请求数据进行缓存，二次启动时先利用缓存数据渲染页面，在进行后台更新。
- 避免白屏：先展示页面骨架页和基础内容。
- 及时反馈：即时地对需要用户等待的交互操作给出反馈，避免用户以为小程序无响应。

### 使用分包加载优化
![sub-package](https://user-images.githubusercontent.com/2350193/44185607-2298f680-a147-11e8-8440-24ca42033623.png)

在构建小程序分包项目时，构建会输出一个或多个功能的分包，其中每个分包小程序必定含有一个主包，所谓的主包，即放置默认启动页面/TabBar 页面，以及一些所有分包都需用到公共资源/JS 脚本，而分包则是根据开发者的配置进行划分。

在小程序启动时，默认会下载主包并启动主包内页面，如果用户需要打开分包内某个页面，客户端会把对应分包下载下来，下载完成后再进行展示。

优点：

* 对开发者而言，能使小程序有更大的代码体积，承载更多的功能与服务
* 对用户而言，可以更快地打开小程序，同时在不影响启动速度前提下使用更多功能

限制：

* 整个小程序所有分包大小不超过 8M
* 单个分包/主包大小不能超过 2M

**原生分包加载的配置**
假设支持分包的小程序目录结构如下：

```
├── app.js
├── app.json
├── app.wxss
├── packageA
│   └── pages
│       ├── cat
│       └── dog
├── packageB
│   └── pages
│       ├── apple
│       └── banana
├── pages
│   ├── index
│   └── logs
└── utils

```
开发者通过在 app.json subPackages 字段声明项目分包结构：

```
{
  "pages":[
    "pages/index",
    "pages/logs"
  ],
  "subPackages": [
    {
      "root": "packageA",
      "pages": [
        "pages/cat",
        "pages/dog"
      ]
    }, {
      "root": "packageB",
      "pages": [
        "pages/apple",
        "pages/banana"
      ]
    }
  ]
}

```
**分包原则**

* 声明 subPackages 后，将按 subPackages 配置路径进行打包，subPackages 配置路径外的目录将被打包到 app（主包） 中
* app（主包）也可以有自己的 pages（即最外层的 pages 字段
* subPackage 的根目录不能是另外一个 subPackage 内的子目录
* 首页的 TAB 页面必须在 app（主包）内

**引用原则**

* packageA 无法 require packageB JS 文件，但可以 require app、自己 package 内的 JS 文件
* packageA 无法 import packageB 的 template，但可以 require app、自己 package 内的 template
* packageA 无法使用 packageB 的资源，但可以使用 app、自己 package 内的资源

**官方即将推出**
分包预加载

![preload-sub-package](https://user-images.githubusercontent.com/2350193/44185655-63910b00-a147-11e8-9987-40f235ae08e9.png)

独立分包

![single-sub-package](https://user-images.githubusercontent.com/2350193/44185690-96d39a00-a147-11e8-9647-bd1cbc017f5a.png)

## 渲染性能优化
![render](https://user-images.githubusercontent.com/2350193/44185879-af907f80-a148-11e8-8dcb-22aadd4e49a6.png)
- 每次 setData 的调用都是一次进程间通信过程，通信开销与 setData 的数据量正相关。

- setData 会引发视图层页面内容的更新，这一耗时操作一定时间中会阻塞用户交互。

- **setData 是小程序开发使用最频繁，也是最容易引发性能问题的。**

**避免不当使用 setData**

- 使用 data 在方法间共享数据，**可能增加 setData 传输的数据量**。data 应仅包括与页面渲染相关的数据。
- 使用 setData 传输大量数据，**通讯耗时与数据正相关，页面更新延迟可能造成页面更新开销增加**。仅传输页面中发生变化的数据，使用 setData 的特殊 key 实现局部更新。
- 短时间内频繁调用 setData，**操作卡顿，交互延迟，阻塞通信，页面渲染延迟**。避免不必要的 setData，对连续的setData调用进行合并。
- 在后台页面进行 setData，**抢占前台页面的渲染资源**。页面切入后台后的 setData 调用，延迟到页面重新展示时执行。

![one-context](https://user-images.githubusercontent.com/2350193/44186238-db146980-a14a-11e8-8096-bcb8fa6d28b2.png)



**避免不当使用onPageScroll**

- 只在有必要的时候监听 pageScroll 事件。不监听，则不会派发。
- 避免在 onPageScroll 中执行复杂逻辑
- 避免在 onPageScroll 中频繁调用 setData
- 避免滑动时频繁查询节点信息（SelectQuery）用以判断是否显示，部分场景建议使用节点布局橡胶状态监听（inersectionObserver）替代

**使用自定义组件**

在需要频繁更新的场景下，自定义组件的更新只在组件内部进行，不受页面其他部分内容复杂性影响。



# 官方小程序技术能力规划

## 自定义组件2.0

小程序的几个页面间，存在一些相同或是类似的区域，这时候可以把这些区域逻辑封装成一个自定义组件，代码就可以重用，或者对于比较独立逻辑，也可以把它封装成一个自定义组件，也就是微信去年发布的自定义组件，它让代码得到复用、减少代码量，更方便模块化，优化代码架构组织，也使得模块清晰，后期更好地维护，从而保证更好的性能。

但微信打算在原来的基础上推出的自定义组件 2.0，它将拥有更高级的性能：

- usingComponents 计划支持全局定义和通配符定义：这意味着不用在每个页面反复定义，可以批量导入目录下的所有自定义组件
- 计划支持类似 Computed 和 watch 的功能，它能使代码逻辑更清晰
- 计划支持 Component 构造器插件，在实例化一个自定义组件的时候，允许你在构造器的这个阶段，加入一些逻辑，方便进行一些扩展，甚至是可以扩展成 Vue 的语法

## npm支持

目前小程序开发的痛点是：开源组件要手动复制到项目，后续更新组件也需要手动操作。不久的将来，小程序将支持npm包管理，有了这个之后，想要引入一些开源的项目就变得很简单了，只要在项目里面声明，然后用简单的命令安装，就可以使用了。

## 官方自定义组件

微信小程序团队表示，他们在考虑推出一些官方自定义组件，为什么不内置到基础库里呢？因为内置组件要提供给开发者，这个组件一定是开发者很难实现或者是无法实现的一个能力。所以他们更倾向于封装成自定义组件，想基于这些内置组件里，封装一些比较常见的、交互逻辑比较复杂的组件给大家使用，让大家更容易开发。类似弹幕组件，开发者就不用关注弹幕怎么飘，可以节省开发者的开发成本。

同时，他们也想给开发者提供一些规范和一些模板，让开发者设计出好用的自定义组件，更好地被大家去使用。

 ## 添加体验评分

当小程序加载太慢时，可能会导致用户的流失，而小程序的开发者可能会面临着不知道如何定位问题或不知如何解决问题的困境。

为此，小程序即将推出一个体验评分的功能，这是为了帮助开发者可以检查出小程序有一些什么体验不好的地方，也会同时给出一份优化的指引建议。

## 原生组件同层渲染

小程序在最初的技术选型时，引入了原生组件的概念，因为原生组件可以使小程序的能力更加丰富，比如地图、音视频的能力，但是原生组件是由客户端原生渲染的，导致了原生组件的层级是最高的，开发者很容易遇到打开调试的问题，发现视频组件挡在了 vConsole 上。

为了解决这个问题，当时微信做了一个过渡的方案：cover-view。cover-view可以覆盖在原生组件之上，这一套方案解决了大部分的需求场景。比如说视频组件上很多的按钮、标题甚至还有动画的弹幕，这些都是用 cover-view 去实现的，但它还是没有完全解决原生组件的开发体验问题，因为 cover-view 有一些限制：

- 无法与其他组件混在一起渲染
- 没有完整的触摸事件
- cover-view 对样式的表现有差异
- cover-view 对样式的支持度不够高

因此微信决定将用同层渲染取代 cover-view，它能像普通组件一样使用，原生组件的层级不再是最高，而是和其他的非原生组件在同一层级渲染，可完全由 z-index 控制，可完全支持触摸事件。

微信表示，同层渲染在 iOS 平台小程序上已经开始内测，会很快开放给开发者，Android 平台已经取得突破性进展，目前正在做一轮封装的工作，开放指日可待。

# wepy vs mpvue

## 数据流管理
相比传统的小程序框架，这个一直是我们作为资深开发者比较期望去解决的，在 Web 开发中，随着 Flux、Redux、Vuex 等多个数据流工具出现，我们也期望在业务复杂的小程序中使用。

* WePY 默认支持 Redux，在脚手架生成项目的时候可以内置

* Mpvue 作为 Vue 的移植版本，当然支持 Vuex，同样在脚手架生成项目的时候可以内置

## 组件化
如果你和我们一样，经历了从无到有的小程序业务开发，建议阅读【小程序的组件化开发】章节，进行官方语法的组件库开发（从基础库 1.6.3 开始，官方提供了组件化解决方案）。

* WePY 类似 Vue 实现了单文件组件，最大的差别是文件后缀 .wpy，只是写法上会有差异，具体可以查看【主流框架使用案例 1：WePY】章节，学习起来有一定成本，不过也会很快适应：

```
export default class Index extends wepy.page {}
```

* Mpvue 作为 Vue 的移植版本，支持单文件组件，template、script 和 style 都在一个 .vue 文件中，和 vue 的写法类似，所以对 Vue 开发熟悉的同学会比较适应。

## 工程化
所有的小程序开发依赖官方提供的开发者工具。开发者工具简单直观，对调试小程序很有帮助，现在也支持腾讯云（目前我们还没有使用，但是对新的一些开发者还是有帮助的），可以申请测试报告查看小程序在真实的移动设备上运行性能和运行效果，但是它本身没有类似前端工程化中的概念和工具。

* wepy 内置了构建，通过 wepy init 命令初始化项目，大致流程如下：

- wepy-cli 会判断模版是在远程仓库还是在本地，如果在本地则会立即跳到第 3 步，反之继续进行。
- 会从远程仓库下载模版，并保存到本地。
- 询问开发者 Project name 等问题，依据开发者的回答，创建项目。

* mpvue 沿用了 vue 中推崇的 webpack 作为构建工具，但同时提供了一些自己的插件以及配置文件的一些修改，比如：

- 不再需要 html-webpack-plugin
- 基于 webpack-dev-middleware 修改成 webpack-dev-middleware-hard-disk
- 最大的变化是基于 webpack-loader 修改成 mpvue-loader
- 但是配置方式还是类似，分环境配置文件，最终都会编译成小程序支持的目录结构和文件后缀。

## 综合比较
| 对比\框架 | 微信小程序     | mpvue             | wepy            |
| --------- | -------------- | ----------------- | --------------- |
| 语法规范  | 小程序开发规范 | vue.js            | 类vue.js        |
| 标签集合  | 小程序         | htm l + 小程序    | 小程序          |
| 样式规范  | wxss           | sass,less,postcss | sass,less,styus |
| 组件化    | 基础库@2.2.3自定义组件   | vue规范           | 自定义组件规范  |
| 多段复用  | 不可复用       | 支持h5            | 支持h5          |
| 自动构建  | 无自动构建     | webpack           | 框架内置        |
| 上手成本  | 全新学习       | vue 学习          | vue 和 wepy     |
| 数据管理  | 不支持         | vuex              | redux           |

## 选型的个人看法
先说结论：选择 mpvue。

wepy vs mpvue。

理由：

**工程化**
原生开发因为不带工程化，诸如NPM包（未来会引入）、ES7、图片压缩、PostCss、pug、ESLint等等不能用。如果自己要搭工程化，不如直接使用wepy或mpvue。mpvue和wepy都可以和小程序原生开发混写。[参考mpvue-echart](#https://github.com/mpvue/examples/tree/master/echarts)，[参考wepy](https://github.com/Tencent/wepy/issues/1560)。
而问题在于wepy没有引入webpack(wepy@2.0.x依然没有引入)，以上说的这些东西都要造轮子（作者造或自己造）。没有引入 Webpack 是一个重大的硬伤。社区维护的成熟 Webpack 显然更稳定，轮子更多。

**维护**
wepy 也是社区维护的，是官方的？其实 wepy 的主要开发者只有作者一人，附上一个[contrubutors](https://github.com/Tencent/wepy/graphs/contributors)链接。另外被官方招安了也是后来的事，再说腾讯要有精力帮着一起维护好 wepy，为什么不花精力在小程序原生开发上呢？再来看看 mpvue，是美团一个前端小组维护的。

**学习成本**
Vue 的学习曲线比较平缓。mpvue 是 Vue的子集。所以 mpvue 的学习成本会低于 wepy。尤其是之前技术栈有学过用过 Vue 的。

**未来规划**
mpvue 已经支持 web 和小程序。因为 mpvue 基于AST，所以未来可以支持支付宝小程序和快应用。他们也是有这样的规划。

请在需求池下面自己找
![mpvue-feature](https://user-images.githubusercontent.com/2350193/44379522-f9a6a600-a538-11e8-8939-273ace7871ae.jpg)

**坑**
两者都有各自的坑。但是我觉得有一些wepy的坑是没法容忍的。比如[repeat组建里面用computed得到的列表全是同一套数据](https://github.com/Tencent/wepy/issues/1231)而且1.x是没法解决的。
wepy和mpvue我都开发过完整小程序的体验下，我觉得wepy的坑更多，而且wepy有些坑碍于架构设计没办法解决。

# mpvue
> Vue.js 小程序版, fork 自 vuejs/vue@2.4.1，保留了 vue runtime 能力，添加了小程序平台的支持。
> `mpvue` 是一个使用 `Vue.js` 开发小程序的前端框架。框架基于 `Vue.js` 核心，`mpvue` 修改了 `Vue.js` 的 runtime 和 compiler 实现，使其可以运行在小程序环境中，从而为小程序开发引入了整套 `Vue.js` 开发体验。


## 框架原理

**两个大方向**

- 通过`mpvue`提供 mp 的 runtime 适配小程序
- 通过`mpvue-loader`产出微信小程序所需要的文件结构和模块内容。

**七个具体问题**

要了解 mpvue 原理必然要了解 Vue 原理，这是大前提。但是要讲清楚 Vue 原理需要花费大量的篇幅，不如参考[learnVue](https://github.com/answershuto/learnVue)。

现在假设您对 Vue 原理有个大概的了解。

由于 Vue 使用了 Virtual DOM，所以 Virtual DOM 可以在任何支持 JavaScript 语言的平台上操作，譬如说目前 Vue 支持浏览器平台或 weex，也可以是 mp(小程序)。那么最后 Virtual DOM 如何映射到真实的 DOM 节点上呢？vue为平台做了一层适配层，浏览器平台见 [runtime/node-ops.js](https://github.com/Meituan-Dianping/mpvue/blob/master/src/platforms/web/runtime/node-ops.js)、weex平台见[runtime/node-ops.js](https://github.com/Meituan-Dianping/mpvue/blob/master/src/platforms/weex/runtime/node-ops.js)，小程序见[runtime/node-ops.js](https://github.com/Meituan-Dianping/mpvue/blob/master/src/platforms/mp/runtime/node-ops.js)。不同平台之间通过适配层对外提供相同的接口，Virtual DOM进行操作Real DOM节点的时候，只需要调用这些适配层的接口即可，而内部实现则不需要关心，它会根据平台的改变而改变。

所以思路肯定是往增加一个 mp 平台的 runtime 方向走。但问题是小程序不能操作 DOM，所以 mp 下的`node-ops.js` 里面的实现都是直接 `return obj`。

新 Virtual DOM 和旧 Virtual DOM 之间需要做一个 patch，找出 diff。patch完了之后的 diff 怎么更新视图，也就是如何给这些 DOM 加入 attr、class、style 等 DOM 属性呢？ Vue 中有 nextTick 的概念用以更新视图，mpvue这块对于小程序的 `setData` 应该怎么处理呢？

另外个问题在于小程序的 Virtual DOM 怎么生成？也就是怎么将 template 编译成`render function`。这当中还涉及到[运行时-编译器-vs-只包含运行时](https://cn.vuejs.org/v2/guide/installation.html#%E8%BF%90%E8%A1%8C%E6%97%B6-%E7%BC%96%E8%AF%91%E5%99%A8-vs-%E5%8F%AA%E5%8C%85%E5%90%AB%E8%BF%90%E8%A1%8C%E6%97%B6)，显然如果要提高性能、减少包大小、输出 wxml、mpvue 也要提供预编译的能力。因为要预输出 wxml 且没法动态改变 DOM，所以动态组件，自定义 render，和`<script type="text/x-template">` 字符串模版等都不支持([参考](http://mpvue.com/mpvue/#_15))。


另外还有一些其他问题，最后总结一下

- 1.如何预编译生成`render function`
- 2.如何预编译生成 wxml，wxss，wxs
- 3.如何 patch 出 diff
- 4.如何更新视图
- 5.如何建立小程序事件代理机制，在事件代理函数中触发与之对应的vue组件事件响应
- 6.如何建立vue实例与小程序 Page 实例关联
- 7.如何建立小程序和vue生命周期映射关系，能在小程序生命周期中触发vue生命周期


**[platform/mp的目录结构]((https://github.com/Meituan-Dianping/mpvue/tree/master/src/platforms/mp))**
```
.
├── compiler //解决问题1，mpvue-template-compiler源码部分
├── runtime //解决问题3 4 5 6 7
├── util //工具方法
├── entry-compiler.js //mpvue-template-compiler的入口。package.json相关命令会自动生成mpvue-template-compiler这个package。
├── entry-runtime.js //对外提供Vue对象，当然是mpvue
└── join-code-in-build.js //编译出SDK时的修复
```

**后面的内容逐步解答这几个问题，也就弄明白了原理**

### mpvue-loader
[mpvue-loader](https://github.com/mpvue/mpvue-loader) 是 [vue-loader](https://github.com/vuejs/vue-loader) 的一个扩展延伸版，类似于超集的关系，除了[vue-loader](https://github.com/vuejs/vue-loader) 本身所具备的能力之外，它还会利用[mpvue-template-compiler](https://github.com/Meituan-Dianping/mpvue/tree/master/packages/mpvue-template-compiler)生成`render function`。

* entry

它会从 `webpack` 的配置中的 entry 开始，分析依赖模块，并分别打包。在entry 中 app 属性及其内容会被打包为微信小程序所需要的 app.js／app.json／app.wxss，其余的会生成对应的页面page.js/page.json/page.wxml/page.wxss，如示例的 entry 将会生成如下这些文件，文件内容下文慢慢讲来：

``` js
// webpack.config.js
{
    // ...
    entry: {
        app: resolve('./src/main.js'),               // app 字段被识别为 app 类型
        index: resolve('./src/pages/index/main.js'),   // 其余字段被识别为 page 类型
        'news/home': resolve('./src/pages/news/home/index.js')
    }
}

// 产出文件的结构
.
├── app.js
├── app.json
├──· app.wxss
├── components
│   ├── card$74bfae61.wxml
│   ├── index$023eef02.wxml
│   └── news$0699930b.wxml
├── news
│   ├── home.js
│   ├── home.wxml
│   └── home.wxss
├── pages
│   └── index
│       ├── index.js
│       ├── index.wxml
│       └── index.wxss
└── static
    ├── css
    │   ├── app.wxss
    │   ├── index.wxss
    │   └── news
    │       └── home.wxss
    └── js
        ├── app.js
        ├── index.js
        ├── manifest.js
        ├── news
        │   └── home.js
        └── vendor.js
```

* wxml
  每一个 ```.vue``` 的组件都会被生成为一个 wxml 规范的 template，然后通过 wxml 规范的 import 语法来达到一个复用，同时组件如果涉及到 props 的 data 数据，我们也会做相应的处理，举个实际的例子：

```html
<template>
    <div class="my-component" @click="test">
        <h1>{{msg}}</h1>
        <other-component :msg="msg"></other-component>
    </div>
</template>
<script>
import otherComponent from './otherComponent.vue'

export default {
  components: { otherComponent },
  data () {
    return { msg: 'Hello Vue.js!' }
  },
  methods: {
    test() {}
  }
}
</script>
```

这样一个 Vue 的组件的模版部分会生成相应的 wxml

```html
<import src="components/other-component$hash.wxml" />
<template name="component$hash">
    <view class="my-component" bindtap="handleProxy">
        <view class="_h1">{{msg}}</view>
        <template is="other-component$hash" wx:if="{{ $c[0] }}" data="{{ ...$c[0] }}"></template>
    </view>
</template>
```

可能已经注意到了 other-component(:msg="msg") 被转化成了 <template is="other-component$hash" data="{{ ...$c[0] }}"></template> 。mpvue 在运行时会从根组件开始把所有的组件实例数据合并成一个树形的数据，然后通过 setData 到 appData,`$c `是 $children 的缩写。至于那个 0 则是我们的 compiler 处理过后的一个标记，会为每一个子组件打一个特定的不重复的标记。 树形数据结构如下：

```js
// 这儿数据结构是一个数组，index 是动态的
{
  $child: {
    '0'{
      // ... root data
      $child: {
        '0': {
          // ... data
          msg: 'Hello Vue.js!',
          $child: {
            // ...data
          }
        }
      }
    }
  }
}
```

* wxss

这个部分的处理同 web 的处理差异不大，唯一不同在于通过配置生成 .css 为 .wxss ，其中的对于 css 的若干处理，在 postcss-mpvue-wxss 和 px2rpx-loader 这两部分的文档中又详细的介绍。

app.json／page.json
1.1.1 以上

推荐和小程序一样，将 app.json／page.json 放到页面入口处，使用 copy-webpack-plugin copy 到对应的生成位置。

1.1.1 以下

这部分内容来源于 app 和 page 的 entry 文件，通常习惯是 main.js，你需要在你的入口文件中 export default { config: {} }，这才能被我们的 loader 识别为这是一个配置，需要写成 json 文件。

``` js
import Vue from 'vue';
import App from './app';

const vueApp = new Vue(App);
vueApp.$mount();

// 这个是我们约定的额外的配置
export default {
    // 这个字段下的数据会被填充到 app.json ／ page.json
    config: {
        pages: ['static/calendar/calendar', '^pages/list/list'], // Will be filled in webpack
        window: {
            backgroundTextStyle: 'light',
            navigationBarBackgroundColor: '#455A73',
            navigationBarTitleText: '美团汽车票',
            navigationBarTextStyle: '#fff'
        }
    }
};
```

同时，这个时候，我们会根据 entry 的页面数据，自动填充到 app.json 中的 pages 字段。 pages 字段也是可以自定义的，约定带有 ^ 符号开头的页面，会放到数组的最前面。

style scoped
在 vue-loader 中对 style scoped 的处理方式是给每个样式加一个 attr 来标记 module-id，然后在 css 中也给每条 rule 后添加 [module-id]，最终可以形成一个 css 的“作用域空间”。

在微信小程序中目前是不支持 attr 选择器的，所以我们做了一点改动，把 attr 上的 [module-id] 直接写到了 class 里，如下：

``` html
<!-- .vue -->
<template>
    <div class="container">
        // ...
    </div>
</template>
<style scoped>
    .container {
        color: red;
    }
</style>

<!-- vue-loader -->
<template>
    <div class="container" data-v-23e58823>
        // ...
    </div>
</template>
<style scoped>
    .container[data-v-23e58823] {
        color: red;
    }
</style>

<!-- mpvue-loader -->
<template>
    <div class="container data-v-23e58823">
        // ...
    </div>
</template>
<style scoped>
    .container.data-v-23e58823 {
        color: red;
    }
</style>
```

* compiler

生产出的内容是：

```js
(function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// mpvue-template-compiler会利用AST预编译生成一个render function用以生成Virtual DOM。
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  // _c创建虚拟节点，参考https://github.com/Meituan-Dianping/mpvue/blob/master/packages/mpvue/index.js#L3606
  // 以及https://github.com/Meituan-Dianping/mpvue/blob/master/packages/mpvue/index.js#L3680
  return _c('div', {
    staticClass: "my-component"
  }, [_c('h1', [_vm._v(_vm._s(_vm.msg))]), _vm._v(" "), _c('other-component', {
    attrs: {
      "msg": _vm.msg,
      "mpcomid": '0'
    }
  })], 1)
}

// staticRenderFns的作用是静态渲染，在更新时不会进行patch，优化性能。而staticRenderFns是个空数组。
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-54ad9125", esExports)
  }
}

/***/ })
```

### compiler
compiler相关，也就是template预编译这块，可以参考《[聊聊Vue的template编译](https://github.com/answershuto/learnVue/blob/master/docs/%E8%81%8A%E8%81%8AVue%E7%9A%84template%E7%BC%96%E8%AF%91.MarkDown#createcompiler)》来搞明白。原理是一样的。

mpvue自己实现了`export { compile, compileToFunctions, compileToWxml }`([链接](https://github.com/Meituan-Dianping/mpvue/blob/master/src/platforms/mp/compiler/index.js))其中`compileToWxml`是用来生成wxml，具体代码[在这](https://github.com/mpvue/mpvue-loader/blob/master/lib/mp-compiler/index.js#L30)。

另外mpvue是不需要提供[运行时-编译器](https://cn.vuejs.org/v2/guide/installation.html#%E8%BF%90%E8%A1%8C%E6%97%B6-%E7%BC%96%E8%AF%91%E5%99%A8-vs-%E5%8F%AA%E5%8C%85%E5%90%AB%E8%BF%90%E8%A1%8C%E6%97%B6)的，虽然理论上是能够做到的。因为小程序不能操作DOM，即便提供了运行时-编译器也产生不了界面。

详细讲解compile过程：

1.将vue文件解析成模板对象

```js
// mpvue-loader/lib/loader.js
var parts = parse(content, fileName, this.sourceMap)
```

假如vue文件源码如下:

```js
<template>
  <view class="container-bg">
    <view class="home-container">
      <home-quotation-view v-for="(item, index) in lists" :key="index" :reason="item.reason" :stockList="item.list" @itemViewClicked="itemViewClicked" />
    </view>
  </view>
</template>

<script lang="js">
import homeQuotationView from '@/components/homeQuotationView'
import topListApi from '@/api/topListApi'

export default {
  data () {
    return {
      lists: []
    }
  },
  components: {
    homeQuotationView
  },
  methods: {
    async loadRankList () {
      let {data} = await topListApi.rankList()
      if (data) {
        this.dateTime = data.dt
        this.lists = data.rankList.filter((item) => {
          return !!item
        })
      }
    },
    itemViewClicked (quotationItem) {
      wx.navigateTo({
        url: `/pages/topListDetail/main?item=${JSON.stringify(quotationItem)}`
      })
    }
  },
  onShow () {
    this.loadRankList()
  }
}
</script>

<style lang="stylus" scoped>
  .container-bg
    width 100%
    height 100%
    background-color #F2F4FA

  .home-container
    width 100%
    height 100%
    overflow-x hidden

</style>
```

调用`parse(content, fileName, this.sourceMap)` 函数得到的结果大致如下：

```js
{
  template: {
    type: 'template',
    content: '\n<view class="container-bg">\n  <view class="home-container">\n    <home-quotation-view v-for="(item, index) in lists" :key="index" :reason="item.reason" :stockList="item.list" @itemViewClicked="itemViewClicked" />\n  </view>\n</view>\n',
    start: 10,
    attrs: {},
    end: 251
  },
  script: {
    type: 'script',
    content: '\n\n\n\n\n\n\n\n\nimport homeQuotationView from \'@/components/homeQuotationView\'\nimport topListApi from \'@/api/topListApi\'\n\nexport default {\n  data () {\n    return {\n      lists: []\n    }\n  },\n  components: {\n    homeQuotationView\n  },\n  methods: {\n    async loadRankList () {\n      let {data} = await topListApi.rankList()\n      if (data) {\n        this.dateTime = data.dt\n        this.lists = data.rankList.filter((item) => {\n          return !!item\n        })\n      }\n    },\n    itemViewClicked (quotationItem) {\n      wx.navigateTo({\n        url: `/pages/topListDetail/main?item=${JSON.stringify(quotationItem)}`\n      })\n    }\n  },\n  onShow () {\n    this.loadRankList()\n  }\n}\n',
    start: 282,
    attrs: {
      lang: 'js'
    },
    lang: 'js',
    end: 946,
    ...
  },
  styles: [{
    type: 'style',
    content: '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.container-bg\n  width 100%\n  height 100%\n  background-color #F2F4FA\n\n.home-container\n  width 100%\n  height 100%\n  overflow-x hidden\n\n',
    start: 985,
    attrs: [Object],
    lang: 'stylus',
    scoped: true,
    end: 1135,
    ...
  }],
  customBlocks: []
}
```

2.调用mpvue-loader/lib/template-compiler/index.js导出的接口并传入上面得到的html模板：

```js
var templateCompilerPath = normalize.lib('template-compiler/index')
...
var defaultLoaders = {
  html: templateCompilerPath + templateCompilerOptions,
  css: options.extractCSS
    ? getCSSExtractLoader()
    : styleLoaderPath + '!' + 'css-loader' + cssLoaderOptions,
  js: hasBuble ? ('buble-loader' + bubleOptions) : hasBabel ? babelLoaderOptions : ''
}

// check if there are custom loaders specified via
// webpack config, otherwise use defaults
var loaders = Object.assign({}, defaultLoaders, options.loaders)
```

3. 调用mpvue/packages/mpvue-template-compiler/build.js的compile接口：

```js
// mpvue-loader/lib/template-compiler/index.js
var compiled = compile(html, compilerOptions)
```

compile方法生产下面的ast(Abstract Syntax Tree)模板，render函数和staticRenderFns

```js
{
  ast: {
    type: 1,
    tag: 'view',
    attrsList: [],
    attrsMap: {
      class: 'container-bg'
    },
    parent: undefined,
    children: [{
      type: 1,
      tag: 'view',
      attrsList: [],
      attrsMap: {
        class: 'home-container'
      },
      parent: {
        type: 1,
        tag: 'view',
        attrsList: [],
        attrsMap: {
          class: 'container-bg'
        },
        parent: undefined,
        children: [
          [Circular]
        ],
        plain: false,
        staticClass: '"container-bg"',
        static: false,
        staticRoot: false
      },
      children: [{
        type: 1,
        tag: 'home-quotation-view',
        attrsList: [{
          name: ':reason',
          value: 'item.reason'
        }, {
          name: ':stockList',
          value: 'item.list'
        }, {
          name: '@itemViewClicked',
          value: 'itemViewClicked'
        }],
        attrsMap: {
          'v-for': '(item, index) in lists',
          ':key': 'index',
          ':reason': 'item.reason',
          ':stockList': 'item.list',
          '@itemViewClicked': 'itemViewClicked',
          'data-eventid': '{{\'0-\'+index}}',
          'data-comkey': '{{$k}}'
        },
        parent: [Circular],
        children: [],
        for: 'lists',
        alias: 'item',
        iterator1: 'index',
        key: 'index',
        plain: false,
        hasBindings: true,
        attrs: [{
          name: 'reason',
          value: 'item.reason'
        }, {
          name: 'stockList',
          value: 'item.list'
        }, {
          name: 'eventid',
          value: '\'0-\'+index'
        }, {
          name: 'mpcomid',
          value: '\'0-\'+index'
        }],
        events: {
          itemViewClicked: {
            value: 'itemViewClicked',
            modifiers: undefined
          }
        },
        eventid: '\'0-\'+index',
        mpcomid: '\'0-\'+index',
        static: false,
        staticRoot: false,
        forProcessed: true
      }],
      plain: false,
      staticClass: '"home-container"',
      static: false,
      staticRoot: false
    }],
    plain: false,
    staticClass: '"container-bg"',
    static: false,
    staticRoot: false
  },
  render: 'with(this){return _c(\'view\',{staticClass:"container-bg"},[_c(\'view\',{staticClass:"home-container"},_l((lists),function(item,index){return _c(\'home-quotation-view\',{key:index,attrs:{"reason":item.reason,"stockList":item.list,"eventid":\'0-\'+index,"mpcomid":\'0-\'+index},on:{"itemViewClicked":itemViewClicked}})}))])}',
  staticRenderFns: [],
  errors: [],
  tips: []
}
```

其中的render函数运行的结果是返回``VNode``对象，其实``render``函数应该长下面这样：

```js
(function() {
  with(this){
    return _c('div',{   //创建一个 div 元素
      attrs:{"id":"app"}  //div 添加属性 id
      },[
        _m(0),  //静态节点 header，此处对应 staticRenderFns 数组索引为 0 的 render 函数
        _v(" "), //空的文本节点
        (message) //三元表达式，判断 message 是否存在
         //如果存在，创建 p 元素，元素里面有文本，值为 toString(message)
        ?_c('p',[_v("\n    "+_s(message)+"\n  ")])
        //如果不存在，创建 p 元素，元素里面有文本，值为 No message. 
        :_c('p',[_v("\n    No message.\n  ")])
      ]
    )
  }
})
```

其中的``_c``就是vue对象的``createElement``方法 (创建元素)，``_m``是``renderStatic``（渲染静态节点），``_v`` 是 
``createTextVNode``（创建文本dom），``_s`` 是 ``toString`` （转换为字符串）

```js
// src/core/instance/render.js
export function initRender (vm: Component) {
  ...
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  // normalization is always applied for the public version, used in
  // user-written render functions.
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
  ...
}

...
Vue.prototype._s = toString
...
Vue.prototype._m = renderStatic
...
Vue.prototype._v = createTextVNode
...
```

4. 调用compileWxml方法生产wxml模板，这个方法最终会调用 mpvue/packages/mpvue-template-compiler/build.js的compileToWxml方法将第一步compile出来的模板转成小程序的wxml模板

```js
// mpvue-loader/lib/template-compiler/index.js
compileToWxml.call(this, compiled, html)
```

**以上解答了问题1、2**

### runtime
[目录结构]((https://github.com/Meituan-Dianping/mpvue/tree/master/src/platforms/mp/runtime))

```
.
├── events.js //解答问题5
├── index.js //入口提供Vue对象，以及$mount，和各种初始化
├── liefcycle //解答问题6、7
├── node-ops.js //操作真实DOM的相关实现，因为小程序不能操作DOM，所以这里都是直接返回
├── patch.js //解答问题3
└── render.js //解答问题4
```

**[patch.js](https://github.com/Meituan-Dianping/mpvue/blob/master/src/platforms/mp/runtime/patch.js)**

和vue使用的`createPatchFunction`保持一致，任然是旧树和新树进行patch产出diff，但是多了一行this.$updateDataToMP()用以更新。

**[render.js](https://github.com/Meituan-Dianping/mpvue/blob/master/src/platforms/mp/runtime/render.js)**

两个核心的方法`initDataToMP`、`updateDataToMP`。

`initDataToMP`收集vm上的data，然后调用小程序Page示例的`setData`渲染。

`updateDataToMP`在每次patch，也就是依赖收集发现数据改变时更新(参考patch.js代码)，这部分一样会使用`nextTick`和队列。最终使用了节流阀`throttleSetData`。50毫秒用来控制频率以解决频繁修改Data，会造成大量传输Data数据而导致的性能问题。

其中`collectVmData`最终也是用到了`formatVmData`。尤其要注意的是一句注释：

> getVmData 这儿获取当前组件内的所有数据，包含 props、computed 的数据

我们又知道，service到view是两个线程间通信，如果Data含有大量数据，增加了传输数据量，加大了传输成本，将会造成性能下降。

**[events.js](https://github.com/Meituan-Dianping/mpvue/blob/master/src/platforms/mp/runtime/events.js)**

正如官网所说的，这里使用`eventTypeMap`做了各[事件的隐射](http://mpvue.com/mpvue/#_13)
```js
import { getComKey, eventTypeMap } from '../util/index'
```

```js
// 用于小程序的 event type 到 web 的 event
export const eventTypeMap = {
  tap: ['tap', 'click'],
  touchstart: ['touchstart'],
  touchmove: ['touchmove'],
  touchcancel: ['touchcancel'],
  touchend: ['touchend'],
  longtap: ['longtap'],
  input: ['input'],
  blur: ['change', 'blur'],
  submit: ['submit'],
  focus: ['focus'],
  scrolltoupper: ['scrolltoupper'],
  scrolltolower: ['scrolltolower'],
  scroll: ['scroll']
}
```

使用了`handleProxyWithVue`方法来代理小程序事件到vue事件。

另外看下作者自己对这部分的[思路](https://tech.meituan.com/mt_mpvue_development_framework.html)

> **事件代理机制**：用户交互触发的数据更新通过事件代理机制完成。在 Vue.js 代码中，事件响应函数对应到组件的 method， Vue.js 自动维护了上下文环境。然而在小程序中并没有类似的机制，又因为 Vue.js 执行环境中维护着一份实时的虚拟 DOM，这与小程序的视图层完全对应，我们思考，在小程序组件节点上触发事件后，只要找到虚拟 DOM 上对应的节点，触发对应的事件不就完成了么；另一方面，Vue.js 事件响应如果触发了数据更新，其生命周期函数更新将自动触发，在此函数上同步更新小程序数据，数据同步也就实现了。

`getHandle`这个方法应该就是作者思路当中所说的：找到对应节点，然后找到handle。

**[lifecycle.js](https://github.com/Meituan-Dianping/mpvue/blob/master/src/platforms/mp/runtime/lifecycle.js)**

在`initMP`方法中，自己创建小程序的App、Page。实现生命周期相关方法，使用`callHook`代理兼容小程序App、Page的生命周期。

[官方文档生命周期](http://mpvue.com/mpvue/#_4)中说到了：

> 同 vue，不同的是我们会在小程序 onReady 后，再去触发 vue mounted 生命周期

这部分查看，`onReady`之后才会执行`next`，这个`next`回调最终是vue的`mountComponent`。可以在[index.js](https://github.com/Meituan-Dianping/mpvue/blob/master/src/platforms/mp/runtime/index.js#L37)中看到。这部分代码也就是解决了"小程序生命周期中触发vue生命周期"。

```js
export function initMP (mpType, next) {
  // ...
    global.Page({
      // 生命周期函数--监听页面初次渲染完成
      onReady () {
        mp.status = 'ready'

        callHook(rootVueVM, 'onReady')
        next()
      },
    })
  // ...
}
```

在小程序onShow时，使用$nextTick去第一次渲染数据，参考上面提到的render.js。

```js
export function initMP (mpType, next) {
  // ...
  global.Page({
    // 生命周期函数--监听页面显示
    onShow () {
      mp.page = this
      mp.status = 'show'
      callHook(rootVueVM, 'onShow')

      // 只有页面需要 setData
      rootVueVM.$nextTick(() => {
        rootVueVM._initDataToMP()
      })
    },
  })
  // ...
}
```

在mpvue-loader生成template时，比如点击事件`@click`会变成`bindtap="handleProxy"`，事件绑定全都会使用`handleProxy`这个方法。

可以查看上面[mpvue-loader](#mpvue-loader)回顾一下。

最终handleProxy调用的是event.js中的`handleProxyWithVue`。

```js
export function initMP (mpType, next) {
  // ...
    global.Page({
      handleProxy (e) {
        return rootVueVM.$handleProxyWithVue(e)
      },
    })
  // ...
}
```

**[index.js](https://github.com/Meituan-Dianping/mpvue/blob/master/src/platforms/mp/runtime/index.js)**

最后index.js就负责各种初始化和mount。

## Class和Style为什么暂不支持组件
原因：目前的组件是使用小程序的 template 标签实现的，给组件指定的class和style是挂载在template标签上，而template 标签不支持 class 及 style 属性。

解决方案： 在自定义组件上绑定class或style到一个props属性上。

```html
 // 组件ComponentA.vue
 <template>
  <div class="container" :class="pClass">
    ...
  </div>
</template>
```
```js
<script>
    export default {
    props: {
      pClass: {
        type: String,
        default: ''
      }
    }
  }
</script>
```

```html
<!--PageB.vue-->
<template>
    <component-a :pClass="cusComponentAClass"  />
</template>
```
```js
<script>
data () {
    return {
      cusComponentAClass: 'a-class b-class'
    }
  }
</script>
```
```css
<style lang="stylus" scoped>
  .a-class
    border red solid 2rpx
  .b-class
    margin-right 20rpx
</style>
```
 但是这样会有问题就是style加上scoped之后，编译模板生成的代码是下面这样的：

```css
 .a-class.data-v-8f1d914e {
   border: #f00 solid 2rpx;
 }
 .b-class.data-v-8f1d914e {
   margin-right 20rpx
 }
```
 所以想要这些组件的class生效就不能使用scoped的style，改成下面这样，最好自己给a-class和b-class加前缀以防其他的文件引用这些样式：

```css
 <style lang="stylus">
  .a-class
    border red solid 2rpx
  .b-class
    margin-right 20rpx
</style>

<style lang="stylus" scoped>
  .other-class
    border red solid 2rpx
    
   ...
</style>
```
- 在定义组件上绑定style属性到一个props属性上：

```html
 <!--P组件ComponentA.vue-->
 <template>
  <div class="container" :style="pStyle">
    ...
  </div>
</template>
```
```js
<script>
  export default {
    props: {
      pStyle: {
        type: String,
        default: ''
      }
    }
  }
</script>
```

```html
<!--PageB.vue-->
<template>
    <component-a :pStyle="cusComponentAStyle"  />
</template>
```
```js
<script>
const cusComponentAStyle = 'border:red solid 2rpx; margin-right:20rpx;'
data () {
    return {
      cusComponentAStyle
    }
  }
</script>
```

```css
<style lang="stylus" scoped>
  ...
</style>
```

也可以通过定义styleObject，然后通过工具函数转化为styleString，如下所示：

```js
const bstyle = {
  border: 'red solid 2rpx',
  'margin-right': '20rpx'
}
let arr = []
for (let [key, value] of Object.entries(bstyle)) {
  arr.push(`${key}: ${value}`)
}

const cusComponentAStyle = arr.join('; ')
```

- 当然自定义组件确定只会改变某个css样式，通过pros传入单个样式的值，然后通过:style绑定肯定没问题：

```html
<!--组件ComponentA.vue-->
 <template>
  <div class="container" :style="{'background-color': backgroundColor}">
    ...
  </div>
</template>
```
```js
<script>
    export default {
    props: {
      backgroundColor: {
        type: String,
        default: 'yellow'
      }
    }
  }
</script>
```

```html
<!-- PageB.vue -->
<template>
    <component-a backgroundColor="red"  />
</template>
```

## 分包加载

package.json修改
* 升级： "mpvue-loader": "\^1.1.2-rc.4" "webpack-mpvue-asset-plugin": "\^0.1.1"
* 新增： "relative": "\^3.0.2"

注意事项
* 1.1.2-rc.5 修复 slot 文件路径生成错误的问题
* 1.1.x 版本还不是很稳定，对稳定性要求较高的项目建议暂时使用 1.0.x 版本

移动src/main.js中config相关内容到同级目录下main.json(新建)中

```js
export default {
  // config: {...} 需要移动
}

```

to

```js
{
 "pages": [
   "pages/index/main",
   "pages/logs/main"
  ],
  "subPackages": [
    {
      "root": "pages/packageA",
     "pages": [
       "counter/main"
     ]
   }
 ],
 "window": {...}
}
```

**webpack 配置配合升级指南**

* 本次升级意在调整生成文件目录结构，对依赖的文件由原来的写死绝对路径该改为相对路径
* mpvue-loader@1.1.2-rc.4 依赖 webpack-mpvue-asset-plugin@0.1.0 做依赖资源引用
* 之前写在 main.js 中的 config 信息，需要在 main.js 同级目录下新建 main.json 文件，使用 webapck-copy-plugin copy 到 build 目录下
* app.json 中引用的图片不会自动 copy 到 dist 目录下
  json 配置文件是由 webapck-copy-plugin copy 过去的，不会处理依赖，可以将图片放到根目录下 static 目录下，使用 webapck-copy-plugin copy 过去

build/webpack.base.conf.js

```js
+var CopyWebpackPlugin = require('copy-webpack-plugin')
+var relative = require('relative')

 function resolve (dir) {
   return path.join(__dirname, '..', dir)
 }

-function getEntry (rootSrc, pattern) {
-  var files = glob.sync(path.resolve(rootSrc, pattern))
-  return files.reduce((res, file) => {
-    var info = path.parse(file)
-    var key = info.dir.slice(rootSrc.length + 1) + '/' + info.name
-    res[key] = path.resolve(file)
-    return res
-  }, {})
+function getEntry (rootSrc) {
+  var map = {};
+  glob.sync(rootSrc + '/pages/**/main.js')
+  .forEach(file => {
+    var key = relative(rootSrc, file).replace('.js', '');
+    map[key] = file;
+  })
+   return map;
 }

   plugins: [
-    new MpvuePlugin()
+    new MpvuePlugin(),
+    new CopyWebpackPlugin([{
+      from: '**/*.json',
+      to: 'app.json'
+    }], {
+      context: 'src/'
+    }),
+    new CopyWebpackPlugin([ // 处理 main.json 里面引用的图片，不要放代码中引用的图片
+      {
+        from: path.resolve(__dirname, '../static'),
+        to: path.resolve(__dirname, '../dist/static'),
+        ignore: ['.*']
+      }
+    ])
   ]
 }
```
build/webpack.dev.conf.js

```js
module.exports = merge(baseWebpackConfig, {
   devtool: '#source-map',
   output: {
     path: config.build.assetsRoot,
-    filename: utils.assetsPath('js/[name].js'),
-    chunkFilename: utils.assetsPath('js/[id].js')
+    filename: utils.assetsPath('[name].js'),
+    chunkFilename: utils.assetsPath('[id].js')
   },
   plugins: [
     new webpack.DefinePlugin({
    module.exports = merge(baseWebpackConfig, {
     // copy from ./webpack.prod.conf.js
     // extract css into its own file
     new ExtractTextPlugin({
-      filename: utils.assetsPath('css/[name].wxss')
+      filename: utils.assetsPath('[name].wxss')
     }),
    module.exports = merge(baseWebpackConfig, {
       }
     }),
     new webpack.optimize.CommonsChunkPlugin({
-      name: 'vendor',
+      name: 'common/vendor',
       minChunks: function (module, count) {
         // any required modules inside node_modules are extracted to vendor
         return (
        module.exports = merge(baseWebpackConfig, {
       }
     }),
     new webpack.optimize.CommonsChunkPlugin({
-      name: 'manifest',
-      chunks: ['vendor']
+      name: 'common/manifest',
+      chunks: ['common/vendor']
     }),
-    // copy custom static assets
-    new CopyWebpackPlugin([
-      {
-        from: path.resolve(__dirname, '../static'),
-        to: config.build.assetsSubDirectory,
-        ignore: ['.*']
-      }
-    ]),

```

build/webpack.prod.conf.js

```js

    var webpackConfig = merge(baseWebpackConfig, {
   devtool: config.build.productionSourceMap ? '#source-map' : false,
   output: {
     path: config.build.assetsRoot,
-    filename: utils.assetsPath('js/[name].js'),
-    chunkFilename: utils.assetsPath('js/[id].js')
+    filename: utils.assetsPath('[name].js'),
+    chunkFilename: utils.assetsPath('[id].js')
   },
   plugins: [
    var webpackConfig = merge(baseWebpackConfig, {
     }),
     // extract css into its own file
     new ExtractTextPlugin({
-      // filename: utils.assetsPath('css/[name].[contenthash].css')
-      filename: utils.assetsPath('css/[name].wxss')
+      // filename: utils.assetsPath('[name].[contenthash].css')
+      filename: utils.assetsPath('[name].wxss')
     }),
     // Compress extracted CSS. We are using this plugin so that possible
     // duplicated CSS from different components can be deduped.
    var webpackConfig = merge(baseWebpackConfig, {
     new webpack.HashedModuleIdsPlugin(),
     // split vendor js into its own file
     new webpack.optimize.CommonsChunkPlugin({
-      name: 'vendor',
+      name: 'common/vendor',
       minChunks: function (module, count) {
         // any required modules inside node_modules are extracted to vendor
         return (
     var webpackConfig = merge(baseWebpackConfig, {
     // extract webpack runtime and module manifest to its own file in order to
     // prevent vendor hash from being updated whenever app bundle is updated
     new webpack.optimize.CommonsChunkPlugin({
-      name: 'manifest',
-      chunks: ['vendor']
-    }),
+      name: 'common/manifest',
+      chunks: ['common/vendor']
+    })
-    // copy custom static assets
-    new CopyWebpackPlugin([
-      {
-        from: path.resolve(__dirname, '../static'),
-        to: config.build.assetsSubDirectory,
-        ignore: ['.*']
-      }
-    ])
   ]
 })
```

config/index.js

```js

module.exports = {
     env: require('./prod.env'),
     index: path.resolve(__dirname, '../dist/index.html'),
     assetsRoot: path.resolve(__dirname, '../dist'),
-    assetsSubDirectory: 'static', // 不将资源聚合放在 static 目录下
+    assetsSubDirectory: '',
     assetsPublicPath: '/',
     productionSourceMap: false,
     // Gzip off by default as many popular static hosts such as
@@ -26,7 +26,7 @@ module.exports = {
     port: 8080,
     // 在小程序开发者工具中不需要自动打开浏览器
     autoOpenBrowser: false,
-    assetsSubDirectory: 'static', // 不将资源聚合放在 static 目录下
+    assetsSubDirectory: '',
     assetsPublicPath: '/',
     proxyTable: {},
     // CSS Sourcemaps off by default because relative paths are "buggy"

```

## 问题与展望
技术的更新迭代是很快的，很多内容在写的时候还是这样。过了几天就发生了变化。又仔细看了小程序的文档，发现小程序原生开发深受vue影响啊，越来越像了。

希望mpvue能够使用`wx.nextTick`[链接](https://developers.weixin.qq.com/miniprogram/dev/api/custom-component.html#wxnexttickfunction)，尝试来代替50毫秒

希望能够解决[使用脏检查优化每次更新数据时都会传输大量数据的问题, 解决删除回退, 列表忽然滚动到顶部等问题](https://github.com/Meituan-Dianping/mpvue/issues/639)。也许可以靠下面的自定义组件。

使用[自定义组件](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/)代替template，这样可以解决诸如:

- [组件根标签不能使用style和class](http://mpvue.com/mpvue/#_10)
- [slot的各种问题](https://github.com/Meituan-Dianping/mpvue/issues?utf8=%E2%9C%93&q=slot)
- [Slot（scoped 暂时还没做支持）](http://mpvue.com/mpvue/#vue_1)
- setData的性能提升，因为官方说的:"在需要频繁更新的场景下，自定义组件的更新只在组件内部进行，不受页面其他部分内容复杂性影响。"。也就是说，组件内部的setData只会影响组件范围。这个和Vue就很像了，我觉得原理肯定是一致的。

在小程序完善了自定义组件之后，我现在的倾向变成了自搭或者网上找脚手架来工程化项目，使用诸如：NPM、PostCSS、pug、babel、ESLint、图片优化等功能。然后使用小程序原生开发的方式来开发，因为它做的越来越好，越来越像vue了。


# 小程序-学习

经常看到一些同学在查找小程序的学习资料和面对一些问题时无从下手。这一节笔者会基于自己的经验告诉大家如何学习开发小程序和如何解决遇到的问题。

## 学习建议


1. **文档一定要通读**，**文档一定要通读**，**文档一定要通读**。如果你想轻松的实现各种功能，先不要去搜网上的各种二手资料，请一定要熟读文档。不是为了记下来，而是有个大概印象，知道小程序有哪些能力和限制。下面笔者列出一些文档和社区里很优质的内容（首页的就不列了），虽然在很显眼的位置，但是很多人没看过🤦。(个人感觉，平时很多开发者问的问题，百分之九十都在文档里有答案)

    - [小程序-小故事](https://developers.weixin.qq.com/community/develop/list/512) 可以了解小程序的发展和对一些功能的权衡取舍过程
    - [小程序基础教程](https://developers.weixin.qq.com/community/develop/list/4) 非常好和全面的教程，墙裂推荐
    - [官方公告](https://developers.weixin.qq.com/community/develop/list/2)  小程序仍然在快速迭代当中，了解官方的动态对于开发者非常有必要
    - [小程序已知问题和修复日志](https://developers.weixin.qq.com/community/develop/buglist) 躲坑指南
    - [运营规范&常见拒绝情形](https://developers.weixin.qq.com/miniprogram/product/)  小程序宪法
    - [需要授权的操作](https://developers.weixin.qq.com/miniprogram/dev/api/authorize-index.html) 授权是有可能流失用户的，要多注意
    - [微信公众平台技术文档](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140183) 涉及到和公众号交互等内容可能会用到
    - [微信开放平台技术文档](https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&id=1417674108&token=&lang=zh_CN) 涉及和App交互等内容可能会用到

2. 利用好微信提供的各种辅助工具和能力

    - [小程序开发助手](https://developers.weixin.qq.com/miniprogram/dev/devtools/mydev.html) 方便查看开发版，体验版，线上版
    - [小程序示例](https://developers.weixin.qq.com/miniprogram/dev/demo.html) 直观的了解小程序的各种能力，新手可以当做demo跑一下
    - [小程序数据助手](https://developers.weixin.qq.com/miniprogram/analysis/assistant/) 查看小程序pv，uv，方便了解自己的工作成果
    - 利用好小程序提供的[调试能力](https://developers.weixin.qq.com/miniprogram/dev/devtools/debug.html) 现在小程序已经有了真机调试，各种特殊场景的测试(扫码，支付)，已经非常全面。

3. 看完文档直接上手开发，多动手喽，干就完了!

建议的进阶路线: 

    1. 熟读文档 
    2. 可开发一些小功能，熟悉开发流程
    3. 尝试开发一些复杂的任务(例如设计一个绘图库，埋点库) 
    4. 可以翻阅一下业界优秀的小程序源码(办法自己想🤔)，框架源码
    5. 将微信开发者根据拖入你的ide翻一翻底层代码,思考和理解小程序的设计
    6. 成为老司机



## 如何解决遇到的问题

由于小程序本身的技术架构，开发技能和web技术共性很多，我们之前在web开发中的很多开发经验也是有效的，大多数问题也是很好解决的(看文档)。常见的一些问题：

1. 兼容性问题

    一般遇到设备兼容性问题，从以下几个角度思考:

    1. 不通的微信版本的[小程序基础库](https://developers.weixin.qq.com/miniprogram/dev/framework/client-lib.html)是不一样的，很多 `API` 是有基础库的要求。
    2. 样式写法问题，小程序提供了rpx单位让样式开发更简单，但如果单位混用的话可能会导致意想不到的效果。
    3. css兼容性问题 例如ios7，8对 `flex布局` 支持的不够好。
    4. 设备兼容问题，例如ios不支持 `webp` 图片格式。

2. 代码逻辑问题

   对于平常的业务逻辑来说一般都是跟小程序的[生命周期](https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/page.html)挂钩，如果业务逻辑复杂，代码组织能力不够，很容易将代码写的很乱，这样出现问题的风险自然也会很高。
   所以建议在开发复杂业务逻辑时，一定要先借助流程图，思维脑图等方式分析清楚业务，然后再规划代码逻辑，拆分出逻辑主次再开发。
   遇到问题时，推荐如下方法:
   1. `debugger` 大法，在出现问题的地方打上断点，一步步查看上下文中的变量异常
   2. `二分删代码大法` 遇到极其诡异（注意是极其诡异）的问题时，二分删代码直到问题消失，定位到问题代码(悄悄告诉你们，笔者用这个方法帮同事定位到好几个诡异的问题)

3. 性能问题

   官方提供的[性能优化工具，和文档](https://developers.weixin.qq.com/miniprogram/dev/framework/performance/)为第一资料，毕竟他们自己写的坑，自己最清楚。另外上面已经介绍过一些性能优化的方法了，参照业务场景对症下药即可。    

4. 各种奇怪的问题

   事实上，90%的问题还是不看文档导致的，所以你们懂得。另外一些问题参考上述也可以定位到，如果还有不能解决的问题怎么办？
   那可能是微信的`bug`，所以去已知问题文档，官方社区翻一翻，一般都有蛛丝马迹。实在不行也可以向老司机提问，注意提问姿势，最好提供最小可复现demo，代码片段功能了解一下

## 总结

祝大家开发愉快!

# 参考链接

以上内容部分来自：
- [微信小程序架构分析 (上)](https://zhuanlan.zhihu.com/p/22754296)
- [微信小程序架构解析](https://zhuanlan.zhihu.com/p/25105936)
- [2018微信公开课第七季上海站·小程序专场](http://daxue.qq.com/content/online/id/4107)
- [小程序中使用iconfont](https://juejin.im/entry/5a54b73b6fb9a01ca7135335)
- [微信小程序的下一步：支持NPM、小程序云、可视化编程、支持分包](http://www.infoq.com/cn/news/2018/07/wchat-miniprog-support)
- [mpvue-docs](http://mpvue.com/build/mpvue-loader/)
- [使用Mpvue开发微信小程序的最佳实践](https://juejin.im/post/5afd836251882567105ff8b4)
- [用Vue.js开发微信小程序：开源框架mpvue解析](https://tech.meituan.com/mt_mpvue_development_framework.html)
- [learnVue](https://github.com/answershuto/learnVue)
