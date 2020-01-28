An abstraction for working with a mouse.

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

## Description

This abstraction comes from the following observations:

1) Each interaction with the mouse has the following workflow:

       mousedown -> mousemove ... mousemove -> mouseup

   (here is `context.begin`, `context.end`, and `context.move`).

2) Almost always what you is really looking for is
   *how far a mouse was moved from the beginning* (here is
   `context.dx` and `context.dy`).

3) In general, you have to work with 2 coordinate system:
   the screen coordinates, and local coordinates. And the
   only thing you are interested in is your local coordinates.
   Or, in other words, you have to convert coordinates from
   screen to local (here is `context.translate`).
