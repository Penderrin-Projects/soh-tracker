import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import ExitRegistry from "../registry/ExitRegistry.js";
import StateDataEventManagerMixin from "./mixin/StateDataEventManager.js";
import ContextMenuManagerMixin from "./mixin/ContextMenuManager.js";
import Badge from "./Badge.js";
import "./ctxmenu/ExitChoiceContextMenu.js";
import "./ctxmenu/ExitBindingMenu.js";
import StateStorage from "/script/storage/StateStorage.js";
import Language from "/script/util/Language.js";

const TPL = new Template(`
<div class="textarea">
    <div id="text"></div>
    <gt-badge id="badge"></gt-badge>
</div>
<div class="pointer">→</div>
<div class="textarea">
    <div id="value"></div>
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
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    cursor: pointer;
    padding: 3px;
}
:host(:hover) {
    background-color: var(--main-hover-color, #ffffff32);
}
.textarea {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex: 1;
    height: 50px;
    margin: 2px;
    word-break: break-word;
}
.textarea:empty {
    display: none;
}
.pointer {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    flex-grow: 0;
    flex-shrink: 0;
}
#value:empty:after {
    display: inline;
    font-style: italic;
    content: "no association";
}
#text {
    display: flex;
    flex: 1;
    color: #ffffff;
    align-items: center;
}
`);


export default class HTMLTrackerExitChoice extends ContextMenuManagerMixin(StateDataEventManagerMixin(HTMLElement)) {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("value", event => {
            this.value = event.data;
        });
        this.registerStateHandler("visible", event => {
            if (!event.data) {
                this.style.display = "none";
            } else {
                this.style.display = "";
            }
        });

        /* context menu */
        const mnu_ctx = document.createElement("gt-ctxmenu-exitchoice");
        this.setContextMenu("main", mnu_ctx);

        const mnu_ext = document.createElement("gt-ctxmenu-exitbinding");
        this.setContextMenu("exitbinding", mnu_ext);

        mnu_ext.addEventListener("change", event => {
            const state = this.getState();
            if (state != null) {
                state.value = event.value;
            }
        });
        mnu_ctx.addEventListener("associate", event => {
            const state = this.getState();
            if (state != null) {
                mnu_ext.fillEntranceSelection(state.props.access, state.value);
                mnu_ext.setValue(state.value);
            } else {
                mnu_ext.fillEntranceSelection("", "");
                mnu_ext.setValue("");
            }
            mnu_ext.setValue(state.value);
            mnu_ext.show(mnu_ctx.left, mnu_ctx.top);
        });
        mnu_ctx.addEventListener("deassociate", event => {
            const state = this.getState();
            if (state != null) {
                state.value = "";
            }
        });

        /* mouse events */
        this.addEventListener("click", event => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area == null) {
                    mnu_ext.fillEntranceSelection(state.props.access, state.value);
                    mnu_ext.setValue(state.value);
                    mnu_ext.show(event.clientX, event.clientY);
                }
            }
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", event => {
            mnu_ctx.show(event.clientX, event.clientY);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
    }

    applyDefaultValues() {
        super.applyDefaultValues();
        this.value = "";
        const badge = this.shadowRoot.getElementById("badge");
        if (badge instanceof Badge) {
            badge.typeIcon = "images/icons/entrance.svg";
            badge.setFilterData({});
        }
        this.style.display = "none";
    }

    applyStateValues(state) {
        super.applyStateValues(state);
        if (state != null) {
            this.value = state.value;
            const badge = this.shadowRoot.getElementById("badge");
            if (badge instanceof Badge) {
                badge.typeIcon = state.props.icon ?? "images/icons/entrance.svg";
                badge.setFilterData(state.filter);
            }
            if (!state.visible) {
                this.style.display = "none";
            } else {
                this.style.display = "";
            }
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
                        const state = ExitRegistry.get(newValue);
                        const textEl = this.shadowRoot.getElementById("text");
                        if (textEl != null) {
                            textEl.innerHTML = Language.translate(`exit[${newValue}]`);
                        }
                        this.switchState(state);
                    }
                    break;
                case "value":
                    {
                        const state = this.getState();
                        if (state != null) {
                            const valueEl = this.shadowRoot.getElementById("value");
                            if (valueEl != null) {
                                if (newValue) {
                                    valueEl.innerHTML = Language.translate(`entrance[${newValue}]`);
                                } else {
                                    valueEl.innerHTML = "";
                                }
                            }
                        }
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
            const exitKey = ExitRegistry.get(key)
            if (exits[key] == current || exitKey.exitData.type === "special") continue;
            bound.add(exits[key]);
        }
        // add options
        const exit = ExitRegistry.get(access);
        const entrances = ExitRegistry.getAll();
        const selectEl = this.shadowRoot.getElementById("select");
        selectEl.value = current;
        selectEl.innerHTML = "";
        const empty = document.createElement("emc-option");
        empty.value = "";
        empty.innerHTML = "unbound";
        selectEl.append(empty);
        for (const key in entrances) {
            const value = entrances[key];
            if ((exit.exitData.type === "special" && value.exitData.type !== "dungeon") || (value.active && value.exitData.type == exit.exitData.type && !bound.has(value.exitData.target))) {
                const opt = document.createElement("emc-option");
                opt.value = value.exitData.target;
                opt.innerHTML = Language.translate(value.exitData.target);
                selectEl.append(opt);
            }
        }
    }

}

customElements.define("gt-exitchoice", HTMLTrackerExitChoice);
