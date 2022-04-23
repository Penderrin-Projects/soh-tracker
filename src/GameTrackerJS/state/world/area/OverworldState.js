import AreaStateManager from "../../../statemanager/world/area/AreaStateManager.js";
import DataState from "../../DataState.js";
import StateListHandler from "../../../util/handler/StateListHandler.js";
import OverworldListHandler, {
    getDefaultAccess
} from "../../../util/handler/OverworldListHandler.js";

const LIST_HANDLER = new WeakMap();
const OVERWORLD_HANDLER = new WeakMap();

export default class OverworldState extends DataState {

    constructor(ref, props) {
        super(ref, props);

        /* LIST HANDLER */
        const listHandler = this.generateList();
        listHandler.addEventListener("change", (event) => {
            this.onListEntriesChange(event)
        });
        LIST_HANDLER.set(this, listHandler);

        /* OVERWORLD HANDLER */
        const overworldHandler = this.generateOverworldList();
        overworldHandler.addEventListener("access", (event) => {
            this.onAccessChange(event);
        });
        OVERWORLD_HANDLER.set(this, overworldHandler);
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

    get visible() {
        return true;
    }

    get filtered() {
        return false;
    }

    isVisible() {
        return true;
    }

    set hint(value) {
        // nothing
    }

    get hint() {
        return "woth";
    }

    get listContents() {
        return false;
    }

    get defaultAccess() {
        return getDefaultAccess();
    }

    get access() {
        const overworldHandler = OVERWORLD_HANDLER.get(this);
        return overworldHandler?.access ?? this.defaultAccess;
    }

    get hasMap() {
        return this.props.map.active;
    }

    /* list */
    generateList() {
        const ref = this.ref;
        const list = this.props.list;
        const listHandler = new StateListHandler(list, ref);
        return listHandler;
    }

    generateOverworldList() {
        return new OverworldListHandler();
    }

    getList() {
        return this.props.list;
    }

    setAllEntries(value = true) {
        const listHandler = LIST_HANDLER.get(this);
        listHandler.setAllEntries(value);
    }

}

AreaStateManager.register("overworld", OverworldState);
