import FileData from "/emcJS/data/FileData.js";
import Dialog from "/emcJS/ui/overlay/Dialog.js";
import StateStorage from "/script/storage/StateStorage.js";
import Language from "/script/util/Language.js";
import AbstractLocation from "/GameTrackerJS/ui/world/Location.js";
import LogicViewer from "/script/content/logic/LogicViewer.js";
import "../../ctxmenu/GossipstoneContextMenu.js";

// TODO

export default class ListGossipstone extends AbstractLocation {

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
                const title = Language.translate(this.ref);
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
                        locationEl.innerHTML = Language.translate(hint.location);
                    } else {
                        locationEl.innerHTML = "";
                    }
                }
                // item
                if (itemEl != null) {
                    if (hint.item) {
                        itemEl.innerHTML = Language.translate(hint.item);
                    } else {
                        itemEl.innerHTML = "";
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
    const marker = FileData.get('world/marker');
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
        const location = StateStorage.read(`${ref}.location`, "");
        const item = StateStorage.read(`${ref}.item`, "");

        const [areas, subareas, locations] = getLocationDescriptors();
        const items = Object.keys(FileData.get('items'));
        items.push("WOTH");
        items.push("FOOL");
    
        const lbl_loc = document.createElement('label');
        lbl_loc.style.display = "flex";
        lbl_loc.style.justifyContent = "space-between";
        lbl_loc.style.alignItems = "center";
        lbl_loc.style.padding = "5px";
        lbl_loc.innerHTML = Language.translate("location");
        const slt_loc = document.createElement("emc-searchselect");
        slt_loc.append(createOption("", "[" + Language.translate("empty") + "]"));
        for (const loc of areas) {
            const id = `area/${loc}`;
            slt_loc.append(createOption(id, `${Language.translate(id)} [area]`));
        }
        for (const loc of subareas) {
            const id = `subarea/${loc}`;
            slt_loc.append(createOption(id, `${Language.translate(id)} [subarea]`));
        }
        for (const type in locations) {
            const data = locations[type];
            for (const loc of data) {
                const id = `location/${loc}`;
                slt_loc.append(createOption(id, `${Language.translate(id)} [${type}]`));
            }
        }
        slt_loc.style.width = "300px";
        slt_loc.value = location;
        lbl_loc.append(slt_loc);
    
        const lbl_itm = document.createElement('label');
        lbl_itm.style.display = "flex";
        lbl_itm.style.justifyContent = "space-between";
        lbl_itm.style.alignItems = "center";
        lbl_itm.style.padding = "5px";
        lbl_itm.innerHTML = Language.translate("item");
        const slt_itm = document.createElement("emc-searchselect");
        slt_itm.append(createOption("", "[" + Language.translate("empty") + "]"));
        for (let j = 0; j < items.length; ++j) {
            const itm = items[j];
            slt_itm.append(createOption(itm, Language.translate(itm)));
        }
        slt_itm.style.width = "300px";
        slt_itm.value = item;
        lbl_itm.append(slt_itm);
        
        const d = new Dialog({title: Language.translate(ref), submit: true, cancel: true});
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

function createOption(value, content) {
    const opt = document.createElement('emc-option');
    opt.value = value;
    opt.innerHTML = content;
    return opt;
}
