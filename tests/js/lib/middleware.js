// `gpii.express.middleware` used by the tests in this package.  Transforms the incoming request using
// `options.rules.requestToResponse` and sends it back to the user.
/* eslint-env node */
"use strict";
var fluid = require("infusion");

fluid.require("%gpii-express");

fluid.registerNamespace("fluid.tests.dataSource.loopbackMiddleware");
fluid.tests.dataSource.loopbackMiddleware.middleware = function (that, request, response, next) {
    try {
        var transformedLoopback = fluid.model.transformWithRules(request, that.options.rules.requestToResponse);
        response.status(200).send(transformedLoopback);
    }
    catch (e) {
        next(e);
    }
};

fluid.defaults("fluid.tests.dataSource.loopbackMiddleware", {
    gradeNames: ["gpii.express.middleware"],
    method: "use",
    rules: {
        requestToResponse: {
            method: "method",
            query:  "query",
            body:   "body",
            params: "params"
        }
    },
    invokers: {
        middleware: {
            funcName: "fluid.tests.dataSource.loopbackMiddleware.middleware",
            args:     ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"] // request, response, next
        }
    }
});

fluid.defaults("fluid.tests.dataSource.loopbackRouter", {
    gradeNames: ["gpii.express.router"],
    components: {
        json: {
            type: "gpii.express.middleware.bodyparser.json"
        },
        urlencoded: {
            type: "gpii.express.middleware.bodyparser.urlencoded",
            options: {
                priority: "after:json"
            }
        },
        middleware: {
            type: "fluid.tests.dataSource.loopbackMiddleware",
            options: {
                priority: "after:urlencoded"
            }
        }
    }
});
