export default function parseShops(errorDialogHandler, target = {}, data = {}, trans = {}, shopsanity = false) {
    const shop_trans = new Set(trans["shops"]);
    const item_trans = trans["shopItems"];

    const buffer = {};
    const kokiri = [];
    const marketB = [];
    const marketP = [];
    const marketE = [];
    const kakB = [];
    const kakP = [];
    const goron = [];
    const zora = [];
    const kokiriNames = [];
    const marketBNames = [];
    const marketPNames = [];
    const marketENames = [];
    const kakBNames = [];
    const kakPNames = [];
    const goronNames = [];
    const zoraNames = [];
    for (let i = 0; i <= 7; i++) {
        kokiri[i] = {};
        kokiriNames[i] = "";
        marketB[i] = {};
        marketBNames[i] = "";
        marketP[i] = {};
        marketPNames[i] = "";
        marketE[i] = {};
        marketENames[i] = "";
        kakB[i] = {};
        kakBNames[i] = "";
        kakP[i] = {};
        kakPNames[i] = "";
        goron[i] = {};
        goronNames[i] = "";
        zora[i] = {};
        zoraNames[i] = "";
    }

    for (const i in data) {
        const v = data[i]
        if (shop_trans.has(i)) {
            const item = item_trans[v["item"]] ?? "bad_item";
            let price = 0;
            let player = 0;
            let placement = 0;
            if (Number.isInteger(v["price"]) && v["price"] <= 999) {
                price = v["price"]
            }
            if (Number.isInteger(v["player"]) && v["player"] <= 100) {
                player = v["player"]
            }
            if (item !== undefined) {
                if (i.endsWith("1")) {
                    placement = 6;
                }
                if (i.endsWith("2")) {
                    placement = 2;
                }
                if (i.endsWith("3")) {
                    placement = 7;
                }
                if (i.endsWith("4")) {
                    placement = 3;
                }
                if (i.endsWith("5")) {
                    placement = 5;
                }
                if (i.endsWith("6")) {
                    placement = 1;
                }
                if (i.endsWith("7")) {
                    placement = 4
                }
                if (i.endsWith("8")) {
                    placement = 0;
                }
                if (i.startsWith("Market Bazaar") || i.startsWith("Castle Town Bazaar")) {
                    buffer[`basar_child/${placement}.item`] = `item[${item}]`;
                    buffer[`basar_child/${placement}.bought`] = false;
                    buffer[`basar_child/${placement}.price`] = price;
                    if (player !== 0) {
                        buffer[`basar_child/${placement}.name`] = "Player " + player;
                    } else {
                        buffer[`basar_child/${placement}.name`] = "";
                    }
                }
                if (i.startsWith("Market Potion") || i.startsWith("Castle Town Potion")) {
                    buffer[`magic_child/${placement}.item`] = `item[${item}]`;
                    buffer[`magic_child/${placement}.bought`] = false;
                    buffer[`magic_child/${placement}.price`] = price;
                    if (player !== 0) {
                        buffer[`magic_child/${placement}.name`] = "Player " + player;
                    } else {
                        buffer[`magic_child/${placement}.name`] = "";
                    }
                }
                if (i.startsWith("Market Bombchu") || i.startsWith("Bombchu")) {
                    buffer[`bombchu/${placement}.item`] = `item[${item}]`;
                    buffer[`bombchu/${placement}.bought`] = false;
                    buffer[`bombchu/${placement}.price`] = price;
                    if (player !== 0) {
                        buffer[`bombchu/${placement}.name`] = "Player " + player;
                    } else {
                        buffer[`bombchu/${placement}.name`] = "";
                    }
                }
                if (i.startsWith("Kak Bazaar") || i.startsWith("Kakariko Bazaar")) {
                    buffer[`basar_adult/${placement}.item`] = `item[${item}]`;
                    buffer[`basar_adult/${placement}.bought`] = false;
                    buffer[`basar_adult/${placement}.price`] = price;
                    if (player !== 0) {
                        buffer[`basar_adult/${placement}.name`] = "Player " + player;
                    } else {
                        buffer[`basar_adult/${placement}.name`] = "";
                    }
                }
                if (i.startsWith("Kak Potion") || i.startsWith("Kakariko Potion")) {
                    buffer[`magic_adult/${placement}.item`] = `item[${item}]`;
                    buffer[`magic_adult/${placement}.bought`] = false;
                    buffer[`magic_adult/${placement}.price`] = price;
                    if (player !== 0) {
                        buffer[`magic_adult/${placement}.name`] = "Player " + player;
                    } else {
                        buffer[`magic_adult/${placement}.name`] = "";
                    }
                }
                if (i.startsWith("GC") || i.startsWith("Goron")) {
                    buffer[`goron/${placement}.item`] = `item[${item}]`;
                    buffer[`goron/${placement}.bought`] = false;
                    buffer[`goron/${placement}.price`] = price;
                    if (player !== 0) {
                        buffer[`goron/${placement}.name`] = "Player " + player;
                    } else {
                        buffer[`goron/${placement}.name`] = "";
                    }
                }
                if (i.startsWith("ZD") || i.startsWith("Zora")) {
                    buffer[`zora/${placement}.item`] = `item[${item}]`;
                    buffer[`zora/${placement}.bought`] = false;
                    buffer[`zora/${placement}.price`] = price;
                    if (player !== 0) {
                        buffer[`zora/${placement}.name`] = "Player " + player;
                    } else {
                        buffer[`zora/${placement}.name`] = "";
                    }
                }
                if (i.startsWith("KF") || i.startsWith("Kokiri")) {
                    buffer[`kokiri/${placement}.item`] = `item[${item}]`;
                    buffer[`kokiri/${placement}.bought`] = false;
                    buffer[`kokiri/${placement}.price`] = price;
                    if (player !== 0) {
                        buffer[`kokiri/${placement}.name`] = "Player " + player;
                    } else {
                        buffer[`kokiri/${placement}.name`] = "";
                    }
                }
            }
        }
    }
    if (shopsanity !== "off") {
        target["shops"] = buffer;
    }
}
