import FileData from "/emcJS/data/FileData.js";
//import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
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

export default class HTMLTrackerShopList extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        //this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const shops = FileData.get("shops");
        for (const i in shops) {
            const el = document.createElement("ootrt-shopfield");
            el.ref = i;
            this.shadowRoot.append(el);
        }
    }

}

customElements.define('ootrt-shoplist', HTMLTrackerShopList);
