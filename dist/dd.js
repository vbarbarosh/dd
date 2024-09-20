var dd;dd =
/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/dd.js":
/*!*******************!*\
  !*** ./src/dd.js ***!
  \*******************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// Features
// + translate coordinates into client space
// + handle scroll event
// + no need to pass an event object
// + rudimentary support for threshold
// - prevent execution of several dd in parallel
// - start when left button was pressed
// - cancel when mouse button was released outside, then moved inside
var active = 0;
var init = [];
document.addEventListener('mousedown', function (event) {
  init.splice(0).forEach(function (fn) {
    return fn(event);
  });
});

function dd(context) {
  var waiting_threshold = context.threshold > 0;
  init.push(function (event) {
    context.event = event;
    begin();
  });

  function begin() {
    active++;
    dd.log('begin');
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
    document.addEventListener('scroll', scroll); // Event is required to read clientX, clientY values. Calling
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
      var d = Math.sqrt(context.dx * context.dx + context.dy * context.dy);

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
    if (waiting_threshold && name !== 'translate') {
      return;
    }

    var tmp = Array.isArray(context.mixins) ? context.mixins.map(function (v) {
      return v[name];
    }) : [];
    tmp.push(context[name]);
    tmp.filter(function (v) {
      return typeof v == 'function';
    }).forEach(function (fn) {
      return fn(context);
    });
  }
}

dd.debug = false;

dd.log = function (method) {
  if (dd.debug) {
    console.log("dd active=".concat(active), method);
  }
};

dd.grid = function (n) {
  return {
    translate: function translate(ctx) {
      ctx.x = Math.round(ctx.x / n) * n;
      ctx.y = Math.round(ctx.y / n) * n;
    }
  };
};

dd.prevent_default = function () {
  return {
    begin: function begin(ctx) {
      ctx.event.preventDefault();
    }
  };
};

dd.no_pointer_events = function () {
  return {
    begin: function begin(ctx) {
      document.documentElement.style.cursor = window.getComputedStyle(ctx.event.target).cursor;
      document.documentElement.style.pointerEvents = 'none';
    },
    end: function end() {
      document.documentElement.style.cursor = '';
      document.documentElement.style.pointerEvents = '';
    }
  };
}; // dd.threshold = function (n) {
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

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__("./src/dd.js");
/******/ })()
.default;