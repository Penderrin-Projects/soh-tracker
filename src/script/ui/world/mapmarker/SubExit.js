// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import "/emcJS/ui/overlay/Tooltip.js";
import "/emcJS/ui/Icon.js";

// GameTrackerJS
import AccessStateEnum from "/GameTrackerJS/enum/AccessStateEnum.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import AbstractSubExit from "/GameTrackerJS/ui/world/SubExit.js";
import "/GameTrackerJS/ui/Badge.js";
// Track-OOT
import "/script/state/world/CustomWorldStates.js";
import ExitBindingMenu from "../../ctxmenu/ExitBindingMenu.js";

const TPL = new Template(`
<div id="marker" class="unavailable"></div>
<emc-tooltip position="top" id="tooltip">
    <div class="textarea">
        <div id="text"></div>
        <gt-badge-access id="badge"></gt-badge-access>
    </div>
    <div class="textarea">
        <div id="value"></div>
        <div id="hint"></div>
    </div>
</emc-tooltip>
`);

const STYLE = new GlobalStyle(`
:host {
    position: absolute;
    display: inline-flex;
    width: 48px;
    height: 48px;
    box-sizing: border-box;
    transform: translate(-24px, -24px);
}
:host(:hover) {
    z-index: 1000;
}
#marker {
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border: solid 4px black;
    border-radius: 25%;
    color: black;
    background-color: #ffffff;
    font-size: 1em;
    font-weight: bold;
    cursor: pointer;
}
#marker[data-state="opened"] {
    background-color: var(--location-status-opened-color, #000000);
}
#marker[data-state="available"] {
    background-color: var(--location-status-available-color, #000000);
}
#marker[data-state="unavailable"] {
    background-color: var(--location-status-unavailable-color, #000000);
}
#marker[data-state="possible"] {
    background-color: var(--location-status-possible-color, #000000);
}
#marker:hover,
:host(.ctx-marked) #marker {
    box-shadow: 0 0 2px 4px #67ffea;
}
#marker:hover + #tooltip,
:host(.ctx-marked) #marker + #tooltp {
    display: block;
}
#tooltip {
    padding: 5px 12px;
    -moz-user-select: none;
    user-select: none;
    white-space: nowrap;
    font-size: 30px;
}
.textarea {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 46px;
    word-break: break-word;
}
.textarea:empty {
    display: none;
}
#text {
    display: inline-flex;
    align-items: center;
    -moz-user-select: none;
    user-select: none;
    white-space: nowrap;
}
#hint {
    margin-left: 5px;
}
#hint img {
    width: 25px;
    height: 25px;
}
`);

export default class MapSubExit extends AbstractSubExit {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.setContextMenu("exitbinding", ExitBindingMenu);
    }

    applyAccess(data) {
        super.applyAccess(data);
        const markerEl = this.shadowRoot.getElementById("marker");
        if (markerEl != null) {
            if (typeof data == "boolean") {
                /* access */
                if (data) {
                    markerEl.dataset.state = "available";
                    markerEl.innerHTML = "?";
                } else {
                    markerEl.dataset.state = "unavailable";
                    markerEl.innerHTML = "?";
                }
                /* entrances */
                markerEl.dataset.entrances = "false";
            } else {
                /* access */
                const value = AccessStateEnum.getName(data.value).toLowerCase();
                markerEl.dataset.state = value;
                if (data.value == AccessStateEnum.UNAVAILABLE || data.value == AccessStateEnum.OPENED) {
                    markerEl.innerHTML = "";
                } else {
                    markerEl.innerHTML = data.reachable;
                }
                /* entrances */
                if (data.entrances) {
                    markerEl.dataset.entrances = "true";
                } else {
                    markerEl.dataset.entrances = "false";
                }
            }
        }
    }

    get left() {
        return this.getAttribute("left");
    }

    set left(val) {
        this.setAttribute("left", val);
    }

    get top() {
        return this.getAttribute("top");
    }

    set top(val) {
        this.setAttribute("top", val);
    }

    get tooltip() {
        return this.getAttribute("tooltip");
    }

    set tooltip(val) {
        this.setAttribute("tooltip", val);
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "left", "top", "tooltip"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "top":
            case "left":
                if (oldValue != newValue) {
                    this.style.left = `${this.left}px`;
                    this.style.top = `${this.top}px`;
                }
                break;
            case "tooltip":
                if (oldValue != newValue) {
                    const tooltip = this.shadowRoot.getElementById("tooltip");
                    tooltip.position = newValue;
                }
                break;
        }
    }

}

UIRegistry.set("map-subexit", new UIRegistry(MapSubExit));
customElements.define("ootrt-marker-subexit", MapSubExit);
