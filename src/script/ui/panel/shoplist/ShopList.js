// frameworks
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import Panel from "/emcJS/ui/layout/Panel.js";

// Track-OOT
import ShopsResource from "/script/resource/ShopsResource.js";
import "./components/ShopField.js";

const STYLE = new GlobalStyle(`
:host {
    display: inline-block;
    padding: 20px;
}
`);

export default class ShopList extends Panel {

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const shops = ShopsResource.get();
        for (const i in shops) {
            const el = document.createElement("ootrt-shopfield");
            el.ref = i;
            this.shadowRoot.append(el);
        }
    }

}

Panel.registerReference("shoplist", ShopList);
customElements.define("ootrt-shoplist", ShopList);
