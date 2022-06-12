export default function parseShops(errorDialogHandler, target = {}, data = {}, trans = {}, shopsanity = false) {
    const shop_trans = new Set(trans["shops"]);
    const item_trans = trans["shopItems"];

    if (shopsanity !== "off") {
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
                        target.shopItems[`basar_child/${placement}`] = `item[${item}]`;
                        target.shopItemsBought[`basar_child/${placement}`] = false;
                        target.shopItemsPrice[`basar_child/${placement}`] = price;
                        if (player !== 0) {
                            target.shopItemsName[`basar_child/${placement}`] = "Player " + player;
                        } else {
                            target.shopItemsName[`basar_child/${placement}`] = "";
                        }
                    }
                    if (i.startsWith("Market Potion") || i.startsWith("Castle Town Potion")) {
                        target.shopItems[`magic_child/${placement}`] = `item[${item}]`;
                        target.shopItemsBought[`magic_child/${placement}`] = false;
                        target.shopItemsPrice[`magic_child/${placement}`] = price;
                        if (player !== 0) {
                            target.shopItemsName[`magic_child/${placement}`] = "Player " + player;
                        } else {
                            target.shopItemsName[`magic_child/${placement}`] = "";
                        }
                    }
                    if (i.startsWith("Market Bombchu") || i.startsWith("Bombchu")) {
                        target.shopItems[`bombchu/${placement}`] = `item[${item}]`;
                        target.shopItemsBought[`bombchu/${placement}`] = false;
                        target.shopItemsPrice[`bombchu/${placement}`] = price;
                        if (player !== 0) {
                            target.shopItemsName[`bombchu/${placement}`] = "Player " + player;
                        } else {
                            target.shopItemsName[`bombchu/${placement}`] = "";
                        }
                    }
                    if (i.startsWith("Kak Bazaar") || i.startsWith("Kakariko Bazaar")) {
                        target.shopItems[`basar_adult/${placement}`] = `item[${item}]`;
                        target.shopItemsBought[`basar_adult/${placement}`] = false;
                        target.shopItemsPrice[`basar_adult/${placement}`] = price;
                        if (player !== 0) {
                            target.shopItemsName[`basar_adult/${placement}`] = "Player " + player;
                        } else {
                            target.shopItemsName[`basar_adult/${placement}`] = "";
                        }
                    }
                    if (i.startsWith("Kak Potion") || i.startsWith("Kakariko Potion")) {
                        target.shopItems[`magic_adult/${placement}`] = `item[${item}]`;
                        target.shopItemsBought[`magic_adult/${placement}`] = false;
                        target.shopItemsPrice[`magic_adult/${placement}`] = price;
                        if (player !== 0) {
                            target.shopItemsName[`magic_adult/${placement}`] = "Player " + player;
                        } else {
                            target.shopItemsName[`magic_adult/${placement}`] = "";
                        }
                    }
                    if (i.startsWith("GC") || i.startsWith("Goron")) {
                        target.shopItems[`goron/${placement}`] = `item[${item}]`;
                        target.shopItemsBought[`goron/${placement}`] = false;
                        target.shopItemsPrice[`goron/${placement}`] = price;
                        if (player !== 0) {
                            target.shopItemsName[`goron/${placement}`] = "Player " + player;
                        } else {
                            target.shopItemsName[`goron/${placement}`] = "";
                        }
                    }
                    if (i.startsWith("ZD") || i.startsWith("Zora")) {
                        target.shopItems[`zora/${placement}`] = `item[${item}]`;
                        target.shopItemsBought[`zora/${placement}`] = false;
                        target.shopItemsPrice[`zora/${placement}`] = price;
                        if (player !== 0) {
                            target.shopItemsName[`zora/${placement}`] = "Player " + player;
                        } else {
                            target.shopItemsName[`zora/${placement}`] = "";
                        }
                    }
                    if (i.startsWith("KF") || i.startsWith("Kokiri")) {
                        target.shopItems[`kokiri/${placement}`] = `item[${item}]`;
                        target.shopItemsBought[`kokiri/${placement}`] = false;
                        target.shopItemsPrice[`kokiri/${placement}`] = price;
                        if (player !== 0) {
                            target.shopItemsName[`kokiri/${placement}`] = "Player " + player;
                        } else {
                            target.shopItemsName[`kokiri/${placement}`] = "";
                        }
                    }
                }
            }
        }
    }
}
