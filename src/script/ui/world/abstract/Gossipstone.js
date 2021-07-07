// frameworks
import Template from "/emcJS/util/Template.js";
import Dialog from "/emcJS/ui/overlay/Dialog.js";
import "/emcJS/ui/input/SearchSelect.js";


// GameTrackerJS
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import Language from "/GameTrackerJS/util/Language.js";
import AbstractLocation from "/GameTrackerJS/ui/world/Location.js";
import ItemsResource from "/GameTrackerJS/resource/ItemsResource.js";
import WorldResource from "/GameTrackerJS/resource/WorldResource.js";
// Track-OOT
import "/script/state/world/location/GossipstoneState.js";
import LogicViewer from "/script/ui/LogicViewer.js";
import "../../ctxmenu/GossipstoneContextMenu.js";

const CTG_TPL = new Template(`
<span style="display: contents; color: lightgray; font-style: italic; font-size: 0.8em;"></span>
`);

// TODO

export default class Gossipstone extends AbstractLocation {

    constructor() {
        super();
        /* --- */
        this.registerStateHandler("hint", event => {
            this.applyHint(event.data);
        });

        /* context menu */
        const mnu_ctx = document.createElement("ootrt-ctxmenu-gossipstone");
        this.setContextMenu("main", mnu_ctx);

        mnu_ctx.addEventListener("check", event => {
            const state = this.getState();
            if (state != null) {
                state.value = true;
            }
        });
        mnu_ctx.addEventListener("uncheck", event => {
            const state = this.getState();
            if (state != null) {
                state.value = false;
            }
        });
        mnu_ctx.addEventListener("sethint", event => {
            this.showDialog();
        });
        mnu_ctx.addEventListener("clearhint", event => {
            const state = this.getState();
            if (state != null) {
                state.hint = {
                    location: "",
                    item: ""
                };
            }
        });
        mnu_ctx.addEventListener("show_logic", event => {
            const state = this.getState();
            if (state != null) {
                const title = Language.generateLabel(this.ref);
                LogicViewer.show(state.props.access, title);
            }
        });
        
        /* mouse events */
        this.addEventListener("contextmenu", event => {
            mnu_ctx.show(event.clientX, event.clientY);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
    }

    applyDefaultValues() {
        super.applyDefaultValues();
        this.applyHint();
    }

    applyStateValues(state) {
        super.applyStateValues(state);
        this.applyHint(state.hint);
    }

    applyHint(hint = {location: "", item: ""}) {
        const locationEl = this.shadowRoot.getElementById("hintlocation");
        const itemEl = this.shadowRoot.getElementById("hintitem");
        const state = this.getState();
        if (state != null) {
            if (state.value) {
                // location
                if (locationEl != null) {
                    if (hint.location) {
                        Language.applyLabel(locationEl, hint.location);
                    } else {
                        Language.applyLabel(locationEl, "");
                    }
                }
                // item
                if (itemEl != null) {
                    if (hint.item) {
                        Language.applyLabel(itemEl, hint.item);
                    } else {
                        Language.applyLabel(itemEl, "");
                    }
                }
            }
        } else {
            // location
            if (locationEl != null) {
                locationEl.innerHTML = "";
            }
            // item
            if (itemEl != null) {
                itemEl.innerHTML = "";
            }
        }
    }

    showDialog() {
        hintstoneDialog(this.ref).then(hint => {
            if (hint) {
                const state = this.getState();
                if (state != null) {
                    state.hint = hint;
                }
            }
        });
    }

}

function getLocationDescriptors() {
    const marker = WorldResource.get("marker");
    const loc = filterLocations(marker.location);
    const locations = {};
    for (const name in loc) {
        const data = loc[name];
        locations[data.type] = locations[data.type] || [];
        locations[data.type].push(name);
    }
    return [
        Object.keys(marker.area),
        Object.keys(marker.subarea),
        locations
    ];
}

function filterLocations(obj) {
    const result = {};
    for (const key in obj) {
        if (!!obj[key] && obj[key] != "gossipstone") {
            result[key] = obj[key];
        }
    }
    return result;
}

function hintstoneDialog(ref) {
    return new Promise(resolve => {
        const location = SavestateHandler.get("", `${ref}.location`, "");
        const item = SavestateHandler.get("", `${ref}.item`, "");

        const [areas, subareas, locations] = getLocationDescriptors();
        const items = Object.keys(ItemsResource.get());
        items.push("WOTH");
        items.push("FOOL");
    
        const lbl_loc = document.createElement("label");
        lbl_loc.style.display = "flex";
        lbl_loc.style.justifyContent = "space-between";
        lbl_loc.style.alignItems = "center";
        lbl_loc.style.padding = "5px";
        Language.applyLabel(lbl_loc, "location");
        const slt_loc = document.createElement("emc-searchselect");
        // add empty
        slt_loc.append(createEmptyOption());
        // set choices
        for (const loc of areas) {
            const id = `area/${loc}`;
            slt_loc.append(createLocationOption(id, "area"));
        }
        for (const loc of subareas) {
            const id = `subarea/${loc}`;
            slt_loc.append(createLocationOption(id, "subarea"));
        }
        for (const type in locations) {
            const data = locations[type];
            for (const loc of data) {
                const id = `location/${loc}`;
                slt_loc.append(createLocationOption(id, type));
            }
        }
        slt_loc.style.width = "300px";
        slt_loc.value = location;
        lbl_loc.append(slt_loc);
    
        const lbl_itm = document.createElement("label");
        lbl_itm.style.display = "flex";
        lbl_itm.style.justifyContent = "space-between";
        lbl_itm.style.alignItems = "center";
        lbl_itm.style.padding = "5px";
        Language.applyLabel(lbl_itm, "item");
        const slt_itm = document.createElement("emc-searchselect");
        // add empty
        slt_itm.append(createEmptyOption());
        // set choices
        for (let j = 0; j < items.length; ++j) {
            const itm = items[j];
            slt_itm.append(createItemOption(itm));
        }
        slt_itm.style.width = "300px";
        slt_itm.value = item;
        lbl_itm.append(slt_itm);
        
        const d = new Dialog({title: Language.generateLabel(ref), submit: true, cancel: true});
        d.onsubmit = function(result) {
            if (result) {
                resolve({item: slt_itm.value, location: slt_loc.value});
            } else {
                resolve(false);
            }
        };
        d.append(lbl_loc);
        d.append(lbl_itm);
        d.show();
    });
}

function createEmptyOption() {
    const el = document.createElement("emc-option");
    el.value = "";
    const text = document.createElement("span");
    Language.applyLabel(text, "empty");
    text.style.fontStyle = "italic";
    el.append(text);
    return el;
}

function createLocationOption(id, type) {
    const el = document.createElement("emc-option");
    el.value = id;
    const name = Language.generateLabel(id);
    const category = CTG_TPL.generate();
    Language.applyLabel(category, type);
    el.append(name);
    el.append(category);
    return el;
}

function createItemOption(id) {
    const el = document.createElement("emc-option");
    el.value = id;
    const name = Language.generateLabel(id);
    el.append(name);
    return el;
}
