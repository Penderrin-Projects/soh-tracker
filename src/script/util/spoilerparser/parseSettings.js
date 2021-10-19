export default function parseSetting(target = {}, data = {}, trans = {}) {
    const setting_trans = trans["setting"];
    for (const [key, value] of Object.entries(data)) {
        const transData = setting_trans[key];
        if (transData != null) {
            const parsedValue = value ?? "0";
            if (typeof transData == "object") {
                if (Array.isArray(transData)) {
                    const valueSet = new Set(value);
                    transData.forEach(el => {
                        target[el.replace("logic_", "skip.")] = valueSet.has(el);
                    });
                } else {
                    const name = transData["name"];
                    const values = transData["values"];
                    if (values != null) {
                        if (typeof values == "object") {
                            if (values[parsedValue] == null) {
                                console.warn("[" + key + ": " + parsedValue + "] is a invalid value. Please report this bug")
                            } else {
                                target[name] = values[parsedValue];
                            }
                        } else {
                            target[name] = values;
                        }
                    } else {
                        target[name] = parsedValue;
                    }
                }
            } else {
                target[transData] = parsedValue;
            }
        }
    }
}
