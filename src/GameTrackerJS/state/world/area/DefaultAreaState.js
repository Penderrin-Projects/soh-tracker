// frameworks
import DataStorageValueObserver from "/emcJS/datastorage/DataStorageValueObserver.js";

import Savestate from "../../../savestate/Savestate.js";
import VisibilityState from "../VisibilityState.js";
import StateListHandler, { getDefaultAccess } from "../../../util/handler/StateListHandler.js";

const STORAGES = {
    areaHints: Savestate.getStorage("areaHints"),
};

const LIST_HANDLER = new WeakMap();
const HINT = new WeakMap();

export default class DefaultAreaState extends VisibilityState {

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
        listHandler.addEventListener("visibility", (event) => {
            this.onVisibilityChange(event);
        });
        listHandler.addEventListener("access", (event) => {
            this.onAccessChange(event);
        });
        listHandler.addEventListener("change", (event) => {
            this.onListEntriesChange(event)
        });
        LIST_HANDLER.set(this, listHandler);
    }

    onVisibilityChange(event) {
        this.updateVisible();
    }

    onAccessChange(event) {
        const ev = new Event("access");
        ev.data = event.data;
        this.dispatchEvent(ev);
    }

    onListEntriesChange(event) {
        this.checkAllFilter();
        const ev = new Event("list_update");
        ev.data = event.data;
        this.dispatchEvent(ev);
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
        return this.props.listContents ?? false;
    }

    get defaultAccess() {
        return getDefaultAccess();
    }

    get access() {
        const listHandler = LIST_HANDLER.get(this);
        return listHandler?.access ?? this.defaultAccess;
    }

    get visible() {
        return super.visible && this.getListVisiblity();
    }

    get hasMap() {
        return this.props.map.active;
    }

    getListVisiblity() {
        const listHandler = LIST_HANDLER.get(this);
        return listHandler.visible;
    }

    /* list */
    generateList() {
        const ref = this.ref;
        const list = this.props.list;
        const listHandler = new StateListHandler(list, ref);
        return listHandler;
    }

    getList() {
        return this.props.list;
    }

    setAllEntries(value = true) {
        const listHandler = LIST_HANDLER.get(this);
        listHandler.setAllEntries(value);
    }

}
