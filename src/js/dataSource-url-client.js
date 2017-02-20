/*

    A client-side AJAX kettle dataSource that uses the core "next gen" engine from this package.

    This is backed by jQuery.ajax, and usees completely different options than kettle.dataSource.URL

*/

(function (fluid, $) {
    "use strict";
    fluid.setLogging(true);

    fluid.registerNamespace("fluid.dataSource.nextGen.AJAX");

    // We filter down to ensure that we only pass valid options to jQuery.ajax
    fluid.dataSource.nextGen.AJAX.allowedOptions = [
        "accepts",
        "async",
        "beforeSend",
        "cache",
        "complete",
        "contents",
        "contentType",
        "context",
        "converters",
        "crossDomain",
        "data",
        "dataFilter",
        "dataType",
        "error",
        "global",
        "headers",
        "ifModified",
        "isLocal",
        "jsonp",
        "jsonpCallback",
        "method",
        "mimeType",
        "password",
        "processData",
        "scriptCharset",
        "statusCode",
        "success",
        "timeout",
        "traditional",
        "type",
        "url",
        "username",
        "xhr",
        "xhrFields"
    ];

    // http://api.jquery.com/jquery.ajax/#jQuery-ajax-settings
    fluid.dataSource.nextGen.AJAX.makeRequest = function (that, requestOptions, directModel, model) {
        var togo = fluid.promise();

        var combinedRequestOptions = fluid.dataSource.nextGen.AJAX.prepareRequestOptions(that, togo, requestOptions, directModel, model);
        $.ajax(combinedRequestOptions);

        return togo;
    };

    fluid.dataSource.nextGen.AJAX.prepareRequestOptions = function (that, promise, requestOptions, directModel, model) {
        var combinedRequestOptions = fluid.extend(true, that.options.baseRequestOptions, requestOptions);
        combinedRequestOptions.url = that.resolveUrl(that.options.url, that.options.termMap, directModel);

        if (model) {
            combinedRequestOptions.data = model;
        }

        combinedRequestOptions.error = function (jqXHR, textStatus, errorThrown) {
            promise.reject({ statusCode: jqXHR.status, message: errorThrown || textStatus});
        };

        combinedRequestOptions.success = function (data) { // data , textStatus, jqXHR
            promise.resolve(data);
        };

        var filteredOptions = fluid.filterKeys(combinedRequestOptions, that.options.allowedOptions);

        return filteredOptions;
    };

    fluid.dataSource.nextGen.AJAX.resolveUrl = function (url, termMap, directModel, noencode) {
        var map = fluid.transform(termMap, function resolve(entry) {
            entry = String(entry);
            var encode = !noencode;
            if (entry.indexOf("noencode:") === 0) {
                encode = false;
                entry = entry.substring("noencode:".length);
            }
            var value = entry.charAt(0) === "%" ? fluid.get(directModel, entry.substring(1)) : entry;
            if (encode) {
                value = encodeURIComponent(value);
            }
            return value;
        });
        var replaced = fluid.stringTemplate(url, map);
        return replaced;
    };

    fluid.defaults("fluid.dataSource.nextGen.AJAX", {
        gradeNames: ["fluid.dataSource.nextGen"],
        allowedOptions: fluid.dataSource.nextGen.AJAX.allowedOptions,
        readOnlyGrade: "fluid.dataSource.nextGen.AJAX",
        baseRequestOptions: {
            method: "GET"
        },
        invokers: {
            resolveUrl: "fluid.dataSource.nextGen.AJAX.resolveUrl", // url, termMap, directModel, noencode
            getImpl: {
                funcName: "fluid.dataSource.nextGen.AJAX.makeRequest",
                args: ["{that}", "{arguments}.0", "{arguments}.1"] // requestOptions, directModel
            }
        },
        components: {
            encoding: {
                type: "kettle.dataSource.encoding.none" // We rely on jQuery.ajax to take care of encoding.
            }
        },
        termMap: {}
    });

    fluid.defaults("fluid.dataSource.nextGen.AJAX.writable", {
        gradeNames: ["fluid.dataSource.nextGen.writable"],
        baseRequestOptions: {
            method: "{that}.options.writeMethod"
        },
        writable:    true,
        writeMethod: "POST",
        invokers: {
            setImpl: {
                funcName: "fluid.dataSource.nextGen.AJAX.makeRequest",
                // TODO: Discuss why this needs to be cross-wired, also how we get back the directModel
                args:     ["{that}", "{arguments}.1", {}, "{arguments}.0"] // requestOptions, directModel, model
            }
        }
    });
})(fluid, jQuery);
