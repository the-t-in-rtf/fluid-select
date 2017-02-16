(function () {
    "use strict";
    // A viewComponent with a single select, used in all of our tests.
    fluid.defaults("fluid.tests.select.browserComponent", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            select: "select"
        },
        components: {
            select: {
                container:  "{fluid.tests.select.browserComponent}.dom.select",
                type: "fluid.select",
                options: {
                    select: "{fluid.tests.select.browserComponent}.options.select"
                }
            }
        }
    });
})();
