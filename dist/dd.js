var dd =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/dd.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/dd.js":
/*!*******************!*\
  !*** ./src/dd.js ***!
  \*******************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// Features
// + translate coordinates into client space
// + handle scroll event
// - prevent execution of several dd in parallel
// - start when left button was pressed
// - cancel when mouse button was released outside, then moved inside

let active = 0;

function dd(context)
{
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
        // if (typeof context.begin == 'function') {
        //     context.begin(context);
        // }
        // if (typeof context.update == 'function') {
        //     context.update(context);
        // }
        run('begin');
        run('update');
    }

    function end() {
        active--;
        dd.log('end');
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
        document.removeEventListener('scroll', scroll);
        // if (typeof context.end == 'function') {
        //     context.end(context);
        // }
        run('end');
    }

    function translate() {
        context.x = context.event.clientX;
        context.y = context.event.clientY;
        context.client_x = context.event.clientX;
        context.client_y = context.event.clientY;
        // if (typeof context.translate == 'function') {
        //     context.translate(context);
        // }
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
        // if (typeof context.move == 'function') {
        //     context.move(context);
        // }
        // if (typeof context.update == 'function') {
        //     context.update(context);
        // }
        run('move');
        run('update');
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

    function run(name) {
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

/* harmony default export */ __webpack_exports__["default"] = (dd);


/***/ })

/******/ })["default"];