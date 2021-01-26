import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import UIEventBusMixin from "/emcJS/event/ui/EventBusMixin.js";
import AccessStateEnum from "/GameTrackerJS/enum/AccessStateEnum.js";
import WorldRegistry from "/GameTrackerJS/registry/WorldRegistry.js";
import StateDataEventManagerMixin from "/GameTrackerJS/ui/mixin/StateDataEventManager.js";
import "/GameTrackerJS/ui/Badge.js";
import DungeonstateStates from "/script/state/dungeonstate/StateManager.js";
import ListLogic from "/script/util/logic/ListLogic.js";
import iOSTouchHandler from "/GameTrackerJS/util/iOSTouchHandler.js";

const TPL = new Template(`
<div class="textarea">
    <div id="text">
        <slot></slot>
    </div>
    <gt-badge id="badge" type-icon="images/dungeontype/undefined.svg"></gt-badge>
</div>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
}
:host {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    cursor: pointer;
    padding: 5px;
    color: #ffffff;
}
:host(:hover) {
    background-color: var(--main-hover-color, #ffffff32);
}
.textarea {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    min-height: 35px;
    word-break: break-word;
}
.textarea:empty {
    display: none;
}
.textarea + .textarea {
    margin-top: 5px;
}

#text {
    flex: 1;
    color: #ffffff;
}
#text[data-state="opened"] {
    color: var(--location-status-opened-color, #000000);
}
#text[data-state="available"] {
    color: var(--location-status-available-color, #000000);
}
#text[data-state="unavailable"] {
    color: var(--location-status-unavailable-color, #000000);
}
#text[data-state="possible"] {
    color: var(--location-status-possible-color, #000000);
}
.menu-tip {
    font-size: 0.7em;
    color: #777777;
    margin-left: 15px;
    float: right;
}
`);

const TYPE_STATE = new WeakMap();

export default class ListButton extends StateDataEventManagerMixin(UIEventBusMixin(HTMLElement)) {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        TYPE_STATE.set(this, null);

        /* event bus */
        this.registerGlobal(["logic", "options"], event => {
            const state = this.getState();
            if (state != null) {
                const list = state.getFilteredList(this.type);
                if (list != null) {
                    const access = ListLogic.check(list);
                    this.applyAccess(access);
                }
            }
        });
        
        /* mouse events */
        this.addEventListener("click", event => {
            const state = TYPE_STATE.get(this);
            if (state != null) {
                state.type = this.type || "n";
            }
            /* --- */
            event.stopPropagation();
            event.preventDefault();
            return false;
        });

        /* fck iOS */
        iOSTouchHandler.register(this);
    }
    
    applyAccess(data) {
        const textEl = this.shadowRoot.getElementById("text");
        const badgeEl = this.shadowRoot.getElementById("badge");
        const value = AccessStateEnum.getName(data.value).toLowerCase();
        /* access */
        if (textEl != null) {
            textEl.dataset.state = value;
        }
        /* badge */
        if (badgeEl != null) {
            badgeEl.access = value;
        }
    }

    applyDefaultValues() {
        const textEl = this.shadowRoot.getElementById("text");
        if (textEl != null) {
            textEl.dataset.state = "unavailable";
        }
    }

    applyStateValues(state) {
        if (state != null) {
            const list = state.getFilteredList(this.type);
            if (list != null) {
                const access = ListLogic.check(list);
                this.applyAccess(access);
            }
        }
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get type() {
        return this.getAttribute("type");
    }

    set type(val) {
        this.setAttribute("type", val);
    }

    static get observedAttributes() {
        return ["ref", "type"];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref":
                    {
                        const state = WorldRegistry.get(this.ref);
                        this.switchState(state);
                        const type_state = DungeonstateStates.get(this.ref);
                        if (type_state != null) {
                            TYPE_STATE.set(this, type_state);
                        } else {
                            TYPE_STATE.set(this, null);
                        }
                    }
                    break;
                case "type":
                    {
                        const state = this.getState();
                        if (state != null) {
                            const list = state.getFilteredList(newValue);
                            if (list != null) {
                                const access = ListLogic.check(list);
                                this.applyAccess(access);
                            }
                        }
                        /* badge */
                        const badgeEl = this.shadowRoot.getElementById("badge");
                        if (badgeEl != null) {
                            if (newValue == "v") {
                                badgeEl.typeIcon = "images/dungeontype/vanilla.svg";
                            } else if (newValue == "mq") {
                                badgeEl.typeIcon = "images/dungeontype/masterquest.svg";
                            } else {
                                badgeEl.typeIcon = "images/dungeontype/undefined.svg";
                            }
                        }
                    }
                    break;
            }
        }
    }

}

customElements.define("ootrt-list-typebutton", ListButton);
