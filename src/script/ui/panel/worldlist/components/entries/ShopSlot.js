// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import "/emcJS/ui/LabeledIcon.js";

// GameTrackerJS
import OptionsObserver from "/GameTrackerJS/util/observer/OptionsObserver.js";
import ItemStateManager from "/GameTrackerJS/state/item/StateManager.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import WorldListMarkedEntry from "/GameTrackerJS/ui/panel/worldlist/components/abstract/WorldListMarkedEntry.js";
// Track-OOT
import ShopSlotContextMenu from "../../../../ctxmenu/ShopSlotContextMenu.js";
import ShopItemChoiceDialog from "../../../../shops/ShopItemChoiceDialog.js";

const TPL = new Template(`
<emc-labeledicon id="item" halign="center" valign="center"></emc-labeledicon>
`);

const STYLE = new GlobalStyle(`
#item {
    width: 32px;
    height: 32px;
    margin-left: 5px;
    font-size: 0.7em;
}
`);

function applyElements(target) {
    const textEl = target.getElementById("text");
    const tpl = TPL.generate();
    const itemEl = tpl.getElementById("item");
    textEl.insertAdjacentElement("afterend", itemEl);
}

const shopsanityObserver = new OptionsObserver("option.shopsanity");

export default class ListShopSlot extends WorldListMarkedEntry {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        badgeEl.hideValues = true;
        /* item */
        const itemEl = this.shadowRoot.getElementById("item");
        itemEl.valign = "end";
        itemEl.halign = "end";
        /* observer */
        shopsanityObserver.addEventListener("change", () => {
            const state = this.getState();
            this.applyItem(state?.itemData);
        });
        /* state handler */
        this.registerStateHandler("item", () => {
            const state = this.getState();
            this.applyItem(state?.itemData);
        });
        this.registerStateHandler("bought", () => {
            const state = this.getState();
            this.applyItem(state?.itemData);
        });
        this.registerStateHandler("price", () => {
            const state = this.getState();
            this.applyItem(state?.itemData);
        });
        /* context menu */
        this.setDefaultContextMenu(ShopSlotContextMenu);
        this.addDefaultContextMenuHandler("check", event => {
            const state = this.getState();
            if (state != null) {
                state.value = true;
            }
        });
        this.addDefaultContextMenuHandler("uncheck", event => {
            const state = this.getState();
            if (state != null) {
                state.value = false;
            }
        });
        this.addDefaultContextMenuHandler("associate", event => {
            this./*#*/__editItem();
        });
        this.addDefaultContextMenuHandler("junk", event => {
            const state = this.getState();
            if (state != null) {
                state.item = "item.refill_item";
                state.price = "0";
                state.value = true;
            }
        });
        this.addDefaultContextMenuHandler("disassociate", event => {
            const state = this.getState();
            if (state != null) {
                state.reset();
            }
        });
    }

    clickHandler(event) {
        const state = this.getState();
        if (state != null) {
            if (event.ctrlKey) {
                if (state.item != "item.refill_item") {
                    state.item = "item.refill_item";
                    state.price = "0";
                    state.value = true;
                } else {
                    state.reset();
                }
            } else {
                if (state.isDefault()) {
                    this./*#*/__editItem();
                } else {
                    super.clickHandler(event);
                }
            }
        }
    }

    applyDefaultValues() {
        super.applyDefaultValues("images/icons/shops.svg");
        this.applyItem();
    }

    applyStateValues(state) {
        super.applyStateValues(state, "images/icons/shops.svg");
        this.applyItem(state.itemData);
    }

    applyItem(itemData) {
        const itemEl = this.shadowRoot.getElementById("item");
        if (itemEl != null) {
            if (itemData != null) {
                itemEl.src = itemData?.image ?? "/images/items/unknown.png";
                itemEl.text = itemData?.price ?? "?";
            } else {
                itemEl.src = "/images/items/unknown.png";
                itemEl.text = "?";
            }
        }
    }

    /*#*/__editItem() {
        const state = this.getState();
        if (state != null) {
            const d = new ShopItemChoiceDialog(this.ref);
            d.item = state.item;
            d.price = state.price;
            d.addEventListener("submit", function(result) {
                if (result) {
                    const state = this.getState();
                    if (state != null) {
                        state.item = result.item;
                        state.price = result.price;
                    }
                }
            }.bind(this));
            d.show();
        }
    }

    get textRef() {
        return `location/${super.textRef}`;
    }

    get category() {
        return "location";
    }

}

customElements.define("ootrt-worldlist-shopslot", ListShopSlot);
UIRegistry.get("worldlist-location")
    .register("shopslot", ListShopSlot);
