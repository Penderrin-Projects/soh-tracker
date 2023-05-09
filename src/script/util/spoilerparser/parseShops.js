function getPrice(value) {
    if (Number.isInteger(value) && value <= 999) {
        return value;
    }
    return 0;
}

function getPlayer(value) {
    if (Number.isInteger(value) && value <= 100) {
        return value;
    }
    return 0;
}

function splitShop(value) {
    const res = [];
    if (value.startsWith("Market Bazaar") || value.startsWith("Castle Town Bazaar")) {
        res.push("basar_child");
    }
    if (value.startsWith("Market Potion") || value.startsWith("Castle Town Potion")) {
        res.push("magic_child");
    }
    if (value.startsWith("Market Bombchu") || value.startsWith("Bombchu")) {
        res.push("bombchu");
    }
    if (value.startsWith("Kak Bazaar") || value.startsWith("Kakariko Bazaar")) {
        res.push("basar_adult");
    }
    if (value.startsWith("Kak Potion") || value.startsWith("Kakariko Potion")) {
        res.push("magic_adult");
    }
    if (value.startsWith("GC") || value.startsWith("Goron")) {
        res.push("goron");
    }
    if (value.startsWith("ZD") || value.startsWith("Zora")) {
        res.push("zora");
    }
    if (value.startsWith("KF") || value.startsWith("Kokiri")) {
        res.push("kokiri");
    }
    if (value.endsWith("1")) {
        res.push(6);
    }
    if (value.endsWith("2")) {
        res.push(2);
    }
    if (value.endsWith("3")) {
        res.push(7);
    }
    if (value.endsWith("4")) {
        res.push(3);
    }
    if (value.endsWith("5")) {
        res.push(5);
    }
    if (value.endsWith("6")) {
        res.push(1);
    }
    if (value.endsWith("7")) {
        res.push(4);
    }
    if (value.endsWith("8")) {
        res.push(0);
    }
    return res;
}

function stuffShopSlot(target, shopRef, placement, item, price, player) {
    target.shopItems[`${shopRef}/${placement}`] = item;
    target.shopItemsBought[`${shopRef}/${placement}`] = false;
    target.shopItemsPrice[`${shopRef}/${placement}`] = price;
    if (player !== 0) {
        target.shopItemsName[`${shopRef}/${placement}`] = "Player " + player;
    } else {
        target.shopItemsName[`${shopRef}/${placement}`] = "";
    }
}

export default function parseShops(addError, target = {}, data = {}, trans = {}, shopsanity = false) {
    const shop_trans = new Set(trans["shops"]);
    const item_trans = trans["shopItems"];

    target.shopItems = target.shopItems ?? {};
    target.shopItemsBought = target.shopItemsBought ?? {};
    target.shopItemsPrice = target.shopItemsPrice ?? {};
    target.shopItemsName = target.shopItemsName ?? {};

    if (shopsanity !== "off") {
        for (const i in data) {
            const v = data[i]
            if (shop_trans.has(i)) {
                const item = item_trans[v["item"]] ?? "bad_item";
                if (item === "bad_item") {
                    addError("[" + v["item"] + "] is a invalid shop item", "Shop");
                }
                const price = getPrice(v["price"]);
                const player = getPlayer(v["player"]);
                const [shopName, placement] = splitShop(i);
                stuffShopSlot(target, shopName, placement, item, price, player);
            }
        }
    }
}
