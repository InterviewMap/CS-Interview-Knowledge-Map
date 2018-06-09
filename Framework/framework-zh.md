<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [VDOM](#vdom)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# VDOM



- 节点不一样就直接干掉
- 相同的节点，先对比属性
- 对于子节点，需要用 key 告诉我怎么复用，否则就按照上面的方式判断

