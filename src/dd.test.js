const assert = require('node:assert/strict');
const dd = require('./dd.js');

function pointerdown(x, y)
{
    return new window.PointerEvent('pointerdown', {clientX: x, clientY: y, pointerId: 1});
}

function pointermove(x, y, pointer_id = 1)
{
    document.dispatchEvent(new window.PointerEvent('pointermove', {clientX: x, clientY: y, pointerId: pointer_id}));
}

function pointerup(x, y, pointer_id = 1)
{
    document.dispatchEvent(new window.PointerEvent('pointerup', {clientX: x, clientY: y, pointerId: pointer_id}));
}

function recorder(names, calls)
{
    const out = {};
    names.forEach(function (name) {
        out[name] = () => calls.push(name);
    });
    return out;
}

describe('dd', function () {
    it('should initialize coordinates and run begin handlers once', function () {
        const calls = [];
        const context = {
            event: pointerdown(100, 50),
            ...recorder(['begin', 'begin_nothreshold', 'move', 'update'], calls),
        };
        dd(context);
        assert.equal(context.x0, 100);
        assert.equal(context.y0, 50);
        assert.equal(context.client_x0, 100);
        assert.equal(context.client_y0, 50);
        assert.equal(context.dx, 0);
        assert.equal(context.dy, 0);
        assert.deepEqual(calls, ['begin_nothreshold', 'begin', 'update']);
        pointerup(100, 50);
    });

    it('should compute dx/dy on mousemove and run move+update', function () {
        const calls = [];
        const context = {
            event: pointerdown(100, 50),
            ...recorder(['move', 'update'], calls),
        };
        dd(context);
        pointermove(110, 80);
        assert.equal(context.x, 110);
        assert.equal(context.y, 80);
        assert.equal(context.dx, 10);
        assert.equal(context.dy, 30);
        assert.equal(context.client_dx, 10);
        assert.equal(context.client_dy, 30);
        assert.deepEqual(calls, ['update', 'move', 'update']);
        pointerup(110, 80);
    });

    it('should run end handlers and detach listeners on mouseup', function () {
        const calls = [];
        const context = {
            event: pointerdown(100, 50),
            ...recorder(['end', 'end_nothreshold'], calls),
        };
        dd(context);
        pointerup(100, 50);
        assert.deepEqual(calls, ['end', 'end_nothreshold']);
        pointermove(200, 200);
        assert.equal(context.x, 100, 'detached: mousemove should have no effect');
    });

    it('should run mixin handlers before context handlers', function () {
        const calls = [];
        const context = {
            event: pointerdown(100, 50),
            mixins: [
                {begin: () => calls.push('mixin1_begin')},
                {begin: () => calls.push('mixin2_begin')},
            ],
            begin: () => calls.push('begin'),
        };
        dd(context);
        assert.deepEqual(calls, ['mixin1_begin', 'mixin2_begin', 'begin']);
        pointerup(100, 50);
    });

    it('should compute deltas in translated space', function () {
        const context = {
            event: pointerdown(100, 50),
            mixins: [{
                translate: function (ctx) {
                    ctx.x = ctx.client_x*2;
                    ctx.y = ctx.client_y*2;
                },
            }],
        };
        dd(context);
        pointermove(110, 80);
        assert.equal(context.dx, 20);
        assert.equal(context.dy, 60);
        assert.equal(context.client_dx, 10);
        assert.equal(context.client_dy, 30);
        pointerup(110, 80);
    });

    it('should round coordinates with dd.grid mixin', function () {
        const context = {
            event: pointerdown(0, 0),
            mixins: [dd.grid(25)],
        };
        dd(context);
        pointermove(30, 65);
        assert.equal(context.x, 25);
        assert.equal(context.y, 75);
        pointerup(30, 65);
    });

    it('should catch scroll from a nested container and recompute deltas', function () {
        const container = document.createElement('div');
        document.body.appendChild(container);
        let scroll_offset = 0;
        const calls = [];
        const context = {
            event: pointerdown(100, 50),
            mixins: [{
                translate: function (ctx) {
                    ctx.x = ctx.client_x + scroll_offset;
                    ctx.y = ctx.client_y + scroll_offset;
                },
            }],
            update: () => calls.push('update'),
        };
        dd(context);
        const pointermove_event = new window.PointerEvent('pointermove', {clientX: 110, clientY: 60, pointerId: 1});
        document.dispatchEvent(pointermove_event);
        scroll_offset = 30;
        // [scroll] does not bubble; only a capture listener can see it
        container.dispatchEvent(new window.Event('scroll'));
        assert.deepEqual(calls, ['update', 'update', 'update']);
        assert.equal(context.event, pointermove_event, 'scroll should keep the last pointer event');
        assert.equal(context.x, 140, 'translate should re-run with the new scroll offset');
        assert.equal(context.dx, 40);
        assert.equal(context.client_dx, 10, 'client deltas are scroll-independent');
        pointerup(110, 60);
        container.remove();
    });

    it('should suppress handlers until threshold is crossed', function () {
        const calls = [];
        const context = {
            event: pointerdown(100, 50),
            threshold: 20,
            ...recorder(['begin', 'begin_nothreshold', 'move', 'update'], calls),
        };
        dd(context);
        pointermove(110, 50);
        assert.deepEqual(calls, ['begin_nothreshold'], 'below threshold: only begin_nothreshold');
        pointermove(150, 50);
        assert.deepEqual(calls, ['begin_nothreshold', 'begin', 'move', 'update']);
        pointerup(150, 50);
    });

    it('should measure deltas from the press point when threshold begins', function () {
        const begin_deltas = [];
        const context = {
            event: pointerdown(100, 50),
            threshold: 20,
            begin: ctx => begin_deltas.push({dx: ctx.dx, dy: ctx.dy}),
        };
        dd(context);
        pointermove(150, 50);
        assert.deepEqual(begin_deltas, [{dx: 50, dy: 0}], 'no rebasing at the crossing point');
        pointerup(150, 50);
    });

    it('should run only end_nothreshold when released below threshold', function () {
        const calls = [];
        const context = {
            event: pointerdown(100, 50),
            threshold: 20,
            ...recorder(['begin', 'end', 'end_nothreshold'], calls),
        };
        dd(context);
        pointermove(105, 50);
        pointerup(105, 50);
        assert.deepEqual(calls, ['end_nothreshold']);
    });

    it('should keep canceled=false on a normal drop', function () {
        const context = {event: pointerdown(100, 50)};
        dd(context);
        pointerup(100, 50);
        assert.equal(context.canceled, false);
    });

    it('should cancel on ESC', function () {
        const calls = [];
        const context = {
            event: pointerdown(100, 50),
            ...recorder(['end', 'end_nothreshold'], calls),
        };
        dd(context);
        document.dispatchEvent(new window.KeyboardEvent('keydown', {key: 'Escape'}));
        assert.equal(context.canceled, true);
        assert.deepEqual(calls, ['end', 'end_nothreshold']);
        pointermove(200, 200);
        assert.equal(context.x, 100, 'detached: pointermove should have no effect');
    });

    it('should cancel when window loses focus', function () {
        const context = {event: pointerdown(100, 50)};
        dd(context);
        window.dispatchEvent(new window.Event('blur'));
        assert.equal(context.canceled, true);
        pointermove(200, 200);
        assert.equal(context.x, 100, 'detached: pointermove should have no effect');
    });

    it('should cancel on pointercancel', function () {
        const context = {event: pointerdown(100, 50)};
        dd(context);
        document.dispatchEvent(new window.PointerEvent('pointercancel', {pointerId: 1}));
        assert.equal(context.canceled, true);
        assert.equal(context.x, 100, 'coordinates should stay at the last pointer position');
    });

    it('should ignore other pointers (multi-touch)', function () {
        const context = {event: pointerdown(100, 50)};
        dd(context);
        pointermove(300, 300, 2);
        assert.equal(context.x, 100, 'foreign pointermove should have no effect');
        pointerup(300, 300, 2);
        pointermove(110, 80);
        assert.equal(context.x, 110, 'still attached after foreign pointerup');
        pointerup(110, 80);
    });

    it('should fall back to mouse events without PointerEvent', function () {
        const saved = window.PointerEvent;
        delete window.PointerEvent;
        try {
            const context = {event: new window.MouseEvent('mousedown', {clientX: 100, clientY: 50})};
            dd(context);
            document.dispatchEvent(new window.MouseEvent('mousemove', {clientX: 110, clientY: 80}));
            assert.equal(context.dx, 10);
            assert.equal(context.dy, 30);
            document.dispatchEvent(new window.MouseEvent('mouseup', {clientX: 110, clientY: 80}));
            assert.equal(context.canceled, false);
            document.dispatchEvent(new window.MouseEvent('mousemove', {clientX: 200, clientY: 200}));
            assert.equal(context.x, 110, 'detached: mousemove should have no effect');
        }
        finally {
            window.PointerEvent = saved;
        }
    });
});
