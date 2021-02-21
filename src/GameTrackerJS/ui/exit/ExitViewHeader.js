/* asym-import: off */
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
//import SearchAnd from "/emcJS/util/search/SearchAnd.js";
/* asym-import: on */

const TPL = new Template(`
<div id="types">
    <emc-input-wrapper>
        <button type="">
            <emc-i18n-label i18n-key="exit.type.all" i18n-value="All"></emc-i18n-label>
        </button>
    </emc-input-wrapper>
</div>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {

}
#types {
    flex-shrink: 0;
    padding: 5px;
    overflow-x: auto;
    overflow-y: none;
    border-bottom: solid 2px #cccccc;
}
`);

export default class ExitViewHeader extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const typesEl = this.shadowRoot.getElementById("types");
        typesEl.onclick = (event) => {
            const type = event.target.getAttribute("type");
            if (type != null) {
                this.type = type;
                event.preventDefault();
                return false;
            }
        }
    }

    get type() {
        return this.getAttribute("type");
    }

    set type(val) {
        this.setAttribute("type", val);
    }

    static get observedAttributes() {
        return ["type"];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "type": {
                    const ol = this.shadowRoot.querySelector(`[type="${oldValue}"]`);
                    if (ol != null) {
                        ol.classList.remove("active");
                    }
                    const nl = this.shadowRoot.querySelector(`[type="${newValue}"]`);
                    if (nl != null) {
                        nl.classList.add("active");
                    }
                    const ev = new Event("type");
                    ev.data = newValue;
                    this.dispatchEvent(ev);
                } break;
            }
        }
    }

    addType(name, key, value) {
        const typesEl = this.shadowRoot.getElementById("types");
        const el = createTypeButton(name, key, value);
        typesEl.append(el);
    }

}

customElements.define("gt-exitview-header", ExitViewHeader);

function createTypeButton(type, key, value) {
    const label = document.createElement("emc-i18n-label");
    if (key != null) {
        label.setAttribute("i18n-key", key);
    } else {
        label.setAttribute("i18n-key", type);
    }
    if (value != null) {
        label.setAttribute("i18n-value", value);
    }
    // ---
    const button = document.createElement("button");
    button.setAttribute("type", type);
    button.append(label);
    // ---
    const wrapper = document.createElement("emc-input-wrapper");
    wrapper.append(button);
    return wrapper;
}
