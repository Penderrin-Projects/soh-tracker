// frameworks
import Template from "/emcJS/util/html/Template.js";
import Panel from "/emcJS/ui/layout/Panel.js";

// GameTrackerJS
import GTWorldMap from "/GameTrackerJS/ui/panel/worldmap/WorldMap.js";

// Track-OOT
import "../../../state/world/WorldStates.js";
// import "./listitems/Button.js";
// import "./listitems/TypeButton.js";
// import "./listitems/Location.js";
// import "./listitems/Gossipstone.js";
// import "./listitems/ShopSlot.js";
// import "./listitems/Area.js";
// import "./listitems/SubArea.js";
// import "./listitems/Exit.js";
// import "./listitems/SubExit.js";
// import "./listitems/ListCollection.js";
// import "../dungeonstate/DungeonType.js";

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

export default class WorldMap extends GTWorldMap {

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

Panel.registerReference("worldmap", WorldMap);
customElements.define("ootrt-worldmap", WorldMap);
