// frameworks
import Template from "/emcJS/util/html/Template.js";
import Panel from "/emcJS/ui/layout/Panel.js";

// GameTrackerJS
import AreaStateManager from "/GameTrackerJS/state/world/area/StateManager.js";
import GTWorldList from "/GameTrackerJS/ui/panel/worldlist/WorldList.js";
// Track-OOT
import "/script/state/world/CustomWorldStates.js";
import "./components/entries/Gossipstone.js";
import "./components/entries/ShopSlot.js";
import "./components/button/TypeButton.js";
import "../../dungeonstate/DungeonType.js";

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

// TODO listen on area type event and reload list

export default class WorldList extends GTWorldList {
    
    constructor() {
        super();
        applyElements(this.shadowRoot);
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    /* dungeontype */
                    const dungeontypeEl = this.shadowRoot.getElementById("dungeontype");
                    if (dungeontypeEl != null) {
                        dungeontypeEl.ref = newValue;
                    }
                    const area = AreaStateManager.get(newValue);
                    /* vanilla */
                    const vanillaEl = this.shadowRoot.getElementById("vanilla");
                    if (vanillaEl != null) {
                        vanillaEl.ref = newValue;
                        if (area?.props.list_mq != null) {
                            vanillaEl.classList.remove("hidden");
                        } else {
                            vanillaEl.classList.add("hidden");
                        }
                    }
                    /* masterquest */
                    const masterquestEl = this.shadowRoot.getElementById("masterquest");
                    if (masterquestEl != null) {
                        masterquestEl.ref = newValue;
                        if (area?.props.list_mq != null) {
                            masterquestEl.classList.remove("hidden");
                        } else {
                            masterquestEl.classList.add("hidden");
                        }
                    }
                } break;
            }
        }
    }
    
}

Panel.registerReference("worldlist", WorldList);
customElements.define("ootrt-worldlist", WorldList);
