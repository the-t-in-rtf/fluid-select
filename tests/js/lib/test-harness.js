// Launch the UL API and web site.  This script expects to communicate with a properly configured CouchDB instance
// running on port 5984, and with a properly configured couchdb-lucene instance running on port 5985.
//
// See the tests in this package for a harness that loads its own gpii-pouchdb and gpii-pouchdb-lucene instance.
/* eslint-env node */
"use strict";
var fluid = require("infusion");
fluid.setLogging(true);

var gpii  = fluid.registerNamespace("gpii");

require("../../../");
require("./middleware");

fluid.require("%gpii-express");
require("gpii-handlebars");

fluid.registerNamespace("fluid.tests.select.harness");
fluid.tests.select.harness.stopServer = function (that) {
    gpii.express.stopServer(that.express);
};

fluid.defaults("fluid.tests.select.harness", {
    gradeNames:   ["fluid.component"],
    templateDirs: ["%fluid-select/tests/templates", "%fluid-select/src/templates"],
    ports: {
        express: 6879
    },
    urls: {
        express: {
            expander: {
                funcName: "fluid.stringTemplate",
                args:     ["http://localhost:%port", { port: "{harness}.options.ports.express" }]
            }
        }
    },
    events: {
        constructFixtures: null,
        expressReady:      null,
        expressStopped:    null,
        onFixturesConstructed: {
            events: {
                expressReady:  "expressReady"
            }
        },
        onFixturesStopped: {
            events: {
                expressStopped: "expressStopped"
            }
        },
        stopFixtures: null
    },
    listeners: {
        stopFixtures: {
            funcName: "fluid.tests.select.harness.stopServer",
            args:     ["{that}"]
        }
    },
    components: {
        express: {
            type: "gpii.express",
            createOnEvent: "constructFixtures",
            options: {
                port: "{harness}.options.ports.express",
                components: {
                    // We will be make AJAX from testem-hosted pages, so we need to allow cross-domain requests.
                    corsHeaders: {
                        type: "gpii.express.middleware.headerSetter",
                        options: {
                            priority: "first",
                            headers: {
                                cors: {
                                    fieldName: "Access-Control-Allow-Origin",
                                    template:  "*",
                                    dataRules: {}
                                }
                            }
                        }
                    },
                    handlebars: {
                        type: "gpii.express.hb",
                        options: {
                            priority:     "after:corsHeaders",
                            templateDirs: "{harness}.options.templateDirs"
                        }
                    },
                    // Our own source
                    src: {
                        type: "gpii.express.router.static",
                        options: {
                            path:     "/src",
                            content:  "%fluid-select/src"
                        }
                    },
                    modules: {
                        type: "gpii.express.router.static",
                        options: {
                            path:     "/modules",
                            content:  "%fluid-select/node_modules"
                        }
                    },
                    inline: {
                        type: "gpii.handlebars.inlineTemplateBundlingMiddleware",
                        options: {
                            path:         "/hbs",
                            method:       "get",
                            templateDirs: "{harness}.options.templateDirs"
                        }
                    },
                    tests: {
                        type: "gpii.express.router.static",
                        options: {
                            path:     "/tests",
                            content:  ["%fluid-select/tests"]
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
                            priority:    "last",
                            path:        ["/content/:template", "/content"],
                            method:      "get",
                            templateDirs: "{harness}.options.templateDirs"
                        }
                    }
                },
                listeners: {
                    "onStarted.notifyParent": {
                        func: "{harness}.events.expressReady.fire"
                    },
                    "onStopped.notifyParent": {
                        func: "{harness}.events.expressStopped.fire"
                    }
                }
            }
        }
    }
});

fluid.defaults("fluid.tests.select.harness.instrumented", {
    gradeNames: ["fluid.tests.select.harness"],
    components: {
        express: {
            options: {
                components: {
                    src: {
                        options: {
                            // Serve up instrumented javascript where possible. CSS files and the like will be inherited from the main source directory.
                            content: ["%fluid-select/instrumented", "%fluid-select/src"]
                        }
                    }
                }
            }
        }
    }
});
