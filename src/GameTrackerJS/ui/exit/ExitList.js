/* asym-import: off */
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import SearchAnd from "/emcJS/util/search/SearchAnd.js";
import "/emcJS/ui/input/SearchField.js";
import "/emcJS/ui/input/TokenSelect.js";
import "/emcJS/ui/input/InputWrapper.js";
/* asym-import: on */
import WorldResource from "../../resource/WorldResource.js";
import WorldStateManager from "../../state/world/WorldStateManager.js";
import "../../state/world/exit/StateManager.js";
import "../../state/world/subexit/StateManager.js";
import Language from "../../util/Language.js";
import "./ExitChoice.js";

const TPL = new Template(`
<div id="searchbar">
    <emc-input-search id="search"></emc-input-search>
    <emc-tokenselect id="tokenizer"></emc-tokenselect>
    <label>
        <emc-input-wrapper>
            <input type="checkbox" id="strict" class="settings-input" checked>
        </emc-input-wrapper>
        <emc-i18n-label i18n-key="strict_categories" i18n-value="Strict categories"></emc-i18n-label>
    </label>
    <label>
        <emc-input-wrapper>
            <input type="checkbox" id="unbound" class="settings-input">
        </emc-input-wrapper>
        <emc-i18n-label i18n-key="show_unbound_only" i18n-value="Unbound only"></emc-i18n-label>
    </label>
</div>
<div id="scroll-container">
    <slot>
    </slot>
</div>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
}
#searchbar {
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    flex-wrap: wrap;
    align-items: center;
    overflow-x: none;
    overflow-y: none;
    border-bottom: solid 2px #cccccc;
}
#searchbar > * {
    margin: 5px;
}
#search,
#tokenizer {
    flex-grow: 0;
    flex-shrink: 0;
    flex-basis: 500px;
    width: 500px;
    max-width: calc(100vw - 10px);
    padding: 5px;
}
label {
    display: flex;
    align-items: center;
}
.settings-input {
    --input-text-color: #ffffff;
    --input-back-color: #000000;
    --input-border-color: #ffffff;
}
#scroll-container {
    flex: 1;
    overflow: auto;
}
::slotted(*) {
    border-bottom: solid 1px var(--list-border-bottom-color, #000000);
    border-top: solid 1px var(--list-border-top-color, #000000);
}
`);

const CATEGORIES = new WeakMap();

export default class ExitList extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        CATEGORIES.set(this, new Set());
        const exits = WorldResource.get("marker/exit");
        for (const name in exits) {
            const state = WorldStateManager.get("exit", name);
            this.addEntrance(state);
        }
        const subexits = WorldResource.get("marker/subexit");
        for (const name in subexits) {
            const state = WorldStateManager.get("subexit", name);
            this.addEntrance(state);
        }
        /* --- */
        const search = this.shadowRoot.getElementById("search");
        search.addEventListener("change", event => {
            this.calculateItems();
        }, true);
        const tokenizer = this.shadowRoot.getElementById("tokenizer");
        tokenizer.addEventListener("change", event => {
            this.calculateItems();
        }, true);
        const strict = this.shadowRoot.getElementById("strict");
        strict.addEventListener("change", event => {
            this.calculateItems();
        }, true);
        const unbound = this.shadowRoot.getElementById("unbound");
        unbound.addEventListener("change", event => {
            this.calculateItems();
        }, true);
    }
    
    calculateItems() {
        const search = this.shadowRoot.getElementById("search");
        const tokenizer = this.shadowRoot.getElementById("tokenizer");
        const unbound = this.shadowRoot.getElementById("unbound");
        const strict = this.shadowRoot.getElementById("strict");
        const actCat = new Set(tokenizer.value);
        for (const el of this.children) {
            if (el) {
                let isVisible = true;
                if (actCat.size > 0) {
                    const elCat = new Set(JSON.parse(el.getAttribute("categories") || "[]"));
                    if (strict.checked) {
                        for (const c of actCat) {
                            if (!elCat.has(c)) {
                                isVisible = false;
                                break;
                            }
                        }
                    } else {
                        isVisible = false;
                        for (const c of elCat) {
                            if (actCat.has(c)) {
                                isVisible = true;
                                break;
                            }
                        }
                    }
                }
                if (isVisible) {
                    if (!el.value || !unbound.checked) {
                        if (search.value) {
                            const regEx = new SearchAnd(search.value);
                            const transAccess = Language.translate(`exit[${el.getAttribute("access")}]`);
                            const transValue = Language.translate(`entrance[${el.getAttribute("value")}]`);
                            const transAccessRes = transAccess.match(regEx);
                            const transValueRes = transValue.match(regEx);
                            el.classList.toggle("markname", transAccessRes);
                            el.classList.toggle("markvalue", transValueRes);
                            if (transAccessRes || transValueRes) {
                                el.style.display = "";
                                continue;
                            }
                        } else {
                            el.classList.remove("markname");
                            el.classList.remove("markvalue");
                            el.style.display = "";
                            continue;
                        }
                    }
                }
                el.classList.remove("markname");
                el.classList.remove("markvalue");
                el.style.display = "none";
            }
        }
    }

    addCategory(category) {
        const categories = CATEGORIES.get(this);
        if (!categories.has(category)) {
            categories.add(category);
            const tokenizer = this.shadowRoot.getElementById("tokenizer");
            const el = document.createElement("emc-option");
            el.value = category;
            Language.applyLabel(el, category);
            tokenizer.append(el);
        }
    }

    addEntrance(state) {
        const el = document.createElement("gt-exitchoice");
        el.ref = state.ref;
        el.setAttribute("access", state.props.access);
        el.setAttribute("type", state.exitData.type);
        el.setAttribute("categories", JSON.stringify(state.props.categories));
        for (const cat of state.props.categories) {
            this.addCategory(cat);
        }
        el.addEventListener("change", event => {
            this.calculateItems();
        });
        this.append(el);
    }

}

customElements.define("gt-exitlist", ExitList);
