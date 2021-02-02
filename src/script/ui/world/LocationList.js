/* asym-import: off */
import Template from "/emcJS/util/Template.js";
import UIEventBusMixin from "/emcJS/event/ui/EventBusMixin.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import "/emcJS/ui/input/SwitchButton.js";
/* asym-import: on */

// GameTrackerJS
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import AccessStateEnum from "/GameTrackerJS/enum/AccessStateEnum.js";
import WorldRegistry from "/GameTrackerJS/registry/WorldRegistry.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import Language from "/GameTrackerJS/util/Language.js";
// Track-OOT
import "./listitems/Button.js";
import "./listitems/TypeButton.js";
import "./listitems/Location.js";
import "./listitems/Area.js";
import "./listitems/SubArea.js";
import "./listitems/Exit.js";
import "./listitems/SubExit.js";
import "./listitems/Gossipstone.js";
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
            min-width: 100%;
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
        <div id="title-text">${Language.translate("hyrule")}</div>
        <div id="hint"></div>
        <ootrt-dungeontype id="location-version" class="button" ref="overworld" value="v" readonly="true">
        </ootrt-dungeontype>
        <ootrt-filtermenu class="button">
        </ootrt-filtermenu>
    </div>
    <div id="body">
        <ootrt-list-button id="back">(${Language.translate("to overworld")})</ootrt-list-button>
        <ootrt-list-typebutton type="v" id="vanilla" class="hidden">${Language.translate("vanilla")}</ootrt-list-typebutton>
        <ootrt-list-typebutton type="mq" id="masterquest" class="hidden">${Language.translate("masterquest")}</ootrt-list-typebutton>
        <div id="list"></div>
    </div>
`);

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
        /* event bus */
        this.registerGlobal("location_change", event => {
            this.ref = event.data.name;
            if (event.data.focus) {
                // TODO
            }
        });
        this.registerGlobal(["state", "statechange", "logic", "settings", "options", "filter"], event => {
            this.refresh();
        });
        this.registerGlobal("statechange_dungeontype", event => {
            if (event.data != null) {
                const data = event.data[this.ref];
                if (data != null) {
                    this.shadowRoot.getElementById("location-version").value = data.newValue;
                    this.refresh();
                }
            }
        });
        this.registerGlobal("statechange_area_hint", event => {
            let data;
            if (event.data != null) {
                data = event.data[this.ref];
            }
            if (data != null) {
                this.hint = data.newValue;
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
                    this.shadowRoot.getElementById("title-text").innerHTML = Language.translate(newValue || "hyrule");
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
        const cnt = this.shadowRoot.getElementById("list");
        const btn_vanilla = this.shadowRoot.getElementById("vanilla");
        const btn_masterquest = this.shadowRoot.getElementById("masterquest");
        cnt.innerHTML = "";
        const data = WorldRegistry.get(this.ref || "overworld");
        if (data != null) {
            const list = data.getFilteredList();
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
                    const id = `${record.category}/${record.id}`;
                    const loc = WorldRegistry.get(id);
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
                const data = WorldRegistry.get(this.ref);
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
