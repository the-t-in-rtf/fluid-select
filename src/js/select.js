// A generic component that controls and updates a single drop-down field based on a single model variable.
/* global fluid */
(function () {
    "use strict";
    fluid.registerNamespace("fluid.select");

    fluid.select.renderMarkup = function (that) {
        var selectOptionsSorted = fluid.copy(that.options.select);
        selectOptionsSorted.options = fluid.parsePriorityRecords(selectOptionsSorted.options, "select option");
        that.renderMarkup("initial", that.options.template, selectOptionsSorted);
    };

    fluid.defaults("fluid.select", {
        gradeNames: ["gpii.handlebars.templateAware"],
        template:     "select",
        priorityName: "select option",
        selectors:  {
            initial: ""
        },
        bindings: {
            select:  "select"
        },
        invokers: {
            renderInitialMarkup: {
                funcName: "fluid.select.renderMarkup",
                args:     ["{that}"]
            }
        },
        modelListeners: {
            select: {
                func:          "{that}.renderInitialMarkup",
                excludeSource: "init"
            }
        }
    });
})();
