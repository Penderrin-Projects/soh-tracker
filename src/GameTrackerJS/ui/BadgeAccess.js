// frameworks
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";

import SettingsSpy from "../util/spy/SettingsSpy.js";
import Badge from "./Badge.js";

const accessValuesSpy = new SettingsSpy("show_access_values");

const TPL = new Template(`
<div id="access-values">
    <div id="available">0</div>
    <div id="unopened">0</div>
</div>
`);

const STYLE = new GlobalStyle(`
#access-values {
    display: flex;
    flex-direction: column;
    width: 24px;
    height: 24px;
    margin: 1px;
}
#access-values div {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 24px;
    height: 12px;
    font-size: 0.5em;
    line-height: 1em;
    padding: 5px;
}
`);

export default class BadgeAccess extends Badge {

    constructor() {
        super();
        this.shadowRoot.prepend(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const accessValuesEl = this.shadowRoot.getElementById("access-values");
        accessValuesEl.style.display = accessValuesSpy.getValue() ? "" : "none";
        this.switchTarget("accessValues", accessValuesSpy);
        this.setTargetEventListener("accessValues", "change", event => {
            if (accessValuesEl != null) {
                if (!!event.data) {
                    accessValuesEl.style.display = "";
                } else {
                    accessValuesEl.style.display = "none";
                }
            }
        });
    }

    get available() {
        return this.getAttribute("available");
    }

    set available(val) {
        this.setAttribute("available", val);
    }

    get unopened() {
        return this.getAttribute("unopened");
    }

    set unopened(val) {
        this.setAttribute("unopened", val);
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "available", "unopened"];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (oldValue != newValue) {
            switch (name) {
                case "available": {
                    const valueEl = this.shadowRoot.getElementById("available");
                    if (valueEl != null) {
                        const value = parseInt(newValue);
                        if (isNaN(value)) {
                            valueEl.innerHTML = 0;
                        } else {
                            valueEl.innerHTML = value;
                        }
                    }
                } break;
                case "unopened": {
                    const valueEl = this.shadowRoot.getElementById("unopened");
                    if (valueEl != null) {
                        const value = parseInt(newValue);
                        if (isNaN(value)) {
                            valueEl.innerHTML = 0;
                        } else {
                            valueEl.innerHTML = value;
                        }
                    }
                } break;
            }
        }
    }

}

customElements.define("gt-badge-access", BadgeAccess);
