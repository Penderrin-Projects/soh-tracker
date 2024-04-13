import Dialog from "/emcJS/ui/overlay/window/Dialog.js";
import {
    delimitInteger
} from "/emcJS/util/helper/number/Integer.js";
import Language from "/GameTrackerJS/util/Language.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import WorldMapLocation from "/GameTrackerJS/ui/panel/worldmap/components/entries/Location.js";
import LogicViewer from "../../../../window/LogicViewer.js";

function resolveIcon(icon) {
    if (Array.isArray(icon)) {
        return icon[0];
    } else {
        return icon;
    }
}

export default class TrackerWorldMapScrubLocation extends WorldMapLocation {

    #itemEl;

    constructor() {
        super();
        /* --- */
        this.#itemEl = this.shadowRoot.getElementById("item");
        this.#itemEl.halign = "end";
        this.#itemEl.valign = "end";
        /* state handler */
        this.registerStateHandler("price", () => {
            const state = this.getState();
            this.#applyPrice(state?.price);
        });
        /* context menu */
        this.setAddedDefaultContextMenuItems([
            "splitter",
            {menuAction: "set_price", content: "Set Price"},
            "splitter",
            {menuAction: "show_logic", content: "Show Logic"}
        ]);
        this.addDefaultContextMenuHandler("set_price", async () => {
            const state = this.getState();
            if (state != null) {
                const price = await Dialog.promptNumber("Set Price", "Please enter a price");
                if (typeof price === "number") {
                    if (!isNaN(price)) {
                        state.price = delimitInteger(price, 0, 999);
                    } else {
                        state.price = null;
                    }
                }
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

    applyDefaultValues() {
        super.applyDefaultValues();
        this.#applyPrice();
    }

    applyStateValues(state) {
        super.applyStateValues(state);
        this.#applyPrice(state.price);
    }

    #applyPrice(price) {
        if (price != null) {
            this.#itemEl.text = price;
        } else {
            this.#itemEl.text = "?";
        }
    }

    applyItem(itemData) {
        const itemEl = this.shadowRoot.getElementById("item");
        if (itemEl != null) {
            if (itemData != null) {
                itemEl.src = resolveIcon(itemData?.icon) ?? "/images/items/unknown.png";
            } else {
                itemEl.src = "/images/items/unknown.png";
            }
        }
    }

}

customElements.define("ootrt-worldmap-scrublocation", TrackerWorldMapScrubLocation);
UIRegistry.get("worldmap-location").register("scrub", TrackerWorldMapScrubLocation);
