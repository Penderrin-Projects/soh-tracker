// frameworks
import Template from "/emcJS/util/html/Template.js";
import CustomElement from "/emcJS/ui/element/CustomElement.js";

// GameTrackerJS
import Language from "/GameTrackerJS/util/Language.js";
// Track-OOT
import ShopItemsResource from "/script/resource/ShopItemsResource.js";

const TPL = new Template(`
    <style>
        :host {
            display: inline-flex;
            flex-direction: column;
            width: 220px;
            height: 120px;
            padding: 10px;
            margin: 5px;
            color: white;
            background-color: black;
            cursor: pointer;
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
        #price {
            height: 10px;
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
    </style>
    <div id="image"></div>
    <div id="title"></div>
    <div id="price"></div>
`);

export default class HTMLTrackerShopEditItem extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get price() {
        return this.getAttribute("price");
    }

    set price(val) {
        this.setAttribute("price", val);
    }

    get checked() {
        return this.getAttribute("checked");
    }

    set checked(val) {
        this.setAttribute("checked", val);
    }

    static get observedAttributes() {
        return ["ref", "price", "checked"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "ref":
                if (oldValue != newValue) {
                    Language.applyLabel(this.shadowRoot.getElementById("title"), `item[${newValue}]`);
                    if (!!this.checked && this.checked == "true") {
                        this.shadowRoot.getElementById("image").style.backgroundImage = `url("/images/items/sold_out.png")`;
                    } else {
                        const shop_item = ShopItemsResource.get(this.ref);
                        this.shadowRoot.getElementById("image").style.backgroundImage = `url("${shop_item.image}")`;
                    }
                }
                break;
            case "price":
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("price").innerHTML = newValue;
                }
                break;
            case "checked":
                if (oldValue != newValue) {
                    if (!!this.checked && this.checked == "true") {
                        this.shadowRoot.getElementById("image").style.backgroundImage = `url("/images/items/sold_out.png")`;
                    } else {
                        const shop_item = ShopItemsResource.get(this.ref);
                        this.shadowRoot.getElementById("image").style.backgroundImage = `url("${shop_item.image}")`;
                    }
                }
                break;
        }
    }

}

customElements.define("ootrt-shopedititem", HTMLTrackerShopEditItem);
