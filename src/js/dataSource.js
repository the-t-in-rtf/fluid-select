// A "nextgen" replacement for kettle.dataSource in which the actual network requests are part of the promise chain.
/* eslint-env node */
"use strict";
var fluid = fluid || require("infusion");
var kettle = kettle || fluid.require("%kettle");

fluid.registerNamespace("fluid.dataSource.nextGen");

/*
 /** Operate the core "transforming promise workflow" of a dataSource's `get` method.
 * @param that {Component} The dataSource itself
 * @param directModel {Object} The direct model expressing the "coordinates" of the model to be fetched
 * @param options {Object} A structure of options configuring the action of this get request - many of these will be specific to the particular concrete DataSource
 * @return {Promise} A promise for the final resolved payload
 */

fluid.dataSource.nextGen.get = function (that, directModel, options) {
    options = kettle.dataSource.defaultiseOptions(that.options, options, directModel);
    var promise = fluid.promise.fireTransformEvent(that.events.onRead, directModel, options);
    kettle.dataSource.registerStandardPromiseHandlers(that, promise, options);
    return promise;
};

/** Operate the core "transforming promise workflow" of a dataSource's `set` method.
 * @param that {Component} The dataSource itself
 * @param directModel {Object} The direct model expressing the "coordinates" of the model to be written
 * @param model {Object} The payload to be written to the dataSource
 * @param options {Object} A structure of options configuring the action of this set request - many of these will be specific to the particular concrete DataSource
 * @return {Promise} A promise for the final resolved payload (not all DataSources will provide any for a `set` method)
 */

fluid.dataSource.nextGen.set = function (that, directModel, model, options) {
    // options = kettle.dataSource.defaultiseOptions(that.options, options, directModel, true); // shared and writeable between all participants
    options = kettle.dataSource.defaultiseOptions(that.options, options, directModel); // shared and writeable between all participants
    var togo = fluid.promise.fireTransformEvent(that.events.onWrite, model, options);
    kettle.dataSource.registerStandardPromiseHandlers(that, togo, options);
    return togo;
};

fluid.defaults("fluid.dataSource.nextGen", {
    gradeNames: ["fluid.component", "{that}.getWritableGrade"],
    readOnlyGrade: "fluid.dataSource.nextGen",
    mergePolicy: {
        setResponseTransforms: "replace"
    },
    events: {
        // The "onRead" event is operated in a custom workflow by fluid.fireTransformEvent to process dataSource
        // payloads during the get set process. Each listener receives the data returned by the last.
        onRead:  null,
        onError: null
    },
    components: {
        encoding: {
            type: "kettle.dataSource.encoding.JSON"
        }
    },
    listeners: {
        "onRead.impl": {
            func: "{that}.getImpl",
            args: ["{arguments}.1", "{arguments}.0"] // options, directModel
        },
        "onRead.encoding": {
            func:      "{encoding}.parse",
            namespace: "encoding",
            priority:  "after:impl"
        }
    },
    invokers: {
        get: {
            funcName: "fluid.dataSource.nextGen.get",
            args:     ["{that}", "{arguments}.0", "{arguments}.1"] // directModel, options/callback
        },
        getImpl: {
            funcName: "fluid.identity"
        },
        // getImpl: must be implemented by a concrete subgrade
        getWritableGrade: {
            funcName: "kettle.dataSource.getWritableGrade",
            args:     ["{that}", "{that}.options.writable", "{that}.options.readOnlyGrade"]
        }
    },
    writable: false
});


fluid.defaults("fluid.dataSource.nextGen.writable", {
    gradeNames: ["fluid.component"],
    writable: true,
    events: {
        // The "onWrite" event is operated in a custom workflow by fluid.fireTransformEvent to process dataSource
        // payloads during the set process. Each listener receives the data returned by the last.
        onWrite: null,
        onError: null
    },
    listeners: {
        "onWrite.impl": {
            func: "{that}.setImpl",
            args: ["{arguments}.0", "{arguments}.1", "{arguments}.2"] // directModel, model, options
        },
        "onWrite.encoding": {
            func:      "{encoding}.render",
            namespace: "encoding",
            priority:  "after:impl" // TODO: Discuss how to properly bypass this.
        }
    },
    invokers: {
        set: {
            funcName: "fluid.dataSource.nextGen.set",
            // TODO: Discuss why this is somehow different for set, also how to preserve access to the directModel
            args:     ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"] // directModel, model, options/callback
        },
        setImpl: {
            funcName: "fluid.notImplemented"
        }
    }
});
