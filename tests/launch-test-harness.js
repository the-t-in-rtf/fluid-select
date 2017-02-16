// A launcher that starts the "harness" used in our tests, provided for manual browser testing and demos.
/* eslint-env node */
"use strict";
var fluid = require("infusion");

require("../");

require("gpii-launcher");

fluid.defaults("fluid.select.launcher", {
    gradeNames: ["gpii.launcher"],
    yargsOptions: {
        describe: {
            "ports.express": "The port the test harness should listen to.",
            "setLogging":   "The level of log information to output to the console. Defaults to `true` (all logs, INFO level and above)."
        },
        coerce: {
            setLogging: JSON.parse
        },
        help: true,
        defaults: {
            "optionsFile": "%fluid-select/configs/dev.json",
            "setLogging": true
        }
    }
});

fluid.select.launcher();
