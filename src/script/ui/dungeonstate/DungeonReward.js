// frameworks
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import "/emcJS/ui/input/Option.js";


// GameTrackerJS
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import ItemsResource from "/GameTrackerJS/resource/ItemsResource.js";
import StateDataEventManager from "/GameTrackerJS/ui/mixin/StateDataEventManager.js";
// Track-OOT
import DungeonstateStates from "/script/state/dungeonstate/StateManager.js";
import "/script/ui/items/ItemPicker.js";

const TPL = new Template(`
<slot>
</slot>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    cursor: pointer;
}
slot {
    width: 100%;
    height: 100%;
}
::slotted(:not([value])),
::slotted([value]:not(.active)) {
    display: none !important;
}
::slotted([value]) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: white;
    font-size: 1em;
    text-shadow: -1px 0 1px black, 0 1px 1px black, 1px 0 1px black, 0 -1px 1px black;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    background-origin: content-box;
    flex-grow: 0;
    flex-shrink: 0;
    min-height: 0;
    white-space: normal;
    padding: 0;
    line-height: 0.7em;
}
`);

const TPL_MNU_ITM = new Template(`
<emc-contextmenu id="menu">
    <ootrt-itempicker id="item-picker"></ootrt-itempicker>
</emc-contextmenu>
`);

const MNU_ITM = new WeakMap();

const REWARDS = [
    "item.stone_forest",
    "item.stone_fire",
    "item.stone_water",
    "item.medallion_forest",
    "item.medallion_fire",
    "item.medallion_water",
    "item.medallion_spirit",
    "item.medallion_shadow",
    "item.medallion_light"
];
const TAKEN_REWARDS = new Map();

class HTMLTrackerDungeonReward extends StateDataEventManager(HTMLElement) {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("reward", event => {
            this.value = event.data;
        });

        /* context menu */
        const mnu_itm = document.createElement("div");
        mnu_itm.attachShadow({mode: "open"});
        mnu_itm.shadowRoot.append(TPL_MNU_ITM.generate());
        const mnu_itm_el = mnu_itm.shadowRoot.getElementById("menu");
        MNU_ITM.set(this, mnu_itm);
        const mnu_itm_picker = mnu_itm.shadowRoot.getElementById("item-picker");

        mnu_itm.shadowRoot.getElementById("item-picker").addEventListener("pick", event => {
            const value = event.detail;
            const state = this.getState();
            if (state != null) {
                state.reward = value;
            }
            event.preventDefault();
            return false;
        });
        
        /* mouse events */
        this.addEventListener("click", event => {
            const filteredRewards = REWARDS.filter(el => !TAKEN_REWARDS.has(el));
            if (filteredRewards.length) {
                mnu_itm_picker.items = JSON.stringify([filteredRewards.map(el => {
                    return {
                        "type": "item",
                        "value": el,
                        "visible": true
                    };
                })]);
                /* --- */
                mnu_itm_el.show(event.clientX, event.clientY);
            }
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", event => this.revert(event));
    }

    connectedCallback() {
        super.connectedCallback();
        this.value = SavestateHandler.get("dungeonreward", this.ref, "");
        let el = this;
        while (el.parentElement != null && !el.classList.contains("panel")) {
            el = el.parentElement;
        }
        el.append(MNU_ITM.get(this));
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        MNU_ITM.get(this).remove();
    }

    applyDefaultValues() {
        this.value = "";
    }

    applyStateValues(state) {
        if (state != null) {
            this.value = state.reward;
        }
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get value() {
        return this.getAttribute("value");
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    static get observedAttributes() {
        return ["ref", "value"];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref":
                    {
                        // state
                        const state = DungeonstateStates.get(newValue);
                        if (state != null) {
                            this.append(createOption("", "/images/items/unknown.png"));
                            const items = ItemsResource.get();
                            for (let i = 0; i < REWARDS.length; ++i) {
                                const name = REWARDS[i];
                                let j = items[name].images;
                                if (Array.isArray(j)) {
                                    j = j[0];
                                }
                                this.append(createOption(name, j));
                            }
                        }
                        if (newValue === "") {
                            this.innerHTML = "";
                        }
                        this.switchState(state);
                    }
                    break;
                case "value":
                    {
                        const oe = this.querySelector(`.active`);
                        if (oe) {
                            oe.classList.remove("active");
                        }
                        const ne = this.querySelector(`[value="${newValue}"]`);
                        if (ne) {
                            ne.classList.add("active");
                        }
                        if (oldValue != "" && TAKEN_REWARDS.get(oldValue) == this) {
                            TAKEN_REWARDS.delete(oldValue);
                        }
                        if (newValue != "") {
                            TAKEN_REWARDS.set(newValue, this);
                        }
                    }
                    break;
            }
        }
    }

    revert(ev) {
        const state = this.getState();
        if (state != null) {
            state.reward = "";
        }
        ev.preventDefault();
        return false;
    }

}

customElements.define("ootrt-dungeonreward", HTMLTrackerDungeonReward);

function createOption(value, img) {
    const opt = document.createElement("emc-option");
    opt.value = value;
    opt.style.backgroundImage = `url("${img}"`;
    return opt;
}
