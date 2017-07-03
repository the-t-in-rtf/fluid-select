/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

fluid.require("%fluid-select");
fluid.require("%gpii-testem");
fluid.require("%gpii-express");
fluid.require("%gpii-handlebars");

require("./js/lib/middleware");

fluid.defaults("gpii.tests.sort.testem", {
    gradeNames: ["gpii.testem"],
    testPages:  ["tests/static/dataSource-tests.html"],
    sourceDirs: ["src"],
    coverageDir: "coverage",
    reportsDir: "reports",
    serveDirs:  ["src", "tests", "node_modules"],
    templateDirs: ["%fluid-select/tests/templates", "%fluid-select/src/templates"],
    packageRoot: {
        expander: {
            funcName: "fluid.module.resolvePath",
            args: "%fluid-select"
        }
    },
    testemOptions: {
        "disable_watching": true,
        "proxies": {
            "/content": {
                target: "{gpii.tests.sort.testem}.options.coverageUrl"
            },
            "/hbs": {
                target: "{gpii.tests.sort.testem}.options.coverageUrl"
            },
            "/loopback": {
                target: "{gpii.tests.sort.testem}.options.coverageUrl"
            }
        }
    },
    components: {
        coverageExpressInstance: {
            options: {
                components: {
                    handlebars: {
                        type: "gpii.express.hb",
                        options: {
                            priority:     "after:corsHeaders",
                            templateDirs: "{gpii.tests.sort.testem}.options.templateDirs"
                        }
                    },
                    inline: {
                        type: "gpii.handlebars.inlineTemplateBundlingMiddleware",
                        options: {
                            path:         "/hbs",
                            method:       "get",
                            templateDirs: "{gpii.tests.sort.testem}.options.templateDirs"
                        }
                    },
                    loopback: {
                        type: "fluid.tests.dataSource.loopbackRouter",
                        options: {
                            path: ["/loopback/:param1", "/loopback"]
                        }
                    },
                    dispatcher: {
                        type: "gpii.handlebars.dispatcherMiddleware",
                        options: {
                            priority:     "last",
                            path:         ["/content/:template", "/content"],
                            method:       "get",
                            templateDirs: "{gpii.tests.sort.testem}.options.templateDirs"
                        }
                    }
                }
            }
        }
    }
});

module.exports = gpii.tests.sort.testem().getTestemOptions();
