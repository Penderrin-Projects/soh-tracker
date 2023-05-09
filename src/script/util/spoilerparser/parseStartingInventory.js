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

    if (typeof settingsSpoiler["starting_items"] === "object" && !Array.isArray(settingsSpoiler["starting_items"])) {
        // NEW RANDO SPOILER FOR STARTITEMS
        const data = settingsSpoiler["starting_items"] ?? {};
        const starting_trans = trans["starting_items_new"] ?? {};
        for (const item in data) {
            const spoilerValue = parseInt(data[item]);
            if (typeof item != "string") {
                addError(`Unexpected type "${typeof item}"`, "Starting Items");
            } else {
                const transData = starting_trans[item];
                if (transData == null) {
                    addError(`Unknown value "${item}"`, "Starting Items");
                } else if (transData === false) {
                    // ignore them
                } else if (typeof transData == "string") {
                    if (!isNaN(spoilerValue)) {
                        addValue(target.startItems, transData, spoilerValue);
                    } else {
                        addValue(target.startItems, transData, 1);
                    }
                } else {
                    const name = transData["name"];
                    if (typeof name != "string") {
                        addError(`Translation for value "${item}" is errornous`, "Starting Items");
                    } else if (!isNaN(spoilerValue)) {
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
    } else {
        // OLD RANDO SPOILER FOR STARTITEMS
        for (const key of INVENTORY_KEYS) {
            const data = settingsSpoiler[key] ?? {};
            const starting_trans = trans[key] ?? {};
            for (const item of data) {
                if (typeof item != "string") {
                    addError(`Unexpected type "${typeof item}"`, "Starting Items");
                } else {
                    const transData = starting_trans[item];
                    if (transData == null) {
                        addError(`Unknown value "${item}" for "${key}"`, "Starting Items");
                    } else if (typeof transData == "string") {
                        addValue(target.startItems, transData, 1);
                    } else {
                        const name = transData["name"];
                        if (typeof name != "string") {
                            addError(`Translation for value "${item}" in "${key}" is errornous`, "Starting Items");
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
        }
    }
}
