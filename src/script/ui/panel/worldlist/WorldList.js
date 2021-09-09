// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import Panel from "/emcJS/ui/layout/Panel.js";

// GameTrackerJS
import GTWorldList from "/GameTrackerJS/ui/panel/worldlist/WorldList.js";
// Track-OOT
import "/script/state/world/CustomWorldStates.js";
import "./components/entries/ShopSlot.js";
// import "./components/entries/TypeButton.js";
import "../../dungeonstate/DungeonType.js";

// import "./listitems/Button.js";
// import "./listitems/Location.js";
// import "./listitems/Gossipstone.js";
// import "./listitems/Area.js";
// import "./listitems/SubArea.js";
// import "./listitems/Exit.js";
// import "./listitems/SubExit.js";
// import "./listitems/ListCollection.js";

const TPL = new Template(`
<ootrt-dungeontype id="dungeontype" class="button" ref="overworld" value="v" readonly="true">
</ootrt-dungeontype>
<ootrt-worldlist-typebutton type="v" id="vanilla" class="hidden"></ootrt-worldlist-typebutton>
<ootrt-worldlist-typebutton type="mq" id="masterquest" class="hidden"></ootrt-worldlist-typebutton>
`);

// const STYLE = new GlobalStyle(`
// `);

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
        // STYLE.apply(this.shadowRoot);
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    this.shadowRoot.getElementById("dungeontype").ref = newValue;
                    this.shadowRoot.getElementById("vanilla").ref = newValue;
                    this.shadowRoot.getElementById("masterquest").ref = newValue;
                } break;
            }
        }
    }
    
}

Panel.registerReference("worldlist", WorldList);
customElements.define("ootrt-worldlist", WorldList);
