// frameworks
import Template from "/emcJS/util/html/Template.js";
import Panel from "/emcJS/ui/layout/Panel.js";

// GameTrackerJS
import WorldMap from "/GameTrackerJS/ui/panel/worldmap/WorldMap.js";

// Track-OOT
import "../../../state/world/WorldStates.js";
import "./components/entries/Exit.js";
import "./components/entries/Location.js";
import "./components/entries/Gossipstone.js";
import "./components/entries/ShopSlot.js";
import "./components/entries/ScubLocation.js";

const TPL = new Template(`
<ootrt-dungeontype id="dungeontype" class="button" ref="overworld" value="v" readonly="true"></ootrt-dungeontype>
`);

function applyElements(target) {
    const hintEl = target.getElementById("hint");
    const tpl = TPL.generate();
    /* dungeontype */
    const dungeontypeEl = tpl.getElementById("dungeontype");
    hintEl.insertAdjacentElement("beforebegin", dungeontypeEl);
}

export default class TrackerWorldMap extends WorldMap {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        /* state handler */
        this.registerStateHandler("type", () => {
            const viewEl = this.shadowRoot.getElementById("view");
            viewEl.refreshList();
        });
    }

    applyDefaultValues() {
        super.applyDefaultValues();
        /* title */
        const dungeontypeEl = this.shadowRoot.getElementById("dungeontype");
        if (dungeontypeEl != null) {
            dungeontypeEl.ref = "";
        }
    }

    applyStateValues(state) {
        super.applyStateValues(state);
        /* title */
        const dungeontypeEl = this.shadowRoot.getElementById("dungeontype");
        if (dungeontypeEl != null) {
            dungeontypeEl.ref = state.ref;
        }
    }

}

Panel.registerReference("worldmap", TrackerWorldMap);
customElements.define("ootrt-worldmap", TrackerWorldMap);
