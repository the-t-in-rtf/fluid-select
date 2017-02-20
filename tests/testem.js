/*

    Testem supports a javascript configuration file, which gives us the unique ability to tie functions/invokers
    to testem lifecycle events (test start, et cetera).  We use this to ensure that node-side fixtures (gpii-express,
    etc.) are started before tests are opened.

    You can either launch this using the `tests` npm script in this package, or manually, using a command like:

    `node node_modules/.bin/testem --file ./tests/testem.js`

    Adapted from node ./node_modules/istanbul/lib/cli.js report.
 */
/* eslint-env node */
"use strict";
var fluid = require("infusion");

fluid.require("%fluid-select/tests/js/lib/test-harness.js");
fluid.require("%fluid-select/src/test/testem-component.js");

var outputFile = fluid.module.resolvePath("%gpii-binder/report.tap");

fluid.defaults("fluid.test.testem.harness", {
    gradeNames: ["fluid.test.testem", "fluid.tests.select.harness"],
    testPages:  ["tests/static/dataSource-tests.html"],
    routes: {
        "node_modules": "node_modules"
    },
    // TODO: wire up instrumentation and use that for src
    serveFiles:  ["%fluid-select/src", "%fluid-select/tests"],
    testemOptions: {
        "browser_disconnect_timeout": 10,
        "framework":   "qunit",
        "parallel":    1,
        "report_file": outputFile,
        "proxies": {
            // Although our harness hosts everything we need, we cannot just proxy the root because it will prevent
            // testem.js from resolving.  So, we proxy the individual endpoints used in the client-side tests, and
            // let Testem host the rest.
            "/hbs": {
                target: "{harness}.options.urls.express"
            },
            "/modules": {
                target: "{harness}.options.urls.express"
            },
            "/loopback": {
                target: "{harness}.options.urls.express"
            }
        }
    }
});

var testemHarness = fluid.test.testem.harness({});
module.exports = testemHarness.options.testemOptions;
