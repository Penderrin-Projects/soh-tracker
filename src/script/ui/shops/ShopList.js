// frameworks
//import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/CustomElement.js";

// Track-OOT
import ShopsResource from "/script/resource/ShopsResource.js";
import "./ShopField.js";

//const TPL = new Template(``);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: inline-block;
    padding: 20px;
}
`);

export default class HTMLTrackerShopList extends CustomElement {

    constructor() {
        super();
        //this.shadowRoot.append(TPL.generate());
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

customElements.define("ootrt-shoplist", HTMLTrackerShopList);
