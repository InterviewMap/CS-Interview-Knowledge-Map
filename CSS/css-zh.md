<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [!important](#important)
- [单位](#%E5%8D%95%E4%BD%8D)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# BFC

# 居中的几种方式

# 盒模型

# 清除浮动的几种方式

# !important

`!important` 提供了增加权重的方式，一旦为某条样式使用，那么基本上他的权重就是最高的了。

当然凡事都是有例外的

```css
div {
  width: 200px !important;
  height: 100px;
  background-color: red;
  max-width: 100px;
}
```

当你如上设置时，会发现加了 `!important`  的 ` width` 还是被 `max-width` 覆盖了，宽度变为了 100 。

如果你又设置了 `min-width` ，并且值比 `max-width` 大，那么你又会发现前者覆盖了后者。

# 单位

- px：这是一个相对单位，在 PC 中往往对应着一个物理像素，当你缩放页面的时候，会发现元素也会相应的缩放。在移动端中，因为视网膜屏的存在，px 得乘上 `devicePixelRatio` 才能得到对应的物理像素。
- em：相对于自身的 `font-size` 大小
- rem：相对于根元素的 `font-size` 大小
- vw：相对于 viewport 的宽度
- vh：相对于 viewport 的高度