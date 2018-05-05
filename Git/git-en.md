This is not for rookie, we'll introduce somthing about more advanced.
## Merge with Rebase
This command shows no difference with the command `merge`.    

We usually use `merge` to merge the code from one branch to `master`. like this:

![](https://user-gold-cdn.xitu.io/2018/4/23/162f109db27be054?w=505&h=461&f=png&s=22796)

After using `rebase`， the commits from `decelop` will be moved to the third `commit` of the `master` in order, as follows:

![](https://user-gold-cdn.xitu.io/2018/4/23/162f11cc2cb8b332?w=505&h=563&f=png&s=26514)

Compare with `merge`, the result of `rebase` is very clear with a single flow. But if there is any conflict, you'll be in troule to solving them. You have to solve them one by one , while you only need to solve them once if using `merge`.



