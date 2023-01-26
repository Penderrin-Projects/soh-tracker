// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/element/CustomElement.js";
import ContextMenuManagerMixin from "/emcJS/ui/mixin/ContextMenuManagerMixin.js";

// GameTrackerJS
import OptionsObserver from "/GameTrackerJS/util/observer/OptionsObserver.js";
import StateDataEventManagerMixin from "/GameTrackerJS/ui/mixin/StateDataEventManagerMixin.js";
import Language from "/GameTrackerJS/util/Language.js";
// Track-OOT
import ShopItemChoiceDialog from "/script/ui/dialog/ShipItemChoiceDialog/ShopItemChoiceDialog.js";
import ShopSlotContextMenu from "/script/ui/ctxmenu/ShopSlotContextMenu.js";
import ShopStates from "/script/state/shop/ShopStateManager.js";

const TPL = new Template(`
<div id="image"></div>
<div id="title"></div>
<div id="info">
    <input id="name" placeholder="you" autocomplete="off">
    <div id="price"></div>
</div>
`);

const STYLE = new GlobalStyle(`
:host {
    display: inline-flex;
    flex-direction: column;
    width: 200px;
    height: 150px;
    padding: 10px;
    margin: 5px;
    color: white;
    background-color: black;
    cursor: pointer;
}
:host([data-mark]) {
    --shop-item-color-border: rgb(99 99 99);
    --shop-item-color-back: rgb(99 99 99 / 0.2);
    background-color: var(--shop-item-color-back, rgb(99 99 99 / 0.2));
    box-shadow:
        var(--shop-item-color-border, rgb(99 99 99)) 0px 0px 2px 2px inset,
        var(--shop-item-color-border, rgb(99 99 99)) 0px 0px 2px 1px;
}
:host([data-mark="red"]) {
    --shop-item-color-border: rgb(109 0 36);
    --shop-item-color-back: rgb(109 0 36 / 0.2);
}
:host([data-mark="green"]) {
    --shop-item-color-border: rgb(9 82 3);
    --shop-item-color-back: rgb(9 82 3 / 0.2);
}
:host([data-mark="turquoise"]) {
    --shop-item-color-border: rgb(51 129 136);
    --shop-item-color-back: rgb(51 129 136 / 0.2);
}
:host([data-mark="silver"]) {
    --shop-item-color-border: rgb(204 212 226);
    --shop-item-color-back: rgb(204 212 226 / 0.2);
}
:host([data-mark="gold"]) {
    --shop-item-color-border: rgb(203 156 61);
    --shop-item-color-back: rgb(203 156 61 / 0.2);
}
#image {
    height: 40px;
    margin-bottom: 5px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    background-origin: content-box;
}
#title {
    flex: 1;
}
#info {
    display: flex;
    align-items: center;
    height: 28px;
}
#name {
    width: 120px;
    height: 100%;
    background-color: #2b2b2b;
    color: white;
    border: solid 1px #929292;
    padding: 2px;
}
#price {
    flex: 1;
    text-align: right;
}
#price::after {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-left: 5px;
    background-image: url('/images/items/rupees.png');
    background-size: 14px;
    background-position: center;
    background-repeat: no-repeat;
    content: " ";
}
`);

const shopsanityObserver = new OptionsObserver("shopsanity");
const SHOP_SLOT_IDS = [
    "left/top-left",
    "left/top-right",
    "right/top-left",
    "right/top-right",
    "left/bottom-left",
    "left/bottom-right",
    "right/bottom-left",
    "right/bottom-right"
];

function getIcon(itemData, bought) {
    if (itemData == null) {
        return "/images/items/unknown.png";
    }
    if (itemData.refill) {
        return itemData.image;
    }
    if (bought) {
        return "/images/items/sold_out.png";
    }
    return itemData.image ?? "/images/items/unknown.png";
}

function getDialogTitle(ref) {
    const [shopRef, slotRef] = ref.split("/");
    const shopTitleEl = Language.generateLabel(shopRef);
    const slotTitleEl = Language.generateLabel(SHOP_SLOT_IDS[slotRef]);
    const titleEl = document.createElement("span");
    titleEl.append(shopTitleEl);
    titleEl.append(document.createTextNode(" "));
    titleEl.append(slotTitleEl);
    return titleEl;
}

export default class HTMLTrackerShopItem extends ContextMenuManagerMixin(StateDataEventManagerMixin(CustomElement)) {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        shopsanityObserver.addEventListener("change", () => {
            const state = this.getState();
            if (state != null) {
                // title
                const titleEl = this.shadowRoot.getElementById("title");
                if (titleEl != null) {
                    Language.applyLabel(titleEl, `item[${state.item}]`);
                }
                // cost
                const priceEl = this.shadowRoot.getElementById("price");
                if (priceEl != null) {
                    priceEl.innerHTML = state.price;
                }
            }
            this.#applyItem();
        });
        this.registerStateHandler("item", (event) => {
            const titleEl = this.shadowRoot.getElementById("title");
            if (titleEl != null) {
                Language.applyLabel(titleEl, `item[${event.value}]`);
            }
            this.#applyItem();
        });
        this.registerStateHandler("bought", () => {
            this.#applyItem();
        });
        this.registerStateHandler("price", (event) => {
            const priceEl = this.shadowRoot.getElementById("price");
            if (priceEl != null) {
                priceEl.innerHTML = event.value;
            }
        });
        this.registerStateHandler("name", (event) => {
            const nameEl = this.shadowRoot.getElementById("name");
            if (nameEl != null) {
                nameEl.value = event.value;
            }
        });

        /* context menu */
        this.setDefaultContextMenu(ShopSlotContextMenu);
        this.addDefaultContextMenuHandler("check", () => {
            const state = this.getState();
            if (state != null) {
                state.value = true;
            }
        });
        this.addDefaultContextMenuHandler("uncheck", () => {
            const state = this.getState();
            if (state != null) {
                state.value = false;
            }
        });
        this.addDefaultContextMenuHandler("associate", () => {
            this.#editItem();
        });
        this.addDefaultContextMenuHandler("junk", () => {
            const state = this.getState();
            if (state != null) {
                state.item = "refill_item";
                state.price = "0";
                state.value = true;
            }
        });
        this.addDefaultContextMenuHandler("disassociate", () => {
            const state = this.getState();
            if (state != null) {
                state.reset();
            }
        });

        /* mouse events */
        this.addEventListener("click", (event) => {
            const state = this.getState();
            if (state != null) {
                if (event.ctrlKey) {
                    if (state.item != "refill_item") {
                        state.item = "refill_item";
                        state.price = "0";
                        state.value = true;
                    } else {
                        state.reset();
                    }
                } else if (state.isDefault()) {
                    this.#editItem();
                } else {
                    state.bought = !state.bought;
                }
            }
            /* --- */
            event.preventDefault();
            event.stopPropagation();
            return false;
        });

        /* mouse events */
        this.addEventListener("contextmenu", (event) => {
            this.showDefaultContextMenu(event);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        const nameEl = this.shadowRoot.getElementById("name");
        nameEl.addEventListener("change", (event) => {
            const state = this.getState();
            if (state != null) {
                state.name = event.target.value;
            }
        });
        nameEl.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            return false;
        });
    }

    applyDefaultValues() {
        // title
        const titleEl = this.shadowRoot.getElementById("title");
        if (titleEl != null) {
            Language.applyLabel(titleEl, "???");
        }
        // image
        const imageEl = this.shadowRoot.getElementById("image");
        if (imageEl != null) {
            imageEl.style.backgroundImage = `url("/images/items/unknown.png")`;
        }
        // cost
        const priceEl = this.shadowRoot.getElementById("price");
        if (priceEl != null) {
            priceEl.innerHTML = "0";
        }
        // name
        const nameEl = this.shadowRoot.getElementById("name");
        if (nameEl != null) {
            nameEl.value = "";
        }
        // mark
        delete document.body.dataset.mark;
    }

    applyStateValues(state) {
        if (state != null) {
            // title
            const titleEl = this.shadowRoot.getElementById("title");
            if (titleEl != null) {
                Language.applyLabel(titleEl, `item[${state.item}]`);
            }
            // item
            this.#applyItem();
            // cost
            const priceEl = this.shadowRoot.getElementById("price");
            if (priceEl != null) {
                priceEl.innerHTML = state.price;
            }
            // name
            const nameEl = this.shadowRoot.getElementById("name");
            if (nameEl != null) {
                nameEl.value = state.name;
            }
        }
    }

    #applyItem() {
        const state = this.getState();
        const imageEl = this.shadowRoot.getElementById("image");
        const itemData = state?.itemData;
        if (itemData != null) {
            // icon
            if (imageEl != null) {
                const icon = getIcon(itemData, state.bought);
                imageEl.style.backgroundImage = `url("${icon}")`;
            }
            // mark
            const mark = itemData.mark;
            if (typeof mark == "string") {
                this.dataset.mark = mark;
            } else {
                this.dataset.mark = "";
            }
        } else {
            // icon
            if (imageEl != null) {
                imageEl.style.backgroundImage = `url("/images/items/unknown.png")`;
            }
            // mark
            this.dataset.mark = "";
        }
    }

    #editItem() {
        const state = this.getState();
        if (state != null) {
            const d = new ShopItemChoiceDialog(getDialogTitle(this.ref));
            d.item = state.item;
            d.price = state.price;
            d.addEventListener("submit", (result) => {
                if (result) {
                    const state = this.getState();
                    if (state != null) {
                        state.item = result.item;
                        state.price = result.price;
                    }
                }
            });
            d.show();
        }
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    static get observedAttributes() {
        return ["ref"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            const state = ShopStates.get(this.ref);
            this.switchState(state);
        }
    }

}

customElements.define("ootrt-shopitem", HTMLTrackerShopItem);
