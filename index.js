// A shim to register this module with fluid, so that our content can be accessed using package-relative paths like
// `%fluid-select/src/js/select.js`
/* eslint-env node */
"use strict";
var fluid = require("infusion");

fluid.module.register("fluid-select", __dirname, require);
