// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/CustomElement.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import ContextMenuManagerMixin from "/emcJS/ui/overlay/ctxmenu/ContextMenuManagerMixin.js";
import "/emcJS/ui/Icon.js";

import AccessStateEnum from "../../../../../enum/AccessStateEnum.js";
import StateDataEventManagerMixin from "../../../../mixin/StateDataEventManager.js";

const TPL = new Template(`
<div class="textarea">
    <slot id="text"></slot>
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
}
:host(:hover),
:host(.ctx-marked) {
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
`);

const BaseClass = mix(
    CustomElement
).with(
    StateDataEventManagerMixin,
    ContextMenuManagerMixin
);

export default class WorldElement extends BaseClass {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* state handler */
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
        this.registerStateHandler("access", event => {
            this.applyAccess(event.data);
        });
        /* mouse events */
        this.addEventListener("click", event => {
            this.clickHandler(event);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", event => {
            this.contextmenuHandler(event);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
    }

    clickHandler(event) {
        // nothing
    }

    contextmenuHandler(event) {
        this.showDefaultContextMenu(event);
        event.stopPropagation();
        event.preventDefault();
        return false;
    }

    applyDefaultValues(defaultIcon) {
        this.style.display = "none";
    }

    applyStateValues(state, defaultIcon) {
        if (state != null) {
            if (state.isVisible()) {
                this.style.display = "";
            } else {
                this.style.display = "none";
            }
        }
    }

    applyAccess(data) {
        const value = AccessStateEnum.getName(data.value).toLowerCase();
        /* access */
        const textEl = this.shadowRoot.getElementById("text");
        if (textEl != null) {
            textEl.dataset.state = value;
        }
    }

}
