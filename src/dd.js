function dd(context)
{
    begin();

    function begin() {
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
        context.event.preventDefault();
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
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
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
}

export default dd;
