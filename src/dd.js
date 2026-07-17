// Features
// + translate coordinates into client space
// + handle scroll event
// + rudimentary support for threshold
// + cancel when ESC is pressed, window loses focus, or pointer is canceled
// + ignore other pointers (multi-touch) during an active drag
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
    // [pointerId] is undefined when a MouseEvent was passed in; in that
    // case no filtering is done.
    const pointer_id = context.event.pointerId;

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
        if (window.PointerEvent) {
            document.addEventListener('pointermove', pointermove);
            document.addEventListener('pointerup', pointerup);
            document.addEventListener('pointercancel', pointercancel);
        }
        else {
            document.addEventListener('mousemove', pointermove);
            document.addEventListener('mouseup', pointerup);
        }
        document.addEventListener('keydown', keydown);
        window.addEventListener('blur', blur);
        // [scroll] does not bubble; capture is the only way to see
        // scrolls happening inside nested containers.
        document.addEventListener('scroll', scroll, {capture: true});
        // Event is required to read clientX, clientY values. Calling
        // `preventDefault` would narrow its use cases.
        // context.event.preventDefault();
        context.canceled = false;
        translate();
        context.x0 = context.x;
        context.y0 = context.y;
        context.dx = 0;
        context.dy = 0;
        context.client_x0 = context.client_x;
        context.client_y0 = context.client_y;
        context.client_dx = 0;
        context.client_dy = 0;
        run('begin_nothreshold');
        run('begin');
        run('update');
    }

    function end() {
        active--;
        dd.log('end');
        if (window.PointerEvent) {
            document.removeEventListener('pointermove', pointermove);
            document.removeEventListener('pointerup', pointerup);
            document.removeEventListener('pointercancel', pointercancel);
        }
        else {
            document.removeEventListener('mousemove', pointermove);
            document.removeEventListener('mouseup', pointerup);
        }
        document.removeEventListener('keydown', keydown);
        window.removeEventListener('blur', blur);
        document.removeEventListener('scroll', scroll, {capture: true});
        run('end');
        run('end_nothreshold');
    }

    function translate() {
        context.x = context.event.clientX;
        context.y = context.event.clientY;
        context.client_x = context.event.clientX;
        context.client_y = context.event.clientY;
        run('translate');
    }

    function pointermove(event) {
        if (pointer_id !== undefined && event.pointerId !== pointer_id) {
            return;
        }
        dd.log('pointermove');
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
            // No rebasing: deltas keep measuring from the press point,
            // so [begin] sees dx/dy ≈ threshold and a dragged item
            // realigns with the pointer grip instead of lagging behind
            // by the threshold distance forever.
            run('begin');
        }
        run('move');
        run('update');
    }

    function pointerup(event) {
        if (pointer_id !== undefined && event.pointerId !== pointer_id) {
            return;
        }
        context.event = event;
        end();
    }

    function pointercancel(event) {
        if (pointer_id !== undefined && event.pointerId !== pointer_id) {
            return;
        }
        cancel();
    }

    function keydown(event) {
        // IE reports 'Esc'
        if (event.key === 'Escape' || event.key === 'Esc') {
            cancel();
        }
    }

    function blur() {
        cancel();
    }

    // [context.event] keeps the last mouse event: cancellation events
    // have no usable clientX/clientY.
    function cancel() {
        context.canceled = true;
        end();
    }

    function scroll() {
        dd.log('scroll');
        // [context.event] keeps the last mouse event: a scroll event has
        // no clientX/clientY, but translate mixins may depend on scroll
        // offsets, so coordinates should be recalculated.
        translate();
        context.dx = context.x - context.x0;
        context.dy = context.y - context.y0;
        context.client_dx = context.client_x - context.client_x0;
        context.client_dy = context.client_y - context.client_y0;
        run('update');
    }

    function run(name) {
        if (waiting_threshold) {
            switch (name) {
            case 'begin_nothreshold':
            case 'end_nothreshold':
            case 'translate':
                break;
            default:
                return;
            }
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

module.exports = dd;
