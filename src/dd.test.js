const assert = require('node:assert/strict');
const dd = require('./dd.js');

function mousedown(x, y)
{
    return new window.MouseEvent('mousedown', {clientX: x, clientY: y});
}

function mousemove(x, y)
{
    document.dispatchEvent(new window.MouseEvent('mousemove', {clientX: x, clientY: y}));
}

function mouseup(x, y)
{
    document.dispatchEvent(new window.MouseEvent('mouseup', {clientX: x, clientY: y}));
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
            event: mousedown(100, 50),
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
        mouseup(100, 50);
    });

    it('should compute dx/dy on mousemove and run move+update', function () {
        const calls = [];
        const context = {
            event: mousedown(100, 50),
            ...recorder(['move', 'update'], calls),
        };
        dd(context);
        mousemove(110, 80);
        assert.equal(context.x, 110);
        assert.equal(context.y, 80);
        assert.equal(context.dx, 10);
        assert.equal(context.dy, 30);
        assert.equal(context.client_dx, 10);
        assert.equal(context.client_dy, 30);
        assert.deepEqual(calls, ['update', 'move', 'update']);
        mouseup(110, 80);
    });

    it('should run end handlers and detach listeners on mouseup', function () {
        const calls = [];
        const context = {
            event: mousedown(100, 50),
            ...recorder(['end', 'end_nothreshold'], calls),
        };
        dd(context);
        mouseup(100, 50);
        assert.deepEqual(calls, ['end', 'end_nothreshold']);
        mousemove(200, 200);
        assert.equal(context.x, 100, 'detached: mousemove should have no effect');
    });

    it('should run mixin handlers before context handlers', function () {
        const calls = [];
        const context = {
            event: mousedown(100, 50),
            mixins: [
                {begin: () => calls.push('mixin1_begin')},
                {begin: () => calls.push('mixin2_begin')},
            ],
            begin: () => calls.push('begin'),
        };
        dd(context);
        assert.deepEqual(calls, ['mixin1_begin', 'mixin2_begin', 'begin']);
        mouseup(100, 50);
    });

    it('should compute deltas in translated space', function () {
        const context = {
            event: mousedown(100, 50),
            mixins: [{
                translate: function (ctx) {
                    ctx.x = ctx.client_x*2;
                    ctx.y = ctx.client_y*2;
                },
            }],
        };
        dd(context);
        mousemove(110, 80);
        assert.equal(context.dx, 20);
        assert.equal(context.dy, 60);
        assert.equal(context.client_dx, 10);
        assert.equal(context.client_dy, 30);
        mouseup(110, 80);
    });

    it('should round coordinates with dd.grid mixin', function () {
        const context = {
            event: mousedown(0, 0),
            mixins: [dd.grid(25)],
        };
        dd(context);
        mousemove(30, 65);
        assert.equal(context.x, 25);
        assert.equal(context.y, 75);
        mouseup(30, 65);
    });

    it('should catch scroll from a nested container and recompute deltas', function () {
        const container = document.createElement('div');
        document.body.appendChild(container);
        let scroll_offset = 0;
        const calls = [];
        const context = {
            event: mousedown(100, 50),
            mixins: [{
                translate: function (ctx) {
                    ctx.x = ctx.client_x + scroll_offset;
                    ctx.y = ctx.client_y + scroll_offset;
                },
            }],
            update: () => calls.push('update'),
        };
        dd(context);
        const mousemove_event = new window.MouseEvent('mousemove', {clientX: 110, clientY: 60});
        document.dispatchEvent(mousemove_event);
        scroll_offset = 30;
        // [scroll] does not bubble; only a capture listener can see it
        container.dispatchEvent(new window.Event('scroll'));
        assert.deepEqual(calls, ['update', 'update', 'update']);
        assert.equal(context.event, mousemove_event, 'scroll should keep the last mouse event');
        assert.equal(context.x, 140, 'translate should re-run with the new scroll offset');
        assert.equal(context.dx, 40);
        assert.equal(context.client_dx, 10, 'client deltas are scroll-independent');
        mouseup(110, 60);
        container.remove();
    });

    it('should suppress handlers until threshold is crossed', function () {
        const calls = [];
        const context = {
            event: mousedown(100, 50),
            threshold: 20,
            ...recorder(['begin', 'begin_nothreshold', 'move', 'update'], calls),
        };
        dd(context);
        mousemove(110, 50);
        assert.deepEqual(calls, ['begin_nothreshold'], 'below threshold: only begin_nothreshold');
        mousemove(150, 50);
        assert.deepEqual(calls, ['begin_nothreshold', 'begin', 'move', 'update']);
        mouseup(150, 50);
    });

    it('should run only end_nothreshold when released below threshold', function () {
        const calls = [];
        const context = {
            event: mousedown(100, 50),
            threshold: 20,
            ...recorder(['begin', 'end', 'end_nothreshold'], calls),
        };
        dd(context);
        mousemove(105, 50);
        mouseup(105, 50);
        assert.deepEqual(calls, ['end_nothreshold']);
    });
});
