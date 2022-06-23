export default function parseSetting(addError, target = {}, data = {}, trans = {}) {
    const setting_trans = trans["setting"];

    target.options = target.options ?? {};

    for (const [key, value] of Object.entries(data)) {
        const transData = setting_trans[key];
        if (transData != null) {
            const parsedValue = value ?? "0";
            if (typeof transData == "object") {
                if (Array.isArray(transData)) {
                    const valueSet = new Set(value);
                    for (const el of transData) {
                        if (typeof el == "object") {
                            try {
                                setSettingToTarget(target.options, el, parsedValue);
                            } catch {
                                addError("[" + key + ": " + parsedValue + "] is a invalid value for sub option [" + el["name"] + "] Please report this bug");
                            }
                        } else {
                            target.options[el.replace("logic_", "skip.")] = valueSet.has(el);
                        }
                    }
                } else {
                    try {
                        setSettingToTarget(target.options, transData, parsedValue);
                    } catch {
                        addError("[" + key + ": " + parsedValue + "] is a invalid value. Please report this bug");
                    }
                }
            } else {
                target.options[transData] = parsedValue;
            }
        }
    }
}

function setSettingToTarget(target, transData, parsedValue) {
    const name = transData["name"];
    const values = transData["values"];
    if (values != null) {
        if (typeof values == "object") {
            if (values[parsedValue] == null) {
                if (values["default"] == null) {
                    throw "Invalid value"
                } else {
                    target[name] = values["default"]
                }
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
