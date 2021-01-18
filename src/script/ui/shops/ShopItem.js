import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import StateDataEventManager from "/GameTrackerJS/ui/mixin/StateDataEventManager.js";
import ShopStates from "/script/state/shop/StateManager.js";
import Language from "/script/util/Language.js";
import ShopItemChoiceDialog from "./ShopItemChoiceDialog.js";
import iOSTouchHandler from "/script/util/iOSTouchHandler.js";

const TPL = new Template(`
<div id="image"></div>
<div id="title"></div>
<div id="info">
    <input id="name" placeholder="you" autocomplete="off">
    <div id="price"></div>
</div>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
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
#price:after {
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

export default class HTMLTrackerShopItem extends StateDataEventManager(HTMLElement) {
    
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("item", event => {
            const titleEl = this.shadowRoot.getElementById("title");
            if (titleEl != null) {
                titleEl.innerHTML = Language.translate(event.data);
            }
            const state = this.getState();
            const imageEl = this.shadowRoot.getElementById("image");
            if (imageEl != null) {
                imageEl.style.backgroundImage = `url("${state.icon}")`;
            }
            // mark
            const mark = state.mark;
            if (mark) {
                if (typeof mark == "string") {
                    this.dataset.mark = mark;
                } else {
                    this.dataset.mark = "";
                }
            } else {
                delete document.body.dataset.mark;
            }
        });
        this.registerStateHandler("bought", event => {
            const state = this.getState();
            const imageEl = this.shadowRoot.getElementById("image");
            if (imageEl != null) {
                imageEl.style.backgroundImage = `url("${state.icon}")`;
            }
        });
        this.registerStateHandler("price", event => {
            const priceEl = this.shadowRoot.getElementById("price");
            if (priceEl != null) {
                priceEl.innerHTML = event.data;
            }
        });
        this.registerStateHandler("name", event => {
            const nameEl = this.shadowRoot.getElementById("name");
            if (nameEl != null) {
                nameEl.value = event.data;
            }
        });

        /* mouse events */
        this.addEventListener("click", event => {
            const state = this.getState();
            if (state != null) {
                state.bought = !state.bought;
            }
            event.preventDefault();
            event.stopPropagation();
            return false;
        });
        this.addEventListener("contextmenu", event => {
            this./*#*/__editItem();
            event.preventDefault();
            event.stopPropagation();
            return false;
        });
        const nameEl = this.shadowRoot.getElementById("name");
        nameEl.addEventListener("change", event => {
            const state = this.getState();
            if (state != null) {
                state.name = event.target.value;
            }
        });
        nameEl.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            return false;
        });

        /* fck iOS */
        iOSTouchHandler.register(this);
    }

    applyDefaultValues() {
        // title
        const titleEl = this.shadowRoot.getElementById("title");
        if (titleEl != null) {
            titleEl.innerHTML = "???";
        }
        // image
        const imageEl = this.shadowRoot.getElementById("image");
        if (imageEl != null) {
            imageEl.style.backgroundImage = `url("/images/items/sold_out.png")`;
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
                titleEl.innerHTML = Language.translate(state.item);
            }
            // image
            const imageEl = this.shadowRoot.getElementById("image");
            if (imageEl != null) {
                imageEl.style.backgroundImage = `url("${state.icon}")`;
            }
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
            // mark
            const mark = state.mark;
            if (mark) {
                if (typeof mark == "string") {
                    this.dataset.mark = mark;
                } else {
                    this.dataset.mark = "";
                }
            } else {
                delete document.body.dataset.mark;
            }
        }
    }

    /*#*/__editItem(event) {
        const state = this.getState();
        if (state != null) {
            const d = new ShopItemChoiceDialog(Language.translate(this.ref));
            d.value = state.item;
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

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    static get observedAttributes() {
        return ['ref'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            const state = ShopStates.get(this.ref);
            this.switchState(state);
        }
    }

}

customElements.define('ootrt-shopitem', HTMLTrackerShopItem);
