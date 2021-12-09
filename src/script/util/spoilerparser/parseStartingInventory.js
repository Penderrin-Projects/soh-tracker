const INVENTORY_KEYS = ["starting_items", "starting_equipment", "starting_songs"];

function addValue(target, key, value) {
    if (target[key] == null) {
        target[key] = value;
    } else {
        target[key] += value;
    }
}

export default function parseStartingInventory(errorDialogHandler, target = {}, settingsSpoiler = {}, trans = {}) {
    for (const key of INVENTORY_KEYS) {
        const data = settingsSpoiler[key] ?? [];
        const starting_trans = trans[key] ?? {};
        for (const item of data) {
            if (typeof item != "string") {
                console.warn(`Unexpected type "${typeof item}" within starting items`);
                errorDialogHandler.add(`Unexpected type "${typeof item}" within starting items`);
            } else {
                const transData = starting_trans[item];
                if (transData == null) {
                    console.warn(`Unknown Starting item "${item}" for "${key}"`);
                    errorDialogHandler.add(`Unknown Starting item "${item}" for "${key}"`);
                } else {
                    if (typeof transData == "string") {
                        addValue(target, transData, 1);
                    } else {
                        const name = transData["name"];
                        if (typeof name != "string") {
                            console.warn(`Translation for Starting item "${item}" in "${key}" is errornous`);
                            errorDialogHandler.add(`Translation for Starting item "${item}" in "${key}" is errornous`);
                        } else {
                            const value = parseInt(transData["value"]);
                            if (!isNaN(value)) {
                                addValue(target, name, value);
                            } else {
                                addValue(target, name, 1);
                            }
                        }
                    }
                }
            }
        }
    }
}