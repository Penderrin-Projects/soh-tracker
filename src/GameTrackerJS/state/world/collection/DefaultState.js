import VisibilityState from "../../abstract/VisibilityState.js";
import MarkerListHandler, {defaultAccess as defaultMarkerAccess} from "../../../util/MarkerListHandler.js";
import AccessStateEnum from "../../../enum/AccessStateEnum.js";

const AREA_DATA = new WeakMap();
const LIST_HANDLER = new WeakMap();

export default class CollectionState extends VisibilityState {
    
    constructor(ref, props = {}, areaData = {}) {
        super(ref, props);
        /* --- */
        AREA_DATA.set(this, areaData);
        /* --- */
        const listHandler = this.generateList();
        LIST_HANDLER.set(this, listHandler);
    }
    
    generateList() {
        const list = this.areaData.list;
        const listHandler = new MarkerListHandler(list, this.ref);
        listHandler.addEventListener("access", event => {
            const ev = new Event("access");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        listHandler.addEventListener("change", event => {
            this.checkAllFilter();
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
        const listHandler = LIST_HANDLER.get(this);
        return listHandler?.access ?? defaultMarkerAccess;
    }

    setAllEntries(value = true) {
        const listHandler = LIST_HANDLER.get(this);
        listHandler.setAllEntries(value);
    }

}
