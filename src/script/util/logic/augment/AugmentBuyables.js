import LogicCaller from "/GameTrackerJS/util/logic/LogicCaller.js";
import ShopsResource from "../../../resource/ShopsResource.js";

const BUYABLE_ITEMS = {
    "blue_fire_1": "buyable[blue_fire]",
    "bugs_1": "buyable[bugs]",
    "fairy_spirit_1": "buyable[fairy]",
    "fish_1": "buyable[fish]",
    "stick_1": "buyable[sticks]",
    "nuts_5": "buyable[nuts]",
    "nuts_10": "buyable[nuts]"
};

function augment(cache) {
    if (cache.get("option[shopsanity]") === "off") {
        if (cache.hasChange("option[shopsanity]")) {
            const shops = ShopsResource.get();
            for (const name in shops) {
                for (let slot = 0; slot < 8; ++slot) {
                    const slotRef = shops[name][slot].ref;
                    const slotItem = shops[name][slot].item;
                    if (slotItem in BUYABLE_ITEMS) {
                        const buyableRef = BUYABLE_ITEMS[slotItem];
                        LogicCaller.setCollectible(`reach_location[${slotRef}]`, buyableRef);
                    } else {
                        LogicCaller.deleteCollectible(`reach_location[${slotRef}]`);
                    }
                }
            }
        }
    } else {
        const shops = ShopsResource.get();
        if (cache.hasChange("option[shopsanity]")) {
            for (const name in shops) {
                for (let slot = 0; slot < 8; ++slot) {
                    const slotRef = shops[name][slot].ref;
                    LogicCaller.deleteCollectible(`reach_location[${slotRef}]`);
                }
            }
        }
        for (const name in shops) {
            for (let slot = 0; slot < 8; ++slot) {
                const slotName = `shopslot[${name}/${slot}]`;
                const slotRef = shops[name][slot].ref;
                if (cache.hasChange(slotName)) {
                    const currItem = cache.get(slotName);
                    if (currItem in BUYABLE_ITEMS) {
                        const buyableRef = BUYABLE_ITEMS[currItem];
                        LogicCaller.setCollectible(`reach_location[${slotRef}]`, buyableRef);
                    } else {
                        LogicCaller.deleteCollectible(`reach_location[${slotRef}]`);
                    }
                }
            }
        }
    }
}

LogicCaller.registerAugment(augment);
