// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/CustomElement.js";
import ContextMenuManagerMixin from "/emcJS/ui/overlay/ctxmenu/ContextMenuManagerMixin.js";
import "/emcJS/ui/input/Option.js";

// GameTrackerJS
import ItemsResource from "/GameTrackerJS/resource/ItemsResource.js";
import StateDataEventManager from "/GameTrackerJS/ui/mixin/StateDataEventManager.js";
import ItemPickerContextMenu from "/GameTrackerJS/ui/ctxmenu/ItemPickerContextMenu.js";
// Track-OOT
import DungeonstateStates from "/script/state/dungeonstate/StateManager.js";

const TPL = new Template(`
<slot>
</slot>
`);

const STYLE = new GlobalStyle(`
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

const REWARDS = [
    {
        "type": "item",
        "value": "stone_forest",
        "visible": true
    },
    {
        "type": "item",
        "value": "stone_fire",
        "visible": true
    },
    {
        "type": "item",
        "value": "stone_water",
        "visible": true
    },
    {
        "type": "item",
        "value": "medallion_forest",
        "visible": true
    },
    {
        "type": "item",
        "value": "medallion_fire",
        "visible": true
    },
    {
        "type": "item",
        "value": "medallion_water",
        "visible": true
    },
    {
        "type": "item",
        "value": "medallion_spirit",
        "visible": true
    },
    {
        "type": "item",
        "value": "medallion_shadow",
        "visible": true
    },
    {
        "type": "item",
        "value": "medallion_light",
        "visible": true
    }
];
const TAKEN_REWARDS = new Map();

function resolveIcon(icon) {
    if (icon == null) {
        return "/images/items/unknown.png";
    }
    if (typeof icon == "object") {
        return icon[0] ?? "/images/items/unknown.png";
    }
    return icon;
}

class HTMLTrackerDungeonReward extends ContextMenuManagerMixin(StateDataEventManager(CustomElement)) {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("reward", event => {
            this.value = event.data;
        });

        /* context menu */
        this.setContextMenu("itempicker", ItemPickerContextMenu);
        this.addContextMenuHandler("itempicker", "pick", event => {
            const value = event.item;
            const state = this.getState();
            if (state != null) {
                state.reward = value;
            }
        });
        
        /* mouse events */
        this.addEventListener("click", event => {
            const mnu_itm = this.getContextMenu("itempicker");
            const filteredRewards = REWARDS.filter(el => !TAKEN_REWARDS.has(el.value));
            if (filteredRewards.length) {
                mnu_itm.loadItems([filteredRewards]);
                mnu_itm.show(event.clientX, event.clientY);
            }
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", event => this.revert(event));
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
                            for (const reward of REWARDS) {
                                const name = reward.value;
                                const icon = resolveIcon(items[name].icon);
                                this.append(createOption(name, icon));
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
