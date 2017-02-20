// TODO: generalize this for broader reuse.
// Adapted from node ./node_modules/istanbul/lib/cli.js report
/* eslint-env node */
"use strict";
var fluid = require("infusion");

fluid.registerNamespace("fluid.test.testem");

fluid.test.testem.init = function (that, config, data, callback) {
    that.events.onFixturesConstructed.addListener(callback);
    that.events.constructFixtures.fire();
};

fluid.test.testem.shutdown = function (that, config, data, callback) {
    that.events.onFixturesStopped.addListener(callback);
    that.events.stopFixtures.fire();
};

fluid.test.testem.resolvePaths = function (pathsToResolve) {
    return fluid.transform(fluid.makeArray(pathsToResolve), fluid.module.resolvePath);
};

fluid.defaults("fluid.test.testem", {
    gradeNames:  ["fluid.component"],
    sourceFiles: [],
    testPages:   [],
    serveFiles:  [],
    events: {
        constructFixtures: null,
        onFixturesConstructed: null,
        stopFixtures: null,
        onFixturesStopped: null
    },
    testemOptions: {
        on_start: "{that}.onStart",
        on_exit:  "{that}.onExit",
        src_files: {
            expander: {
                funcName: "fluid.test.testem.resolvePaths",
                args:     ["{that}.options.sourceFiles"]
            }
        },
        // TODO:  Testem doesn't seem to accept full paths, it wants paths relative to where you run things from.
        test_page: {
            expander: {
                funcName: "fluid.test.testem.resolvePaths",
                args:     ["{that}.options.testPages"]
            }
        },
        serve_files: {
            expander: {
                funcName: "fluid.test.testem.resolvePaths",
                args:     ["{that}.options.serveFiles"]
            }
        }
    },
    invokers: {
        "onStart": {
            funcName: "fluid.test.testem.init",
            args:     ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"] // config, data, callback
        },
        "onExit": {
            funcName: "fluid.test.testem.shutdown",
            args:     ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"] // config, data, callback
        }
    }
});
