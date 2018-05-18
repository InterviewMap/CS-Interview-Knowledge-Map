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

