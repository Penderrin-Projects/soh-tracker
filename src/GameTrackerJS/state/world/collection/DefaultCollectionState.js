import DataState from "../../DataState.js";
import StateListHandler, {
    getDefaultAccess
} from "../../../util/handler/StateListHandler.js";

const LIST_HANDLER = new WeakMap();
const VISIBLE = new WeakMap();

export default class DefaultCollectionState extends DataState {

    constructor(ref, props = {}) {
        super(ref, props);

        /* VALUES */
        VISIBLE.set(this, false);

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
        VISIBLE.set(this, listHandler.visible);
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
        const ev = new Event("list_update");
        ev.data = event.data;
        this.dispatchEvent(ev);
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

    get defaultAccess() {
        return getDefaultAccess();
    }

    get access() {
        const listHandler = LIST_HANDLER.get(this);
        return listHandler?.access ?? this.defaultAccess;
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
