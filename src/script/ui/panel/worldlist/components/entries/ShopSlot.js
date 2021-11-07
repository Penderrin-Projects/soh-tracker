// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import { mix } from "/emcJS/util/Mixin.js";
import "/emcJS/ui/LabeledIcon.js";

// GameTrackerJS
import OptionsObserver from "/GameTrackerJS/util/observer/OptionsObserver.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import WorldListElement from "/GameTrackerJS/ui/panel/worldlist/components/abstract/Element.js";
import AccessTextMarkerMixin from "/GameTrackerJS/ui/panel/worldlist/components/mixin/AccessTextMarkerMixin.js";
// Track-OOT
import ShopItemChoiceDialog from "/script/ui/dialog/ShipItemChoiceDialog/ShopItemChoiceDialog.js";
import ShopSlotContextMenu from "/script/ui/ctxmenu/ShopSlotContextMenu.js";

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

const BaseClass = mix(
    WorldListElement
).with(
    AccessTextMarkerMixin
);

// FIXME will not open binder on click

export default class ListShopSlot extends BaseClass {

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
            this./*#*/__applyItem(state?.itemData, state?.price);
        });
        /* state handler */
        this.registerStateHandler("item", () => {
            const state = this.getState();
            this./*#*/__applyItem(state?.itemData, state?.price);
        });
        this.registerStateHandler("bought", () => {
            const state = this.getState();
            this./*#*/__applyItem(state?.itemData, state?.price);
        });
        this.registerStateHandler("price", event => {
            const state = this.getState();
            this./*#*/__applyItem(state?.itemData, state?.price);
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
                state.item = "item[refill_item]";
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
                if (state.item != "item[refill_item]") {
                    state.item = "item[refill_item]";
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
        this./*#*/__applyItem();
    }

    applyStateValues(state) {
        super.applyStateValues(state, "images/icons/shops.svg");
        this./*#*/__applyItem(state.itemData, state.price);
    }

    /*#*/__applyItem(itemData, price) {
        const itemEl = this.shadowRoot.getElementById("item");
        if (itemEl != null) {
            if (itemData != null) {
                itemEl.src = itemData?.image ?? "/images/items/error.png";
                itemEl.text = price ?? "?";
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

    get category() {
        return "location";
    }

}

customElements.define("ootrt-worldlist-shopslot", ListShopSlot);
UIRegistry.get("worldlist-location")
    .register("shopslot", ListShopSlot);
