// frameworks
import Helper from "/emcJS/util/Helper.js";

import AreaStateManager from "./StateManager.js";
import MarkerListHandler, {defaultAccess as defaultMarkerAccess} from "../../../util/MarkerListHandler.js";
import DataState from "../../abstract/DataState.js";

const AREA_DATA = new WeakMap();
const LIST_HANDLER = new WeakMap();

export default class OverworldState extends DataState {

    constructor(ref, props, areaData) {
        super(ref, props);
        /* --- */
        AREA_DATA.set(this, areaData);
        /* --- */
        const listHandler = this.generateList();
        LIST_HANDLER.set(this, listHandler);
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

    getRawList() {
        const listHandler = LIST_HANDLER.get(this);
        return Array.from(listHandler.rawList);
    }

    getList() {
        const listHandler = LIST_HANDLER.get(this);
        return Array.from(listHandler.list);
    }

    getFilteredList() {
        const listHandler = LIST_HANDLER.get(this);
        return Array.from(listHandler.filteredList);
    }

    get areaData() {
        return AREA_DATA.get(this);
    }

    get access() {
        const listHandler = LIST_HANDLER.get(this);
        return listHandler?.access ?? defaultMarkerAccess;
    }

    set hint(value) {
        // nothing
    }

    get hint() {
        return "woth";
    }

    get visible() {
        return true;
    }
    
    isVisible() {
        return this.visible;
    }

    setAllEntries(value = true) {
        // nothing
    }

}

AreaStateManager.register("overworld", OverworldState);
