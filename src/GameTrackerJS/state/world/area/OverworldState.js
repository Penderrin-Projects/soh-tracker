import AreaStateManager from "./StateManager.js";
import DataState from "../../DataState.js";
import MarkerListHandler, {defaultAccess as defaultMarkerAccess} from "../../../util/handler/MarkerListHandler.js";

const LIST_HANDLER = new WeakMap();

export default class OverworldState extends DataState {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        const listHandler = this.generateList();
        LIST_HANDLER.set(this, listHandler);
    }

    set hint(value) {
        // nothing
    }

    get hint() {
        return "woth";
    }
    
    get listContents() {
        return this.props.listContents;
    }

    get access() {
        const listHandler = LIST_HANDLER.get(this);
        return listHandler?.access ?? defaultMarkerAccess;
    }

    get visible() {
        return true;
    }

    get filtered() {
        return false;
    }

    isVisible() {
        return true;
    }
    
    /* list */
    generateList() {
        const listHandler = new MarkerListHandler(this.props.list, this.ref);
        listHandler.addEventListener("access", event => {
            const ev = new Event("access");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        listHandler.addEventListener("change", event => {
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

AreaStateManager.register("overworld", OverworldState);
