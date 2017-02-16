// A "nextgen" replacement for kettle.dataSource in which the actual network requests are part of the promise chain.
/* eslint-env node */
"use strict";
var fluid = fluid || require("infusion");
var kettle = kettle || fluid.require("%kettle");

fluid.registerNamespace("fluid.dataSource.nextGen");

/*
 /** Operate the core "transforming promise workflow" of a dataSource's `get` method. Gets the "initial payload" from the dataSource's `getImpl` method
 * and then pushes it through the transform chain to arrive at the final payload.
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

// TODO: Discuss a comparable refactor of the "set" infrastructure with Antranig.
// My gut feel is that we sequence the separate parts, but I'm not sure how to encapsulate innerPromise to be aware
// of all the necessary materias.

/** Operate the core "transforming promise workflow" of a dataSource's `set` method. Pushes the user's payload backwards through the
 * transforming promise chain (in the opposite direction to that applied on `get`, and then applies it to the dataSource's `setImpl` method.
 * Any return from this is then pushed forwards through a limited range of the transforms (typically, e.g. just decoding it as JSON)
 * on its way back to the user.
 * @param that {Component} The dataSource itself
 * @param directModel {Object} The direct model expressing the "coordinates" of the model to be written
 * @param model {Object} The payload to be written to the dataSource
 * @param options {Object} A structure of options configuring the action of this set request - many of these will be specific to the particular concrete DataSource
 * @return {Promise} A promise for the final resolved payload (not all DataSources will provide any for a `set` method)
 */

// fluid.dataSource.nextGen.set = function (that, directModel, model, options) {
//     options = kettle.dataSource.defaultiseOptions(that.options, options, directModel, true); // shared and writeable between all participants
//     var transformPromise = fluid.promise.fireTransformEvent(that.events.onWrite, model, options);
//     var togo = fluid.promise();
//     transformPromise.then(function (transformed) {
//         var innerPromise = that.setImpl(options, directModel, transformed);
//         innerPromise.then(function (setResponse) { // Apply limited transforms to a SET response payload
//             var options2 = kettle.dataSource.defaultiseOptions(that.options, fluid.copy(options), directModel);
//             options2.filterNamespaces = that.options.setResponseTransforms;
//             var retransformed = fluid.promise.fireTransformEvent(that.events.onRead, setResponse, options2);
//             fluid.promise.follow(retransformed, togo);
//         }, function (error) {
//             togo.reject(error);
//         });
//     });
//     kettle.dataSource.registerStandardPromiseHandlers(that, togo, options);
//     return togo;
// };

fluid.defaults("fluid.dataSource.nextGen", {
    gradeNames: ["fluid.component", "{that}.getWritableGrade"],
    mergePolicy: {
        setResponseTransforms: "replace"
    },
    events: {
        // events "onRead" and "onWrite" are operated in a custom workflow by fluid.fireTransformEvent to
        // process dataSource payloads during the get and set process. Each listener
        // receives the data returned by the last.
        onRead: null,
        onWrite: null,
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
        },
        // "onWrite.encoding": {
        //     func:      "{encoding}.render",
        //     namespace: "encoding"
        // },
        // "onWrite.impl": {
        //     func:      "{encoding}.render",
        //     namespace: "encoding",
        //     priority:  "after:encoding"
        // }
    },
    invokers: {
        get: {
            funcName: "fluid.dataSource.nextGen.get",
            args:     ["{that}", "{arguments}.0", "{arguments}.1"] // directModel, options/callback
        },
        // getImpl: must be implemented by a concrete subgrade
        getWritableGrade: {
            funcName: "kettle.dataSource.getWritableGrade",
            args:     ["{that}", "{that}.options.writable", "{that}.options.readOnlyGrade"]
        }
    },
    writable: false
});
