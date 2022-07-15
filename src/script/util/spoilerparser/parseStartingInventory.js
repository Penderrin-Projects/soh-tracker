const INVENTORY_KEYS = ["starting_items", "starting_equipment", "starting_songs"];

function addValue(target, key, value) {
    if (target[key] == null) {
        target[key] = value;
    } else {
        target[key] += value;
    }
}

export default function parseStartingInventory(addError, target = {}, settingsSpoiler = {}, trans = {}) {
    target.startItems = target.startItems ?? {};

    for (const key of INVENTORY_KEYS) {
        const data = settingsSpoiler[key] ?? {};
        const starting_trans = trans[key] ?? {};
        if (Array.isArray(data)) {
            // OLD RANDO SPOILER FOR STARTITEMS
            for (const item of data) {
                if (typeof item != "string") {
                    addError(`Unexpected type "${typeof item}" within starting items`);
                } else {
                    const transData = starting_trans[item];
                    if (transData == null) {
                        addError(`Unknown Starting item "${item}" for "${key}"`);
                    } else if (typeof transData == "string") {
                        addValue(target.startItems, transData, 1);
                    } else {
                        const name = transData["name"];
                        if (typeof name != "string") {
                            addError(`Translation for Starting item "${item}" in "${key}" is errornous`);
                        } else {
                            const value = parseInt(transData["value"]);
                            if (!isNaN(value)) {
                                addValue(target.startItems, name, value);
                            } else {
                                addValue(target.startItems, name, 1);
                            }
                        }
                    }
                }
            }
        } else {
            // NEW RANDO SPOILER FOR STARTITEMS
            for (const item in data) {
                if (typeof item != "string") {
                    addError(`Unexpected type "${typeof item}" within starting items`);
                } else {
                    const transData = starting_trans[item];
                    if (transData == null) {
                        addError(`Unknown Starting item "${item}" for "${key}"`);
                    } else if (typeof transData == "string") {
                        addValue(target.startItems, transData, 1);
                    } else {
                        const name = transData["name"];
                        if (typeof name != "string") {
                            addError(`Translation for Starting item "${item}" in "${key}" is errornous`);
                        } else {
                            const spoilerValue = parseInt(data[item]);
                            if (!isNaN(spoilerValue)) {
                                addValue(target.startItems, name, spoilerValue);
                            } else {
                                const transValue = parseInt(transData["value"]);
                                if (!isNaN(transValue)) {
                                    addValue(target.startItems, name, transValue);
                                } else {
                                    addValue(target.startItems, name, 1);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
