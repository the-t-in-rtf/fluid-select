/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

fluid.require("%gpii-testem");

fluid.defaults("gpii.tests.sort.testem", {
    gradeNames: ["gpii.testem.coverageDataOnly"],
    testPages:  "tests/browser-tests.html",
    sourceDirs: ["src"],
    coverageDir: "coverage",
    reportsDir: "reports",
    serveDirs:  ["src", "node_modules"],
    testemOptions: {
        "disable_watching": true
    }
});

module.exports = gpii.tests.sort.testem().getTestemOptions();
