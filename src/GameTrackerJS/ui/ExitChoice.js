import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import UIEventBusMixin from "/emcJS/event/ui/EventBusMixin.js";
import "/emcJS/ui/input/SearchSelect.js";
import ExitRegistry from "../registry/ExitRegistry.js";
import StateDataEventManagerMixin from "./mixin/StateDataEventManager.js";
import StateStorage from "/script/storage/StateStorage.js";
import Language from "/script/util/Language.js";

const TPL = new Template(`
<label>
    <span id="title"></span>
    <emc-searchselect id="select"></emc-searchselect>
</label>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: block;
    padding: 10px;
    margin: 5px;
    background-color: #222222;
}
#title {
    display: block;
    height: 20px;
    margin-bottom: 5px;
}
`);


export default class HTMLTrackerExitChoice extends StateDataEventManagerMixin(UIEventBusMixin(HTMLElement)) {
    
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const selectEl = this.shadowRoot.getElementById("select");
        this.registerStateHandler("value", event => {
            selectEl.value = event.data;
        });
        this.registerStateHandler("active", event => {
            const state = this.getState();
            if (state != null) {
                selectEl.readonly = !event.data;
                setTimeout(() => {
                    this.fillEntranceSelection(state.props.access, state.value);
                }, 0);
            }
        });
        selectEl.addEventListener("change", event => {
            const state = this.getState();
            if (state != null) {
                state.value = event.value;
            }
        });
        this.registerGlobal("statechange_exits", event => {
            const state = this.getState();
            if (state != null) {
                this.fillEntranceSelection(state.props.access, state.value);
            }
        });
    }

    applyDefaultValues() {
        super.applyDefaultValues();
        const selectEl = this.shadowRoot.getElementById("select");
        if (selectEl != null) {
            selectEl.value = "";
            selectEl.readonly = true;
            selectEl.innerHTML = "";
        }
    }

    applyStateValues(state) {
        super.applyStateValues(state);
        if (state != null) {
            const selectEl = this.shadowRoot.getElementById("select");
            if (selectEl != null) {
                selectEl.value = state.value;
                selectEl.readonly = !state.active;
            }
            this.fillEntranceSelection(state.props.access, state.value);
        }
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    static get observedAttributes() {
        return ['ref'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case 'ref':
                    {
                        const state = ExitRegistry.get(newValue);
                        const textEl = this.shadowRoot.getElementById("title");
                        if (textEl != null) {
                            textEl.innerHTML = Language.translate(newValue);
                        }
                        this.switchState(state);
                    }
                    break;
            }
        }
    }

    fillEntranceSelection(access, current = "") {
        // retrieve bound
        const exits = StateStorage.readAllExtra("exits");
        const bound = new Set();
        for (const key in exits) {
            if (exits[key] == current) continue;
            bound.add(exits[key]);
        }
        // add options
        const exit = ExitRegistry.get(access);
        const entrances = ExitRegistry.getAll();
        const selectEl = this.shadowRoot.getElementById("select");
        selectEl.value = current;
        selectEl.innerHTML = "";
        const empty = document.createElement('emc-option');
        empty.value = "";
        empty.innerHTML = "unbound";
        selectEl.append(empty);
        for (const key in entrances) {
            const value = entrances[key];
            if (value.active && ((exit.exitData.type === 'special' && value.exitData.type !== 'dungeon') || (value.exitData.type == exit.exitData.type && !bound.has(value.exitData.target)))) {
                const opt = document.createElement('emc-option');
                opt.value = value.exitData.target;
                opt.innerHTML = Language.translate(value.exitData.target);
                selectEl.append(opt);
            }
        }
    }

}

customElements.define('gt-exitchoice', HTMLTrackerExitChoice);
