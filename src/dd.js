function dd(context)
{
    begin();

    function begin() {
        document.documentElement.style.cursor = window.getComputedStyle(context.event.target).cursor;
        document.documentElement.style.pointerEvents = 'none';
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
        if (typeof context.begin == 'function') {
            context.begin(context);
        }
        if (typeof context.update == 'function') {
            context.update(context);
        }
    }

    function end() {
        document.documentElement.style.cursor = '';
        document.documentElement.style.pointerEvents = '';
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
        document.removeEventListener('scroll', scroll);
        if (typeof context.end == 'function') {
            context.end(context);
        }
    }

    function translate() {
        context.x = context.event.clientX;
        context.y = context.event.clientY;
        if (typeof context.translate == 'function') {
            context.translate(context);
        }
    }

    function mousemove(event) {
        context.event = event;
        translate();
        context.dx = context.x - context.x0;
        context.dy = context.y - context.y0;
        if (typeof context.move == 'function') {
            context.move(context);
        }
        if (typeof context.update == 'function') {
            context.update(context);
        }
    }

    function mouseup(event) {
        context.event = event;
        end();
    }

    function scroll(event) {
        context.event = event;
        if (typeof context.update == 'function') {
            context.update(context);
        }
    }
}

export default dd;
