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
                                addError("[" + key + ": " + parsedValue + "] is a invalid value for sub option [" + el["name"] ?? el + "]", "Settings");
                            }
                        } else {
                            target.options[el.replace("logic_", "skip.")] = valueSet.has(el);
                        }
                    }
                } else if (Array.isArray(parsedValue)) {
                    for (const el of parsedValue) {
                        try {
                            setSettingToTarget(target.options, transData, el);
                        } catch {
                            addError("[" + key + ": " + el + "] is a invalid value for sub option [" + transData["name"] ?? transData + "]", "Settings");
                        }
                    }
                } else {
                    try {
                        setSettingToTarget(target.options, transData, parsedValue);
                    } catch {
                        addError("[" + key + ": " + parsedValue + "] is a invalid value", "Settings");
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
            const resultValue = values[parsedValue];
            if (resultValue == null) {
                if (values["default"] == null) {
                    throw "Invalid value"
                } else {
                    target[name] = values["default"]
                }
            } else if (typeof resultValue == "object") {
                const resName = resultValue["name"];
                const resValue = resultValue["value"];
                target[resName] = resValue;
            } else {
                target[name] = resultValue;
            }
        } else {
            target[name] = values;
        }
    } else {
        target[name] = parsedValue;
    }
}
