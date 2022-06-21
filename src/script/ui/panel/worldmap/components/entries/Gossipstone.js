import Template from "/emcJS/util/html/Template.js";
import Language from "/GameTrackerJS/util/Language.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import WorldMapElement from "/GameTrackerJS/ui/panel/worldmap/components/abstract/Element.js";
import GossipstoneContextMenu from "../../../../ctxmenu/GossipstoneContextMenu.js";
import LogicViewer from "../../../../window/LogicViewer.js";

// TODO fix this

// frameworks
// import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";

// GameTrackerJS
import "/GameTrackerJS/ui/Badge.js";

const TPL = new Template(`
<div id="marker"></div>
<emc-tooltip position="top" id="tooltip">
    <div class="textarea">
        <div id="text"></div>
        <div id="item"></div>
        <gt-badge id="badge"></gt-badge>
    </div>
    <div id="hintlocation" class="textarea"></div>
    <div id="hintitem" class="textarea"></div>
</emc-tooltip>
`);

/*
const STYLE = new GlobalStyle(`
:host {
    position: absolute;
    display: inline;
    width: 32px;
    height: 32px;
    box-sizing: border-box;
    user-select: none;
    transform: translate(-8px, -8px);
}
:host(:hover) {
    z-index: 1000;
}
#marker {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    background-color: var(--location-status-unavailable-color, #000000);
    border: solid 4px black;
    border-radius: 50%;
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
.textarea:empty,
.textarea.hidden {
    display: none;
}
#text {
    display: flex;
    align-items: center;
    user-select: none;
    white-space: nowrap;
}
#item {
    margin-left: 5px;
}
`); */

function applyElements(target) {
    const headerEl = target.getElementById("header");
    const tpl = TPL.generate();
    headerEl.append(tpl);
}

// TODO save gossipstone data to extra storage
export default class WorldMapGossipstone extends WorldMapElement {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        /* observer */
        this.registerStateHandler("item", (event) => {
            this.applyItem(event.value);
        });
        this.registerStateHandler("location", (event) => {
            this.applyLocation(event.value);
        });
        /* context menu */
        this.setDefaultContextMenu(GossipstoneContextMenu);
        this.addDefaultContextMenuHandler("check", () => {
            const state = this.getState();
            if (state != null) {
                state.value = true;
            }
        });
        this.addDefaultContextMenuHandler("uncheck", () => {
            const state = this.getState();
            if (state != null) {
                state.value = false;
            }
        });
        this.addDefaultContextMenuHandler("sethint", () => {
            const state = this.getState();
            if (state != null) {
                const title = Language.generateLabel(this.ref);
                LogicViewer.show(state.props.logicAccess, title);
            }
        });
        this.addDefaultContextMenuHandler("junk", () => {
            const state = this.getState();
            if (state != null) {
                state.location = "junk_hint";
                state.item = "";
            }
        });
        this.addDefaultContextMenuHandler("clearhint", () => {
            const state = this.getState();
            if (state != null) {
                state.location = "";
                state.item = "";
            }
        });
    }

    applyDefaultValues() {
        super.applyDefaultValues();
        this.applyItem();
        this.applyLocation();
    }

    applyStateValues(state) {
        super.applyStateValues(state);
        this.applyItem(state.item);
        this.applyLocation(state.location);
    }

    applyItem(item) {
        const itemContainerEl = this.shadowRoot.getElementById("hintitem-container");
        const itemEl = this.shadowRoot.getElementById("hintitem");
        if (itemEl != null) {
            const state = this.getState();
            if (state?.value && item) {
                itemEl.i18nValue = item;
                itemContainerEl.classList.remove("hidden");
            } else {
                itemEl.i18nValue = "";
                itemContainerEl.classList.add("hidden");
            }
        }
    }

    applyLocation(location) {
        const itemContainerEl = this.shadowRoot.getElementById("hintlocation-container");
        const locationEl = this.shadowRoot.getElementById("hintlocation");
        if (locationEl != null) {
            const state = this.getState();
            if (state?.value && location) {
                locationEl.i18nValue = location;
                itemContainerEl.classList.remove("hidden");
            } else {
                locationEl.i18nValue = "";
                itemContainerEl.classList.add("hidden");
            }
        }
    }

    get category() {
        return "location";
    }

}

customElements.define("ootrt-worldmap-gossipstone", WorldMapGossipstone);
UIRegistry.get("worldmap-location").register("gossipstone", WorldMapGossipstone);
