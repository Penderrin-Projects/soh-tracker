export default function parseDisabledLocations(addError, target = {}, data = {}, trans = {}) {
    const location_trans = trans["locations"];

    if (location_trans == null) {
        addError("parsing disabled locations impossible - location translation missing");
        return;
    }

    target.locations = target.locations ?? {};

    for (const i of data) {
        const locationTrans = location_trans[i];
        if (Array.isArray(locationTrans)) {
            if (locationTrans.length > 0) {
                for (const locationTransValue of locationTrans) {
                    if (locationTransValue) {
                        target.locations[locationTransValue] = true;
                    }
                }
            } else {
                addError("[" + i + "] is a invalid Location value");
            }
        } else if (locationTrans) {
            target.locations[locationTrans] = true;
        } else {
            addError("[" + i + "] is a invalid Location value");
        }
    }
}
