import Panel from "/emcJS/ui/layout/Panel.js";

import TPL from "./APTextClient.js.html" assert {type: "html"};
import STYLE from "./APTextClient.js.css" assert {type: "css"};

// TODO
// text client with filter options (command list cache)
// show hints as sortable filterable grid
// add hint item function through clicking the desired icons (generate text user needs to send)
// add hint location function through clicking the desired locations (generate text user needs to send)

class APTextClient extends Panel {

    #apTabsEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#apTabsEl = this.shadowRoot.getElementById("ap-tabs");
    }

    switchToApLog() {
        this.#apTabsEl.active = "ap-log";
    }

    switchToHints() {
        this.#apTabsEl.active = "hints";
    }

}

Panel.registerReference("ap-text-client", APTextClient);
customElements.define("ootrt-aptextclient", APTextClient);
