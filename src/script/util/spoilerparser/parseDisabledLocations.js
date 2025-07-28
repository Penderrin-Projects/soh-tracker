export default function parseDisabledLocations(addError, target = {}, data = {}, trans = {}) {
    const location_trans = trans["locations"];

    if (location_trans == null) {
        addError("parsing disabled locations impossible - location translation missing");
        return;
    }

    target.options = target.options ?? {};

    for (const i of data) {
        const locationTrans = location_trans[i];
        if (Array.isArray(locationTrans)) {
            if (locationTrans.length > 0) {
                for (const locationTransValue of locationTrans) {
                    if (locationTransValue) {
                        target.options[`excluded_location[${locationTransValue}]`] = true;
                    }
                }
            } else {
                addError("[" + i + "] is a invalid value", "Location");
            }
        } else if (locationTrans) {
            target.options[`excluded_location[${locationTrans}]`] = true;
        } else {
            addError("[" + i + "] is a invalid value", "Location");
        }
    }
}
