/* asym-import: off */
import Helper from "/emcJS/util/Helper.js";
/* asym-import: on */
import FilteredState from "../../abstract/FilteredState.js";
import MarkerListHandler from "../../../util/MarkerListHandler.js";
import AccessStateEnum from "../../../enum/AccessStateEnum.js";

const AREA_DATA = new WeakMap();
const ACCESS = new WeakMap();
const LIST_HANDLER = new WeakMap();

export default class AreaState extends FilteredState {
    
    constructor(ref, props, areaData) {
        super(ref, props);
        /* --- */
        AREA_DATA.set(this, areaData);
        /* --- */
        const listHandler = this.generateList();
        ACCESS.set(this, listHandler.access);
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
        const list = this.areaData.list;
        const listHandler = new MarkerListHandler(list);
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

    executeSpecialFilter(name) {
        const access = this.access;
        switch (name) {
            case "access": return access.value != AccessStateEnum.UNAVAILABLE;
            case "!access": return access.value == AccessStateEnum.UNAVAILABLE;
            case "done": return access.value == AccessStateEnum.OPENED;
            case "!done": return access.value != AccessStateEnum.OPENED;
        }
        return super.executeSpecialFilter(name);
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
        return ACCESS.get(this);
    }

    setAllEntries(value = true) {
        const listHandler = LIST_HANDLER.get(this);
        listHandler.setAllEntries(value);
    }

}
