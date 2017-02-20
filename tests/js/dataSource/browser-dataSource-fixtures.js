(function (fluid) {
    "use strict";
    fluid.registerNamespace("fluid.tests.dataSource.nextGen.AJAX");

    fluid.tests.dataSource.nextGen.AJAX.logAndReturn = function (event, value) {
        fluid.log("Event '", event, "' fired with value:\n", value);
        return value;
    };

    fluid.defaults("fluid.tests.dataSource.nextGen.AJAX", {
        gradeNames: ["fluid.dataSource.nextGen.AJAX"],
        listeners: {
            "onRead.logAndReturn": {
                priority: "after:encoding",
                funcName: "fluid.tests.dataSource.nextGen.AJAX.logAndReturn",
                args:     ["onRead", "{arguments}.0"]
            },
            "onError.logAndReturn": {
                priority: "after:encoding",
                funcName: "fluid.tests.dataSource.nextGen.AJAX.logAndReturn",
                args:     ["onError", "{arguments}.0"]
            }
        }
    });

    fluid.defaults("fluid.tests.dataSource.nextGen.AJAX.fourOhFour", {
        gradeNames: ["fluid.tests.dataSource.nextGen.AJAX"],
        url:        "/tests/notfound"
    });

    fluid.defaults("fluid.tests.dataSource.nextGen.AJAX.validJson", {
        gradeNames: ["fluid.tests.dataSource.nextGen.AJAX"],
        url:        "/tests/data/valid.json"
    });

    fluid.defaults("fluid.tests.dataSource.nextGen.AJAX.text", {
        gradeNames: ["fluid.tests.dataSource.nextGen.AJAX"],
        url:        "/tests/data/text.txt"
    });

    fluid.defaults("fluid.tests.dataSource.nextGen.AJAX.termMap", {
        gradeNames: ["fluid.tests.dataSource.nextGen.AJAX"],
        url:        "/tests/data/%filename",
        termMap: {
            filename: "%filename"
        }
    });

    fluid.defaults("fluid.tests.dataSource.nextGen.AJAX.writable", {
        gradeNames: ["fluid.dataSource.nextGen.AJAX", "fluid.dataSource.nextGen.AJAX.writable"],
        url:        "/loopback"
    });

    // TODO: Get termMap working with a POST/PUT
    fluid.defaults("fluid.tests.dataSource.nextGen.AJAX.termMap.writable", {
        gradeNames: ["fluid.tests.dataSource.nextGen.AJAX", "fluid.dataSource.nextGen.AJAX.writable"],
        url:        "/loopback/%param",
        termMap: {
            param: "%param"
        }
    });

    // TODO: Test support for query data using data?

    fluid.defaults("fluid.tests.select.dataSource.caseHolder", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "Testing jQuery.ajax dataSource...",
            tests: [
                {
                    name: "Testing 404 error handling...",
                    sequence: [
                        {
                            func: "{fourOhFour}.get"
                        },
                        {
                            event:    "{fourOhFour}.events.onError",
                            listener: "jqUnit.assert",
                            args:     ["An error event should fire when requesting a URL that cannot be found."]
                        }
                    ]
                },
                {
                    name: "Test retrieving JSON content...",
                    sequence: [
                        {
                            func: "{validJson}.get"
                        },
                        {
                            event:    "{validJson}.events.onRead",
                            priority: "after:impl",
                            listener: "jqUnit.assertDeepEq",
                            args:     ["We should be able to retrieve a JSON payload.", "{caseHolder}.options.expected.validJson", "{arguments}.0"]
                        }
                    ]
                },
                {
                    name: "Test retrieving text content...",
                    sequence: [
                        {
                            func: "{text}.get"
                        },
                        {
                            event:    "{text}.events.onRead",
                            priority: "after:impl",
                            listener: "jqUnit.assertEquals",
                            args:     ["We should be able to retrieve a text payload.", "{caseHolder}.options.expected.text", "{arguments}.0"]
                        }
                    ]
                },
                {
                    name: "Test using a term map to customise the URL...",
                    sequence: [
                        {
                            func: "{termMap}.get",
                            args: [{ filename: "custom.json"}]
                        },
                        {
                            event:    "{termMap}.events.onRead",
                            priority: "after:impl",
                            listener: "jqUnit.assertDeepEq",
                            args:     ["We should end up at the correct custom URL.", "{caseHolder}.options.expected.termMap", "{arguments}.0"]
                        }
                    ]
                },
                {
                    name: "Test POSTing data...",
                    sequence: [
                        {
                            func: "{goodPost}.set",
                            args: [{}, { foo: "bar"}, {}] // directModel, model, options
                        },
                        {
                            event:    "{goodPost}.events.onWrite",
                            priority: "after:encoding",
                            listener: "jqUnit.assertLeftHand",
                            args:     ["We should be able to POST and receive the correct response...", "{caseHolder}.options.expected.goodPost", "{arguments}.0"]
                        }
                    ]
                },
                {
                    name: "Test PUT-ing data...",
                    sequence: [
                        {
                            func: "{goodPut}.set",
                            args: [{}, { me: "down"}, {}] // directModel, model, options
                        },
                        {
                            event:    "{goodPut}.events.onWrite",
                            priority: "after:encoding",
                            listener: "jqUnit.assertLeftHand",
                            args:     ["We should be able to PUT and receive the correct response...", "{caseHolder}.options.expected.goodPut", "{arguments}.0"]
                        }
                    ]
                },
                {
                    name: "Testing 404 error handling in a POST...",
                    sequence: [
                        {
                            func: "{fourOhFourPost}.set",
                            args: []
                        },
                        {
                            event:    "{fourOhFourPost}.events.onError",
                            listener: "jqUnit.assert",
                            args:     ["An error event should fire when POSTing to a URL that cannot be found."]
                        }
                    ]
                },
                {
                    name: "Test using termMap variables in a write operation...",
                    sequence: [
                        {
                            func: "{termMapPost}.set",
                            args: [{ param: "set correctly" }, { payload: "also good"}, {}] // directModel, model, options
                        },
                        {
                            event:    "{termMapPost}.events.onWrite",
                            priority: "after:encoding",
                            listener: "jqUnit.assertLeftHand",
                            args:     ["We should be able to use a termMap with a POST...", "{caseHolder}.options.expected.termMapPost", "{arguments}.0"]
                        }
                    ]
                }
            ]
        }],
        components: {
            fourOhFour: {
                type: "fluid.tests.dataSource.nextGen.AJAX.fourOhFour"
            },
            validJson: {
                type: "fluid.tests.dataSource.nextGen.AJAX.validJson"
            },
            text: {
                type: "fluid.tests.dataSource.nextGen.AJAX.text"
            },
            termMap: {
                type: "fluid.tests.dataSource.nextGen.AJAX.termMap"
            },
            goodPost: {
                type: "fluid.tests.dataSource.nextGen.AJAX.writable"
            },
            goodPut: {
                type: "fluid.tests.dataSource.nextGen.AJAX.writable",
                options: {
                    writeMethod: "PUT"
                }
            },
            termMapPost: {
                type: "fluid.tests.dataSource.nextGen.AJAX.termMap.writable"
            },
            fourOhFourPost: {
                type: "fluid.tests.dataSource.nextGen.AJAX.fourOhFour",
                options: {
                    gradeNames: ["fluid.dataSource.nextGen.AJAX.writable"]
                }
            }

        },
        expected: {
            validJson: {
                "array": [ "peas", "porridge", "hot"],
                "number": 3.1415926,
                "string": "false",
                "boolean": false
            },
            termMap: {
                "term maps": "seem to work"
            },
            goodPost: {
                method: "POST",
                body: {
                    foo: "bar"
                }
            },
            goodPut: {
                method: "PUT",
                body: {
                    me: "down"
                }
            },
            termMapPost: {
                method: "POST",
                params: {
                    param1: "set correctly"
                },
                body: {
                    payload: "also good"
                }
            }
        }
    });

    fluid.defaults("fluid.tests.select.dataSource.environment", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            caseHolder: {
                type: "fluid.tests.select.dataSource.caseHolder"
            }
        }
    });

    fluid.test.runTests("fluid.tests.select.dataSource.environment");
})(fluid);
