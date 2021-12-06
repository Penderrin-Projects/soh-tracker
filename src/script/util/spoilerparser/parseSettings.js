import spoilerErrorAlert from "./spoilerErrorAlert.js";

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
                        if (typeof el == "object") {
                            try {
                                setSettingToTarget(target, el, parsedValue);
                            } catch {
                                console.warn("[" + key + ": " + parsedValue + "] is a invalid value for sub option [" + el["name"] + "] Please report this bug");
                                spoilerErrorAlert.prepareAlert();
                            }
                        } else {
                            target[el.replace("logic_", "skip.")] = valueSet.has(el);
                        }
                        
                    });
                } else {
                    try {
                        setSettingToTarget(target, transData, parsedValue);
                    } catch {
                        console.warn("[" + key + ": " + parsedValue + "] is a invalid value. Please report this bug");
                        spoilerErrorAlert.prepareAlert();
                    }
                }
            } else {
                target[transData] = parsedValue;
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
                    throw 'Invalid value'
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
