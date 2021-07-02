export default function parseSetting(target = {}, data = {}, trans = {}) {
    const setting_trans = trans["setting"];
    for (const i in data) {
        let v = data[i];

        if (setting_trans[i] != null) {
            if (Array.isArray(v)) {
                v = new Set(v);
                setting_trans[i].forEach(el => {
                    target[el.replace("logic_", "skip.")] = v.has(el);
                });
            } else {
                if (i === "lacs_tokens" || i === "bridge_tokens") {
                    if (Number.isInteger(v) && v <= 100 && v > 0) {
                        target[setting_trans[i]["name"]] = v;
                    }
                } else {
                    if (setting_trans[i]["values"][v] === undefined) {
                        console.warn("[" + i + ": " + v + "] is a invalid value. Please report this bug")
                    } else {
                        if (setting_trans[i]["name"] !== "") {
                            target[setting_trans[i]["name"]] = setting_trans[i]["values"][v];
                            if (setting_trans[i] === "shuffle_ganon_bosskey" && v === "remove") {
                                target["option.ganon_boss_door_open"] = true;
                            }
                        }
                    }
                }
            }
        }
    }
}
