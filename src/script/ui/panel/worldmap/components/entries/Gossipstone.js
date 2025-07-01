import HTMLTemplate from "/emcJS/util/html/template/HTMLTemplate.js";
import CSSTemplate from "/emcJS/util/html/template/CSSTemplate.js";
import Language from "/GameTrackerJS/util/Language.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import WorldMapMarkedEntry from "/GameTrackerJS/ui/panel/worldmap/components/abstract/MarkedEntry.js";
import "/GameTrackerJS/ui/panel/worldmap/components/entries/Location.js";
import "/GameTrackerJS/ui/Badge.js";
import GossipstoneContextMenu from "../../../../ctxmenu/GossipstoneContextMenu.js";
import LogicViewer from "../../../../window/LogicViewer.js";

const TPL = new HTMLTemplate(`
<div id="hintlocation-container" class="textarea">
    <emc-i18n-label id="hintlocation"></emc-i18n-label>
</div>
<div id="hintitem-container" class="textarea">
    <emc-i18n-label id="hintitem"></emc-i18n-label>
</div>
`);

const STYLE = new CSSTemplate(`
:host {
    --size: 32px;
    --rotation: 0deg;
    --border-radius: 50%;
}
#item {
    width: 32px;
    height: 32px;
    margin-left: 5px;
    font-size: 0.7em;
}
`);

function applyElements(target) {
    const headerEl = target.getElementById("header");
    const tpl = TPL.generate();
    headerEl.append(tpl);
}

export default class WorldMapGossipstone extends WorldMapMarkedEntry {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        badgeEl.hideValues = true;
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
        this.addDefaultContextMenuHandler("sethint", async () => {
            const state = this.getState();
            if (state != null) {
                // TODO show hint dialog
                // select Location/Area/Exit
                // if Exit select target
                // if Area/Location select item/WOTH
            }
        });
        this.addDefaultContextMenuHandler("junk", () => {
            const state = this.getState();
            if (state != null) {
                state.location = "junk_hint";
                state.item = "";
                state.value = true;
            }
        });
        this.addDefaultContextMenuHandler("clearhint", () => {
            const state = this.getState();
            if (state != null) {
                state.location = "";
                state.item = "";
                state.value = false;
            }
        });
        this.addDefaultContextMenuHandler("show_logic", () => {
            const state = this.getState();
            if (state != null) {
                const title = Language.generateLabel(`location[${this.ref}]`);
                LogicViewer.show(state.props.logicAccess ?? "", title);
            }
        });
    }

    clickHandler() {
        const state = this.getState();
        if (state != null) {
            state.value = !state.value;
        }
    }

    applyDefaultValues() {
        super.applyDefaultValues("images/icons/gossipstone.svg");
        this.applyItem();
        this.applyLocation();
    }

    applyStateValues(state) {
        super.applyStateValues(state, "images/icons/gossipstone.svg");
        this.applyItem(state.item);
        this.applyLocation(state.location);
    }

    applyItem(item) {
        const itemContainerEl = this.shadowRoot.getElementById("hintitem-container");
        const itemEl = this.shadowRoot.getElementById("hintitem");
        if (itemEl != null) {
            if (item) {
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
            if (location) {
                locationEl.i18nValue = location;
                itemContainerEl.classList.remove("hidden");
            } else {
                locationEl.i18nValue = "";
                itemContainerEl.classList.add("hidden");
            }
        }
    }

    get textRef() {
        return `location[${super.textRef}]`;
    }

    get type() {
        return "Location";
    }

}

customElements.define("ootrt-worldmap-gossipstone", WorldMapGossipstone);
UIRegistry.get("worldmap-location").register("gossipstone", WorldMapGossipstone);
