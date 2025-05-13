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

function stuffShopSlot(target, shopRef, item, price, player) {
    target.locationItems[shopRef] = item;
    target.locations[shopRef] = false;
    target.shopItemsPrice[shopRef] = price;
    if (player !== 0) {
        target.shopItemsName[shopRef] = "Player " + player;
    } else {
        target.shopItemsName[shopRef] = "";
    }
}

export default function parseShops(addError, target = {}, data = {}, trans = {}, shopsanity = false) {
    const shop_trans = trans["shops"];
    const item_trans = trans["shopItems"];

    target.locationItems = target.locationItems ?? {};
    target.locations = target.locations ?? {};
    target.shopItemsPrice = target.shopItemsPrice ?? {};
    target.shopItemsName = target.shopItemsName ?? {};

    if (shopsanity !== "off") {
        for (const i in data) {
            const v = data[i];
            const shopRef = shop_trans[i];
            if (shopRef != null) {
                const item = item_trans[v["item"]] ?? "bad_item";
                if (item === "bad_item") {
                    addError("[" + v["item"] + "] is a invalid shop item", "Shop");
                }
                const price = getPrice(v["price"]);
                const player = getPlayer(v["player"]);
                stuffShopSlot(target, shopRef, item, price, player);
            }
        }
    }
}
