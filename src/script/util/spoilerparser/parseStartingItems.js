function addValue(target, key, value) {
    if (target[key] == null) {
        target[key] = value;
    } else {
        target[key] += value;
    }
}

export default function parseStartingItems(target = {}, settingsSpoiler = {}, trans = {}) {
    const starting_keys = ["starting_items", "starting_equipment", "starting_songs"];
    starting_keys.forEach(starting_key => {
        const data = settingsSpoiler[starting_key];
        const starting_trans = trans[starting_key];
        for (const [key, value] of Object.entries(data)) {
            if (typeof value == "object") {
                console.warn("Unexpected Array within starting items, please report this!")
            } else {
                const parsedValue = parseInt(value) || 0;
                const transData = starting_trans[key];
                if (transData != null) {
                    if (typeof transData == "object") {
                        const name = transData["name"];
                        const values = transData["values"];
                        if (values != null) {
                            if (typeof values == "object") {
                                if (values[parsedValue] == null) {
                                    console.warn("[" + key + ": " + parsedValue + "] is a invalid value. Please report this bug")
                                } else {
                                    addValue(target, name, parseInt(values[parsedValue]) || 0);
                                }
                            } else if (!!parsedValue) {
                                addValue(target, name, parseInt(values) || 0);
                            }
                        } else {
                            addValue(target, name, parsedValue);
                        }
                    } else {
                        addValue(target, transData, parsedValue);
                    }
                }
            }
        }
    });
}