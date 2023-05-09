function getData(value) {
    if (typeof value === "object" && value !== null) {
        return value;
    }
    return {
        player: 1,
        item: value
    };
}

export default function parseItemLocations(addError, target = {}, data = {}, targetWorld = null, ignoreWorldLocking = false, trans = {}) {
    const location_trans = trans["locations"];
    const item_trans = trans["itemList"];

    if (location_trans == null) {
        addError("parsing item locations impossible - location translation missing");
        return;
    }

    if (item_trans == null) {
        addError("parsing item locations impossible - item translation missing");
        return;
    }

    target.locationItems = target.locationItems ?? {};

    for (const i in data) {
        const value = data[i];
        const {player, item} = getData(value);
        const itemTrans = item_trans[item];
        if (itemTrans == null) {
            addError("[" + item + "] is a invalid value", "Item");
        } else if (itemTrans) {
            if (targetWorld == null || player === targetWorld || ignoreWorldLocking) {
                const locationTrans = location_trans?.[i];
                if (locationTrans == null) {
                    addError("[" + i + "] is a invalid value", "Location");
                } else if (Array.isArray(locationTrans)) {
                    if (locationTrans.length == 0) {
                        addError("[" + i + "] is a invalid value", "Location");
                    } else {
                        for (const locationTransValue of locationTrans) {
                            if (locationTransValue) {
                                target.locationItems[locationTransValue] = itemTrans;
                            }
                        }
                    }
                } else if (locationTrans) {
                    target.locationItems[locationTrans] = itemTrans;
                }
            }
        }
    }
}
