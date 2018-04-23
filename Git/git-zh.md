本文不会介绍 Git 的基本操作，会对一些高级操作进行说明。

#### Rebase 合并

该命令可以让和 `merge` 命令得到的结果基本是一致的。

通常使用 `merge` 操作将分支上的代码合并到 `master` 中，分支样子如下所示

![](https://user-gold-cdn.xitu.io/2018/4/23/162f109db27be054?w=505&h=461&f=png&s=22796)

使用 `rebase` 后，会将 `develop` 上的 `commit` 按顺序移到 `master` 的第三个 `commit` 后面，分支样子如下所示

![](https://user-gold-cdn.xitu.io/2018/4/23/162f11cc2cb8b332?w=505&h=563&f=png&s=26514)

Rebase 对比 merge，优势在于合并后的结果很清晰，只有一条线，劣势在于如果一旦出现冲突，解决冲突很麻烦，可能要解决多个冲突，但是 merge 出现冲突只需要解决一次。

使用 rebase 应该在需要被 rebase 的分支上操作，并且该分支是本地分支。如果 `develop` 分支需要 rebase 到 `master` 上去，那么应该如下操作

```shell
## branch develop
git rebase master
get checkout master
## 用于将 `master` 上的 HEAD 移动到最新的 commit
get merge develop
```

