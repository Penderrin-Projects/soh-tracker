// frameworks
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";

import WorldStateManager from "../../state/world/WorldStateManager.js";
import StateDataEventManagerMixin from "../mixin/StateDataEventManager.js";
import ContextMenuManagerMixin from "../mixin/ContextMenuManager.js";
import Badge from "../Badge.js";
import "../ctxmenu/ExitChoiceContextMenu.js";
import "../ctxmenu/ExitBindingMenu.js";
import Language from "../../util/Language.js";

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
    justify-content: space-between;
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
    align-items: center;
}
#text,
#value {
    color: var(--page-text-color, #ffffff);
}
@media (max-width: 1000px) {
    :host {
        flex-direction: column;
        align-items: stretch;
    }
    .pointer {
        display: none;
    }
}
:host(.markname) #text,
:host(.markvalue) #value {
    color: var(--page-background-color, #000000);
    background-color: var(--page-text-color, #ffffff);
    outline: 2px solid var(--page-text-color, #ffffff);
}
`);


export default class ExitChoice extends ContextMenuManagerMixin(StateDataEventManagerMixin(HTMLElement)) {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("visible", event => {
            const state = this.getState();
            if (state != null) {
                if (state.isVisible()) {
                    this.style.display = "";
                } else {
                    this.style.display = "none";
                }
            }
        });
        this.registerStateHandler("filter", event => {
            const state = this.getState();
            if (state != null) {
                if (state.isVisible()) {
                    this.style.display = "";
                } else {
                    this.style.display = "none";
                }
            }
        });
        this.registerStateHandler("value", event => {
            this.value = event.data;
        });

        /* context menu */
        this.setContextMenu("main", document.createElement("gt-ctxmenu-exitchoice"));
        this.setContextMenu("exitbinding", document.createElement("gt-ctxmenu-exitbinding"));
        this.addContextMenuHandler("exitbinding", "change", event => {
            const state = this.getState();
            if (state != null) {
                state.value = event.value;
            }
        });
        this.addContextMenuHandler("main", "associate", event => {
            const state = this.getState();
            const mnu_ctx = this.getContextMenu("main");
            const mnu_ext = this.getContextMenu("exitbinding");
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
        this.addContextMenuHandler("main", "deassociate", event => {
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
                    const mnu_ext = this.getContextMenu("exitbinding");
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
            const mnu_ctx = this.getContextMenu("main");
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
                badge.setFilterData(state.props.filter);
            }
            if (state.isVisible()) {
                this.style.display = "";
            } else {
                this.style.display = "none";
            }
        }
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    get value() {
        return this.getAttribute("value");
    }

    static get observedAttributes() {
        return ["ref", "value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    const state = WorldStateManager.getByRef(this.ref);
                    const textEl = this.shadowRoot.getElementById("text");
                    if (textEl != null) {
                        Language.applyLabel(textEl, `exit[${state.props.access}]`);
                    }
                    this.switchState(state);
                } break;
                case "value": {
                    const state = this.getState();
                    if (state != null) {
                        const valueEl = this.shadowRoot.getElementById("value");
                        if (valueEl != null) {
                            if (newValue) {
                                Language.applyLabel(valueEl, `entrance[${newValue}]`);
                            } else {
                                valueEl.innerHTML = "";
                            }
                        }
                    }
                    const event = new Event("change");
                    event.value = newValue;
                    this.dispatchEvent(event);
                } break;
            }
        }
    }

}

customElements.define("gt-exitchoice", ExitChoice);
