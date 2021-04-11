/* asym-import: off */
import Helper from "/emcJS/util/Helper.js";
/* asym-import: on */
import WorldResource from "../../resource/WorldResource.js";
import MarkerListHandler from "../../util/MarkerListHandler.js";
import WorldStateManagers from "./StateManagers.js";
import "./area/StateManager.js";
import "./subarea/StateManager.js";
import "./exit/StateManager.js";
import "./subexit/StateManager.js";
import "./location/StateManager.js";

const AREA_DATA = new WeakMap();
const ACCESS = new WeakMap();
const LIST_HANDLER = new WeakMap();

class OverworldState extends EventTarget {

    constructor() {
        super();
        /* --- */
        AREA_DATA.set(this, WorldResource.get("overworld"));
        /* --- */
        const listHandler = this.generateList();
        ACCESS.set(this, listHandler.access);
        LIST_HANDLER.set(this, listHandler);
        /* --- */
        WorldStateManagers.overworld = this;
    }

    setAccess(value) {
        if (value != null) {
            const old = ACCESS.get(this);
            if (!Helper.isEqual(old, value)) {
                ACCESS.set(this, value);
                // external
                const ev = new Event("access");
                ev.data = value;
                this.dispatchEvent(ev);
            }
        }
    }
    
    generateList() {
        const listHandler = new MarkerListHandler(this.areaData.list, "");
        listHandler.addEventListener("access", event => {
            this.setAccess(event.data);
        });
        listHandler.addEventListener("change", event => {
            if (event.list != null) {
                const ev = new Event("list_update");
                ev.data = event.list;
                this.dispatchEvent(ev);
            }
        });
        return listHandler;
    }

    getList() {
        const listHandler = LIST_HANDLER.get(this);
        return listHandler.list;
    }

    getFilteredList() {
        const listHandler = LIST_HANDLER.get(this);
        return listHandler.filteredList;
    }

    get areaData() {
        return AREA_DATA.get(this);
    }

    get access() {
        return ACCESS.get(this);
    }

}

export default new OverworldState();
