An abstraction for working with mouse

    dd({
        event, // Pass original event object in
        begin: function (ctx) {
            console.log('The beginning');
        },
        end: function (ctx) {
            console.log('The end');
        },
        move: function (ctx) {
            console.log(`Position: x=${ctx.x} y={ctx.y}`);
        },
    });
