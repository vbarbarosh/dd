## Case 1: Fire `move` and `update` events on each `scroll`

    dnd({mixins: autoscroll(elem)})

## Case 2: Postpone `begin` event until threshold 

    dnd({mixins: dnd.threshold(10)})

## Case 3: Fire `end` event without waiting mouseup

    dnd({mixins: dnd.cancel_on_esc()})
