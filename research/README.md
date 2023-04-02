The essence

    1) mouse down
    2) mouse move
    3) mouse up

* Wait until operation finished
* Terminate
* Notify about outside changes

Wait until dnd is finished

    await dnd().promise()

Terminate dnd

    dnd().end()
    dnd().reject(error)
    dnd().resolve(value)

Inform dnd about outside changes

    dnd().update()

Watch for left mouse button only

    if (event.button == 0) {
        dnd({event})
    }

Watch for middle mouse button only

    if (event.button == 0) {
        dnd({event})
    }

Attach mixin in the middle of action

    dd.mixin(dd.svg_points(...))
