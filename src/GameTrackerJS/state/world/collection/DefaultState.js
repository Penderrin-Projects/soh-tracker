import DataState from "../../DataState.js";
import StateListHandler, {defaultAccess as defaultMarkerAccess} from "../../../util/handler/StateListHandler.js";

const LIST_HANDLER = new WeakMap();
const VISIBLE = new WeakMap();

export default class DefaultCollectionState extends DataState {
    
    constructor(ref, props = {}) {
        super(ref, props);
        
        /* VALUES */
        VISIBLE.set(this, false);

        /* LIST HANDLER */
        const listHandler = this.generateList();
        LIST_HANDLER.set(this, listHandler);
        VISIBLE.set(this, listHandler.visible);
    }

    set hint(value) {
        // nothing
    }

    get hint() {
        return "";
    }

    get listContents() {
        return true;
    }

    get access() {
        const listHandler = LIST_HANDLER.get(this);
        return listHandler?.access ?? defaultMarkerAccess;
    }

    get visible() {
        const listHandler = LIST_HANDLER.get(this);
        return listHandler.visible;
    }

    get filtered() {
        return false;
    }

    isVisible() {
        return VISIBLE.get(this);
    }

    updateVisible() {
        const value = this.visible;
        const old = VISIBLE.get(this);
        if (old != value) {
            VISIBLE.set(this, value);
            // external
            const ev = new Event("visiblity");
            ev.data = value;
            this.dispatchEvent(ev);
        }
    }

    /* list */
    generateList() {
        const list = this.props.list;
        const listHandler = new StateListHandler(list, this.ref);
        listHandler.addEventListener("visibility", () => {
            this.updateVisible();
        });
        listHandler.addEventListener("access", (event) => {
            const ev = new Event("access");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        listHandler.addEventListener("change", (event) => {
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
