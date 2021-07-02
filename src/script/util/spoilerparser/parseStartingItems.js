export default function parseStartingItems(target = {}, data = {}, trans = {}) {
    const starting_trans = trans["starting_items"];

    let bottles = 0;

    for (const i in data) {
        const v = data[i];

        if (starting_trans[i] != null) {
            if (typeof v === "object" && v !== null) {
                console.warn("Unexpected Array within starting items, please report this!")
            } else {
                if (starting_trans[i]["values"][v] === undefined) {
                    console.warn("[" + i + ": " + v + "] is a invalid value. Please report this bug")
                } else {
                    if (!i.includes("Bottle") && !i.includes("Rito")) {
                        target[starting_trans[i]["name"]] = starting_trans[i]["values"][v];
                    } else {
                        bottles = bottles + starting_trans[i]["values"][v]
                        target[starting_trans["Bottle"]["name"]] = bottles;
                    }
                }
            }
        }
    }
}
