// Features
// + translate coordinates into client space
// + handle scroll event
// + rudimentary support for threshold
// - no need to pass an event object
// - prevent execution of several dd in parallel
// - start when left button was pressed
// - cancel when mouse button was released outside, then moved inside

let active = 0;

// const init = [];
//
// document.addEventListener('mousedown', function (event) {
//     init.splice(0).forEach(fn => fn(event));
// });

function dd(context)
{
    let waiting_threshold = (context.threshold > 0);

    // 🐛️ This method does not work when [dd] is called from [mousemove] handler.
    //
    // init.push(function (event) {
    //     context.event = event;
    //     begin();
    // });

    begin();

    function begin() {
        active++;
        dd.log('begin');
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
        document.addEventListener('scroll', scroll);
        // Event is required to read clientX, clientY values. Calling
        // `preventDefault` would narrow its use cases.
        // context.event.preventDefault();
        translate();
        context.x0 = context.x;
        context.y0 = context.y;
        context.dx = 0;
        context.dy = 0;
        context.client_x0 = context.client_x;
        context.client_y0 = context.client_y;
        context.client_dx = 0;
        context.client_dy = 0;
        run('begin');
        run('update');
    }

    function end() {
        active--;
        dd.log('end');
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
        document.removeEventListener('scroll', scroll);
        run('end');
    }

    function translate() {
        context.x = context.event.clientX;
        context.y = context.event.clientY;
        context.client_x = context.event.clientX;
        context.client_y = context.event.clientY;
        run('translate');
    }

    function mousemove(event) {
        dd.log('mousemove');
        context.event = event;
        translate();
        context.dx = context.x - context.x0;
        context.dy = context.y - context.y0;
        context.client_dx = context.client_x - context.client_x0;
        context.client_dy = context.client_y - context.client_y0;
        if (waiting_threshold) {
            const d = Math.sqrt(context.dx*context.dx + context.dy*context.dy);
            if (d < context.threshold) {
                return;
            }
            waiting_threshold = false;
            run('begin');
        }
        run('move');
        run('update');
    }

    function mouseup(event) {
        context.event = event;
        end();
    }

    function scroll(event) {
        context.event = event;
        run('update');
    }

    function run(name) {
        if (waiting_threshold && (name !== 'translate')) {
            return;
        }
        const tmp = Array.isArray(context.mixins) ? context.mixins.map(v => v[name]) : [];
        tmp.push(context[name]);
        tmp.filter(v => typeof v == 'function').forEach(fn => fn(context));
    }
}

dd.debug = false;
dd.log = function (method) {
    if (dd.debug) {
        console.log(`dd active=${active}`, method);
    }
};

dd.grid = function (n) {
    return {
        translate: function (ctx) {
            ctx.x = Math.round(ctx.x/n)*n;
            ctx.y = Math.round(ctx.y/n)*n;
        },
    };
};

dd.prevent_default = function () {
    return {
        begin: function (ctx) {
            ctx.event.preventDefault();
        },
    };
};

dd.no_pointer_events = function () {
    return {
        begin: function (ctx) {
            document.documentElement.style.cursor = window.getComputedStyle(ctx.event.target).cursor;
            document.documentElement.style.pointerEvents = 'none';
        },
        end: function () {
            document.documentElement.style.cursor = '';
            document.documentElement.style.pointerEvents = '';
        },
    };
};

// dd.threshold = function (n) {
//     return {
//         begin: function ({dx, dy}) {
//             if (Math.abs(dx) >= n || Math.abs(dy) >= n) {
//                 // Remove this mixin
//                 // Attach all other mixins
//             }
//             // Stop sending events to other mixins
//         },
//     };
// };
//
// dd.mouse_left = function () {
//     return {
//         begin: function (ctx) {
//             if (ctx.event.button != 0) {
//                 // Cancel dnd
//                 // All registered mixins should be unregistered
//             }
//             console.log('mouse_left', ctx.event.button, ctx.event.buttons);
//         },
//     };
// };

export default dd;
