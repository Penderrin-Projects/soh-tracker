// frameworks
import DataStorageValueObserver from "/emcJS/datastorage/DataStorageValueObserver.js";

import Savestate from "../../../savestate/Savestate.js";
import WorldState from "../WorldState.js";
import MarkerListHandler, {defaultAccess as defaultMarkerAccess} from "../../../util/handler/MarkerListHandler.js";

const STORAGES = {
    areaHints: Savestate.getStorage("areaHints"),
};

const LIST_HANDLER = new WeakMap();
const HINT = new WeakMap();

export default class DefaultAreaState extends WorldState {

    constructor(ref, props) {
        super(ref, props);

        /* VALUES */
        const areaHintsObserver = new DataStorageValueObserver(STORAGES.areaHints, ref, "");
        HINT.set(this, areaHintsObserver.value);
        areaHintsObserver.addEventListener("change", (event) => {
            this.hint = event.data;
        });

        /* LIST HANDLER */
        const listHandler = this.generateList();
        LIST_HANDLER.set(this, listHandler);
    }

    set hint(value) {
        const ref = this.ref;
        if (typeof value != "string" || (value != "woth" && value != "barren")) {
            value = "";
        }
        const old = this.hint;
        if (value != old) {
            HINT.set(this, value);
            STORAGES.areaHints.set(ref, value);
            // external
            const event = new Event("hint");
            event.data = value;
            this.dispatchEvent(event);
        }
    }

    get hint() {
        return HINT.get(this);
    }

    get listContents() {
        return this.props.listContents;
    }

    get access() {
        const listHandler = LIST_HANDLER.get(this);
        return listHandler?.access ?? defaultMarkerAccess;
    }

    get visible() {
        const listHandler = LIST_HANDLER.get(this);
        return super.visible && listHandler.visible;
    }

    /* list */
    generateList() {
        const listHandler = new MarkerListHandler(this.props.list, this.ref);
        listHandler.addEventListener("visibility", () => {
            this.updateVisible();
        });
        listHandler.addEventListener("access", event => {
            const ev = new Event("access");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        listHandler.addEventListener("change", event => {
            this.checkAllFilter();
            const ev = new Event("list_update");
            ev.data = event.data;
            this.dispatchEvent(ev);
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

    setAllEntries(value = true) {
        const listHandler = LIST_HANDLER.get(this);
        listHandler.setAllEntries(value);
    }

}
