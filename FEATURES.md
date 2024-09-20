* ✅ The most basic workflow for working with the mouse: `begin → move → end`
* ✅ Passing [event] object should be optional
* Ability to postpone [begin] method (e.g. for implementing [threshold])
* ✅ Possibility to end operation (e.g. user pressed ESC)
* Implement [promise] interface (e.g. `await dd().promise()`)

### Mixins

```
const top0 = item.top;
const left0 = item.left;
dd({
    mixins: [dd.prevent_default(), dd.esc(), dd.threshold(10)],
    update: function (inst) {
        item.top = top0 + inst.dy;
        item.left = left0 + inst.dx;
    }
})
```

### Implement `promise` interface

This is rarely needed. Just to make things consistent with modals,
popovers and other _run and wait_ interactions.

```
const top0 = item.top;
const left0 = item.left;
await dd({
    update: function (inst) {
        item.top = top0 + inst.dy;
        item.left = left0 + inst.dx;
    }
}).promise()
```
