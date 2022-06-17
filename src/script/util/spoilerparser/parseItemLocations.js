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
        addError("parsing item locations impossible. location translation missing.");
        return;
    }

    if (item_trans == null) {
        addError("parsing item locations impossible. item translation missing.");
        return;
    }

    target.locationItems = target.locationItems ?? {};

    for (const i in data) {
        const value = data[i];
        const {player, item} = getData(value);
        const itemTrans = item_trans[item];
        if (itemTrans) {
            if (targetWorld == null || player === targetWorld || ignoreWorldLocking) {
                const locationTrans = location_trans?.[i];
                if (Array.isArray(locationTrans)) {
                    if (locationTrans.length > 0) {
                        for (const locationTransValue of locationTrans) {
                            if (locationTransValue) {
                                target.locationItems[locationTransValue] = itemTrans;
                            }
                        }
                    } else {
                        addError("[" + i + "] is a invalid Location value.");
                    }
                } else if (locationTrans) {
                    target.locationItems[locationTrans] = itemTrans;
                } else {
                    addError("[" + i + "] is a invalid Location value.");
                }
            }
        } else {
            addError("[" + item + "] is a invalid Item value.");
        }
    }
}
