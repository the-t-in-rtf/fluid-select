# fluid-select

    // The sub-component that handles editing the "status" field.
    fluid.defaults("gpii.ul.product.edit.status", {
        gradeNames: ["gpii.ul.select"],
        template: "product-edit-status",
        select: {
            options: [
                { value: "new", label: "New"},
                { value: "active", label: "Active"},
                { value: "discontinued", label: "Discontinued"},
                { value: "deleted", label: "Deleted"}
            ]
        },
        selectors:  {
            select:  ""
        }
    });