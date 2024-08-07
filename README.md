An abstraction for working with the mouse.

    dd({
        event, // Pass original event object in
        begin: function (ctx) {
            console.log('The beginning');
        },
        end: function (ctx) {
            console.log('The end');
        },
        move: function (ctx) {
            console.log(`Position: x=${ctx.x} y={ctx.y}; distance: dx=${ctx.dx} dy=${ctx.dy}`);
        },
    });

## Installation

    npm i @vbarbarosh/dd

## Using from browser

    <script src="https://unpkg.com/@vbarbarosh/dd@1.3.0/dist/dd.js"></script>

## Description

This abstraction comes from the following observations:

1) Each interaction with the mouse has the following workflow:

       mousedown -> mousemove ... mousemove -> mouseup

   (here is `context.begin`, `context.end`, and `context.move`).

2) Almost always what you are really looking for is
   *how far a mouse was moved from the beginning* (here is
   `context.dx` and `context.dy`).

3) In general, you have to work with 2 coordinate system:
   the screen coordinates, and local coordinates. And the
   only thing you are interested in is your local coordinates.
   Or, in other words, you have to convert coordinates from
   screen to local (here is `context.translate`).

## Gotchas

* `IFRAME` and `BUTTON[disabled]` stops propagation of mouse
  events. As a result `dd` will not call `begin` not `update`
  handlers ([Events and disabled form fields](https://jakearchibald.com/2017/events-and-disabled-form-fields/)).

## Resources

* https://github.com/STRML/react-grid-layout
* https://github.com/STRML/react-draggable
* https://github.com/STRML/react-resizable
* https://github.com/AlexeyBoiko/DgrmJS
* https://www.youtube.com/watch?v=IEZ2bdMbSwI
* http://dbushell.github.io/Nestable
