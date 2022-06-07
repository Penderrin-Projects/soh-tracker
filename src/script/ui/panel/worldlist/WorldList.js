// frameworks
import Template from "/emcJS/util/html/Template.js";
import Panel from "/emcJS/ui/layout/Panel.js";

// GameTrackerJS
import GTWorldList from "/GameTrackerJS/ui/panel/worldlist/WorldList.js";
// Track-OOT
import "/script/state/world/WorldStates.js";
import "./components/entries/Gossipstone.js";
import "./components/entries/ShopSlot.js";
import "./components/button/TypeButton.js";
import "../dungeonstate/components/DungeonType.js";

const TPL = new Template(`
<ootrt-dungeontype id="dungeontype" class="button" ref="overworld" value="v" readonly="true"></ootrt-dungeontype>
<ootrt-worldlist-typebutton id="vanilla" class="button" type="v" text="vanilla"></ootrt-worldlist-typebutton>
<ootrt-worldlist-typebutton id="masterquest" class="button" type="mq" text="masterquest"></ootrt-worldlist-typebutton>
`);

function applyElements(target) {
    const hintEl = target.getElementById("hint");
    const listEl = target.getElementById("list");
    const tpl = TPL.generate();
    /* dungeontype */
    const dungeontypeEl = tpl.getElementById("dungeontype");
    hintEl.insertAdjacentElement("beforebegin", dungeontypeEl);
    /* vanilla */
    const vanillaEl = tpl.getElementById("vanilla");
    listEl.insertAdjacentElement("beforebegin", vanillaEl);
    /* masterquest */
    const masterquestEl = tpl.getElementById("masterquest");
    listEl.insertAdjacentElement("beforebegin", masterquestEl);
}

export default class WorldList extends GTWorldList {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        /* state handler */
        this.registerStateHandler("type", (event) => {
            this.refreshList();
            /* buttons */
            this.applyType(event.value);
        });
    }

    applyDefaultValues() {
        super.applyDefaultValues();
        /* dungeontype */
        const dungeontypeEl = this.shadowRoot.getElementById("dungeontype");
        dungeontypeEl.ref = "";
        /* vanilla */
        const vanillaEl = this.shadowRoot.getElementById("vanilla");
        vanillaEl.ref = "";
        vanillaEl.classList.add("hidden");
        /* masterquest */
        const masterquestEl = this.shadowRoot.getElementById("masterquest");
        masterquestEl.ref = "";
        masterquestEl.classList.add("hidden");
    }

    applyStateValues(state) {
        super.applyStateValues(state);
        /* dungeontype */
        const dungeontypeEl = this.shadowRoot.getElementById("dungeontype");
        dungeontypeEl.ref = state.ref;
        /* vanilla */
        const vanillaEl = this.shadowRoot.getElementById("vanilla");
        vanillaEl.ref = state.ref;
        /* masterquest */
        const masterquestEl = this.shadowRoot.getElementById("masterquest");
        masterquestEl.ref = state.ref;
        /* type */
        this.applyType(state.type);
    }

    applyType(type) {
        const vanillaEl = this.shadowRoot.getElementById("vanilla");
        const masterquestEl = this.shadowRoot.getElementById("masterquest");
        if (type == "n") {
            vanillaEl.classList.remove("hidden");
            masterquestEl.classList.remove("hidden");
        } else {
            vanillaEl.classList.add("hidden");
            masterquestEl.classList.add("hidden");
        }
    }

}

Panel.registerReference("worldlist", WorldList);
customElements.define("ootrt-worldlist", WorldList);
