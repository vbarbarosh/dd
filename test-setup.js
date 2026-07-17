const {JSDOM} = require('jsdom');

const jsdom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {pretendToBeVisual: true});
global.window = jsdom.window;
global.document = jsdom.window.document;
