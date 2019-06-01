<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Rebase 合并](#rebase-%E5%90%88%E5%B9%B6)
- [stash](#stash)
- [reflog](#reflog)
- [Reset](#reset)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

本文不会介绍 Git 的基本操作，会对一些高级操作进行说明。

## Rebase 合并

该命令可以让和 `merge` 命令得到的结果基本是一致的。

通常使用 `merge` 操作将分支上的代码合并到 `master` 中，分支样子如下所示

![](https://yck-1254263422.cos.ap-shanghai.myqcloud.com/blog/2019-06-01-043128.png)

使用 `rebase` 后，会将 `develop` 上的 `commit` 按顺序移到 `master` 的第三个 `commit` 后面，分支样子如下所示

![](https://yck-1254263422.cos.ap-shanghai.myqcloud.com/blog/2019-06-01-043129.png)

Rebase 对比 merge，优势在于合并后的结果很清晰，只有一条线，劣势在于如果一旦出现冲突，解决冲突很麻烦，可能要解决多个冲突，但是 merge 出现冲突只需要解决一次。

使用 rebase 应该在需要被 rebase 的分支上操作，并且该分支是本地分支。如果 `develop` 分支需要 rebase 到 `master` 上去，那么应该如下操作

```shell
## branch develop
git rebase master
git checkout master
## 用于将 `master` 上的 HEAD 移动到最新的 commit
git merge develop
```

## stash

`stash` 用于临时保存工作目录的改动。开发中可能会遇到代码写一半需要切分支打包的问题，如果这时候你不想 `commit` 的话，就可以使用该命令。

```shell
git stash
```

使用该命令可以暂存你的工作目录，后面想恢复工作目录，只需要使用

```shell
git stash pop
```

这样你之前临时保存的代码又回来了

## reflog

`reflog` 可以看到 HEAD 的移动记录，假如之前误删了一个分支，可以通过 `git reflog` 看到移动 HEAD 的哈希值

![](https://yck-1254263422.cos.ap-shanghai.myqcloud.com/blog/2019-06-01-43130.png)

从图中可以看出，HEAD 的最后一次移动行为是 `merge` 后，接下来分支 `new` 就被删除了，那么我们可以通过以下命令找回 `new` 分支

```shell
git checkout 37d9aca
git checkout -b new
```

PS：`reflog` 记录是时效的，只会保存一段时间内的记录。

## Reset

如果你想删除刚写的 commit，就可以通过以下命令实现

```shell
git reset --hard HEAD^
```

但是 `reset` 的本质并不是删除了 commit，而是重新设置了 HEAD 和它指向的 branch。
