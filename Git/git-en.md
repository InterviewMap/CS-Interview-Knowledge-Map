<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Merge with Rebase](#merge-with-rebase)
- [stash](#stash)
- [reflog](#reflog)
- [Reset](#reset)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

This is not for rookie, we'll introduce something about more advanced.
## Merge with Rebase
This command shows no difference with the command `merge`.    

We usually use `merge` to merge the code from one branch to `master` , like this:

![](https://yck-1254263422.cos.ap-shanghai.myqcloud.com/blog/2019-06-01-043130.png)

After using `rebase ` , the commits from `develop` will be moved to the third `commit` of the `master` in order, as follows:

![](https://yck-1254263422.cos.ap-shanghai.myqcloud.com/blog/2019-06-01-043133.png)

Compare with `merge`, the result of `rebase` is very clear with a single flow. But if there is any conflict, you'll be in trouble to solving them. You have to solve them one by one , while you only need to solve them one-time if using `merge`.

You should use `rebase` on the local branchs which need be rebased. If you need to `rebase` the `develop` to the `master`, you should do as follows:

```shell
## branch develop
git rebase master
git checkout master
## move HEAD on `master` to the latest commit
git merge develop
```

## stash

Use `git stash` to save the current state of the working directory while you want to check out branch, if you don't want to use `commit`.

```shell
git stash
```
This command can record the current state of the working directory, if you want to recover it, you can do like this:

```shell
git stash pop
```
then you'll back to the exactly state before.

## reflog

This command will show you the records of HEAD's trace. If you delete a branch by mistake, you can examine the hashs of HEAD by using `reflog`.

![](https://yck-1254263422.cos.ap-shanghai.myqcloud.com/blog/2019-06-01-043135.png)

According to the picture, the last movement of HEAD is just after `merge`, and then the `new` branch was deleted, so we can get the branch back by the following command:

```shell
git checkout 37d9aca
git checkout -b new
```

PS：`reflog` is time-bound, it can only record the state over a period of time.


## Reset

If you want to delete the last commit, you can do like this:

```shell
git reset --hard HEAD^
```
But this command doesn't delete the commit, it just reset the HEAD and branch.
