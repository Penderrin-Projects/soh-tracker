// frameworks
import Template from "/emcJS/util/Template.js";
import UIEventBusMixin from "/emcJS/event/ui/EventBusMixin.js";
import EventTargetManager from "/emcJS/event/EventTargetManager.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import "/emcJS/ui/input/SwitchButton.js";

// GameTrackerJS
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import "/GameTrackerJS/state/world/OverworldState.js";
import "/GameTrackerJS/state/world/area/StateManager.js";
import "/GameTrackerJS/state/world/exit/StateManager.js";
import "/GameTrackerJS/state/world/location/StateManager.js";
import "/GameTrackerJS/state/world/subarea/StateManager.js";
import "/GameTrackerJS/state/world/subexit/StateManager.js";
import AccessStateEnum from "/GameTrackerJS/enum/AccessStateEnum.js";
import WorldStateManager from "/GameTrackerJS/state/world/WorldStateManager.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import Language from "/GameTrackerJS/util/Language.js";
// Track-OOT
import "/script/state/world/CustomWorldStates.js";
import "./listitems/Button.js";
import "./listitems/TypeButton.js";
import "./listitems/Location.js";
import "./listitems/Gossipstone.js";
import "./listitems/ShopSlot.js";
import "./listitems/Area.js";
import "./listitems/SubArea.js";
import "./listitems/Exit.js";
import "./listitems/SubExit.js";
import "/script/ui/dungeonstate/DungeonType.js";
import "/script/ui/FilterMenu.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-flex;
            flex-direction: column;
            min-height: 100%;
            width: 300px;
            height: 300px;
        }
        #title {
            display: flex;
            align-items: center;
            width: 100%;
            padding: 10px;
            font-size: 1.5em;
            line-height: 1em;
            border-bottom: solid 1px white;
            -moz-user-select: none;
            user-select: none;
        }
        #title-text {
            display: block;
            flex: 1;
            font-size: .8em;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        #title > .button {
            width: 38px;
            height: 38px;
            padding: 4px;
            border: solid 2px var(--navigation-background-color, #ffffff);
            border-radius: 10px;
        }
        #title > .button {
            margin-left: 8px;
        }
        #body {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
        }
        .opened {
            color: var(--location-status-opened-color, #000000);
        }
        .available {
            color: var(--location-status-available-color, #000000);
        }
        .unavailable {
            color: var(--location-status-unavailable-color, #000000);
        }
        .possible {
            color: var(--location-status-possible-color, #000000);
        }
        #list {
            display: content;
        }
        #hint {
            margin-left: 5px;
        }
        #hint img {
            width: 25px;
            height: 25px;
        }
        ootrt-list-button,
        ootrt-list-typebutton {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            width: 100%;
            height: 45px;
            cursor: pointer;
            padding: 5px;
        }
        ootrt-list-button:hover,
        ootrt-list-typebutton:hover,
        #list > *:hover {
            background-color: var(--main-hover-color, #ffffff32);
        }
        ootrt-list-button.hidden,
        ootrt-list-typebutton.hidden,
        :host(:not([ref])) #back,
        :host([ref="overworld"]) #back {
            display: none;
        }
        #back,
        #vanilla,
        #masterquest,
        #list > * {
            border-bottom: solid 1px var(--list-border-bottom-color, #000000);
            border-top: solid 1px var(--list-border-top-color, #000000);
        }
    </style>
    <div id="title">
        <div id="title-text"></div>
        <div id="hint"></div>
        <ootrt-dungeontype id="location-version" class="button" ref="overworld" value="v" readonly="true">
        </ootrt-dungeontype>
        <ootrt-filtermenu class="button">
        </ootrt-filtermenu>
    </div>
    <div id="body">
        <ootrt-list-button id="back"></ootrt-list-button>
        <ootrt-list-typebutton type="v" id="vanilla" class="hidden"></ootrt-list-typebutton>
        <ootrt-list-typebutton type="mq" id="masterquest" class="hidden"></ootrt-list-typebutton>
        <div id="list"></div>
    </div>
`);

const AREA_EVENT_MANAGER = new WeakMap();

class HTMLTrackerLocationList extends UIEventBusMixin(Panel) {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        this.attributeChangedCallback("", "");
        this.shadowRoot.getElementById("back").addEventListener("click", event => {
            this.ref = "overworld";
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        const titleTextEl = this.shadowRoot.getElementById("title-text");
        const backEl = this.shadowRoot.getElementById("back");
        const vanillaEl = this.shadowRoot.getElementById("vanilla");
        const masterquestEl = this.shadowRoot.getElementById("masterquest");
        Language.applyLabel(titleTextEl, "hyrule");
        Language.applyLabel(backEl, "(to overworld)");
        Language.applyLabel(vanillaEl, "vanilla");
        Language.applyLabel(masterquestEl, "masterquest");
        /* --- */
        const areaEventManager = new EventTargetManager();
        AREA_EVENT_MANAGER.set(this, areaEventManager);
        areaEventManager.set("access", event => {
            this.updateHeader();
        });
        areaEventManager.set("list_update", event => {
            this.refresh();
        });
        /* --- */
        SavestateHandler.addEventListener("load", event => {
            this.refresh();
        });
        SavestateHandler.addEventListener("change_area_hint", event => {
            if (event.changes != null) {
                const data = event.changes[this.ref];
                if (data != null) {
                    this.hint = data.newValue;
                }
            }
        });
        /* event bus */
        this.registerGlobal("location_change", event => {
            this.ref = event.data.name;
            areaEventManager
            if (event.data.focus) {
                // TODO
            }
        });
        this.registerGlobal("logic", event => {
            this.updateHeader();
        });
        this.registerGlobal("state::dungeontype", event => {
            if (event.data != null) {
                const data = event.data;
                if (data.ref == this.ref) {
                    this.shadowRoot.getElementById("location-version").value = data.value;
                    this.refresh();
                }
            }
        });
    }

    connectedCallback() {
        super.connectedCallback();
        this.refresh();
    }

    get ref() {
        return this.getAttribute("ref") || "overworld";
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get hint() {
        return this.getAttribute("hint");
    }

    set hint(val) {
        this.setAttribute("hint", val);
    }

    static get observedAttributes() {
        return ["ref", "hint"];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "ref":
                if (oldValue != newValue) {
                    Language.applyLabel(this.shadowRoot.getElementById("title-text"), newValue || "hyrule");
                    this.shadowRoot.getElementById("location-version").ref = newValue;
                    this.shadowRoot.getElementById("vanilla").ref = newValue;
                    this.shadowRoot.getElementById("masterquest").ref = newValue;
                    this.hint = SavestateHandler.get("area_hint", newValue, "");
                    this.refresh();
                }
                break;
            case "hint":
                if (oldValue != newValue) {
                    const hintEl = this.shadowRoot.getElementById("hint");
                    hintEl.innerHTML = "";
                    if (!!newValue && newValue != "") {
                        const el_icon = document.createElement("img");
                        el_icon.src = `images/icons/area_${newValue}.svg`;
                        hintEl.append(el_icon);
                    }
                }
                break;
        }
    }

    refresh() {
        // TODO do not use specialized code. make generic
        const areaEventManager = AREA_EVENT_MANAGER.get(this);
        const cnt = this.shadowRoot.getElementById("list");
        const btn_vanilla = this.shadowRoot.getElementById("vanilla");
        const btn_masterquest = this.shadowRoot.getElementById("masterquest");
        cnt.innerHTML = "";
        const areaState = WorldStateManager.getByRef(this.ref || "overworld");
        if (areaState != null) {
            areaEventManager.switchTarget(areaState);
            const list = areaState.getList();
            if (list != null) {
                if (btn_vanilla != null) {
                    btn_vanilla.classList.add("hidden");
                    btn_vanilla.ref = "";
                }
                if (btn_masterquest != null) {
                    btn_masterquest.classList.add("hidden");
                    btn_vanilla.ref = "";
                }
                for (const record of list) {
                    const loc = WorldStateManager.get(record.category, record.id);
                    const uiReg = UIRegistry.get(`list-${record.category}`);
                    const el = uiReg.create(loc.props.type, loc.ref);
                    cnt.append(el);
                }
            } else {
                if (btn_vanilla != null) {
                    btn_vanilla.classList.remove("hidden");
                    btn_vanilla.ref = this.ref;
                }
                if (btn_masterquest != null) {
                    btn_masterquest.classList.remove("hidden");
                    btn_vanilla.ref = this.ref;
                }
            }
            this.updateHeader();
        }
    }

    async updateHeader() {
        const titleEl = this.shadowRoot.querySelector("#title");
        if (titleEl != null) {
            if ((!this.ref || this.ref === "overworld")) {
                titleEl.className = "";
            } else {
                const data = WorldStateManager.getByRef(this.ref);
                if (data != null) {
                    /* access */
                    const access = data.access;
                    const value = AccessStateEnum.getName(access.value).toLowerCase();
                    titleEl.className = value;
                }
            }
        }
    }
    
}

Panel.registerReference("location-list", HTMLTrackerLocationList);
customElements.define("ootrt-locationlist", HTMLTrackerLocationList);
