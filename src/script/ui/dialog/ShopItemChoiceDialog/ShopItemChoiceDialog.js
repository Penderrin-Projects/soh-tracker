// frameworks
import HTMLTemplate from "/emcJS/util/html/template/HTMLTemplate.js";
import CSSTemplate from "/emcJS/util/html/template/CSSTemplate.js";
import Window from "/emcJS/ui/overlay/window/Window.js";

// GameTrackerJS
import Language from "/GameTrackerJS/util/Language.js";
// Track-OOT
import ShopItemsResource from "/script/resource/ShopItemsResource.js";
import "./components/ShopEditItem.js";

// TODO use TabPanel

const TPL = new HTMLTemplate(`
<div id="categories">
</div>
<div class="panel" id="panel_about">
</div>
<div id="footer">
    <input id="price" type="number" min-value="0" max-value="1">
    <div id="rupee"></div>
    <button id="submit" title="submit">
        submit
    </button>
    <button id="cancel" title="cancel">
        cancel
    </button>
</div>
`);

const STYLE = new CSSTemplate(`
#footer,
#submit,
#cancel {
    display: flex;
}
#categories {
    display: flex;
    flex-shrink: 0;
    padding: 4px 3px 0;
    overflow-x: auto;
    overflow-y: hidden;
    border-bottom-style: solid;
    border-bottom-width: var(--tabpanel-categories-border-width, 2px);
    border-bottom-color: var(--tabpanel-categories-border-color, #222222);
    user-select: none;
}
.category {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 2em;
    padding: 0px 4px;
    margin: 0 1px;
    color: var(--button-text-color, #000000);
    background-color: var(--button-back-color, #eaeaea);
    background-image: var(--button-back-image, none);
    border-style: solid;
    border-width: var(--button-border-width, 2px);
    border-color: var(--button-border-color, #222222);
    border-radius: var(--button-border-radius, 6px) var(--button-border-radius, 6px) 0 0;
    border-bottom-style: none;
    appearance: none;
    font-size: 1em;
    font-weight: bold;
    line-height: 1em;
    white-space: pre;
    word-break: keep-all;
    cursor: pointer;
}
.category:hover {
    color: var(--button-hover-text-color, #ffffff);
    background-color: var(--button-hover-back-color, #353935);
    background-image: var(--button-hover-back-image, none);
    border-color: var(--button-hover-border-color, #222222);
}
.category.active {
    color: var(--button-active-text-color, #ffffff);
    background-color: var(--button-active-back-color, #222222);
    background-image: var(--button-active-back-image, none);
    border-color: var(--button-active-border-color, #222222);
    cursor: default;
    pointer-events: none;
}
.panel {
    display: none;
    word-wrap: break-word;
    resize: none;
}
.panel.active {
    display: block;
}
#footer {
    height: 50px;
    padding: 10px 30px 10px;
    justify-content: flex-end;
    border-top: solid 2px #cccccc;
}
#price {
    width: 60px;
    text-align: right;
}
#price[readonly] {
    box-shadow: none;
}
#rupee::after {
    display: inline-block;
    width: 28px;
    height: 28px;
    margin-left: 5px;
    background-image: url('/images/items/rupees.png');
    background-size: 20px;
    background-position: left center;
    background-repeat: no-repeat;
    content: " ";
}
#submit,
#cancel {
    align-items: center;
    justify-content: center;
    margin-left: 10px;
    padding: 5px;
    color: var(--button-text-color, #000000);
    background-color: var(--button-back-color, #eaeaea);
    border-style: solid;
    border-width: var(--button-border-width, 2px);
    border-color: var(--button-border-color, #222222);
    border-radius: var(--button-border-radius, 6px);
    font-weight: 900;
    text-transform: uppercase;
    cursor: pointer;
    user-select: none;
    appearance: none;
}
#submit:hover,
#cancel:hover {
    color: var(--button-hover-text-color, #ffffff);
    background-color: var(--button-hover-back-color, #353935);
    border-color: var(--button-hover-border-color, #222222);
}
ootrt-shopedititem {
    box-shadow: 0 0 2px 2px white;
}
ootrt-shopedititem.active {
    box-shadow: 0 0 2px 2px red;
}
`);

const Q_TAB = [
    "button:not([tabindex=\"-1\"])",
    "[href]:not([tabindex=\"-1\"])",
    "input:not([tabindex=\"-1\"])",
    "select:not([tabindex=\"-1\"])",
    "textarea:not([tabindex=\"-1\"])",
    "[tabindex]:not([tabindex=\"-1\"])"
].join(",");

export default class HTMLTrackerShopItemChoice extends Window {

    #currentTargetCategory = null;

    constructor(title = "Item Choice", options = {}) {
        super(title, options.close);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const window = this.shadowRoot.getElementById("window");
        this.shadowRoot.getElementById("body").innerHTML = "";
        this.shadowRoot.getElementById("body").append(els.getElementById("panel_about"));
        const ctgrs = els.getElementById("categories");
        window.insertBefore(ctgrs, this.shadowRoot.getElementById("body"));
        window.append(els.getElementById("footer"));

        ctgrs.onclick = (event) => {
            const t = event.target.getAttribute("target");
            if (t) {
                this.active = t;
                event.preventDefault();
                return false;
            }
        };

        const sbm = this.shadowRoot.getElementById("submit");
        if (!!options.submit && typeof options.submit === "string") {
            sbm.innerHTML = options.submit;
            sbm.setAttribute("title", options.submit);
        }
        sbm.onclick = () => {
            this.#settingsSubmit();
        };

        const ccl = this.shadowRoot.getElementById("cancel");
        if (!!options.cancel && typeof options.cancel === "string") {
            ccl.innerHTML = options.cancel;
            ccl.setAttribute("title", options.cancel);
        }
        ccl.onclick = () => this.close();

        const items = ShopItemsResource.get();
        for (const item in items) {
            const values = items[item];
            if (values.visible == null || values.visible === true) {
                this.setTab(Language.generateLabel(values.category), values.category);
                this.addItem(values.category, item, values.price || "???");
            }
        }
    }

    get active() {
        return this.getAttribute("active");
    }

    set active(val) {
        this.setAttribute("active", val);
    }

    get item() {
        return this.getAttribute("item");
    }

    set item(val) {
        this.setAttribute("item", val);
    }

    get price() {
        return this.getAttribute("price");
    }

    set price(val) {
        this.setAttribute("price", val);
    }

    static get observedAttributes() {
        return ["active", "item", "price"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "active":
                if (oldValue != newValue) {
                    const ol = this.shadowRoot.getElementById(`panel_${oldValue}`);
                    if (ol != null) {
                        ol.classList.remove("active");
                    }
                    const ob = this.shadowRoot.querySelector(`[target="${oldValue}"]`);
                    if (ob != null) {
                        ob.classList.remove("active");
                    }
                    const nl = this.shadowRoot.getElementById(`panel_${newValue}`);
                    if (nl != null) {
                        nl.classList.add("active");
                    }
                    const nb = this.shadowRoot.querySelector(`[target="${newValue}"]`);
                    if (nb != null) {
                        nb.classList.add("active");
                    }
                }
                break;
            case "item":
                if (oldValue != newValue) {
                    const ol = this.shadowRoot.querySelector(`ootrt-shopedititem[ref="${oldValue}"]`);
                    if (ol != null) {
                        ol.classList.remove("active");
                    }
                    const nl = this.shadowRoot.querySelector(`ootrt-shopedititem[ref="${newValue}"]`);
                    if (nl != null) {
                        nl.classList.add("active");
                        // category
                        const parent = nl.parentElement;
                        if (parent != null) {
                            const category = parent.dataset.ref;
                            this.active = category;
                            this.#currentTargetCategory = category;
                        } else {
                            this.active = "";
                            this.#currentTargetCategory = "";
                        }
                        // price
                        const priceEl = this.shadowRoot.getElementById("price");
                        if (!isNaN(parseInt(nl.price))) {
                            priceEl.value = nl.price;
                            priceEl.readOnly = true;
                        } else {
                            priceEl.value = 0;
                            priceEl.readOnly = false;
                        }
                    }
                }
                break;
            case "price":
                if (oldValue != newValue) {
                    const priceEl = this.shadowRoot.getElementById("price");
                    const newPrice = parseInt(newValue);
                    priceEl.value = isNaN(newPrice) ? 0 : newPrice;
                }
                break;
        }
    }

    show(category = "") {
        super.show();
        if (category) {
            this.active = category;
        } else if (this.#currentTargetCategory) {
            this.active = this.#currentTargetCategory;
        } else if (!this.active) {
            const ctg = this.shadowRoot.getElementById("categories").children;
            if (ctg.length) {
                this.active = ctg[0].getAttribute("target");
            }
        }
    }

    initialFocus() {
        const a = Array.from(this.querySelectorAll(Q_TAB));
        a.push(this.shadowRoot.getElementById("submit"));
        a.push(this.shadowRoot.getElementById("cancel"));
        a.push(this.shadowRoot.getElementById("close"));
        a[0].focus();
    }

    focusFirst() {
        const a = Array.from(this.querySelectorAll(Q_TAB));
        a.push(this.shadowRoot.getElementById("submit"));
        a.push(this.shadowRoot.getElementById("cancel"));
        a.unshift(this.shadowRoot.getElementById("close"));
        a[0].focus();
    }

    focusLast() {
        const a = Array.from(this.querySelectorAll(Q_TAB));
        a.push(this.shadowRoot.getElementById("submit"));
        a.push(this.shadowRoot.getElementById("cancel"));
        a.unshift(this.shadowRoot.getElementById("close"));
        a[a.length - 1].focus();
    }

    setTab(title, id) {
        if (!this.shadowRoot.getElementById(`panel_${id}`)) {
            const pnl = document.createElement("div");
            pnl.className = "panel";
            pnl.id = `panel_${id}`;
            pnl.dataset.ref = id;
            this.shadowRoot.getElementById("body").append(pnl);
            const cb = document.createElement("div");
            cb.className = "category";
            cb.setAttribute("target", id);
            if (title instanceof HTMLElement) {
                cb.append(title);
            } else if (typeof title === "string") {
                cb.innerHTML = title;
            }
            const cbt = this.shadowRoot.getElementById("categories");
            cbt.append(cb);
        }
    }

    addItem(category, ref, price) {
        const item = document.createElement("ootrt-shopedititem");
        item.ref = ref;
        item.price = price;
        item.onclick = (event) => {
            this.#clickItem(event);
        };
        this.shadowRoot.getElementById(`panel_${category}`).append(item);
    }

    #clickItem(event) {
        const el = event.target;
        this.item = el.ref;
    }

    async #settingsSubmit() {
        if (this.item == "unknown") {
            this.remove();
        } else {
            const ev = new Event("submit");
            const priceEl = this.shadowRoot.getElementById("price");
            const el = this.shadowRoot.querySelector(`ootrt-shopedititem[ref="${this.item}"]`);
            if (el) {
                ev.item = el.ref;
                if (!isNaN(parseInt(el.price))) {
                    ev.price = el.price;
                } else {
                    ev.price = priceEl.value;
                }
                this.dispatchEvent(ev);
                this.remove();
            }
        }
    }

}

customElements.define("ootrt-shopitemchoice", HTMLTrackerShopItemChoice);
