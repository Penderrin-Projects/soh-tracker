// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/CustomElement.js";
import UIEventBusMixin from "/emcJS/event/ui/EventBusMixin.js";


// GameTrackerJS
import Language from "/GameTrackerJS/util/Language.js";
// Track-OOT
import "./ShopItem.js";

const TPL = new Template(`
<div id="title">
    <span id="title-text"></span>
</div>
<div id="body">
    <ootrt-shopitem id="slot0"></ootrt-shopitem>
    <ootrt-shopitem id="slot1"></ootrt-shopitem>
    <ootrt-shopitem id="slot2"></ootrt-shopitem>
    <ootrt-shopitem id="slot3"></ootrt-shopitem>
    <ootrt-shopitem id="slot4"></ootrt-shopitem>
    <ootrt-shopitem id="slot5"></ootrt-shopitem>
    <ootrt-shopitem id="slot6"></ootrt-shopitem>
    <ootrt-shopitem id="slot7"></ootrt-shopitem>
</div>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: inline-block;
    padding: 10px;
    margin: 5px;
    background-color: #222222;
}
#title {
    display: flex;
    align-items: center;
    height: 30px;
}
#body {
    display: grid;
    grid-template-columns: auto auto auto auto;
    grid-template-rows: auto auto;
}
`);

export default class HTMLTrackerShopField extends UIEventBusMixin(CustomElement) {
    
    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
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
            const title = this.shadowRoot.getElementById("title-text");
            Language.applyLabel(title, newValue);
            for (let i = 0; i < 8; ++i) {
                const el = this.shadowRoot.getElementById(`slot${i}`);
                el.ref = `${newValue}/${i}`;
            }
        }
    }

}

customElements.define("ootrt-shopfield", HTMLTrackerShopField);
